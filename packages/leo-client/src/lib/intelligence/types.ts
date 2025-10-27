/**
 * Code Intelligence Types
 *
 * Type definitions for the code analysis and intelligence features.
 */

export type IssueType = 'error' | 'warning' | 'suggestion' | 'info';
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueCategory =
  | 'syntax'
  | 'type'
  | 'security'
  | 'performance'
  | 'style'
  | 'accessibility'
  | 'best-practice';

export interface CodeIssue {
  type: IssueType;
  severity: IssueSeverity;
  category: IssueCategory;
  message: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  quickFixes?: QuickFix[];
  ruleId?: string;
}

export interface QuickFix {
  title: string;
  description: string;
  newCode: string;
  category: 'auto-fix' | 'refactor' | 'suggestion';
}

export interface CodeMetrics {
  complexity: number;
  linesOfCode: number;
  maintainabilityIndex: number;
  securityScore: number;
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface AnalysisResult {
  issues: CodeIssue[];
  metrics: CodeMetrics;
  suggestions: string[];
}

export interface AnalysisOptions {
  includeStyle?: boolean;
  includePerformance?: boolean;
  includeSecurity?: boolean;
  includeAccessibility?: boolean;
  language?: string;
}
