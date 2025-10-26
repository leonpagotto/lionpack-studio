/**
 * DiffViewer Component
 *
 * Displays syntax-highlighted diffs with expandable sections.
 * Shows additions/deletions line-by-line.
 *
 * Story 3.14 - Advanced Git Operations
 */

import React, { useState } from 'react';
import type { DiffFile } from '@lionpack/leo-client';

interface DiffViewerProps {
  files: DiffFile[];
  totalAdditions: number;
  totalDeletions: number;
  totalChanges: number;
  compareUrl?: string;
  onClose?: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  files,
  totalAdditions,
  totalDeletions,
  totalChanges,
  compareUrl,
  onClose,
}) => {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const toggleFile = (filename: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filename)) {
        next.delete(filename);
      } else {
        next.add(filename);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedFiles(new Set(files.map(f => f.filename)));
  };

  const collapseAll = () => {
    setExpandedFiles(new Set());
  };

  const getFileIcon = (status: string) => {
    switch (status) {
      case 'added':
        return '➕';
      case 'removed':
        return '➖';
      case 'modified':
        return '📝';
      case 'renamed':
        return '↪️';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added':
        return 'text-green-600 dark:text-green-400';
      case 'removed':
        return 'text-red-600 dark:text-red-400';
      case 'modified':
        return 'text-blue-600 dark:text-blue-400';
      case 'renamed':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const parsePatch = (patch: string | undefined) => {
    if (!patch) return [];

    const lines = patch.split('\n');
    const parsedLines: Array<{ type: 'add' | 'remove' | 'context' | 'header'; content: string; lineNumber?: string }> = [];

    let oldLineNum = 0;
    let newLineNum = 0;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        // Parse line numbers from header: @@ -1,4 +1,5 @@
        const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
        if (match) {
          oldLineNum = parseInt(match[1], 10);
          newLineNum = parseInt(match[2], 10);
        }
        parsedLines.push({ type: 'header', content: line });
      } else if (line.startsWith('+')) {
        parsedLines.push({ type: 'add', content: line.substring(1), lineNumber: `${newLineNum}` });
        newLineNum++;
      } else if (line.startsWith('-')) {
        parsedLines.push({ type: 'remove', content: line.substring(1), lineNumber: `${oldLineNum}` });
        oldLineNum++;
      } else if (line.startsWith(' ')) {
        parsedLines.push({ type: 'context', content: line.substring(1), lineNumber: `${newLineNum}` });
        oldLineNum++;
        newLineNum++;
      } else {
        parsedLines.push({ type: 'context', content: line });
      }
    }

    return parsedLines;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Diff Viewer
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {files.length} file{files.length !== 1 ? 's' : ''} changed •
            <span className="text-green-600 dark:text-green-400 ml-1">+{totalAdditions}</span>
            <span className="text-red-600 dark:text-red-400 ml-1">-{totalDeletions}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Collapse All
          </button>
          {compareUrl && (
            <a
              href={compareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              View on GitHub ↗
            </a>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {files.map((file) => {
          const isExpanded = expandedFiles.has(file.filename);
          const parsedLines = parsePatch(file.patch);

          return (
            <div key={file.filename} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
              {/* File Header */}
              <button
                onClick={() => toggleFile(file.filename)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getFileIcon(file.status)}</span>
                  <div className="text-left">
                    <div className="font-mono text-sm text-slate-900 dark:text-white">
                      {file.filename}
                      {file.previousFilename && (
                        <span className="text-slate-500 dark:text-slate-400">
                          {' ← '}
                          {file.previousFilename}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <span className={getStatusColor(file.status)}>{file.status}</span>
                      <span className="ml-3 text-green-600 dark:text-green-400">+{file.additions}</span>
                      <span className="ml-2 text-red-600 dark:text-red-400">-{file.deletions}</span>
                    </div>
                  </div>
                </div>
                <div className="text-slate-400 dark:text-slate-500">
                  {isExpanded ? '▼' : '▶'}
                </div>
              </button>

              {/* File Diff */}
              {isExpanded && file.patch && (
                <div className="bg-slate-50 dark:bg-slate-900">
                  <div className="font-mono text-xs">
                    {parsedLines.map((line, idx) => {
                      let bgClass = '';
                      let textClass = 'text-slate-800 dark:text-slate-200';
                      let prefix = ' ';

                      if (line.type === 'add') {
                        bgClass = 'bg-green-50 dark:bg-green-900/20';
                        textClass = 'text-green-800 dark:text-green-300';
                        prefix = '+';
                      } else if (line.type === 'remove') {
                        bgClass = 'bg-red-50 dark:bg-red-900/20';
                        textClass = 'text-red-800 dark:text-red-300';
                        prefix = '-';
                      } else if (line.type === 'header') {
                        bgClass = 'bg-blue-50 dark:bg-blue-900/20';
                        textClass = 'text-blue-800 dark:text-blue-300 font-semibold';
                      }

                      return (
                        <div
                          key={idx}
                          className={`flex items-start ${bgClass} border-l-2 ${
                            line.type === 'add'
                              ? 'border-green-500'
                              : line.type === 'remove'
                              ? 'border-red-500'
                              : line.type === 'header'
                              ? 'border-blue-500'
                              : 'border-transparent'
                          }`}
                        >
                          {line.type !== 'header' && (
                            <span className="inline-block w-12 text-right pr-2 text-slate-400 dark:text-slate-600 select-none flex-shrink-0">
                              {line.lineNumber || ''}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 ${textClass} whitespace-pre-wrap break-all`}>
                            {line.type === 'header' ? line.content : `${prefix}${line.content}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
