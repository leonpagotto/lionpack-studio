/**
 * ProfessionalWorkflow.tsx
 *
 * Story 3.9: Integrated Code Generation Studio
 * Combines Morphic-style chat interface with Kilo Code-style split-panel editor
 *
 * Architecture:
 * ┌─────────────────────────────────────────┐
 * │ Story 3.9: Code Generation Studio       │
 * ├──────────────────┬──────────────────────┤
 * │   Chat (40%)     │   Editor (60%)       │
 * │ • Input prompt   │ • File tree          │
 * │ • Chat history   │ • Code view          │
 * │ • Streaming UI   │ • Test results       │
 * │ • Error display  │ • Terminal output    │
 * └──────────────────┴──────────────────────┘
 *
 * Data Flow:
 * User prompt → API call → Streaming response → Parse files →
 * Update file state → Display in editor → Show test results
 */

'use client'

import React, { useCallback } from 'react'
import { ChatContainer } from './MorphicChat'
import { SplitPane, FileTree, CodeEditor, Terminal } from './KiloEditor'
import { EditorProvider, useEditor } from '../context/EditorContext'
import type { GeneratedFile } from '../context/EditorContext'
import type { GeneratedCode } from './MorphicChat'

/**
 * Editor Tab Switcher
 * Shows file tree, code editor, or terminal based on active tab
 */
const EditorTabs: React.FC = () => {
  const { files, activeFile, testOutput, testResults, isGenerating } = useEditor()
  const [activeTab, setActiveTab] = React.useState<'files' | 'editor' | 'terminal'>('files')

  return (
    <div className="flex flex-col h-full">
      {/* Tab Headers */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'files'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Files ({files.length})
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'editor'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'terminal'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Terminal
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'files' && (
          <FileTree
            files={files.map((f) => ({ ...f, language: f.language || 'typescript' }))}
            activeFile={activeFile?.path}
            onSelectFile={(file) => {
              // Find and select the file from our state
              const fileToSelect = files.find(
                (f) => f.path === file.path
              ) as GeneratedFile
              if (fileToSelect) {
                const { useEditor } = require('../context/EditorContext')
                const { selectFile } = useEditor()
                selectFile(fileToSelect)
              }
            }}
          />
        )}
        {activeTab === 'editor' && (
          <CodeEditor
            file={
              activeFile
                ? { ...activeFile, language: activeFile.language || 'typescript' }
                : null
            }
            isLoading={isGenerating}
          />
        )}
        {activeTab === 'terminal' && (
          <Terminal
            output={testOutput}
            testResults={testResults}
            isLoading={isGenerating}
          />
        )}
      </div>
    </div>
  )
}

/**
 * EditorWrapper Component
 * Handles file selection and integration with chat
 */
const EditorWrapper: React.FC = () => {
  const { files, selectFile } = useEditor()

  return (
    <div className="h-full flex flex-col">
      <EditorTabs />
    </div>
  )
}

/**
 * ChatWrapper Component
 * Handles code generation and updating editor state
 */
const ChatWrapper: React.FC = () => {
  const { setFiles, setTestResults, setIsGenerating, addTestOutput } = useEditor()

  const handleCodeGenerated = useCallback((code: GeneratedCode) => {
    // Convert generated code to file list
    const generatedFiles: GeneratedFile[] = code.files.map((file) => ({
      path: file.path,
      content: file.content,
      language: file.language || 'typescript',
    }))

    setFiles(generatedFiles)

    // Handle test results if available
    if (code.tests) {
      setTestResults({
        passed: code.tests.passed,
        failed: code.tests.failed || 0,
        total: code.tests.total,
        tests: [], // Will be populated by actual test runner
      })
    }

    setIsGenerating(false)
  }, [setFiles, setTestResults, setIsGenerating, addTestOutput])

  return (
    <ChatContainer
      onCodeGenerated={handleCodeGenerated}
      apiEndpoint="/api/generate-code"
    />
  )
}

/**
 * Professional Workflow Component
 *
 * Main component combining Morphic chat with Kilo editor in a split layout
 */
export function ProfessionalWorkflow() {
  return (
    <EditorProvider>
      <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Code Generation Studio
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Story 3.9: Integrated Morphic Chat + Kilo Code Editor • Real-time code generation
          </p>
        </div>

        {/* Main Content - Split Pane */}
        <div className="flex-1 overflow-hidden px-4 py-4 gap-4">
          <div className="flex gap-4 h-full">
            {/* Left: Chat Interface (40%) */}
            <div className="w-2/5 min-w-96">
              <ChatWrapper />
            </div>

            {/* Right: Code Editor (60%) */}
            <div className="w-3/5 min-w-96">
              <EditorWrapper />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400">
          <p>
            💡 <strong>Tip:</strong> Describe your code requirements in the chat • View generated files on the right
          </p>
        </div>
      </div>
    </EditorProvider>
  )
}

export default ProfessionalWorkflow
