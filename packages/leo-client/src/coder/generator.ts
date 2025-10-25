/**
 * @file Code generator module for the Coder Agent.
 *
 * This module handles the core code generation logic using the LLM client.
 */

import { LLMClient } from '../lib/llm-client';
import { CodeGenerationRequest } from './types';
import { CODE_GENERATION_SYSTEM_PROMPT } from './prompts/system';
import { buildCodeGenerationPrompt, buildTestGenerationPrompt } from './prompts/templates';

/**
 * Result of code generation.
 */
export interface GenerationResult {
  /** The generated code. */
  code: string;
  /** The generated tests (if requested). */
  tests?: string;
  /** Number of tokens used. */
  tokensUsed: number;
  /** The model used for generation. */
  model: string;
  /** Execution time in milliseconds. */
  executionTime: number;
}

/**
 * Generates code based on a user request.
 *
 * @param request - The code generation request.
 * @param apiKey - The Anthropic API key.
 * @param onChunk - Optional callback for streaming chunks.
 * @returns A promise resolving to the generation result.
 */
export async function generateCode(
  request: CodeGenerationRequest,
  apiKey: string,
  onChunk?: (chunk: string) => void
): Promise<GenerationResult> {
  const startTime = Date.now();

  const client = new LLMClient({
    apiKey,
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 4096,
    temperature: 0.7,
  });

  const userPrompt = buildCodeGenerationPrompt(request);

  let codeResponse;
  if (request.streaming && onChunk) {
    codeResponse = await client.streamComplete(
      CODE_GENERATION_SYSTEM_PROMPT,
      userPrompt,
      onChunk
    );
  } else {
    codeResponse = await client.complete(CODE_GENERATION_SYSTEM_PROMPT, userPrompt);
  }

  let testsResponse;
  let totalTokens = codeResponse.tokensUsed;

  if (request.includeTests !== false) {
    const testPrompt = buildTestGenerationPrompt(
      codeResponse.content,
      request.language || 'typescript',
      request.testCoverage || 80
    );
    testsResponse = await client.complete(CODE_GENERATION_SYSTEM_PROMPT, testPrompt);
    totalTokens += testsResponse.tokensUsed;
  }

  const executionTime = Date.now() - startTime;

  return {
    code: codeResponse.content.trim(),
    tests: testsResponse?.content.trim(),
    tokensUsed: totalTokens,
    model: codeResponse.model,
    executionTime,
  };
}
