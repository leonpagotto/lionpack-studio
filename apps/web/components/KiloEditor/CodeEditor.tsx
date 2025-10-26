import React, { useMemo } from 'react';

export interface CodeFile {
  path: string;
  content: string;
  language: string;
}

interface CodeEditorProps {
  file: CodeFile | null;
  isLoading?: boolean;
}

// Simple syntax highlighting function for common languages
const highlightCode = (code: string, language: string): React.ReactNode[] => {
  const lines = code.split('\n');
  const highlighted: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    const processed = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    highlighted.push(
      <div
        key={idx}
        className="flex"
        style={{
          color: isCommentLine(processed) ? '#6B7280' : 'inherit',
        }}
      >
        <span className="select-none w-12 text-right pr-4 text-slate-500 dark:text-slate-600 bg-slate-50 dark:bg-slate-900 text-xs">
          {idx + 1}
        </span>
        <span className="flex-1 text-sm font-mono">
          {processLine(processed, language)}
        </span>
      </div>
    );
  });

  return highlighted;
};

const isCommentLine = (line: string): boolean => {
  return line.trim().startsWith('//') || line.trim().startsWith('#');
};

const processLine = (line: string, language: string): React.ReactNode => {
  // Basic syntax highlighting for keywords
  const keywords = {
    typescript: [
      'const',
      'let',
      'var',
      'function',
      'interface',
      'type',
      'class',
      'import',
      'export',
      'from',
      'return',
      'async',
      'await',
      'if',
      'else',
      'for',
      'while',
    ],
    javascript: [
      'const',
      'let',
      'var',
      'function',
      'class',
      'import',
      'export',
      'from',
      'return',
      'async',
      'await',
      'if',
      'else',
      'for',
      'while',
    ],
    python: [
      'def',
      'class',
      'import',
      'from',
      'return',
      'if',
      'else',
      'for',
      'while',
      'async',
      'await',
    ],
  };

  const langKeywords =
    keywords[language as keyof typeof keywords] || keywords.typescript;

  let result = line;
  langKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    result = result.replace(
      regex,
      `<span class="text-blue-600 dark:text-blue-400 font-semibold">${keyword}</span>`
    );
  });

  // Highlight strings
  result = result.replace(
    /(['"])([^'"]*)\1/g,
    '<span class="text-green-600 dark:text-green-400">$&</span>'
  );

  // Highlight numbers
  result = result.replace(
    /\b(\d+)\b/g,
    '<span class="text-amber-600 dark:text-amber-400">$1</span>'
  );

  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

const CodeEditor: React.FC<CodeEditorProps> = ({ file, isLoading }) => {
  const highlightedLines = useMemo(() => {
    if (!file) return [];
    return highlightCode(file.content, file.language);
  }, [file]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {file ? file.path.split('/').pop() : 'No file selected'}
          </h3>
          {file && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {file.language}
              {file.content.length > 0 && ` • ${file.content.length} bytes`}
            </p>
          )}
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading code...
              </p>
            </div>
          </div>
        ) : file ? (
          <div className="font-mono text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900">
            {highlightedLines}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select a file to view code
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {file && (
        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          {file.content.split('\n').length} lines
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
