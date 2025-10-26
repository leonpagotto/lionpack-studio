/**
 * File System API - Read File
 * 
 * GET /api/files/read?path=/path/to/file
 * 
 * Returns file content as text
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { path: requestedPath } = req.query;
    
    if (!requestedPath || typeof requestedPath !== 'string') {
      return res.status(400).json({ error: 'Path parameter required' });
    }
    
    const safePath = validateAndResolvePath(requestedPath);
    
    // Check if file exists and is readable
    const stats = await fs.stat(safePath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is a directory, not a file' });
    }
    
    // Read file content
    const content = await fs.readFile(safePath, 'utf-8');
    
    return res.status(200).json({
      path: safePath,
      content,
      size: stats.size,
      modified: stats.mtime.toISOString(),
    });
  } catch (error) {
    console.error('Read file error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
