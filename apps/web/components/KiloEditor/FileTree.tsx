import React, { useState } from 'react';
import { useEditor, type GeneratedFile } from '../../context/EditorContext';
import { FileTreeContextMenu } from '../FileSystem/FileTreeContextMenu';

export interface FileNode {
  path: string;
  content: string;
  language: string;
  isDirectory?: boolean;
  children?: FileNode[];
}

interface FileTreeProps {
  files?: FileNode[]; // Optional now - will use EditorContext if not provided
  activeFile?: string;
  onSelectFile?: (file: FileNode) => void; // Optional - will use EditorContext if not provided
}

interface ContextMenuState {
  file: GeneratedFile;
  x: number;
  y: number;
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
  files: propFiles,
  activeFile: propActiveFile,
  onSelectFile: propOnSelectFile,
}) => {
  const editor = useEditor();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Use props if provided, otherwise use EditorContext
  const files = propFiles || editor.files;
  const activeFile = propActiveFile || editor.activeFile?.path;
  const onSelectFile = propOnSelectFile || ((file: FileNode) => {
    editor.selectFile(file as GeneratedFile);
  });

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const handleContextMenu = (node: FileNode, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      file: node as GeneratedFile,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleFileClick = async (node: FileNode) => {
    if (!node.isDirectory && node.language !== 'directory') {
      // Load file content from filesystem if using EditorContext
      if (!propFiles && !propOnSelectFile) {
        try {
          await editor.loadFile(node.path);
        } catch (error) {
          console.error('Failed to load file:', error);
        }
      } else {
        // Use the provided callback
        onSelectFile(node);
      }
    }
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
          onClick={() => handleFileClick(node)}
          onContextMenu={(e) => handleContextMenu(node, e)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.path);
              }}
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

      {/* Context Menu */}
      {contextMenu && (
        <FileTreeContextMenu
          file={contextMenu.file}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default FileTree;
