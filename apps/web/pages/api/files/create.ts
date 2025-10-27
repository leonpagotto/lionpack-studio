/**
 * File System API - Create File or Folder
 *
 * POST /api/files/create
 * Body: { path: string, type: 'file' | 'folder', content?: string }
 *
 * Creates a new file or folder
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
    const { path: requestedPath, type, content = '' } = req.body;

    if (!requestedPath || typeof requestedPath !== 'string') {
      return res.status(400).json({ error: 'Path required' });
    }

    if (!type || (type !== 'file' && type !== 'folder')) {
      return res.status(400).json({ error: 'Type must be "file" or "folder"' });
    }

    const safePath = validateAndResolvePath(requestedPath);

    // Check if already exists
    const exists = await fs.stat(safePath).catch(() => null);
    if (exists) {
      return res.status(409).json({ error: 'File or folder already exists' });
    }

    if (type === 'folder') {
      // Create folder
      await fs.mkdir(safePath, { recursive: true });

      return res.status(201).json({
        success: true,
        path: safePath,
        type: 'folder',
      });
    } else {
      // Create file
      const dir = path.dirname(safePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(safePath, content, 'utf-8');

      const stats = await fs.stat(safePath);

      return res.status(201).json({
        success: true,
        path: safePath,
        type: 'file',
        size: stats.size,
      });
    }
  } catch (error) {
    console.error('Create file/folder error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
