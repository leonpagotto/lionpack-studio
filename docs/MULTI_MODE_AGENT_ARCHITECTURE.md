# LionPack Studio: Multi-Mode AI Agent Architecture Guide

**Reference Document for Hybrid IDE Implementation**

---

## 🎯 ARCHITECTURE OVERVIEW

### Core Concept: Task-Specific AI Agents

Each AI mode is a specialized agent optimized for a specific type of development work.

```
┌─────────────────────────────────────────────────────┐
│        User Request in LionPack IDE Chat            │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
    ┌──────────────────────────────┐
    │  AI Intent Analysis Engine    │
    │ (What type of work is this?)  │
    └──────────┬───────────────────┘
               │
    ┌──────────┴──────────┬──────────────┬──────────────┐
    │                     │              │              │
    ↓                     ↓              ↓              ↓
┌─────────┐        ┌──────────┐  ┌────────────┐  ┌──────────┐
│Architect│        │ Coder    │  │ Debugger   │  │ Reviewer │
│ Mode    │        │ Mode     │  │ Mode       │  │ Mode     │
└────┬────┘        └────┬─────┘  └────┬───────┘  └────┬─────┘
     │                  │             │              │
     ↓                  ↓             ↓              ↓
  [Plan]         [Generate+Test]  [Analyze+Fix]  [Verify+Gate]
     │                  │             │              │
     └──────────────────┴─────────────┴──────────────┘
                        │
                        ↓
         ┌──────────────────────────────┐
         │  AI Response with Execution  │
         │  (Code, Plan, Fix, Review)   │
         └──────────────────────────────┘
                        │
                        ↓
         ┌──────────────────────────────┐
         │  Chat Sidebar Update         │
         │  Streaming in real-time      │
         └──────────────────────────────┘
```

---

## 🤖 THE FOUR CORE MODES

### 1. ARCHITECT MODE

**Purpose:** Plan and design the implementation

```typescript
interface ArchitectMode {
  name: "architect";
  systemPrompt: `You are an expert software architect...`;

  availableTools: [
    "read-files", // Understand existing code
    "analyze-codebase", // Identify patterns
    "create-specs", // Output specifications
    "suggest-architecture", // Design recommendations
  ];

  requiredContext: {
    codebase: "full"; // Needs full understanding
    history: "relevant"; // Previous related decisions
    standards: "required"; // Must know team standards
  };

  requiresVerification: false; // Planning is iterative

  successCriteria: [
    "Clear specification document",
    "Architecture diagram",
    "Technology choices justified",
    "Implementation plan with steps",
  ];
}

// Example Flow
const request = "I need to build a user authentication system";

// Architect Mode:
// 1. Analyzes existing codebase for similar patterns
// 2. Examines project standards and conventions
// 3. Recommends architecture (JWT vs sessions vs OAuth)
// 4. Suggests database schema design
// 5. Creates step-by-step implementation spec
// 6. Outputs clear document ready for Coder mode

// Output:
/*
AUTHENTICATION SYSTEM SPECIFICATION

1. Architecture: JWT-based with refresh tokens
2. Database Schema:
   - users table
   - auth_tokens table
3. Implementation Steps:
   3.1 Create database schema
   3.2 Setup passport middleware
   3.3 Create login endpoint
   3.4 Create registration endpoint
   3.5 Protect routes with auth
*/
```

### 2. CODER MODE

**Purpose:** Implement code per specifications with automatic verification

```typescript
interface CoderMode {
  name: "coder";
  systemPrompt: `You are an expert developer...`;

  availableTools: [
    "read-files", // Check existing code
    "create-file", // Create new files
    "modify-file", // Update files
    "run-tests", // Execute test suite
    "run-build", // Build project
    "format-code", // Apply standards
  ];

  requiredContext: {
    codebase: "full";
    specification: "required"; // From Architect output
    history: "relevant";
    testSuite: "required"; // Must know how to test
  };

  requiresVerification: true; // CRITICAL: Must verify

  successCriteria: [
    "Code implements specification",
    "All tests pass",
    "No linting errors",
    "Follows project conventions",
  ];

  verificationStrategy: "test-based" | "spec-based";
}

// Example Flow
const specification = `Implement JWT authentication...`;

// Coder Mode:
// 1. Reads existing authentication code (if any)
// 2. Creates auth module files per specification
// 3. Generates auth endpoints (login, register, refresh)
// 4. Creates comprehensive tests for each endpoint
// 5. VERIFICATION: Runs all tests
// 6. If tests pass → Done
// 7. If tests fail → Tries alternative implementation
// 8. Compares implementation against specification
// 9. Outputs verified, tested code

// Verification Flow:
const testResults = await runTests();
if (testResults.passed) {
  return { success: true, code: implementation };
} else {
  // Try alternative approach with error context
  const secondAttempt = await generateAlternative(testResults.errors);
  const results2 = await runTests(secondAttempt);
  if (results2.passed) {
    return { success: true, code: secondAttempt };
  } else {
    // Route to Debugger mode for investigation
    return {
      success: false,
      routeTo: "debugger",
      errors: results2.errors,
    };
  }
}
```

### 3. DEBUGGER MODE

**Purpose:** Find and fix bugs and issues

```typescript
interface DebuggerMode {
  name: "debugger";
  systemPrompt: `You are an expert debugger...`;

  availableTools: [
    "read-files",
    "analyze-errors", // Parse error messages
    "read-logs", // Review log output
    "trace-execution", // Step through code
    "run-tests", // Reproduce issues
    "modify-file", // Apply fixes
  ];

  requiredContext: {
    codebase: "full";
    errorMessage: "required"; // What's broken?
    stackTrace: "required"; // Where did it break?
    history: "relevant";
  };

  requiresVerification: true; // Verify fix works

  successCriteria: [
    "Error no longer occurs",
    "Tests pass",
    "Root cause identified",
    "Fix is minimal",
  ];
}

// Example Flow
const issue = {
  error: "TypeError: Cannot read property 'email' of undefined",
  stackTrace: "at User.findByEmail (src/models/user.ts:45:15)",
  context: "Happens during login with valid credentials",
};

// Debugger Mode:
// 1. Reads error message and stack trace
// 2. Analyzes relevant code sections
// 3. Identifies root cause: User object missing
// 4. Checks database query logic
// 5. Generates fix
// 6. VERIFICATION: Reproduces original error
// 7. VERIFICATION: Confirms fix resolves it
// 8. Outputs corrected code

// Fix Process:
const rootCause = await analyzeError(issue);
// → "User query returning null when it shouldn't"

const fix = await generateFix(rootCause);
// → Add proper null checking and default handling

const verification = await verifyFix(fix);
// → Run original failing test with fix
// → Confirm test now passes
```

### 4. REVIEWER MODE

**Purpose:** Quality gate before merging/deployment

```typescript
interface ReviewerMode {
  name: "reviewer";
  systemPrompt: `You are an expert code reviewer...`;

  availableTools: [
    "read-files",
    "analyze-code", // Code quality checks
    "run-tests", // Check coverage
    "check-coverage", // Ensure high coverage
    "lint-check", // Style compliance
    "security-scan", // Security analysis
  ];

  requiredContext: {
    codebase: "full";
    changes: "required"; // What changed?
    tests: "required"; // Are they tested?
    standards: "required"; // Team standards
  };

  requiresVerification: true;

  successCriteria: [
    "Code quality score >= 8/10",
    "Test coverage > 80%",
    "No security issues",
    "Follows conventions",
    "Performance acceptable",
  ];

  // Auto-triggered after other modes complete
  autoTrigger: "after-coder-mode" | "on-pr-create";
}

// Example Flow
// Auto-triggered after Coder mode completes

const changes = {
  filesModified: ["src/auth/login.ts", "src/models/user.ts"],
  testsAdded: ["src/__tests__/auth.test.ts"],
};

// Reviewer Mode:
// 1. Reviews code quality
//    → Complexity analysis
//    → Style compliance
//    → Design patterns
// 2. Checks test coverage
//    → Requires > 80%
//    → Identifies gaps
// 3. Security scan
//    → OWASP checks
//    → Dependencies vulnerabilities
// 4. Performance review
//    → Database queries
//    → Algorithm efficiency
// 5. Standards compliance
//    → Naming conventions
//    → File organization
// 6. Outputs detailed review
//    → APPROVED ✓ if all checks pass
//    → NEEDS REVISION if issues found
//    → AUTOMATED FIX suggestions

// Review Output:
const review = {
  status: "NEEDS_REVISION",
  issues: [
    { type: "coverage", message: "Test coverage only 72%, need 80%+" },
    { type: "security", message: "SQL injection risk in query builder" },
    { type: "performance", message: "N+1 query problem detected" },
  ],
  suggestions: [
    "Add test cases for error scenarios",
    "Use parameterized queries",
    "Add database query optimization",
  ],
};

// If approved:
const review = {
  status: "APPROVED",
  scores: {
    quality: 9,
    coverage: 85,
    security: 10,
    performance: 8,
  },
};
```

---

## 🎛️ MODE SELECTION LOGIC

### Intent Classification

The system analyzes user requests to determine the best mode:

```typescript
async function selectMode(userRequest: string): Promise<AIMode> {
  const intent = await analyzeUserIntent(userRequest);

  if (intent.type === 'planning' || intent.type === 'design') {
    return modes.architect;
  }

  if (intent.type === 'implementation' || intent.type === 'coding') {
    return modes.coder;
  }

  if (intent.type === 'debugging' || intent.type === 'fixing') {
    return modes.debugger;
  }

  if (intent.type === 'review' || intent.type === 'quality' || intent.type === 'testing') {
    return modes.reviewer;
  }

  // If ambiguous, ask user
  return null; // Prompt user to clarify
}

// Examples:
selectMode("Build a user registration system")
→ ARCHITECT (planning task)

selectMode("Implement the registration API")
→ CODER (implementation task)

selectMode("Login endpoint is returning 500")
→ DEBUGGER (debugging task)

selectMode("Check my authentication code quality")
→ REVIEWER (review task)
```

---

## 🔄 MODE ORCHESTRATION & HANDOFFS

### Natural Workflow: One Mode Leading to Next

```
Step 1: User says "Build an authentication system"
        ↓ Routes to ARCHITECT
        ARCHITECT produces specification

Step 2: User accepts architect specification
        ↓ Routes to CODER
        CODER implements code per spec
        CODER self-verifies with tests

Step 3: CODER encounters failing tests (beyond self-correction)
        ↓ Routes to DEBUGGER
        DEBUGGER analyzes failures
        DEBUGGER fixes issues
        DEBUGGER verifies fixes work

Step 4: CODER completes (or manual check point)
        ↓ AUTO-TRIGGERS REVIEWER
        REVIEWER performs quality gate
        REVIEWER approves or requests changes

Step 5: All modes complete
        ↓ Routes to LEO Kit
        LEO Kit creates GitHub issue
        LEO Kit creates/updates PR
        LEO Kit tracks workflow
```

### Mode Cooperation

```typescript
interface ModeCooperation {
  architectOutput: SpecificationDocument;
  // ↓ Passed to Coder as context

  coderOutput: ImplementationArtifacts;
  // Includes: { code, tests, failures }
  // ↓ If failures, passed to Debugger

  debuggerOutput: FixedArtifacts;
  // Includes: { code, fixes, testResults }
  // ↓ Passed back to Coder for verification

  reviewerOutput: QualityReport;
  // Includes: { status, scores, suggestions }
}
```

---

## 🛠️ TOOL SYSTEM (MCP-Inspired)

### Tool Registry & Execution

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: Record<string, ParameterSchema>;
  execute: (params) => Promise<Result>;
  modesAllowedTo: AIMode["name"][]; // Which modes can use?
}

// Example Tools

const readFileTool: Tool = {
  name: "read-file",
  description: "Read contents of a file",
  parameters: {
    path: { type: "string", required: true },
  },
  execute: async (params) => {
    return await fs.readFile(params.path, "utf-8");
  },
  modesAllowedTo: ["architect", "coder", "debugger", "reviewer"],
};

const runTestsTool: Tool = {
  name: "run-tests",
  description: "Execute test suite",
  parameters: {
    filter: { type: "string", required: false },
  },
  execute: async (params) => {
    const result = await exec("npm test", params.filter);
    return {
      passed: result.code === 0,
      output: result.stdout,
      failures: result.failures,
    };
  },
  modesAllowedTo: ["coder", "debugger", "reviewer"],
};

const createFileTool: Tool = {
  name: "create-file",
  description: "Create a new file with content",
  parameters: {
    path: { type: "string", required: true },
    content: { type: "string", required: true },
  },
  execute: async (params) => {
    await fs.mkdir(dirname(params.path), { recursive: true });
    await fs.writeFile(params.path, params.content);
    return { success: true, path: params.path };
  },
  modesAllowedTo: ["coder"],
};

// Mode specifies which tools it needs
coderMode.availableTools = [
  "read-file",
  "create-file",
  "modify-file",
  "run-tests",
  "format-code",
];

// System checks permission before execution
async function executeTool(toolName: string, params: any, mode: AIMode) {
  const tool = toolRegistry.get(toolName);

  if (!tool.modesAllowedTo.includes(mode.name)) {
    throw new Error(`Mode ${mode.name} not allowed to use ${toolName}`);
  }

  return await tool.execute(params);
}
```

---

## 📊 CONTEXT INJECTION

### What Each Mode Sees

```typescript
interface ExecutionContext {
  // Universal context (all modes get this)
  files: FileSystem;
  currentFile: File;
  projectStructure: ProjectStructure;
  gitHistory: CommitHistory;

  // Mode-specific context
  architectContext: {
    existingPatterns: Pattern[];
    teamStandards: StandardsDoc[];
    archDecisions: ADR[];
  };

  coderContext: {
    specification: SpecDoc; // From Architect
    testSuite: TestRunner;
    linter: LinterConfig;
  };

  debuggerContext: {
    errorMessage: string;
    stackTrace: StackTrace;
    failingTests: Test[];
    errorLogs: Log[];
  };

  reviewerContext: {
    changedFiles: File[];
    coverageReport: CoverageReport;
    securityConfig: SecurityPolicy;
    styleGuide: StyleGuide;
  };
}
```

---

## 🚀 IMPLEMENTATION PRIORITIES

### Phase 1: Core System (Week 1-2)

- [ ] Mode base class and framework
- [ ] Architect mode (basic version)
- [ ] Coder mode (basic version)
- [ ] Mode router/selector

### Phase 2: Verification & Tools (Week 2-3)

- [ ] Verification framework
- [ ] Test-based verification
- [ ] Tool registry and execution
- [ ] Debugger mode

### Phase 3: Quality Gate (Week 3-4)

- [ ] Reviewer mode
- [ ] Quality scoring system
- [ ] Auto-triggered verification

### Phase 4: Integration (Week 4-5)

- [ ] LEO Kit workflow integration
- [ ] GitHub operations as tools
- [ ] Enhanced chat UI with mode selection
- [ ] Performance optimization

---

## 📈 SUCCESS METRICS

### Per Mode

**Architect Mode:**

- ✓ Specifications are clear and actionable
- ✓ Developers can implement from spec without clarification
- ✓ 90%+ accuracy in recommended architecture

**Coder Mode:**

- ✓ Generated code passes tests immediately
- ✓ 95%+ first-pass accuracy
- ✓ Self-verification catches 90% of issues before Debugger

**Debugger Mode:**

- ✓ Average time to fix < 5 minutes
- ✓ 85%+ success rate on first fix attempt
- ✓ Fixes don't introduce new bugs

**Reviewer Mode:**

- ✓ Catches 90% of security issues
- ✓ Test coverage >= 80% enforced
- ✓ Code quality score >= 8/10

### Overall System

- **Productivity:** 30-50% faster feature development
- **Quality:** 50%+ fewer bugs in production
- **Cost:** 20-30% lower API costs through intelligent fallback
- **User Satisfaction:** 4.5+/5 stars on IDE quality

---

## 🔗 RELATIONSHIP TO LEO KIT

### LEO Kit Integration Points

```
Multi-Mode Agent System
        ↓
   Issue Creation (from mode outputs)
        ↓
   Workflow Orchestration (auto-route between modes)
        ↓
   Status Tracking (each mode completion updates issue)
        ↓
   GitHub Integration (create/update PRs)
        ↓
   Verification as part of workflow (Reviewer is built-in verification)
```

### Example LEO Integration

```typescript
// After Coder mode completes:
const coderOutput = await coderMode.execute(request);

if (coderOutput.success) {
  // Auto-create GitHub issue
  await gh.issue.create({
    title: `feat(${component}): ${description}`,
    body: coderOutput.implementationSpec,
    labels: ["type:feature", "ai-generated", "review-pending"],
  });

  // Auto-trigger Reviewer mode
  const review = await reviewerMode.execute(coderOutput);

  // Update GitHub with review
  if (review.status === "APPROVED") {
    await gh.issue.addComment({
      body: "✅ Code review approved - ready for merge",
    });

    await gh.pr.create({
      title: coderOutput.title,
      body: reviewOutput.fullReport,
      state: "open",
    });
  }
}
```

---

## 📝 DEVELOPER GUIDE: ADDING NEW MODES

### Template for Custom Mode

```typescript
interface CustomMode extends AIMode {
  name: 'custom_mode_name';
  systemPrompt: `Custom system prompt...`;

  availableTools: string[];
  requiredContext: Record<string, any>;
  requiresVerification: boolean;
  successCriteria: string[];

  execute: async (request: string, context: ExecutionContext) => {
    // Implementation
  };

  verify?: async (output: any, context: ExecutionContext) => {
    // Verification logic
  };
}

// Register in mode registry
modeRegistry.register(customMode);

// Now users can trigger it from chat!
// "Use my_custom_mode to analyze this..."
```

---

**This architecture provides the flexibility of KiloCode with the web-first collaboration capabilities LionPack Stadium needs.**
