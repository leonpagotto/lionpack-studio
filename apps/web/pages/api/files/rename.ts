/**
 * File System API - Rename File or Folder
 * 
 * PUT /api/files/rename
 * Body: { oldPath: string, newPath: string }
 * 
 * Renames/moves a file or folder
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
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { oldPath, newPath } = req.body;
    
    if (!oldPath || typeof oldPath !== 'string') {
      return res.status(400).json({ error: 'oldPath required' });
    }
    
    if (!newPath || typeof newPath !== 'string') {
      return res.status(400).json({ error: 'newPath required' });
    }
    
    const safeOldPath = validateAndResolvePath(oldPath);
    const safeNewPath = validateAndResolvePath(newPath);
    
    // Check if source exists
    const exists = await fs.stat(safeOldPath).catch(() => null);
    if (!exists) {
      return res.status(404).json({ error: 'Source file or folder not found' });
    }
    
    // Check if destination already exists
    const destExists = await fs.stat(safeNewPath).catch(() => null);
    if (destExists) {
      return res.status(409).json({ error: 'Destination already exists' });
    }
    
    // Ensure destination directory exists
    const dir = path.dirname(safeNewPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Rename/move
    await fs.rename(safeOldPath, safeNewPath);
    
    return res.status(200).json({
      success: true,
      oldPath: safeOldPath,
      newPath: safeNewPath,
    });
  } catch (error) {
    console.error('Rename file/folder error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
