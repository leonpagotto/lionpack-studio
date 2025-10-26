import React, { useEffect, useRef } from 'react';

export interface TestResult {
  passed: number;
  failed: number;
  total: number;
  tests: Array<{
    name: string;
    status: 'pass' | 'fail';
    message?: string;
  }>;
}

interface TerminalProps {
  output: string[];
  testResults?: TestResult | null;
  isLoading?: boolean;
}

const Terminal: React.FC<TerminalProps> = ({
  output,
  testResults,
  isLoading = false,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output, testResults]);

  const hasContent = output.length > 0 || testResults || isLoading;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-lg border border-slate-700 font-mono text-sm">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Terminal</h3>
          <span className="text-xs text-slate-400">
            {testResults ? `${testResults.passed}/${testResults.total} tests` : 'Ready'}
          </span>
        </div>
      </div>

      {/* Output Area */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 bg-slate-900"
      >
        {!hasContent ? (
          <div className="text-slate-500 text-center py-8">
            <p>$ npm test</p>
            <p className="text-xs mt-2">Waiting for test execution...</p>
          </div>
        ) : (
          <>
            {/* Command Output */}
            {output.map((line, idx) => (
              <div key={`output-${idx}`} className="text-slate-300">
                {line || '\u00A0'}
              </div>
            ))}

            {/* Test Results */}
            {testResults && (
              <div className="mt-4 space-y-2 border-t border-slate-700 pt-4">
                <div className="text-slate-400">Test Results:</div>

                {testResults.tests.map((test, idx) => (
                  <div
                    key={`test-${idx}`}
                    className={`flex items-center gap-2 ${
                      test.status === 'pass'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    <span className="flex-shrink-0">
                      {test.status === 'pass' ? '✓' : '✗'}
                    </span>
                    <span className="flex-1">{test.name}</span>
                    {test.message && (
                      <span className="text-xs text-slate-500">
                        {test.message}
                      </span>
                    )}
                  </div>
                ))}

                <div className="mt-2 pt-2 border-t border-slate-700">
                  <div
                    className={`text-sm ${
                      testResults.failed === 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {testResults.failed === 0
                      ? `✓ All ${testResults.total} tests passed`
                      : `✗ ${testResults.failed} test${testResults.failed > 1 ? 's' : ''} failed`}
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
                <span>Executing...</span>
              </div>
            )}

            <div ref={outputEndRef} />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-slate-700 bg-slate-800 text-xs text-slate-500">
        {hasContent ? (
          <span>{output.length} lines of output</span>
        ) : (
          <span>Awaiting code generation...</span>
        )}
      </div>
    </div>
  );
};

export default Terminal;
