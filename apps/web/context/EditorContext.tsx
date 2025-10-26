import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  FilesystemService,
  type FilesystemSource,
  type SourceInfo,
  type GitHubConfig,
  type FilesystemError,
} from '@lionpack/leo-client';

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface FileSystemState {
  source: FilesystemSource;
  sourceInfo: SourceInfo | null;
  isConnected: boolean;
  error: FilesystemError | null;
}

export interface EditorContextType {
  // Existing state
  files: GeneratedFile[];
  activeFile: GeneratedFile | null;
  testOutput: string[];
  testResults: {
    passed: number;
    failed: number;
    total: number;
    tests: Array<{ name: string; status: 'pass' | 'fail'; message?: string }>;
  } | null;
  isGenerating: boolean;

  // Filesystem state
  filesystem: FileSystemState;
  filesystemService: FilesystemService;

  // Existing methods
  setFiles: (files: GeneratedFile[]) => void;
  selectFile: (file: GeneratedFile) => void;
  addTestOutput: (output: string) => void;
  setTestResults: (
    results: {
      passed: number;
      failed: number;
      total: number;
      tests: Array<{
        name: string;
        status: 'pass' | 'fail';
        message?: string;
      }>;
    } | null
  ) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  reset: () => void;

  // Filesystem methods
  openLocalFolder: () => Promise<void>;
  connectGitHub: (config: GitHubConfig) => Promise<void>;
  disconnectFilesystem: () => void;
  loadFile: (path: string) => Promise<void>;
  saveFile: (path: string, content: string) => Promise<void>;
  createNewFile: (path: string, content?: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  refreshFileTree: () => Promise<void>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Existing state
  const [files, setFilesState] = useState<GeneratedFile[]>([]);
  const [activeFile, setActiveFileState] = useState<GeneratedFile | null>(null);
  const [testOutput, setTestOutput] = useState<string[]>([]);
  const [testResults, setTestResultsState] = useState<EditorContextType['testResults']>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Filesystem state
  const [filesystemService] = useState(() => new FilesystemService());
  const [filesystem, setFilesystem] = useState<FileSystemState>({
    source: null,
    sourceInfo: filesystemService.getSourceInfo(),
    isConnected: filesystemService.isConnected(),
    error: null,
  });

  const setFiles = useCallback((newFiles: GeneratedFile[]) => {
    setFilesState(newFiles);
    // Auto-select first file
    if (newFiles.length > 0 && !activeFile) {
      setActiveFileState(newFiles[0]);
    }
  }, [activeFile]);

  const selectFile = useCallback((file: GeneratedFile) => {
    setActiveFileState(file);
  }, []);

  const addTestOutput = useCallback((output: string) => {
    setTestOutput((prev) => [...prev, output]);
  }, []);

  const setTestResults = useCallback(
    (results: EditorContextType['testResults']) => {
      setTestResultsState(results);
    },
    []
  );

  const reset = useCallback(() => {
    setFilesState([]);
    setActiveFileState(null);
    setTestOutput([]);
    setTestResultsState(null);
    setIsGenerating(false);
  }, []);

  // Update filesystem state helper
  const updateFilesystemState = useCallback(() => {
    setFilesystem({
      source: filesystemService.getCurrentSource(),
      sourceInfo: filesystemService.getSourceInfo(),
      isConnected: filesystemService.isConnected(),
      error: null,
    });
  }, [filesystemService]);

  // Filesystem methods
  const openLocalFolder = useCallback(async () => {
    try {
      setFilesystem((prev) => ({ ...prev, error: null }));
      const result = await filesystemService.useLocal();

      if (result.ok) {
        updateFilesystemState();
        // Load files from local filesystem
        await refreshFileTree();
      } else {
        setFilesystem((prev) => ({ ...prev, error: result.error || null }));
      }
    } catch (error) {
      console.error('Failed to open local folder:', error);
      setFilesystem((prev) => ({
        ...prev,
        error: {
          code: 'UNKNOWN',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }));
    }
  }, [filesystemService, updateFilesystemState]);

  const connectGitHub = useCallback(
    async (config: GitHubConfig) => {
      try {
        setFilesystem((prev) => ({ ...prev, error: null }));
        const result = await filesystemService.useGitHub(config);

        if (result.ok) {
          updateFilesystemState();
          // Load files from GitHub
          await refreshFileTree();
        } else {
          setFilesystem((prev) => ({ ...prev, error: result.error || null }));
        }
      } catch (error) {
        console.error('Failed to connect to GitHub:', error);
        setFilesystem((prev) => ({
          ...prev,
          error: {
            code: 'UNKNOWN',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        }));
      }
    },
    [filesystemService, updateFilesystemState]
  );

  const disconnectFilesystem = useCallback(() => {
    filesystemService.disconnect();
    updateFilesystemState();
    setFilesState([]);
    setActiveFileState(null);
  }, [filesystemService, updateFilesystemState]);

  const loadFile = useCallback(
    async (path: string) => {
      try {
        const result = await filesystemService.readFile(path);

        if (result.ok && result.value) {
          const content = typeof result.value === 'string' ? result.value : new TextDecoder().decode(result.value);
          const extension = path.split('.').pop() || '';

          // Map file extension to language
          const languageMap: Record<string, string> = {
            js: 'javascript',
            ts: 'typescript',
            jsx: 'javascript',
            tsx: 'typescript',
            json: 'json',
            md: 'markdown',
            css: 'css',
            html: 'html',
            yml: 'yaml',
            yaml: 'yaml',
          };

          const file: GeneratedFile = {
            path,
            content,
            language: languageMap[extension] || 'plaintext',
          };

          // Add to files if not already present
          setFilesState((prev) => {
            const exists = prev.some((f) => f.path === path);
            return exists ? prev : [...prev, file];
          });

          // Select the file
          setActiveFileState(file);
        } else {
          console.error('Failed to load file:', result.error);
        }
      } catch (error) {
        console.error('Failed to load file:', error);
      }
    },
    [filesystemService]
  );

  const saveFile = useCallback(
    async (path: string, content: string) => {
      try {
        const result = await filesystemService.writeFile(path, content);

        if (result.ok) {
          // Update file in state
          setFilesState((prev) =>
            prev.map((f) => (f.path === path ? { ...f, content } : f))
          );

          // Update active file if it matches
          setActiveFileState((prev) =>
            prev && prev.path === path ? { ...prev, content } : prev
          );
        } else {
          console.error('Failed to save file:', result.error);
        }
      } catch (error) {
        console.error('Failed to save file:', error);
      }
    },
    [filesystemService]
  );

  const createNewFile = useCallback(
    async (path: string, content: string = '') => {
      try {
        const result = await filesystemService.createFile(path, content);

        if (result.ok) {
          // Add to files
          const extension = path.split('.').pop() || '';
          const languageMap: Record<string, string> = {
            js: 'javascript',
            ts: 'typescript',
            jsx: 'javascript',
            tsx: 'typescript',
            json: 'json',
            md: 'markdown',
            css: 'css',
            html: 'html',
            yml: 'yaml',
            yaml: 'yaml',
          };

          const file: GeneratedFile = {
            path,
            content,
            language: languageMap[extension] || 'plaintext',
          };

          setFilesState((prev) => [...prev, file]);
          setActiveFileState(file);
        } else {
          console.error('Failed to create file:', result.error);
        }
      } catch (error) {
        console.error('Failed to create file:', error);
      }
    },
    [filesystemService]
  );

  const deleteFile = useCallback(
    async (path: string) => {
      try {
        const result = await filesystemService.deleteEntry(path);

        if (result.ok) {
          // Remove from files
          setFilesState((prev) => prev.filter((f) => f.path !== path));

          // Clear active file if deleted
          setActiveFileState((prev) =>
            prev && prev.path === path ? null : prev
          );
        } else {
          console.error('Failed to delete file:', result.error);
        }
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    },
    [filesystemService]
  );

  const renameFile = useCallback(
    async (oldPath: string, newPath: string) => {
      try {
        const result = await filesystemService.renameEntry(oldPath, newPath);

        if (result.ok) {
          // Update path in files
          setFilesState((prev) =>
            prev.map((f) => (f.path === oldPath ? { ...f, path: newPath } : f))
          );

          // Update active file path if renamed
          setActiveFileState((prev) =>
            prev && prev.path === oldPath ? { ...prev, path: newPath } : prev
          );
        } else {
          console.error('Failed to rename file:', result.error);
        }
      } catch (error) {
        console.error('Failed to rename file:', error);
      }
    },
    [filesystemService]
  );

  const refreshFileTree = useCallback(async () => {
    try {
      if (!filesystemService.isConnected()) {
        return;
      }

      // Get file tree from root (flat list of entries)
      const result = await filesystemService.listDirectory('/');

      if (result.ok && result.value) {
        // Convert FileSystemEntry array to GeneratedFile array
        const convertToGeneratedFiles = (entries: typeof result.value): GeneratedFile[] => {
          return entries!
            .filter((entry) => entry.kind === 'file')
            .map((entry) => {
              const extension = entry.name.split('.').pop() || '';
              const languageMap: Record<string, string> = {
                js: 'javascript',
                ts: 'typescript',
                jsx: 'javascript',
                tsx: 'typescript',
                json: 'json',
                md: 'markdown',
                css: 'css',
                html: 'html',
                yml: 'yaml',
                yaml: 'yaml',
              };

              return {
                path: entry.path,
                content: '', // Loaded on demand when file is selected
                language: languageMap[extension] || 'plaintext',
              };
            });
        };

        const files = convertToGeneratedFiles(result.value);
        setFilesState(files);
      } else {
        console.error('Failed to refresh file tree:', result.error);
      }
    } catch (error) {
      console.error('Failed to refresh file tree:', error);
    }
  }, [filesystemService]);

  // Try to reconnect GitHub on mount if previously connected
  useEffect(() => {
    const reconnect = async () => {
      const result = await filesystemService.reconnectGitHub();
      if (result.ok) {
        updateFilesystemState();
        await refreshFileTree();
      }
    };

    reconnect();
  }, [filesystemService, updateFilesystemState, refreshFileTree]);

  const value: EditorContextType = {
    // Existing values
    files,
    activeFile,
    testOutput,
    testResults,
    isGenerating,
    setFiles,
    selectFile,
    addTestOutput,
    setTestResults,
    setIsGenerating,
    reset,

    // Filesystem values
    filesystem,
    filesystemService,
    openLocalFolder,
    connectGitHub,
    disconnectFilesystem,
    loadFile,
    saveFile,
    createNewFile,
    deleteFile,
    renameFile,
    refreshFileTree,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
};
