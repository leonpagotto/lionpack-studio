import React, { useCallback, useRef, useEffect, useState } from 'react';
import ChatInput from './ChatInput';
import MessageDisplay from './MessageDisplay';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GeneratedCode {
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  tests?: {
    passed: number;
    failed: number;
    total: number;
  };
  metrics?: {
    complexity: string;
    performance: string;
  };
}

interface ChatContainerProps {
  onCodeGenerated?: (code: GeneratedCode) => void;
  apiEndpoint?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  onCodeGenerated,
  apiEndpoint = '/api/generate-code',
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Add user message
      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // Call generate-code API with streaming
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: content,
            model: 'claude-3-5-sonnet-20241022',
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response stream');
        }

        const decoder = new TextDecoder();
        let assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };

        let isFirstChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'text') {
                  assistantMessage.content += data.content;

                  if (isFirstChunk) {
                    setMessages((prev) => [...prev, assistantMessage]);
                    isFirstChunk = false;
                  } else {
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastIdx = newMessages.length - 1;
                      if (newMessages[lastIdx].role === 'assistant') {
                        newMessages[lastIdx] = {
                          ...assistantMessage,
                        };
                      }
                      return newMessages;
                    });
                  }
                } else if (data.type === 'code') {
                  // Parse generated code
                  try {
                    const generatedCode = JSON.parse(data.content);
                    if (onCodeGenerated) {
                      onCodeGenerated(generatedCode);
                    }
                  } catch {
                    // Code might not be valid JSON initially
                  }
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setIsLoading(false);

        // Add error message to chat
        const errorMsg: Message = {
          id: `msg-${Date.now()}-error`,
          role: 'assistant',
          content: `Error: ${errorMessage}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    },
    [apiEndpoint, onCodeGenerated]
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Code Generator
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Describe what you want to build
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                Start by describing your code requirements
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                E.g., "Create a React button component with hover effects"
              </p>
            </div>
          </div>
        ) : (
          <>
            <MessageDisplay messages={messages} isLoading={isLoading} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-slate-200 dark:border-slate-800">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
