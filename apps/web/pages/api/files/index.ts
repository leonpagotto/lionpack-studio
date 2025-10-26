/**
 * File System API - List Directory & Delete File/Folder
 *
 * GET /api/files?path=/path/to/dir - List directory contents
 * DELETE /api/files?path=/path/to/file - Delete file or folder
 *
 * Security: Operations restricted to workspace directory only
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

/**
 * Get workspace root (safe directory for file operations)
 */
function getWorkspaceRoot(): string {
  // For now, use the project root
  // TODO: Allow user to select workspace directory
  return process.cwd();
}

/**
 * Validate and resolve path (prevent directory traversal attacks)
 */
function validateAndResolvePath(requestedPath: string): string {
  const workspaceRoot = getWorkspaceRoot();

  // Resolve to absolute path
  const absolutePath = path.isAbsolute(requestedPath)
    ? requestedPath
    : path.join(workspaceRoot, requestedPath);

  // Normalize to prevent ../.. attacks
  const normalizedPath = path.normalize(absolutePath);

  // Ensure path is within workspace
  if (!normalizedPath.startsWith(workspaceRoot)) {
    throw new Error('Access denied: Path outside workspace');
  }

  return normalizedPath;
}

/**
 * Get file/folder metadata
 */
async function getFileMetadata(filePath: string) {
  const stats = await fs.stat(filePath);
  const name = path.basename(filePath);

  return {
    name,
    path: filePath,
    isDirectory: stats.isDirectory(),
    size: stats.size,
    modified: stats.mtime.toISOString(),
    created: stats.birthtime.toISOString(),
  };
}

/**
 * List directory contents
 */
async function listDirectory(dirPath: string) {
  const safePath = validateAndResolvePath(dirPath);

  // Check if directory exists
  const stats = await fs.stat(safePath).catch(() => null);
  if (!stats || !stats.isDirectory()) {
    throw new Error('Directory not found');
  }

  // Read directory
  const entries = await fs.readdir(safePath, { withFileTypes: true });

  // Get metadata for each entry
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(safePath, entry.name);

      // Skip hidden files and node_modules by default
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        return null;
      }

      try {
        return await getFileMetadata(entryPath);
      } catch (error) {
        // Skip files we can't read
        return null;
      }
    })
  );

  // Filter out nulls and sort (directories first, then alphabetically)
  return files
    .filter((file): file is NonNullable<typeof file> => file !== null)
    .sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
}

/**
 * Delete file or folder
 */
async function deleteFileOrFolder(filePath: string) {
  const safePath = validateAndResolvePath(filePath);

  // Check if exists
  const stats = await fs.stat(safePath).catch(() => null);
  if (!stats) {
    throw new Error('File or folder not found');
  }

  // Delete
  if (stats.isDirectory()) {
    await fs.rm(safePath, { recursive: true, force: true });
  } else {
    await fs.unlink(safePath);
  }

  return { success: true, deleted: safePath };
}

/**
 * API Handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { path: requestedPath } = req.query;

    if (!requestedPath || typeof requestedPath !== 'string') {
      return res.status(400).json({ error: 'Path parameter required' });
    }

    switch (req.method) {
      case 'GET': {
        // List directory
        const files = await listDirectory(requestedPath);
        return res.status(200).json({ files });
      }

      case 'DELETE': {
        // Delete file or folder
        const result = await deleteFileOrFolder(requestedPath);
        return res.status(200).json(result);
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('File system error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({ error: errorMessage });
  }
}
