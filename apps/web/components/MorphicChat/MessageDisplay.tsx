import React, { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MessageDisplayProps {
  messages: Message[];
  isLoading?: boolean;
}

/**
 * Simple markdown parser for code blocks and basic formatting
 */
const parseMarkdown = (text: string) => {
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];

  // Match code blocks with language
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add code block
    parts.push({
      type: 'code',
      content: match[2],
      language: match[1] || 'plaintext',
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: 'text' as const, content: text }];
};

/**
 * Code block component with copy button
 */
const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
      <pre className="bg-slate-900 p-4 overflow-x-auto">
        <code className="text-sm font-mono text-slate-100">{code}</code>
      </pre>
    </div>
  );
};

const MessageDisplay: React.FC<MessageDisplayProps> = ({
  messages,
  isLoading = false,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessageContent = (content: string) => {
    const parts = parseMarkdown(content);

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return <CodeBlock key={index} code={part.content} language={part.language || 'plaintext'} />;
      }

      // Render text with basic formatting
      const lines = part.content.split('\n');
      return (
        <div key={index}>
          {lines.map((line, lineIndex) => {
            // Bold text
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Italic text
            line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
            // Inline code
            line = line.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-slate-800 rounded text-sm font-mono">$1</code>');

            return (
              <p
                key={lineIndex}
                className="whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
              />
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          } animate-fadeIn`}
        >
          <div
            className={`max-w-[85%] ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md'
                : 'bg-slate-800 text-slate-100 rounded-2xl rounded-bl-md border border-slate-700'
            } shadow-lg`}
          >
            <div className="px-4 py-3">
              {message.role === 'assistant' ? (
                renderMessageContent(message.content)
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>
            <div className="px-4 pb-2">
              <p
                className={`text-xs ${
                  message.role === 'user'
                    ? 'text-blue-100'
                    : 'text-slate-500'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-sm text-slate-400">AI is thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDisplay;
