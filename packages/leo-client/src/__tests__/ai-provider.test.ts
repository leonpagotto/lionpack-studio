/**
 * AIProvider and AIProviderRegistry Tests
 *
 * Tests for the abstract AI provider interface and provider registry system.
 */

import {
  AIProvider,
  AIProviderRegistry,
  AIMessage,
  AIModel,
  ChatOptions,
  ChatResponse,
  StreamChunk,
  providerRegistry
} from '../lib/ai-provider';

/**
 * Mock Provider for Testing
 */
class MockProvider extends AIProvider {
  readonly name = 'MockProvider';
  readonly models: AIModel[] = [
    {
      id: 'mock-model-1',
      name: 'Mock Model 1',
      description: 'First test model',
      maxTokens: 4096,
      costPer1kTokens: {
        input: 0.001,
        output: 0.002
      },
      capabilities: {
        streaming: true,
        functionCalling: false,
        vision: false
      }
    },
    {
      id: 'mock-model-2',
      name: 'Mock Model 2',
      description: 'Second test model',
      maxTokens: 8192,
      costPer1kTokens: {
        input: 0.002,
        output: 0.004
      },
      capabilities: {
        streaming: true,
        functionCalling: true,
        vision: true
      }
    }
  ];

  async chat(_messages: AIMessage[], options: ChatOptions): Promise<ChatResponse> {
    return {
      content: 'Mock response',
      usage: {
        inputTokens: 100,
        outputTokens: 50,
        totalCost: 0.0002
      },
      model: options.model,
      finishReason: 'stop'
    };
  }

  async *stream(_messages: AIMessage[], _options: ChatOptions): AsyncGenerator<StreamChunk> {
    yield { content: 'Mock ', done: false };
    yield { content: 'streamed ', done: false };
    yield { content: 'response', done: false };
    yield { content: '', done: true };
  }

  async validateConnection(): Promise<boolean> {
    return true;
  }
}

/**
 * Another Mock Provider for Registry Tests
 */
class AnotherMockProvider extends AIProvider {
  readonly name = 'AnotherProvider';
  readonly models: AIModel[] = [
    {
      id: 'another-model',
      name: 'Another Model',
      description: 'Different provider model',
      maxTokens: 2048,
      costPer1kTokens: {
        input: 0.0005,
        output: 0.001
      },
      capabilities: {
        streaming: false,
        functionCalling: false,
        vision: false
      }
    }
  ];

  async chat(_messages: AIMessage[], options: ChatOptions): Promise<ChatResponse> {
    return {
      content: 'Another response',
      model: options.model,
      finishReason: 'stop'
    };
  }

  async *stream(_messages: AIMessage[], _options: ChatOptions): AsyncGenerator<StreamChunk> {
    yield { content: 'Not supported', done: true };
  }

  async validateConnection(): Promise<boolean> {
    return false; // Simulate failed connection
  }
}

describe('AIProvider Abstract Class', () => {
  let provider: MockProvider;

  beforeEach(() => {
    provider = new MockProvider({ apiKey: 'test-key' });
  });

  describe('getModels()', () => {
    it('should return all available models', () => {
      const models = provider.getModels();
      expect(models).toHaveLength(2);
      expect(models[0].id).toBe('mock-model-1');
      expect(models[1].id).toBe('mock-model-2');
    });

    it('should return models with correct structure', () => {
      const models = provider.getModels();

      models.forEach(model => {
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('description');
        expect(model).toHaveProperty('maxTokens');
        expect(model).toHaveProperty('costPer1kTokens');
        expect(model).toHaveProperty('capabilities');
      });
    });
  });

  describe('getModel()', () => {
    it('should return specific model by ID', () => {
      const model = provider.getModel('mock-model-1');
      expect(model).toBeDefined();
      expect(model?.id).toBe('mock-model-1');
      expect(model?.name).toBe('Mock Model 1');
    });

    it('should return undefined for non-existent model', () => {
      const model = provider.getModel('non-existent-model');
      expect(model).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const model = provider.getModel('MOCK-MODEL-1');
      expect(model).toBeUndefined();
    });
  });

  describe('calculateCost()', () => {
    it('should calculate cost correctly for model 1', () => {
      const model = provider.getModel('mock-model-1')!;
      const cost = provider.calculateCost(model, 1000, 500);

      // Input: 1000 tokens * $0.001/1k = $0.001
      // Output: 500 tokens * $0.002/1k = $0.001
      // Total: $0.002
      expect(cost).toBeCloseTo(0.002, 5);
    });

    it('should calculate cost correctly for model 2', () => {
      const model = provider.getModel('mock-model-2')!;
      const cost = provider.calculateCost(model, 2000, 1000);

      // Input: 2000 tokens * $0.002/1k = $0.004
      // Output: 1000 tokens * $0.004/1k = $0.004
      // Total: $0.008
      expect(cost).toBeCloseTo(0.008, 5);
    });

    it('should handle zero tokens', () => {
      const model = provider.getModel('mock-model-1')!;
      const cost = provider.calculateCost(model, 0, 0);
      expect(cost).toBe(0);
    });

    it('should handle large token counts', () => {
      const model = provider.getModel('mock-model-1')!;
      const cost = provider.calculateCost(model, 100000, 50000);

      // Input: 100k tokens * $0.001/1k = $0.1
      // Output: 50k tokens * $0.002/1k = $0.1
      // Total: $0.2
      expect(cost).toBeCloseTo(0.2, 5);
    });
  });

  describe('chat()', () => {
    it('should return chat response', async () => {
      const messages: AIMessage[] = [
        { role: 'user', content: 'Hello' }
      ];

      const response = await provider.chat(messages, { model: 'mock-model-1' });

      expect(response).toBeDefined();
      expect(response.content).toBe('Mock response');
      expect(response.model).toBe('mock-model-1');
      expect(response.finishReason).toBe('stop');
    });

    it('should include usage metadata', async () => {
      const messages: AIMessage[] = [
        { role: 'user', content: 'Test' }
      ];

      const response = await provider.chat(messages, { model: 'mock-model-1' });

      expect(response.usage).toBeDefined();
      expect(response.usage?.inputTokens).toBe(100);
      expect(response.usage?.outputTokens).toBe(50);
      expect(response.usage?.totalCost).toBe(0.0002);
    });
  });

  describe('stream()', () => {
    it('should stream response chunks', async () => {
      const messages: AIMessage[] = [
        { role: 'user', content: 'Stream test' }
      ];

      const chunks: string[] = [];

      for await (const chunk of provider.stream(messages, { model: 'mock-model-1' })) {
        if (!chunk.done) {
          chunks.push(chunk.content);
        }
      }

      expect(chunks).toHaveLength(3);
      expect(chunks.join('')).toBe('Mock streamed response');
    });

    it('should emit done signal at end', async () => {
      const messages: AIMessage[] = [
        { role: 'user', content: 'Stream test' }
      ];

      let lastChunk: StreamChunk | undefined;

      for await (const chunk of provider.stream(messages, { model: 'mock-model-1' })) {
        lastChunk = chunk;
      }

      expect(lastChunk).toBeDefined();
      expect(lastChunk?.done).toBe(true);
    });
  });

  describe('validateConnection()', () => {
    it('should validate connection successfully', async () => {
      const isValid = await provider.validateConnection();
      expect(isValid).toBe(true);
    });

    it('should return false for failed connection', async () => {
      const failedProvider = new AnotherMockProvider({ apiKey: 'test' });
      const isValid = await failedProvider.validateConnection();
      expect(isValid).toBe(false);
    });
  });
});

describe('AIProviderRegistry', () => {
  let registry: AIProviderRegistry;
  let mockProvider1: MockProvider;
  let mockProvider2: AnotherMockProvider;

  beforeEach(() => {
    registry = new AIProviderRegistry();
    mockProvider1 = new MockProvider({ apiKey: 'test-1' });
    mockProvider2 = new AnotherMockProvider({ apiKey: 'test-2' });
  });

  describe('register()', () => {
    it('should register a provider', () => {
      registry.register(mockProvider1);

      const retrieved = registry.get('mockprovider');
      expect(retrieved).toBe(mockProvider1);
    });

    it('should register multiple providers', () => {
      registry.register(mockProvider1);
      registry.register(mockProvider2);

      const all = registry.getAll();
      expect(all).toHaveLength(2);
    });

    it('should be case-insensitive for provider names', () => {
      registry.register(mockProvider1);

      expect(registry.get('MOCKPROVIDER')).toBe(mockProvider1);
      expect(registry.get('MockProvider')).toBe(mockProvider1);
      expect(registry.get('mockprovider')).toBe(mockProvider1);
    });

    it('should overwrite provider with same name', () => {
      const provider1 = new MockProvider({ apiKey: 'key-1' });
      const provider2 = new MockProvider({ apiKey: 'key-2' });

      registry.register(provider1);
      registry.register(provider2);

      const all = registry.getAll();
      expect(all).toHaveLength(1);
      expect(all[0]).toBe(provider2);
    });
  });

  describe('get()', () => {
    beforeEach(() => {
      registry.register(mockProvider1);
      registry.register(mockProvider2);
    });

    it('should retrieve registered provider', () => {
      const provider = registry.get('mockprovider');
      expect(provider).toBe(mockProvider1);
    });

    it('should return undefined for unregistered provider', () => {
      const provider = registry.get('nonexistent');
      expect(provider).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      expect(registry.get('ANOTHERPROVIDER')).toBe(mockProvider2);
      expect(registry.get('AnotherProvider')).toBe(mockProvider2);
      expect(registry.get('anotherprovider')).toBe(mockProvider2);
    });
  });

  describe('getAll()', () => {
    it('should return empty array when no providers registered', () => {
      const all = registry.getAll();
      expect(all).toEqual([]);
    });

    it('should return all registered providers', () => {
      registry.register(mockProvider1);
      registry.register(mockProvider2);

      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContain(mockProvider1);
      expect(all).toContain(mockProvider2);
    });
  });

  describe('getAllModels()', () => {
    it('should return empty array when no providers', () => {
      const models = registry.getAllModels();
      expect(models).toEqual([]);
    });

    it('should return models from all providers', () => {
      registry.register(mockProvider1);
      registry.register(mockProvider2);

      const allModels = registry.getAllModels();

      expect(allModels).toHaveLength(2);

      // Check first provider's models
      expect(allModels[0].provider).toBe('MockProvider');
      expect(allModels[0].models).toHaveLength(2);
      expect(allModels[0].models[0].id).toBe('mock-model-1');

      // Check second provider's models
      expect(allModels[1].provider).toBe('AnotherProvider');
      expect(allModels[1].models).toHaveLength(1);
      expect(allModels[1].models[0].id).toBe('another-model');
    });

    it('should include all model metadata', () => {
      registry.register(mockProvider1);

      const allModels = registry.getAllModels();
      const firstModel = allModels[0].models[0];

      expect(firstModel).toHaveProperty('id');
      expect(firstModel).toHaveProperty('name');
      expect(firstModel).toHaveProperty('description');
      expect(firstModel).toHaveProperty('maxTokens');
      expect(firstModel).toHaveProperty('costPer1kTokens');
      expect(firstModel).toHaveProperty('capabilities');
    });
  });
});

describe('Global Provider Registry', () => {
  it('should export a global registry instance', () => {
    expect(providerRegistry).toBeInstanceOf(AIProviderRegistry);
  });

  it('should be a singleton', () => {
    // Import twice and verify it's the same instance
    const { providerRegistry: registry1 } = require('../lib/ai-provider');
    const { providerRegistry: registry2 } = require('../lib/ai-provider');

    expect(registry1).toBe(registry2);
  });
});
