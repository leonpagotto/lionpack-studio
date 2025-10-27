import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AnalysisEngine, CodeIssue, AnalysisResult } from '@lionpack/leo-client';
import { DocumentationGenerator } from '../CodeIntelligence';
import { useCopilotSuggestions } from '../../hooks/useCopilotSuggestions';
import { InlineSuggestion } from '../Copilot/InlineSuggestion';

export interface CodeFile {
  path: string;
  content: string;
  language: string;
}

interface CodeEditorProps {
  file: CodeFile | null;
  isLoading?: boolean;
}

// Simple syntax highlighting function for common languages
const highlightCode = (code: string, language: string, issues: CodeIssue[] = []): React.ReactNode[] => {
  const lines = code.split('\n');
  const highlighted: React.ReactNode[] = [];

  const getIssuesForLine = (lineNum: number): CodeIssue[] => {
    return issues.filter(issue => issue.line === lineNum);
  };

  const getIssueBadge = (type: CodeIssue['type']): string => {
    switch (type) {
      case 'error':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'suggestion':
        return '🔵';
      case 'info':
        return '⚪';
      default:
        return '⚪';
    }
  };

  const getUnderlineClass = (type: CodeIssue['type']): string => {
    switch (type) {
      case 'error':
        return 'border-b-2 border-red-500 border-dotted';
      case 'warning':
        return 'border-b-2 border-yellow-500 border-dotted';
      case 'suggestion':
        return 'border-b-2 border-blue-500 border-dotted';
      case 'info':
        return 'border-b-2 border-gray-500 border-dotted';
      default:
        return '';
    }
  };

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const lineIssues = getIssuesForLine(lineNum);
    const hasIssues = lineIssues.length > 0;
    const mostSevereIssue = lineIssues[0];

    const processed = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    highlighted.push(
      <div
        key={idx}
        className="flex group hover:bg-slate-100 dark:hover:bg-slate-800/50"
        title={hasIssues ? lineIssues.map(i => i.message).join('\n') : undefined}
        style={{
          color: isCommentLine(processed) ? '#6B7280' : 'inherit',
        }}
      >
        <span className="select-none w-12 text-right pr-4 text-slate-500 dark:text-slate-600 bg-slate-50 dark:bg-slate-900 text-xs flex items-center justify-end gap-1">
          {hasIssues && (
            <span className="text-xs">{getIssueBadge(mostSevereIssue.type)}</span>
          )}
          {idx + 1}
        </span>
        <span
          className={`flex-1 text-sm font-mono ${
            hasIssues ? getUnderlineClass(mostSevereIssue.type) : ''
          }`}
        >
          {processLine(processed, language)}
        </span>
      </div>
    );
  });

  return highlighted;
};

const isCommentLine = (line: string): boolean => {
  return line.trim().startsWith('//') || line.trim().startsWith('#');
};

const processLine = (line: string, language: string): React.ReactNode => {
  // Basic syntax highlighting for keywords
  const keywords = {
    typescript: [
      'const',
      'let',
      'var',
      'function',
      'interface',
      'type',
      'class',
      'import',
      'export',
      'from',
      'return',
      'async',
      'await',
      'if',
      'else',
      'for',
      'while',
    ],
    javascript: [
      'const',
      'let',
      'var',
      'function',
      'class',
      'import',
      'export',
      'from',
      'return',
      'async',
      'await',
      'if',
      'else',
      'for',
      'while',
    ],
    python: [
      'def',
      'class',
      'import',
      'from',
      'return',
      'if',
      'else',
      'for',
      'while',
      'async',
      'await',
    ],
  };

  const langKeywords =
    keywords[language as keyof typeof keywords] || keywords.typescript;

  let result = line;
  langKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    result = result.replace(
      regex,
      `<span class="text-blue-600 dark:text-blue-400 font-semibold">${keyword}</span>`
    );
  });

  // Highlight strings
  result = result.replace(
    /(['"])([^'"]*)\1/g,
    '<span class="text-green-600 dark:text-green-400">$&</span>'
  );

  // Highlight numbers
  result = result.replace(
    /\b(\d+)\b/g,
    '<span class="text-amber-600 dark:text-amber-400">$1</span>'
  );

  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

interface CodeEditorProps {
  file: CodeFile | null;
  isLoading?: boolean;
  enableIntelligence?: boolean;
  onChange?: (content: string) => void;
  enableCopilotSuggestions?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  isLoading,
  enableIntelligence = true,
  onChange,
  enableCopilotSuggestions = true
}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDocGenerator, setShowDocGenerator] = useState(false);
  const [localContent, setLocalContent] = useState(file?.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 0 });
  const analysisEngine = useMemo(() => new AnalysisEngine(), []);

  // Copilot suggestions
  const {
    currentSuggestion,
    isLoading: isSuggestionLoading,
    triggerSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestion,
  } = useCopilotSuggestions({
    enabled: enableCopilotSuggestions && enableIntelligence,
    debounceMs: 500,
    minCharsBeforeSuggest: 3,
  });

  // Update local content when file changes
  useEffect(() => {
    if (file) {
      setLocalContent(file.content);
    }
  }, [file]);

  // Run analysis when file changes
  useEffect(() => {
    if (!file || !enableIntelligence) {
      setAnalysis(null);
      return;
    }

    const runAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const result = await analysisEngine.analyzeCode(localContent, {
          language: file.language,
          includeSecurity: true,
          includePerformance: true,
          includeStyle: true,
          includeAccessibility: true,
        });
        setAnalysis(result);
      } catch (error) {
        console.error('Analysis error:', error);
        setAnalysis(null);
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Debounce analysis
    const timeoutId = setTimeout(runAnalysis, 500);
    return () => clearTimeout(timeoutId);
  }, [file, localContent, enableIntelligence, analysisEngine]);

  // Track cursor position
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = localContent.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length;

    setCursorPosition({ line, column });
  };

  // Trigger suggestion on content change
  useEffect(() => {
    if (!file || !enableCopilotSuggestions || !enableIntelligence) return;

    triggerSuggestion({
      code: localContent,
      language: file.language,
      cursorPosition,
      context: {
        fileName: file.path,
      },
    });
  }, [localContent, cursorPosition, file, enableCopilotSuggestions, enableIntelligence, triggerSuggestion]);

  // Handle keyboard shortcuts for suggestions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab to accept suggestion
      if (e.key === 'Tab' && currentSuggestion) {
        e.preventDefault();
        const accepted = acceptSuggestion();
        if (accepted && textareaRef.current) {
          const cursorPos = textareaRef.current.selectionStart;
          const newContent =
            localContent.substring(0, cursorPos) +
            accepted +
            localContent.substring(cursorPos);
          setLocalContent(newContent);
          onChange?.(newContent);
        }
      }

      // Escape to reject suggestion
      if (e.key === 'Escape' && currentSuggestion) {
        e.preventDefault();
        rejectSuggestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSuggestion, acceptSuggestion, rejectSuggestion, localContent, onChange]);

  const highlightedLines = useMemo(() => {
    if (!file) return [];
    return highlightCode(localContent, file.language, analysis?.issues || []);
  }, [file, localContent, analysis]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {file ? file.path.split('/').pop() : 'No file selected'}
          </h3>
          {file && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {file.language}
              {file.content.length > 0 && ` • ${file.content.length} bytes`}
            </p>
          )}
        </div>

        {/* Actions */}
        {file && enableIntelligence && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDocGenerator(true)}
              className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
              title="Generate documentation with AI"
            >
              📝 Generate Docs
            </button>
          </div>
        )}
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading code...
              </p>
            </div>
          </div>
        ) : file ? (
          <div className="relative h-full">
            {/* Editable textarea */}
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={(e) => {
                setLocalContent(e.target.value);
                onChange?.(e.target.value);
                updateCursorPosition();
              }}
              onKeyUp={updateCursorPosition}
              onClick={updateCursorPosition}
              className="absolute inset-0 w-full h-full font-mono text-sm text-slate-900 dark:text-white bg-transparent resize-none focus:outline-none p-4 leading-6"
              spellCheck={false}
              style={{
                tabSize: 2,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            />

            {/* Inline Copilot suggestion */}
            {currentSuggestion && (
              <InlineSuggestion
                suggestion={currentSuggestion.text}
                position={currentSuggestion.position}
                onAccept={() => {
                  const accepted = acceptSuggestion();
                  if (accepted && textareaRef.current) {
                    const cursorPos = textareaRef.current.selectionStart;
                    const newContent =
                      localContent.substring(0, cursorPos) +
                      accepted +
                      localContent.substring(cursorPos);
                    setLocalContent(newContent);
                    onChange?.(newContent);
                  }
                }}
                onReject={rejectSuggestion}
                visible={!!currentSuggestion}
              />
            )}

            {/* Suggestion loading indicator */}
            {isSuggestionLoading && (
              <div className="absolute top-2 right-2 text-xs text-slate-400 flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <span>Getting suggestions...</span>
              </div>
            )}

            {/* Syntax highlighted overlay (read-only, for display) */}
            <div className="pointer-events-none absolute inset-0 font-mono text-sm text-transparent bg-transparent p-4 leading-6 overflow-hidden">
              {highlightedLines}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select a file to view code
            </p>
          </div>
        )}
      </div>

      {/* Footer with metrics */}
      {file && (
        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-4">
          <span>{localContent.split('\n').length} lines</span>

          {enableIntelligence && analysis && (
            <>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className={`flex items-center gap-1 ${analysis.metrics.complexity > 10 ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                Complexity: {analysis.metrics.complexity}
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span>
                Maintainability: {analysis.metrics.maintainabilityIndex}/100
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className={`${analysis.metrics.securityScore < 80 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                Security: {analysis.metrics.securityScore}/100
              </span>

              {analysis.issues.length > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="flex items-center gap-2">
                    {analysis.metrics.issues.critical > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        🔴 {analysis.metrics.issues.critical}
                      </span>
                    )}
                    {analysis.metrics.issues.high > 0 && (
                      <span className="text-orange-600 dark:text-orange-400">
                        🟡 {analysis.metrics.issues.high}
                      </span>
                    )}
                    {analysis.metrics.issues.medium > 0 && (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        🟡 {analysis.metrics.issues.medium}
                      </span>
                    )}
                    {analysis.metrics.issues.low > 0 && (
                      <span className="text-blue-600 dark:text-blue-400">
                        🔵 {analysis.metrics.issues.low}
                      </span>
                    )}
                  </span>
                </>
              )}
            </>
          )}

          {isAnalyzing && (
            <>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                Analyzing...
              </span>
            </>
          )}
        </div>
      )}

      {/* Documentation Generator Modal */}
      {showDocGenerator && file && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDocGenerator(false)}>
          <div className="w-full max-w-4xl h-[80vh] m-4" onClick={(e) => e.stopPropagation()}>
            <DocumentationGenerator
              code={localContent}
              language={file.language}
              onApply={(docs) => {
                navigator.clipboard.writeText(docs);
                alert('Documentation copied to clipboard!');
                setShowDocGenerator(false);
              }}
              onClose={() => setShowDocGenerator(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
