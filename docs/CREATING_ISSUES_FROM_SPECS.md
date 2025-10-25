# LionPack Studio – Breaking Specs into GitHub Issues

> **Guide:** How to create actionable GitHub issues from approved specs
> **Follow-up Step:** After spec review & team approval

---

## 🎯 The LEO Workflow

1. **Write Spec** ✅ (Done – see `docs/specs/`)
2. **Get Approval** ⏳ (Next – team review)
3. **Create Issues** ← You are here
4. **Assign & Estimate**
5. **Develop & Track**
6. **Close Issues on PR**

---

## 📋 Issue Creation Template

Each issue should:

- Reference the spec it comes from
- Be small enough to complete in 1–2 days
- Include acceptance criteria from spec
- Link to related issues

### Naming Convention

```
[AREA] Task description (refers to spec)

Examples:
- [Auth] Implement GitHub OAuth callback endpoint
- [Files] Create file tree React component
- [Terminal] Setup WebSocket server
- [Infrastructure] Configure Supabase project
```

---

## 🔧 Creating Issues (Two Methods)

### Method 1: Manual (GitHub UI) ✅ Quick

1. Go to https://github.com/leonpagotto/lionpack-studio/issues/new
2. Use template below:
3. Click "Create"

### Method 2: CLI (Faster for batch) 🚀 Recommended

```bash
gh issue create \
  --title "[Auth] Implement GitHub OAuth callback endpoint" \
  --body "**Spec Reference:** docs/specs/PHASE_1_ARCHITECTURE.md - Authentication Flow\n\n**Description:** ...\n\n**Acceptance Criteria:**\n- [ ] Criterion 1\n...\n" \
  --label "phase-1,backend,auth" \
  --project "1"
```

---

## 📋 Epic 1: Infrastructure & Setup

### Issue 1.1: Setup Monorepo Structure

```bash
gh issue create \
  --title "[Infrastructure] Setup monorepo structure with Turbo" \
  --body "**Spec:** PHASE_1_ARCHITECTURE.md - Monorepo Structure

**Description:**
Create the foundational monorepo directory structure and configure Turbo for build orchestration.

**Tasks:**
- Create apps/ subdirectories: web/, api/
- Create packages/ subdirectories: leo-client/, types/
- Initialize turbo.json with build pipeline
- Configure shared TypeScript config
- Setup npm workspaces

**Acceptance Criteria:**
- [ ] All directories created
- [ ] turbo.json configured and builds successfully
- [ ] npm workspaces recognized
- [ ] Can run 'npm run build' from root
- [ ] No TypeScript errors

**Related Issues:** #(other infrastructure issues)
" \
  --label "phase-1,infrastructure,setup"
```

### Issue 1.2: Configure Docker & Dev Environment

```bash
gh issue create \
  --title "[DevOps] Create Docker Compose setup for local development" \
  --body "**Spec:** PHASE_1_ARCHITECTURE.md - Docker & Local Development

**Description:**
Setup Docker Compose with all services (web, api, leo, db) for seamless local development.

**Files to Create:**
- docker-compose.yml
- Dockerfile.web
- Dockerfile.api
- .dockerignore
- docker/.env.example

**Acceptance Criteria:**
- [ ] docker-compose up runs all services
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:3001
- [ ] No build errors or warnings
- [ ] Services auto-restart on failure
- [ ] Volume mounts work for code editing

**Performance:**
- All containers start within 30 seconds
" \
  --label "phase-1,devops,infrastructure"
```

---

## 📋 Epic 2: Authentication (GitHub OAuth)

### Issue 2.1: Supabase Project Setup

```bash
gh issue create \
  --title "[Auth] Setup Supabase project & GitHub OAuth provider" \
  --body "**Spec:** PHASE_1_ARCHITECTURE.md - Authentication Flow

**Description:**
Create and configure Supabase project with GitHub OAuth provider for user authentication.

**Checklist:**
- [ ] Create Supabase project
- [ ] Configure GitHub OAuth provider
  - [ ] Get GitHub OAuth App credentials
  - [ ] Configure redirect URLs:
    - [ ] http://localhost:3000/auth/callback (dev)
    - [ ] https://staging.lionpack.studio/auth/callback (staging)
    - [ ] https://lionpack.studio/auth/callback (prod)
- [ ] Configure JWT secret
- [ ] Enable Auth extension
- [ ] Create users table schema
- [ ] Test OAuth flow manually

**Acceptance Criteria:**
- [ ] Supabase project is accessible
- [ ] GitHub OAuth is configured
- [ ] JWT secret is set
- [ ] Can complete OAuth flow locally
- [ ] User data saved to Supabase
" \
  --label "phase-1,auth,infrastructure"
```

### Issue 2.2: Backend OAuth Callback Handler

```bash
gh issue create \
  --title "[Auth] Implement /auth/callback endpoint (backend)" \
  --body "**Spec:** PHASE_1_API_CONTRACT.md - Authentication Endpoints

**Description:**
Create POST /auth/callback endpoint that handles GitHub OAuth code exchange.

**Endpoint:** POST /auth/callback
**Input:**
\`\`\`json
{
  \"code\": \"github_auth_code_xxx\",
  \"state\": \"state_xxx\"
}
\`\`\`

**Output:**
\`\`\`json
{
  \"success\": true,
  \"token\": \"JWT_TOKEN\",
  \"user\": { \"id\": \"...\", \"email\": \"...\" }
}
\`\`\`

**Implementation:**
- Exchange code with GitHub API
- Create/update user in Supabase
- Generate JWT token
- Return token + user info

**Acceptance Criteria:**
- [ ] Endpoint validates input
- [ ] Successfully exchanges code for token
- [ ] User created in Supabase on first login
- [ ] JWT token is valid
- [ ] Error handling for invalid codes
- [ ] Unit tests (>80% coverage)
" \
  --label "phase-1,backend,auth"
```

### Issue 2.3: Frontend Login Page & OAuth Flow

```bash
gh issue create \
  --title "[Auth] Create login page with GitHub OAuth integration" \
  --body "**Spec:** PHASE_1_ARCHITECTURE.md - Authentication Flow

**Description:**
Build React login page component and handle GitHub OAuth redirect flow.

**UI Components:**
- Login page layout (centered, simple)
- 'Login with GitHub' button
- Error message display
- Loading state

**Logic:**
- Redirect to GET /auth/github on button click
- Handle redirect from GitHub with code
- POST to /auth/callback
- Store JWT in HttpOnly cookie
- Redirect to /editor on success

**Acceptance Criteria:**
- [ ] Login page renders correctly
- [ ] Button redirects to GitHub OAuth
- [ ] Callback handler works
- [ ] JWT stored securely (HttpOnly cookie)
- [ ] Auto-redirect to /editor on success
- [ ] Error display on failure
- [ ] Logout clears session
" \
  --label "phase-1,frontend,auth"
```

---

## 📋 Epic 3: File Operations

### Issue 3.1: Backend File API – GET Endpoint

```bash
gh issue create \
  --title "[Files] Implement GET /api/files/:projectId/*path endpoint" \
  --body "**Spec:** PHASE_1_API_CONTRACT.md - File Operations

**Description:**
Create endpoint to read file or directory contents from project.

**Endpoint:** GET /api/files/:projectId/*path

**Response (File):**
\`\`\`json
{
  \"type\": \"file\",
  \"path\": \"src/index.tsx\",
  \"content\": \"...\",
  \"language\": \"typescript\",
  \"size\": 1024
}
\`\`\`

**Response (Directory):**
\`\`\`json
{
  \"type\": \"directory\",
  \"path\": \"src\",
  \"entries\": [...]
}
\`\`\`

**Acceptance Criteria:**
- [ ] Returns file content for files
- [ ] Lists directory for folders
- [ ] Correct MIME types
- [ ] Handles missing files (404)
- [ ] Auth middleware applied
- [ ] Unit tests
- [ ] Performance: <500ms for typical file
" \
  --label "phase-1,backend,files"
```

### Issue 3.2: Frontend File Tree Component

```bash
gh issue create \
  --title "[Files] Build File Tree React component" \
  --body "**Spec:** PHASE_1_ARCHITECTURE.md - File Operations

**Description:**
Create interactive file tree component for browsing project structure.

**Features:**
- Expand/collapse directories
- File icons by language
- Context menu (new file, delete)
- Keyboard shortcuts (Enter to open)
- Drag-and-drop (future)

**Integration:**
- Fetch from GET /api/files/:projectId/
- Click file → open in editor
- Show loading state

**Acceptance Criteria:**
- [ ] Renders file tree correctly
- [ ] Expand/collapse works
- [ ] Icons display correctly
- [ ] Click opens file in editor
- [ ] Responsive on mobile
- [ ] Accessibility: keyboard navigation
" \
  --label "phase-1,frontend,files"
```

### Issue 3.3: Frontend Monaco Editor Integration

```bash
gh issue create \
  --title "[Editor] Integrate Monaco Editor component" \
  --body "**Spec:** PHASE_1_ARCHITECTURE.md - File Operations

**Description:**
Integrate Monaco Editor for code editing with syntax highlighting and file tabs.

**Features:**
- Syntax highlighting (auto-detect language)
- File tabs (open multiple files)
- Unsaved changes indicator
- Auto-save toggle
- Keyboard shortcuts (Cmd+S to save)

**Integration:**
- Fetch file via GET /api/files/
- Save via POST /api/files/
- Update tab title with unsaved indicator

**Acceptance Criteria:**
- [ ] Editor loads file content
- [ ] Syntax highlighting works
- [ ] Save button works
- [ ] Tab switching works
- [ ] Unsaved indicator shows
- [ ] Performance: <100ms keystroke response
" \
  --label "phase-1,frontend,editor"
```

---

## 📋 Epic 4: Terminal

### Issue 4.1: Backend Terminal WebSocket Server

```bash
gh issue create \
  --title "[Terminal] Setup WebSocket server for terminal operations" \
  --body "**Spec:** PHASE_1_API_CONTRACT.md - Terminal Endpoints

**Description:**
Implement WebSocket endpoint WS /api/terminal/:projectId for real-time terminal access.

**Messages:**
- Client: {type: 'execute', command: 'npm install'}
- Server: {type: 'stdout', data: '...\n'}
- Server: {type: 'exit', code: 0}

**Features:**
- Command execution in sandboxed container
- Real-time output streaming
- Timeout handling (30s default)
- Command history storage

**Acceptance Criteria:**
- [ ] WebSocket connects successfully
- [ ] Commands execute in container
- [ ] Output streams correctly
- [ ] Exit codes returned
- [ ] Timeouts work
- [ ] Auth required to connect
" \
  --label "phase-1,backend,terminal"
```

---

## 🔄 How to Use These Issues

### After Issues are Created:

1. **Add to Project Board**

   ```bash
   gh issue edit <issue-number> --add-project "LionPack MVP"
   ```

2. **Assign Labels** (Already in examples above)
   - `phase-1`: Phase 1 work
   - `backend` / `frontend` / `devops`: Area
   - `auth`, `files`, `terminal`, etc.: Component

3. **Estimate** (Optional, using GitHub labels)
   - Label: `estimate-1d`, `estimate-2d`, etc.

4. **Assign Team Members**

   ```bash
   gh issue edit <issue-number> --assignee "developer-username"
   ```

5. **Create Branch**

   ```bash
   git checkout -b feat/issue-42-auth-callback
   ```

6. **Reference in Commits**

   ```bash
   git commit -m "feat(auth): implement OAuth callback (#42)"
   ```

7. **Create PR**
   - Link to issue
   - Reference issue in PR description
   - PR closes issue automatically on merge

---

## 📋 Full Issue Creation Script (Optional)

To batch-create all Phase 1 issues at once:

```bash
#!/bin/bash
# create-phase-1-issues.sh

# Infrastructure
gh issue create --title "[Infrastructure] Setup monorepo structure" --label "phase-1,infrastructure" --body "..."
gh issue create --title "[DevOps] Create Docker Compose setup" --label "phase-1,devops" --body "..."

# Auth
gh issue create --title "[Auth] Setup Supabase & GitHub OAuth" --label "phase-1,auth,infrastructure" --body "..."
gh issue create --title "[Auth] Implement OAuth callback" --label "phase-1,backend,auth" --body "..."
gh issue create --title "[Auth] Create login page" --label "phase-1,frontend,auth" --body "..."

# Files
gh issue create --title "[Files] Implement GET /api/files" --label "phase-1,backend,files" --body "..."
gh issue create --title "[Files] Build File Tree component" --label "phase-1,frontend,files" --body "..."
gh issue create --title "[Editor] Integrate Monaco Editor" --label "phase-1,frontend,editor" --body "..."

# Terminal
gh issue create --title "[Terminal] Setup WebSocket server" --label "phase-1,backend,terminal" --body "..."

echo "All Phase 1 issues created!"
```

---

## ✅ Next Steps

1. **Team reviews specs** (this week)
2. **Specs approved** by stakeholders
3. **Create issues** from this guide
4. **Assign estimates & team members**
5. **Kickoff sprint** on Monday

---

**Last Updated:** 2025-10-25
**Ready to:** Start Phase 1 development!
