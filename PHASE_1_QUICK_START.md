# ⚡ Phase 1 Quick Start (5-Minute Setup)

**Target**: Get development environment running in 5 minutes

---

## 🚀 Start Here

```bash
# 1. Navigate to project
cd /Users/leo.de.souza1/lionpack-studio

# 2. Run automated setup (2 min)
bash scripts/init-phase1.sh

# 3. Configure environment (1 min)
cp .env.example .env.local
# Edit .env.local with your API keys:
# - LEO_GITHUB_TOKEN
# - LEO_ANTHROPIC_KEY

# 4. Install dependencies (2 min)
npm install

# 5. Start dev server
npm run dev

# 6. Test API
curl http://localhost:3000/api/health
# Response: { "status": "healthy", "timestamp": "2025-10-25T..." }
```

---

## 📋 Phase 1 Implementation Priority

### Priority 1 (Week 1) - CORE

```
packages/leo-client/src/orchestrator.ts
└─ Wraps LEO Kit, creates workflows, analyzes requests

apps/web/pages/api/workflows/create.ts
└─ REST endpoint to create workflows

apps/web/pages/api/workflows/[id].ts
└─ REST endpoint to fetch workflow details

Supabase Setup
└─ Database schema + GitHub OAuth
```

### Priority 2 (Week 1-2) - SPEC GENERATION

```
packages/leo-client/src/spec-generator.ts
└─ Generates specifications with multi-model support

apps/web/pages/api/specs/generate.ts
└─ REST endpoint for spec generation
```

### Priority 3 (Week 2) - GITHUB INTEGRATION

```
packages/leo-client/src/github-client.ts
└─ GitHub API integration (issues, PRs, comments)

packages/leo-client/src/workflow-manager.ts
└─ Workflow CRUD with database persistence
```

---

## 🔧 Development Workflow

**Daily Development:**

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Run tests
npm test -- --watch

# Terminal 3: Monitor git
git status
```

**Make Changes:**

```bash
# 1. Make code changes in leo-client or pages/api
# 2. Tests run automatically (watch mode)
# 3. Hot reload in dev server
# 4. Commit when tests pass

git add .
git commit -m "feat(phase1): implement orchestrator analyze method"
```

**Test Single File:**

```bash
npm test -- packages/leo-client/orchestrator.test.ts
npm test -- apps/web/pages/api/workflows/__tests__/create.test.ts
```

---

## 📚 Key Documentation

**Read in Order:**

1. **docs/FRAMEWORK.md** (5 min) — Understand LionPack vision
2. **docs/ARCHITECTURE.md** (10 min) — Learn system design
3. **docs/PHASE_1_GUIDE.md** (15 min) — Detailed Phase 1 spec
4. **docs/INTEGRATION.md** (10 min) — LEO Kit integration details

**For Reference:**

- `package.json` — Dependencies and workspace setup
- `.env.example` — All required environment variables
- `scripts/init-phase1.sh` — Setup script (automated)

---

## 🗄️ Database Setup

**One-time Supabase Setup:**

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Get connection string from Dashboard → Settings → Database
# 3. Add to .env.local:
#    DATABASE_URL=postgresql://...

# 4. Run migrations
npm run db:migrate

# 5. Seed sample data (optional)
npm run db:seed
```

**Connection String Format:**

```
postgresql://user:password@host:5432/postgres
```

---

## 🧪 Testing

**Run All Tests:**

```bash
npm test
```

**Run Specific Test:**

```bash
npm test -- orchestrator
```

**Watch Mode (development):**

```bash
npm test -- --watch
```

**Coverage Report:**

```bash
npm test -- --coverage
```

**Expected Target**: 80%+ coverage by end of Phase 1

---

## 🐛 Troubleshooting

### Issue: `npm install` fails

```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Issue: Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Issue: Database connection fails

```bash
# Verify DATABASE_URL in .env.local
cat .env.local | grep DATABASE_URL

# Test connection
npm run db:test
```

### Issue: Tests failing

```bash
# Check test output
npm test -- --verbose

# Rebuild TypeScript
npm run build

# Check leo-workflow-kit installed
npm list leo-workflow-kit
```

---

## 📊 API Endpoints (Phase 1)

### Health Check (Test)

```bash
GET http://localhost:3000/api/health
Response: { "status": "healthy" }
```

### Create Workflow ⭐

```bash
POST http://localhost:3000/api/workflows/create
Content-Type: application/json

{
  "title": "Add OAuth login",
  "description": "Implement GitHub OAuth",
  "model": "sonnet"
}

Response:
{
  "workflow_id": "uuid-here",
  "github_issue_url": "https://github.com/...",
  "status": "todo",
  "agents": ["Backend Agent"],
  "estimated_effort": "1 week"
}
```

### Get Workflow ⭐

```bash
GET http://localhost:3000/api/workflows/abc-123-def-456

Response:
{
  "id": "abc-123-def-456",
  "title": "Add OAuth login",
  "status": "todo",
  "github_issue_id": 42,
  "created_at": "2025-10-25T10:00:00Z",
  "assigned_to": null
}
```

### Generate Specification ⭐

```bash
POST http://localhost:3000/api/specs/generate
Content-Type: application/json

{
  "description": "Build product recommendation engine",
  "model": "opus-4-5"
}

Response:
{
  "spec_id": "uuid-here",
  "title": "Product Recommendation Engine",
  "acceptance_criteria": [...],
  "estimated_effort": "3 weeks",
  "suggested_architecture": "..."
}
```

---

## 🎯 Completion Checklist

**Before starting Phase 2, ensure:**

- [ ] `npm test` passes (80%+ coverage)
- [ ] All API endpoints working
- [ ] Database schema created
- [ ] GitHub OAuth functional
- [ ] Can create workflow → GitHub issue
- [ ] Can generate specification
- [ ] Docker Compose tested
- [ ] Documentation complete
- [ ] Zero blocking bugs

---

## 🔗 Quick Links

| Resource | Location |
|----------|----------|
| Full Phase 1 Guide | `docs/PHASE_1_GUIDE.md` |
| Architecture Details | `docs/ARCHITECTURE.md` |
| Integration Specs | `docs/INTEGRATION.md` |
| Development Roadmap | `docs/ROADMAP.md` |
| API Tests | `apps/web/pages/api/__tests__/` |
| Leo-client Tests | `packages/leo-client/tests/` |
| Environment Template | `.env.example` |

---

## 📞 Getting Help

1. **Check logs**: `npm run dev` shows errors clearly
2. **Review tests**: `*.test.ts` files show expected behavior
3. **Check git history**: Previous commits show patterns
4. **Read documentation**: `docs/` folder has guides for each topic
5. **Create issue**: GitHub issue #61 tracks Phase 1 progress

---

**Status**: 🚀 **Phase 1 Bootstrap Complete**
**Next**: Run `bash scripts/init-phase1.sh` and start development!

---

Last Updated: October 25, 2025
