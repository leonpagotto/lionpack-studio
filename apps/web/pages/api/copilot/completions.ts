/**
 * Copilot Completions API
 *
 * Provides AI-powered code completions similar to GitHub Copilot
 * Uses Gemini/GPT for generating suggestions
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { GeminiProvider } from '@lionpack/leo-client';

interface CompletionRequest {
  code: string;
  language: string;
  cursorPosition: {
    line: number;
    column: number;
  };
  context?: {
    fileName?: string;
    imports?: string[];
    nearbyCode?: string;
  };
}

interface Completion {
  text: string;
  displayText: string;
  position: {
    line: number;
    column: number;
  };
  range: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

interface CompletionResponse {
  completions: Completion[];
  model: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CompletionResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, language, cursorPosition, context }: CompletionRequest = req.body;

    // Validate request
    if (!code || !language || !cursorPosition) {
      return res.status(400).json({ error: 'Missing required fields: code, language, cursorPosition' });
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    // Initialize AI provider
    const provider = new GeminiProvider({ apiKey });

    // Build completion prompt
    const prompt = buildCompletionPrompt(code, language, cursorPosition, context);

    // Get completion from AI
    const response = await provider.chat(
      [{ role: 'user', content: prompt }],
      {
        model: 'gemini-2.5-flash',
        temperature: 0.3, // Lower temperature for more deterministic completions
        maxTokens: 200,
        stream: false,
      }
    );

    // Parse completion response
    const completion = parseCompletion(response.content, code, cursorPosition);

    return res.status(200).json({
      completions: [completion],
      model: response.model,
    });
  } catch (error) {
    console.error('Copilot completion error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate completion',
    });
  }
}

/**
 * Build a prompt for code completion
 */
function buildCompletionPrompt(
  code: string,
  language: string,
  cursorPosition: { line: number; column: number },
  context?: CompletionRequest['context']
): string {
  const lines = code.split('\n');
  const currentLine = lines[cursorPosition.line - 1] || '';
  const beforeCursor = currentLine.substring(0, cursorPosition.column);
  const afterCursor = currentLine.substring(cursorPosition.column);

  // Context lines (3 before, 3 after)
  const contextBefore = lines.slice(Math.max(0, cursorPosition.line - 4), cursorPosition.line - 1).join('\n');
  const contextAfter = lines.slice(cursorPosition.line, cursorPosition.line + 3).join('\n');

  let prompt = `You are an expert ${language} code completion assistant. Complete the code at the cursor position.

Language: ${language}`;

  if (context?.fileName) {
    prompt += `\nFile: ${context.fileName}`;
  }

  if (context?.imports && context.imports.length > 0) {
    prompt += `\nImports:\n${context.imports.join('\n')}`;
  }

  prompt += `

Context before cursor:
\`\`\`${language}
${contextBefore}
\`\`\`

Current line (cursor at |):
\`\`\`${language}
${beforeCursor}|${afterCursor}
\`\`\`

Context after cursor:
\`\`\`${language}
${contextAfter}
\`\`\`

Complete the code at the cursor position (|). Provide ONLY the completion text, no explanations.
The completion should:
1. Be syntactically correct
2. Follow ${language} best practices
3. Match the existing code style
4. Be concise (1-3 lines max)

Completion:`;

  return prompt;
}

/**
 * Parse AI response into completion object
 */
function parseCompletion(
  aiResponse: string,
  originalCode: string,
  cursorPosition: { line: number; column: number }
): Completion {
  // Clean up AI response
  let completionText = aiResponse.trim();

  // Remove code block markers if present
  completionText = completionText.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');

  // Remove common prefixes
  completionText = completionText.replace(/^(Completion:|Here's the completion:|The completion is:)\s*/i, '');

  // Trim whitespace
  completionText = completionText.trim();

  // If completion is empty, provide a default
  if (!completionText) {
    completionText = '';
  }

  return {
    text: completionText,
    displayText: completionText,
    position: {
      line: cursorPosition.line,
      column: cursorPosition.column,
    },
    range: {
      start: {
        line: cursorPosition.line,
        column: cursorPosition.column,
      },
      end: {
        line: cursorPosition.line,
        column: cursorPosition.column,
      },
    },
  };
}
