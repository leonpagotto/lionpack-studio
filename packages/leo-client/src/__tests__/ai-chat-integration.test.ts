/**
 * AI Chat Integration Tests
 *
 * Tests the integration between ChatContainer and AI providers (Gemini)
 * These tests require a real API key in GOOGLE_AI_API_KEY environment variable.
 *
 * Run with: npm test -- ai-chat-integration.test.ts
 */

import { GeminiProvider } from '../lib/gemini-provider';
import type { AIMessage } from '../lib/ai-provider';

describe('AI Chat Integration', () => {
  let provider: GeminiProvider;
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  // Skip tests if no API key configured
  const describeOrSkip = apiKey ? describe : describe.skip;

  beforeAll(() => {
    if (apiKey) {
      provider = new GeminiProvider({ apiKey });
    }
  });

  describeOrSkip('Gemini Provider Integration', () => {
    test('should generate a simple response', async () => {
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: 'Say hello in exactly 3 words'
        }
      ];

      const response = await provider.chat(messages, {
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 100
      });

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      expect(response.model).toBe('gemini-2.5-flash');
      expect(response.finishReason).toBe('stop');

      // Should have usage metrics
      expect(response.usage).toBeDefined();
      expect(response.usage?.inputTokens).toBeGreaterThan(0);
      expect(response.usage?.outputTokens).toBeGreaterThan(0);
      expect(response.usage?.totalCost).toBeGreaterThan(0);

      console.log('✅ Gemini Response:', response.content);
      console.log('💰 Cost:', response.usage?.totalCost);
    }, 15000); // 15s timeout

    test('should handle streaming responses', async () => {
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: 'Count from 1 to 5'
        }
      ];

      const chunks: string[] = [];

      for await (const chunk of provider.stream(messages, {
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 100
      })) {
        expect(chunk).toBeDefined();
        expect(chunk.content).toBeTruthy();
        chunks.push(chunk.content);
      }

      expect(chunks.length).toBeGreaterThan(0);
      const fullContent = chunks.join('');
      expect(fullContent).toBeTruthy();

      console.log('✅ Streaming chunks received:', chunks.length);
      console.log('📝 Full content:', fullContent);
    }, 15000);

    test('should handle code generation requests', async () => {
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: 'Write a TypeScript function that adds two numbers. Keep it simple, just the function.'
        }
      ];

      const response = await provider.chat(messages, {
        model: 'gemini-2.5-flash',
        temperature: 0.3, // Lower temperature for code
        maxTokens: 500
      });

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();

      // Should contain TypeScript code
      expect(response.content).toMatch(/function|const|=>/);
      expect(response.content).toMatch(/number/i);

      console.log('✅ Generated code:', response.content);
    }, 15000);

    test('should handle conversation history', async () => {
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: 'My name is Alice'
        },
        {
          role: 'assistant',
          content: 'Nice to meet you, Alice!'
        },
        {
          role: 'user',
          content: 'What is my name?'
        }
      ];

      const response = await provider.chat(messages, {
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 100
      });

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();

      // Should remember the name from context
      expect(response.content.toLowerCase()).toContain('alice');

      console.log('✅ Context-aware response:', response.content);
    }, 15000);

    test('should handle error cases gracefully', async () => {
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: 'Test message'
        }
      ];

      // Test with invalid model
      await expect(
        provider.chat(messages, {
          model: 'invalid-model-name',
          temperature: 0.7,
          maxTokens: 100
        })
      ).rejects.toThrow();
    }, 10000);
  });

  describeOrSkip('Chat API Endpoint', () => {
    test('should handle non-streaming requests', async () => {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Say hello in one word'
            }
          ],
          provider: 'gemini',
          stream: false
        })
      });

      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data).toBeDefined();
      expect(data.content).toBeTruthy();
      expect(data.model).toBe('gemini-2.5-flash');

      console.log('✅ API Response:', data);
    }, 10000);

    test('should handle streaming requests', async () => {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Count to 3'
            }
          ],
          provider: 'gemini',
          stream: true
        })
      });

      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toBe('text/event-stream');

      const reader = response.body?.getReader();
      expect(reader).toBeDefined();

      const decoder = new TextDecoder();
      const chunks: string[] = [];
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  chunks.push(parsed.content);
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      expect(chunks.length).toBeGreaterThan(0);
      console.log('✅ Streaming chunks:', chunks.length);
    }, 15000);
  });
});

// Export for CI/CD skip logic
export const requiresAPIKey = !process.env.GOOGLE_AI_API_KEY;
