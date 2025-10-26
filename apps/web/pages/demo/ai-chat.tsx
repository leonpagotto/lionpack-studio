/**
 * AI Chat Demo Page
 *
 * Demonstrates the enhanced AI chat interface with:
 * - Full filesystem context
 * - Mode routing
 * - Code generation
 * - File operations with approval
 */

import React from 'react';
import { EditorProvider } from '../../context/EditorContext';
import { EnhancedChatContainer } from '../../components/AIChat';
import { OpenFolderButton, ConnectGitHubModal, FilesystemStatus } from '../../components/FileSystem';

const AIChatDemo: React.FC = () => {
  const [showGitHubModal, setShowGitHubModal] = React.useState(false);

  return (
    <EditorProvider>
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                🦁 LionPack Studio - AI Chat
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Chat with AI that understands your entire project
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <OpenFolderButton />
              <button
                onClick={() => setShowGitHubModal(true)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 font-medium"
              >
                Connect GitHub
              </button>
            </div>
          </div>

          <div className="mt-4">
            <FilesystemStatus />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <EnhancedChatContainer
            showFileContext={true}
            allowFileOperations={true}
          />
        </div>

        {/* Info Panel */}
        <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-950 border-t border-blue-200 dark:border-blue-800 px-6 py-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
              💡
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Try these prompts:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-blue-700 dark:text-blue-300">
                <div className="bg-white dark:bg-blue-900/50 rounded px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/70">
                  "What files are in this project?"
                </div>
                <div className="bg-white dark:bg-blue-900/50 rounded px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/70">
                  "Create a React button component"
                </div>
                <div className="bg-white dark:bg-blue-900/50 rounded px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/70">
                  "Add TypeScript types to index.ts"
                </div>
                <div className="bg-white dark:bg-blue-900/50 rounded px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/70">
                  "Explain the code in [filename]"
                </div>
                <div className="bg-white dark:bg-blue-900/50 rounded px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/70">
                  "Generate tests for my components"
                </div>
                <div className="bg-white dark:bg-blue-900/50 rounded px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/70">
                  "Refactor this to be more efficient"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Modal */}
        <ConnectGitHubModal
          open={showGitHubModal}
          onClose={() => setShowGitHubModal(false)}
        />
      </div>
    </EditorProvider>
  );
};

export default AIChatDemo;
