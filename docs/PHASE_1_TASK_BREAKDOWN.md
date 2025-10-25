# 📋 Phase 1 Implementation Task Breakdown

**Phase**: 1 of 5
**Duration**: 2 weeks (October 28 - November 7, 2025)
**Status**: 🚀 Ready to Begin

---

## 🎯 Phase 1 Goals

1. ✅ Backend API fully functional
2. ✅ Database schema implemented
3. ✅ GitHub authentication working
4. ✅ LEO Kit orchestration integrated
5. ✅ 80%+ test coverage
6. ✅ Ready to hand off to Phase 2 (frontend)

---

## 📅 Weekly Breakdown

### Week 1: October 28 - November 3 (Core Implementation)

**Days 1-2 (Oct 28-29): Setup & Initial Implementation**

```
Task 1.1: Environment Setup
├─ Run init-phase1.sh
├─ Install dependencies
├─ Configure .env.local
├─ Verify npm run dev works
└─ Estimate time: 1 hour

Task 1.2: Implement Orchestrator.analyzeRequest()
├─ Read docs/FIRST_TASK_ORCHESTRATOR_ANALYZE.md
├─ Implement analyzeRequest method
├─ Implement helper methods
├─ Write unit tests (8+ test cases)
├─ Achieve 80%+ coverage
└─ Estimate time: 5-7 hours

Task 1.3: Implement Orchestrator.createWorkflow()
├─ Use analyzeRequest output
├─ Create workflow object
├─ Call WorkflowManager.create()
├─ Link to GitHub issue
├─ Write tests
└─ Estimate time: 4-5 hours
```

**Days 3-4 (Oct 30-31): Workflow & API**

```
Task 1.4: Implement WorkflowManager Methods
├─ WorkflowManager.create()
├─ WorkflowManager.getById()
├─ WorkflowManager.list()
├─ WorkflowManager.updateStatus()
├─ Tests for all methods
└─ Estimate time: 6-8 hours

Task 1.5: Create API Route /api/workflows/create
├─ POST handler
├─ Input validation
├─ Call leo-client.createWorkflow()
├─ Error handling
├─ Tests
└─ Estimate time: 3-4 hours
```

**Days 5 (Nov 1): Spec Generation & Database**

```
Task 1.6: Setup Supabase
├─ Create project
├─ Configure PostgreSQL connection
├─ Create database tables
├─ Set up RLS policies
└─ Estimate time: 3-4 hours

Task 1.7: Implement SpecGenerator.generate()
├─ Call LEO Kit for multi-model generation
├─ Parse response
├─ Store specification
├─ Return to caller
├─ Tests
└─ Estimate time: 4-5 hours

Task 1.8: Create API Route /api/specs/generate
├─ POST handler
├─ Input validation
├─ Call leo-client.generateSpec()
├─ Return formatted response
├─ Tests
└─ Estimate time: 2-3 hours
```

### Week 2: November 3-7 (GitHub Integration & Testing)

**Days 6-7 (Nov 3-4): GitHub Integration**

```
Task 2.1: Implement GitHubClient Methods
├─ GitHubClient.createIssue()
├─ GitHubClient.updateIssue()
├─ GitHubClient.addComment()
├─ GitHubClient.listIssues()
├─ Tests
└─ Estimate time: 5-6 hours

Task 2.2: Configure GitHub OAuth
├─ Register OAuth app
├─ Configure Supabase auth
├─ Test login flow
├─ Session management
└─ Estimate time: 3-4 hours

Task 2.3: Create Additional API Routes
├─ GET /api/workflows/[id]
├─ GET /api/workflows?status=...
├─ GET /api/github/issues
├─ Tests
└─ Estimate time: 3-4 hours
```

**Days 8-9 (Nov 5-6): Docker & Documentation**

```
Task 2.4: Setup Docker Compose
├─ Create docker-compose.yml
├─ PostgreSQL container
├─ Redis container (optional)
├─ Dev environment
├─ Test locally
└─ Estimate time: 2-3 hours

Task 2.5: Coverage & Testing
├─ Achieve 80%+ coverage
├─ Integration tests
├─ End-to-end tests
├─ Fix any issues
└─ Estimate time: 5-7 hours

Task 2.6: Documentation
├─ API documentation
├─ Postman collection
├─ Deployment guide
├─ Troubleshooting
└─ Estimate time: 3-4 hours
```

**Day 10 (Nov 7): Final Validation**

```
Task 2.7: Phase 1 Validation
├─ All tests passing
├─ API endpoints working
├─ Database operational
├─ GitHub OAuth functional
├─ Documentation complete
├─ Zero blocking bugs
└─ Estimate time: 2-3 hours
```

---

## 🔧 Detailed Task Specifications

### Task 1.1: Environment Setup

**What to do:**
1. Run `bash scripts/init-phase1.sh`
2. Verify all checks pass
3. Copy `.env.example` to `.env.local`
4. Add your API keys:
   - `LEO_GITHUB_TOKEN` — GitHub personal access token
   - `LEO_ANTHROPIC_KEY` — Anthropic API key
5. Run `npm install`
6. Start dev server: `npm run dev`
7. Test health endpoint: `curl http://localhost:3000/api/health`

**Definition of Done:**
- ✅ Dev server running on port 3000
- ✅ Can hit health endpoint
- ✅ No dependency errors
- ✅ TypeScript compiling

---

### Task 1.2: Implement Orchestrator.analyzeRequest()

**File**: `packages/leo-client/src/orchestrator.ts`

**Current stub**:
```typescript
async analyzeRequest(request: string): Promise<RoutingDecision> {
  throw new Error('Not implemented');
}
```

**Implementation guide**: See `docs/FIRST_TASK_ORCHESTRATOR_ANALYZE.md`

**Key requirements**:
- ✅ Validate input (not empty, not null)
- ✅ Call LEO Kit orchestrator.analyzeRequest()
- ✅ Map response to RoutingDecision interface
- ✅ Handle errors gracefully
- ✅ Determine complexity from effort estimate
- ✅ Suggest appropriate model

**Tests required** (minimum 8 test cases):
- Happy path: frontend request
- Happy path: backend request
- Happy path: multi-agent task
- Model selection: simple task
- Model selection: complex task
- Error: empty input
- Error: null input
- Error: LEO Kit API failure

**Definition of Done**:
- ✅ Implementation complete
- ✅ All tests passing
- ✅ 80%+ coverage
- ✅ Code reviewed
- ✅ Committed: `feat(orchestrator): implement analyzeRequest`

**Estimated Time**: 5-7 hours

---

### Task 1.3: Implement Orchestrator.createWorkflow()

**File**: `packages/leo-client/src/orchestrator.ts`

**Current stub**:
```typescript
async createWorkflow(request: WorkflowRequest): Promise<WorkflowResult> {
  throw new Error('Not implemented');
}
```

**Implementation logic**:
```
1. Analyze request using analyzeRequest()
2. Create workflow object {
     title, description, agents,
     status: 'todo', assigned_to: null
   }
3. Call WorkflowManager.create()
4. Call GitHubClient.createIssue()
5. Link workflow to GitHub issue
6. Return WorkflowResult
```

**Tests required**:
- Happy path: creates workflow + issue
- Happy path: multi-agent task
- Error: analyzeRequest fails
- Error: database fails
- Error: GitHub API fails
- Verify workflow saved to DB
- Verify GitHub issue created

**Definition of Done**:
- ✅ Implementation complete
- ✅ Tests passing
- ✅ 80%+ coverage
- ✅ GitHub issue creation verified
- ✅ Committed: `feat(orchestrator): implement createWorkflow`

**Estimated Time**: 4-5 hours

---

### Task 1.4: Implement WorkflowManager Methods

**File**: `packages/leo-client/src/workflow-manager.ts`

**Methods to implement**:

1. **create(workflow: Workflow): Promise<string>**
   - Insert into workflows table
   - Return workflow ID
   - Tests: success, duplicate, DB error

2. **getById(id: string): Promise<Workflow>**
   - Query workflows table
   - Return workflow or null
   - Tests: exists, not found, DB error

3. **list(filters?: WorkflowFilters): Promise<Workflow[]>**
   - Query with optional filters (status, pack_id, assigned_to)
   - Return workflow array
   - Tests: no filters, with filters, empty result

4. **updateStatus(id: string, status: string): Promise<void>**
   - Update workflow status
   - Update timestamps
   - Tests: success, not found, invalid status

5. **assign(id: string, userId: string, role: string): Promise<void>**
   - Assign workflow to user
   - Update assigned_to and assigned_role
   - Tests: success, user not found, workflow not found

6. **delete(id: string): Promise<void>**
   - Delete workflow (soft delete if needed)
   - Tests: success, not found

**Database operations**:
- Use Supabase client (or direct PostgreSQL)
- Handle RLS policies
- Error handling for all DB failures

**Tests required**: 15-20 test cases

**Definition of Done**:
- ✅ All 6 methods implemented
- ✅ All tests passing
- ✅ 85%+ coverage
- ✅ Database operations verified
- ✅ Committed: `feat(workflow-manager): implement all CRUD methods`

**Estimated Time**: 6-8 hours

---

### Task 1.5: Create API Route /api/workflows/create

**File**: `apps/web/pages/api/workflows/create.ts`

**Endpoint**: `POST /api/workflows/create`

**Request body**:
```json
{
  "title": "Add OAuth login",
  "description": "Implement GitHub OAuth authentication",
  "model": "sonnet"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "workflow_id": "uuid-here",
    "github_issue_url": "https://github.com/...",
    "status": "todo",
    "agents": ["Backend Agent"],
    "estimated_effort": "1 week"
  }
}
```

**Implementation**:
```typescript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Validate input
    const { title, description, model } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. Call leo-client
    const orchestrator = new Orchestrator(config);
    const result = await orchestrator.createWorkflow({
      title, description, model
    });

    // 3. Return response
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

**Tests required**:
- Success: creates workflow + returns data
- Error: missing title
- Error: missing description
- Error: orchestrator fails
- Error: database fails
- Security: unauthenticated user (add auth later)
- Validation: title/description too long

**Definition of Done**:
- ✅ Endpoint working
- ✅ Tests passing
- ✅ Error handling complete
- ✅ Validation working
- ✅ Committed: `feat(api): add POST /api/workflows/create`

**Estimated Time**: 3-4 hours

---

### Task 1.6: Setup Supabase

**What to do**:

1. **Create Supabase project**
   - Go to https://supabase.com
   - Create new project
   - Wait for database ready

2. **Get connection string**
   - Dashboard → Settings → Database
   - Copy connection string
   - Add to `.env.local` as `DATABASE_URL`

3. **Create database schema**
   - See `docs/PHASE_1_GUIDE.md` for full schema
   - Create tables: profiles, packs, pack_members, projects, workflows, specifications
   - Set up foreign keys and constraints

4. **Configure authentication**
   - Enable GitHub OAuth provider
   - Add OAuth credentials
   - Set up session management

5. **Set up Row-Level Security (RLS)**
   - Enable RLS on all tables
   - Create policies for data access
   - Test RLS enforcement

**SQL to run**:
```sql
-- See docs/PHASE_1_GUIDE.md for complete schema
CREATE TABLE profiles (...);
CREATE TABLE packs (...);
-- etc.
```

**Definition of Done**:
- ✅ All tables created
- ✅ Foreign keys working
- ✅ RLS enabled
- ✅ Can query from Node.js
- ✅ GitHub OAuth configured

**Estimated Time**: 3-4 hours

---

### Task 1.7: Implement SpecGenerator.generate()

**File**: `packages/leo-client/src/spec-generator.ts`

**Implementation**:
```typescript
async generate(
  description: string,
  model: 'sonnet' | '4' | '4-5' | 'haiku'
): Promise<Specification> {
  // 1. Validate input
  // 2. Call LEO Kit generateSpecification(description, model)
  // 3. Parse response
  // 4. Create Specification object
  // 5. Save to database (if needed)
  // 6. Return specification
}
```

**What LEO Kit returns**:
- title
- description
- acceptance_criteria (array)
- estimated_effort
- suggested_architecture
- implementation_notes

**Tests required**:
- Different models (sonnet, 4, 4-5, haiku)
- Error handling
- Response validation
- Database storage

**Definition of Done**:
- ✅ Implementation complete
- ✅ Tests passing
- ✅ 80%+ coverage
- ✅ Committed: `feat(spec-generator): implement generate method`

**Estimated Time**: 4-5 hours

---

### Task 1.8: Create API Route /api/specs/generate

**File**: `apps/web/pages/api/specs/generate.ts`

**Endpoint**: `POST /api/specs/generate`

**Request body**:
```json
{
  "description": "Build product recommendation engine",
  "model": "opus-4-5"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "spec_id": "uuid-here",
    "title": "Product Recommendation Engine",
    "acceptance_criteria": [...],
    "estimated_effort": "3 weeks",
    "suggested_architecture": "..."
  }
}
```

**Definition of Done**:
- ✅ Endpoint working
- ✅ Tests passing
- ✅ Error handling complete
- ✅ Committed: `feat(api): add POST /api/specs/generate`

**Estimated Time**: 2-3 hours

---

## 🧪 Testing Strategy

### Unit Tests (Per Module)

```bash
npm test -- packages/leo-client/orchestrator.test.ts
npm test -- packages/leo-client/workflow-manager.test.ts
npm test -- packages/leo-client/spec-generator.test.ts
npm test -- packages/leo-client/github-client.test.ts
```

### Integration Tests (API Routes)

```bash
npm test -- apps/web/pages/api/__tests__/workflows.test.ts
npm test -- apps/web/pages/api/__tests__/specs.test.ts
```

### End-to-End Testing

```bash
# 1. Start dev server
npm run dev

# 2. Run E2E tests
npm test -- e2e/workflows.e2e.ts
```

### Coverage Target

- **Phase 1 Target**: 80%+ coverage
- **Unit tests**: 85%+
- **Integration tests**: 75%+
- **Critical paths**: 90%+

---

## ✅ Phase 1 Definition of Done

Phase 1 is **COMPLETE** when:

- ✅ `packages/leo-client/` fully implemented
  - Orchestrator (all methods)
  - WorkflowManager (all methods)
  - SpecGenerator (all methods)
  - GitHubClient (all methods)

- ✅ API endpoints working
  - POST /api/workflows/create
  - GET /api/workflows/[id]
  - GET /api/workflows?status=...
  - POST /api/specs/generate
  - GET /api/github/issues

- ✅ Database operational
  - Supabase configured
  - Schema created
  - RLS policies enabled
  - Can query from API

- ✅ Authentication working
  - GitHub OAuth configured
  - Session management
  - Protected routes

- ✅ Quality gates met
  - 80%+ test coverage
  - All tests passing
  - Zero blocking bugs
  - Code reviewed

- ✅ Documentation complete
  - API documentation
  - Postman collection
  - Deployment guide
  - README updates

- ✅ Ready for Phase 2
  - All APIs documented
  - Database stable
  - Can start frontend
  - CI/CD prepared

---

## 🚀 Daily Standup Template

Use this for daily progress tracking:

```markdown
## Daily Standup - [Date]

### Today's Focus
- Task 1.2: Orchestrator.analyzeRequest()

### Completed
- ✅ Method implementation (2/3)
- ✅ Unit tests (5/8)

### In Progress
- 🔄 Remaining unit tests
- 🔄 Code review

### Blockers
- None

### Tomorrow
- Complete remaining tests
- Get code review
- Move to Task 1.3

### Time Spent
- 4 hours
```

---

## 📞 Getting Help

**If you get stuck:**

1. **Check documentation**:
   - `docs/FIRST_TASK_ORCHESTRATOR_ANALYZE.md`
   - `docs/PHASE_1_GUIDE.md`
   - `docs/ARCHITECTURE.md`

2. **Review test files**:
   - `*.test.ts` files show expected behavior
   - Copy patterns from existing tests

3. **Check git history**:
   - See how previous features were implemented

4. **Create GitHub issue**:
   - Link to #61
   - Describe blocker clearly
   - Ask for help

---

## 📊 Progress Tracking

**Week 1 Target**: Tasks 1.1 → 1.8 (80% complete)
**Week 2 Target**: Tasks 2.1 → 2.7 (100% complete)

Track progress here:
- [ ] Task 1.1: Environment Setup (Estimated 1 hour)
- [ ] Task 1.2: Orchestrator.analyzeRequest() (Estimated 5-7 hours)
- [ ] Task 1.3: Orchestrator.createWorkflow() (Estimated 4-5 hours)
- [ ] Task 1.4: WorkflowManager Methods (Estimated 6-8 hours)
- [ ] Task 1.5: API /workflows/create (Estimated 3-4 hours)
- [ ] Task 1.6: Supabase Setup (Estimated 3-4 hours)
- [ ] Task 1.7: SpecGenerator.generate() (Estimated 4-5 hours)
- [ ] Task 1.8: API /specs/generate (Estimated 2-3 hours)
- [ ] Task 2.1: GitHubClient (Estimated 5-6 hours)
- [ ] Task 2.2: GitHub OAuth (Estimated 3-4 hours)
- [ ] Task 2.3: Additional API Routes (Estimated 3-4 hours)
- [ ] Task 2.4: Docker Compose (Estimated 2-3 hours)
- [ ] Task 2.5: Testing & Coverage (Estimated 5-7 hours)
- [ ] Task 2.6: Documentation (Estimated 3-4 hours)
- [ ] Task 2.7: Final Validation (Estimated 2-3 hours)

**Total estimated time**: 56-75 hours (distributed across 2 weeks)

---

**Status**: 🚀 Ready to Start
**Due**: November 7, 2025
**Next Step**: Start Task 1.1 (Environment Setup)

---

Last Updated: October 25, 2025
