import React, { useEffect, useRef, useState } from 'react';
import { useTerminal } from '../../hooks/useTerminal';

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
  output?: string[];
  testResults?: TestResult | null;
  isLoading?: boolean;
  onCommandExecute?: (command: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({
  output: propOutput,
  testResults,
  isLoading = false,
  onCommandExecute,
}) => {
  const terminal = useTerminal();
  const terminalRef = useRef<HTMLDivElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Use prop output if provided, otherwise use hook output
  const displayOutput = propOutput || terminal.output.map((o) => o.data);
  const hasContent = displayOutput.length > 0 || testResults || isLoading;

  // Auto-scroll to bottom
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayOutput, testResults]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commandInput.trim()) return;

    // Add to history
    setCommandHistory((prev) => [...prev, commandInput]);
    setHistoryIndex(-1);

    // Notify parent if callback provided
    onCommandExecute?.(commandInput);

    // Execute command using hook (if no prop output provided)
    if (!propOutput) {
      await terminal.executeCommand(commandInput);
    }

    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      terminal.cancelExecution();
    }
  };

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
            {displayOutput.map((line, idx) => (
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

      {/* Footer / Command Input */}
      <div className="flex-shrink-0 border-t border-slate-700 bg-slate-800">
        <form onSubmit={handleCommandSubmit} className="flex items-center px-4 py-2">
          <span className="text-green-400 mr-2">$</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command..."
            className="flex-1 bg-transparent text-slate-100 text-sm focus:outline-none font-mono"
            disabled={isLoading || terminal.isExecuting}
          />
          {(terminal.isExecuting || isLoading) && (
            <div className="ml-2 flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Running...</span>
            </div>
          )}
        </form>
        <div className="px-4 pb-2 text-xs text-slate-500">
          {hasContent ? (
            <span>{displayOutput.length} lines of output</span>
          ) : (
            <span>Type a command and press Enter (↑↓ for history, Ctrl+C to cancel)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal;
