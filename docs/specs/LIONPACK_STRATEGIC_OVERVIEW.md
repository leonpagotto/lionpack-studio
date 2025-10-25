# LionPack Studio – Strategic Overview & Vision

> **Status:** Draft
> **Priority:** P0 – Core Initiative
> **Created:** 2025-10-25
> **Author:** Leo / LionPack Team

---

## 🦁 Executive Summary

**LionPack Studio** is a next-generation AI-powered collaborative development environment designed for solo developers and small teams ("packs" of 1–4 collaborators). It combines:

- **LEO Kit** workflow automation (issue/spec management, GitHub integration)
- **OpenCode** real-time web-based IDE (Monaco editor, containerized runtime)
- **AI Assistant** (multi-model orchestration via LEO backend)
- **GitHub** as the single source of truth (issues, projects, PRs)

**Core Promise:** Reduce time from idea to working prototype while maintaining clarity, collaboration, and version control.

---

## 🎯 Problem Statement

### Current Pain Points

1. **Fragmented Tooling** – Developers juggle IDE, terminal, GitHub, AI chat, Figma, docs
2. **Slow Feedback Loops** – Switching contexts kills momentum
3. **AI Noise** – AI assistants lack project context and workflow awareness
4. **Collaboration Friction** – Real-time editing requires clunky setups (VS Code Live Share, Figma)
5. **Workflow Blindness** – No unified view of who's doing what, what's approved, what's blocked
6. **Deployment Friction** – Deploy-from-IDE is rare; usually requires terminal/CLI knowledge

### Who Benefits?

- **Solo Developers**: 1-person teams building solo projects, MVPs, experiments
- **Small Packs**: 2–4 co-founders, creative technologists, agency teams
- **Open Source Maintainers**: Needing efficient triage, automation, and contributor onboarding

---

## 🧁 Vision: "The Vibe"

LionPack Studio should feel:

- **Fast** – Idea → prototype in minutes, not hours
- **Lovable** – Beautiful UI, ambient sound, satisfying animations
- **Collaborative** – Roles are clear, async & real-time both supported
- **AI-First** – AI is a pack member, not a plugin
- **Transparent** – No hidden task lists; everything reflects GitHub source of truth

**Metaphor:** A creative studio where a small pack of hunters (developers) tracks and tackles ideas together. Everyone knows the hunt, roles are clear, and the trophy gets displayed.

---

## 📐 Core Architecture Overview

### Layers

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React + Monaco)                          │
│  - Editor + Chat Sidebar + Pack Board + Commands    │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│  Backend API Gateway                                │
│  - LEO Integration Layer                            │
│  - AI Orchestrator                                  │
│  - Pack Session Manager                            │
│  - GitHub Sync (watch & push)                       │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┼──────────────────┐
    │              │                  │
┌───▼───┐   ┌─────▼────┐   ┌─────────▼────┐
│LEO Kit│   │GitHub API│   │Supabase      │
│       │   │          │   │- Auth        │
│ - Spec│   │- Issues  │   │- Realtime DB │
│ - Issue    │- Projects    │- Storage     │
│ - Workflow │- PRs         │              │
└─────────────────────────────────────────┘
```

### Key Principles

1. **GitHub as Source of Truth** – All issues, projects, PRs live on GitHub
2. **LEO Automation** – Workflow logic stays in LEO Kit; exposed via REST API
3. **Realtime Sync** – Supabase for presence, Pack state, chat history
4. **Containerized Runtimes** – Each project gets its own isolated Node/Python/Rust environment
5. **No Custom Task Manager** – Use GitHub issues exclusively, synced to UI

---

## 🧩 Core Features (MVP Scope)

### Tier 1: Essential (Phase 1–2)

| Feature                  | Description                                        | Depends On         |
| ------------------------ | -------------------------------------------------- | ------------------ |
| **Web IDE with Monaco**  | Full-featured code editor with syntax highlighting | OpenCode           |
| **LEO Chat Sidebar**     | AI chat with context from open files & GitHub      | LEO API, AI models |
| **GitHub Issues View**   | Display synced issues, PRs from current project    | GitHub API         |
| **Solo Mode**            | Toggle: turn off real-time collab, run locally     | UI toggle          |
| **Basic File Tree**      | Browse & open files in the project                 | OpenCode           |
| **Terminal Integration** | In-browser terminal for running scripts            | OpenCode           |

### Tier 2: Collaboration (Phase 2–3)

| Feature                | Description                                     | Depends On        |
| ---------------------- | ----------------------------------------------- | ----------------- |
| **Real-Time Collab**   | Multiple cursors, live edits (Yjs + Supabase)   | Yjs, Supabase     |
| **Pack View**          | Show teammates, roles, task assignments         | Supabase presence |
| **Role Assignment**    | Leader, Builder, Scout, Reviewer (badges on UI) | Supabase, GitHub  |
| **Pack Board**         | Kanban-style view of GitHub issues + roles      | GitHub API        |
| **Presence Awareness** | See who's typing, which file they're in         | Supabase realtime |

### Tier 3: AI & Automation (Phase 2–3)

| Feature                   | Description                                  | Depends On           |
| ------------------------- | -------------------------------------------- | -------------------- |
| **AI Context Memory**     | Chat retains file, issue, and commit context | LEO API, Supabase    |
| **Inline AI Suggestions** | AI hints in code (Copilot-like)              | AI model integration |
| **Auto-Issue Creation**   | Chat command `/issue` creates GitHub issue   | LEO API, GitHub API  |
| **AI Code Review**        | Chat can analyze diffs, suggest improvements | AI model, GitHub     |
| **Workflow Commands**     | `/build`, `/test`, `/deploy` automation      | LEO API, CI/CD       |

### Tier 4: Polish & Brand (Phase 3–4)

| Feature                | Description                                    | Depends On   |
| ---------------------- | ---------------------------------------------- | ------------ |
| **Vibe Mode**          | Ambient animations, sound, themes              | UI/UX design |
| **Onboarding Flow**    | Guided setup: auth, project clone, team invite | UI/Supabase  |
| **Notifications**      | Real-time alerts for chat, issues, presence    | Supabase     |
| **Dark/Light Themes**  | User preference for UI theme                   | Tailwind     |
| **Keyboard Shortcuts** | Command palette & shortcuts for power users    | React        |

---

## 🚀 Phased Implementation Plan

### Phase 1: Foundation (Weeks 1–3)

**Goal:** Get OpenCode + LEO Kit integrated with basic web IDE

- [ ] Setup monorepo structure (OpenCode fork + LEO service)
- [ ] Expose LEO Kit as REST API service
- [ ] Integrate OpenCode frontend with LEO backend
- [ ] Authenticate users via Supabase + GitHub OAuth
- [ ] Display basic project file tree & editor

**Deliverable:** Functional web IDE that can open and edit files

---

### Phase 2: GitHub Integration + Basic Collab (Weeks 4–6)

**Goal:** Connect to GitHub, display issues, enable async collab

- [ ] Sync GitHub issues & display in sidebar
- [ ] Implement Yjs + Supabase for real-time editing
- [ ] Add Pack View (show team members, roles)
- [ ] Create LEO Chat sidebar with file context
- [ ] Add Solo/Pack mode toggle

**Deliverable:** Solo dev can edit files; teams can see each other; chat works with context

---

### Phase 3: AI & Advanced Features (Weeks 7–9)

**Goal:** AI-driven automation, workflow commands, code review

- [ ] Integrate AI models (OpenAI, Claude, local options)
- [ ] Implement `/issue`, `/build`, `/review` commands
- [ ] Add inline AI code suggestions
- [ ] Connect to GitHub CI/CD for automated testing
- [ ] Implement AI-powered code analysis

**Deliverable:** AI can create issues, review code, suggest improvements; users can automate workflows

---

### Phase 4: Polish & Launch (Weeks 10–12)

**Goal:** Brand, UX polish, documentation, public ready

- [ ] Design Vibe Mode UI & animations
- [ ] Complete onboarding flow
- [ ] Write user documentation & guides
- [ ] Performance optimization
- [ ] Docker containerization & deployment

**Deliverable:** Polished, branded, publicly launchable LionPack Studio

---

## 🧠 AI Logic & Orchestration

### AI Orchestrator Flow

```
User Input (Chat or Code)
    ↓
[AI Orchestrator]
    ├─ Extract context (open files, chat history, current issue)
    ├─ Route to appropriate AI model (OpenAI, Claude, local)
    ├─ Enrich prompt with GitHub issue context
    ↓
[AI Model Response]
    ↓
[LEO Automation Layer]
    ├─ Parse intent (create issue? deploy? review?)
    ├─ Execute via LEO API (GitHub, CI/CD, etc.)
    ↓
[Update UI & GitHub State]
    ├─ Refresh issues board
    ├─ Update Pack View
    └─ Notify all connected clients
```

### AI Commands (Examples)

- **`/issue "Add dark mode to settings"` → Creates GitHub issue**
- **`/review` → AI reviews current file diff**
- **`/build` → Trigger CI/CD build**
- **`/deploy to staging` → Deploy to staging environment**
- **`@ai what does this function do?` → AI explains code**

---

## 🔗 GitHub Integration (Non-Negotiable)

### Why GitHub is Central

- ✅ All team members already use GitHub
- ✅ Issues, PRs, projects are industry standard
- ✅ LEO Kit already integrates deeply
- ✅ No need to build custom task manager
- ✅ Version control history is transparent

### What LionPack Studio Does NOT Do

- ❌ Create custom task/issue tracking DB
- ❌ Re-implement PR review workflow
- ❌ Compete with GitHub project boards
- ❌ Store issues locally

### What LionPack Studio DOES Do

- ✅ Display GitHub issues in real-time sidebar
- ✅ Sync PR status and comments
- ✅ Create issues via AI commands (via LEO API)
- ✅ Link pack members to GitHub user accounts
- ✅ Push commits from IDE to GitHub (auto-commit on save option)

---

## 👥 User Roles & Personas

### Solo Developer ("Hunter Pack of 1")

- **Workflow:** Idea → Chat with AI → File edits → Commit → Deploy
- **Pain Point:** Context-switching between tools
- **Solution:** Everything in one IDE; AI keeps context

### Small Team / Co-founders ("Pack of 2–4")

- **Workflow:** Spec discussion → Role assignment → Real-time collab → Review → Deploy
- **Pain Point:** Unclear roles, async comms, lack of shared context
- **Solution:** Roles, Pack board, real-time presence, GitHub centralized

### Open Source Maintainer

- **Workflow:** Triage issues → Assign contributors → Review PRs → Merge
- **Pain Point:** Time spent on admin, onboarding new contributors
- **Solution:** AI helps triage & suggest fixes; Pack View shows contributor activity

---

## 💎 Brand & UX Direction

### Visual Theme

- **Colors:** Lion-inspired warm oranges/golds, deep forest greens, cream highlights
- **Typography:** Clean, modern sans-serif (e.g., Inter, Outfit)
- **Animations:** Smooth, playful (Framer Motion) — ambient glow effects, elastic easing
- **Layout:** Clean grid, generous whitespace, cards over tables where possible

### Language & Tone

- **Friendly:** "Let's hunt this idea together" not "Execute task queue"
- **Empowering:** "You've got this pack" not "Error: insufficient permissions"
- **Collaborative:** Emphasize pack, roles, and shared wins
- **Technical but accessible:** Don't hide complexity, explain it

### Interaction Model

- **Default: Ambient & Calm** – Sound off, subtle animations, dark mode
- **Vibe Mode ON:** Ambient soundscape, warm lighting, satisfying interactions
- **Collaboration Signals:** Subtle presence indicators (small avatars, typing dots)

---

## 🎯 Success Metrics

### Phase 1

- [ ] Web IDE loads project and allows file edits
- [ ] Authentication works (GitHub OAuth)
- [ ] LEO API is accessible and responding
- [ ] No critical bugs in basic workflow

### Phase 2

- [ ] Real-time editing works without data loss
- [ ] GitHub issues sync correctly
- [ ] Chat sidebar integrates with file context
- [ ] Pack View displays team presence

### Phase 3

- [ ] AI can create issues, review code, suggest fixes
- [ ] Workflow commands (`/build`, `/deploy`) work
- [ ] No regressions from Phase 2

### Phase 4 (Launch)

- [ ] Vibe Mode is polished and intuitive
- [ ] Onboarding flow completes in <5 min
- [ ] Documentation is comprehensive
- [ ] Performance: <2s page load, <100ms interactions

---

## ⚠️ Risks & Mitigation

| Risk                            | Impact                      | Mitigation                                               |
| ------------------------------- | --------------------------- | -------------------------------------------------------- |
| **Real-time collab complexity** | Phase 2 delay               | Start with simpler presence-only; add Yjs in iteration 2 |
| **GitHub API rate limits**      | Syncing issues fails        | Cache layer, smart polling strategy, GitHub webhooks     |
| **AI context explosion**        | Token costs, slow responses | Implement smart context window management, summarization |
| **Scope creep**                 | Never ships                 | Strict phase gates, regularly cut features               |
| **User onboarding too complex** | Adoption stalls             | Guided walkthrough, templates, video tutorials           |

---

## 🧭 Alternatives Considered & Why Not

### Why Not Bolt On to Existing IDEs?

- ❌ VS Code extension ecosystem too fragmented
- ❌ Can't control terminal/collab experience
- ❌ Custom UI layering adds complexity
- ✅ Web-based gives instant access, no install friction

### Why Not Use Cursor.io or Windsurf?

- ❌ Closed source, opinionated workflows
- ❌ Not designed for team collab
- ✅ Open (and openable), customizable, pack-first

### Why Build vs. Buy (e.g., Replit)?

- ❌ Replit doesn't expose LEO automation
- ❌ Limited GitHub integration
- ❌ Can't customize for our "pack" philosophy
- ✅ Own the stack, customize for LionPack ethos

---

## 📋 Related & Future Work

### Immediate (Part of LionPack)

- Spec: Feature Development Workflow
- Spec: AI Orchestrator & Model Management
- Spec: Real-Time Collaboration Engine
- Spec: UI/UX & Brand Implementation

### Future (Out of Scope MVP)

- Mobile app (iOS/Android)
- Kubernetes/serverless deployment automation
- Custom plugin system
- Audio/video conferencing in IDE
- ML-powered code performance profiling

---

## ✅ Approval Checklist

- [ ] Vision & strategy aligned with team
- [ ] Tech stack approved (OpenCode, LEO Kit, Supabase, etc.)
- [ ] Scope and phased plan is realistic
- [ ] Success metrics are measurable
- [ ] Risks are identified and mitigated
- [ ] Brand direction is aligned

---

## 📝 Next Steps

1. **Review & feedback** on this strategic overview
2. **Create detailed specs** for each phase (architecture, API contracts, data models)
3. **Begin Phase 1** setup:
   - Fork OpenCode repo
   - Setup LEO Kit API service
   - Initialize frontend scaffold
4. **Kickoff meeting** with full pack to align

---

## 📎 Appendix: Related Resources

- [LEO Kit Documentation](https://github.com/leonpagotto/leo-kit)
- [OpenCode GitHub](https://github.com/sst/opencode)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Yjs Documentation](https://docs.yjs.dev)
- [GitHub API Reference](https://docs.github.com/en/rest)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-25
**Next Review:** After team feedback & approval
