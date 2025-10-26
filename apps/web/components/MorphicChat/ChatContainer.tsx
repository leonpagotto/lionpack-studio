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
  provider?: 'gemini' | 'claude' | 'gpt';
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  onCodeGenerated,
  apiEndpoint = '/api/chat',
  provider = 'gemini',
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // System message to guide AI for code generation
  const systemMessage = {
    role: 'system' as const,
    content: `You are an expert software developer assistant in LionPack Studio. 
Your role is to help users:
1. Generate clean, well-structured code
2. Provide code examples and explanations
3. Suggest best practices and improvements
4. Answer technical questions

When generating code:
- Use TypeScript by default
- Follow modern best practices
- Include helpful comments
- Provide working, tested examples
- Consider edge cases and error handling

Be concise but thorough. Format code in markdown code blocks with language identifiers.`
  };

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
        // Build conversation history using ref for current state
        const conversationMessages = [
          systemMessage,
          ...messagesRef.current.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user' as const,
            content
          }
        ];

        // Call chat API with streaming
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: conversationMessages,
            provider,
            stream: true,
            temperature: 0.7,
            maxTokens: 2048,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${response.statusText}`);
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
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.error) {
                  throw new Error(parsed.error);
                }

                if (parsed.content) {
                  assistantMessage.content += parsed.content;

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
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', data, parseError);
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
    [apiEndpoint, provider, onCodeGenerated]
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
