/**
 * Documentation Generator Component
 *
 * UI for generating documentation using AI
 * Leverages Morphic's ChatInput and MessageDisplay patterns
 */

import React, { useState } from 'react';
import { aiSuggestionProvider } from '@lionpack/leo-client';
import { ChatInput, MessageDisplay } from '../MorphicChat';

export type DocType = 'jsdoc' | 'tsdoc' | 'readme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DocumentationGeneratorProps {
  code: string;
  language?: string;
  onApply?: (documentation: string) => void;
  onClose?: () => void;
}

export const DocumentationGenerator: React.FC<DocumentationGeneratorProps> = ({
  code,
  language = 'typescript',
  onApply,
  onClose,
}) => {
  const [selectedDocType, setSelectedDocType] = useState<DocType>('jsdoc');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');

  const handleGenerate = async (userPrompt?: string) => {
    const promptToUse = userPrompt || customPrompt || `Generate ${selectedDocType} documentation`;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: promptToUse,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setCustomPrompt('');

    // Generate documentation
    setIsGenerating(true);
    try {
      const context = `Language: ${language}\nDoc type: ${selectedDocType}`;
      const documentation = await aiSuggestionProvider.generateDocumentation(
        code,
        selectedDocType,
        { context }
      );

      setGeneratedDoc(documentation);

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: documentation,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error generating documentation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedDoc && onApply) {
      onApply(generatedDoc);
      if (onClose) onClose();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            📝 Documentation Generator
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            AI-Powered
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Doc Type Selector */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-2">
          {(['jsdoc', 'tsdoc', 'readme'] as DocType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedDocType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedDocType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {selectedDocType === 'jsdoc' && 'Generate JSDoc comments for JavaScript functions'}
          {selectedDocType === 'tsdoc' && 'Generate TSDoc comments for TypeScript code'}
          {selectedDocType === 'readme' && 'Generate README documentation from code'}
        </p>
      </div>

      {/* Code Preview */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
          Code to document:
        </p>
        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-32 p-2 bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
          {code.split('\n').slice(0, 10).join('\n')}
          {code.split('\n').length > 10 && '\n...'}
        </pre>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">📝</div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
              Generate Documentation
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              AI will analyze your code and generate comprehensive {selectedDocType} documentation.
              Click "Generate" or enter a custom prompt below.
            </p>
          </div>
        ) : (
          <MessageDisplay messages={messages} isLoading={isGenerating} />
        )}
      </div>

      {/* Input Area - Leveraging Morphic's ChatInput */}
      <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-3">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              ✨ Generate {selectedDocType.toUpperCase()}
            </button>
            <button
              onClick={() => handleGenerate('Add examples and usage instructions')}
              disabled={isGenerating}
              className="px-3 py-1.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50"
            >
              📖 Include Examples
            </button>
            <button
              onClick={() => handleGenerate('Generate comprehensive documentation with all parameters, return types, and error cases')}
              disabled={isGenerating}
              className="px-3 py-1.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50"
            >
              🔍 Comprehensive
            </button>
          </div>

          {/* Custom Prompt Input */}
          <ChatInput
            onSendMessage={handleGenerate}
            isLoading={isGenerating}
            placeholder="Custom prompt for documentation generation... (optional)"
          />

          {/* Actions */}
          {generatedDoc && (
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedDoc);
                }}
                className="px-3 py-1.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                📋 Copy
              </button>
              {onApply && (
                <button
                  onClick={handleApply}
                  className="px-3 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
                >
                  ✓ Apply Documentation
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
