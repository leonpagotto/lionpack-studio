/**
 * Monaco Code Editor Component
 *
 * Professional code editor powered by Monaco (same engine as VS Code)
 * with Copilot integration, syntax highlighting, and code intelligence.
 *
 * Constitution Alignment:
 * - Speed with Purpose: Fast, responsive editing
 * - Quality through Standards: Industry-standard editor
 * - Empowerment: Full VS Code features available
 */

import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

export interface CodeFile {
  path: string;
  content: string;
  language: string;
}

interface MonacoCodeEditorProps {
  file: CodeFile | null;
  isLoading?: boolean;
  onChange?: (content: string) => void;
  enableIntelligence?: boolean;
  readOnly?: boolean;
  theme?: 'vs-dark' | 'vs-light' | 'hc-black';
}

const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  file,
  isLoading,
  onChange,
  enableIntelligence = true,
  readOnly = false,
  theme = 'vs-dark',
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Handle editor mount
  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure Monaco editor
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'off',
      readOnly,
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Trigger save (handled by parent component)
      console.log('Save triggered');
    });

    // Focus the editor
    editor.focus();
  };

  // Handle content changes
  const handleChange = (value: string | undefined) => {
    if (value !== undefined && onChange) {
      onChange(value);
    }
  };

  // Update editor content when file changes
  useEffect(() => {
    if (editorRef.current && file) {
      const currentModel = editorRef.current.getModel();
      if (currentModel) {
        // Update language if changed
        if (monacoRef.current) {
          const monaco = monacoRef.current;
          monaco.editor.setModelLanguage(currentModel, getMonacoLanguage(file.language));
        }
      }
    }
  }, [file?.language]);

  // Map common language names to Monaco language IDs
  const getMonacoLanguage = (language: string): string => {
    const languageMap: Record<string, string> = {
      'typescript': 'typescript',
      'javascript': 'javascript',
      'python': 'python',
      'json': 'json',
      'markdown': 'markdown',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'yaml': 'yaml',
      'xml': 'xml',
      'sql': 'sql',
      'shell': 'shell',
      'bash': 'shell',
      'go': 'go',
      'rust': 'rust',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'csharp': 'csharp',
      'php': 'php',
      'ruby': 'ruby',
      'plaintext': 'plaintext',
    };

    return languageMap[language.toLowerCase()] || 'plaintext';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading editor...
          </p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a file to start editing
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Use the file explorer on the left
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={getMonacoLanguage(file.language)}
        value={file.content}
        theme={theme}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          lineNumbers: 'on',
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'off',
          readOnly,
          quickSuggestions: enableIntelligence,
          suggestOnTriggerCharacters: enableIntelligence,
          parameterHints: {
            enabled: enableIntelligence,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" />
          </div>
        }
      />
    </div>
  );
};

export default MonacoCodeEditor;
