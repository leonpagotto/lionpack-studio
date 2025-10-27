import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = 'Type your prompt here... (Shift+Enter for new line, Enter to send)',
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSendMessage(input);
        setInput('');
      }
    }
  };

  const handleSendClick = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 border-2 border-slate-700 rounded-xl
                     bg-slate-800 text-white
                     placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     resize-none max-h-32 min-h-12 transition-all duration-200"
        />
        {input.length > 0 && (
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              {input.length}
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">
            Shift + ⏎
          </kbd>
          <span>for new line</span>
        </div>
        <button
          onClick={handleSendClick}
          disabled={disabled || !input.trim()}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                     active:from-blue-700 active:to-blue-800
                     text-white font-semibold rounded-xl
                     transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                     flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>Send</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
