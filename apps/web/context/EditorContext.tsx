import React, { createContext, useContext, useState, useCallback } from 'react';

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface EditorContextType {
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
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [files, setFilesState] = useState<GeneratedFile[]>([]);
  const [activeFile, setActiveFileState] = useState<GeneratedFile | null>(null);
  const [testOutput, setTestOutput] = useState<string[]>([]);
  const [testResults, setTestResultsState] = useState<EditorContextType['testResults']>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);

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

  const value: EditorContextType = {
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
