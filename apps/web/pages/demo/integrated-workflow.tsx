/**
 * @file Integrated demo showing Mode Router → Coder Agent workflow.
 *
 * This demo shows the complete flow from intent detection to code generation.
 */

import React, { useState } from 'react';
import Head from 'next/head';
import { detectMode } from '@/../../packages/leo-client/src/mode-router';
import type { CodeGenerationRequest, GeneratedCode } from '@/../../packages/leo-client/src/coder/types';
import { CodePreview } from '../../components/CodePreview';
import { TestResults } from '../../components/TestResults';

export default function IntegratedDemo() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modeResult, setModeResult] = useState<any>(null);
  const [codeResult, setCodeResult] = useState<GeneratedCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setModeResult(null);
    setCodeResult(null);

    try {
      // Step 1: Detect intent with Mode Router
      const mode = detectMode(input);
      setModeResult(mode);

      // Step 2: If intent is "generate", call Coder Agent
      if (mode.intent === 'generate') {
        const request: CodeGenerationRequest = {
          prompt: input,
          language: 'typescript',
          framework: 'react',
          includeTests: true,
          testCoverage: 80,
          streaming: false,
        };

        const response = await fetch('/api/generate-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Code generation failed');
        }

        const data: GeneratedCode = await response.json();
        setCodeResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    {
      text: 'Create a reusable Button component with variants',
      intent: 'generate',
    },
    {
      text: 'Fix the login error when form is submitted',
      intent: 'debug',
    },
    {
      text: 'Write unit tests for the user service',
      intent: 'test',
    },
  ];

  return (
    <>
      <Head>
        <title>Integrated Demo - Mode Router + Coder Agent</title>
        <meta
          name="description"
          content="See the complete workflow from intent detection to code generation"
        />
      </Head>

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Integrated Workflow Demo
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              This demo shows the complete flow: Mode Router detects your intent, then
              routes to the appropriate agent. For "generate" intents, the Coder Agent
              creates production-ready code.
            </p>
          </div>

          {/* Workflow Diagram */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Workflow
            </h2>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
                <div className="text-blue-600 dark:text-blue-400 text-2xl mb-2">🎯</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  1. Mode Router
                </div>
                <div className="text-gray-600 dark:text-gray-400">Detect Intent</div>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
              <div className="flex-1 bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
                <div className="text-green-600 dark:text-green-400 text-2xl mb-2">⚡</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  2. Router Decision
                </div>
                <div className="text-gray-600 dark:text-gray-400">Select Agent</div>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
              <div className="flex-1 bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
                <div className="text-purple-600 dark:text-purple-400 text-2xl mb-2">
                  💻
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  3. Coder Agent
                </div>
                <div className="text-gray-600 dark:text-gray-400">Generate Code</div>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Try It Out
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Enter your request:
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., Create a React login form component"
                className="w-full h-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={loading}
              />
            </div>

            {/* Sample Prompts */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Try a sample:
              </label>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(sample.text)}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    disabled={loading}
                  >
                    {sample.text.substring(0, 40)}...
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Detect Intent & Execute'
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Mode Router Result */}
          {modeResult && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Step 1: Intent Detection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="text-sm text-blue-800 dark:text-blue-200 mb-1">
                    Detected Intent
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 uppercase">
                    {modeResult.intent}
                  </div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <div className="text-sm text-green-800 dark:text-green-200 mb-1">
                    Confidence
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {(modeResult.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <div className="text-sm text-purple-800 dark:text-purple-200 mb-1">
                    Next Agent
                  </div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {modeResult.intent === 'generate' ? 'Coder' : modeResult.intent}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <strong>Reasoning:</strong> {modeResult.reasoning}
              </div>
            </div>
          )}

          {/* Code Generation Results */}
          {codeResult && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Step 2: Code Generation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The Coder Agent generated production-ready code with tests and quality
                  checks.
                </p>
              </div>

              <CodePreview
                code={codeResult.code}
                language="typescript"
                title="Generated Code"
              />

              {codeResult.tests && (
                <CodePreview
                  code={codeResult.tests}
                  language="typescript"
                  title="Generated Tests"
                />
              )}

              <TestResults result={codeResult} />
            </div>
          )}

          {/* Info if not generate intent */}
          {modeResult && modeResult.intent !== 'generate' && !loading && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
                Intent: {modeResult.intent.toUpperCase()}
              </h3>
              <p className="text-yellow-800 dark:text-yellow-200">
                This intent would be routed to the{' '}
                <strong>{modeResult.intent} agent</strong> (not yet implemented). For
                this demo, only "generate" intents trigger the Coder Agent.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              LEO Workflow Kit • Story 3.8 (Mode Router) + Story 3.9 (Coder Agent) •
              Powered by Claude 3.5 Sonnet
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
