import React, { useState } from 'react';

export interface FileNode {
  path: string;
  content: string;
  language: string;
  isDirectory?: boolean;
  children?: FileNode[];
}

interface FileTreeProps {
  files: FileNode[];
  activeFile?: string;
  onSelectFile: (file: FileNode) => void;
}

const getFileIcon = (language: string | undefined): string => {
  if (!language) return '📄';
  switch (language.toLowerCase()) {
    case 'typescript':
    case 'ts':
      return '📘';
    case 'javascript':
    case 'js':
      return '📙';
    case 'jsx':
    case 'tsx':
      return '⚛️';
    case 'css':
    case 'scss':
      return '🎨';
    case 'html':
      return '📗';
    case 'json':
      return '📊';
    case 'python':
      return '🐍';
    default:
      return '📄';
  }
};

const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFile,
  onSelectFile,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const renderFileNode = (node: FileNode, level = 0) => {
    const isExpanded = expanded.has(node.path);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer
            ${
              activeFile === node.path
                ? 'bg-blue-100 dark:bg-blue-900'
                : 'hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpand(node.path)}
              className="flex-shrink-0 w-4 h-4 flex items-center justify-center"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className="w-4" />}

          <span className="text-lg flex-shrink-0">
            {getFileIcon(node.language)}
          </span>

          <span
            className="flex-1 text-sm text-slate-900 dark:text-white truncate"
            onClick={() => !hasChildren && onSelectFile(node)}
          >
            {node.path.split('/').pop()}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderFileNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Files
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No files generated yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {files.map((file) => renderFileNode(file))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTree;
