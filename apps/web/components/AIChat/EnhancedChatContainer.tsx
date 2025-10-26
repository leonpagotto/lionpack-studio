/**
 * Enhanced Chat Container with Full Context
 *
 * Integrates:
 * - Filesystem context (Story 3.11)
 * - Mode routing (Story 3.8)
 * - Code generation (Story 3.9)
 * - Multi-provider AI (Story 3.10)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import type { AIMessage } from '@lionpack/leo-client';

// Message types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    intent?: string;
    filesRead?: string[];
    filesModified?: string[];
  };
}

// File operation types
export interface FileOperation {
  type: 'create' | 'modify' | 'delete' | 'rename';
  path: string;
  content?: string;
  newPath?: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  preview?: string;
}

interface EnhancedChatContainerProps {
  showFileContext?: boolean;
  allowFileOperations?: boolean;
}

export const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({
  showFileContext = true,
  allowFileOperations = true,
}) => {
  const {
    filesystem,
    files,
    activeFile,
    filesystemService,
  } = useEditor();

  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: 'Hi! I\'m your AI assistant with full access to your project. I can read files, generate code, and help you build. What would you like to work on?',
    timestamp: new Date(),
  }]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<FileOperation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build context from filesystem
  const buildContext = useCallback((): string => {
    if (!filesystem.isConnected) {
      return 'No filesystem connected. User needs to open a folder or connect to GitHub first.';
    }

    const contextParts: string[] = [];

    // Add source info
    contextParts.push(`Filesystem: ${filesystem.source === 'local' ? 'Local folder' : 'GitHub repository'}`);

    if (filesystem.sourceInfo) {
      contextParts.push(`Source: ${filesystem.sourceInfo.displayName}`);

      if (filesystem.sourceInfo.config && 'owner' in filesystem.sourceInfo.config) {
        // GitHub source
        contextParts.push(`Repository: ${filesystem.sourceInfo.config.owner}/${filesystem.sourceInfo.config.repo}`);
        contextParts.push(`Branch: ${filesystem.sourceInfo.config.branch}`);
      } else if (filesystem.sourceInfo.config && 'rootPath' in filesystem.sourceInfo.config) {
        // Local source
        contextParts.push(`Path: ${filesystem.sourceInfo.config.rootPath}`);
      }
    }

    // Add file tree structure
    if (files.length > 0) {
      contextParts.push(`\nProject files (${files.length} total):`);
      const fileList = files.slice(0, 20).map(f => f.path).join('\n');
      contextParts.push(fileList);
      if (files.length > 20) {
        contextParts.push(`... and ${files.length - 20} more files`);
      }
    }

    // Add active file context
    if (activeFile) {
      contextParts.push(`\nCurrently viewing: ${activeFile.path}`);
      if (activeFile.content) {
        const preview = activeFile.content.split('\n').slice(0, 10).join('\n');
        contextParts.push(`\nFile preview:\n\`\`\`\n${preview}\n${activeFile.content.split('\n').length > 10 ? '...' : ''}\n\`\`\``);
      }
    }

    return contextParts.join('\n');
  }, [filesystem, files, activeFile]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      // Build messages array with context
      const systemContext = buildContext();
      const apiMessages: AIMessage[] = [
        {
          role: 'system',
          content: `You are an AI coding assistant integrated into LionPack Studio.

${systemContext}

You can:
1. Read files from the project
2. Generate new code
3. Modify existing files (with user approval)
4. Answer questions about the codebase

When suggesting file operations, use this format:
<file_operation type="create|modify|delete" path="/path/to/file">
content here
</file_operation>

Be concise and helpful.`
        },
        ...messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        {
          role: 'user',
          content: input,
        }
      ];

      // Call chat API with streaming
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          provider: 'gemini',
          stream: true,
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
      let assistantMessage: ChatMessage = {
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
            const data = line.slice(6);

            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.content) {
                assistantMessage.content += parsed.content;

                if (isFirstChunk) {
                  setMessages(prev => [...prev, assistantMessage]);
                  isFirstChunk = false;
                } else {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIdx = newMessages.length - 1;
                    if (newMessages[lastIdx].role === 'assistant') {
                      newMessages[lastIdx] = { ...assistantMessage };
                    }
                    return newMessages;
                  });
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Parse file operations from response
      if (allowFileOperations) {
        const fileOpRegex = /<file_operation type="(create|modify|delete|rename)" path="([^"]+)">([\s\S]*?)<\/file_operation>/g;
        const operations: FileOperation[] = [];
        let match;

        while ((match = fileOpRegex.exec(assistantMessage.content)) !== null) {
          operations.push({
            type: match[1] as FileOperation['type'],
            path: match[2],
            content: match[3].trim(),
            status: 'pending',
          });
        }

        if (operations.length > 0) {
          setPendingOperations(prev => [...prev, ...operations]);
        }
      }

      setIsStreaming(false);
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, buildContext, allowFileOperations]);

  // Handle file operation approval
  const handleApproveOperation = useCallback(async (operation: FileOperation) => {
    // TODO: Execute file operation using FilesystemAgent
    setPendingOperations(prev =>
      prev.map(op => op === operation ? { ...op, status: 'approved' } : op)
    );
  }, []);

  const handleRejectOperation = useCallback((operation: FileOperation) => {
    setPendingOperations(prev =>
      prev.map(op => op === operation ? { ...op, status: 'rejected' } : op)
    );
  }, []);

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            AI Assistant
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {filesystem.isConnected
              ? `Connected to ${filesystem.source === 'local' ? 'local folder' : 'GitHub'}`
              : 'Not connected - open a folder to get started'
            }
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                }`}
              >
                <div className="prose dark:prose-invert max-w-none">
                  {message.content}
                </div>
                <div className="mt-2 text-xs opacity-60">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isStreaming && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Pending Operations */}
        {pendingOperations.filter(op => op.status === 'pending').length > 0 && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900" data-testid="pending-operations">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Pending File Operations
            </h3>
            <div className="space-y-2">
              {pendingOperations
                .filter(op => op.status === 'pending')
                .map((op, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {op.type.toUpperCase()} {op.path}
                      </div>
                      {op.content && (
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                          {op.content.split('\n').slice(0, 2).join('\n')}
                          {op.content.split('\n').length > 2 && '...'}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleApproveOperation(op)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectOperation(op)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-end space-x-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything about your project..."
              disabled={isStreaming || !filesystem.isConnected}
              className="flex-1 resize-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              rows={3}
            />
            <button
              onClick={handleSendMessage}
              disabled={isStreaming || !input.trim() || !filesystem.isConnected}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isStreaming ? 'Sending...' : 'Send'}
            </button>
          </div>
          {!filesystem.isConnected && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              Connect to a folder or GitHub repository to start chatting
            </p>
          )}
        </div>
      </div>

      {/* File Context Sidebar */}
      {showFileContext && (
        <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 overflow-y-auto" data-testid="file-context-sidebar">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Project Context
          </h3>

          {filesystem.isConnected ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Source
                </div>
                <div className="text-sm text-slate-900 dark:text-white" data-testid="filesystem-source">
                  {filesystem.source === 'local' ? '📁 Local Folder' : '🐙 GitHub'}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Files ({files.length})
                </div>
                <div className="space-y-1">
                  {files.slice(0, 10).map(file => (
                    <div
                      key={file.path}
                      className="text-xs text-slate-700 dark:text-slate-300 font-mono truncate"
                      title={file.path}
                    >
                      {file.path}
                    </div>
                  ))}
                  {files.length > 10 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      ... and {files.length - 10} more
                    </div>
                  )}
                </div>
              </div>

              {activeFile && (
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Active File
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-mono truncate">
                    {activeFile.path}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              No filesystem connected
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedChatContainer;
