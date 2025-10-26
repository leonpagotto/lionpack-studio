/**
 * AI Provider Interface
 *
 * Abstract interface for multi-AI provider support.
 * Enables switching between Claude, GPT, Gemini, and other models.
 *
 * Constitution Alignment:
 * - Facilitation over Complexity: Simple, consistent interface
 * - Speed with Purpose: Streaming support for fast responses
 * - Quality through Standards: Type-safe, well-documented
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPer1kTokens: {
    input: number;
    output: number;
  };
  capabilities: {
    streaming: boolean;
    functionCalling: boolean;
    vision: boolean;
  };
}

export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ChatOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
}

export interface ChatResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };
  model: string;
  finishReason: 'stop' | 'length' | 'error';
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

/**
 * Abstract AI Provider Interface
 *
 * All AI providers (Claude, GPT, Gemini) must implement this interface.
 */
export abstract class AIProvider {
  abstract readonly name: string;
  abstract readonly models: AIModel[];
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  /**
   * Send a chat message and get a complete response.
   *
   * @param messages - Conversation history
   * @param options - Chat configuration options
   * @returns Promise with complete response
   */
  abstract chat(
    messages: AIMessage[],
    options: ChatOptions
  ): Promise<ChatResponse>;

  /**
   * Stream chat responses for real-time display.
   *
   * @param messages - Conversation history
   * @param options - Chat configuration options
   * @returns AsyncGenerator yielding response chunks
   */
  abstract stream(
    messages: AIMessage[],
    options: ChatOptions
  ): AsyncGenerator<StreamChunk>;

  /**
   * Get available models for this provider.
   */
  getModels(): AIModel[] {
    return this.models;
  }

  /**
   * Get a specific model by ID.
   */
  getModel(modelId: string): AIModel | undefined {
    return this.models.find(m => m.id === modelId);
  }

  /**
   * Validate API key and connection.
   */
  abstract validateConnection(): Promise<boolean>;

  /**
   * Calculate cost for a chat request.
   */
  calculateCost(
    model: AIModel,
    inputTokens: number,
    outputTokens: number
  ): number {
    const inputCost = (inputTokens / 1000) * model.costPer1kTokens.input;
    const outputCost = (outputTokens / 1000) * model.costPer1kTokens.output;
    return inputCost + outputCost;
  }
}

/**
 * Provider Registry
 *
 * Central registry for all available AI providers.
 */
export class AIProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();

  register(provider: AIProvider): void {
    this.providers.set(provider.name.toLowerCase(), provider);
  }

  get(providerName: string): AIProvider | undefined {
    return this.providers.get(providerName.toLowerCase());
  }

  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getAllModels(): { provider: string; models: AIModel[] }[] {
    return this.getAll().map(provider => ({
      provider: provider.name,
      models: provider.models
    }));
  }
}

// Global registry instance
export const providerRegistry = new AIProviderRegistry();
