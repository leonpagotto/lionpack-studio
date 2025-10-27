# Story 3.15: Code Intelligence & Inline Suggestions

## 🎯 Objective

Add AI-powered code intelligence features that enhance developer productivity by providing context-aware code analysis, suggestions, and refactoring assistance directly in the Kilo Code editor.

## 💡 Inspiration from Morphic + Kilo Code

**Leverage Existing:**

- ✅ **Kilo Code Editor** - Already has syntax highlighting, file tree, code display
- ✅ **Morphic Chat** - Already has AI streaming, code generation, context awareness
- ✅ **EnhancedChatContainer** - Already has file operations, GitHub operations, approval workflow

**New Intelligence Layer:**

- Add inline code analysis while user types
- Suggest improvements directly in editor
- Provide quick fixes for common issues
- Generate documentation on demand
- Refactor code with AI assistance

## 📋 Features

### 1. Inline Code Analysis (Real-time)

**Code Quality Indicators:**

- 🔴 Red underline: Errors, bugs, security issues
- 🟡 Yellow underline: Warnings, performance issues, code smells
- 🔵 Blue underline: Suggestions, refactoring opportunities
- ⚪ Gray underline: Info, documentation suggestions

**Analysis Types:**

- Syntax errors
- Type errors (TypeScript)
- Unused variables
- Missing error handling
- Performance anti-patterns
- Security vulnerabilities (hardcoded secrets, SQL injection risks)
- Accessibility issues (missing ARIA labels)

### 2. Quick Fixes & Refactoring

**Quick Fix Menu (when user clicks underlined code):**

- Apply suggested fix
- Ignore this warning
- Learn more about this issue
- Show similar issues in project

**Refactoring Options:**

- Extract to function
- Extract to variable
- Rename symbol (all occurrences)
- Convert to async/await
- Add error handling
- Add TypeScript types
- Generate tests for this function

### 3. Smart Code Completion

**Context-Aware Suggestions:**

- Function names based on usage patterns
- Import statements (auto-import from node_modules)
- Type definitions (TypeScript)
- Documentation comments (JSDoc/TSDoc)
- Test cases based on function signature

### 4. Documentation Generation

**Auto-Generate Documentation:**

- JSDoc comments for functions
- TSDoc comments for TypeScript
- README sections based on code
- API documentation from endpoints

### 5. Code Metrics & Insights

**Show in Sidebar:**

- Cyclomatic complexity per function
- Code coverage percentage
- Performance hotspots
- Security score
- Maintainability index

## 🏗️ Architecture

### Component Structure

```
apps/web/components/
├── KiloEditor/
│   ├── CodeEditor.tsx              (existing - enhance with intelligence)
│   ├── InlineAnalysis.tsx          (new - show code issues inline)
│   ├── QuickFixMenu.tsx            (new - quick fix suggestions)
│   ├── CodeMetricsPanel.tsx        (new - metrics sidebar)
│   └── SmartCompletion.tsx         (new - enhanced autocomplete)
│
├── AIChat/
│   └── EnhancedChatContainer.tsx   (existing - add code intelligence operations)
│
└── CodeIntelligence/
    ├── AnalysisEngine.tsx          (new - core analysis logic)
    ├── RefactoringProvider.tsx     (new - refactoring suggestions)
    ├── DocumentationGenerator.tsx  (new - auto-generate docs)
    └── MetricsCalculator.tsx       (new - calculate code metrics)
```

### Integration Flow

```
User types in CodeEditor
       ↓
AnalysisEngine analyzes code (debounced 500ms)
       ↓
Detects issues/suggestions
       ↓
InlineAnalysis renders underlines
       ↓
User clicks underlined code
       ↓
QuickFixMenu shows options
       ↓
User selects fix
       ↓
EnhancedChatContainer processes fix (approval workflow)
       ↓
CodeEditor updates with fixed code
```

## 📦 Implementation Phases

### Phase 1: Analysis Engine (Core) - 3-4 hours

**Files to Create:**

- `packages/leo-client/src/lib/intelligence/analysis-engine.ts`
- `packages/leo-client/src/lib/intelligence/types.ts`
- `packages/leo-client/src/lib/intelligence/__tests__/analysis-engine.test.ts`

**Capabilities:**

- Parse JavaScript/TypeScript code
- Detect syntax errors, type errors, unused variables
- Calculate complexity metrics
- Identify security issues
- Performance anti-patterns

### Phase 2: Inline Analysis UI - 2-3 hours

**Files to Create:**

- `apps/web/components/KiloEditor/InlineAnalysis.tsx`
- `apps/web/components/KiloEditor/QuickFixMenu.tsx`
- `apps/web/components/KiloEditor/__tests__/InlineAnalysis.test.tsx`

**Features:**

- Render underlines in CodeEditor based on issues
- Click handler to show QuickFixMenu
- Apply quick fix (update code)

### Phase 3: AI-Powered Suggestions - 2-3 hours

**Files to Create:**

- `packages/leo-client/src/lib/intelligence/ai-suggestions.ts`
- `apps/web/components/CodeIntelligence/RefactoringProvider.tsx`
- `apps/web/components/CodeIntelligence/SmartCompletion.tsx`

**Features:**

- Call AI (Gemini/Claude) to suggest refactorings
- Smart code completion using AI
- Context-aware suggestions

### Phase 4: Documentation Generator - 2 hours

**Files to Create:**

- `packages/leo-client/src/lib/intelligence/doc-generator.ts`
- `apps/web/components/CodeIntelligence/DocumentationGenerator.tsx`

**Features:**

- Generate JSDoc/TSDoc from function signatures
- Generate README sections from code
- API documentation from endpoints

### Phase 5: Code Metrics & Testing - 2-3 hours

**Files to Create:**

- `packages/leo-client/src/lib/intelligence/metrics-calculator.ts`
- `apps/web/components/KiloEditor/CodeMetricsPanel.tsx`
- `packages/leo-client/src/lib/intelligence/__tests__/*`

**Features:**

- Calculate cyclomatic complexity
- Measure code coverage
- Security score
- Maintainability index

**Testing:**

- 25+ unit tests for AnalysisEngine
- 15+ tests for UI components
- Integration tests for end-to-end flow
- Target: 85%+ coverage

## 🧪 Testing Strategy

### Unit Tests (40+ tests)

**AnalysisEngine:**

- ✅ Detect syntax errors
- ✅ Detect type errors
- ✅ Detect unused variables
- ✅ Detect security issues
- ✅ Calculate complexity correctly
- ✅ Generate quick fixes

**UI Components:**

- ✅ InlineAnalysis renders underlines
- ✅ QuickFixMenu shows options
- ✅ Apply fix updates code
- ✅ CodeMetricsPanel displays metrics

### Integration Tests

- ✅ User types code → Analysis runs → Issues shown
- ✅ User clicks issue → Menu appears → Fix applied → Code updated
- ✅ AI suggestions fetched and displayed
- ✅ Documentation generated correctly

## 📚 Dependencies

**New Packages:**

```bash
npm install @babel/parser @babel/traverse @babel/types
npm install typescript  # For TypeScript analysis
npm install eslint      # For linting rules
```

**Leverage Existing:**

- ✅ AI providers (Story 3.10) - Gemini/Claude for suggestions
- ✅ EnhancedChatContainer (Story 3.12) - Approval workflow
- ✅ FileSystem (Story 3.11) - File reading/writing
- ✅ GitHubService (Story 3.13/3.14) - Commit changes

## 🎯 Success Criteria

- [ ] Code analysis runs in < 500ms for files up to 1000 lines
- [ ] Shows at least 5 types of issues (syntax, type, security, performance, style)
- [ ] Quick fix menu appears on click with 2-5 options per issue
- [ ] AI-generated suggestions are relevant and helpful
- [ ] Documentation generator produces accurate JSDoc/TSDoc
- [ ] Code metrics accurate (complexity, coverage, maintainability)
- [ ] All tests passing (40+ tests, 85%+ coverage)
- [ ] Zero performance degradation in CodeEditor typing

## 🔗 Integration with Existing Stories

**Leverages:**

- ✅ **Story 3.9** - Kilo Code editor UI
- ✅ **Story 3.10** - Multi-AI provider support (Gemini/Claude for suggestions)
- ✅ **Story 3.12** - Enhanced chat with file operations
- ✅ **Story 3.13** - GitHub integration (commit suggested fixes)
- ✅ **Story 3.14** - Advanced Git (commit refactorings)

**Enables:**

- 🚀 **Story 3.16** - AI Pair Programming (real-time collaboration with AI)
- 🚀 **Story 3.17** - Test Generation (auto-generate tests from functions)

## 📅 Estimate

**Total Effort:** 12-15 hours (2-3 days)

- Phase 1: 3-4 hours
- Phase 2: 2-3 hours
- Phase 3: 2-3 hours
- Phase 4: 2 hours
- Phase 5: 2-3 hours

**Priority:** High
**Complexity:** Medium-High

## 🦁 LionPack Philosophy

**Speed meets Structure:**

- ✅ Real-time analysis (speed)
- ✅ Quality suggestions (structure)
- ✅ AI-powered refactoring (speed)
- ✅ Best practices enforcement (structure)

**Empowerment:**

- Solo developers get enterprise-level code intelligence
- AI suggests improvements without being intrusive
- Learn better coding patterns through suggestions

**Creativity + Standards:**

- AI suggests creative refactorings
- But always aligns with project standards
- Maintains code quality while moving fast
