/**
 * ReviewCommentThread Component
 * 
 * Displays PR review comment threads.
 * Shows inline comments with reply functionality.
 * 
 * Story 3.14 - Advanced Git Operations
 */

import React, { useState } from 'react';

interface ReviewComment {
  path: string;
  line: number;
  body: string;
}

interface ReviewData {
  prNumber: number;
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
  comments: ReviewComment[];
  body: string;
}

interface ReviewCommentThreadProps {
  review: ReviewData;
  onSubmit: () => void;
  onCancel: () => void;
}

export const ReviewCommentThread: React.FC<ReviewCommentThreadProps> = ({
  review,
  onSubmit,
  onCancel,
}) => {
  const [selectedComment, setSelectedComment] = useState<number>(0);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set(review.comments.map((_, i) => i)));

  const toggleComment = (index: number) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'APPROVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'REQUEST_CHANGES':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'COMMENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'APPROVE':
        return '✅';
      case 'REQUEST_CHANGES':
        return '❌';
      case 'COMMENT':
        return '💬';
      default:
        return '📝';
    }
  };

  const getEventLabel = (event: string) => {
    switch (event) {
      case 'APPROVE':
        return 'Approve';
      case 'REQUEST_CHANGES':
        return 'Request Changes';
      case 'COMMENT':
        return 'Comment';
      default:
        return 'Review';
    }
  };

  // Group comments by file
  const commentsByFile = review.comments.reduce((acc, comment, index) => {
    if (!acc[comment.path]) {
      acc[comment.path] = [];
    }
    acc[comment.path].push({ ...comment, index });
    return acc;
  }, {} as Record<string, Array<ReviewComment & { index: number }>>);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className={`px-4 py-3 border-b ${getEventColor(review.event)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {getEventIcon(review.event)} PR Review #{review.prNumber}
            </h3>
            <p className="text-sm mt-1">
              {getEventLabel(review.event)} • {review.comments.length} inline comment{review.comments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm hover:opacity-70"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Review Summary */}
        {review.body && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Review Summary:
            </div>
            <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {review.body}
            </div>
          </div>
        )}

        {/* Comments by File */}
        <div className="p-4 space-y-4">
          {Object.entries(commentsByFile).map(([filePath, comments]) => (
            <div key={filePath} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              {/* File Header */}
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-400">📄</span>
                  <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                    {filePath}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    ({comments.length} comment{comments.length !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              {/* Comments */}
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {comments.map((comment) => {
                  const isExpanded = expandedComments.has(comment.index);

                  return (
                    <div key={comment.index} className="bg-white dark:bg-slate-900">
                      {/* Comment Header */}
                      <button
                        onClick={() => toggleComment(comment.index)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">💬</span>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              Line {comment.line}
                            </div>
                            {!isExpanded && (
                              <div className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-md">
                                {comment.body}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-slate-400 dark:text-slate-500">
                          {isExpanded ? '▼' : '▶'}
                        </div>
                      </button>

                      {/* Comment Body */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 bg-slate-50 dark:bg-slate-800/50">
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-3">
                            <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                              {comment.body}
                            </div>
                          </div>

                          {/* Code Context (simulated) */}
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Code Context:
                            </div>
                            <div className="bg-slate-900 dark:bg-slate-950 border border-slate-700 rounded p-2 font-mono text-xs">
                              <div className="text-slate-500">
                                <span className="inline-block w-8 text-right mr-2">{Math.max(1, comment.line - 1)}</span>
                                <span className="text-slate-400">// Previous line</span>
                              </div>
                              <div className="bg-yellow-500/20 text-yellow-200">
                                <span className="inline-block w-8 text-right mr-2 font-bold text-yellow-400">{comment.line}</span>
                                <span>{'  '}// Code at this line ← Comment here</span>
                              </div>
                              <div className="text-slate-500">
                                <span className="inline-block w-8 text-right mr-2">{comment.line + 1}</span>
                                <span className="text-slate-400">// Next line</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {review.comments.length} comment{review.comments.length !== 1 ? 's' : ''} across {Object.keys(commentsByFile).length} file{Object.keys(commentsByFile).length !== 1 ? 's' : ''}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className={`px-4 py-2 text-sm rounded text-white ${
              review.event === 'APPROVE'
                ? 'bg-green-600 hover:bg-green-700'
                : review.event === 'REQUEST_CHANGES'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Submit {getEventLabel(review.event)}
          </button>
        </div>
      </div>
    </div>
  );
};
