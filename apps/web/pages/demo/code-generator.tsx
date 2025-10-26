/**
 * @file Demo page for the Code Generator.
 *
 * Interactive demonstration of the Coder Agent capabilities.
 */

import React from 'react';
import Head from 'next/head';
import { CodeGenerator } from '../../components/CodeGenerator';

export default function CodeGeneratorDemo() {
  return (
    <>
      <Head>
        <title>Code Generator - LEO Workflow Kit</title>
        <meta
          name="description"
          content="Generate production-ready code with AI assistance"
        />
      </Head>

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              AI Code Generator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Generate production-ready code with comprehensive tests, type safety, and
              automatic formatting powered by Claude 3.5 Sonnet.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-blue-600 dark:text-blue-400 text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Generate complete, working code in seconds with streaming support for
                real-time feedback.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-green-600 dark:text-green-400 text-3xl mb-3">✓</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Production Ready
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                TypeScript strict mode, ESLint validation, and Prettier formatting built
                in.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-purple-600 dark:text-purple-400 text-3xl mb-3">🧪</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Test Coverage
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Automatically generates comprehensive unit tests with 80%+ coverage.
              </p>
            </div>
          </div>

          {/* Main Component */}
          <CodeGenerator />

          {/* Footer Info */}
          <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Part of the LEO Workflow Kit • Story 3.9: Coder Agent • Powered by Claude
              3.5 Sonnet
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
