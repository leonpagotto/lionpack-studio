/**
 * @file Tests for the generate-code API endpoint.
 */

import { createMocks } from 'node-mocks-http';
import handler from '../generate-code';
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock the coder modules
jest.mock('@/../../packages/leo-client/src/coder/generator', () => ({
  generateCode: jest.fn().mockResolvedValue({
    code: 'export function test() { return true; }',
    tests: 'describe("test", () => { it("works", () => { expect(test()).toBe(true); }); });',
    tokensUsed: 250,
    model: 'claude-3-5-sonnet-20241022',
    executionTime: 1500,
  }),
}));

jest.mock('@/../../packages/leo-client/src/coder/validator', () => ({
  validateCode: jest.fn().mockReturnValue({
    hasTypeErrors: false,
    hasLintErrors: false,
    typeErrors: [],
    lintErrors: [],
  }),
}));

jest.mock('@/../../packages/leo-client/src/coder/formatter', () => ({
  formatCode: jest.fn().mockImplementation((code) => Promise.resolve(code)),
}));

jest.mock('@/../../packages/leo-client/src/coder/test-generator', () => ({
  estimateTestCoverage: jest.fn().mockReturnValue(85),
}));

describe('/api/generate-code', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test-api-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Method not allowed' });
  });

  it('should return 400 if prompt is missing', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Prompt is required' });
  });

  it('should return 500 if API key is not configured', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: { prompt: 'Create a function' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'ANTHROPIC_API_KEY not configured',
    });
  });

  it('should generate code successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        prompt: 'Create a function to add two numbers',
        language: 'typescript',
        framework: 'react',
        includeTests: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const responseData = JSON.parse(res._getData());
    expect(responseData.code).toBeDefined();
    expect(responseData.tests).toBeDefined();
    expect(responseData.quality).toBeDefined();
    expect(responseData.metadata).toBeDefined();
    expect(responseData.quality.testCoverage).toBe(85);
  });
});
