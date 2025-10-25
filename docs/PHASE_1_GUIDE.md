# 🚀 Phase 1: Backend Integration - Developer Guide

**Duration**: 2 weeks (Target: November 7, 2025)
**Objective**: Build the backend API foundation for LionPack Studio with LEO Kit integration

---

## 📋 Overview

Phase 1 focuses on:
1. Creating a REST API that wraps LEO Kit functionality
2. Setting up database schema (PostgreSQL via Supabase)
3. Implementing authentication (GitHub OAuth)
4. Testing core orchestration flow

**Deliverables**:
- Working REST API endpoints
- Database schema
- GitHub authentication
- Integration tests
- Documentation

---

## 🎯 Phase 1 Scope

### What's Included ✅

- LEO Kit wrapper (`packages/leo-client`)
- REST API routes for workflows and specifications
- Database setup and migrations
- GitHub OAuth authentication
- Docker Compose for local development
- Comprehensive tests

### What's NOT Included ❌

- Frontend UI (Phase 2)
- Real-time collaboration (Phase 3)
- Morphy AI chat (Phase 3)
- Performance optimization (Phase 4)

---

## 🏗️ Architecture for Phase 1

```
┌─────────────────────────────────────┐
│   Next.js Application               │
│  (apps/web/pages/api/*)             │
│                                     │
│  POST /api/workflows/create         │
│  GET  /api/workflows/[id]           │
│  POST /api/specs/generate           │
│  GET  /api/github/issues            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  packages/leo-client                │
│  (Orchestrator, WorkflowManager)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  leo-workflow-kit (npm package)     │
│  (Multi-agent orchestration)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  External Services                  │
│  - GitHub API                       │
│  - Anthropic API (Claude)           │
└─────────────────────────────────────┘

Local Storage:
  - PostgreSQL (via Supabase)
  - Redis (optional caching)
```

---

## 🛠️ Setup Instructions

### Prerequisites

```bash
# Check Node.js version (need 18+)
node --version
npm --version
git --version
```

### Automated Setup

```bash
# Run the Phase 1 initialization script
bash scripts/init-phase1.sh

# This will:
# 1. Check prerequisites
# 2. Create .env.local from template
# 3. Install dependencies
# 4. Set up packages/leo-client structure
```

### Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
cp .env.example .env.local

# 3. Edit with your credentials
nano .env.local

# Required variables:
# - LEO_GITHUB_TOKEN
# - LEO_ANTHROPIC_KEY

# 4. Start development
npm run dev

# 5. Test endpoints
curl -X POST http://localhost:3000/api/workflows/create \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Workflow", "description": "Testing"}'
```

---

## 📦 Key Files & Packages

### packages/leo-client (NEW IN PHASE 1)

The central integration layer between LionPack Studio and LEO Kit.

**Files to implement:**

```
packages/leo-client/
├── src/
│   ├── orchestrator.ts          ⭐ PRIORITY 1
│   │   └── Wraps LEO Kit Orchestrator
│   │       - analyzeRequest()
│   │       - createWorkflow()
│   │       - generateSpec()
│   │
│   ├── workflow-manager.ts      ⭐ PRIORITY 2
│   │   └── Workflow CRUD operations
│   │       - create()
│   │       - getById()
│   │       - updateStatus()
│   │       - assign()
│   │
│   ├── spec-generator.ts        ⭐ PRIORITY 2
│   │   └── Specification generation
│   │       - generate()
│   │       - refine()
│   │       - validate()
│   │
│   ├── github-client.ts         ⭐ PRIORITY 3
│   │   └── GitHub API integration
│   │       - createIssue()
│   │       - updateIssue()
│   │       - addComment()
│   │
│   └── types.ts                 ✅ DONE
│       └── Shared TypeScript types
│
└── tests/
    ├── orchestrator.test.ts
    ├── workflow-manager.test.ts
    ├── spec-generator.test.ts
    └── github-client.test.ts
```

### apps/web/pages/api (NEW IN PHASE 1)

REST API endpoints for frontend to call.

**Files to create:**

```
apps/web/pages/api/
├── workflows/
│   ├── create.ts                ⭐ PRIORITY 1
│   │   POST /api/workflows/create
│   │   - Receives: title, description, model
│   │   - Calls: leo-client.createWorkflow()
│   │   - Returns: workflow + issue URL
│   │
│   ├── [id].ts                  ⭐ PRIORITY 1
│   │   GET /api/workflows/[id]
│   │   - Returns: workflow details
│   │
│   └── list.ts                  PRIORITY 2
│       GET /api/workflows?status=...&pack_id=...
│
├── specs/
│   └── generate.ts              ⭐ PRIORITY 2
│       POST /api/specs/generate
│       - Receives: description, model
│       - Calls: leo-client.generateSpec()
│       - Returns: specification
│
├── github/
│   └── issues.ts                PRIORITY 3
│       GET /api/github/issues
│       - Returns: GitHub issues for project
│
└── health.ts                    ✅ DONE
    GET /api/health
    - Returns: API status
```

---

## 🗄️ Database Schema (Phase 1)

### PostgreSQL (via Supabase)

Create these tables in Phase 1:

```sql
-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Packs (Teams)
CREATE TABLE packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pack Members
CREATE TABLE pack_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES packs(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  role TEXT CHECK (role IN ('owner', 'architect', 'developer', 'reviewer', 'viewer')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pack_id, user_id)
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES packs(id),
  github_repo TEXT NOT NULL,
  github_org TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pack_id, github_org, github_repo)
);

-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  github_issue_id INT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'in-review', 'done', 'blocked')),
  assigned_to UUID REFERENCES profiles(id),
  assigned_role TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Specifications
CREATE TABLE specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id),
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria TEXT[],
  estimated_effort TEXT,
  suggested_architecture TEXT,
  model_used TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row-level security policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_members ENABLE ROW LEVEL SECURITY;
-- Add more policies for projects, workflows, etc.
```

---

## 🔌 Integration Flow (Phase 1)

### Example: User Creates Workflow

```
1. Frontend POST /api/workflows/create
   {
     "title": "Add OAuth login",
     "description": "Implement GitHub OAuth authentication",
     "model": "opus-4-5"
   }

2. Next.js API route calls leo-client.createWorkflow()

3. Orchestrator analyzes request:
   - Determines task type (backend)
   - Routes to appropriate agents (Backend Agent)
   - Generates specification
   - Creates GitHub issue

4. GitHub issue created with spec

5. Database saved:
   - workflows table: new entry
   - specifications table: spec details
   - Link to GitHub issue (#123)

6. Response sent to frontend:
   {
     "workflow_id": "uuid",
     "github_issue_url": "https://github.com/...",
     "agents": ["Backend Agent"],
     "estimated_effort": "1 week",
     "spec_generated": true
   }

7. Frontend displays to user in real-time
```

---

## ✅ Implementation Checklist

### Week 1

- [ ] `packages/leo-client/orchestrator.ts` complete
  - [ ] Implement Orchestrator class
  - [ ] Analyze request method
  - [ ] Create workflow method
  - [ ] Generate spec method
  - [ ] Unit tests (80%+ coverage)

- [ ] `apps/web/pages/api/workflows/create.ts`
  - [ ] Route implementation
  - [ ] Error handling
  - [ ] Validation
  - [ ] Tests

- [ ] `apps/web/pages/api/workflows/[id].ts`
  - [ ] Retrieve workflow
  - [ ] Tests

- [ ] Supabase setup
  - [ ] Create project
  - [ ] Configure authentication
  - [ ] Create database tables
  - [ ] Set up row-level security

- [ ] GitHub OAuth
  - [ ] Register OAuth app on GitHub
  - [ ] Configure Supabase auth
  - [ ] Test login flow

### Week 2

- [ ] `packages/leo-client/workflow-manager.ts` complete
  - [ ] All CRUD operations
  - [ ] Unit tests

- [ ] `packages/leo-client/spec-generator.ts` complete
  - [ ] Generate with multi-model support
  - [ ] Unit tests

- [ ] `apps/web/pages/api/specs/generate.ts`
  - [ ] Route implementation
  - [ ] Multi-model routing
  - [ ] Tests

- [ ] `packages/leo-client/github-client.ts` complete
  - [ ] Issue management
  - [ ] Project integration
  - [ ] Unit tests

- [ ] Docker setup
  - [ ] Docker Compose config
  - [ ] Test local development
  - [ ] Database initialization

- [ ] Documentation
  - [ ] API documentation (Swagger)
  - [ ] Postman collection
  - [ ] Development guide
  - [ ] Deployment guide

- [ ] Testing & Validation
  - [ ] All tests passing (>80% coverage)
  - [ ] End-to-end workflow test
  - [ ] GitHub issue creation verified
  - [ ] Multi-model switching works
  - [ ] Deployment to staging

---

## 🧪 Testing Strategy

### Unit Tests

Test each module in isolation:

```bash
# Test orchestrator
npm test -- packages/leo-client/orchestrator.test.ts

# Test workflow manager
npm test -- packages/leo-client/workflow-manager.test.ts

# All tests
npm test
```

### Integration Tests

Test API endpoints:

```bash
# Start dev server
npm run dev

# In another terminal, test endpoints
npm test -- apps/web/pages/api/__tests__
```

### End-to-End Testing

Test complete workflow:

```bash
# 1. Start application
npm run dev

# 2. Create workflow
curl -X POST http://localhost:3000/api/workflows/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Feature",
    "description": "Testing end-to-end",
    "model": "sonnet"
  }'

# 3. Verify:
# - GitHub issue created
# - Database entry saved
# - Spec generated
# - Response correct
```

---

## 📝 Development Notes

### Leo-client Dependencies

Phase 1 requires:

```json
{
  "dependencies": {
    "leo-workflow-kit": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

Install during Phase 1 setup:

```bash
npm install leo-workflow-kit@^5.0.0
npm install --save-dev @types/node typescript jest ts-jest
```

### Model Support

LEO Kit v5.0.0 supports:

- `sonnet` — Claude 3.5 Sonnet (balanced, default)
- `4` — Claude 4 (advanced reasoning)
- `4-5` — Claude 4.5 (maximum capabilities) ⭐ NEW
- `haiku` — Claude 3 Haiku (fast, lightweight) ⭐ NEW

All available via `Orchestrator.getAvailableModels()`

### Error Handling

Consistent error responses:

```typescript
// Success
{ success: true, data: {...}, timestamp: Date }

// Error
{
  success: false,
  error: {
    code: 'INVALID_REQUEST',
    message: 'Description is required'
  },
  timestamp: Date
}
```

---

## 🚀 Next Phase Handoff

### What Phase 2 Receives

✅ Working backend API
✅ Database schema
✅ GitHub integration
✅ LEO Kit orchestration
✅ Tests & documentation

### What Phase 2 Builds

📝 Next.js frontend UI
📝 Embedded OpenCode editor
📝 Authentication UI
📝 Project browser
📝 Connected to Phase 1 API

---

## 📞 Support

**Questions during Phase 1?**

1. Check documentation:
   - docs/ARCHITECTURE.md
   - docs/INTEGRATION.md
   - docs/QUICK_START.md

2. Review examples in git history:
   - Look at test files
   - Check commit messages

3. Reach out:
   - GitHub issue #61
   - Create discussion in repo

---

## 🎯 Success Criteria

Phase 1 is complete when:

✅ All API endpoints working
✅ Database schema created and tested
✅ GitHub OAuth functional
✅ LEO Kit orchestration working
✅ 80%+ test coverage
✅ Zero breaking bugs
✅ Documentation complete
✅ Can deploy to staging
✅ Team can start Phase 2

**Target Completion**: November 7, 2025

---

**Last Updated**: October 25, 2025
**Phase**: 1 of 5
**Status**: 🚀 Ready to Begin
