/**
 * GeminiProvider Tests
 *
 * Comprehensive tests for Google Gemini AI provider implementation.
 */

import { GeminiProvider, createGeminiProvider } from '../lib/gemini-provider';
import { AIMessage } from '../lib/ai-provider';

// Mock fetch globally
global.fetch = jest.fn();

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  const mockApiKey = 'test-gemini-api-key-123';

  beforeEach(() => {
    provider = new GeminiProvider({ apiKey: mockApiKey });
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create provider with API key', () => {
      expect(provider).toBeInstanceOf(GeminiProvider);
      expect(provider.name).toBe('Gemini');
    });

    it('should throw error without API key', () => {
      expect(() => new GeminiProvider({ apiKey: '' })).toThrow('Gemini API key is required');
    });

    it('should use default base URL', () => {
      const p = new GeminiProvider({ apiKey: 'test' });
      expect(p).toBeDefined();
      // Base URL is private, but we can verify it doesn't throw
    });

    it('should accept custom base URL', () => {
      const customURL = 'https://custom.api.com/v1';
      const p = new GeminiProvider({
        apiKey: 'test',
        baseURL: customURL
      });
      expect(p).toBeDefined();
    });
  });

  describe('Models Configuration', () => {
    it('should have 3 models defined', () => {
      expect(provider.models).toHaveLength(3);
    });

    it('should include gemini-2.5-pro model', () => {
      const model = provider.getModel('gemini-2.5-pro');

      expect(model).toBeDefined();
      expect(model?.name).toBe('Gemini 2.5 Pro');
      expect(model?.maxTokens).toBe(32000);
      expect(model?.capabilities.streaming).toBe(true);
      expect(model?.capabilities.functionCalling).toBe(true);
      expect(model?.capabilities.vision).toBe(true);
    });

    it('should include gemini-2.5-flash model', () => {
      const model = provider.getModel('gemini-2.5-flash');

      expect(model).toBeDefined();
      expect(model?.name).toBe('Gemini 2.5 Flash');
      expect(model?.maxTokens).toBe(32000);
      expect(model?.capabilities.streaming).toBe(true);
      expect(model?.capabilities.functionCalling).toBe(true);
      expect(model?.capabilities.vision).toBe(false);
    });

    it('should include gemini-2.0-flash model', () => {
      const model = provider.getModel('gemini-2.0-flash');

      expect(model).toBeDefined();
      expect(model?.name).toBe('Gemini 2.0 Flash');
    });

    it('should have correct cost structure', () => {
      const proModel = provider.getModel('gemini-2.5-pro');
      const flashModel = provider.getModel('gemini-2.5-flash');

      expect(proModel?.costPer1kTokens.input).toBe(0.00025);
      expect(proModel?.costPer1kTokens.output).toBe(0.0005);

      expect(flashModel?.costPer1kTokens.input).toBe(0.000125);
      expect(flashModel?.costPer1kTokens.output).toBe(0.000375);

      // Flash should be cheaper than Pro
      expect(flashModel!.costPer1kTokens.input).toBeLessThan(proModel!.costPer1kTokens.input);
    });
  });

  describe('chat()', () => {
    const messages: AIMessage[] = [
      { role: 'user', content: 'Hello, Gemini!' }
    ];

    const mockSuccessResponse = {
      candidates: [{
        content: {
          parts: [{ text: 'Hello! How can I help you today?' }]
        },
        finishReason: 'STOP'
      }],
      usageMetadata: {
        promptTokenCount: 10,
        candidatesTokenCount: 20,
        totalTokenCount: 30
      }
    };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse,
        text: async () => JSON.stringify(mockSuccessResponse)
      });
    });

    it('should send chat request successfully', async () => {
      const response = await provider.chat(messages, { model: 'gemini-2.5-flash' });

      expect(response).toBeDefined();
      expect(response.content).toBe('Hello! How can I help you today?');
      expect(response.model).toBe('gemini-2.5-flash');
      expect(response.finishReason).toBe('stop');
    });

    it('should include usage metadata', async () => {
      const response = await provider.chat(messages, { model: 'gemini-2.5-flash' });

      expect(response.usage).toBeDefined();
      expect(response.usage?.inputTokens).toBe(10);
      expect(response.usage?.outputTokens).toBe(20);
      expect(response.usage?.totalCost).toBeGreaterThan(0);
    });

    it('should calculate cost correctly', async () => {
      const response = await provider.chat(messages, { model: 'gemini-2.5-flash' });

      const model = provider.getModel('gemini-2.5-flash')!;
      const expectedCost = provider.calculateCost(model, 10, 20);

      expect(response.usage?.totalCost).toBeCloseTo(expectedCost, 10);
    });

    it('should send correct API request', async () => {
      await provider.chat(messages, {
        model: 'gemini-2.5-flash',
        temperature: 0.8,
        maxTokens: 1024
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('gemini-2.5-flash:generateContent'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('"temperature":0.8')
        })
      );
    });

    it('should use default temperature and maxTokens', async () => {
      await provider.chat(messages, { model: 'gemini-2.5-flash' });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.generationConfig.temperature).toBe(0.7);
      expect(body.generationConfig.maxOutputTokens).toBe(2048);
    });

    it('should include system prompt if provided', async () => {
      await provider.chat(messages, {
        model: 'gemini-2.5-flash',
        systemPrompt: 'You are a helpful assistant.'
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      const prompt = body.contents[0].parts[0].text;

      expect(prompt).toContain('System: You are a helpful assistant.');
    });

    it('should handle model not found error', async () => {
      await expect(
        provider.chat(messages, { model: 'non-existent-model' })
      ).rejects.toThrow('Model non-existent-model not found');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      });

      await expect(
        provider.chat(messages, { model: 'gemini-2.5-flash' })
      ).rejects.toThrow('Gemini API error: 400');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        provider.chat(messages, { model: 'gemini-2.5-flash' })
      ).rejects.toThrow('Gemini chat error');
    });

    it('should handle malformed API response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}) // Empty response
      });

      const response = await provider.chat(messages, { model: 'gemini-2.5-flash' });

      expect(response.content).toBe('');
      expect(response.finishReason).toBe('error');
    });

    it('should handle MAX_TOKENS finish reason', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: { parts: [{ text: 'Truncated response' }] },
            finishReason: 'MAX_TOKENS'
          }]
        })
      });

      const response = await provider.chat(messages, { model: 'gemini-2.5-flash' });

      expect(response.finishReason).toBe('length');
    });

    it('should format multi-turn conversation correctly', async () => {
      const conversation: AIMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'How are you?' }
      ];

      await provider.chat(conversation, { model: 'gemini-2.5-flash' });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      const prompt = body.contents[0].parts[0].text;

      expect(prompt).toContain('User: Hello');
      expect(prompt).toContain('Model: Hi there!');
      expect(prompt).toContain('User: How are you?');
    });
  });

  describe('stream()', () => {
    const messages: AIMessage[] = [
      { role: 'user', content: 'Count to 5' }
    ];

    it('should stream response chunks', async () => {
      const mockStreamData = [
        JSON.stringify({ candidates: [{ content: { parts: [{ text: 'One' }] } }] }),
        JSON.stringify({ candidates: [{ content: { parts: [{ text: ' Two' }] } }] }),
        JSON.stringify({ candidates: [{ content: { parts: [{ text: ' Three' }] } }] })
      ].join('\n');

      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(mockStreamData)
          })
          .mockResolvedValueOnce({ done: true, value: undefined })
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader
        }
      });

      const chunks: string[] = [];

      for await (const chunk of provider.stream(messages, { model: 'gemini-2.5-flash' })) {
        if (!chunk.done) {
          chunks.push(chunk.content);
        }
      }

      expect(chunks).toEqual(['One', ' Two', ' Three']);
    });

    it('should emit done signal at end', async () => {
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ done: true, value: undefined })
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader
        }
      });

      let lastChunk;

      for await (const chunk of provider.stream(messages, { model: 'gemini-2.5-flash' })) {
        lastChunk = chunk;
      }

      expect(lastChunk?.done).toBe(true);
    });

    it('should handle model not found error', async () => {
      const generator = provider.stream(messages, { model: 'non-existent' });

      await expect(generator.next()).rejects.toThrow('Model non-existent not found');
    });

    it('should handle missing response body', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: null
      });

      const generator = provider.stream(messages, { model: 'gemini-2.5-flash' });

      await expect(generator.next()).rejects.toThrow('No response body for streaming');
    });

    it('should skip malformed JSON chunks', async () => {
      const mockStreamData = [
        JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Valid' }] } }] }),
        'invalid json{{{',
        JSON.stringify({ candidates: [{ content: { parts: [{ text: ' chunk' }] } }] })
      ].join('\n');

      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(mockStreamData)
          })
          .mockResolvedValueOnce({ done: true, value: undefined })
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader
        }
      });

      const chunks: string[] = [];

      for await (const chunk of provider.stream(messages, { model: 'gemini-2.5-flash' })) {
        if (!chunk.done) {
          chunks.push(chunk.content);
        }
      }

      // Should skip malformed chunk but process valid ones
      expect(chunks).toEqual(['Valid', ' chunk']);
    });

    it('should handle empty content in chunks', async () => {
      const mockStreamData = [
        JSON.stringify({ candidates: [{ content: { parts: [{ text: '' }] } }] }), // Empty
        JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Content' }] } }] })
      ].join('\n');

      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(mockStreamData)
          })
          .mockResolvedValueOnce({ done: true, value: undefined })
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader
        }
      });

      const chunks: string[] = [];

      for await (const chunk of provider.stream(messages, { model: 'gemini-2.5-flash' })) {
        if (!chunk.done) {
          chunks.push(chunk.content);
        }
      }

      // Should only include non-empty chunks
      expect(chunks).toEqual(['Content']);
    });
  });

  describe('validateConnection()', () => {
    it('should return true for successful connection', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: { parts: [{ text: 'Test' }] },
            finishReason: 'STOP'
          }]
        })
      });

      const isValid = await provider.validateConnection();

      expect(isValid).toBe(true);
    });

    it('should return false for failed connection', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const isValid = await provider.validateConnection();

      expect(isValid).toBe(false);
    });

    it('should use gemini-flash for validation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: { parts: [{ text: 'Test' }] },
            finishReason: 'STOP'
          }]
        })
      });

      await provider.validateConnection();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('gemini-flash'),
        expect.anything()
      );
    });
  });

  describe('createGeminiProvider() factory', () => {
    it('should create provider with API key', () => {
      const provider = createGeminiProvider('test-key');

      expect(provider).toBeInstanceOf(GeminiProvider);
      expect(provider.name).toBe('Gemini');
    });

    it('should throw error without API key', () => {
      expect(() => createGeminiProvider('')).toThrow('Gemini API key is required');
    });
  });
});
