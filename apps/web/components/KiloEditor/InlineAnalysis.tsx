/**
 * Inline Analysis Component
 *
 * Displays code issues inline with underlines and tooltips
 * Integrates with the AnalysisEngine to show real-time feedback
 */

import React, { useState } from 'react';
import { CodeIssue } from '@lionpack/leo-client/src/lib/intelligence/types';

interface InlineAnalysisProps {
  code: string;
  issues: CodeIssue[];
  onApplyFix?: (issue: CodeIssue, fixIndex: number) => void;
  onIgnoreIssue?: (issue: CodeIssue) => void;
}

export const InlineAnalysis: React.FC<InlineAnalysisProps> = ({
  code,
  issues,
  onApplyFix,
  onIgnoreIssue,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<CodeIssue | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const lines = code.split('\n');

  const getIssuesForLine = (lineNum: number): CodeIssue[] => {
    return issues.filter(issue => issue.line === lineNum);
  };

  const getUnderlineColor = (type: CodeIssue['type']): string => {
    switch (type) {
      case 'error':
        return 'decoration-red-500';
      case 'warning':
        return 'decoration-yellow-500';
      case 'suggestion':
        return 'decoration-blue-500';
      case 'info':
        return 'decoration-gray-500';
      default:
        return 'decoration-gray-500';
    }
  };

  const getIssueBadge = (type: CodeIssue['type']): { bg: string; text: string; icon: string } => {
    switch (type) {
      case 'error':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-200', icon: '🔴' };
      case 'warning':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200', icon: '🟡' };
      case 'suggestion':
        return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200', icon: '🔵' };
      case 'info':
        return { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-200', icon: '⚪' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-200', icon: '⚪' };
    }
  };

  const handleLineClick = (lineNum: number, lineIssues: CodeIssue[]) => {
    if (lineIssues.length === 0) {
      setSelectedIssue(null);
      setSelectedLine(null);
      return;
    }

    setSelectedLine(lineNum);
    // Show the first (most severe) issue by default
    const sortedIssues = [...lineIssues].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
    });
    setSelectedIssue(sortedIssues[0]);
  };

  const handleApplyFix = (fixIndex: number) => {
    if (selectedIssue && onApplyFix) {
      onApplyFix(selectedIssue, fixIndex);
      setSelectedIssue(null);
      setSelectedLine(null);
    }
  };

  const handleIgnore = () => {
    if (selectedIssue && onIgnoreIssue) {
      onIgnoreIssue(selectedIssue);
      setSelectedIssue(null);
      setSelectedLine(null);
    }
  };

  return (
    <div className="relative">
      {/* Code lines with issue indicators */}
      {lines.map((line, index) => {
        const lineNum = index + 1;
        const lineIssues = getIssuesForLine(lineNum);
        const hasIssues = lineIssues.length > 0;
        const isSelected = selectedLine === lineNum;
        const mostSevereIssue = lineIssues[0];

        return (
          <div
            key={lineNum}
            className={`flex group ${hasIssues ? 'cursor-pointer' : ''} ${
              isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-900/20'
            }`}
            onClick={() => handleLineClick(lineNum, lineIssues)}
          >
            {/* Line number */}
            <span className="select-none w-12 text-right pr-4 text-slate-500 dark:text-slate-600 bg-slate-50 dark:bg-slate-900 text-xs flex items-center justify-end">
              {hasIssues && (
                <span className="mr-1 text-xs">
                  {getIssueBadge(mostSevereIssue.type).icon}
                </span>
              )}
              {lineNum}
            </span>

            {/* Code content with underline */}
            <span
              className={`flex-1 text-sm font-mono ${
                hasIssues
                  ? `underline decoration-wavy decoration-2 ${getUnderlineColor(mostSevereIssue.type)}`
                  : ''
              }`}
            >
              {line || '\u00A0'}
            </span>

            {/* Issue count badge (shows on hover if multiple issues) */}
            {lineIssues.length > 1 && (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 text-xs text-slate-500">
                {lineIssues.length} issues
              </span>
            )}
          </div>
        );
      })}

      {/* Quick Fix Menu */}
      {selectedIssue && selectedLine && (
        <div
          className="absolute z-10 mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
          style={{
            top: `${selectedLine * 20}px`, // Approximate line height
            left: '20%',
          }}
        >
          {/* Issue header */}
          <div className={`px-4 py-3 border-b border-slate-200 dark:border-slate-700 ${getIssueBadge(selectedIssue.type).bg}`}>
            <div className="flex items-start gap-2">
              <span className="text-lg">{getIssueBadge(selectedIssue.type).icon}</span>
              <div className="flex-1">
                <h4 className={`text-sm font-semibold ${getIssueBadge(selectedIssue.type).text}`}>
                  {selectedIssue.type.charAt(0).toUpperCase() + selectedIssue.type.slice(1)}
                  {' • '}
                  {selectedIssue.category}
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  {selectedIssue.message}
                </p>
                {selectedIssue.ruleId && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Rule: {selectedIssue.ruleId}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick fixes */}
          {selectedIssue.quickFixes && selectedIssue.quickFixes.length > 0 && (
            <div className="p-3">
              <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Quick Fixes
              </h5>
              {selectedIssue.quickFixes.map((fix, index) => (
                <button
                  key={index}
                  onClick={() => handleApplyFix(index)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 mb-1"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm">
                      {fix.category === 'auto-fix' ? '⚡' : fix.category === 'refactor' ? '♻️' : '💡'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {fix.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {fix.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <button
              onClick={handleIgnore}
              className="flex-1 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            >
              Ignore
            </button>
            <button
              onClick={() => setSelectedIssue(null)}
              className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
