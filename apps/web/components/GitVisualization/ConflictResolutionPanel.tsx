/**
 * ConflictResolutionPanel Component
 * 
 * Displays merge conflicts with markers and resolution UI.
 * Shows base vs head versions with strategy options.
 * 
 * Story 3.14 - Advanced Git Operations
 */

import React, { useState } from 'react';
import type { ConflictInfo } from '@lionpack/leo-client';

interface ConflictResolutionPanelProps {
  conflicts: ConflictInfo[];
  onResolve: (resolutions: Array<{ file: string; content: string; strategy: 'ours' | 'theirs' | 'manual' }>) => void;
  onCancel: () => void;
}

type ResolutionStrategy = 'ours' | 'theirs' | 'manual';

export const ConflictResolutionPanel: React.FC<ConflictResolutionPanelProps> = ({
  conflicts,
  onResolve,
  onCancel,
}) => {
  const [resolutions, setResolutions] = useState<Map<string, { strategy: ResolutionStrategy; content: string }>>(
    new Map(conflicts.map(c => [c.file, { strategy: 'manual', content: c.content }]))
  );
  const [selectedFile, setSelectedFile] = useState<string>(conflicts[0]?.file || '');

  const handleStrategyChange = (file: string, strategy: ResolutionStrategy) => {
    const conflict = conflicts.find(c => c.file === file);
    if (!conflict) return;

    let content = conflict.content;
    if (strategy === 'ours') {
      content = conflict.ourContent;
    } else if (strategy === 'theirs') {
      content = conflict.theirContent;
    }

    setResolutions(prev => new Map(prev).set(file, { strategy, content }));
  };

  const handleManualEdit = (file: string, content: string) => {
    setResolutions(prev => new Map(prev).set(file, { strategy: 'manual', content }));
  };

  const handleResolveAll = () => {
    const resolvedConflicts = Array.from(resolutions.entries()).map(([file, res]) => ({
      file,
      content: res.content,
      strategy: res.strategy,
    }));
    onResolve(resolvedConflicts);
  };

  const currentConflict = conflicts.find(c => c.file === selectedFile);
  const currentResolution = resolutions.get(selectedFile);

  const hasConflictMarkers = (content: string) => {
    return content.includes('<<<<<<<') && content.includes('>>>>>>>');
  };

  const highlightConflictMarkers = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let className = 'text-slate-800 dark:text-slate-200';
      let bgClassName = '';

      if (line.startsWith('<<<<<<<')) {
        className = 'text-blue-700 dark:text-blue-300 font-bold';
        bgClassName = 'bg-blue-50 dark:bg-blue-900/20';
      } else if (line.startsWith('=======')) {
        className = 'text-purple-700 dark:text-purple-300 font-bold';
        bgClassName = 'bg-purple-50 dark:bg-purple-900/20';
      } else if (line.startsWith('>>>>>>>')) {
        className = 'text-green-700 dark:text-green-300 font-bold';
        bgClassName = 'bg-green-50 dark:bg-green-900/20';
      }

      return (
        <div key={idx} className={`${bgClassName} px-2 py-0.5`}>
          <span className={className}>{line || ' '}</span>
        </div>
      );
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 flex items-center gap-2">
              ⚠️ Merge Conflicts Detected
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400">
              {conflicts.length} file{conflicts.length !== 1 ? 's' : ''} with conflicts
            </p>
          </div>
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            ✕ Cancel
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File List Sidebar */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-y-auto">
          <div className="p-2">
            {conflicts.map((conflict) => {
              const resolution = resolutions.get(conflict.file);
              const isResolved = resolution && !hasConflictMarkers(resolution.content);

              return (
                <button
                  key={conflict.file}
                  onClick={() => setSelectedFile(conflict.file)}
                  className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${
                    selectedFile === conflict.file
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {isResolved ? '✅' : '⚠️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-slate-900 dark:text-white truncate">
                        {conflict.file}
                      </div>
                      {resolution && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Strategy: {resolution.strategy}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Resolution Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentConflict && currentResolution && (
            <>
              {/* Strategy Selector */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Resolution Strategy:
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStrategyChange(selectedFile, 'ours')}
                      className={`px-3 py-1 text-sm rounded ${
                        currentResolution.strategy === 'ours'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      Accept Ours (Current)
                    </button>
                    <button
                      onClick={() => handleStrategyChange(selectedFile, 'theirs')}
                      className={`px-3 py-1 text-sm rounded ${
                        currentResolution.strategy === 'theirs'
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      Accept Theirs (Incoming)
                    </button>
                    <button
                      onClick={() => handleStrategyChange(selectedFile, 'manual')}
                      className={`px-3 py-1 text-sm rounded ${
                        currentResolution.strategy === 'manual'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      Manual Edit
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {currentResolution.strategy === 'manual' ? (
                  <div>
                    <div className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                      Edit the content below to resolve conflicts. Remove conflict markers (&lt;&lt;&lt;&lt;&lt;&lt;&lt;, =======, &gt;&gt;&gt;&gt;&gt;&gt;&gt;).
                    </div>
                    <textarea
                      value={currentResolution.content}
                      onChange={(e) => handleManualEdit(selectedFile, e.target.value)}
                      className="w-full h-96 font-mono text-xs p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      spellCheck={false}
                    />
                    {hasConflictMarkers(currentResolution.content) && (
                      <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                        ⚠️ Conflict markers still present - resolve before continuing
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Resolved Content Preview:
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-3 font-mono text-xs max-h-96 overflow-y-auto">
                        {highlightConflictMarkers(currentResolution.content)}
                      </div>
                    </div>

                    {/* Show comparison */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                          Ours (Current Branch):
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 font-mono text-xs max-h-64 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                            {currentConflict.ourContent}
                          </pre>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                          Theirs (Incoming Branch):
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3 font-mono text-xs max-h-64 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                            {currentConflict.theirContent}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {Array.from(resolutions.values()).filter(r => !hasConflictMarkers(r.content)).length} of {conflicts.length} resolved
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleResolveAll}
            disabled={Array.from(resolutions.values()).some(r => hasConflictMarkers(r.content))}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            Resolve All Conflicts
          </button>
        </div>
      </div>
    </div>
  );
};
