# 🚀 STORY 3.9: Coder Agent Implementation Plan

**Status:** 🟢 READY TO IMPLEMENT
**Predecessor:** Story 3.8 (Mode Router) ✅ COMPLETE
**Target Completion:** November 19, 2025 (2 weeks)
**Priority:** HIGH - Foundation for Stories 3.10, 3.11

---

## 📋 Overview

**Story 3.9: Coder Agent** generates production-ready code based on user prompts detected as GENERATE intent by Mode Router.

### What It Does

- Receives "generate" intent from Mode Router
- Takes natural language request (e.g., "Write a React login component")
- Generates complete, working code with tests
- Returns code, tests, and quality metrics
- Integrates seamlessly with Mode Router

### Success Criteria

✅ Generates working code for common tasks
✅ Produces unit tests with >80% coverage
✅ TypeScript strict mode compliant
✅ Formatted with Prettier
✅ Documented with JSDoc
✅ <5 second response time
✅ 14/14 tests passing (100%)
✅ Production-ready quality

---

## 🏗️ Architecture

### 3-Layer Design (Proven Pattern from Story 3.8)

```
┌─────────────────────────────────────┐
│ Layer 1: React Component            │
│ CodeGenerator.tsx                   │
│ - Input form & options              │
│ - Real-time output streaming        │
│ - Code preview with syntax highlight
│ - Test results display              │
└────────────┬────────────────────────┘
             │ POST /api/generate-code
             │ WebSocket /generate-stream
             ▼
┌─────────────────────────────────────┐
│ Layer 2: API Endpoints              │
│ pages/api/generate-code.ts          │
│ - Request validation                │
│ - LLM API orchestration             │
│ - Response formatting               │
└────────────┬────────────────────────┘
             │ Calls codeGenerator()
             │ Calls codeValidator()
             │ Calls testGenerator()
             ▼
┌─────────────────────────────────────┐
│ Layer 3: Business Logic             │
│ packages/leo-client/src/coder/      │
│                                     │
│ ├─ generator.ts (LLM API)           │
│ ├─ validator.ts (quality checks)    │
│ ├─ formatter.ts (code formatting)   │
│ ├─ test-generator.ts (tests)        │
│ └─ index.ts (public API)            │
└─────────────────────────────────────┘
```

---

## 📁 Implementation Roadmap

### Phase 1: Foundation (Days 1-2)

**Goal:** Set up structure and LLM integration

- [ ] Create file structure for coder module
- [ ] Set up Claude API client
- [ ] Create TypeScript interfaces
- [ ] Write system prompts
- [ ] Set up test framework

**Deliverables:**

- Empty modules with interfaces
- LLM API client working
- Test setup complete

### Phase 2: Core Generator (Days 3-5)

**Goal:** Implement LLM-based code generation

- [ ] Implement generator.ts (LLM integration)
- [ ] Create few-shot examples
- [ ] Add streaming support
- [ ] Error handling & retries
- [ ] Unit tests (6 tests)

**Deliverables:**

- generateCode() function working
- Streaming output working
- 6/6 generator tests passing

### Phase 3: Validation (Days 6-7)

**Goal:** Ensure generated code quality

- [ ] TypeScript validation
- [ ] ESLint integration
- [ ] Security scanning
- [ ] Import resolution
- [ ] Unit tests (4 tests)

**Deliverables:**

- validator.ts complete
- 4/4 validator tests passing
- Can catch common errors

### Phase 4: Formatting & Tests (Days 8-9)

**Goal:** Polish code and generate tests

- [ ] Prettier formatter
- [ ] Test case generation
- [ ] Mock creation
- [ ] Coverage analysis
- [ ] Unit tests (4 tests)

**Deliverables:**

- formatter.ts and test-generator.ts complete
- 4/4 formatter tests passing
- Test generation working

### Phase 5: Integration (Days 10-12)

**Goal:** Connect all pieces together

- [ ] Create API endpoint
- [ ] React component implementation
- [ ] Mode Router integration
- [ ] Demo page
- [ ] End-to-end tests

**Deliverables:**

- API endpoint working
- Components render correctly
- Integration tests passing (4 tests)

### Phase 6: Polish (Days 13-14)

**Goal:** Final quality assurance

- [ ] Performance optimization
- [ ] Documentation (500+ lines)
- [ ] Security audit
- [ ] Final testing
- [ ] Stakeholder materials

**Deliverables:**

- All 14/14 tests passing
- Documentation complete
- Demo ready for Nov 12

---

## 📊 Technical Specifications

### Input

```typescript
interface CodeGenerationRequest {
  prompt: string; // "Write a React login form"
  language?: "typescript" | "javascript" | "python"; // Default: typescript
  framework?: "react" | "next" | "vue"; // Default: react
  includeTests?: boolean; // Default: true
  testCoverage?: number; // Default: 80
  streaming?: boolean; // Default: true
}
```

### Output

```typescript
interface GeneratedCode {
  code: string; // Generated source code
  tests: string; // Generated test code
  quality: {
    hasTypeErrors: boolean;
    hasLintErrors: boolean;
    testCoverage: number; // 0-100%
  };
  metadata: {
    generatedAt: string; // ISO 8601
    modelUsed: string; // "claude-3-sonnet"
    executionTime: number; // milliseconds
    tokensUsed: number;
  };
}
```

### Performance Targets

| Metric              | Target          | Notes                          |
| ------------------- | --------------- | ------------------------------ |
| First token latency | <500ms          | User sees feedback immediately |
| Total generation    | <5s             | Complete response in 5 seconds |
| Code quality        | 100%            | TypeScript strict + ESLint     |
| Test coverage       | >80%            | Generated tests cover code     |
| Streaming speed     | 100+ tokens/sec | Smooth real-time display       |

---

## 🧪 Testing Strategy

### Unit Tests (8 tests)

```
generator.test.ts (3 tests)
  ✓ Generates valid TypeScript code
  ✓ Handles streaming correctly
  ✓ Error handling on API failure

validator.test.ts (2 tests)
  ✓ Catches TypeScript errors
  ✓ Validates ESLint rules

formatter.test.ts (2 tests)
  ✓ Formats code with Prettier
  ✓ Handles language-specific formatting

test-generator.test.ts (1 test)
  ✓ Generates unit tests with >80% coverage
```

### API Integration Tests (4 tests)

```
POST /api/generate-code (2 tests)
  ✓ Accepts request and returns code
  ✓ Handles error cases

Streaming endpoint (2 tests)
  ✓ Streams response tokens
  ✓ Handles connection errors
```

### Component Tests (2 tests)

```
CodeGenerator.tsx (2 tests)
  ✓ Renders input form
  ✓ Displays generated code
```

**Total: 14/14 tests (100% coverage)**

---

## 🔗 Integration with Mode Router

### User Flow

```
User: "Write a React component for user login"
  ↓
Mode Router (Story 3.8)
  Detects: intent="generate", confidence=0.95
  ↓
Coder Agent (Story 3.9)
  Receives: { intent: "generate", prompt: "Write a React component..." }
  ↓
  Generates:
  - LoginComponent.tsx (140 lines)
  - LoginComponent.test.tsx (80 lines, 87% coverage)
  - quality: { typeErrors: false, lintErrors: false, coverage: 87 }
  ↓
Display to User:
  - Code preview with syntax highlighting
  - Test results (✅ All tests passing)
  - Copy/download buttons
```

### Code Integration

```typescript
// In demo page
import { detectMode } from "@/lib/mode-router";
import { generateCode } from "@/lib/coder";

export default function DemoPage() {
  const handleGenerate = async (input: string) => {
    // Step 1: Detect intent
    const modeResult = await detectMode(input);

    // Step 2: If generate intent, call Coder Agent
    if (modeResult.intent === "generate") {
      const code = await generateCode({
        prompt: input,
        language: "typescript",
        framework: "react",
        includeTests: true,
      });

      // Step 3: Display results
      displayCode(code);
    }
  };
}
```

---

## 📦 File Structure

### New Files to Create

```
packages/leo-client/src/coder/
├── generator.ts              (150+ LOC - LLM integration)
├── validator.ts              (100+ LOC - code validation)
├── formatter.ts              (80+ LOC - code formatting)
├── test-generator.ts         (120+ LOC - test generation)
├── prompts/
│   ├── system.ts            (System prompt)
│   ├── examples.ts          (Few-shot examples)
│   └── templates.ts         (Prompt templates)
├── __tests__/
│   ├── generator.test.ts    (3 tests)
│   ├── validator.test.ts    (2 tests)
│   ├── formatter.test.ts    (2 tests)
│   └── test-generator.test.ts (1 test)
└── index.ts                  (50+ LOC - public API)

apps/web/pages/api/
├── generate-code.ts         (REST endpoint)
├── __tests__/
│   └── generate-code.test.ts (4 integration tests)

apps/web/components/
├── CodeGenerator.tsx         (React component)
├── CodePreview.tsx          (Syntax highlighting)
└── TestResults.tsx          (Test display)

docs/
├── CODER_AGENT.md           (Architecture, 500+ lines)
└── CODE_GENERATION_API.md   (API reference)
```

---

## 🚀 Getting Started

### Step 1: Create GitHub Issues

Create 6 issues for tracking:

1. **[TASK] Setup coder module infrastructure**
   - Create file structure
   - Configure dependencies
   - Set up test framework

2. **[FEATURE] Implement code generator**
   - LLM API integration
   - Streaming support
   - Error handling

3. **[FEATURE] Add code validation**
   - TypeScript checking
   - ESLint integration
   - Security scanning

4. **[FEATURE] Generate unit tests**
   - Analyze code structure
   - Create test cases
   - Achieve >80% coverage

5. **[INTEGRATION] Create API endpoints**
   - REST endpoint
   - Streaming endpoint
   - Error handling

6. **[UI] Build React components**
   - Input form
   - Code preview
   - Test results display

### Step 2: Create Feature Branch

```bash
git checkout -b feature/story-3-9-coder-agent
```

### Step 3: Initial Commit

```bash
# Create basic structure
mkdir -p packages/leo-client/src/coder/{prompts,__tests__}
touch packages/leo-client/src/coder/{generator,validator,formatter,test-generator,index}.ts

# Commit
git add packages/leo-client/src/coder/
git commit -m "feat(coder): initialize coder agent module structure

- Create coder module directories
- Set up TypeScript interfaces
- Prepare for implementation

Story 3.9 implementation starts"
```

---

## 📈 Key Deliverables

### Code (550+ LOC)

- [ ] generator.ts (150+ LOC)
- [ ] validator.ts (100+ LOC)
- [ ] formatter.ts (80+ LOC)
- [ ] test-generator.ts (120+ LOC)
- [ ] API endpoint (100+ LOC)
- [ ] React components (200+ LOC)

### Tests (600+ LOC, 14 tests)

- [ ] Unit tests (600+ LOC)
- [ ] API tests (300+ LOC)
- [ ] 100% code coverage
- [ ] All tests passing

### Documentation (500+ LOC)

- [ ] Architecture documentation
- [ ] API reference
- [ ] Code examples
- [ ] Troubleshooting guide

### Demo

- [ ] Demo page showing Mode Router → Coder Agent flow
- [ ] Live code generation examples
- [ ] Stakeholder presentation materials

---

## ✅ Success Criteria Checklist

### Development

- [ ] generator.ts complete and tested (6 tests)
- [ ] validator.ts complete and tested (2 tests)
- [ ] formatter.ts complete and tested (2 tests)
- [ ] test-generator.ts complete and tested (1 test)
- [ ] API endpoint working (4 tests)
- [ ] React components rendering
- [ ] Integration tests passing (2 tests)

### Quality

- [ ] 14/14 tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Zero type errors
- [ ] Zero linting errors
- [ ] JSDoc comments on all functions

### Documentation

- [ ] Architecture document (500+ lines)
- [ ] API reference complete
- [ ] Code examples included
- [ ] Demo script prepared
- [ ] Troubleshooting guide

### Git & GitHub

- [ ] Feature branch created
- [ ] 6 GitHub issues created and tracked
- [ ] Clean commit history
- [ ] All changes committed
- [ ] PR ready for review

---

## 🎯 Timeline

| Phase              | Days        | Status  | Target Date |
| ------------------ | ----------- | ------- | ----------- |
| Foundation         | 1-2         | ⏳ TODO | Nov 1-2     |
| Core Generator     | 3-5         | ⏳ TODO | Nov 3-5     |
| Validation         | 6-7         | ⏳ TODO | Nov 6-7     |
| Formatting & Tests | 8-9         | ⏳ TODO | Nov 8-9     |
| Integration        | 10-12       | ⏳ TODO | Nov 10-12   |
| Polish & Docs      | 13-14       | ⏳ TODO | Nov 13-14   |
| **COMPLETE**       | **2 weeks** | ⏳ TODO | **Nov 19**  |

---

## 💡 Key Insights from Story 3.8

**Lessons to Apply:**

1. 3-layer architecture = proven and effective
2. Comprehensive testing = 100% coverage achievable
3. Documentation = write as you build
4. Git hygiene = clean commits matter
5. Demo readiness = build alongside feature

**Patterns to Reuse:**

- Test structure (8 unit + 6 API tests)
- Commit message format
- Documentation style
- TypeScript interfaces
- Error handling approach

---

## 🔄 Dependencies

### Prerequisites (Met ✅)

- [x] Story 3.8 (Mode Router) complete
- [x] Test patterns established
- [x] Development environment ready
- [x] Team trained on architecture

### External Dependencies

- Anthropic Claude API (for code generation)
- TypeScript compiler (validation)
- ESLint (linting)
- Prettier (formatting)
- Jest (testing)

---

## 📞 Decision Log

**Q: Why start with Mode Router → Coder Agent and not other combinations?**
A: GENERATE is most common user request. Proves system works end-to-end.

**Q: Why Claude instead of ChatGPT?**
A: Better code generation quality, more reliable, good streaming support.

**Q: Should we support multiple languages in MVP?**
A: Yes - TypeScript, JavaScript, Python. Frameworks: React, Next, Vue.

**Q: How to handle streaming?**
A: WebSocket for real-time tokens, REST endpoint as fallback.

**Q: When should we run validators?**
A: After LLM generation, before returning to user.

---

## 🚀 Next Action

**Create GitHub Issues:**

```bash
# Use GitHub CLI to create issues
gh issue create --title "[TASK] Setup coder module infrastructure" \
  --body "Create file structure and set up for Story 3.9 implementation"

gh issue create --title "[FEATURE] Implement code generator module" \
  --body "LLM integration for generating production-ready code"

gh issue create --title "[FEATURE] Add code validation" \
  --body "TypeScript, ESLint, security scanning"

gh issue create --title "[FEATURE] Generate unit tests" \
  --body "Analyze code and generate tests with >80% coverage"

gh issue create --title "[INTEGRATION] Create API endpoints" \
  --body "REST and streaming endpoints for code generation"

gh issue create --title "[UI] Build React components" \
  --body "Input form, code preview, test results display"
```

**Start Implementation:**

```bash
git checkout -b feature/story-3-9-coder-agent
# Begin Phase 1: Foundation
```

---

## 📋 Quick Reference

**Estimated Effort:** 44 development hours over 2 weeks
**Target Tests:** 14/14 (100%)
**Target Coverage:** 100%
**Target LOC:** 1500+
**Status:** 🟢 **READY TO START**

**Next Milestone:** Story 3.10 (Verifier Agent) after Nov 14
**Demo Day:** November 12 (Extended Mode Router demo showing end-to-end flow)

---

**Status:** ✅ PLAN COMPLETE - READY FOR IMPLEMENTATION

Ready to begin? Start with GitHub issue creation and Phase 1 setup! 🚀
