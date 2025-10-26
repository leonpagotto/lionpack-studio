/**
 * @file API endpoint for code generation.
 *
 * Handles POST requests to generate code using the Coder Agent.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { generateCode } from '@/../../packages/leo-client/src/coder/generator';
import { validateCode } from '@/../../packages/leo-client/src/coder/validator';
import { formatCode } from '@/../../packages/leo-client/src/coder/formatter';
import { estimateTestCoverage } from '@/../../packages/leo-client/src/coder/test-generator';
import type { CodeGenerationRequest, GeneratedCode } from '@/../../packages/leo-client/src/coder/types';

/**
 * API handler for code generation.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeneratedCode | { error: string }>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const request: CodeGenerationRequest = req.body;

    // Validate required fields
    if (!request.prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const startTime = Date.now();

    // Generate code
    const result = await generateCode(request, apiKey);

    // Format the generated code
    const formattedCode = await formatCode(
      result.code,
      request.language || 'typescript'
    );

    let formattedTests = result.tests;
    if (formattedTests) {
      formattedTests = await formatCode(
        formattedTests,
        request.language || 'typescript'
      );
    }

    // Validate the generated code
    const validation = validateCode(
      formattedCode,
      request.language || 'typescript'
    );

    // Estimate test coverage
    const coverage = formattedTests
      ? estimateTestCoverage(formattedCode, formattedTests)
      : 0;

    const executionTime = Date.now() - startTime;

    // Build response
    const response: GeneratedCode = {
      code: formattedCode,
      tests: formattedTests || '',
      quality: {
        hasTypeErrors: validation.hasTypeErrors,
        hasLintErrors: validation.hasLintErrors,
        testCoverage: coverage,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        modelUsed: result.model,
        executionTime,
        tokensUsed: result.tokensUsed,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Code generation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Code generation failed',
    });
  }
}
