/**
 * Terminal Execution API
 *
 * Execute shell commands and return output
 * Supports streaming output for long-running commands
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { exec, spawn } from 'child_process';
import path from 'path';

interface ExecuteRequest {
  command: string;
  cwd?: string;
  stream?: boolean;
}

interface ExecuteResponse {
  output: string;
  error?: string;
  exitCode: number;
  executionTime: number;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecuteResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { command, cwd, stream }: ExecuteRequest = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    // Security: Validate working directory
    const workingDir = cwd
      ? path.resolve(process.cwd(), cwd)
      : process.cwd();

    // Ensure working directory is within project
    if (!workingDir.startsWith(process.cwd())) {
      return res.status(403).json({
        error: 'Access denied: Cannot execute commands outside project directory',
      });
    }

    // Security: Block dangerous commands
    const dangerousCommands = [
      'rm -rf /',
      'rm -rf *',
      'mkfs',
      'dd if=',
      ':(){ :|:& };:',
      'sudo',
    ];

    if (dangerousCommands.some((dangerous) => command.includes(dangerous))) {
      return res.status(403).json({
        error: 'Blocked: Potentially dangerous command detected',
      });
    }

    const startTime = Date.now();

    if (stream) {
      // Streaming execution (for long-running commands)
      return handleStreamingExecution(req, res, command, workingDir);
    } else {
      // Standard execution (for quick commands)
      return handleStandardExecution(res, command, workingDir, startTime);
    }
  } catch (error) {
    console.error('Terminal execution error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Execution failed',
    });
  }
}

/**
 * Execute command and return all output at once
 */
function handleStandardExecution(
  res: NextApiResponse,
  command: string,
  cwd: string,
  startTime: number
) {
  exec(
    command,
    {
      cwd,
      maxBuffer: 1024 * 1024 * 10, // 10MB max output
      timeout: 30000, // 30 second timeout
    },
    (error, stdout, stderr) => {
      const executionTime = Date.now() - startTime;

      if (error) {
        return res.status(200).json({
          output: stdout + stderr,
          error: error.message,
          exitCode: error.code || 1,
          executionTime,
        });
      }

      return res.status(200).json({
        output: stdout + stderr,
        exitCode: 0,
        executionTime,
      });
    }
  );
}

/**
 * Execute command and stream output (SSE)
 */
function handleStreamingExecution(
  req: NextApiRequest,
  res: NextApiResponse,
  command: string,
  cwd: string
) {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Parse command and args
  const [cmd, ...args] = command.split(' ');
  const startTime = Date.now();

  // Spawn process
  const child = spawn(cmd, args, {
    cwd,
    shell: true,
  });

  // Stream stdout
  child.stdout.on('data', (data) => {
    const output = data.toString();
    res.write(`data: ${JSON.stringify({ type: 'stdout', data: output })}\n\n`);
  });

  // Stream stderr
  child.stderr.on('data', (data) => {
    const output = data.toString();
    res.write(`data: ${JSON.stringify({ type: 'stderr', data: output })}\n\n`);
  });

  // Handle completion
  child.on('close', (code) => {
    const executionTime = Date.now() - startTime;
    res.write(
      `data: ${JSON.stringify({
        type: 'exit',
        exitCode: code,
        executionTime,
      })}\n\n`
    );
    res.end();
  });

  // Handle errors
  child.on('error', (error) => {
    res.write(
      `data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`
    );
    res.end();
  });

  // Handle client disconnect
  req.on('close', () => {
    child.kill();
  });
}
