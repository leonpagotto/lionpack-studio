/**
 * Multi-Provider AI Chat API
 *
 * Supports multiple AI providers (Claude, GPT, Gemini) with streaming.
 *
 * Constitution Alignment:
 * - Speed with Purpose: Streaming for instant feedback
 * - Facilitation over Complexity: Single endpoint, multiple providers
 * - Cost Efficiency: Provider/model selection based on user needs
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { GeminiProvider } from '@lionpack/leo-client';
import type { AIMessage } from '@lionpack/leo-client';

/**
 * Chat request body
 */
interface ChatRequest {
  messages: AIMessage[];
  provider?: 'gemini' | 'claude' | 'gpt';
  model?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Initialize AI providers
 */
function getProvider(providerName: string) {
  switch (providerName.toLowerCase()) {
    case 'gemini':
      const geminiKey = process.env.GOOGLE_AI_API_KEY;
      if (!geminiKey) {
        throw new Error('GOOGLE_AI_API_KEY not configured');
      }
      return new GeminiProvider({ apiKey: geminiKey });

    case 'claude':
      // TODO: Implement Claude provider
      throw new Error('Claude provider not yet implemented');

    case 'gpt':
      // TODO: Implement GPT provider
      throw new Error('GPT provider not yet implemented');

    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

/**
 * Get default model for provider
 */
function getDefaultModel(providerName: string): string {
  switch (providerName.toLowerCase()) {
    case 'gemini':
      return 'gemini-flash'; // Most cost-effective
    case 'claude':
      return 'claude-3-sonnet-20240229';
    case 'gpt':
      return 'gpt-4-turbo';
    default:
      return 'gemini-flash';
  }
}

/**
 * Chat API Handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      messages,
      provider = 'gemini',
      model,
      stream = true,
      temperature = 0.7,
      maxTokens = 2048
    } = req.body as ChatRequest;

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Get provider instance
    const aiProvider = getProvider(provider);

    // Use provided model or default
    const selectedModel = model || getDefaultModel(provider);

    // Validate model exists
    if (!aiProvider.getModel(selectedModel)) {
      return res.status(400).json({
        error: `Model ${selectedModel} not available for ${provider}`,
        availableModels: aiProvider.getModels().map((m) => m.id)
      });
    }

    // Chat options
    const options = {
      model: selectedModel,
      temperature,
      maxTokens,
      stream
    };

    // Handle streaming response
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        for await (const chunk of aiProvider.stream(messages, options)) {
          if (chunk.done) {
            res.write(`data: [DONE]\n\n`);
            break;
          }

          res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
        }
        res.end();
      } catch (streamError) {
        const error = streamError as Error;
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    } else {
      // Handle non-streaming response
      const response = await aiProvider.chat(messages, options);

      return res.status(200).json({
        content: response.content,
        model: response.model,
        usage: response.usage,
        finishReason: response.finishReason
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
