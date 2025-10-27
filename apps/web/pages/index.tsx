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

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { SplitPane, FileTree, Terminal } from '../components/KiloEditor';
import MonacoCodeEditor from '../components/KiloEditor/MonacoCodeEditor';
import { ChatContainer, type GeneratedCode } from '../components/MorphicChat';
import { EditorProvider } from '../context/EditorContext';
import { CopilotStatus } from '../components/Copilot/CopilotStatus';
import { MenuBar } from '../components/MenuBar/MenuBar';
import { useFileSystem } from '../hooks/useFileSystem';
import type { CodeFile } from '../components/KiloEditor/MonacoCodeEditor';
import type { FileNode } from '../components/KiloEditor/FileTree';

export default function Home() {
  // File System Hook
  const fileSystem = useFileSystem();

  // UI State
  const [showAIChat, setShowAIChat] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState<'terminal' | 'problems' | 'tests'>('terminal');

  // Editor State
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load root directory on mount
  useEffect(() => {
    loadDirectory('.');
  }, []);

  const loadDirectory = async (path: string) => {
    try {
      const fileList = await fileSystem.listDirectory(path);

      // Convert to FileNode structure
      const fileNodes: FileNode[] = fileList.map(file => ({
        path: file.path,
        content: '',
        language: file.type === 'directory' ? 'folder' : getLanguageFromPath(file.path),
        isDirectory: file.type === 'directory',
        children: file.type === 'directory' ? [] : undefined,
      }));

      setFiles(fileNodes);

      setTerminalOutput(prev => [
        ...prev,
        `✓ Loaded ${fileNodes.length} items from ${path}`,
      ]);
    } catch (error) {
      setTerminalOutput(prev => [
        ...prev,
        `✗ Failed to load directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ]);
    }
  };

  // Handle native folder picker
  const handleOpenFolder = async () => {
    try {
      setTerminalOutput(prev => [...prev, '📂 Opening folder picker...']);

      const fileList = await fileSystem.openFolderPicker();

      // Convert to FileNode structure
      const fileNodes: FileNode[] = fileList.map(file => ({
        path: file.path,
        content: '',
        language: file.type === 'directory' ? 'folder' : getLanguageFromPath(file.path),
        isDirectory: file.type === 'directory',
        children: file.type === 'directory' ? [] : undefined,
      }));

      setFiles(fileNodes);

      setTerminalOutput(prev => [
        ...prev,
        `✓ Opened folder with ${fileNodes.length} items`,
      ]);
    } catch (error) {
      setTerminalOutput(prev => [
        ...prev,
        `✗ Failed to open folder: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ]);
    }
  };

  const handleFileSelect = async (file: FileNode) => {
    if (file.isDirectory) {
      // Load directory contents
      await loadDirectory(file.path);
      return;
    }

    setIsLoadingFile(true);

    try {
      const fileContent = await fileSystem.readFile(file.path);

      setSelectedFile({
        path: file.path,
        content: fileContent.content,
        language: getLanguageFromPath(file.path),
      });

      setHasUnsavedChanges(false);

      setTerminalOutput(prev => [
        ...prev,
        `✓ Opened ${file.path}`,
      ]);
    } catch (error) {
      setTerminalOutput(prev => [
        ...prev,
        `✗ Failed to open file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ]);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleFileSave = useCallback(async () => {
    if (!selectedFile) return;

    try {
      await fileSystem.writeFile(selectedFile.path, selectedFile.content);
      setHasUnsavedChanges(false);

      setTerminalOutput(prev => [
        ...prev,
        `✓ Saved ${selectedFile.path}`,
      ]);
    } catch (error) {
      setTerminalOutput(prev => [
        ...prev,
        `✗ Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ]);
    }
  }, [selectedFile, fileSystem]);

  // Handle Cmd/Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleFileSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFileSave]);

  const handleAIGenerate = (generatedCode: GeneratedCode) => {
    // Clear AI generating state
    setIsAIGenerating(false);

    // When AI generates code, update the editor with the first file
    if (generatedCode.files && generatedCode.files.length > 0) {
      const firstFile = generatedCode.files[0];

      // Update the selected file in the editor
      setSelectedFile({
        path: firstFile.path,
        content: firstFile.content,
        language: firstFile.language,
      });

      // Mark as unsaved (user can choose to save)
      setHasUnsavedChanges(true);

      // Add all generated files to the file tree
      const newFiles: FileNode[] = generatedCode.files.map(file => ({
        path: file.path,
        content: file.content,
        language: file.language,
        isDirectory: false,
      }));

      // Merge with existing files (avoid duplicates)
      setFiles(prevFiles => {
        const existingPaths = new Set(prevFiles.map(f => f.path));
        const uniqueNewFiles = newFiles.filter(f => !existingPaths.has(f.path));
        return [...prevFiles, ...uniqueNewFiles];
      });

      // Add comprehensive terminal output
      setTerminalOutput(prev => [
        ...prev,
        `🤖 AI Generated ${generatedCode.files.length} file(s):`,
        ...generatedCode.files.map((f, i) =>
          `  ${i === 0 ? '✓' : '•'} ${f.path} (${f.content.length} bytes)${i === 0 ? ' [Opened in editor]' : ''}`
        ),
        generatedCode.files.length > 1 ? '💡 Tip: Check the file tree for all generated files' : '',
      ].filter(Boolean));

      // Show success notification in bottom panel
      setActiveBottomTab('terminal');
      setShowBottomPanel(true);
    } else {
      // Handle empty generation
      setTerminalOutput(prev => [
        ...prev,
        '⚠️ AI generated no files - please try a different prompt',
      ]);
    }
  };

  const handleAIGenerateStart = () => {
    setIsAIGenerating(true);
    setTerminalOutput(prev => [
      ...prev,
      '🔄 AI is generating code...',
    ]);
  };  return (
    <EditorProvider>
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

            <MenuBar
              onNewFile={() => setTerminalOutput(prev => [...prev, '⚠ New File not yet implemented'])}
              onSaveFile={handleFileSave}
              onOpenFolder={handleOpenFolder}
              onToggleSidebar={() => setShowSidebar(!showSidebar)}
              onToggleTerminal={() => setShowBottomPanel(!showBottomPanel)}
              onToggleAIChat={() => setShowAIChat(!showAIChat)}
              onRunFile={() => setTerminalOutput(prev => [...prev, '⚠ Run File not yet implemented'])}
              onFindInFiles={() => setTerminalOutput(prev => [...prev, '⚠ Find in Files not yet implemented'])}
            />
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
                <button
                  onClick={() => loadDirectory('.')}
                  className="w-full px-3 py-2 text-left text-sm bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-2"
                >
                  <span>�</span> Refresh
                </button>
                <button
                  onClick={handleFileSave}
                  disabled={!selectedFile || !hasUnsavedChanges}
                  className="w-full px-3 py-2 text-left text-sm bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>💾</span> Save {hasUnsavedChanges && '(Cmd/Ctrl+S)'}
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
            <div className="flex-1 overflow-hidden relative">
              {/* AI Generating Banner */}
              {isAIGenerating && (
                <div className="absolute top-0 left-0 right-0 z-10 bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 flex items-center gap-3 shadow-lg">
                  <div className="animate-spin">🔄</div>
                  <span className="font-medium">AI is generating code...</span>
                  <div className="flex-1" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <MonacoCodeEditor
                file={selectedFile}
                isLoading={isLoadingFile}
                enableIntelligence={true}
                readOnly={false}
                theme="vs-dark"
                onChange={(newContent) => {
                  if (selectedFile && newContent !== selectedFile.content) {
                    setSelectedFile({ ...selectedFile, content: newContent });
                    setHasUnsavedChanges(true);
                  }
                }}
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
                    <Terminal
                      output={terminalOutput}
                      onCommandExecute={(cmd) => {
                        setTerminalOutput(prev => [...prev, `$ ${cmd}`]);
                      }}
                    />
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
                <ChatContainer
                  onCodeGenerated={handleAIGenerate}
                  onGenerateStart={handleAIGenerateStart}
                />
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
                {hasUnsavedChanges && (
                  <>
                    <span className="text-slate-200">|</span>
                    <span className="text-yellow-300">● Unsaved</span>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-4 group relative">
            <CopilotStatus
              onAuthRequired={() => {
                window.location.href = '/api/auth/github/login';
              }}
            />
            <span className="text-slate-200">|</span>
            <span>⚡ Code Intelligence: ON</span>
          </div>
        </footer>
      </div>
    </EditorProvider>
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
