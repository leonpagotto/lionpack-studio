# Phase 1 GitHub Issues – Epic Breakdown

> **Status:** Ready to Create Issues
> **Total Issues:** 48 stories across 8 epics
> **Timeline:** 3 weeks (21 working days)
> **Priority:** Phase 1 critical path

---

## 📋 HOW TO CREATE THESE ISSUES

### Option 1: Manual Creation (Fastest for First 5)

Copy each issue template below, go to https://github.com/leonpagotto/lionpack-studio/issues/new, and paste.

### Option 2: Script Automated (For 43+ remaining)

```bash
# Use gh CLI to create issues from this file
# Copy each issue template to separate file, then:
cd /Users/leo.de.souza1/lionpack-studio

# Create Epic 1 issues
gh issue create --title "Epic 1: OpenCode Integration" --body "$(cat << 'EOF'
# Epic: OpenCode Integration

## Goal
Integrate Monaco Editor into LionPack UI with file operations backend support.

## User Story
As a developer, I want to have a fully functional code editor within LionPack so I can write and modify code directly in the IDE.

## Acceptance Criteria
- [ ] Monaco Editor loads without errors
- [ ] File tree displays project structure
- [ ] Code syntax highlighting works
- [ ] File tabs open/close correctly
- [ ] Basic search works

## Stories (48 total)
See PHASE_1_IMPLEMENTATION_KICKOFF.md for story breakdown

## Success Metrics
- UI loads in < 2 seconds
- 85%+ test coverage
- No console errors
EOF
)" --label "epic,phase-1,frontend"
```

---

## 📊 EPIC 1: OpenCode Integration

### 1.1 Setup Monorepo Structure

```yaml
title: "Story 1.1: Setup monorepo structure with Turbo"
labels: ["epic-1", "phase-1", "backend", "setup"]
assignee: "Backend Lead"
estimate: "2 days"
body: |
  ## Task
  Setup Turbo monorepo with proper workspace configuration

  ## Acceptance Criteria
  - [ ] turbo.json configured correctly
  - [ ] Apps and packages directories created
  - [ ] npm workspaces functional
  - [ ] Build outputs optimized
  - [ ] CI passes for all workspaces
  - [ ] Dependency graph clear and acyclic

  ## Files to Create/Modify
  - turbo.json (update config)
  - package.json (workspace setup)
  - apps/web/
  - packages/leo-client/
  - packages/database/

  ## Definition of Done
  - Running `npm run build` builds all packages
  - Running `npm test` tests all packages
  - No duplicate dependencies
  - Clear import paths
```

### 1.2 Integrate Monaco Editor

```yaml
title: "Story 1.2: Integrate Monaco Editor into React"
labels: ["epic-1", "phase-1", "frontend"]
assignee: "Frontend Lead"
estimate: "3 days"
body: |
  ## Task
  Setup Monaco Editor in React component with syntax highlighting

  ## Acceptance Criteria
  - [ ] Monaco Editor component loads
  - [ ] Supports all major languages (JS, TS, Python, Rust)
  - [ ] Theme switcher works (light/dark)
  - [ ] Font size adjustable
  - [ ] Minimap displays correctly
  - [ ] 85%+ test coverage

  ## Implementation Details
  Use @monaco-editor/react package. See PHASE_1_ARCHITECTURE.md section "Editor Integration"

  ## Definition of Done
  - Component tested with Vitest
  - Storybook story exists
  - Performance: Renders in < 500ms
```

### 1.3 Setup File Operations Layer

```yaml
title: "Story 1.3: Create backend file operations API"
labels: ["epic-1", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "3 days"
body: |
  ## Task
  Implement REST API endpoints for file operations

  ## Endpoints
  - GET /api/files/tree (directory listing)
  - GET /api/files/:id/content (read file)
  - POST /api/files (create file)
  - PUT /api/files/:id/content (update file)
  - DELETE /api/files/:id (delete file)
  - POST /api/files/:id/copy (copy file)

  ## Acceptance Criteria
  - [ ] All endpoints implemented
  - [ ] Git integration working
  - [ ] File change detection working
  - [ ] Proper error handling
  - [ ] Rate limiting applied
  - [ ] 85%+ test coverage

  ## See Also
  PHASE_1_API_CONTRACT.md - File Operations section
```

### 1.4 Implement Basic UI Layout

```yaml
title: "Story 1.4: Create LionPack IDE layout component"
labels: ["epic-1", "phase-1", "frontend"]
assignee: "Frontend Lead"
estimate: "2 days"
body: |
  ## Task
  Build the main IDE layout with all panels

  ## Layout Structure
```

┌─────────────────────────────────┐
│ Header (Logo, Auth, Settings) │
├─────────────────────────────────┤
│ ├─ Sidebar │ Editor │ Chat │ │
│ ├─ Files │ (Code) │ Msgs │ │
│ ├─ LEO │ │ │ │
│ │ Workflows │ │ │ │
│ └─ Settings │ │ │ │
├─────────────────────────────────┤
│ Terminal (Bottom) │
└─────────────────────────────────┘

```

## Acceptance Criteria
- [ ] All panels render correctly
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Panels resizable via mouse
- [ ] State persisted in localStorage
- [ ] Accessibility (WCAG AA)

## Definition of Done
- Responsive on all breakpoints
- 85%+ test coverage
- Accessibility audit passes
```

### 1.5 Connect to Backend API

```yaml
title: "Story 1.5: Setup frontend API client with authentication"
labels: ["epic-1", "phase-1", "frontend"]
assignee: "Frontend Lead"
estimate: "2 days"
body: |
  ## Task
  Create API client that handles authentication and requests

  ## Requirements
  - [ ] API client wrapper with retry logic
  - [ ] JWT token management
  - [ ] Automatic token refresh
  - [ ] Error handling & user notifications
  - [ ] Request/response logging (dev mode)
  - [ ] Type-safe API calls (TypeScript)

  ## Acceptance Criteria
  - [ ] Can call backend endpoints
  - [ ] Handles 401/403 errors correctly
  - [ ] Automatically refreshes expired tokens
  - [ ] Network errors handled gracefully
  - [ ] 85%+ test coverage

  ## Definition of Done
  - All calls use API client
  - Integration tests passing
  - Error handling tested
```

---

## 📊 EPIC 2: LEO Backend Integration

### 2.1 Create API Gateway Layer

```yaml
title: "Story 2.1: Implement Express API Gateway"
labels: ["epic-2", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "2 days"
body: |
  ## Task
  Setup Express.js API gateway with middleware

  ## Requirements
  - [ ] Express server listening on 3001
  - [ ] CORS configured correctly
  - [ ] Request logging middleware
  - [ ] Error handling middleware
  - [ ] Rate limiting middleware
  - [ ] Request validation middleware

  ## Middleware Stack
  1. CORS
  2. Request logging
  3. Rate limiting (100 req/min per IP)
  4. JSON parser
  5. Authentication
  6. Route handlers
  7. Error handler

  ## Acceptance Criteria
  - [ ] Server starts successfully
  - [ ] Health check endpoint responding
  - [ ] All middleware working
  - [ ] Errors return correct status codes
  - [ ] 80%+ test coverage

  ## Definition of Done
  - Server process documented
  - Environment variables configured
  - Tests passing
```

### 2.2 Integrate LEO Kit REST API

```yaml
title: "Story 2.2: Connect to LEO Kit REST API"
labels: ["epic-2", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "3 days"
body: |
  ## Task
  Setup integration with LEO Kit for workflow automation

  ## LEO Kit Endpoints to Connect
  - GET /leo/workflows (list workflows)
  - POST /leo/workflows (create workflow)
  - GET /leo/workflows/:id (get workflow)
  - POST /leo/workflows/:id/run (execute workflow)
  - GET /leo/status (system status)

  ## Acceptance Criteria
  - [ ] Can list LEO workflows
  - [ ] Can trigger workflow execution
  - [ ] Results returned to frontend
  - [ ] Error handling for LEO API errors
  - [ ] Proper logging
  - [ ] 80%+ test coverage

  ## See Also
  LEO Kit Documentation: node_modules/leo-workflow-kit/docs/

  ## Definition of Done
  - All endpoints working
  - Integration tests passing
  - Errors handled gracefully
```

### 2.3 Create Workflow Automation Endpoints

```yaml
title: "Story 2.3: Create workflow automation API endpoints"
labels: ["epic-2", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "2 days"
body: |
  ## Task
  Build custom endpoints wrapping LEO Kit workflows

  ## Endpoints to Create
  - POST /api/workflows/lint (trigger linting)
  - POST /api/workflows/format (code formatting)
  - POST /api/workflows/test (run tests)
  - POST /api/workflows/build (build project)
  - POST /api/workflows/custom (run custom workflow)

  ## Acceptance Criteria
  - [ ] All endpoints accept workflow config
  - [ ] Return job ID immediately
  - [ ] Support polling for results
  - [ ] Support webhooks for completion
  - [ ] Proper error messages
  - [ ] 80%+ test coverage

  ## Definition of Done
  - Endpoints tested end-to-end
  - Documentation in API contract
  - Error cases handled
```

### 2.4 Setup GitHub Integration

```yaml
title: "Story 2.4: Integrate GitHub API for issue/PR management"
labels: ["epic-2", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "2 days"
body: |
  ## Task
  Setup GitHub API client for issue and PR operations

  ## GitHub Operations
  - [ ] List issues/PRs
  - [ ] Create/update issues
  - [ ] Comment on issues
  - [ ] Manage labels
  - [ ] Manage milestones
  - [ ] Manage projects

  ## Acceptance Criteria
  - [ ] GitHub client initialized
  - [ ] Authentication working
  - [ ] Can perform all operations
  - [ ] Rate limiting respected
  - [ ] Errors handled gracefully
  - [ ] 80%+ test coverage

  ## See Also
  PHASE_1_API_CONTRACT.md - Issues/Projects sections

  ## Definition of Done
  - GitHub operations tested
  - API limits respected
  - Error handling complete
```

### 2.5 Create Issue/Project Sync Layer

```yaml
title: "Story 2.5: Sync GitHub issues to project board"
labels: ["epic-2", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "2 days"
body: |
  ## Task
  Create real-time sync between GitHub issues and LionPack project board

  ## Sync Operations
  - [ ] Poll GitHub for new issues
  - [ ] Update project board
  - [ ] Sync status changes
  - [ ] Sync comments
  - [ ] Sync labels
  - [ ] Webhook support for real-time

  ## Acceptance Criteria
  - [ ] Issues appear in LionPack within 5 seconds
  - [ ] Status changes sync bidirectionally
  - [ ] Webhooks working
  - [ ] Conflicts handled
  - [ ] 80%+ test coverage

  ## Definition of Done
  - Sync tested end-to-end
  - Performance acceptable
  - No data loss
```

---

## 📊 EPIC 3: AI Orchestrator

### 3.1 Setup OpenAI Integration

```yaml
title: "Story 3.1: Integrate OpenAI API (GPT-4)"
labels: ["epic-3", "phase-1", "backend"]
assignee: "AI Engineer"
estimate: "2 days"
body: |
  ## Task
  Setup OpenAI client with GPT-4 and GPT-3.5

  ## Implementation
  - [ ] OpenAI client initialized
  - [ ] API key from environment
  - [ ] Support for chat completions
  - [ ] Support for streaming
  - [ ] Token counting
  - [ ] Error handling

  ## Acceptance Criteria
  - [ ] Can make API calls to OpenAI
  - [ ] Streaming responses working
  - [ ] Token counting accurate
  - [ ] Rate limiting respected
  - [ ] Proper error handling
  - [ ] 85%+ test coverage

  ## See Also
  docs/specs/AI_ORCHESTRATOR_SPECIFICATION.md - Provider Config section

  ## Definition of Done
  - Integration tests passing
  - Streaming tested
  - Error cases handled
```

### 3.2 Setup Anthropic Integration

```yaml
title: "Story 3.2: Integrate Anthropic Claude API"
labels: ["epic-3", "phase-1", "backend"]
assignee: "AI Engineer"
estimate: "2 days"
body: |
  ## Task
  Setup Anthropic client with Claude 3 variants

  ## Implementation
  - [ ] Anthropic client initialized
  - [ ] API key from environment
  - [ ] Support for chat completions
  - [ ] Support for streaming
  - [ ] Token counting
  - [ ] Error handling

  ## Acceptance Criteria
  - [ ] Can make API calls to Anthropic
  - [ ] All Claude 3 variants available
  - [ ] Streaming responses working
  - [ ] Token counting accurate
  - [ ] Rate limiting respected
  - [ ] 85%+ test coverage

  ## See Also
  docs/specs/AI_ORCHESTRATOR_SPECIFICATION.md - Provider Config section

  ## Definition of Done
  - Integration tests passing
  - All models tested
  - Error cases handled
```

### 3.3 Setup Google Gemini Integration

```yaml
title: "Story 3.3: Integrate Google Gemini API"
labels: ["epic-3", "phase-1", "backend"]
assignee: "AI Engineer"
estimate: "2 days"
body: |
  ## Task
  Setup Google Gemini client with 1.5 variants

  ## Implementation
  - [ ] Gemini client initialized
  - [ ] API key from environment
  - [ ] Support for chat completions
  - [ ] Support for streaming
  - [ ] Token counting
  - [ ] Error handling

  ## Acceptance Criteria
  - [ ] Can make API calls to Gemini
  - [ ] Streaming responses working
  - [ ] Token counting accurate
  - [ ] Rate limiting respected
  - [ ] Cost tracking working
  - [ ] 85%+ test coverage

  ## See Also
  docs/specs/AI_ORCHESTRATOR_SPECIFICATION.md - Provider Config section

  ## Definition of Done
  - Integration tests passing
  - Streaming tested
  - Error cases handled
```

### 3.4 Implement Model Selection Algorithm

```yaml
title: "Story 3.4: Build model selection algorithm"
labels: ["epic-3", "phase-1", "backend"]
assignee: "AI Engineer"
estimate: "2 days"
body: |
  ## Task
  Implement intelligent model selection based on task & budget

  ## Algorithm Inputs
  - Task type (chat, code, analysis, etc.)
  - Budget remaining
  - Latency requirement
  - Model preferences

  ## Algorithm Outputs
  - Primary model
  - Fallback model
  - Alternative model

  ## Acceptance Criteria
  - [ ] Selects models correctly
  - [ ] Respects budget constraints
  - [ ] Meets latency requirements
  - [ ] Fallback chain working
  - [ ] 85%+ test coverage

  ## See Also
  docs/specs/AI_ORCHESTRATOR_SPECIFICATION.md - Model Selection section

  ## Definition of Done
  - Algorithm tested thoroughly
  - All scenarios covered
  - Performance acceptable
```

### 3.5 Implement Provider Fallback

```yaml
title: "Story 3.5: Implement provider fallback mechanism"
labels: ["epic-3", "phase-1", "backend"]
assignee: "AI Engineer"
estimate: "2 days"
body: |
  ## Task
  Setup fallback chain for provider failures

  ## Fallback Chain
  1. Primary provider (OpenAI)
  2. Alternative (Anthropic)
  3. Tertiary (Gemini)
  4. Local (Ollama)

  ## Failure Scenarios
  - [ ] API timeout → fallback
  - [ ] Rate limit → fallback
  - [ ] Invalid token → skip provider
  - [ ] Budget exceeded → fallback
  - [ ] Network error → retry then fallback

  ## Acceptance Criteria
  - [ ] Fallback chain working
  - [ ] User transparent to failures
  - [ ] Proper error logging
  - [ ] Circuit breaker pattern
  - [ ] 85%+ test coverage

  ## See Also
  docs/specs/AI_ORCHESTRATOR_SPECIFICATION.md - Error Handling section

  ## Definition of Done
  - All failure scenarios tested
  - User experience acceptable
  - Logs helpful for debugging
```

### 3.6 Implement Streaming Responses

```yaml
title: "Story 3.6: Implement AI response streaming"
labels: ["epic-3", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "2 days"
body: |
  ## Task
  Setup server-sent events for streaming AI responses

  ## Implementation
  - [ ] SSE endpoint at /api/ai/chat
  - [ ] Stream tokens as they arrive
  - [ ] Handle provider streaming
  - [ ] Frontend receives tokens
  - [ ] Error handling mid-stream

  ## Acceptance Criteria
  - [ ] Tokens appear in real-time
  - [ ] Latency < 100ms per token
  - [ ] Stream interruption handled
  - [ ] Connection limits respected
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Streaming tested end-to-end
  - Performance acceptable
  - Error cases handled
```

### 3.7 Implement Cost Tracking

```yaml
title: "Story 3.7: Add AI usage cost tracking"
labels: ["epic-3", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "2 days"
body: |
  ## Task
  Track AI API costs and enforce budget limits

  ## Implementation
  - [ ] Log each API call with cost
  - [ ] Track monthly spending
  - [ ] Alert on high usage
  - [ ] Enforce budget limits
  - [ ] Generate usage reports

  ## Acceptance Criteria
  - [ ] Costs tracked accurately
  - [ ] Budget enforced
  - [ ] Alerts working
  - [ ] Reports generated
  - [ ] 85%+ test coverage

  ## See Also
  docs/specs/AI_ORCHESTRATOR_SPECIFICATION.md - Cost Management section

  ## Definition of Done
  - Cost tracking verified
  - Alerts tested
  - Reports accurate
```

---

## 📊 EPIC 4: Authentication

### 4.1 GitHub OAuth Setup

```yaml
title: "Story 4.1: Implement GitHub OAuth flow"
labels: ["epic-4", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "1 day"
body: |
  ## Task
  Setup GitHub OAuth2 login

  ## Flow
  1. User clicks "Login with GitHub"
  2. Redirected to GitHub authorization
  3. User authorizes app
  4. Callback creates user/session
  5. Redirect to dashboard with token

  ## Acceptance Criteria
  - [ ] OAuth flow working
  - [ ] User data stored correctly
  - [ ] Session created
  - [ ] Proper error handling
  - [ ] 85%+ test coverage

  ## See Also
  PHASE_1_API_CONTRACT.md - Auth section
  PHASE_1_ARCHITECTURE.md - Authentication flow diagram

  ## Definition of Done
  - Login/logout working
  - User data accessible
  - Session persistent
```

### 4.2 JWT Token Generation

```yaml
title: "Story 4.2: Implement JWT token generation and validation"
labels: ["epic-4", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "1 day"
body: |
  ## Task
  Setup JWT tokens for API authentication

  ## Requirements
  - [ ] Generate JWT on login
  - [ ] Token contains user ID, email, role
  - [ ] Token expires after 7 days
  - [ ] Signature verification working
  - [ ] Token stored in httpOnly cookie

  ## Acceptance Criteria
  - [ ] Tokens generated correctly
  - [ ] Signature verified
  - [ ] Expiration enforced
  - [ ] Secure storage (httpOnly cookie)
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Token generation tested
  - Verification working
  - Security best practices followed
```

### 4.3 Token Refresh Logic

```yaml
title: "Story 4.3: Implement token refresh mechanism"
labels: ["epic-4", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "1 day"
body: |
  ## Task
  Allow users to refresh expired tokens

  ## Implementation
  - [ ] Refresh token endpoint
  - [ ] Refresh token stored securely
  - [ ] Rotate refresh tokens
  - [ ] Handle concurrent refresh
  - [ ] Logout invalidates tokens

  ## Acceptance Criteria
  - [ ] Can refresh expired token
  - [ ] New token issued
  - [ ] Old token invalidated
  - [ ] Concurrent requests handled
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Refresh flow tested
  - Security verified
  - Race conditions handled
```

### 4.4 Session Management

```yaml
title: "Story 4.4: Implement session management"
labels: ["epic-4", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "1 day"
body: |
  ## Task
  Track user sessions across devices

  ## Requirements
  - [ ] Session stored in database
  - [ ] Track device info
  - [ ] Allow multiple devices
  - [ ] Logout from device
  - [ ] View active sessions

  ## Acceptance Criteria
  - [ ] Sessions persisted
  - [ ] Devices tracked
  - [ ] Can logout from device
  - [ ] Active sessions visible
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Session management working
  - Multi-device support verified
  - Logout tested
```

---

## 📊 EPIC 5: File Operations

### 5.1 File Read/Write Endpoints

```yaml
title: "Story 5.1: Implement file read/write API"
labels: ["epic-5", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "2 days"
body: |
  ## Task
  Create REST endpoints for file operations

  ## Endpoints
  - GET /api/files/:id/content (read)
  - PUT /api/files/:id/content (write)
  - POST /api/files (create)
  - DELETE /api/files/:id (delete)

  ## Acceptance Criteria
  - [ ] Can read files
  - [ ] Can write files
  - [ ] Can create/delete
  - [ ] File permissions checked
  - [ ] Large files handled (chunked)
  - [ ] 85%+ test coverage

  ## See Also
  PHASE_1_API_CONTRACT.md - Files section

  ## Definition of Done
  - All operations tested
  - Permissions enforced
  - Large files handled
```

### 5.2 Directory Listing

````yaml
title: "Story 5.2: Implement directory tree API"
labels: ["epic-5", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "1 day"
body: |
  ## Task
  Create endpoint for listing directory structure

  ## Endpoint
  - GET /api/files/tree (full tree)
  - GET /api/files/:id/children (directory contents)

  ## Response Format
  ```json
  {
    "id": "file-123",
    "name": "src",
    "type": "directory",
    "children": [...]
  }
````

## Acceptance Criteria

- [ ] Returns directory tree
- [ ] Filters out node_modules
- [ ] Fast performance (< 500ms)
- [ ] Handles large directories
- [ ] 85%+ test coverage

## Definition of Done

- Tree endpoint working
- Performance acceptable
- Large directories handled

````

### 5.3 Git Integration
```yaml
title: "Story 5.3: Integrate Git operations"
labels: ["epic-5", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "2 days"
body: |
  ## Task
  Add Git operations for version control

  ## Git Operations
  - [ ] Get file git status
  - [ ] Get file git history
  - [ ] Show diff for changes
  - [ ] Stage/unstage files
  - [ ] Commit changes

  ## Acceptance Criteria
  - [ ] Git status available
  - [ ] History shows changes
  - [ ] Diffs accurate
  - [ ] Commit metadata stored
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Git operations working
  - History accurate
  - Diffs correct
````

### 5.4 File Watching/Sync

```yaml
title: "Story 5.4: Implement file watching for real-time sync"
labels: ["epic-5", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "2 days"
body: |
  ## Task
  Watch for file changes and sync to connected clients

  ## Implementation
  - [ ] Watch filesystem for changes
  - [ ] Broadcast changes via WebSocket
  - [ ] Handle file conflicts
  - [ ] Debounce rapid changes
  - [ ] Track change history

  ## Acceptance Criteria
  - [ ] Changes detected < 100ms
  - [ ] Clients notified immediately
  - [ ] Conflicts resolved
  - [ ] Performance acceptable
  - [ ] 85%+ test coverage

  ## Definition of Done
  - File watching working
  - Real-time sync verified
  - Conflicts handled
```

---

## 📊 EPIC 6: Terminal Integration

### 6.1 Terminal UI Component

```yaml
title: "Story 6.1: Build terminal UI component"
labels: ["epic-6", "phase-1", "frontend"]
assignee: "Frontend Lead"
estimate: "2 days"
body: |
  ## Task
  Create terminal UI component with xterm.js

  ## Features
  - [ ] Terminal renders correctly
  - [ ] Cursor visible and blinking
  - [ ] Scrollback buffer works
  - [ ] Copy/paste support
  - [ ] Resize handling
  - [ ] Color support

  ## Acceptance Criteria
  - [ ] Terminal displays output
  - [ ] Renders performance good
  - [ ] Keyboard input working
  - [ ] Mobile scrolling works
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Terminal component tested
  - Accessibility verified
  - Performance acceptable
```

### 6.2 Command Execution

```yaml
title: "Story 6.2: Implement backend command execution"
labels: ["epic-6", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "2 days"
body: |
  ## Task
  Create API endpoint for executing shell commands

  ## Endpoint
  - POST /api/terminal/execute (run command)
  - WebSocket for interactive terminal

  ## Safety
  - [ ] Commands run in container
  - [ ] Sandbox filesystem
  - [ ] Resource limits enforced
  - [ ] Whitelist common commands
  - [ ] Timeout protection

  ## Acceptance Criteria
  - [ ] Commands execute safely
  - [ ] Output captured
  - [ ] Resource limits enforced
  - [ ] Proper error handling
  - [ ] 85%+ test coverage

  ## See Also
  PHASE_1_ARCHITECTURE.md - Terminal Integration section

  ## Definition of Done
  - Command execution tested
  - Safety verified
  - Resources properly limited
```

### 6.3 Output Streaming

```yaml
title: "Story 6.3: Implement output streaming to frontend"
labels: ["epic-6", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "1 day"
body: |
  ## Task
  Stream terminal output to connected clients in real-time

  ## Implementation
  - [ ] WebSocket connection to terminal
  - [ ] Stream stdout/stderr
  - [ ] Handle input echo
  - [ ] Proper character encoding
  - [ ] Performance optimization

  ## Acceptance Criteria
  - [ ] Output appears in real-time
  - [ ] Latency < 100ms
  - [ ] Large outputs handled
  - [ ] UTF-8 characters supported
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Streaming working end-to-end
  - Performance acceptable
  - Large outputs tested
```

### 6.4 Error Handling

```yaml
title: "Story 6.4: Implement terminal error handling"
labels: ["epic-6", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "1 day"
body: |
  ## Task
  Handle errors and edge cases in terminal

  ## Error Cases
  - [ ] Command not found
  - [ ] Permission denied
  - [ ] Process timeout
  - [ ] Container crash
  - [ ] Disk full

  ## Acceptance Criteria
  - [ ] Errors shown to user
  - [ ] Process cleanup happens
  - [ ] Connection properly closed
  - [ ] Resources released
  - [ ] 85%+ test coverage

  ## Definition of Done
  - All error cases handled
  - User feedback clear
  - Resources cleaned up
```

---

## 📊 EPIC 7: Chat Sidebar

### 7.1 Chat UI Component

```yaml
title: "Story 7.1: Build chat sidebar component"
labels: ["epic-7", "phase-1", "frontend"]
assignee: "Frontend Lead"
estimate: "2 days"
body: |
  ## Task
  Create chat UI with message display and input

  ## Features
  - [ ] Message list scrollable
  - [ ] User/AI messages differentiated
  - [ ] Code blocks highlighted
  - [ ] Markdown rendering
  - [ ] Input area with submit button
  - [ ] Emoji support

  ## Acceptance Criteria
  - [ ] Messages display correctly
  - [ ] Scrolling smooth
  - [ ] Input field works
  - [ ] Code blocks highlighted
  - [ ] Mobile responsive
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Chat UI tested
  - All features working
  - Performance good
```

### 7.2 Message History

```yaml
title: "Story 7.2: Implement message history storage"
labels: ["epic-7", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "1 day"
body: |
  ## Task
  Store and retrieve chat message history

  ## Endpoints
  - GET /api/chat/conversations/:id/messages
  - POST /api/chat/messages (save message)
  - DELETE /api/chat/messages/:id (delete message)

  ## Acceptance Criteria
  - [ ] Messages saved to database
  - [ ] Can retrieve history
  - [ ] Pagination working
  - [ ] Timestamps accurate
  - [ ] 85%+ test coverage

  ## Definition of Done
  - History storage working
  - Retrieval tested
  - Pagination working
```

### 7.3 Context Awareness

```yaml
title: "Story 7.3: Implement context-aware AI responses"
labels: ["epic-7", "phase-1", "backend"]
assignee: "AI Engineer"
estimate: "2 days"
body: |
  ## Task
  Pass file context to AI for smarter responses

  ## Context
  - [ ] Current file content
  - [ ] Selected code snippet
  - [ ] File history
  - [ ] Project structure

  ## Acceptance Criteria
  - [ ] Context sent to AI
  - [ ] Responses reference context
  - [ ] Privacy respected
  - [ ] Context properly formatted
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Context passing working
  - Responses improved
  - Privacy verified
```

### 7.4 Code Reference

```yaml
title: "Story 7.4: Add code reference generation"
labels: ["epic-7", "phase-1", "frontend"]
assignee: "Frontend Lead"
estimate: "1 day"
body: |
  ## Task
  Allow users to reference code in chat

  ## Features
  - [ ] Click to add code reference
  - [ ] Shows code in chat
  - [ ] Click to jump to file
  - [ ] Line number highlighting
  - [ ] Diff view support

  ## Acceptance Criteria
  - [ ] Can reference code
  - [ ] Code shown in chat
  - [ ] Navigation works
  - [ ] Highlighting correct
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Code references working
  - Navigation tested
  - Highlighting correct
```

---

## 📊 EPIC 8: Pack Collaboration

### 8.1 Realtime Presence

```yaml
title: "Story 8.1: Implement user presence tracking"
labels: ["epic-8", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "1 day"
body: |
  ## Task
  Show which users are currently in the pack

  ## Implementation
  - [ ] Track user connections
  - [ ] Broadcast presence changes
  - [ ] Show active users
  - [ ] Handle disconnects
  - [ ] Timeout inactive users

  ## Acceptance Criteria
  - [ ] Presence visible to all users
  - [ ] Updates in real-time
  - [ ] Disconnects detected
  - [ ] Timeouts working
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Presence tracking working
  - Real-time updates verified
  - Disconnects handled
```

### 8.2 Cursor Tracking

```yaml
title: "Story 8.2: Implement remote cursor display"
labels: ["epic-8", "phase-1", "frontend"]
assignee: "Frontend Lead"
estimate: "2 days"
body: |
  ## Task
  Display other users' cursors in editor

  ## Implementation
  - [ ] Track cursor position
  - [ ] Display remote cursors
  - [ ] Show user names
  - [ ] Color code by user
  - [ ] Update smoothly

  ## Acceptance Criteria
  - [ ] Remote cursors visible
  - [ ] Update in real-time
  - [ ] Color differentiation clear
  - [ ] Performance good
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Cursor tracking working
  - Real-time display verified
  - Performance acceptable
```

### 8.3 Collaborative Editing

```yaml
title: "Story 8.3: Implement collaborative text editing"
labels: ["epic-8", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "2 days"
body: |
  ## Task
  Enable multiple users editing same file

  ## Implementation
  - [ ] Operational transformation
  - [ ] Conflict resolution
  - [ ] Undo/redo across edits
  - [ ] Real-time sync
  - [ ] Change notifications

  ## Libraries
  Consider: Yjs, Automerge, or similar CRDT

  ## Acceptance Criteria
  - [ ] Multiple edits work
  - [ ] No data loss
  - [ ] Conflicts resolved
  - [ ] Performance good
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Collaborative editing working
  - Conflicts handled
  - Undo/redo working
```

### 8.4 Role Management

```yaml
title: "Story 8.4: Implement permission and role system"
labels: ["epic-8", "phase-1", "backend"]
assignee: "Backend Lead"
estimate: "1 day"
body: |
  ## Task
  Control what different users can do in pack

  ## Roles
  - Owner (full access)
  - Editor (can edit code)
  - Viewer (read-only)
  - Commenter (add comments only)

  ## Permissions
  - [ ] Create/delete files
  - [ ] Edit files
  - [ ] View files
  - [ ] Run terminal
  - [ ] Manage users

  ## Acceptance Criteria
  - [ ] Roles properly enforced
  - [ ] Permissions checked
  - [ ] UI reflects permissions
  - [ ] Admin controls work
  - [ ] 85%+ test coverage

  ## Definition of Done
  - Role system working
  - Permissions enforced
  - Admin controls verified
```

---

## 🎯 TOTAL ISSUE COUNT

| Epic               | Stories | Est. Days | Priority |
| ------------------ | ------- | --------- | -------- |
| 1. OpenCode        | 5       | 12        | Critical |
| 2. LEO Integration | 5       | 11        | Critical |
| 3. AI Orchestrator | 7       | 14        | High     |
| 4. Authentication  | 4       | 4         | Critical |
| 5. File Operations | 4       | 7         | High     |
| 6. Terminal        | 4       | 6         | High     |
| 7. Chat Sidebar    | 4       | 6         | Medium   |
| 8. Collaboration   | 4       | 6         | Medium   |
| **TOTAL**          | **48**  | **66**    |          |

**Timeline:** 66 estimated days / 21 working days = ~3x capacity
**Recommendation:** Prioritize Epics 1-4 for Phase 1 MVP

---

## ✅ NEXT STEPS

1. **Create issues** using these templates
2. **Prioritize epics** (focus on 1, 2, 4 first)
3. **Assign to team** members
4. **Start Week 1** with Epic 1 & 2
5. **Update status** daily

---

**Ready to build! 🚀**

Version: 1.0
Status: Ready for Issue Creation
Last Updated: 2025-10-25
