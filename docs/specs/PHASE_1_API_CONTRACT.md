# LionPack Studio – Phase 1 API Contract

> **Status:** Draft  
> **Priority:** P0 – Foundation  
> **Created:** 2025-10-25  
> **Author:** Leo / LionPack Team  
> **Related:** PHASE_1_ARCHITECTURE.md

---

## 📋 Overview

Complete OpenAPI 3.0 specification for all Phase 1 backend endpoints. This defines the contract between frontend and backend.

---

## 🔐 Authentication

All endpoints (except `/health` and `/auth/*`) require:

```
Authorization: Bearer <JWT_TOKEN>
```

JWT claims structure:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "github_username": "leonpagotto",
  "github_id": 12345,
  "iat": 1698235800,
  "exp": 1698322200
}
```

---

## 🏥 Health & Info Endpoints

### `GET /health`

System health check (no auth required)

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "leo_kit": "connected",
    "github_api": "connected"
  }
}
```

### `GET /api/info`

Current user and system info

**Response (200 OK):**
```json
{
  "user": {
    "id": "user-abc123",
    "email": "user@example.com",
    "github_username": "leonpagotto",
    "avatar_url": "https://avatars.githubusercontent.com/u/12345"
  },
  "api_version": "1.0.0",
  "features": ["editor", "terminal", "leo_integration"]
}
```

---

## 🔑 Authentication Endpoints

### `GET /auth/github`

Initiate GitHub OAuth flow

**Query Parameters:**
- `redirect_uri` (optional): Where to redirect after auth

**Response (302 Found):**
```
Location: https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=xxx&scope=repo,read:org
```

### `POST /auth/callback`

GitHub OAuth callback handler

**Request:**
```
POST /auth/callback
Content-Type: application/json

{
  "code": "github_auth_code_xxx",
  "state": "state_xxx"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-abc123",
    "email": "user@example.com",
    "github_username": "leonpagotto"
  },
  "redirect_url": "/editor"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "invalid_code",
  "message": "GitHub OAuth code is invalid or expired"
}
```

### `POST /auth/logout`

Logout current user

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📁 File Operations

### `GET /api/files/:projectId/*path`

Get file or directory contents

**Path Parameters:**
- `projectId` (string): Project identifier
- `path` (string): File or directory path

**Query Parameters:**
- `format` (string, optional): `raw`, `json`, default `json`

**Response (200 OK - File):**
```json
{
  "type": "file",
  "path": "src/index.tsx",
  "name": "index.tsx",
  "content": "export default ...",
  "language": "typescript",
  "encoding": "utf-8",
  "size": 1024,
  "lastModified": "2025-10-25T10:30:00Z",
  "mimeType": "text/x-typescript"
}
```

**Response (200 OK - Directory):**
```json
{
  "type": "directory",
  "path": "src",
  "name": "src",
  "entries": [
    {
      "type": "file",
      "name": "index.tsx",
      "path": "src/index.tsx",
      "size": 1024,
      "language": "typescript",
      "lastModified": "2025-10-25T10:30:00Z"
    },
    {
      "type": "directory",
      "name": "components",
      "path": "src/components",
      "entries_count": 5
    }
  ],
  "size": 0,
  "lastModified": "2025-10-25T10:30:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "not_found",
  "message": "File or directory not found at path: src/notexist.tsx"
}
```

### `POST /api/files/:projectId/*path`

Write file (create or update)

**Request:**
```json
{
  "content": "export default function App() { ... }",
  "message": "feat: add new component (#42)",
  "branch": "main",
  "create_if_missing": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "path": "src/index.tsx",
  "size": 1024,
  "committed": true,
  "commit": {
    "sha": "abc123def456",
    "message": "feat: add new component (#42)",
    "author": {
      "name": "Leo",
      "email": "leo@example.com"
    },
    "url": "https://github.com/leonpagotto/lionpack-studio/commit/abc123"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "invalid_content",
  "message": "Content must be a string"
}
```

### `DELETE /api/files/:projectId/*path`

Delete a file

**Request:**
```json
{
  "message": "chore: remove old file",
  "branch": "main"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "path": "src/old-file.tsx",
  "deleted": true,
  "commit": {
    "sha": "xyz789abc123",
    "message": "chore: remove old file",
    "url": "https://github.com/leonpagotto/lionpack-studio/commit/xyz789"
  }
}
```

### `POST /api/files/:projectId/mkdir`

Create directory

**Request:**
```json
{
  "path": "src/components/ui"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "path": "src/components/ui",
  "created": true
}
```

### `POST /api/files/:projectId/sync`

Clone or sync project from GitHub

**Request:**
```json
{
  "repo": "leonpagotto/lionpack-studio",
  "branch": "main",
  "target_path": "/workspace/project"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "repo": "leonpagotto/lionpack-studio",
  "branch": "main",
  "path": "/workspace/project",
  "commit_sha": "abc123def456",
  "files_count": 42
}
```

---

## 🖥️ Terminal Endpoints

### `WS /api/terminal/:projectId`

WebSocket endpoint for terminal session

**Connection:**
```
WebSocket: ws://localhost:3001/api/terminal/proj-abc123
Authorization: Bearer <JWT>
```

#### Message: Execute Command (Client → Server)

```json
{
  "type": "execute",
  "command": "npm install",
  "cwd": "/workspace/project",
  "timeout": 30,
  "id": "cmd-123"
}
```

#### Message: Output (Server → Client)

```json
{
  "type": "stdout",
  "data": "npm WARN deprecated...\n",
  "timestamp": "2025-10-25T10:30:00Z",
  "id": "cmd-123"
}
```

#### Message: Error (Server → Client)

```json
{
  "type": "stderr",
  "data": "Error: command not found\n",
  "timestamp": "2025-10-25T10:30:01Z",
  "id": "cmd-123"
}
```

#### Message: Exit (Server → Client)

```json
{
  "type": "exit",
  "code": 0,
  "signal": null,
  "id": "cmd-123"
}
```

#### Message: Resize Terminal (Client → Server)

```json
{
  "type": "resize",
  "cols": 120,
  "rows": 40
}
```

### `GET /api/terminal/:projectId/history`

Get terminal command history (REST fallback)

**Query Parameters:**
- `limit` (number, default 50): Max commands to return
- `offset` (number, default 0): Pagination offset

**Response (200 OK):**
```json
{
  "commands": [
    {
      "id": "cmd-123",
      "command": "npm install",
      "cwd": "/workspace/project",
      "exit_code": 0,
      "duration_ms": 5000,
      "executed_at": "2025-10-25T10:30:00Z"
    }
  ],
  "total": 42
}
```

---

## 📋 Project Management

### `GET /api/projects`

List user's projects

**Query Parameters:**
- `filter` (string, optional): `local`, `github`, `all` (default)
- `limit` (number, default 20)

**Response (200 OK):**
```json
{
  "projects": [
    {
      "id": "proj-abc123",
      "name": "lionpack-studio",
      "description": "AI-powered development environment",
      "source": "github",
      "repo": "leonpagotto/lionpack-studio",
      "branch": "main",
      "path": "/workspace/lionpack-studio",
      "created_at": "2025-10-25T10:30:00Z",
      "last_opened": "2025-10-25T14:30:00Z"
    }
  ],
  "total": 5
}
```

### `GET /api/projects/:projectId`

Get project details

**Response (200 OK):**
```json
{
  "id": "proj-abc123",
  "name": "lionpack-studio",
  "description": "AI-powered development environment",
  "source": "github",
  "repo": "leonpagotto/lionpack-studio",
  "branch": "main",
  "path": "/workspace/lionpack-studio",
  "runtime": "nodejs:18",
  "created_at": "2025-10-25T10:30:00Z",
  "last_opened": "2025-10-25T14:30:00Z",
  "owner": {
    "id": "user-abc123",
    "github_username": "leonpagotto"
  }
}
```

### `POST /api/projects`

Create new project

**Request:**
```json
{
  "name": "my-new-project",
  "description": "My awesome project",
  "repo": "leonpagotto/my-new-project",
  "branch": "main",
  "template": "nextjs"
}
```

**Response (201 Created):**
```json
{
  "id": "proj-xyz789",
  "name": "my-new-project",
  "repo": "leonpagotto/my-new-project",
  "path": "/workspace/my-new-project",
  "created_at": "2025-10-25T10:30:00Z"
}
```

---

## 🔌 LEO Kit Integration Endpoints

### `GET /api/leo/health`

LEO Kit service health

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "features": ["specs", "issues", "workflow", "github_api"],
  "github_authenticated": true
}
```

### `GET /api/leo/issues?repo=owner/repo&status=open`

List GitHub issues (proxied from LEO)

**Query Parameters:**
- `repo` (string, required): `owner/repo`
- `status` (string, optional): `open`, `closed`, `all`
- `labels` (string, optional): comma-separated labels
- `assignee` (string, optional): GitHub username
- `limit` (number, default 20)

**Response (200 OK):**
```json
{
  "issues": [
    {
      "id": 42,
      "number": 42,
      "title": "Add dark mode support",
      "body": "Users want dark mode...",
      "status": "open",
      "labels": ["enhancement", "ui"],
      "assignee": "leonpagotto",
      "created_at": "2025-10-25T10:30:00Z",
      "updated_at": "2025-10-25T14:30:00Z",
      "html_url": "https://github.com/leonpagotto/lionpack-studio/issues/42"
    }
  ],
  "total": 42
}
```

### `POST /api/leo/specs`

Create new spec file (via LEO)

**Request:**
```json
{
  "title": "Add Dark Mode Support",
  "description": "Full dark mode implementation for LionPack Studio",
  "priority": "P1",
  "author": "leonpagotto"
}
```

**Response (201 Created):**
```json
{
  "id": "spec-123",
  "title": "Add Dark Mode Support",
  "path": "docs/specs/add-dark-mode-support.md",
  "url": "https://github.com/leonpagotto/lionpack-studio/blob/main/docs/specs/add-dark-mode-support.md",
  "created_at": "2025-10-25T10:30:00Z"
}
```

---

## ❌ Error Responses

All endpoints follow this error format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {
    "field": "description"
  },
  "request_id": "req-abc123",
  "timestamp": "2025-10-25T10:30:00Z"
}
```

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `unauthorized` | 401 | Missing or invalid JWT |
| `forbidden` | 403 | User lacks permission |
| `not_found` | 404 | Resource not found |
| `invalid_request` | 400 | Bad request parameters |
| `conflict` | 409 | Resource conflict (e.g., file exists) |
| `timeout` | 408 | Request timeout |
| `service_unavailable` | 503 | Backend service down |

---

## 📊 Rate Limiting

All endpoints are rate-limited:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698322200
```

**Limits:**
- Authenticated users: 100 requests/minute
- Public endpoints: 10 requests/minute
- Terminal commands: 10 commands/minute per project

**Response (429 Too Many Requests):**
```json
{
  "error": "rate_limited",
  "message": "Rate limit exceeded",
  "retry_after": 60
}
```

---

## 🔄 Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` (number, default 1)
- `limit` (number, default 20, max 100)
- `sort` (string, optional): `created_at`, `-created_at` (descending)

**Response Header:**
```
X-Total-Count: 42
X-Page: 1
X-Page-Size: 20
X-Total-Pages: 3
```

---

## 📝 Versioning

API version is tracked in:
- Response header: `X-API-Version: 1.0.0`
- Base URL: `/api/v1/*` (future-proofing)

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-25  
**OpenAPI Version:** 3.0.0  
**Contact:** leo@example.com
