/**
 * AI Suggestions Provider
 *
 * Leverages AI (Gemini/Claude) to provide intelligent code suggestions,
 * refactorings, and improvements.
 */

import { CodeIssue, QuickFix } from './types';

export interface AISuggestionOptions {
  provider?: 'gemini' | 'claude' | 'auto';
  maxSuggestions?: number;
  context?: string;
}

export class AISuggestionProvider {
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '/api/ai/suggest') {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Generate AI-powered refactoring suggestions for a code issue
   */
  async suggestRefactoring(
    code: string,
    issue: CodeIssue,
    options: AISuggestionOptions = {}
  ): Promise<QuickFix[]> {
    const prompt = this.buildRefactoringPrompt(code, issue, options.context);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: options.provider || 'auto',
          maxTokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const data = await response.json();
      return this.parseRefactoringSuggestions(data.response, code);
    } catch (error) {
      console.error('AI suggestion error:', error);
      return [];
    }
  }

  /**
   * Generate smart code completion suggestions
   */
  async suggestCompletion(
    code: string,
    cursorPosition: { line: number; column: number },
    options: AISuggestionOptions = {}
  ): Promise<string[]> {
    const prompt = this.buildCompletionPrompt(code, cursorPosition, options.context);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: options.provider || 'auto',
          maxTokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get completion suggestions');
      }

      const data = await response.json();
      return this.parseCompletionSuggestions(data.response, options.maxSuggestions || 3);
    } catch (error) {
      console.error('Completion suggestion error:', error);
      return [];
    }
  }

  /**
   * Generate documentation for a function or class
   */
  async generateDocumentation(
    code: string,
    type: 'jsdoc' | 'tsdoc' | 'readme',
    options: AISuggestionOptions = {}
  ): Promise<string> {
    const prompt = this.buildDocumentationPrompt(code, type, options.context);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: options.provider || 'auto',
          maxTokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate documentation');
      }

      const data = await response.json();
      return this.parseDocumentation(data.response, type);
    } catch (error) {
      console.error('Documentation generation error:', error);
      return '';
    }
  }

  /**
   * Build prompt for refactoring suggestions
   */
  private buildRefactoringPrompt(code: string, issue: CodeIssue, context?: string): string {
    return `You are a code refactoring expert. Analyze the following code and suggest improvements.

**Code:**
\`\`\`typescript
${code}
\`\`\`

**Issue Detected:**
- Type: ${issue.type}
- Category: ${issue.category}
- Message: ${issue.message}
- Line: ${issue.line}

${context ? `**Additional Context:**\n${context}\n` : ''}

**Task:**
Provide 2-3 refactoring options to fix this issue. For each option:
1. Brief title (one line)
2. Description of what changes
3. Complete refactored code

Format:
OPTION 1: [Title]
Description: [Description]
Code:
\`\`\`typescript
[Refactored code]
\`\`\`

OPTION 2: [Title]
...`;
  }

  /**
   * Build prompt for code completion
   */
  private buildCompletionPrompt(
    code: string,
    cursor: { line: number; column: number },
    context?: string
  ): string {
    const lines = code.split('\n');
    const currentLine = lines[cursor.line - 1] || '';
    const beforeCursor = lines.slice(0, cursor.line).join('\n');

    return `You are a code completion assistant. Suggest completions for the code being written.

**Code Before Cursor:**
\`\`\`typescript
${beforeCursor}
\`\`\`

**Current Line:**
${currentLine}

${context ? `**Context:**\n${context}\n` : ''}

**Task:**
Suggest 3 most likely completions for what the developer is trying to write.
Each suggestion should be complete and syntactically correct.

Format:
1. [Completion 1]
2. [Completion 2]
3. [Completion 3]`;
  }

  /**
   * Build prompt for documentation generation
   */
  private buildDocumentationPrompt(code: string, type: string, context?: string): string {
    const docFormat = type === 'jsdoc' ? 'JSDoc' : type === 'tsdoc' ? 'TSDoc' : 'README markdown';

    return `You are a technical documentation expert. Generate comprehensive documentation for the following code.

**Code:**
\`\`\`typescript
${code}
\`\`\`

${context ? `**Context:**\n${context}\n` : ''}

**Task:**
Generate complete ${docFormat} documentation including:
${type === 'readme' ? `
- Overview
- Installation
- Usage examples
- API reference
` : `
- Description
- @param for each parameter (with types and descriptions)
- @returns with type and description
- @throws for possible errors
- @example with usage example
`}

Format: Pure ${docFormat} without additional explanation.`;
  }

  /**
   * Parse AI response into QuickFix suggestions
   */
  private parseRefactoringSuggestions(response: string, _originalCode: string): QuickFix[] {
    const fixes: QuickFix[] = [];

    // Parse OPTION blocks
    const optionRegex = /OPTION \d+:\s*(.+?)\s*Description:\s*(.+?)\s*Code:\s*```(?:typescript|javascript)?\s*([\s\S]+?)```/g;
    let match;

    while ((match = optionRegex.exec(response)) !== null) {
      fixes.push({
        title: match[1].trim(),
        description: match[2].trim(),
        newCode: match[3].trim(),
        category: 'refactor',
      });
    }

    // Fallback: If no structured options found, try to extract any code blocks
    if (fixes.length === 0) {
      const codeBlockRegex = /```(?:typescript|javascript)?\s*([\s\S]+?)```/g;
      const codeBlocks = [];

      while ((match = codeBlockRegex.exec(response)) !== null) {
        codeBlocks.push(match[1].trim());
      }

      if (codeBlocks.length > 0) {
        fixes.push({
          title: 'AI-suggested refactoring',
          description: 'Improved code based on AI analysis',
          newCode: codeBlocks[0],
          category: 'refactor',
        });
      }
    }

    return fixes;
  }

  /**
   * Parse completion suggestions from AI response
   */
  private parseCompletionSuggestions(response: string, maxSuggestions: number): string[] {
    const suggestions: string[] = [];

    // Try numbered list format
    const listRegex = /^\d+\.\s*(.+?)$/gm;
    let match;

    while ((match = listRegex.exec(response)) !== null && suggestions.length < maxSuggestions) {
      suggestions.push(match[1].trim());
    }

    // Fallback: Split by newlines and filter
    if (suggestions.length === 0) {
      const lines = response.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//') && !line.startsWith('#'));

      suggestions.push(...lines.slice(0, maxSuggestions));
    }

    return suggestions;
  }

  /**
   * Parse documentation from AI response
   */
  private parseDocumentation(response: string, _type: string): string {
    // Remove any markdown code block wrappers if present
    const codeBlockRegex = /```(?:javascript|typescript|markdown)?\s*([\s\S]+?)```/;
    const match = response.match(codeBlockRegex);

    if (match) {
      return match[1].trim();
    }

    // Return as-is if no code block
    return response.trim();
  }
}

/**
 * Singleton instance for easy access
 */
export const aiSuggestionProvider = new AISuggestionProvider();
