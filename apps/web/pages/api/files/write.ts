/**
 * File System API - Write File
 *
 * POST /api/files/write
 * Body: { path: string, content: string }
 *
 * Writes content to file (creates if doesn't exist)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

function getWorkspaceRoot(): string {
  return process.cwd();
}

function validateAndResolvePath(requestedPath: string): string {
  const workspaceRoot = getWorkspaceRoot();
  const absolutePath = path.isAbsolute(requestedPath)
    ? requestedPath
    : path.join(workspaceRoot, requestedPath);
  const normalizedPath = path.normalize(absolutePath);

  if (!normalizedPath.startsWith(workspaceRoot)) {
    throw new Error('Access denied: Path outside workspace');
  }

  return normalizedPath;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path: requestedPath, content } = req.body;

    if (!requestedPath || typeof requestedPath !== 'string') {
      return res.status(400).json({ error: 'Path required' });
    }

    if (content === undefined || content === null) {
      return res.status(400).json({ error: 'Content required' });
    }

    const safePath = validateAndResolvePath(requestedPath);

    // Ensure parent directory exists
    const dir = path.dirname(safePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(safePath, content, 'utf-8');

    // Get updated stats
    const stats = await fs.stat(safePath);

    return res.status(200).json({
      success: true,
      path: safePath,
      size: stats.size,
      modified: stats.mtime.toISOString(),
    });
  } catch (error) {
    console.error('Write file error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
