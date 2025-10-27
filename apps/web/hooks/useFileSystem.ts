/**
 * useFileSystem Hook
 *
 * React hook for interacting with the File System API
 * Provides methods to list, read, write, create, rename, and delete files
 */

import { useState, useCallback } from 'react';

export interface FileMetadata {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
  language?: string;
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
  modified: string;
}

export interface FileSystemError {
  code: string;
  message: string;
  path?: string;
}

export const useFileSystem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FileSystemError | null>(null);

  /**
   * List files in a directory
   */
  const listDirectory = useCallback(async (path: string = '.'): Promise<FileMetadata[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to list directory');
      }

      const data = await response.json();
      return data.files;
    } catch (err) {
      const error: FileSystemError = {
        code: 'LIST_ERROR',
        message: err instanceof Error ? err.message : 'Failed to list directory',
        path,
      };
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Read file content
   */
  const readFile = useCallback(async (path: string): Promise<FileContent> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/files/read?path=${encodeURIComponent(path)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to read file');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error: FileSystemError = {
        code: 'READ_ERROR',
        message: err instanceof Error ? err.message : 'Failed to read file',
        path,
      };
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Write file content
   */
  const writeFile = useCallback(async (path: string, content: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/files/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to write file');
      }
    } catch (err) {
      const error: FileSystemError = {
        code: 'WRITE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to write file',
        path,
      };
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new file or folder
   */
  const createFileOrFolder = useCallback(async (
    path: string,
    type: 'file' | 'folder',
    content?: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/files/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, type, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create ${type}`);
      }
    } catch (err) {
      const error: FileSystemError = {
        code: 'CREATE_ERROR',
        message: err instanceof Error ? err.message : `Failed to create ${type}`,
        path,
      };
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Rename or move file/folder
   */
  const renameFile = useCallback(async (oldPath: string, newPath: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/files/rename', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPath, newPath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rename file');
      }
    } catch (err) {
      const error: FileSystemError = {
        code: 'RENAME_ERROR',
        message: err instanceof Error ? err.message : 'Failed to rename file',
        path: oldPath,
      };
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete file or folder
   */
  const deleteFile = useCallback(async (path: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete file');
      }
    } catch (err) {
      const error: FileSystemError = {
        code: 'DELETE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to delete file',
        path,
      };
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    listDirectory,
    readFile,
    writeFile,
    createFileOrFolder,
    renameFile,
    deleteFile,
  };
};
