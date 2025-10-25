# LionPack Studio – Phase 1 Implementation Roadmap

> **Status:** Draft
> **Priority:** P0 – Foundation
> **Created:** 2025-10-25
> **Author:** Leo / LionPack Team
> **Related:** PHASE_1_ARCHITECTURE.md, PHASE_1_API_CONTRACT.md

---

## 🎯 Phase 1 Goal

Build a functional, single-user web-based IDE with Monaco editor, file operations, terminal integration, and GitHub authentication. **No real-time collaboration yet.**

---

## 📊 Work Breakdown Structure

### Epic 1: Infrastructure & Setup (Week 1)

| Task                        | Subtasks                                                                                                     | Owner | Duration | Status |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ | ----- | -------- | ------ |
| **Repository Setup**        | • Create monorepo structure<br>• Configure Turbo build system<br>• Setup shared types package                |       | 1d       | ⏳     |
| **Environment & Dev Setup** | • Create .env templates<br>• Configure Docker Compose<br>• Setup pre-commit hooks                            |       | 1d       | ⏳     |
| **CI/CD Pipeline**          | • GitHub Actions: lint, test, build<br>• Deploy workflow (staging/prod)<br>• Docker build & push to registry |       | 2d       | ⏳     |

### Epic 2: Authentication (Week 1-2)

| Task                     | Subtasks                                                                                                                                      | Owner | Duration | Status |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ----- | -------- | ------ |
| **Supabase Setup**       | • Create project<br>• Configure GitHub OAuth<br>• Setup redirect URLs<br>• Enable Auth extension                                              |       | 1d       | ⏳     |
| **Backend Auth Service** | • Create `/auth/github` endpoint<br>• Implement OAuth callback handler<br>• JWT token generation<br>• Session middleware<br>• Logout endpoint |       | 2d       | ⏳     |
| **Frontend Auth UI**     | • Login page component<br>• GitHub OAuth flow integration<br>• Session persistence<br>• Protected route wrapper<br>• Logout button            |       | 2d       | ⏳     |
| **Testing**              | • Unit tests for JWT handling<br>• Integration tests for OAuth flow<br>• E2E test: login → editor                                             |       | 1d       | ⏳     |

### Epic 3: File Operations (Week 2-3)

| Task                     | Subtasks                                                                                                                                                                                                | Owner | Duration | Status |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | -------- | ------ |
| **Backend File API**     | • GET `/api/files/*` (read)<br>• POST `/api/files/*` (write)<br>• DELETE `/api/files/*`<br>• POST `/api/files/mkdir`<br>• POST `/api/files/sync` (clone from GitHub)<br>• Implement .gitignore handling |       | 3d       | ⏳     |
| **Frontend File Tree**   | • File tree component (React)<br>• Expand/collapse directories<br>• File icons by language<br>• Context menu (new file, delete)<br>• Keyboard shortcuts                                                 |       | 2d       | ⏳     |
| **Frontend File Editor** | • Integrate Monaco Editor<br>• Open/close file tabs<br>• Syntax highlighting per language<br>• Unsaved changes indicator<br>• Auto-save toggle<br>• Keyboard shortcuts (Cmd+S, etc.)                    |       | 2d       | ⏳     |
| **Git Integration**      | • Commit changes (POST endpoint)<br>• Show git status<br>• Author/message from UI<br>• Push to GitHub on save (option)<br>• Handle merge conflicts                                                      |       | 2d       | ⏳     |
| **Testing**              | • Unit tests for file API<br>• Mock Git operations<br>• E2E: read → edit → save → commit → push                                                                                                         |       | 1d       | ⏳     |

### Epic 4: Terminal Integration (Week 3)

| Task                         | Subtasks                                                                                                                                                                        | Owner | Duration | Status |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | -------- | ------ |
| **Backend Terminal Service** | • WebSocket server setup<br>• Command execution sandbox<br>• Output streaming (stdout/stderr)<br>• Session management<br>• Timeout & kill handling<br>• Command history storage |       | 3d       | ⏳     |
| **Frontend Terminal UI**     | • Terminal component (xterm.js or similar)<br>• Input handling<br>• Copy/paste support<br>• Resize handling<br>• Clear terminal command<br>• History navigation (arrow keys)    |       | 2d       | ⏳     |
| **Container Runtime**        | • Docker image for Node/Python/Rust runtimes<br>• Volume mount for project files<br>• Resource limits (CPU, memory)<br>• Security constraints (no root)                         |       | 2d       | ⏳     |
| **Testing**                  | • Unit tests for command execution<br>• Integration tests for WebSocket<br>• E2E: run npm install → see output                                                                  |       | 1d       | ⏳     |

### Epic 5: UI Layout & Components (Week 2-3)

| Task                   | Subtasks                                                                                                                                                                                   | Owner | Duration | Status |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | -------- | ------ |
| **Main Layout**        | • Resizable panel layout<br>• Left sidebar (file tree)<br>• Center area (editor)<br>• Bottom panel (terminal)<br>• Right sidebar (LEO placeholder)<br>• Responsive on mobile (hide panels) |       | 2d       | ⏳     |
| **Navigation**         | • Top bar (logo, user menu, project selector)<br>• Breadcrumb (current file path)<br>• Status bar (git status, file info)<br>• Theme toggle (dark/light)                                   |       | 1d       | ⏳     |
| **Components Library** | • Button, Input, Select, Checkbox<br>• Modal/Dialog<br>• Dropdown menu<br>• Tabs<br>• Toast/Snackbar notifications                                                                         |       | 1d       | ⏳     |
| **Styling**            | • Tailwind setup & customization<br>• Color scheme (lion theme)<br>• Typography scale<br>• Spacing system<br>• Dark mode support                                                           |       | 1.5d     | ⏳     |

### Epic 6: LEO Kit Integration (Week 3)

| Task                             | Subtasks                                                                                                                                         | Owner | Duration | Status |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | -------- | ------ |
| **LEO Service Setup**            | • Docker container for LEO Kit<br>• Environment variables<br>• API port (3002)<br>• Health checks                                                |       | 1d       | ⏳     |
| **Backend Proxy Layer**          | • GET `/api/leo/health`<br>• GET `/api/leo/issues`<br>• POST `/api/leo/specs`<br>• Error handling & retries<br>• Circuit breaker for LEO service |       | 2d       | ⏳     |
| **Frontend Sidebar Placeholder** | • LEO Sidebar component<br>• "Chat coming soon" message<br>• Link to docs/specs<br>• Health indicator                                            |       | 1d       | ⏳     |
| **Testing**                      | • Mock LEO responses<br>• Test proxy endpoints<br>• E2E: GET issues from GitHub                                                                  |       | 1d       | ⏳     |

### Epic 7: Error Handling & Observability (Week 3)

| Task                     | Subtasks                                                                                                                                   | Owner | Duration | Status |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ----- | -------- | ------ |
| **Error Handling**       | • HTTP error responses (standard format)<br>• Client error boundaries<br>• Toast notifications for errors<br>• Retry logic with backoff    |       | 1.5d     | ⏳     |
| **Logging & Monitoring** | • Structured logging (Winston/Pino)<br>• Request/response logging<br>• Error tracking (Sentry setup)<br>• Performance monitoring (metrics) |       | 1d       | ⏳     |
| **Documentation**        | • API error codes documented<br>• Troubleshooting guide<br>• Dev setup guide                                                               |       | 1d       | ⏳     |

### Epic 8: Testing & QA (Week 3)

| Task                  | Subtasks                                                                                            | Owner | Duration | Status |
| --------------------- | --------------------------------------------------------------------------------------------------- | ----- | -------- | ------ |
| **Unit Tests**        | • Auth service tests<br>• File service tests<br>• Terminal service tests<br>• Target: >80% coverage |       | 2d       | ⏳     |
| **Integration Tests** | • OAuth flow<br>• File read/write → Git commit<br>• Terminal command execution<br>• LEO proxy calls |       | 2d       | ⏳     |
| **E2E Tests**         | • Full user journey: login → clone repo → edit → commit → push<br>• Error scenarios                 |       | 2d       | ⏳     |
| **Manual QA**         | • Cross-browser testing<br>• Cross-platform testing (Mac/Linux/Windows)<br>• Performance profiling  |       | 2d       | ⏳     |

---

## 📅 Timeline

```
Week 1: Infrastructure + Auth
  Mon-Tue: Repo setup, env config, CI/CD
  Wed-Fri: Supabase setup, OAuth backend, OAuth frontend

Week 2: File Operations
  Mon-Tue: Backend file API, Git integration
  Wed-Fri: Frontend file tree, Monaco editor, UI layout

Week 3: Terminal + Polish
  Mon-Tue: Backend terminal, frontend terminal, container runtime
  Wed-Fri: LEO integration, error handling, testing & QA
```

**Estimated Total:** 3 weeks (60–80 hours)

---

## 👥 Team Roles (Recommended)

| Role              | Responsibilities                                     |
| ----------------- | ---------------------------------------------------- |
| **Backend Lead**  | Auth service, file API, terminal service, LEO proxy  |
| **Frontend Lead** | UI layout, file tree, editor, terminal UI, auth flow |
| **DevOps/Infra**  | Docker setup, CI/CD, Supabase config, monitoring     |
| **QA**            | Test automation, manual testing, documentation       |

_Note: Solo dev can tackle all, but should prioritize MVP features first._

---

## 📋 Feature Priority (MoSCoW)

### MUST HAVE (MVP)

- [ ] GitHub OAuth login
- [ ] File tree & Monaco editor
- [ ] Read/write files to disk
- [ ] Git commit & push
- [ ] Terminal for running commands
- [ ] Responsive UI layout

### SHOULD HAVE (Phase 1 Nice-to-Have)

- [ ] Auto-save to Git
- [ ] File history/undo
- [ ] Command palette (⌘+K)
- [ ] LEO health check
- [ ] Error logging to Sentry

### COULD HAVE (Future)

- [ ] Syntax error highlighting
- [ ] File search/replace
- [ ] Multi-project support
- [ ] Settings/preferences UI

### WON'T HAVE (Phase 1)

- Real-time collaboration
- AI chat
- Inline code suggestions
- Deployment automation

---

## 🚀 Definition of Done (Per Task)

- [ ] Code written & peer-reviewed
- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] No console errors/warnings
- [ ] Documentation updated
- [ ] Deployed to staging & tested
- [ ] Performance metrics met
- [ ] Accessibility (WCAG AA) checked

---

## 🔄 Dependency Graph

```
Infrastructure & Setup
    ↓
Supabase + Auth (parallel with Infra)
    ↓
├─ Backend File API ← Auth
│   ├─ Frontend File Tree ← File API
│   ├─ Frontend Editor ← File API
│   └─ Git Integration ← File API
│
├─ Backend Terminal ← Auth
│   └─ Frontend Terminal ← Terminal API
│
├─ LEO Service Setup
│   └─ Backend Proxy Layer ← LEO Service
│       └─ Frontend Sidebar ← Proxy API
│
└─ UI Layout (starts early, iterates with features)

Testing & QA
    ↓
Polish & Deploy
```

---

## ⚠️ Risks & Mitigation

| Risk                       | Probability | Impact | Mitigation                                   |
| -------------------------- | ----------- | ------ | -------------------------------------------- |
| Supabase OAuth complexity  | Medium      | High   | Pre-configure; use simple JWT fallback       |
| Docker setup friction      | High        | Medium | Provide pre-built images; clear docs         |
| Real-time terminal is slow | Medium      | Medium | Use polling/REST fallback if WebSocket fails |
| Git conflicts on auto-save | Low         | High   | Warn user before auto-committing             |
| LEO service unavailable    | Low         | Medium | Graceful degradation (sidebar grayed out)    |

---

## 📊 Success Metrics (Phase 1 Completion)

- [ ] 95%+ test pass rate
- [ ] <3s page load time
- [ ] Zero critical bugs
- [ ] All acceptance criteria met
- [ ] Documentation complete
- [ ] Team sign-off

---

## 🔄 Review Cadence

- **Daily Standup:** 15 min (Slack async or Zoom)
- **Weekly Sync:** Friday 2pm – review progress, blockers, next week
- **Spec Review:** Happens before coding starts
- **Code Review:** 2 approvals before merge

---

## 📝 Handoff to Phase 2

Upon Phase 1 completion:

- [ ] All code merged to `main`
- [ ] Deployment to production
- [ ] Phase 2 spec created & approved
- [ ] Phase 2 backlog refined
- [ ] Team ready for real-time collab work

---

**Document Version:** 1.0
**Last Updated:** 2025-10-25
**Next Review:** Week 1 end (after setup completion)
