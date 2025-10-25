/**
 * @file Tests for the code generator module.
 */

import { generateCode } from '../generator';

// Mock the LLM client
jest.mock('../../lib/llm-client', () => ({
  LLMClient: jest.fn().mockImplementation(() => ({
    complete: jest.fn().mockResolvedValue({
      content: `export function add(a: number, b: number): number {
  return a + b;
}`,
      tokensUsed: 150,
      model: 'claude-3-5-sonnet-20241022',
    }),
    streamComplete: jest.fn().mockResolvedValue({
      content: `export function multiply(a: number, b: number): number {
  return a * b;
}`,
      tokensUsed: 200,
      model: 'claude-3-5-sonnet-20241022',
    }),
  })),
}));

describe('Code Generator', () => {
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCode', () => {
    it('should generate code successfully', async () => {
      const request = {
        prompt: 'Create a function to add two numbers',
        language: 'typescript' as const,
        includeTests: false,
      };

      const result = await generateCode(request, mockApiKey);

      expect(result.code).toContain('function add');
      expect(result.tokensUsed).toBeGreaterThan(0);
      expect(result.model).toBe('claude-3-5-sonnet-20241022');
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should generate code with tests when requested', async () => {
      const request = {
        prompt: 'Create a function to multiply two numbers',
        language: 'typescript' as const,
        includeTests: true,
        testCoverage: 80,
      };

      const result = await generateCode(request, mockApiKey);

      expect(result.code).toBeDefined();
      expect(result.tests).toBeDefined();
      expect(result.tokensUsed).toBeGreaterThan(0);
    });

    it('should handle streaming when enabled', async () => {
      const chunks: string[] = [];
      const onChunk = (chunk: string) => chunks.push(chunk);

      const request = {
        prompt: 'Create a utility function',
        language: 'typescript' as const,
        streaming: true,
        includeTests: false,
      };

      const result = await generateCode(request, mockApiKey, onChunk);

      expect(result.code).toBeDefined();
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });
  });
});
