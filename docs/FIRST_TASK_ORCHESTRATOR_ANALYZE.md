# 🎯 First Task: Implement Orchestrator.analyzeRequest()

**Difficulty**: Medium
**Time Estimate**: 4-6 hours
**Priority**: 1 (Critical for Phase 1)

---

## 📌 Overview

The `Orchestrator.analyzeRequest()` method is the **first critical piece** of Phase 1. It's the gateway for understanding what users want to build.

**What it does:**
- Takes a user's feature description
- Analyzes it to determine task type (frontend, backend, etc.)
- Identifies which agents should handle it
- Returns routing decision

**Example:**

```typescript
const request = "Add OAuth2 login with Google and GitHub";

const decision = await orchestrator.analyzeRequest(request);

// Returns:
{
  primary_agent: "Backend",
  secondary_agents: ["Frontend"],
  task_type: "authentication",
  complexity: "medium",
  estimated_effort: "1 week",
  reasoning: "OAuth2 implementation needed on backend, UI button on frontend"
}
```

---

## 🏗️ Implementation Steps

### Step 1: Understand the Current Stub

File: `packages/leo-client/src/orchestrator.ts`

**Current signature:**

```typescript
async analyzeRequest(request: string): Promise<RoutingDecision> {
  // TODO: Implement using LEO Kit
  throw new Error('Not implemented');
}
```

**What needs to change:**
- Remove the `throw` statement
- Implement actual analysis logic
- Call LEO Kit orchestrator
- Return valid `RoutingDecision`

### Step 2: Examine the Interface

```typescript
interface RoutingDecision {
  primary_agent: 'Frontend' | 'Backend' | 'DevOps' | 'Testing' | 'Documentation' | 'Design';
  secondary_agents?: string[];
  task_type: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimated_effort: string;
  reasoning: string;
  suggested_model: 'sonnet' | '4' | '4-5' | 'haiku';
}
```

**Key points:**
- `primary_agent` - Main responsible agent
- `secondary_agents` - Agents that also contribute
- `complexity` - Simple (< 1 day), Medium (1-3 weeks), Complex (> 3 weeks)
- `suggested_model` - Which model works best for this task

### Step 3: Understand LEO Kit API

The `leo-workflow-kit` package provides:

```typescript
import { Orchestrator as LeoOrchestrator } from 'leo-workflow-kit';

const leoOrch = new LeoOrchestrator({
  github_token: process.env.LEO_GITHUB_TOKEN,
  anthropic_key: process.env.LEO_ANTHROPIC_KEY,
});

// Analyze request returns WorkflowSpec
const spec = await leoOrch.analyzeRequest(request);

// Properties available:
// - spec.task_type
// - spec.agents_required
// - spec.estimated_effort
// - spec.suggested_model
```

### Step 4: Map LEO Kit Output to RoutingDecision

LEO Kit returns a `WorkflowSpec`, but we need a `RoutingDecision`.

**Mapping logic:**

```
LEO Kit WorkflowSpec          →  RoutingDecision
├─ agents_required[0]         →  primary_agent
├─ agents_required[1:]        →  secondary_agents
├─ task_type                  →  task_type
├─ estimated_effort           →  estimated_effort
│  (convert "1 week" → complexity)
├─ suggested_model            →  suggested_model
└─ reasoning                  →  reasoning
```

---

## 💻 Implementation

### Complete Implementation

```typescript
async analyzeRequest(request: string): Promise<RoutingDecision> {
  // Step 1: Validate input
  if (!request || request.trim().length === 0) {
    throw new Error('Request description cannot be empty');
  }

  // Step 2: Call LEO Kit orchestrator
  let spec: WorkflowSpec;
  try {
    spec = await this.leoOrchestrator.analyzeRequest(request);
  } catch (error) {
    console.error('LEO Kit analysis failed:', error);
    throw new Error(`Failed to analyze request: ${error.message}`);
  }

  // Step 3: Determine complexity from estimated effort
  const effort = spec.estimated_effort.toLowerCase();
  let complexity: 'simple' | 'medium' | 'complex';

  if (effort.includes('day') || effort.includes('1-2 weeks')) {
    complexity = 'simple';
  } else if (effort.includes('week') || effort.includes('2-3 weeks')) {
    complexity = 'medium';
  } else {
    complexity = 'complex';
  }

  // Step 4: Extract agents
  const [primaryAgent, ...secondaryAgents] = spec.agents_required;

  // Step 5: Build and return routing decision
  const decision: RoutingDecision = {
    primary_agent: this.normalizeAgentName(primaryAgent),
    secondary_agents: secondaryAgents.map(a => this.normalizeAgentName(a)),
    task_type: spec.task_type,
    complexity,
    estimated_effort: spec.estimated_effort,
    reasoning: spec.reasoning,
    suggested_model: this.selectModel(complexity, spec.suggested_model),
  };

  return decision;
}

// Helper: Normalize agent names to our enum
private normalizeAgentName(
  agent: string
): 'Frontend' | 'Backend' | 'DevOps' | 'Testing' | 'Documentation' | 'Design' {
  const normalized = agent.toLowerCase();

  const mapping: Record<string, any> = {
    'frontend': 'Frontend',
    'backend': 'Backend',
    'devops': 'DevOps',
    'testing': 'Testing',
    'documentation': 'Documentation',
    'design': 'Design',
    'ui': 'Frontend',
    'api': 'Backend',
    'infrastructure': 'DevOps',
  };

  return mapping[normalized] || 'Backend'; // Default to Backend
}

// Helper: Select model based on complexity
private selectModel(
  complexity: 'simple' | 'medium' | 'complex',
  suggested: string
): 'sonnet' | '4' | '4-5' | 'haiku' {
  // If LEO Kit suggests specific model, use it
  if (['sonnet', '4', '4-5', 'haiku'].includes(suggested)) {
    return suggested as any;
  }

  // Otherwise, select based on complexity
  switch (complexity) {
    case 'simple':
      return 'haiku'; // Fast, cost-efficient
    case 'medium':
      return 'sonnet'; // Balanced (default)
    case 'complex':
      return '4-5'; // Maximum capability
  }
}
```

---

## 🧪 Writing Tests

### Test File Location

`packages/leo-client/tests/orchestrator.test.ts`

### Test Cases

```typescript
import { Orchestrator } from '../src/orchestrator';

describe('Orchestrator.analyzeRequest', () => {
  let orchestrator: Orchestrator;

  beforeEach(() => {
    orchestrator = new Orchestrator({
      // Test configuration
    });
  });

  describe('Happy Path', () => {
    it('should analyze a frontend request', async () => {
      const result = await orchestrator.analyzeRequest(
        'Add a dark mode toggle button to the navbar'
      );

      expect(result.primary_agent).toBe('Frontend');
      expect(result.complexity).toBe('simple');
      expect(result.estimated_effort).toContain('day');
    });

    it('should analyze a backend request', async () => {
      const result = await orchestrator.analyzeRequest(
        'Implement OAuth2 authentication with GitHub'
      );

      expect(result.primary_agent).toBe('Backend');
      expect(result.complexity).toBe('medium');
      expect(['Backend', 'Security']).toContain(result.primary_agent);
    });

    it('should identify multi-agent tasks', async () => {
      const result = await orchestrator.analyzeRequest(
        'Add OAuth2 login button with Google'
      );

      expect(result.primary_agent).toBeDefined();
      expect(result.secondary_agents?.length).toBeGreaterThan(0);
    });

    it('should suggest appropriate model for complexity', async () => {
      const simple = await orchestrator.analyzeRequest(
        'Change button color to blue'
      );
      expect(['haiku', 'sonnet']).toContain(simple.suggested_model);

      const complex = await orchestrator.analyzeRequest(
        'Build real-time collaborative editing with CRDTs and WebSockets'
      );
      expect(['4', '4-5']).toContain(complex.suggested_model);
    });
  });

  describe('Error Handling', () => {
    it('should throw on empty request', async () => {
      await expect(
        orchestrator.analyzeRequest('')
      ).rejects.toThrow('Request description cannot be empty');
    });

    it('should throw on null request', async () => {
      await expect(
        orchestrator.analyzeRequest(null as any)
      ).rejects.toThrow();
    });

    it('should handle LEO Kit errors gracefully', async () => {
      // Mock LEO Kit to throw error
      jest.spyOn(orchestrator.leoOrchestrator, 'analyzeRequest')
        .mockRejectedValue(new Error('API error'));

      await expect(
        orchestrator.analyzeRequest('Test request')
      ).rejects.toThrow('Failed to analyze request');
    });
  });

  describe('Output Format', () => {
    it('should return valid RoutingDecision', async () => {
      const result = await orchestrator.analyzeRequest(
        'Build a feature'
      );

      expect(result).toHaveProperty('primary_agent');
      expect(result).toHaveProperty('task_type');
      expect(result).toHaveProperty('complexity');
      expect(result).toHaveProperty('estimated_effort');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('suggested_model');
    });

    it('should have valid agent names', async () => {
      const result = await orchestrator.analyzeRequest(
        'Build something'
      );

      const validAgents = ['Frontend', 'Backend', 'DevOps', 'Testing', 'Documentation', 'Design'];
      expect(validAgents).toContain(result.primary_agent);
    });

    it('should have valid complexity levels', async () => {
      const result = await orchestrator.analyzeRequest(
        'Build something'
      );

      expect(['simple', 'medium', 'complex']).toContain(result.complexity);
    });
  });
});
```

---

## 🔄 Integration Flow

After implementing `analyzeRequest()`, here's how it fits:

```
User Request
    ↓
orchestrator.analyzeRequest()  ← YOU ARE HERE
    ↓
Returns RoutingDecision
    ↓
createWorkflow() uses decision
    ↓
Routes to appropriate agent
    ↓
Creates GitHub issue
```

---

## 📝 Checklist for Completion

- [ ] Read `packages/leo-client/src/orchestrator.ts` current stub
- [ ] Review `packages/leo-client/src/types.ts` for `RoutingDecision` interface
- [ ] Install `leo-workflow-kit` with `npm install`
- [ ] Understand LEO Kit API (read docs/INTEGRATION.md)
- [ ] Implement `analyzeRequest()` method
- [ ] Implement helper methods (`normalizeAgentName`, `selectModel`)
- [ ] Write unit tests (8+ test cases)
- [ ] Run tests and achieve 80%+ coverage
- [ ] Commit changes: `git commit -m "feat(orchestrator): implement analyzeRequest method"`
- [ ] Move to next task: `createWorkflow()`

---

## 🎓 Learning Resources

**Inside this repository:**
- `docs/FRAMEWORK.md` — Understand agent roles
- `docs/ARCHITECTURE.md` — System design context
- `docs/INTEGRATION.md` — LEO Kit integration details
- `PHASE_1_QUICK_START.md` — Quick reference

**External:**
- LEO Kit documentation (when installed: `node_modules/leo-workflow-kit/README.md`)
- TypeScript documentation: https://www.typescriptlang.org/docs/
- Jest testing: https://jestjs.io/docs/getting-started

---

## ⏱️ Time Breakdown

| Task | Time |
|------|------|
| Read documentation | 30 min |
| Understand LEO Kit API | 30 min |
| Implement analyzeRequest() | 1-2 hours |
| Write tests | 1-2 hours |
| Debug & refine | 30 min |
| **Total** | **4-6 hours** |

---

## 🚀 Next Task

Once this is complete, move to:

**Task 2: Implement `Orchestrator.createWorkflow()`**

---

**Status**: 🟡 Ready to Start
**Assigned To**: You 👨‍💻
**Due**: By end of Week 1 (November 1)
**Blocker**: None (can start immediately after setup)

---

Last Updated: October 25, 2025
