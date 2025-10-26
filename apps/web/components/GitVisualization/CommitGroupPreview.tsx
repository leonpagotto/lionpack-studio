/**
 * CommitGroupPreview Component
 * 
 * Previews multiple commits before creation.
 * Shows files in each commit with conventional commit validation.
 * 
 * Story 3.14 - Advanced Git Operations
 */

import React, { useState } from 'react';

interface CommitPreview {
  type: 'feat' | 'fix' | 'refactor' | 'docs' | 'test' | 'chore';
  message: string;
  files: string[];
}

interface CommitGroupPreviewProps {
  branch: string;
  commits: CommitPreview[];
  onApprove: () => void;
  onReject: () => void;
}

export const CommitGroupPreview: React.FC<CommitGroupPreviewProps> = ({
  branch,
  commits,
  onApprove,
  onReject,
}) => {
  const [expandedCommits, setExpandedCommits] = useState<Set<number>>(new Set([0]));

  const toggleCommit = (index: number) => {
    setExpandedCommits(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feat':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'fix':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'refactor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'docs':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'test':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'chore':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feat':
        return '✨';
      case 'fix':
        return '🐛';
      case 'refactor':
        return '♻️';
      case 'docs':
        return '📝';
      case 'test':
        return '✅';
      case 'chore':
        return '🔧';
      default:
        return '📦';
    }
  };

  const validateCommitMessage = (type: string, message: string): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];

    // Check message length
    if (message.length === 0) {
      issues.push('Message is required');
    } else if (message.length > 72) {
      issues.push('Message should be ≤72 characters');
    }

    // Check message format
    if (message.length > 0 && message[0] === message[0].toUpperCase()) {
      issues.push('Message should start with lowercase');
    }

    // Check for period at end
    if (message.endsWith('.')) {
      issues.push('Message should not end with period');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  };

  const totalFiles = commits.reduce((sum, c) => sum + c.files.length, 0);
  const allValid = commits.every(c => validateCommitMessage(c.type, c.message).valid);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
              📦 Commit Group Preview
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {commits.length} commit{commits.length !== 1 ? 's' : ''} to <span className="font-mono font-bold">{branch}</span>
              {' • '}
              {totalFiles} file{totalFiles !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={onReject}
            className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Commit List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {commits.map((commit, index) => {
          const isExpanded = expandedCommits.has(index);
          const validation = validateCommitMessage(commit.type, commit.message);

          return (
            <div
              key={index}
              className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              {/* Commit Header */}
              <button
                onClick={() => toggleCommit(index)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{getTypeIcon(commit.type)}</span>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getTypeColor(commit.type)}`}>
                        {commit.type}
                      </span>
                      {!validation.valid && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          ⚠️ {validation.issues.length} issue{validation.issues.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {validation.valid && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          ✓ Valid
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-sm text-slate-900 dark:text-white">
                      {commit.message}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {commit.files.length} file{commit.files.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-slate-400 dark:text-slate-500 ml-2">
                  {isExpanded ? '▼' : '▶'}
                </div>
              </button>

              {/* Commit Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 bg-slate-50 dark:bg-slate-800/50">
                  {/* Validation Issues */}
                  {!validation.valid && (
                    <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                      <div className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                        Validation Issues:
                      </div>
                      <ul className="text-sm text-red-700 dark:text-red-400 list-disc list-inside">
                        {validation.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Full Commit Message Preview */}
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Conventional Commit Format:
                    </div>
                    <div className="font-mono text-sm p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">
                      <span className={getTypeColor(commit.type).replace('bg-', 'text-').replace('100', '700').replace('30', '400')}>
                        {commit.type}
                      </span>
                      : {commit.message}
                    </div>
                  </div>

                  {/* Files List */}
                  <div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Files ({commit.files.length}):
                    </div>
                    <div className="space-y-1">
                      {commit.files.map((file, fileIdx) => (
                        <div
                          key={fileIdx}
                          className="font-mono text-xs px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded flex items-center gap-2"
                        >
                          <span className="text-slate-400 dark:text-slate-600">📄</span>
                          <span className="text-slate-900 dark:text-white">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
        <div className="text-sm">
          {allValid ? (
            <span className="text-green-600 dark:text-green-400">
              ✓ All commits valid
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400">
              ⚠️ Some commits have validation issues
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReject}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={!allValid}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            Approve & Create {commits.length} Commit{commits.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
