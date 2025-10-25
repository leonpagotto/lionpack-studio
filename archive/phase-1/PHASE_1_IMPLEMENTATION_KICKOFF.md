# LionPack Studio – Phase 1 Implementation Kickoff Guide

> **Status:** ✅ Ready for Immediate Implementation
> **Date:** 2025-10-25
> **Phase:** Hybrid Multi-Mode Agent IDE (4-5 weeks)
> **Team:** 1 Tech Lead + 2 Senior Developers
> **Estimated Effort:** 45-54 working days

---

## 📋 WHAT'S NEW: Hybrid Multi-Mode Agent IDE

This implementation has evolved from the original plan to include:

✨ **Multi-Mode AI Agent System:**

- 🏗️ Architect Mode (Design & Planning)
- 💻 Coder Mode (Implementation + AUTO verification)
- 🐛 Debugger Mode (Bug fixing + AUTO verification)
- ✅ Reviewer Mode (Quality gate with AUTO verification)

🛠️ **MCP-Inspired Tool System:**

- Tool Registry & Discovery (Story 3.5.1)
- Sandboxed Execution (Story 3.5.2)
- File Operations (Story 3.5.3)
- Terminal & Git Tools (Story 3.5.4)
- LEO Kit Integration (Story 3.5.5)

💬 **Enhanced Chat Sidebar:**

- Mode Selector UI (Story 3.6.1)
- File Context Injection (Story 3.6.2)
- Streaming Responses with Verification (Story 3.6.3)
- Chat History & Search (Story 3.6.4)

**See ADR-001 for architecture decision rationale.**

---

## 🚀 KICKOFF CHECKLIST

### Pre-Implementation (Today)

- [ ] All team members read START_HERE.md
- [ ] Backend lead reviews PHASE_1_ARCHITECTURE.md
- [ ] Frontend lead reviews PHASE_1_ARCHITECTURE.md (Frontend section)
- [ ] DevOps lead reviews Docker/deployment sections
- [ ] Tech lead reviews PHASE_1_API_CONTRACT.md
- [ ] Tech lead reviews AI_ORCHESTRATOR_SPECIFICATION.md
- [ ] Schedule 30-min kickoff meeting

### At Kickoff Meeting

- [ ] Review Phase 1 timeline & milestones
- [ ] Assign issues to team members
- [ ] Confirm development environment setup
- [ ] Establish daily standup time (15 min)
- [ ] Confirm Git workflow & branch naming
- [ ] Setup GitHub Project Board
- [ ] Confirm deployment strategy

### After Kickoff

- [ ] Create feature branches
- [ ] Setup local development environment
- [ ] Verify database/services running
- [ ] First commit pushed
- [ ] Daily standups begin

---

## 📋 PHASE 1 WORK BREAKDOWN

### Week 1: Foundation (Epics 1-2)

**Epic 1: OpenCode Integration** (3-5 days)

```
Story 1.1: Setup monorepo structure
Story 1.2: Integrate Monaco editor
Story 1.3: Setup file operations layer
Story 1.4: Implement basic UI layout
Story 1.5: Connect to backend API
```

**Epic 2: LEO Backend Integration** (2-3 days)

```
Story 2.1: Create API gateway layer
Story 2.2: Integrate LEO Kit REST API
Story 2.3: Create workflow automation endpoints
Story 2.4: Setup GitHub integration
Story 2.5: Create issue/project sync layer
```

**Deliverables:**

- Working monorepo with build system
- Basic IDE interface loading
- Backend API responding to health checks
- GitHub authentication working
- All tests passing

---

### Week 2: Core Features (Epics 3-5)

**Epic 3: AI Orchestrator** (3-4 days)

```
Story 3.1: Setup OpenAI integration
Story 3.2: Setup Anthropic integration
Story 3.3: Setup Google Gemini integration
Story 3.4: Implement model selection algorithm
Story 3.5: Implement provider fallback
Story 3.6: Implement streaming responses
Story 3.7: Implement cost tracking
```

**Epic 4: Authentication** (1-2 days)

```
Story 4.1: GitHub OAuth setup
Story 4.2: JWT token generation
Story 4.3: Token refresh logic
Story 4.4: Session management
```

**Epic 5: File Operations** (2-3 days)

```
Story 5.1: File read/write endpoints
Story 5.2: Directory listing
Story 5.3: Git integration
Story 5.4: File watching/sync
```

**Deliverables:**

- AI chat working with multiple models
- User can authenticate via GitHub
- File operations fully functional
- All tests passing
- Cost tracking working

---

### Week 3: Polish & Integration (Epics 6-8)

**Epic 6: Terminal Integration** (1-2 days)

```
Story 6.1: Terminal UI component
Story 6.2: Command execution
Story 6.3: Output streaming
Story 6.4: Error handling
```

**Epic 7: Chat Sidebar** (2-3 days)

```
Story 7.1: Chat UI component
Story 7.2: Message history
Story 7.3: Context awareness
Story 7.4: Code reference
```

**Epic 8: Pack Collaboration** (1-2 days)

```
Story 8.1: Realtime presence
Story 8.2: Cursor tracking
Story 8.3: Collaborative editing
Story 8.4: Role management
```

**Deliverables:**

- Terminal working end-to-end
- Chat sidebar integrated with AI
- Realtime collaboration working (solo + pair mode)
- All features demo-ready
- Documentation complete

---

## 🛠️ DEVELOPMENT SETUP

### 1. Clone & Install

```bash
cd /path/to/lionpack-studio
npm install
npm run setup
```

### 2. Environment Variables

Create `.env.local` (copy from `.env.example`):

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# AI Provider Keys (add your own)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lionpack

# Backend
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:3000

# AI Settings
AI_MONTHLY_BUDGET=50.00
AI_AUTO_FALLBACK=true
```

### 3. Start Services

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend

# Terminal 3: Database (if needed)
npm run db:start
```

### 4. Verify Setup

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend
open http://localhost:3000

# Check database connection
npm run db:test

# Run tests
npm test
```

---

## 📦 TECHNOLOGY STACK

### Frontend

- **Framework:** React 19
- **Build Tool:** Vite
- **Editor:** Monaco Editor
- **State Management:** Zustand
- **UI Library:** Tailwind CSS
- **Animation:** Framer Motion
- **Testing:** Vitest + React Testing Library

### Backend

- **Runtime:** Node.js 24
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 16
- **ORM:** Prisma
- **API:** REST + WebSockets
- **Auth:** JWT + GitHub OAuth
- **Testing:** Jest + Supertest

### DevOps

- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Deployment:** Railway / Render (Phase 2)

### AI Integration

- **OpenAI:** GPT-4, GPT-3.5
- **Anthropic:** Claude 3 (Opus, Sonnet, Haiku)
- **Google Gemini:** Gemini 1.5 Pro/Flash

---

## 📊 GIT WORKFLOW

### Branch Naming

```
Epic/Feature Branch:    feat/epic-1-opencode-integration
Story/Task Branch:      feat/epic-1-story-1-monorepo-setup
Bug Fix:               fix/issue-42-auth-bug
Docs:                  docs/api-documentation
```

### Commit Message Format

```
type(scope): brief description (under 72 chars) (#issue-number)

Optional detailed body explaining the change.
Can include:
- What changed
- Why it changed
- Impact of change
```

**Examples:**

```
feat(auth): implement GitHub OAuth login (#12)
fix(editor): resolve Monaco editor resize bug (#23)
test(ai): add orchestrator unit tests (#34)
docs(api): update API contract documentation (#45)
refactor(backend): optimize database queries (#56)
```

### Pull Request Process

1. **Create branch from `main`**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/epic-1-story-1-...
   ```

2. **Make changes & commit**

   ```bash
   git add .
   git commit -m "feat(editor): add Monaco integration (#10)"
   git push origin feat/epic-1-story-1-...
   ```

3. **Create PR on GitHub**
   - Reference issue: "Closes #10"
   - Add description
   - Request review from tech lead
   - Ensure CI passes

4. **Review & Approve**
   - Tech lead reviews code
   - Request changes if needed
   - Approve once satisfactory

5. **Merge & Deploy**
   ```bash
   # Squash if many commits, otherwise rebase
   git merge --squash feat/epic-1-story-1-...
   git push origin main
   ```

---

## 🧪 TESTING REQUIREMENTS

### Coverage Targets

- **Overall:** ≥80% coverage
- **Unit Tests:** ≥85% coverage for business logic
- **Integration Tests:** ≥70% coverage
- **Critical Paths:** 100% coverage

### Test Files

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── ai-orchestrator.test.ts
│   │   ├── auth.test.ts
│   │   ├── file-operations.test.ts
│   │   └── terminal.test.ts
│   ├── integration/
│   │   ├── api.test.ts
│   │   ├── auth-flow.test.ts
│   │   └── ai-providers.test.ts
│   └── e2e/
│       ├── user-workflow.test.ts
│       └── collaboration.test.ts
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.ts

# Watch mode
npm test -- --watch

# Debug mode
node --inspect-brk ./node_modules/.bin/jest
```

---

## 📅 DAILY WORKFLOW

### Morning Standup (15 min)

```
Each person answers:
1. What did I accomplish yesterday?
2. What am I working on today?
3. What blockers do I have?

Then: Assign blockers to tech lead / pair programming
```

### During Day

```
1. Work on assigned story/task
2. Write tests as you code
3. Commit regularly with clear messages
4. Update GitHub issue status
5. Ask for help if blocked > 30 min
```

### End of Day

```
1. Push changes to branch
2. Update GitHub issue progress
3. Note any blockers for next day
4. Celebrate wins! 🎉
```

---

## 🔗 KEY LINKS & RESOURCES

### Documentation

- **Specs:** https://github.com/leonpagotto/lionpack-studio/tree/main/docs/specs
- **Architecture:** docs/specs/PHASE_1_ARCHITECTURE.md
- **API Contract:** docs/specs/PHASE_1_API_CONTRACT.md
- **AI Orchestrator:** docs/specs/AI_ORCHESTRATOR_SPECIFICATION.md

### External Resources

- **OpenAI Docs:** https://platform.openai.com/docs
- **Anthropic Docs:** https://docs.anthropic.com
- **Gemini Docs:** https://ai.google.dev
- **Monaco Editor:** https://microsoft.github.io/monaco-editor
- **Express.js:** https://expressjs.com
- **Prisma:** https://www.prisma.io/docs

### Team Communication

- **Slack Channel:** #lionpack-development
- **GitHub Discussions:** https://github.com/leonpagotto/lionpack-studio/discussions
- **Tech Lead:** @leo (DM for blockers)

---

## ⚠️ COMMON ISSUES & SOLUTIONS

### Issue: Database Connection Failed

```
Solution:
1. Check DATABASE_URL in .env.local
2. Verify PostgreSQL is running
3. Run: npm run db:migrate
4. Try: npm run db:seed (for test data)
```

### Issue: AI Provider Key Invalid

```
Solution:
1. Verify API key in .env.local
2. Check provider's console for key validity
3. Regenerate key if expired
4. Remove key, app will gracefully degrade
```

### Issue: Monaco Editor Not Loading

```
Solution:
1. Check browser console for errors
2. Verify Vite is running
3. Hard refresh browser (Cmd+Shift+R)
4. Clear browser cache
```

### Issue: GitHub OAuth Not Working

```
Solution:
1. Check GITHUB_CLIENT_ID / SECRET in .env.local
2. Verify OAuth app exists on GitHub
3. Check redirect URI matches GitHub app settings
4. Verify scopes include 'repo' and 'read:org'
```

---

## 🎯 SUCCESS CRITERIA

### By End of Week 1

- [ ] Monorepo structure complete
- [ ] Monaco editor integrated
- [ ] Backend API responding
- [ ] GitHub auth working
- [ ] CI/CD pipeline passing

### By End of Week 2

- [ ] All 3 AI providers integrated
- [ ] Chat working end-to-end
- [ ] File operations complete
- [ ] Cost tracking working
- [ ] 80%+ test coverage

### By End of Week 3

- [ ] Terminal working
- [ ] Chat sidebar integrated
- [ ] Collaboration features demo-ready
- [ ] All features tested
- [ ] Documentation complete
- [ ] Ready for Phase 2

---

## 🚀 AFTER PHASE 1

### Phase 2 Focus

- Real-time collaboration (Yjs)
- Advanced AI features (vision, multimodal)
- Performance optimization
- Deployment to production

### Phase 3 Focus

- Pack management UI
- Advanced templates
- Custom workflows
- Marketplace/extensions

---

## 📞 SUPPORT & ESCALATION

### Blockers

- **Blocked < 30 min?** Try Slack or pair programming
- **Blocked > 30 min?** Escalate to tech lead
- **Need architecture help?** Schedule sync with Leo

### Questions

- **Technical?** Comment on GitHub issue
- **Process?** Check SPEC_APPROVAL_WORKFLOW.md
- **General?** Ask in Slack channel

---

## ✨ FINAL REMINDERS

- ✅ **Read specs first** – Don't skip this, specs have the details
- ✅ **Test as you code** – Don't leave testing to the end
- ✅ **Commit often** – Small commits are easier to review
- ✅ **Ask for help early** – Don't struggle alone
- ✅ **Celebrate wins** – Acknowledge team progress
- ✅ **Keep it fun** – We're building something awesome!

---

**Let's build LionPack Studio! 🦁**

Starting Phase 1 Implementation: 2025-10-25
Estimated Completion: 2025-11-15 (3 weeks)

---

**Version:** 1.0
**Status:** Ready for Implementation
**Last Updated:** 2025-10-25
