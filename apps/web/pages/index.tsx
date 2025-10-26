/**
 * LionPack Studio - Main Application Page
 *
 * VS Code + Copilot-like integrated development environment
 * Combines Kilo Code editor with Morphic AI chat and code intelligence
 *
 * Layout:
 * - Left Sidebar: File explorer and project navigation
 * - Center: Split-pane code editor with intelligence features
 * - Right Sidebar: AI Chat assistant (collapsible)
 * - Bottom Panel: Terminal, test results, problems
 */

import React, { useState } from 'react';
import Head from 'next/head';
import { SplitPane, FileTree, CodeEditor, Terminal } from '../components/KiloEditor';
import { ChatContainer, type GeneratedCode } from '../components/MorphicChat';
import type { CodeFile } from '../components/KiloEditor/CodeEditor';
import type { FileNode } from '../components/KiloEditor/FileTree';

export default function Home() {
  // UI State
  const [showAIChat, setShowAIChat] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState<'terminal' | 'problems' | 'tests'>('terminal');

  // Editor State
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  // Sample file tree
  const [files] = useState<FileNode[]>([
    {
      path: 'src',
      content: '',
      language: 'folder',
      isDirectory: true,
      children: [
        {
          path: 'src/components',
          content: '',
          language: 'folder',
          isDirectory: true,
          children: [
            { path: 'src/components/Button.tsx', content: '', language: 'typescript' },
            { path: 'src/components/Card.tsx', content: '', language: 'typescript' },
            { path: 'src/components/Modal.tsx', content: '', language: 'typescript' },
          ],
        },
        {
          path: 'src/utils',
          content: '',
          language: 'folder',
          isDirectory: true,
          children: [
            { path: 'src/utils/helpers.ts', content: '', language: 'typescript' },
            { path: 'src/utils/api.ts', content: '', language: 'typescript' },
          ],
        },
        { path: 'src/App.tsx', content: '', language: 'typescript' },
        { path: 'src/index.tsx', content: '', language: 'typescript' },
      ],
    },
    {
      path: 'tests',
      content: '',
      language: 'folder',
      isDirectory: true,
      children: [
        { path: 'tests/Button.test.tsx', content: '', language: 'typescript' },
        { path: 'tests/integration.test.tsx', content: '', language: 'typescript' },
      ],
    },
    { path: 'package.json', content: '', language: 'json' },
    { path: 'README.md', content: '', language: 'markdown' },
    { path: 'tsconfig.json', content: '', language: 'json' },
  ]);

  const handleFileSelect = (file: FileNode) => {
    if (file.isDirectory) return;

    setIsLoadingFile(true);

    // Simulate file loading
    setTimeout(() => {
      const mockContent = getSampleFileContent(file.path);
      setSelectedFile({
        path: file.path,
        content: mockContent,
        language: file.language,
      });
      setIsLoadingFile(false);
    }, 300);
  };

  const handleAIGenerate = (generatedCode: GeneratedCode) => {
    // When AI generates code, update the editor with the first file
    if (generatedCode.files && generatedCode.files.length > 0) {
      const firstFile = generatedCode.files[0];
      setSelectedFile({
        path: firstFile.path,
        content: firstFile.content,
        language: firstFile.language,
      });

      // Add terminal output
      setTerminalOutput(prev => [
        ...prev,
        `✓ Generated ${generatedCode.files.length} file(s)`,
        ...generatedCode.files.map(f => `  - ${f.path}`),
      ]);
    }
  };  return (
    <>
      <Head>
        <title>LionPack Studio - Development Culture in a Box</title>
        <meta
          name="description"
          content="AI-powered development environment with integrated code intelligence"
        />
      </Head>

      <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="flex-shrink-0 h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
          {/* Left: Logo and Menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl">🦁</div>
              <span className="font-bold text-lg">LionPack Studio</span>
            </div>

            <nav className="flex items-center gap-1 text-sm">
              <button className="px-3 py-1 hover:bg-slate-800 rounded">File</button>
              <button className="px-3 py-1 hover:bg-slate-800 rounded">Edit</button>
              <button className="px-3 py-1 hover:bg-slate-800 rounded">View</button>
              <button className="px-3 py-1 hover:bg-slate-800 rounded">Go</button>
              <button className="px-3 py-1 hover:bg-slate-800 rounded">Run</button>
              <button className="px-3 py-1 hover:bg-slate-800 rounded">Terminal</button>
              <button className="px-3 py-1 hover:bg-slate-800 rounded">Help</button>
            </nav>
          </div>

          {/* Right: Project name and actions */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">lionpack-studio</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAIChat(!showAIChat)}
                className={`p-2 rounded ${showAIChat ? 'bg-blue-600' : 'bg-slate-800'} hover:bg-blue-500 transition-colors`}
                title="Toggle AI Assistant"
              >
                <span className="text-lg">🤖</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - File Explorer */}
          {showSidebar && (
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
              {/* Sidebar Header */}
              <div className="flex-shrink-0 h-10 flex items-center justify-between px-3 border-b border-slate-800">
                <span className="text-xs font-semibold uppercase text-slate-400">Explorer</span>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-slate-400 hover:text-white"
                  title="Close sidebar"
                >
                  ✕
                </button>
              </div>

              {/* File Tree */}
              <div className="flex-1 overflow-auto">
                <div className="p-2">
                  <div className="mb-2 px-2 py-1 text-xs font-semibold text-slate-400 uppercase">
                    Project Files
                  </div>
                  <FileTree files={files} onSelectFile={handleFileSelect} />
                </div>
              </div>

              {/* Sidebar Footer - Quick Actions */}
              <div className="flex-shrink-0 border-t border-slate-800 p-2 space-y-1">
                <button className="w-full px-3 py-2 text-left text-sm bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-2">
                  <span>📁</span> Open Folder
                </button>
                <button className="w-full px-3 py-2 text-left text-sm bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-2">
                  <span>➕</span> New File
                </button>
              </div>
            </aside>
          )}

          {/* Show Sidebar Button (when collapsed) */}
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="w-8 bg-slate-900 border-r border-slate-800 hover:bg-slate-800 flex items-center justify-center"
              title="Show sidebar"
            >
              <span className="text-slate-400">›</span>
            </button>
          )}

          {/* Center - Code Editor */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Editor Tabs */}
            {selectedFile && (
              <div className="flex-shrink-0 h-10 bg-slate-900 border-b border-slate-800 flex items-center px-2 gap-1">
                <div className="px-3 py-1 bg-slate-950 text-sm rounded-t flex items-center gap-2">
                  <span>{getFileIcon(selectedFile.path)}</span>
                  <span>{selectedFile.path.split('/').pop()}</span>
                  <button className="text-slate-400 hover:text-white ml-2">✕</button>
                </div>
              </div>
            )}

            {/* Code Editor Area */}
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                file={selectedFile}
                isLoading={isLoadingFile}
                enableIntelligence={true}
              />
            </div>

            {/* Bottom Panel */}
            {showBottomPanel && (
              <div className="flex-shrink-0 h-64 bg-slate-900 border-t border-slate-800 flex flex-col">
                {/* Bottom Panel Tabs */}
                <div className="flex-shrink-0 h-10 flex items-center justify-between px-2 border-b border-slate-800">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveBottomTab('terminal')}
                      className={`px-3 py-1 text-sm ${
                        activeBottomTab === 'terminal'
                          ? 'text-white border-b-2 border-blue-500'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Terminal
                    </button>
                    <button
                      onClick={() => setActiveBottomTab('problems')}
                      className={`px-3 py-1 text-sm ${
                        activeBottomTab === 'problems'
                          ? 'text-white border-b-2 border-blue-500'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Problems
                    </button>
                    <button
                      onClick={() => setActiveBottomTab('tests')}
                      className={`px-3 py-1 text-sm ${
                        activeBottomTab === 'tests'
                          ? 'text-white border-b-2 border-blue-500'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Test Results
                    </button>
                  </div>
                  <button
                    onClick={() => setShowBottomPanel(false)}
                    className="text-slate-400 hover:text-white"
                    title="Close panel"
                  >
                    ✕
                  </button>
                </div>

                {/* Bottom Panel Content */}
                <div className="flex-1 overflow-auto">
                  {activeBottomTab === 'terminal' && (
                    <Terminal output={terminalOutput} />
                  )}
                  {activeBottomTab === 'problems' && (
                    <div className="p-4 text-sm text-slate-400">
                      No problems detected
                    </div>
                  )}
                  {activeBottomTab === 'tests' && (
                    <div className="p-4 text-sm text-slate-400">
                      No tests run yet
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show Bottom Panel Button (when collapsed) */}
            {!showBottomPanel && (
              <button
                onClick={() => setShowBottomPanel(true)}
                className="h-8 bg-slate-900 border-t border-slate-800 hover:bg-slate-800 text-xs text-slate-400 hover:text-white"
                title="Show panel"
              >
                Show Panel
              </button>
            )}
          </main>

          {/* Right Sidebar - AI Chat Assistant */}
          {showAIChat && (
            <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col">
              {/* AI Chat Header */}
              <div className="flex-shrink-0 h-10 flex items-center justify-between px-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <span className="text-sm font-semibold">AI Assistant</span>
                  <span className="px-2 py-0.5 text-xs bg-blue-600 rounded">Copilot</span>
                </div>
                <button
                  onClick={() => setShowAIChat(false)}
                  className="text-slate-400 hover:text-white"
                  title="Close AI chat"
                >
                  ✕
                </button>
              </div>

              {/* AI Chat Content */}
              <div className="flex-1 overflow-hidden">
                <ChatContainer onCodeGenerated={handleAIGenerate} />
              </div>
            </aside>
          )}
        </div>

        {/* Status Bar */}
        <footer className="flex-shrink-0 h-6 bg-blue-600 flex items-center justify-between px-3 text-xs">
          <div className="flex items-center gap-4">
            <span>✓ No errors</span>
            <span>⚠ 0 warnings</span>
            {selectedFile && (
              <>
                <span className="text-slate-200">|</span>
                <span>{selectedFile.language}</span>
                <span>{selectedFile.content.split('\n').length} lines</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>🤖 Gemini Flash</span>
            <span>⚡ Code Intelligence: ON</span>
          </div>
        </footer>
      </div>
    </>
  );
}

// Helper functions
function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'json': 'json',
    'md': 'markdown',
    'css': 'css',
    'scss': 'scss',
    'html': 'html',
  };
  return langMap[ext || ''] || 'plaintext';
}

function getFileIcon(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    'ts': '📘',
    'tsx': '⚛️',
    'js': '📜',
    'jsx': '⚛️',
    'json': '📋',
    'md': '📝',
    'css': '🎨',
    'scss': '🎨',
    'html': '🌐',
  };
  return iconMap[ext || ''] || '📄';
}

function getSampleFileContent(path: string): string {
  // Sample content for demo
  if (path.includes('Button')) {
    return `import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}) => {
  return (
    <button
      className={\`btn btn-\${variant} btn-\${size}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
`;
  }

  if (path.includes('helpers')) {
    return `export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
`;
  }

  if (path.includes('README')) {
    return `# LionPack Studio

Development Culture in a Box - AI-powered development environment

## Features

- 🤖 **AI Code Intelligence** - Real-time suggestions and refactoring
- 📝 **Auto Documentation** - Generate docs with one click
- 🧪 **Smart Testing** - AI-powered test generation
- ⚡ **Fast Development** - Speed meets structure

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Architecture

Built with:
- Next.js 14
- TypeScript
- Tailwind CSS
- Google Gemini AI
`;
  }

  return `// Select a file from the explorer to view its contents
// Or use AI chat to generate new code!

console.log('Welcome to LionPack Studio! 🦁');
`;
}
