# 🏗️ LionPack Studio - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    👤 User Browser                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │        Next.js Frontend (apps/web)                      │   │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │  OpenCode Editor │  │  Morphy AI Chat Sidebar     │ │   │
│  │  │  • File browser  │  │  • Context awareness         │ │   │
│  │  │  • Code editor   │  │  • Suggestions               │ │   │
│  │  │  • Terminal      │  │  • Pack management           │ │   │
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

**Purpose**: Wrapper around leo-workflow-kit providing convenient APIs

```
packages/leo-client/
├── src/
│   ├── orchestrator.ts       # LEO orchestration
│   ├── workflow-manager.ts   # Workflow operations
│   ├── spec-generator.ts     # Spec generation
│   ├── github-client.ts      # GitHub operations
│   └── types.ts
├── tests/
└── package.json
```

**Exports**:
```typescript
export { Orchestrator } from './orchestrator'
export { WorkflowManager } from './workflow-manager'
export { SpecGenerator } from './spec-generator'
export { GitHubClient } from './github-client'
export * from './types'
```

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

### User Creates Workflow

```
1. User opens editor
   ↓
2. Types idea in chat → Morphy processes
   ↓
3. User confirms spec in sidebar
   ↓
4. Frontend calls /api/workflows/create
   ↓
5. API calls leo-client.orchestrator.createWorkflow()
   ↓
6. LEO Kit:
   - Creates GitHub issue
   - Generates spec
   - Routes to agents
   - Updates project
   ↓
7. Result broadcasts to all pack members via Yjs
   ↓
8. UI updates in real-time
```

### Real-Time Collaboration

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

| Metric | Target | Strategy |
|--------|--------|----------|
| Initial load | < 2s | SSR + code splitting |
| Editor responsiveness | < 100ms | Local state, debouncing |
| Collab latency | < 500ms | Optimistic updates |
| Database queries | < 100ms | Indexing, caching |

---

## 🔌 Integration Points

### LEO Kit Integration

```typescript
// leo-client wraps leo-workflow-kit
import { Orchestrator } from 'leo-client'

const orchestrator = new Orchestrator({
  modelPreference: 'opus-4-5',
  githubToken: process.env.GITHUB_TOKEN,
})

// Call orchestrator methods
const workflow = await orchestrator.createWorkflow(spec)
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
const provider = new WebsocketProvider(
  supabaseRealtimeUrl,
  roomName,
  ydoc
)
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
