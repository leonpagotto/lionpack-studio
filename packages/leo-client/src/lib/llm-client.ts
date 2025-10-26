/**
 * @file LLM Client for interacting with Anthropic's Claude API.
 *
 * This module provides a centralized client for making requests to the Claude API,
 * supporting both streaming and non-streaming responses.
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Configuration for the LLM client.
 */
export interface LLMClientConfig {
  /** The Anthropic API key. */
  apiKey: string;
  /** The model to use (e.g., "claude-3-5-sonnet-20241022"). */
  model?: string;
  /** Maximum tokens to generate. */
  maxTokens?: number;
  /** Temperature for response generation (0-1). */
  temperature?: number;
}

/**
 * Response from a non-streaming LLM request.
 */
export interface LLMResponse {
  /** The generated text content. */
  content: string;
  /** Number of tokens used in the request. */
  tokensUsed: number;
  /** The model that generated the response. */
  model: string;
}

/**
 * A client for interacting with the Claude API.
 */
export class LLMClient {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  /**
   * Creates a new LLM client.
   * @param config - Configuration for the client.
   */
  constructor(config: LLMClientConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
  }

  /**
   * Sends a non-streaming request to the Claude API.
   * @param systemPrompt - The system prompt to guide the model's behavior.
   * @param userPrompt - The user's input prompt.
   * @returns A promise resolving to the LLM response.
   */
  async complete(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('');

    return {
      content,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      model: response.model,
    };
  }

  /**
   * Sends a streaming request to the Claude API.
   * @param systemPrompt - The system prompt to guide the model's behavior.
   * @param userPrompt - The user's input prompt.
   * @param onChunk - Callback invoked for each streamed chunk of text.
   * @returns A promise resolving to the complete LLM response.
   */
  async streamComplete(
    systemPrompt: string,
    userPrompt: string,
    onChunk: (chunk: string) => void
  ): Promise<LLMResponse> {
    const stream = await this.client.messages.stream({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;
    let modelUsed = this.model;

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = event.delta.text;
        fullContent += chunk;
        onChunk(chunk);
      } else if (event.type === 'message_start') {
        inputTokens = event.message.usage.input_tokens;
        modelUsed = event.message.model;
      } else if (event.type === 'message_delta') {
        outputTokens = event.usage.output_tokens;
      }
    }

    return {
      content: fullContent,
      tokensUsed: inputTokens + outputTokens,
      model: modelUsed,
    };
  }
}
