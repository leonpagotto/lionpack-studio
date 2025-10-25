# 🏗️ LionPack Studio - Architecture

## 🎯 System Overview: Hybrid Multi-Mode Agent IDE

> **Updated 2025-10-25:** Architecture now includes multi-mode AI agent system inspired by KiloCode
> See [ADR-001](./ADR-001-HYBRID_MULTI_MODE_AGENT_IDE.md) for decision rationale

```
┌─────────────────────────────────────────────────────────────────┐
│                    👤 User Browser                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │        Next.js Frontend (apps/web)                      │   │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │ Monaco Editor    │  │ Multi-Mode Chat Sidebar     │ │   │
│  │  │  • File browser  │  │  🏗️  Architect Mode        │ │   │
│  │  │  • Code editor   │  │  💻 Coder Mode (+ verify)   │ │   │
│  │  │  • Terminal      │  │  🐛 Debugger Mode           │ │   │
│  │  │  • Git ops       │  │  ✅ Reviewer Mode           │ │   │
│  │  └──────────────────┘  └──────────────────────────────┘ │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │     Real-time Collaboration Layer (Yjs)              │ │   │
│  │  │  • Live presence awareness                           │ │   │
│  │  │  • Operational transformation                        │ │   │
│  │  │  • Conflict resolution                               │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────────────┘
             │ WebSocket + HTTP/2
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              🌐 Backend Services (Cloud/Containerized)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Next.js API     │  │ LEO Kit Service  │  │ Supabase     │  │
│  │  (/api/*)        │  │ (leo-client)     │  │ Realtime     │  │
│  │  • Auth routes   │  │ • Workflows      │  │ • Presence   │  │
│  │  • Pack mgmt     │  │ • Specs          │  │ • Broadcast  │  │
│  │  • Collab sync   │  │ • GitHub sync    │  │ • Sync state │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐ │
│  │  PostgreSQL      │  │  Supabase Auth                       │ │
│  │  • Users         │  │  • GitHub OAuth                      │ │
│  │  • Packs         │  │  • Session management                │ │
│  │  • Projects      │  │  • Row-level security                │ │
│  │  • Workflows     │  └──────────────────────────────────────┘ │
│  └──────────────────┘                                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  LEO Kit Integration                                          │ │
│  │  • Workflow orchestration (multi-agent)                       │ │
│  │  • Spec generation (multi-model Claude)                       │ │
│  │  • GitHub Projects sync                                       │ │
│  │  • Issue creation & tracking                                  │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────┬───────────────────────────────────────────────────┘
               │ REST/GraphQL
               ▼
┌─────────────────────────────────────────────────────────────────┐
│            🔌 External Services                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  GitHub API      │  │  Anthropic API   │  │ External     │  │
│  │  • Auth          │  │  • Claude 4.5    │  │ Code         │  │
│  │  • Issues        │  │  • Haiku         │  │ Integration  │  │
│  │  • Projects      │  │  • Embeddings    │  │ (future)     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Package Structure

### `apps/web` — Next.js Frontend

**Purpose**: User-facing web application

```
apps/web/
├── pages/
│   ├── _app.tsx              # App wrapper, providers
│   ├── _document.tsx         # HTML scaffold
│   ├── index.tsx             # Home/workspace
│   ├── editor/[id].tsx       # Editor page
│   ├── pack/[id]/            # Pack management
│   ├── api/                  # API routes
│   │   ├── auth/
│   │   ├── packs/
│   │   └── workflows/
│   └── auth/                 # Auth flows
├── components/
│   ├── Editor/               # Editor integration
│   ├── Chat/                 # Morphy integration
│   ├── Collaboration/        # Real-time UI
│   ├── Pack/                 # Pack management
│   └── Common/               # Shared components
├── hooks/
│   ├── useEditor.ts          # Editor state
│   ├── useChat.ts            # Chat context
│   ├── useCollaboration.ts   # Real-time state
│   └── usePack.ts            # Pack state
├── styles/
│   ├── globals.css
│   └── theme.css
├── lib/
│   ├── api/                  # API client
│   ├── leo/                  # LEO integration
│   └── types.ts              # Local types
└── public/                   # Static assets
```

**Key Technologies**:

- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS
- SWR or React Query (data fetching)
- OpenCode (embedded editor)
- Morphy (embedded chat)

### `apps/api` — Node.js Backend (Phase 2+)

**Purpose**: Centralized backend for complex operations (optional, can use Next.js API routes for Phase 1)

```
apps/api/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── packs.ts
│   │   └── workflows.ts
│   ├── services/
│   │   ├── leo-orchestrator.ts
│   │   ├── collaboration.ts
│   │   └── github-sync.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── error-handler.ts
│   └── index.ts
├── tests/
└── package.json
```

### `packages/leo-client` — LEO Kit Integration

**Purpose**: Wrapper around leo-workflow-kit providing convenient APIs and multi-mode AI agent orchestration

```
packages/leo-client/
├── src/
│   ├── orchestrator.ts           # LEO orchestration + Mode routing
│   ├── workflow-manager.ts       # Workflow operations
│   ├── spec-generator.ts         # Spec generation
│   ├── github-client.ts          # GitHub operations
│   ├── ai-modes/
│   │   ├── architect-mode.ts     # Planning & design (no verification)
│   │   ├── coder-mode.ts         # Code generation + auto-test verification
│   │   ├── debugger-mode.ts      # Bug analysis & fixing (with verification)
│   │   ├── reviewer-mode.ts      # Quality gate (automated review)
│   │   └── mode-router.ts        # Intent detection & routing
│   ├── verification/
│   │   ├── test-verifier.ts      # Runs tests, validates coverage >80%
│   │   ├── type-checker.ts       # TypeScript validation
│   │   └── lint-checker.ts       # Code quality checks
│   └── types.ts
├── tests/
└── package.json
```

**Exports**:

```typescript
export { Orchestrator } from "./orchestrator";
export { WorkflowManager } from "./workflow-manager";
export { SpecGenerator } from "./spec-generator";
export { GitHubClient } from "./github-client";
export {
  ModeRouter,
  ArchitectMode,
  CoderMode,
  DebuggerMode,
  ReviewerMode,
} from "./ai-modes";
export * from "./types";
```

**Multi-Mode AI Agent System**:

| Mode          | Trigger                            | Process                                  | Verification                             |
| ------------- | ---------------------------------- | ---------------------------------------- | ---------------------------------------- |
| **Architect** | "design", "plan", "architecture"   | Generates specs, diagrams, design docs   | None (planning phase)                    |
| **Coder**     | "implement", "code", "build"       | Generates code + unit tests              | AUTO: Run tests, verify coverage >80%    |
| **Debugger**  | "fix", "debug", "error"            | Analyzes errors, generates fixes + tests | AUTO: Verify fix resolves issue          |
| **Reviewer**  | "review", "merge", "check quality" | Checks coverage, style, security         | AUTO: Enforce >80% coverage, no warnings |

### `packages/types` — Shared TypeScript Types

**Purpose**: Single source of truth for data structures

```
packages/types/
├── src/
│   ├── pack.ts               # Pack, Role, Member
│   ├── workflow.ts           # Workflow, Task, Step
│   ├── project.ts            # Project, Workspace
│   ├── user.ts               # User, Profile
│   ├── collaboration.ts      # Presence, Event
│   └── index.ts
└── package.json
```

### `packages/ui` — Reusable Components

**Purpose**: Shared React components with Tailwind

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Panel.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useClickOutside.ts
│   │   └── ...
│   └── index.ts
└── package.json
```

### `packages/editor` — OpenCode Wrapper (Optional)

**Purpose**: Thin wrapper for consistent editor API

```
packages/editor/
├── src/
│   ├── editor-client.ts
│   ├── types.ts
│   └── hooks.ts
└── package.json
```

---

## 🔄 Data Flow

### Multi-Mode AI Agent Orchestration

```
User sends request in chat
   ↓
Mode Router analyzes intent:
  • "design/plan" → Architect Mode
  • "implement/code" → Coder Mode (with AUTO verification)
  • "fix/debug" → Debugger Mode (with AUTO verification)
  • "review/quality" → Reviewer Mode (with AUTO verification)
   ↓
Selected Mode processes:
  • Context injection (files, history)
  • AI processing (Claude 4.5/Haiku)
  • Output generation
   ↓
[IF Coder/Debugger/Reviewer]
  • Auto-run tests & validation
  • Verify coverage threshold
  • Check for errors/warnings
   ↓
[IF Verification fails]
  • Regenerate with feedback
  • Retry up to N times
  • Or escalate to human review
   ↓
Result returned to chat
   ↓
User sees:
  • Generated content
  • Test results badge
  • Coverage % (if applicable)
  • Time taken
   ↓
User can accept/reject/refine
```

### User Creates Workflow with Multi-Mode Support

```
1. User opens editor
   ↓
2. Types in chat with intent (e.g., "implement login button")
   ↓
3. Mode Router routes to Coder Mode (intent: "implement")
   ↓
4. Coder Mode:
   - Injects file context (Button.tsx, Button.test.tsx)
   - Generates component code
   - AUTO generates unit tests
   - Runs: npm test
   - Verifies: coverage > 80%
   ↓
5. [If tests pass]
   - Shows "✅ Tests passed (95% coverage)"
   - User reviews output
   ↓
6. [If tests fail]
   - Shows error, regenerates with fixes
   - Retries verification
   ↓
7. User confirms & accepts
   ↓
8. Frontend calls /api/workflows/create
   ↓
9. API integrates verified code into project
   ↓
10. Broadcasts to pack via Yjs
    ↓
11. All members see change in real-time
```

---

## 🛠️ Tool System & Verification Framework

### MCP-Inspired Tool Registry

```typescript
// Tool types that AI modes can call
type ToolType =
  | "file-read"
  | "file-write"
  | "file-delete"
  | "file-search"
  | "terminal-exec"
  | "test-run"
  | "git-commit"
  | "git-push"
  | "git-branch"
  | "type-check"
  | "lint-check";

interface Tool {
  id: string;
  name: string;
  description: string;
  type: ToolType;
  schema: JSONSchema;
  timeout: number;
  sandbox: boolean;
}
```

**Available Tools**:

| Tool            | Modes                     | Purpose                  |
| --------------- | ------------------------- | ------------------------ |
| `file-read`     | All                       | Read file content        |
| `file-write`    | Coder, Debugger           | Write/update files       |
| `file-delete`   | Coder, Debugger           | Delete files             |
| `file-search`   | All                       | Search content           |
| `terminal-exec` | Coder, Debugger           | Run commands (sandboxed) |
| `test-run`      | Coder, Debugger, Reviewer | Execute tests + coverage |
| `git-commit`    | Coder, Debugger           | Commit changes           |
| `type-check`    | Reviewer                  | TypeScript validation    |
| `lint-check`    | Reviewer                  | ESLint validation        |

### Verification Framework

**Coder Mode Verification**:

```bash
1. Generate code + tests
2. Write to filesystem
3. npm test
4. Check coverage report
5. Coverage >= 80% ? PASS : FAIL
6. If FAIL: Regenerate with error feedback
```

**Debugger Mode Verification**:

```bash
1. Generate fix based on error
2. Apply to code
3. npm test (regression)
4. If tests pass: Mark as VERIFIED
5. If tests fail: Analyze & retry
```

**Reviewer Mode Verification**:

```bash
1. Check TypeScript compilation: tsc --noEmit
2. Run ESLint: eslint . --max-warnings 0
3. Check test coverage: jest --coverage
4. Coverage >= 80% && No TS errors && No linting errors ? PASS : FAIL
5. Generate report with issues
```

---

## 🌐 Real-Time Collaboration

```
User A edits code
   ↓
Yjs captures change
   ↓
Browser broadcasts via WebSocket to Supabase Realtime
   ↓
Server propagates to all connected pack members
   ↓
Each browser applies transformation locally
   ↓
Consistency maintained (CRDT)
   ↓
UI updates in real-time
```

---

## 🔐 Authentication & Authorization

### Flow

```
1. User clicks "Sign in with GitHub"
   ↓
2. Supabase Auth redirects to GitHub OAuth
   ↓
3. GitHub redirects back with auth code
   ↓
4. Supabase exchanges for JWT
   ↓
5. Frontend stores JWT in secure httpOnly cookie
   ↓
6. All API requests include JWT
   ↓
7. Backend verifies with Supabase
   ↓
8. Row-level security restricts data access
```

### Pack Roles

```typescript
type Role = 'owner' | 'architect' | 'developer' | 'reviewer' | 'viewer'

Permissions:
- owner:     Everything
- architect: Specs, workflows, members
- developer: Code, comments, tasks
- reviewer:  Comments, approvals
- viewer:    Read-only
```

---

## 🔗 Component Interactions

### Editor ↔️ Chat

```
Editor state → Chat context (what user is working on)
Chat suggestions → Editor actions (code insertions)
Selection in editor → Chat sees context
```

### Workflow ↔️ Collaboration

```
New workflow created → Broadcast to pack via Yjs
Pack members assigned → UI reflects roles
Task completed → Workflow state advances
Status updates → Realtime sync via Supabase
```

### LEO Kit ↔️ Frontend

```
leo-client calls LEO services
Returns structured workflow data
Frontend subscribes to changes
Updates UI in real-time
```

---

## 📊 Database Schema (PostgreSQL)

```sql
-- Users (managed by Supabase Auth)
-- (Supabase auto-creates auth.users)

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP
);

CREATE TABLE packs (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  owner_id UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE pack_members (
  id UUID PRIMARY KEY,
  pack_id UUID REFERENCES packs(id),
  user_id UUID REFERENCES profiles(id),
  role TEXT CHECK (role IN ('owner', 'architect', 'developer', 'reviewer', 'viewer')),
  joined_at TIMESTAMP
);

CREATE TABLE projects (
  id UUID PRIMARY KEY,
  pack_id UUID REFERENCES packs(id),
  github_repo TEXT,
  github_org TEXT,
  name TEXT,
  created_at TIMESTAMP
);

CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  github_issue_id INT,
  name TEXT,
  status TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Row-level security policies ensure users can only access their packs
```

---

## 🚀 Deployment Architecture

### Development

```
Local machine
  ├── npm run dev (Next.js on :3000)
  ├── Docker Compose (PostgreSQL, Redis)
  └── .env.local
```

### Production

```
Vercel (frontend)
  ↓
Supabase (backend + database)
  ├── Postgres
  ├── Auth
  ├── Realtime
  └── Storage

Plus:
  - GitHub API integration
  - Anthropic API (Claude)
  - Custom domain + DNS
```

---

## 📈 Performance Considerations

| Metric                | Target  | Strategy                |
| --------------------- | ------- | ----------------------- |
| Initial load          | < 2s    | SSR + code splitting    |
| Editor responsiveness | < 100ms | Local state, debouncing |
| Collab latency        | < 500ms | Optimistic updates      |
| Database queries      | < 100ms | Indexing, caching       |

---

## 🔌 Integration Points

### LEO Kit Integration

```typescript
// leo-client wraps leo-workflow-kit
import { Orchestrator } from "leo-client";

const orchestrator = new Orchestrator({
  modelPreference: "opus-4-5",
  githubToken: process.env.GITHUB_TOKEN,
});

// Call orchestrator methods
const workflow = await orchestrator.createWorkflow(spec);
```

### OpenCode Integration

```typescript
// Embedded in React component
import { Editor } from '@opencode/react'

<Editor
  files={projectFiles}
  onChange={onFileChange}
  onTerminalCommand={onTerminalCommand}
/>
```

### Morphy Integration

```typescript
// Chat sidebar in component
import { MorphyChat } from '@morphy/react'

<MorphyChat
  context={editorContext}
  onSuggestion={applyToEditor}
/>
```

### Supabase Realtime

```typescript
// Yjs binding to Supabase
const provider = new WebsocketProvider(supabaseRealtimeUrl, roomName, ydoc);
```

---

## 🧭 Next Steps

1. **Phase 1** — Implement `packages/leo-client` and basic Next.js API routes
2. **Phase 2** — Embed OpenCode editor in `apps/web`
3. **Phase 3** — Add Morphy chat sidebar + real-time collab with Yjs
4. **Phase 4** — Polish UI, add themes, optimize performance
5. **Phase 5** — Launch v1.0, gather feedback

---

**Last Updated**: October 24, 2025
