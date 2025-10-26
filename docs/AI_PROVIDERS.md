# AI Provider Integration Guide

## 🤖 Multi-AI Provider Support

LionPack Studio supports multiple AI providers, allowing you to choose the best model for your needs based on cost, performance, or specific capabilities.

## 🎯 Supported Providers

### 1. **Gemini (Google)** ✨

**Models:**

- `gemini-flash` — Fastest and most cost-effective (recommended for development)
- `gemini-pro` — Balanced performance and cost
- `gemini-ultra` — Most capable model for complex tasks

**Pricing (per 1M tokens):**

- gemini-flash: $0.125 input / $0.375 output
- gemini-pro: $0.25 input / $0.50 output
- gemini-ultra: $1.00 input / $2.00 output

**Features:**

- ✅ Streaming responses
- ✅ Function calling
- ✅ Vision support (gemini-ultra only)
- ✅ 32K max tokens

### 2. **Claude (Anthropic)** 🤖

**Status:** Coming soon

**Planned Models:**

- claude-3-haiku — Fastest, most cost-effective
- claude-3-sonnet — Balanced performance
- claude-3-opus — Most capable

### 3. **GPT (OpenAI)** 🧠

**Status:** Coming soon

**Planned Models:**

- gpt-4-turbo — Fastest GPT-4 model
- gpt-4 — Most capable
- gpt-3.5-turbo — Cost-effective

---

## 🚀 Quick Start

### 1. Set Up API Keys

Create a `.env.local` file in `apps/web/`:

```bash
# Required for Gemini
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# Optional (for future providers)
ANTHROPIC_API_KEY=your_claude_api_key_here
OPENAI_API_KEY=your_gpt_api_key_here
```

**Get API Keys:**

- **Gemini:** https://makersuite.google.com/app/apikey
- **Claude:** https://console.anthropic.com/
- **GPT:** https://platform.openai.com/api-keys

### 2. Using the UI Selector

The `<AIProviderSelector />` component allows users to switch providers and models:

```tsx
import AIProviderSelector from "@/components/AIProviderSelector";

function MyComponent() {
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("gemini-flash");

  const handleProviderChange = (newProvider: string, newModel: string) => {
    setProvider(newProvider);
    setModel(newModel);
  };

  return (
    <AIProviderSelector
      currentProvider={provider}
      currentModel={model}
      onProviderChange={handleProviderChange}
      providers={providersData}
    />
  );
}
```

### 3. Making API Requests

**Streaming (recommended):**

```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hello!" }],
    provider: "gemini",
    model: "gemini-flash",
    stream: true,
    temperature: 0.7,
    maxTokens: 2048,
  }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  const lines = text.split("\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = line.slice(6);
      if (data === "[DONE]") break;

      const parsed = JSON.parse(data);
      console.log(parsed.content); // Display streamed content
    }
  }
}
```

**Non-streaming:**

```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hello!" }],
    provider: "gemini",
    model: "gemini-pro",
    stream: false,
  }),
});

const data = await response.json();
console.log(data.content); // Complete response
console.log(data.usage); // Token usage and cost
```

---

## 🏗️ Architecture

### AIProvider Interface

All providers implement the `AIProvider` abstract class:

```typescript
abstract class AIProvider {
  abstract readonly name: string;
  abstract readonly models: AIModel[];

  abstract chat(
    messages: AIMessage[],
    options: ChatOptions
  ): Promise<ChatResponse>;

  abstract stream(
    messages: AIMessage[],
    options: ChatOptions
  ): AsyncGenerator<StreamChunk>;

  abstract validateConnection(): Promise<boolean>;
}
```

### Provider Registry

The `AIProviderRegistry` manages all available providers:

```typescript
import { providerRegistry, GeminiProvider } from "@lionpack/leo-client";

// Register providers
const geminiProvider = new GeminiProvider({
  apiKey: process.env.GOOGLE_AI_API_KEY!,
});

providerRegistry.register(geminiProvider);

// Get all providers
const providers = providerRegistry.getAll();

// Get specific provider
const gemini = providerRegistry.get("gemini");
```

---

## 🛠️ Adding a New Provider

### Step 1: Implement AIProvider Interface

Create a new file in `packages/leo-client/src/lib/`:

```typescript
// my-provider.ts
import {
  AIProvider,
  AIMessage,
  AIModel,
  ChatOptions,
  ChatResponse,
  StreamChunk,
} from "./ai-provider";

export class MyProvider extends AIProvider {
  readonly name = "MyProvider";
  readonly models: AIModel[] = [
    {
      id: "my-model-1",
      name: "My Model 1",
      description: "Description",
      maxTokens: 4096,
      costPer1kTokens: {
        input: 0.001,
        output: 0.002,
      },
      capabilities: {
        streaming: true,
        functionCalling: false,
        vision: false,
      },
    },
  ];

  async chat(
    messages: AIMessage[],
    options: ChatOptions
  ): Promise<ChatResponse> {
    // Implement chat logic
  }

  async *stream(
    messages: AIMessage[],
    options: ChatOptions
  ): AsyncGenerator<StreamChunk> {
    // Implement streaming logic
  }

  async validateConnection(): Promise<boolean> {
    // Implement connection validation
  }
}
```

### Step 2: Export from leo-client

Update `packages/leo-client/src/lib/index.ts`:

```typescript
export * from "./my-provider";
```

### Step 3: Add to Chat API

Update `apps/web/pages/api/chat.ts`:

```typescript
import { MyProvider } from "@lionpack/leo-client";

function getProvider(providerName: string) {
  switch (providerName.toLowerCase()) {
    case "myprovider":
      return new MyProvider({ apiKey: process.env.MY_PROVIDER_API_KEY! });
    // ... other cases
  }
}
```

### Step 4: Update UI Selector

The `AIProviderSelector` component automatically displays all registered providers.

---

## 📊 Cost Tracking

Each chat response includes usage metadata:

```typescript
{
  content: "Response text...",
  usage: {
    inputTokens: 150,
    outputTokens: 500,
    totalCost: 0.000325  // In USD
  },
  model: "gemini-flash",
  finishReason: "stop"
}
```

**Calculate costs manually:**

```typescript
const model = provider.getModel("gemini-pro");
const cost = provider.calculateCost(model, inputTokens, outputTokens);
```

---

## 🧪 Testing

### Test Provider Implementation

```typescript
import { GeminiProvider } from "@lionpack/leo-client";

describe("GeminiProvider", () => {
  const provider = new GeminiProvider({
    apiKey: process.env.GOOGLE_AI_API_KEY!,
  });

  it("should chat successfully", async () => {
    const response = await provider.chat([{ role: "user", content: "Hello" }], {
      model: "gemini-flash",
    });

    expect(response.content).toBeDefined();
    expect(response.finishReason).toBe("stop");
  });

  it("should stream responses", async () => {
    const chunks: string[] = [];

    for await (const chunk of provider.stream(
      [{ role: "user", content: "Count to 5" }],
      { model: "gemini-flash" }
    )) {
      if (!chunk.done) {
        chunks.push(chunk.content);
      }
    }

    expect(chunks.length).toBeGreaterThan(0);
  });

  it("should validate connection", async () => {
    const isValid = await provider.validateConnection();
    expect(isValid).toBe(true);
  });
});
```

---

## 🔒 Security Best Practices

1. **Never commit API keys** — Use `.env.local` or environment variables
2. **Validate input** — Sanitize messages before sending to providers
3. **Rate limiting** — Implement rate limits to prevent abuse
4. **Error handling** — Never expose API keys in error messages
5. **CORS** — Configure CORS properly for production

---

## 🎯 Constitution Alignment

This multi-provider system aligns with LionPack's core values:

- **Speed with Purpose** — Streaming responses for instant feedback
- **Facilitation over Complexity** — Single API, multiple providers
- **Cost Efficiency** — Visual cost indicators, model selection
- **Empowerment** — Choose the right tool for the job
- **Openness** — Extensible architecture for community providers

---

## 🐛 Troubleshooting

### "API key not configured"

**Solution:** Add the required API key to `.env.local`:

```bash
GOOGLE_AI_API_KEY=your_key_here
```

Restart the dev server after adding environment variables.

### "Model not available"

**Solution:** Check available models:

```typescript
const provider = providerRegistry.get("gemini");
const models = provider?.getModels();
console.log(models.map((m) => m.id));
```

### Streaming not working

**Solution:** Ensure you're reading the response correctly:

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ stream: true, ... })
});

// Must use getReader() for streaming
const reader = response.body?.getReader();
```

### High costs

**Solution:** Use cost-effective models:

- Development: `gemini-flash` ($0.125/M input tokens)
- Production: `gemini-pro` (balanced)
- Complex tasks only: `gemini-ultra`

---

## 📚 Related Documents

- [VISION.md](./VISION.md) — Project vision and values
- [CONSTITUTION_TEMPLATE.md](./CONSTITUTION_TEMPLATE.md) — AI alignment standards
- [API Reference](#) — Complete API documentation (coming soon)

---

## 🤝 Contributing

Want to add a new provider? Check out the [Contributing Guide](../CONTRIBUTING.md).

**Community-requested providers:**

- Cohere
- Mistral AI
- Llama (local/hosted)
- Azure OpenAI

---

**Last Updated:** October 26, 2025
**Status:** Gemini ✅ | Claude 🚧 | GPT 🚧
