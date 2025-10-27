/**
 * InlineSuggestion Component
 *
 * Displays Copilot-style inline code suggestions
 * Shows ghost text that can be accepted with Tab or rejected with Esc
 */

import React, { useEffect, useState } from 'react';

interface InlineSuggestionProps {
  suggestion: string;
  position: {
    line: number;
    column: number;
  };
  onAccept: () => void;
  onReject: () => void;
  visible: boolean;
}

export const InlineSuggestion: React.FC<InlineSuggestionProps> = ({
  suggestion,
  position,
  onAccept,
  onReject,
  visible,
}) => {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!visible) return;

    // Show hint after 1 second
    const hintTimer = setTimeout(() => setShowHint(true), 1000);

    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && visible) {
        e.preventDefault();
        onAccept();
      } else if (e.key === 'Escape' && visible) {
        e.preventDefault();
        onReject();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(hintTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onAccept, onReject]);

  if (!visible || !suggestion) {
    return null;
  }

  return (
    <>
      {/* Inline ghost text suggestion */}
      <span className="inline-suggestion">
        <span className="text-slate-400 dark:text-slate-600 italic font-mono text-sm">
          {suggestion}
        </span>
      </span>

      {/* Hint tooltip */}
      {showHint && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-xs flex items-center gap-2 animate-fade-in z-50">
          <span>💡 Copilot suggestion:</span>
          <kbd className="bg-slate-800 px-2 py-1 rounded">Tab</kbd>
          <span>to accept</span>
          <kbd className="bg-slate-800 px-2 py-1 rounded">Esc</kbd>
          <span>to reject</span>
        </div>
      )}

      <style jsx>{`
        .inline-suggestion {
          position: relative;
          display: inline-block;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default InlineSuggestion;
