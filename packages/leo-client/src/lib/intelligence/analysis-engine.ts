/**
 * Analysis Engine
 *
 * Core code analysis engine that detects issues, calculates metrics,
 * and generates suggestions for code improvements.
 */

import {
  CodeIssue,
  CodeMetrics,
  AnalysisResult,
  AnalysisOptions,
} from './types';

export class AnalysisEngine {

  /**
   * Analyze code and return issues, metrics, and suggestions
   */
  async analyzeCode(
    code: string,
    options: AnalysisOptions = {}
  ): Promise<AnalysisResult> {
    const issues: CodeIssue[] = [];

    // Detect syntax errors
    issues.push(...this.detectSyntaxIssues(code, options.language || 'typescript'));

    // Detect security vulnerabilities
    if (options.includeSecurity !== false) {
      issues.push(...this.detectSecurityIssues(code));
    }

    // Detect performance issues
    if (options.includePerformance !== false) {
      issues.push(...this.detectPerformanceIssues(code));
    }

    // Detect style issues
    if (options.includeStyle !== false) {
      issues.push(...this.detectStyleIssues(code, options.language || 'typescript'));
    }

    // Detect accessibility issues
    if (options.includeAccessibility !== false) {
      issues.push(...this.detectAccessibilityIssues(code));
    }

    // Calculate metrics
    const metrics = this.calculateMetrics(code, issues);

    // Generate suggestions
    const suggestions = this.generateSuggestions(issues, metrics);

    return { issues, metrics, suggestions };
  }

  /**
   * Detect syntax and basic code issues
   */
  private detectSyntaxIssues(code: string, _language: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Detect unused variables
      if (/\b(const|let|var)\s+(\w+)\s*=/.test(line)) {
        const match = line.match(/\b(const|let|var)\s+(\w+)\s*=/);
        if (match) {
          const varName = match[2];
          // Check if variable is used later in code
          const remainingCode = lines.slice(index + 1).join('\n');
          if (!new RegExp(`\\b${varName}\\b`).test(remainingCode)) {
            issues.push({
              type: 'warning',
              severity: 'low',
              category: 'best-practice',
              message: `Variable '${varName}' is declared but never used`,
              line: lineNum,
              column: line.indexOf(varName),
              endLine: lineNum,
              endColumn: line.indexOf(varName) + varName.length,
              ruleId: 'no-unused-vars',
              quickFixes: [
                {
                  title: 'Remove unused variable',
                  description: `Remove the unused variable '${varName}'`,
                  newCode: lines.filter((_, i) => i !== index).join('\n'),
                  category: 'auto-fix',
                },
              ],
            });
          }
        }
      }

      // Detect missing error handling
      if (/\bawait\s+fetch\(/.test(line) || /\.then\(/.test(line)) {
        // Check if there's a try-catch or .catch() nearby
        const contextStart = Math.max(0, index - 2);
        const contextEnd = Math.min(lines.length, index + 3);
        const context = lines.slice(contextStart, contextEnd).join('\n');

        if (!/(try\s*{|\.catch\()/.test(context)) {
          issues.push({
            type: 'warning',
            severity: 'medium',
            category: 'best-practice',
            message: 'Async operation without error handling',
            line: lineNum,
            column: 0,
            endLine: lineNum,
            endColumn: line.length,
            ruleId: 'require-error-handling',
            quickFixes: [
              {
                title: 'Add try-catch block',
                description: 'Wrap the code in a try-catch block',
                newCode: this.wrapInTryCatch(lines, index),
                category: 'auto-fix',
              },
            ],
          });
        }
      }

      // Detect console.log (should use proper logging)
      if (/console\.(log|debug|info|warn|error)/.test(line)) {
        issues.push({
          type: 'suggestion',
          severity: 'low',
          category: 'best-practice',
          message: 'Consider using a proper logging library instead of console',
          line: lineNum,
          column: line.indexOf('console'),
          endLine: lineNum,
          endColumn: line.indexOf('console') + 7,
          ruleId: 'no-console',
        });
      }
    });

    return issues;
  }

  /**
   * Detect security vulnerabilities
   */
  private detectSecurityIssues(code: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Detect hardcoded secrets
      if (/\b(api[_-]?key|password|secret|token)\s*[:=]\s*['"][^'"]+['"]/i.test(line)) {
        issues.push({
          type: 'error',
          severity: 'critical',
          category: 'security',
          message: 'Potential hardcoded secret detected. Use environment variables instead.',
          line: lineNum,
          column: 0,
          endLine: lineNum,
          endColumn: line.length,
          ruleId: 'no-hardcoded-secrets',
          quickFixes: [
            {
              title: 'Use environment variable',
              description: 'Replace hardcoded value with process.env.VARIABLE_NAME',
              newCode: line.replace(/['"]([^'"]+)['"]/, 'process.env.SECRET_KEY'),
              category: 'suggestion',
            },
          ],
        });
      }

      // Detect SQL injection risks
      if (/\$\{.*\}.*SELECT|SELECT.*\$\{.*\}/i.test(line)) {
        issues.push({
          type: 'error',
          severity: 'critical',
          category: 'security',
          message: 'Potential SQL injection vulnerability. Use parameterized queries.',
          line: lineNum,
          column: 0,
          endLine: lineNum,
          endColumn: line.length,
          ruleId: 'no-sql-injection',
        });
      }

      // Detect eval usage
      if (/\beval\(/.test(line)) {
        issues.push({
          type: 'error',
          severity: 'critical',
          category: 'security',
          message: 'Avoid using eval() as it can execute arbitrary code',
          line: lineNum,
          column: line.indexOf('eval'),
          endLine: lineNum,
          endColumn: line.indexOf('eval') + 4,
          ruleId: 'no-eval',
        });
      }
    });

    return issues;
  }

  /**
   * Detect performance issues
   */
  private detectPerformanceIssues(code: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Detect synchronous file operations
      if (/fs\.readFileSync|fs\.writeFileSync/.test(line)) {
        issues.push({
          type: 'warning',
          severity: 'medium',
          category: 'performance',
          message: 'Synchronous file operation blocks event loop. Use async version.',
          line: lineNum,
          column: 0,
          endLine: lineNum,
          endColumn: line.length,
          ruleId: 'prefer-async-fs',
          quickFixes: [
            {
              title: 'Use async version',
              description: 'Replace with async fs.readFile() or fs.writeFile()',
              newCode: line.replace(/Sync/g, '').replace(/\)/, ', callback)'),
              category: 'suggestion',
            },
          ],
        });
      }

      // Detect inefficient array operations in loops
      if (/for\s*\(.*\.length/.test(line)) {
        const nextLines = lines.slice(index, index + 5).join('\n');
        if (/\.push\(/.test(nextLines)) {
          issues.push({
            type: 'suggestion',
            severity: 'low',
            category: 'performance',
            message: 'Consider using Array.map() or Array.filter() instead of manual loop',
            line: lineNum,
            column: 0,
            endLine: lineNum,
            endColumn: line.length,
            ruleId: 'prefer-array-methods',
          });
        }
      }
    });

    return issues;
  }

  /**
   * Detect style issues
   */
  private detectStyleIssues(code: string, language: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Detect var usage (prefer const/let)
      if (/\bvar\s+/.test(line) && language !== 'python') {
        issues.push({
          type: 'suggestion',
          severity: 'low',
          category: 'style',
          message: "Use 'const' or 'let' instead of 'var'",
          line: lineNum,
          column: line.indexOf('var'),
          endLine: lineNum,
          endColumn: line.indexOf('var') + 3,
          ruleId: 'no-var',
          quickFixes: [
            {
              title: "Replace with 'const'",
              description: "Use 'const' for variables that won't be reassigned",
              newCode: line.replace(/\bvar\b/, 'const'),
              category: 'auto-fix',
            },
          ],
        });
      }

      // Detect missing semicolons (if enabled)
      if (language === 'typescript' || language === 'javascript') {
        if (/\w\s*$/.test(line.trim()) && !line.trim().endsWith('{') && !line.trim().endsWith(',')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
            issues.push({
              type: 'info',
              severity: 'low',
              category: 'style',
              message: 'Missing semicolon',
              line: lineNum,
              column: line.length,
              endLine: lineNum,
              endColumn: line.length,
              ruleId: 'semi',
              quickFixes: [
                {
                  title: 'Add semicolon',
                  description: 'Add missing semicolon at end of line',
                  newCode: lines.map((l, i) => i === index ? l + ';' : l).join('\n'),
                  category: 'auto-fix',
                },
              ],
            });
          }
        }
      }
    });

    return issues;
  }

  /**
   * Detect accessibility issues (for React/JSX code)
   */
  private detectAccessibilityIssues(code: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Detect missing alt text on images
      if (/<img/.test(line) && !/alt\s*=/.test(line)) {
        issues.push({
          type: 'warning',
          severity: 'high',
          category: 'accessibility',
          message: 'Images must have alt text for screen readers',
          line: lineNum,
          column: 0,
          endLine: lineNum,
          endColumn: line.length,
          ruleId: 'jsx-a11y/alt-text',
          quickFixes: [
            {
              title: 'Add alt attribute',
              description: 'Add alt="" for decorative images or alt="description" for meaningful images',
              newCode: line.replace(/<img/, '<img alt=""'),
              category: 'suggestion',
            },
          ],
        });
      }

      // Detect buttons without aria-label
      if (/<button/.test(line) && !/>.*<\/button>/.test(line) && !/aria-label/.test(line)) {
        issues.push({
          type: 'suggestion',
          severity: 'medium',
          category: 'accessibility',
          message: 'Interactive elements should have descriptive aria-label',
          line: lineNum,
          column: 0,
          endLine: lineNum,
          endColumn: line.length,
          ruleId: 'jsx-a11y/aria-props',
        });
      }
    });

    return issues;
  }

  /**
   * Calculate code metrics
   */
  private calculateMetrics(code: string, issues: CodeIssue[]): CodeMetrics {
    const lines = code.split('\n');
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;

    // Calculate cyclomatic complexity (simplified)
    const complexity = this.calculateComplexity(code);

    // Calculate maintainability index (simplified 0-100 scale)
    const maintainabilityIndex = Math.max(0, Math.min(100, 100 - (complexity * 2) - (issues.length * 5)));

    // Calculate security score
    const securityIssues = issues.filter(i => i.category === 'security');
    const securityScore = Math.max(0, 100 - (securityIssues.length * 20));

    // Count issues by severity
    const issueCount = {
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length,
    };

    return {
      complexity,
      linesOfCode,
      maintainabilityIndex,
      securityScore,
      issues: issueCount,
    };
  }

  /**
   * Calculate cyclomatic complexity
   */
  private calculateComplexity(code: string): number {
    let complexity = 1; // Base complexity

    // Count decision points
    const decisionPoints = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\?\s*.*\s*:/g, // Ternary operator
      /&&/g,
      /\|\|/g,
    ];

    decisionPoints.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * Generate suggestions based on issues and metrics
   */
  private generateSuggestions(issues: CodeIssue[], metrics: CodeMetrics): string[] {
    const suggestions: string[] = [];
    
    if (metrics.complexity > 5) {
      suggestions.push('Consider breaking down complex functions into smaller ones');
    }
    
    if (metrics.securityScore < 80) {
      suggestions.push('Address security vulnerabilities to improve code safety');
    }
    
    if (metrics.maintainabilityIndex < 60) {
      suggestions.push('Refactor code to improve maintainability');
    }
    
    const errorCount = issues.filter(i => i.type === 'error').length;
    if (errorCount > 0) {
      suggestions.push(`Fix ${errorCount} critical error${errorCount > 1 ? 's' : ''} before proceeding`);
    }
    
    return suggestions;
  }  /**
   * Helper: Wrap code in try-catch block
   */
  private wrapInTryCatch(lines: string[], index: number): string {
    const indentation = lines[index].match(/^\s*/)?.[0] || '';
    const wrappedLines = [...lines];

    wrappedLines.splice(index, 0, `${indentation}try {`);
    wrappedLines.splice(index + 2, 0, `${indentation}} catch (error) {`);
    wrappedLines.splice(index + 3, 0, `${indentation}  console.error('Error:', error);`);
    wrappedLines.splice(index + 4, 0, `${indentation}  throw error;`);
    wrappedLines.splice(index + 5, 0, `${indentation}}`);

    // Indent the wrapped line
    wrappedLines[index + 1] = '  ' + wrappedLines[index + 1];

    return wrappedLines.join('\n');
  }
}
