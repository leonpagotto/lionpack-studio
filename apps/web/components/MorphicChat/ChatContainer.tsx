import React, { useCallback, useRef, useEffect, useState } from 'react';
import ChatInput from './ChatInput';
import MessageDisplay from './MessageDisplay';
import AIProviderSelector from '../AIProviderSelector';

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
  onGenerateStart?: () => void;
  apiEndpoint?: string;
  provider?: 'gemini' | 'claude' | 'gpt';
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  onCodeGenerated,
  onGenerateStart,
  apiEndpoint = '/api/chat',
  provider: initialProvider = 'gemini',
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);
  
  // AI Provider selection state
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'claude' | 'gpt'>(initialProvider);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  // Load provider preferences from localStorage
  useEffect(() => {
    const savedProvider = localStorage.getItem('lionpack-ai-provider') as 'gemini' | 'claude' | 'gpt' | null;
    const savedModel = localStorage.getItem('lionpack-ai-model');
    
    if (savedProvider) {
      setSelectedProvider(savedProvider);
    }
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);
  
  // Save provider preferences to localStorage
  useEffect(() => {
    localStorage.setItem('lionpack-ai-provider', selectedProvider);
    if (selectedModel) {
      localStorage.setItem('lionpack-ai-model', selectedModel);
    }
  }, [selectedProvider, selectedModel]);

  // Suggested prompts for new users
  const suggestedPrompts = [
    "Create a React button component with hover effects",
    "Write a TypeScript function to validate email addresses",
    "Generate a simple todo list component",
    "Explain how async/await works in JavaScript",
    "Create a REST API endpoint with error handling",
  ];

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

      // Notify parent that generation has started
      onGenerateStart?.();

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
            provider: selectedProvider,
            model: selectedModel || undefined,
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
    [apiEndpoint, selectedProvider, selectedModel, onCodeGenerated, onGenerateStart]
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-lg border border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  AI Assistant
                </h2>
                <p className="text-xs text-slate-400">
                  Powered by Google Gemini
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Provider Selector */}
      <div className="flex-shrink-0 border-b border-slate-800 bg-slate-900/30">
        <AIProviderSelector
          currentProvider={selectedProvider}
          currentModel={selectedModel || undefined}
          onProviderChange={(provider, model) => {
            setSelectedProvider(provider as 'gemini' | 'claude' | 'gpt');
            setSelectedModel(model);
          }}
          compact={true}
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-3xl">✨</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Let's build something amazing!
              </h3>
              <p className="text-slate-400 mb-4 max-w-md">
                Describe what you want to create, and I'll help you generate clean, production-ready code.
              </p>
            </div>

            {/* Suggested Prompts */}
            <div className="w-full max-w-2xl space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                Try these prompts
              </p>
              <div className="grid gap-2">
                {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-lg text-left text-sm text-slate-300 transition-all duration-200 hover:scale-[1.02]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
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
        <div className="mx-6 mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400 mb-1">Something went wrong</p>
              <p className="text-xs text-red-300/80">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={isLoading}
          placeholder="Describe what you want to build... (Shift+Enter for new line)"
        />
      </div>
    </div>
  );
};

export default ChatContainer;
