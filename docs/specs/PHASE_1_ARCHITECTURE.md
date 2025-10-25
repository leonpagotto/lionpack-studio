# LionPack Studio – Phase 1 Architecture & Setup

> **Status:** Draft
> **Priority:** P0 – Foundation
> **Created:** 2025-10-25
> **Author:** Leo / LionPack Team
> **Related:** LIONPACK_STRATEGIC_OVERVIEW.md

---

## 📋 Overview

Phase 1 focuses on **foundational infrastructure**: getting OpenCode + LEO Kit integrated, authentication working, and basic web IDE functional. No real-time collab yet; this is about plumbing and proof-of-concept.

**Goal:** By end of Phase 1, developers can:

1. Log in via GitHub OAuth
2. Open a project (from local or GitHub)
3. Edit files in Monaco editor
4. See LEO Kit backend is reachable
5. Run basic terminal commands

---

## 🏗️ Architecture (Phase 1)

### High-Level Stack

```
┌─────────────────────────────────────────┐
│  Frontend (React + Next.js)             │
│  - Monaco Editor                        │
│  - File Tree                            │
│  - Terminal Panel                       │
│  - LEO Sidebar (placeholder)            │
│  - Auth Flow (GitHub OAuth)             │
└────────────────┬────────────────────────┘
                 │ REST API
┌────────────────┴────────────────────────┐
│  Backend API (Node.js/Express)          │
│  - Auth endpoints (GitHub OAuth callback)
│  - File operations (read/write)         │
│  - Terminal websocket                   │
│  - LEO API proxy layer                  │
│  - Health checks                        │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐  ┌─────▼────┐  ┌────▼───┐
│LEO   │  │GitHub    │  │Supabase│
│Kit   │  │OAuth2    │  │- Auth  │
│      │  │- App ID  │  │- Users │
│      │  │- Secret  │  │        │
└──────┘  └──────────┘  └────────┘
```

### Monorepo Structure

```
lionpack-studio/
├── apps/
│   ├── web/                 # Frontend (Next.js)
│   │   ├── pages/
│   │   │   ├── index.tsx
│   │   │   ├── editor.tsx
│   │   │   ├── auth/
│   │   │   │   └── callback.tsx  (GitHub OAuth callback)
│   │   │   └── api/
│   │   │       ├── auth/
│   │   │       ├── files/
│   │   │       └── health.ts
│   │   ├── components/
│   │   │   ├── Editor.tsx
│   │   │   ├── FileTree.tsx
│   │   │   ├── Terminal.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── lib/
│   │   │   ├── api-client.ts
│   │   │   ├── auth.ts
│   │   │   └── github.ts
│   │   └── styles/
│   │
│   └── api/                 # Backend (Express)
│       ├── src/
│       │   ├── index.ts
│       │   ├── auth.ts
│       │   ├── files.ts
│       │   ├── terminal.ts
│       │   ├── leo-proxy.ts
│       │   └── middleware/
│       │       ├── auth.ts
│       │       └── errors.ts
│       └── routes/
│
├── packages/
│   ├── leo-client/          # Already exists
│   └── types/               # Shared TypeScript types
│       ├── api.ts
│       ├── editor.ts
│       └── github.ts
│
├── docs/
│   ├── specs/
│   │   ├── LIONPACK_STRATEGIC_OVERVIEW.md
│   │   ├── PHASE_1_ARCHITECTURE.md (this file)
│   │   ├── PHASE_1_API_CONTRACT.md
│   │   └── ...
│   └── guides/
│
└── Dockerfile
└── docker-compose.yml
```

---

## 🔐 Authentication Flow (GitHub OAuth)

### Overview

Use **Supabase Auth** with **GitHub OAuth provider** for seamless GitHub-first experience.

### Flow Diagram

```
User clicks "Login with GitHub"
    ↓
Redirect to GitHub OAuth authorize endpoint
    ↓
User approves permissions (repo access)
    ↓
GitHub redirects to /auth/callback with code
    ↓
Backend exchanges code for access token
    ↓
Backend creates/updates Supabase user
    ↓
Frontend receives JWT session token
    ↓
User redirected to /editor
    ↓
All subsequent requests include JWT in Authorization header
```

### Implementation Details

**Supabase Setup:**

1. Create Supabase project
2. Enable GitHub OAuth provider
3. Configure redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Staging: `https://staging.lionpack.studio/auth/callback`
   - Production: `https://lionpack.studio/auth/callback`

**Permissions Needed (GitHub Scope):**

```
repo              # Full repo access (read/write)
read:org          # Organization membership
user:email        # User email
workflow          # Actions/CI/CD (for future deploy commands)
```

**Session Storage:**

- **Frontend:** HttpOnly cookie (JWT) + secure session in Supabase Auth
- **Backend:** Validate JWT on each request

---

## 📁 File Operations

### API Endpoints (Phase 1)

#### `GET /api/files/:projectId/*path`

Retrieve file or directory contents

**Request:**

```
GET /api/files/proj-abc123/src/index.tsx
Authorization: Bearer <JWT>
```

**Response (File):**

```json
{
  "type": "file",
  "path": "src/index.tsx",
  "content": "export default ...",
  "language": "typescript",
  "encoding": "utf-8",
  "size": 1024,
  "lastModified": "2025-10-25T10:30:00Z"
}
```

**Response (Directory):**

```json
{
  "type": "directory",
  "path": "src",
  "entries": [
    { "name": "index.tsx", "type": "file", "size": 1024 },
    { "name": "components", "type": "directory" }
  ]
}
```

#### `POST /api/files/:projectId/*path`

Write file content (create or update)

**Request:**

```json
{
  "content": "export default ...",
  "message": "feat: add new component (#42)"
}
```

**Response:**

```json
{
  "success": true,
  "path": "src/index.tsx",
  "commitSha": "abc123def456"
}
```

#### `DELETE /api/files/:projectId/*path`

Delete a file

#### `POST /api/files/:projectId/sync`

Clone or sync project from GitHub

**Request:**

```json
{
  "repo": "leonpagotto/lionpack-studio",
  "branch": "main"
}
```

---

## 🖥️ Terminal Integration

### WebSocket Connection

Terminal will use WebSocket for real-time streaming of stdout/stderr.

#### `WS /api/terminal/:projectId`

**Connection:**

```
Authorization: Bearer <JWT>
```

**Message Format (Client → Server - Execute Command):**

```json
{
  "type": "execute",
  "command": "npm install",
  "cwd": "/workspace/project"
}
```

**Message Format (Server → Client - Output):**

```json
{
  "type": "stdout",
  "data": "npm WARN...\n",
  "timestamp": "2025-10-25T10:30:00Z"
}
```

### Supported Commands

- `npm install`, `npm run dev`, `npm test`
- `git status`, `git add`, `git commit`, `git push`
- `node script.js`, `python script.py`
- File operations (mkdir, touch, etc.)

### Security

- Commands run in **containerized sandbox** (one per project)
- **No root access** to host
- **Output limits** (max 1MB per command)
- **Timeout** (30s default, configurable)

---

## 🔌 LEO Kit Integration (Phase 1)

### LEO as Microservice

LEO Kit runs as a separate service with its own API exposed.

**Architecture:**

```
LionPack Frontend
    ↓
LionPack Backend API
    ↓ (proxy)
LEO Kit Service (separate Node process)
    ↓
GitHub API / Supabase / File System
```

### LEO API Proxy Endpoints (Phase 1)

These endpoints relay requests to LEO Kit backend:

#### `GET /api/leo/health`

Check LEO Kit service status

**Response:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "features": ["specs", "issues", "workflow"]
}
```

#### `POST /api/leo/spec/create`

Create new spec file (via LEO)

**Request:**

```json
{
  "title": "Add Dark Mode Support",
  "description": "...",
  "projectId": "proj-abc123"
}
```

**Response:**

```json
{
  "specId": "spec-123",
  "path": "docs/specs/add-dark-mode.md",
  "created": "2025-10-25T10:30:00Z"
}
```

#### `GET /api/leo/issues`

List GitHub issues (synced via LEO)

---

## 🌐 Environment Variables

### Frontend (.env.local)

```env
# GitHub OAuth (via Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# GitHub
NEXT_PUBLIC_GITHUB_CLIENT_ID=Ov23liXxx...
```

### Backend (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx...

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23liXxx...
GITHUB_CLIENT_SECRET=xxx...

# LEO Kit
LEO_SERVICE_URL=http://localhost:3002

# Security
JWT_SECRET=xxx...
CORS_ORIGIN=http://localhost:3000
```

### LEO Service (.env)

```env
PORT=3002
GITHUB_TOKEN=ghp_xxx...
GITHUB_ORG=leonpagotto
```

---

## 🐳 Docker & Local Development

### docker-compose.yml (Phase 1)

```yaml
version: "3.8"

services:
  # Frontend
  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}
      NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on:
      - api

  # Backend API
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "3001:3001"
    environment:
      SUPABASE_URL: ${SUPABASE_URL}
      LEO_SERVICE_URL: http://leo:3002
      PORT: 3001
    depends_on:
      - leo

  # LEO Kit Service
  leo:
    build:
      context: ./node_modules/leo-workflow-kit
    ports:
      - "3002:3002"
    environment:
      GITHUB_TOKEN: ${GITHUB_TOKEN}
      PORT: 3002
    volumes:
      - ./projects:/workspace
```

---

## 🧪 Testing Strategy (Phase 1)

### Unit Tests

- **Auth flow:** Test GitHub OAuth callback handling
- **File operations:** Mock file reads/writes
- **API responses:** Verify status codes and schemas

### Integration Tests

- **Full auth flow:** GitHub → Supabase → redirect
- **File sync:** Clone repo → list files → read file
- **Terminal:** Execute command → capture output

### Manual Testing (Pre-Launch)

- [ ] Login with GitHub account
- [ ] Open project from local filesystem
- [ ] Edit a file and save
- [ ] Run `npm install` in terminal
- [ ] Commit and push changes
- [ ] Check GitHub for new commits

---

## 📈 Performance Targets (Phase 1)

| Metric                   | Target                      |
| ------------------------ | --------------------------- |
| Page load time           | < 3s                        |
| Editor responsiveness    | < 100ms keystroke → display |
| File open time           | < 500ms                     |
| Terminal command latency | < 200ms                     |
| File save time           | < 1s (including Git commit) |

---

## 🚨 Known Limitations (Phase 1)

- ❌ No real-time collaboration (single user)
- ❌ No AI chat or code suggestions
- ❌ No offline mode
- ❌ Limited to Node.js projects (can expand later)
- ❌ Terminal runs in development container (not production-ready)
- ⚠️ LEO integration is proxy-only; no deep orchestration yet

---

## ✅ Phase 1 Acceptance Criteria

- [ ] GitHub OAuth authentication works end-to-end
- [ ] File tree displays project structure correctly
- [ ] Monaco editor opens and edits files
- [ ] File changes are persisted (saved to disk/git)
- [ ] Terminal panel can execute basic commands
- [ ] LEO health endpoint returns 200
- [ ] No console errors on main workflows
- [ ] Performance metrics met
- [ ] All tests pass (unit + integration)
- [ ] Docker compose setup works locally

---

## 📝 Breaking Down into Issues

Once this spec is approved, we'll create GitHub issues for:

1. **Setup & Infrastructure**
   - Monorepo structure initialization
   - Docker & dev environment
   - CI/CD pipeline basics

2. **Authentication**
   - Supabase project creation
   - GitHub OAuth flow implementation
   - Session management

3. **File Operations**
   - File tree component (React)
   - Backend file API endpoints
   - Git integration

4. **Terminal**
   - WebSocket server setup
   - Terminal session management
   - Command sandboxing

5. **Frontend Integration**
   - Layout component (editor + sidebar + terminal)
   - Navigation & routing
   - Error handling

6. **LEO Integration**
   - Proxy API setup
   - Health check endpoints
   - Initial feature bridging

---

## 🔄 Iteration Notes

- If Supabase adds complexity, fall back to simple JWT + database
- If real-time terminal is too slow, use polling (worse UX but simpler)
- If Docker setup is cumbersome, provide pre-built dev images

---

**Document Version:** 1.0
**Last Updated:** 2025-10-25
**Next Step:** Spec review + approval, then begin Phase 1 development
