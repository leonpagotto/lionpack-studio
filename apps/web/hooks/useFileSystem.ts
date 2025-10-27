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

  /**
   * Open native folder picker and list contents
   * Uses File System Access API (available in modern browsers)
   */
  const openFolderPicker = useCallback(async (): Promise<FileMetadata[]> => {
    setLoading(true);
    setError(null);

    try {
      // Check if File System Access API is available
      if (!('showDirectoryPicker' in window)) {
        throw new Error('File System Access API not supported in this browser. Please use Chrome 86+ or Edge 86+');
      }

      // Open folder picker
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
      });

      // Read folder contents
      const files: FileMetadata[] = [];

      for await (const entry of dirHandle.values()) {
        const metadata: FileMetadata = {
          path: `${dirHandle.name}/${entry.name}`,
          name: entry.name,
          type: entry.kind === 'directory' ? 'directory' : 'file',
          size: 0,
          modified: new Date().toISOString(),
        };

        // Get file size if it's a file
        if (entry.kind === 'file') {
          try {
            const file = await entry.getFile();
            metadata.size = file.size;
            metadata.modified = new Date(file.lastModified).toISOString();
          } catch (e) {
            // Ignore permission errors for individual files
            console.warn(`Could not read file ${entry.name}:`, e);
          }
        }

        files.push(metadata);
      }

      // Store folder handle in IndexedDB for persistence (optional)
      try {
        const db = await openDB();
        const transaction = db.transaction('folderHandles', 'readwrite');
        const store = transaction.objectStore('folderHandles');
        await store.put(dirHandle, 'lastOpenedFolder');
      } catch (e) {
        console.warn('Could not save folder handle:', e);
      }

      return files;
    } catch (err) {
      const error: FileSystemError = {
        code: 'FOLDER_PICKER_ERROR',
        message: err instanceof Error ? err.message : 'Failed to open folder',
      };
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Read file from folder handle
   */
  const readFileFromHandle = useCallback(async (handle: any): Promise<string> => {
    try {
      const file = await handle.getFile();
      const text = await file.text();
      return text;
    } catch (err) {
      throw new Error(`Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    openFolderPicker,
    readFileFromHandle,
  };
};

/**
 * Helper: Open IndexedDB for storing folder handles
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LionPackStudio', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('folderHandles')) {
        db.createObjectStore('folderHandles');
      }
    };
  });
}
