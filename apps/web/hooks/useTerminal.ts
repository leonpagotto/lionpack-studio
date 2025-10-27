/**
 * useTerminal Hook
 *
 * React hook for executing terminal commands
 */

import { useState, useCallback, useRef } from 'react';

interface TerminalOutput {
  type: 'stdout' | 'stderr' | 'error' | 'exit';
  data: string;
  timestamp: number;
}

interface ExecuteOptions {
  cwd?: string;
  stream?: boolean;
  onOutput?: (output: TerminalOutput) => void;
}

export const useTerminal = () => {
  const [output, setOutput] = useState<TerminalOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeCommand = useCallback(
    async (command: string, options: ExecuteOptions = {}) => {
      if (!command.trim()) {
        return;
      }

      // Cancel previous command if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsExecuting(true);
      setError(null);

      // Add command to output
      const commandOutput: TerminalOutput = {
        type: 'stdout',
        data: `$ ${command}\n`,
        timestamp: Date.now(),
      };
      setOutput((prev) => [...prev, commandOutput]);
      options.onOutput?.(commandOutput);

      try {
        if (options.stream) {
          // Streaming execution
          await executeStreamingCommand(
            command,
            options,
            setOutput,
            abortController.signal
          );
        } else {
          // Standard execution
          const response = await fetch('/api/terminal/execute', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              command,
              cwd: options.cwd,
              stream: false,
            }),
            signal: abortController.signal,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Command execution failed');
          }

          const data = await response.json();

          // Add output
          if (data.output) {
            const outputEntry: TerminalOutput = {
              type: data.error ? 'stderr' : 'stdout',
              data: data.output,
              timestamp: Date.now(),
            };
            setOutput((prev) => [...prev, outputEntry]);
            options.onOutput?.(outputEntry);
          }

          // Add exit code
          const exitEntry: TerminalOutput = {
            type: 'exit',
            data: `\nExited with code ${data.exitCode} (${data.executionTime}ms)\n`,
            timestamp: Date.now(),
          };
          setOutput((prev) => [...prev, exitEntry]);
          options.onOutput?.(exitEntry);

          if (data.error) {
            setError(data.error);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Command was aborted
          const abortEntry: TerminalOutput = {
            type: 'error',
            data: '\n^C (Interrupted)\n',
            timestamp: Date.now(),
          };
          setOutput((prev) => [...prev, abortEntry]);
          options.onOutput?.(abortEntry);
        } else {
          const errorMessage =
            err instanceof Error ? err.message : 'Execution failed';
          setError(errorMessage);

          const errorEntry: TerminalOutput = {
            type: 'error',
            data: `Error: ${errorMessage}\n`,
            timestamp: Date.now(),
          };
          setOutput((prev) => [...prev, errorEntry]);
          options.onOutput?.(errorEntry);
        }
      } finally {
        setIsExecuting(false);
      }
    },
    []
  );

  const clearOutput = useCallback(() => {
    setOutput([]);
    setError(null);
  }, []);

  const cancelExecution = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    output,
    isExecuting,
    error,
    executeCommand,
    clearOutput,
    cancelExecution,
  };
};

/**
 * Execute command with streaming output (SSE)
 */
async function executeStreamingCommand(
  command: string,
  options: ExecuteOptions,
  setOutput: React.Dispatch<React.SetStateAction<TerminalOutput[]>>,
  signal: AbortSignal
) {
  const response = await fetch('/api/terminal/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      command,
      cwd: options.cwd,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error('Streaming execution failed');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));

          const outputEntry: TerminalOutput = {
            type: data.type,
            data:
              data.type === 'exit'
                ? `\nExited with code ${data.exitCode} (${data.executionTime}ms)\n`
                : data.type === 'error'
                ? `Error: ${data.error}\n`
                : data.data,
            timestamp: Date.now(),
          };

          setOutput((prev) => [...prev, outputEntry]);
          options.onOutput?.(outputEntry);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
