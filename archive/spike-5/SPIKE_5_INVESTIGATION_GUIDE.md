# 🔬 Spike #5: KiloCode Multi-Mode Architecture Investigation

**Issue:** #5
**Duration:** 2 working days
**Start Date:** 2025-10-25
**Owner:** TBD (Tech Lead or Senior Developer)
**Status:** 🟡 **IN PROGRESS**

---

## 🎯 Objective

Investigate KiloCode's multi-mode agent implementation to validate the hybrid architecture before committing 80+ days to full LionPack implementation.

**Critical Go/No-Go Decision:** Can we adapt KiloCode's multi-mode architecture for web/cloud with acceptable performance and complexity?

---

## 📋 Investigation Plan

### Day 1: Architecture Deep-Dive

#### 1. Mode System Analysis

Study KiloCode's mode implementation:

- [ ] How are modes defined and registered?
- [ ] What's the mode interface/contract?
- [ ] How is user intent detected and routed?
- [ ] Message flow: frontend → mode router → execution → response
- [ ] How are modes instantiated and managed?
- [ ] State management across mode transitions

**Key Files to Review:**

```
KiloCode Repository: https://github.com/Kilo-Org/kilocode
- src/modes/ - Mode implementations
- src/router/ - Intent detection and routing
- src/types.ts - Mode interfaces
```

#### 2. Coder Mode Specifics

Focus on Coder mode (most critical for our use case):

- [ ] Code generation strategy (prompt engineering, model selection)
- [ ] Test generation alongside code
- [ ] How verification/testing is triggered
- [ ] Test execution strategy (jest, vitest, mocha?)
- [ ] Coverage metrics extraction
- [ ] Handling of verification failures (retry logic?)
- [ ] Integration with file system and terminal

**Questions to Answer:**

- Does Coder mode stream output or return in bulk?
- How are long-running tests handled?
- What's the timeout strategy?
- How are errors from test execution reported?

#### 3. Mode Execution Architecture

Understand the execution pipeline:

- [ ] Is execution synchronous or asynchronous?
- [ ] How are long operations handled? (Progress indication? Streaming?)
- [ ] Error handling and propagation
- [ ] Retry mechanisms
- [ ] Context preparation before mode execution
- [ ] Resource constraints (memory, time)

#### 4. VS Code Extension Integration

Understand what we need to adapt for web:

- [ ] How does KiloCode use VS Code APIs?
- [ ] File system operations (read, write, delete, search)
- [ ] Terminal execution (how is it sandboxed?)
- [ ] Editor state management
- [ ] Webview/panel communication
- [ ] Extension activation and lifecycle

**Adaptation Challenge:** Most VS Code APIs won't exist in web. How do we replace them?

#### 5. Tool/Capability System

What "tools" or capabilities do modes have access to?

- [ ] File operations available to modes
- [ ] Git operations (commit, branch, diff, etc.)
- [ ] Command execution (npm, build scripts, etc.)
- [ ] Sandboxing strategy (if any)
- [ ] Permission system
- [ ] Error handling for tool failures

**Deliverable by End of Day 1:**

- [ ] **SPIKE_5_KILOCODE_ANALYSIS.md** (2-3 pages)
  - Mode system architecture overview
  - Coder mode detailed flow diagram
  - Key interfaces and data structures
  - Web adaptation challenges identified
  - Recommended patterns for LionPack

### Day 2: Prototype & Validation

#### 1. Build Minimal Proof-of-Concept

Create a working prototype demonstrating feasibility:

**Scope: Mode Router + Stub Coder Mode**

```typescript
// Prototype path: /packages/leo-client/src/spike-5-prototype/

1. mode-router.ts
   - Detect user intent (is it "code", "design", "fix", "review"?)
   - Route to appropriate mode
   - Handle errors gracefully

2. coder-mode.ts (Stub)
   - Accept coding task + file context
   - Call Claude API to generate code
   - Generate test file alongside code
   - Return structured result

3. verifier.ts (Basic)
   - Execute generated test file
   - Capture test output
   - Parse coverage metrics
   - Report pass/fail status

4. api/ai/mode.ts
   - POST /api/ai/mode/execute
   - Accept mode, task, context
   - Call appropriate mode
   - Return results
```

**Implementation Tasks:**

- [ ] Create TypeScript project structure
- [ ] Implement mode router with intent detection
- [ ] Create Coder mode stub (calls Claude, generates test)
- [ ] Implement basic test verifier
- [ ] Create API endpoint
- [ ] Write unit tests
- [ ] Document code flow

**Key Prototype Goals:**

- Demonstrate mode routing feasibility
- Show code generation + test generation works
- Validate test execution is possible
- Measure end-to-end latency (<5s ideal)
- Identify bottlenecks
- Validate coverage parsing

#### 2. Prototype Testing & Validation

```bash
# Test scenarios

# Scenario 1: Simple function
INPUT: "Create a function that sums an array"
EXPECTED:
  - Code: function sum(arr) { return arr.reduce(...) }
  - Test: test('sum([1,2,3]) === 6')
  - Verify: ✅ Tests pass, 100% coverage

# Scenario 2: Error handling
INPUT: "Validate email address with proper error handling"
EXPECTED:
  - Code: function validateEmail(email) { ... }
  - Test: test cases for valid/invalid emails
  - Verify: ✅ Tests pass

# Scenario 3: Complex logic
INPUT: "Implement binary search algorithm"
EXPECTED:
  - Code: function binarySearch(arr, target) { ... }
  - Test: comprehensive test suite
  - Verify: ✅ Tests pass, good coverage
```

**Measurements to Capture:**

- Time to generate code (seconds)
- Time to generate tests (seconds)
- Time to run tests (seconds)
- Total end-to-end time
- Coverage percentage achieved
- Success rate (% of generated code that passes tests)

#### 3. Performance Assessment

Measure key metrics:

- [ ] Time to first token (streaming response)
- [ ] Code generation latency (avg)
- [ ] Test generation latency (avg)
- [ ] Test execution latency (avg)
- [ ] Total request latency (avg)
- [ ] Memory usage during execution
- [ ] Concurrent request handling

**Performance Targets (for web):**

- Code generation: <3 seconds
- Test generation: <2 seconds
- Test execution: <5 seconds
- Total: <10 seconds acceptable, <5 seconds ideal
- Memory: <500MB per request

#### 4. Identify Challenges & Solutions

Document findings:

- [ ] What worked well from KiloCode approach?
- [ ] What challenges arose in web adaptation?
- [ ] What VS Code APIs are hardest to replace?
- [ ] What's the complexity level (High/Medium/Low)?
- [ ] What are the risks?
- [ ] What's the mitigation strategy?

**Deliverable by End of Day 2:**

- [ ] **Prototype Code** in `/packages/leo-client/src/spike-5-prototype/`
  - Compilable, runnable TypeScript
  - Unit tests demonstrating flow
  - Documented with clear comments

- [ ] **SPIKE_5_PROTOTYPE_REPORT.md** (2-3 pages)
  - What was built
  - How it works
  - Performance results
  - Challenges encountered
  - Solutions demonstrated
  - Lessons learned

- [ ] **SPIKE_5_GO_NO_GO_DECISION.md** (1-2 pages)
  - Can we adapt KiloCode patterns? → YES / NO
  - Confidence level: HIGH / MEDIUM / LOW
  - If YES: Recommended approach for full implementation
  - If NO: Alternative approach to investigate
  - Risk assessment and timeline impact
  - Next steps recommendation

---

## 📊 Key Questions to Answer

### Feasibility

1. **Can we implement multi-mode routing in Node.js/web?**
   - VS Code APIs available? NO → need replacements
   - Complexity level? Estimate effort
   - Success probability?

2. **Can we safely execute code and tests in cloud?**
   - Sandboxing strategy? (Worker threads? Containers?)
   - Security level acceptable?
   - Performance impact?

3. **Will verification work reliably?**
   - Coverage parsing reliable?
   - Test execution consistent?
   - Error handling robust?

4. **Is performance acceptable for web?**
   - Typical latency <5-10 seconds?
   - Streaming feasible?
   - Concurrent requests viable?

### Architecture

1. **What's the minimal mode interface?**
   - Reduce complexity and maintenance burden
   - Maximum code reuse

2. **How do we handle context in web?**
   - File access strategy
   - Project structure understanding
   - Git state awareness

3. **What tools do modes actually need?**
   - Essential vs nice-to-have
   - Priority for MVP

4. **How can we make modes async/streaming?**
   - User experience during long operations
   - Progress indication strategy

---

## 📁 Deliverables

### By End of Spike (Both Days)

#### 1. Architecture Analysis Document

**File:** `SPIKE_5_KILOCODE_ANALYSIS.md`

- KiloCode mode system overview
- Coder mode detailed flow (with sequence diagram)
- Key interfaces and data structures
- Web adaptation requirements
- Challenges and proposed solutions

#### 2. Working Prototype Code

**Location:** `/packages/leo-client/src/spike-5-prototype/`

- `mode-router.ts` - Intent detection and routing
- `coder-mode.ts` - Code + test generation
- `verifier.ts` - Test execution and coverage
- `api/ai/mode.ts` - API endpoint
- `__tests__/` - Unit tests
- `README.md` - How to run prototype

#### 3. Prototype Testing Report

**File:** `SPIKE_5_PROTOTYPE_REPORT.md`

- What was built and why
- Architecture decisions
- Test scenarios and results
- Performance measurements
- Challenges and solutions
- Success indicators

#### 4. Go/No-Go Decision

**File:** `SPIKE_5_GO_NO_GO_DECISION.md`

- Can we adapt KiloCode? (YES/NO with confidence)
- Justification with data
- Risk assessment
- Timeline impact if GO
- Recommendation for next phase
- Alternative strategies if NO GO

---

## 🔍 Research Resources

### Primary Resource

- **KiloCode Repository:** https://github.com/Kilo-Org/kilocode
  - 11.5k stars, 381 contributors, active project
  - Open source, MIT licensed
  - Well-documented

### Key Topics to Research

1. "Multi-mode agents" - architecture pattern
2. "Intent routing" - how to classify user intent
3. "Verification layer" - automated testing and validation
4. "Test generation" - automatically creating test cases
5. "Coverage metrics" - lcov format, parsing, thresholds

### Related Documentation

- ADR-001: Architecture Decision Record
- ARCHITECTURE.md: System design
- MULTI_MODE_AGENT_ARCHITECTURE.md: Implementation guide
- Issue #5: GitHub issue with acceptance criteria

---

## ✅ Success Criteria

**Spike is Complete when:**

1. ✅ **Architecture Analysis Complete**
   - [ ] Mode system understood
   - [ ] Coder mode flow documented
   - [ ] Web adaptation strategy clear
   - [ ] Risk assessment provided

2. ✅ **Prototype Demonstrates Feasibility**
   - [ ] Code compiles and runs without errors
   - [ ] Mode router detects intent correctly
   - [ ] Coder mode generates valid code
   - [ ] Tests are generated and execute successfully
   - [ ] Coverage is calculated and reported
   - [ ] Performance is acceptable (<10 seconds total)

3. ✅ **Go/No-Go Decision Made**
   - [ ] Clear YES or NO recommendation
   - [ ] Justified with evidence from prototype
   - [ ] Risk level clearly stated
   - [ ] Next steps articulated
   - [ ] Team alignment achieved

4. ✅ **Knowledge Transfer Ready**
   - [ ] Code is well-commented and documented
   - [ ] Architecture patterns captured
   - [ ] Decisions rationale documented
   - [ ] Ready for handoff to Stories 3.8-3.10

---

## 📅 Timeline

### Day 1 (2025-10-25)

**Duration:** ~6-8 hours

- **Morning (2 hrs):** Study KiloCode repo, understand mode architecture
- **Late Morning (2 hrs):** Deep-dive Coder mode implementation
- **Afternoon (2 hrs):** Understand VS Code integration and adaptation needs
- **Late Afternoon (1-2 hrs):** Document findings in SPIKE_5_KILOCODE_ANALYSIS.md

**EOD Deliverable:** SPIKE_5_KILOCODE_ANALYSIS.md ready for review

### Day 2 (2025-10-26)

**Duration:** ~6-8 hours

- **Morning (3-4 hrs):** Build prototype (mode router + Coder mode stub + verifier)
- **Late Morning (1 hr):** Create API endpoint
- **Afternoon (1-2 hrs):** Test prototype with scenarios, measure performance
- **Late Afternoon (1-2 hrs):** Document findings, make go/no-go decision

**EOD Deliverables:**

- SPIKE_5_PROTOTYPE_REPORT.md
- SPIKE_5_GO_NO_GO_DECISION.md
- Prototype code in spike-5-prototype/

---

## 🚀 What Happens Next

### If Spike Recommends "GO" ✅

1. All 15 GitHub issues become active
2. **Immediately Start:**
   - Story 3.8 (Mode Framework) - build on prototype patterns
   - Story 3.9 (AI Modes) - start next day in parallel
   - Story 3.10 (Verification) - integrate findings
3. **Timeline:** 4-5 weeks to Phase 1 completion
4. **Team:** All team members assigned to stories

### If Spike Recommends "NO GO" ❌

1. Analyze alternative approaches
2. Consider:
   - More significant adaptation effort
   - Different architecture altogether
   - Phased approach starting with simpler modes
3. Update timeline and estimate
4. Reassess feasibility before full commitment

---

## 📝 Investigation Notes

_Findings will be added as investigation progresses_

### Day 1 Notes

```markdown
[Add findings, insights, and surprises as they occur]

Time:
Observation:

Time:
Observation:
```

### Day 2 Notes

```markdown
[Prototype progress, performance data, challenges]

Time:
Progress:

Time:
Metrics:
```

---

## 🤝 Communication Plan

### Daily Standup (If Team)

- 9 AM: What's the plan for today?
- 5 PM: What was accomplished? Any blockers?

### EOD Day 1

- Share SPIKE_5_KILOCODE_ANALYSIS.md with team
- Quick discussion on approach confirmation

### EOD Day 2

- Present findings in SPIKE_5_PROTOTYPE_REPORT.md
- Review SPIKE_5_GO_NO_GO_DECISION.md
- Team decides: GO or NOT GO

### Decision Logging

- Record decision in GitHub issue #5
- Update epic #3 with spike results
- Notify team of next phase activation

---

## 🎯 Success Indicators

**By End of Spike, You'll Know:**

✅ Whether multi-mode architecture is viable for web
✅ What patterns work from KiloCode
✅ What needs to be adapted for cloud
✅ Confidence level for 80-day implementation
✅ What the top risks are
✅ Whether to proceed with full implementation

---

**Status:** 🟡 Ready to begin - Awaiting team assignment
**Next Step:** Assign to tech lead or senior developer, start Day 1 investigation
**Expected Completion:** End of 2025-10-26
**Critical Dependency:** Nothing (spike can start immediately)
