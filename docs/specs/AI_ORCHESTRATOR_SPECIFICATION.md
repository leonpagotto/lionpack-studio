# LionPack Studio – AI Orchestrator & Multi-Model Specification

> **Status:** Approved for Implementation
> **Priority:** P0 – Core Feature
> **Created:** 2025-10-25
> **Author:** Leo / LionPack Team
> **Related:** PHASE_1_ARCHITECTURE.md, PHASE_1_API_CONTRACT.md

---

## 🎯 Overview

The **AI Orchestrator** is the intelligent routing layer that manages interactions with multiple AI providers (OpenAI, Anthropic, Google Gemini, local models). It handles:

- **Provider Selection** – Choose optimal model based on task, cost, latency
- **Context Management** – Maintain conversation history and file context
- **Streaming Responses** – Real-time token streaming to frontend
- **Error Handling** – Fallback strategies when provider fails
- **Usage Tracking** – Monitor API costs and rate limits
- **Prompt Engineering** – Task-specific system prompts and context

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         Frontend (Chat UI)                      │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────┐
│         AI Orchestrator Service                 │
├─────────────────────────────────────────────────┤
│ • Request routing                               │
│ • Context assembly                              │
│ • Stream management                             │
│ • Error handling & fallback                     │
└────┬────────┬───────────┬───────────┬──────────┘
     │        │           │           │
┌────▼──┐ ┌──▼───┐ ┌─────▼────┐ ┌───▼─────┐
│OpenAI │ │Claude│ │ Gemini   │ │ Local   │
│(GPT)  │ │      │ │(Google)  │ │ Models  │
└───────┘ └──────┘ └──────────┘ └─────────┘
```

---

## 🤖 Supported Providers

### 1. OpenAI (GPT-4, GPT-3.5)

**Configuration:**

```json
{
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "api_key": "sk-...",
  "base_url": "https://api.openai.com/v1",
  "max_tokens": 4096,
  "temperature": 0.7
}
```

**Pricing:** ~$0.01-0.03 per 1K tokens
**Latency:** 500ms-2s
**Capabilities:** Excellent reasoning, code generation, multimodal (with vision)

---

### 2. Anthropic Claude (Claude 3)

**Configuration:**

```json
{
  "provider": "anthropic",
  "model": "claude-3-opus-20240229",
  "api_key": "sk-ant-...",
  "base_url": "https://api.anthropic.com",
  "max_tokens": 4096,
  "temperature": 0.7
}
```

**Pricing:** ~$0.015-0.075 per 1K tokens
**Latency:** 500ms-2s
**Capabilities:** Strong reasoning, safety-focused, excellent for code review

**Available Models:**

- `claude-3-opus` – Most capable (best reasoning)
- `claude-3-sonnet` – Balanced (good speed + quality)
- `claude-3-haiku` – Fast & cheap (quick tasks)

---

### 3. Google Gemini (Google AI)

**Configuration:**

```json
{
  "provider": "gemini",
  "model": "gemini-1.5-pro",
  "api_key": "AIzaSy...",
  "base_url": "https://generativelanguage.googleapis.com",
  "max_tokens": 8000,
  "temperature": 0.7
}
```

**Pricing:** Free tier available, $0.005-0.015 per 1K tokens (paid)
**Latency:** 500ms-1.5s
**Capabilities:** Multimodal (text + images), long context window (1M tokens), fast

**Available Models:**

- `gemini-1.5-pro` – Best capabilities
- `gemini-1.5-flash` – Fast & cheap

---

### 4. Local Models (Optional)

**Configuration:**

```json
{
  "provider": "local",
  "model": "llama-2-13b",
  "base_url": "http://localhost:8000",
  "max_tokens": 2048,
  "temperature": 0.7
}
```

**Pricing:** Free (runs locally)
**Latency:** Depends on hardware (1-5s)
**Capabilities:** Privacy-first, no API costs, flexible

**Popular Options:**

- Ollama (easy local setup)
- LocalAI (API-compatible)
- Hugging Face Inference Server

---

## 🔄 Model Selection Strategy

The orchestrator chooses the best model based on:

```javascript
// Priority-based selection
const selectModel = (task, budget, latency) => {
  // 1. Check latency requirement
  if (latency < 500ms) {
    // Use fast model: Gemini Flash or GPT-3.5
    return fast_model;
  }

  // 2. Check budget
  if (budget < $0.001) {
    // Use cheap model: Gemini Flash or Claude Haiku
    return cheap_model;
  }

  // 3. Check task complexity
  if (task.type === "complex_reasoning") {
    // Use most capable: GPT-4 or Claude Opus
    return capable_model;
  }

  // 4. Default: balanced
  return balanced_model; // Claude Sonnet or GPT-4 Turbo
};
```

---

## 📡 API Endpoints

### `POST /api/ai/chat`

Send a message to the AI orchestrator

**Request:**

```json
{
  "message": "Help me debug this React component",
  "conversation_id": "conv-abc123",
  "context": {
    "file_path": "src/components/Button.tsx",
    "file_content": "...",
    "selected_text": "...",
    "project_context": "Next.js 16, TypeScript 5.3"
  },
  "options": {
    "provider": "auto",
    "model": null,
    "temperature": 0.7,
    "max_tokens": 2000,
    "stream": true
  }
}
```

**Query Parameters:**

- `stream` (bool) – Enable streaming responses (default: true)

**Response (200 OK) – Streaming:**

```
Content-Type: text/event-stream

data: {"type":"start","message_id":"msg-123","provider":"openai","model":"gpt-4-turbo"}
data: {"type":"token","content":"Here's"}
data: {"type":"token","content":" how"}
data: {"type":"token","content":" to"}
...
data: {"type":"done","total_tokens":157,"finish_reason":"stop"}
```

**Response (200 OK) – Non-streaming:**

```json
{
  "message_id": "msg-123",
  "content": "Here's how to fix your React component...",
  "provider": "openai",
  "model": "gpt-4-turbo",
  "usage": {
    "prompt_tokens": 245,
    "completion_tokens": 157,
    "total_tokens": 402
  },
  "cost": 0.0127
}
```

---

### `POST /api/ai/completion`

Get a single completion (no conversation history)

**Request:**

```json
{
  "prompt": "Write a React hook for managing form state",
  "options": {
    "provider": "anthropic",
    "model": "claude-3-sonnet-20240229",
    "temperature": 0.5,
    "max_tokens": 1000
  }
}
```

**Response (200 OK):**

```json
{
  "completion_id": "comp-xyz789",
  "content": "export const useFormState = (initialState) => { ... }",
  "provider": "anthropic",
  "model": "claude-3-sonnet-20240229",
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 89,
    "total_tokens": 104
  },
  "cost": 0.0037
}
```

---

### `GET /api/ai/models`

List all available models

**Response (200 OK):**

```json
{
  "providers": [
    {
      "name": "openai",
      "models": [
        {
          "id": "gpt-4-turbo-preview",
          "name": "GPT-4 Turbo",
          "capabilities": ["reasoning", "code", "vision"],
          "cost_per_1k": 0.01,
          "latency_ms": 800
        },
        {
          "id": "gpt-3.5-turbo",
          "name": "GPT-3.5 Turbo",
          "capabilities": ["reasoning", "code"],
          "cost_per_1k": 0.002,
          "latency_ms": 400
        }
      ]
    },
    {
      "name": "anthropic",
      "models": [
        {
          "id": "claude-3-opus-20240229",
          "name": "Claude 3 Opus",
          "capabilities": ["reasoning", "code", "safety"],
          "cost_per_1k": 0.015,
          "latency_ms": 900
        },
        {
          "id": "claude-3-sonnet-20240229",
          "name": "Claude 3 Sonnet",
          "capabilities": ["reasoning", "code"],
          "cost_per_1k": 0.003,
          "latency_ms": 600
        },
        {
          "id": "claude-3-haiku-20240307",
          "name": "Claude 3 Haiku",
          "capabilities": ["code"],
          "cost_per_1k": 0.0008,
          "latency_ms": 300
        }
      ]
    },
    {
      "name": "gemini",
      "models": [
        {
          "id": "gemini-1.5-pro",
          "name": "Gemini 1.5 Pro",
          "capabilities": ["reasoning", "code", "vision", "multimodal"],
          "cost_per_1k": 0.0075,
          "latency_ms": 700
        },
        {
          "id": "gemini-1.5-flash",
          "name": "Gemini 1.5 Flash",
          "capabilities": ["code", "multimodal"],
          "cost_per_1k": 0.0001,
          "latency_ms": 200
        }
      ]
    }
  ]
}
```

---

### `GET /api/ai/conversations/:id`

Get conversation history

**Response (200 OK):**

```json
{
  "conversation_id": "conv-abc123",
  "title": "Debugging React Performance",
  "created_at": "2025-10-25T10:30:00Z",
  "updated_at": "2025-10-25T11:45:00Z",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "My React app is slow",
      "timestamp": "2025-10-25T10:30:00Z"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "Let's profile it using React DevTools...",
      "provider": "openai",
      "model": "gpt-4-turbo",
      "timestamp": "2025-10-25T10:30:45Z"
    }
  ],
  "context": {
    "file_path": "src/App.tsx",
    "project_type": "Next.js"
  }
}
```

---

### `POST /api/ai/code-analysis`

Analyze code with AI

**Request:**

```json
{
  "code": "function fibonacci(n) { ... }",
  "language": "javascript",
  "analysis_type": "performance",
  "options": {
    "provider": "anthropic",
    "model": "claude-3-opus-20240229"
  }
}
```

**Analysis Types:**

- `performance` – Optimization suggestions
- `security` – Security vulnerabilities
- `style` – Code style & best practices
- `refactoring` – Refactoring suggestions
- `testing` – Test coverage & test ideas

**Response (200 OK):**

```json
{
  "analysis_id": "ana-xyz789",
  "code_hash": "sha256-...",
  "analysis_type": "performance",
  "findings": [
    {
      "severity": "high",
      "line": 5,
      "type": "exponential-complexity",
      "message": "This recursive function without memoization is O(2^n)",
      "suggestion": "Use dynamic programming or memoization"
    }
  ],
  "summary": "Found 1 high severity issue and 2 optimization opportunities",
  "analysis_cost": 0.0045
}
```

---

### `GET /api/ai/usage`

Get current usage and costs

**Response (200 OK):**

```json
{
  "period": "2025-10",
  "usage": {
    "total_tokens": 45230,
    "total_requests": 187,
    "total_cost": 1.23
  },
  "by_provider": {
    "openai": {
      "tokens": 20000,
      "requests": 85,
      "cost": 0.45
    },
    "anthropic": {
      "tokens": 15000,
      "requests": 62,
      "cost": 0.38
    },
    "gemini": {
      "tokens": 10230,
      "requests": 40,
      "cost": 0.4
    }
  },
  "by_model": {
    "gpt-4-turbo": { "cost": 0.3 },
    "claude-3-opus": { "cost": 0.25 },
    "gemini-1.5-pro": { "cost": 0.4 }
  },
  "budget": {
    "monthly_limit": 10.0,
    "used_percentage": 12.3,
    "warning_threshold": 80
  }
}
```

---

## 🔐 Error Handling

### Provider Failure & Fallback

If primary provider fails, automatically fallback:

```javascript
// Fallback chain
1. Try primary provider (configured choice)
2. If fails, try alternative provider
3. If all fail, try local model (if available)
4. If all fail, return friendly error message
```

**Error Response (503 Service Unavailable):**

```json
{
  "error": "all_providers_unavailable",
  "message": "All AI providers are currently unavailable",
  "details": {
    "openai": "rate_limit_exceeded",
    "anthropic": "service_unavailable",
    "gemini": "authentication_failed"
  },
  "retry_after": 60,
  "fallback_available": false
}
```

**Error Response (401 Unauthorized):**

```json
{
  "error": "invalid_api_key",
  "message": "AI provider API key is invalid or expired",
  "provider": "openai",
  "action": "Update API key in settings"
}
```

---

## 💰 Cost Management

### Rate Limiting & Quotas

```json
{
  "user": {
    "monthly_budget": 10.0,
    "monthly_used": 1.23,
    "requests_per_minute": 60,
    "tokens_per_minute": 90000
  },
  "project": {
    "monthly_budget": 100.0,
    "monthly_used": 12.45,
    "team_members": 5
  }
}
```

### Budget Alerts

```javascript
// Trigger alerts at thresholds
if (used_cost >= budget * 0.5) notify("50% of budget used");
if (used_cost >= budget * 0.8) notify("80% of budget used");
if (used_cost >= budget * 0.95) notify("95% of budget used");
if (used_cost >= budget) block_requests("Budget exceeded");
```

---

## 🔌 Configuration

### Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_DEFAULT_MODEL=gpt-4-turbo-preview

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_DEFAULT_MODEL=claude-3-opus-20240229

# Google Gemini
GEMINI_API_KEY=AIzaSy...
GEMINI_DEFAULT_MODEL=gemini-1.5-pro

# Local Models (optional)
LOCAL_MODEL_ENABLED=false
LOCAL_MODEL_ENDPOINT=http://localhost:8000

# Model Selection
AI_PROVIDER_PRIORITY=openai,anthropic,gemini,local
AI_AUTO_FALLBACK=true
AI_COST_OPTIMIZATION=true

# Budget & Limits
AI_MONTHLY_BUDGET=10.00
AI_REQUESTS_PER_MINUTE=60
AI_TOKENS_PER_MINUTE=90000
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Test model selection
test("selects fastest model for <500ms latency requirement", () => {
  const model = selectModel(task, budget, 500);
  expect(model.latency_ms).toBeLessThan(500);
});

// Test provider fallback
test("falls back to secondary provider on failure", async () => {
  mockOpenAIError();
  const result = await chat("test");
  expect(result.provider).toBe("anthropic");
});

// Test cost tracking
test("tracks API costs correctly", async () => {
  await chat("test");
  const usage = await getUsage();
  expect(usage.total_cost).toBeGreaterThan(0);
});
```

### Integration Tests

```typescript
// Test all providers
describe('AI Providers', () => {
  test('OpenAI integration works', async () => { ... });
  test('Anthropic integration works', async () => { ... });
  test('Gemini integration works', async () => { ... });
  test('Fallback chain works', async () => { ... });
});
```

---

## 🎯 Success Metrics

- ✅ All 3 providers (OpenAI, Anthropic, Gemini) integrated
- ✅ Intelligent model selection working (latency/cost optimization)
- ✅ Provider failover working (automatic fallback)
- ✅ Streaming responses working (real-time tokens)
- ✅ Cost tracking working (accurate usage/cost reporting)
- ✅ Budget limiting working (prevents overspend)
- ✅ All unit & integration tests passing (>90% coverage)
- ✅ Latency <2s for 95% of requests
- ✅ Error handling working (graceful degradation)

---

## 📝 Related Epics

- **Epic 3:** AI Orchestrator (Primary)
- **Epic 7:** Chat Sidebar Integration
- **Epic 1:** OpenCode Integration (depends on)

---

## ✅ Acceptance Criteria

- [ ] All 3 providers implemented & tested
- [ ] Model selection algorithm working correctly
- [ ] Provider fallback chain implemented
- [ ] Streaming responses working end-to-end
- [ ] Cost tracking & budgets enforced
- [ ] Usage dashboard working
- [ ] Error handling graceful
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Documentation complete

---

**Version:** 1.0
**Status:** Ready for Implementation
**Last Updated:** 2025-10-25
