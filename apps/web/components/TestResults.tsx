/**
 * @file TestResults component.
 *
 * Displays quality metrics and test results for generated code.
 */

import React from 'react';
import type { GeneratedCode } from '@/../../packages/leo-client/src/coder/types';

interface TestResultsProps {
  result: GeneratedCode;
}

export const TestResults: React.FC<TestResultsProps> = ({ result }) => {
  const { quality, metadata } = result;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Quality Metrics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Test Coverage */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div className="text-sm text-blue-800 dark:text-blue-200 mb-1">Test Coverage</div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {quality.testCoverage}%
          </div>
        </div>

        {/* Type Errors */}
        <div
          className={`p-4 rounded-lg ${
            quality.hasTypeErrors
              ? 'bg-red-50 dark:bg-red-900/30'
              : 'bg-green-50 dark:bg-green-900/30'
          }`}
        >
          <div
            className={`text-sm mb-1 ${
              quality.hasTypeErrors
                ? 'text-red-800 dark:text-red-200'
                : 'text-green-800 dark:text-green-200'
            }`}
          >
            Type Errors
          </div>
          <div
            className={`text-3xl font-bold ${
              quality.hasTypeErrors
                ? 'text-red-900 dark:text-red-100'
                : 'text-green-900 dark:text-green-100'
            }`}
          >
            {quality.hasTypeErrors ? '✗' : '✓'}
          </div>
        </div>

        {/* Lint Errors */}
        <div
          className={`p-4 rounded-lg ${
            quality.hasLintErrors
              ? 'bg-red-50 dark:bg-red-900/30'
              : 'bg-green-50 dark:bg-green-900/30'
          }`}
        >
          <div
            className={`text-sm mb-1 ${
              quality.hasLintErrors
                ? 'text-red-800 dark:text-red-200'
                : 'text-green-800 dark:text-green-200'
            }`}
          >
            Lint Errors
          </div>
          <div
            className={`text-3xl font-bold ${
              quality.hasLintErrors
                ? 'text-red-900 dark:text-red-100'
                : 'text-green-900 dark:text-green-100'
            }`}
          >
            {quality.hasLintErrors ? '✗' : '✓'}
          </div>
        </div>

        {/* Execution Time */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
          <div className="text-sm text-purple-800 dark:text-purple-200 mb-1">
            Generation Time
          </div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {(metadata.executionTime / 1000).toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Generation Details
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Model:</span>{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {metadata.modelUsed}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Tokens Used:</span>{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {metadata.tokensUsed.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Generated At:</span>{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {new Date(metadata.generatedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
