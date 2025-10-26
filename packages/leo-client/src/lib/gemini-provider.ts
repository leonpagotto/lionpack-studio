/**
 * Google Gemini AI Provider
 *
 * Implementation of AIProvider for Google's Gemini models.
 * Supports: gemini-pro, gemini-flash, gemini-ultra
 *
 * Constitution Alignment:
 * - Speed with Purpose: Fast, streaming responses
 * - Cost Efficiency: gemini-flash for cost-effective operations
 * - Quality: gemini-ultra for high-stakes generation
 */

import {
  AIProvider,
  AIMessage,
  AIModel,
  AIProviderConfig,
  ChatOptions,
  ChatResponse,
  StreamChunk
} from './ai-provider';

/**
 * Gemini-specific configuration
 */
export interface GeminiConfig extends AIProviderConfig {
  apiKey: string;
  baseURL?: string;
}

/**
 * Gemini AI Provider Implementation
 */
export class GeminiProvider extends AIProvider {
  readonly name = 'Gemini';
  readonly models: AIModel[] = [
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      description: 'Most capable model for complex tasks',
      maxTokens: 32000,
      costPer1kTokens: {
        input: 0.00025,
        output: 0.0005
      },
      capabilities: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      description: 'Fastest and most cost-effective (recommended)',
      maxTokens: 32000,
      costPer1kTokens: {
        input: 0.000125,
        output: 0.000375
      },
      capabilities: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      description: 'Previous generation flash model',
      maxTokens: 32000,
      costPer1kTokens: {
        input: 0.000125,
        output: 0.000375
      },
      capabilities: {
        streaming: true,
        functionCalling: true,
        vision: false
      }
    }
  ];

  private apiKey: string;
  private baseURL: string;

  constructor(config: GeminiConfig) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://generativelanguage.googleapis.com/v1';

    if (!this.apiKey) {
      throw new Error('Gemini API key is required');
    }
  }

  /**
   * Format messages for Gemini API
   */
  private formatMessages(messages: AIMessage[], systemPrompt?: string): string {
    let prompt = '';

    // Add system prompt if provided
    if (systemPrompt) {
      prompt += `System: ${systemPrompt}\n\n`;
    }

    // Format conversation history
    for (const message of messages) {
      const role = message.role === 'assistant' ? 'Model' : 'User';
      prompt += `${role}: ${message.content}\n\n`;
    }

    // Add final prompt for model to respond
    prompt += 'Model:';

    return prompt;
  }

  /**
   * Make API request to Gemini
   */
  private async makeRequest(
    endpoint: string,
    body: any
  ): Promise<Response> {
    const url = `${this.baseURL}/${endpoint}?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    return response;
  }

  /**
   * Send chat message and get complete response
   */
  async chat(
    messages: AIMessage[],
    options: ChatOptions
  ): Promise<ChatResponse> {
    const model = this.getModel(options.model);
    if (!model) {
      throw new Error(`Model ${options.model} not found`);
    }

    const prompt = this.formatMessages(messages, options.systemPrompt);

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2048,
      }
    };

    try {
      const response = await this.makeRequest(
        `models/${options.model}:generateContent`,
        requestBody
      );

      const data = await response.json();

      // Extract response text
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Extract usage metadata
      const usage = data.usageMetadata ? {
        inputTokens: data.usageMetadata.promptTokenCount || 0,
        outputTokens: data.usageMetadata.candidatesTokenCount || 0,
        totalCost: this.calculateCost(
          model,
          data.usageMetadata.promptTokenCount || 0,
          data.usageMetadata.candidatesTokenCount || 0
        )
      } : undefined;

      // Determine finish reason
      const finishReason = data.candidates?.[0]?.finishReason === 'STOP'
        ? 'stop'
        : data.candidates?.[0]?.finishReason === 'MAX_TOKENS'
        ? 'length'
        : 'error';

      return {
        content,
        usage,
        model: options.model,
        finishReason
      };
    } catch (error) {
      throw new Error(`Gemini chat error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stream chat responses for real-time display
   */
  async *stream(
    messages: AIMessage[],
    options: ChatOptions
  ): AsyncGenerator<StreamChunk> {
    const model = this.getModel(options.model);
    if (!model) {
      throw new Error(`Model ${options.model} not found`);
    }

    const prompt = this.formatMessages(messages, options.systemPrompt);

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2048,
      }
    };

    try {
      const response = await this.makeRequest(
        `models/${options.model}:streamGenerateContent`,
        requestBody
      );

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          yield { content: '', done: true };
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete JSON objects from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim() || line.trim() === '[' || line.trim() === ']') {
            continue;
          }

          try {
            // Remove trailing comma if present
            const jsonStr = line.trim().replace(/,$/, '');
            const data = JSON.parse(jsonStr);

            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (content) {
              yield { content, done: false };
            }
          } catch (e) {
            // Skip malformed JSON chunks
            console.warn('Skipping malformed JSON chunk:', line);
          }
        }
      }
    } catch (error) {
      throw new Error(`Gemini stream error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate API key and connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      const testMessages: AIMessage[] = [
        { role: 'user', content: 'Hello' }
      ];

      await this.chat(testMessages, { model: 'gemini-flash' });
      return true;
    } catch (error) {
      console.error('Gemini connection validation failed:', error);
      return false;
    }
  }
}

/**
 * Factory function to create Gemini provider
 */
export function createGeminiProvider(apiKey: string): GeminiProvider {
  return new GeminiProvider({ apiKey });
}
