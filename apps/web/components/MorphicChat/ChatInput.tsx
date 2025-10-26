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
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg
                   bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                   placeholder-slate-500 dark:placeholder-slate-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                   disabled:opacity-50 disabled:cursor-not-allowed
                   resize-none max-h-32 min-h-12"
      />
      <div className="flex gap-2 justify-between items-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {input.length > 0 ? (
            <>
              <span className="font-semibold">{input.length}</span> characters
            </>
          ) : (
            'Ready for input'
          )}
        </p>
        <button
          onClick={handleSendClick}
          disabled={disabled || !input.trim()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                     text-white font-medium rounded-lg
                     transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <span>Send</span>
              <span className="text-xs">⏎</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
