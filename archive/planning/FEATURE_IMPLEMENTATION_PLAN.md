# Feature Implementation Plan - LionPack Studio

**Status:** 🔧 In Progress
**Goal:** Connect UI to real functionality
**Estimated Time:** 6-8 hours

---

## 🎯 Current State

**What's Working:**

- ✅ Beautiful VS Code-like UI
- ✅ Static file tree (mock data)
- ✅ Code editor with syntax highlighting
- ✅ AI Chat backend (Gemini API)
- ✅ Terminal component (UI only)

**What's Missing:**

- ❌ Real file system integration
- ❌ Menu bar actions (File, Edit, View, etc.)
- ❌ Terminal execution
- ❌ GitHub integration
- ❌ Settings panel
- ❌ File tree operations (create, delete, rename)

---

## 📋 Implementation Phases

### Phase 1: File System Integration (2 hours)

**Goal:** Replace mock file tree with real file system

**Tasks:**

1. ✅ Create File System API (`/api/files`)
2. ✅ List directory contents
3. ✅ Read file contents
4. ✅ Write file contents
5. ✅ Create files/folders
6. ✅ Delete files/folders
7. ✅ Rename files/folders

**API Endpoints:**

```typescript
GET    /api/files?path=/          // List directory
GET    /api/files/read?path=...   // Read file
POST   /api/files/write           // Write file
POST   /api/files/create          // Create file/folder
DELETE /api/files?path=...        // Delete file/folder
PUT    /api/files/rename          // Rename file/folder
```

**Files to Create:**

- `apps/web/pages/api/files/index.ts` - List & delete
- `apps/web/pages/api/files/read.ts` - Read file
- `apps/web/pages/api/files/write.ts` - Write file
- `apps/web/pages/api/files/create.ts` - Create file/folder
- `apps/web/pages/api/files/rename.ts` - Rename file/folder

---

### Phase 2: Menu Bar Actions (1.5 hours)

**Goal:** Make File, Edit, View, etc. menus functional

**File Menu:**

- [ ] Open Folder (file picker dialog)
- [ ] New File (create in current folder)
- [ ] Save (write current file)
- [ ] Save As (write to new path)
- [ ] Close File (close active tab)

**Edit Menu:**

- [ ] Undo/Redo (integrate with CodeEditor)
- [ ] Cut/Copy/Paste (use clipboard API)
- [ ] Find (search in file)
- [ ] Replace (find & replace)

**View Menu:**

- [ ] Toggle Sidebar
- [ ] Toggle Bottom Panel
- [ ] Toggle AI Chat
- [ ] Zoom In/Out

**Go Menu:**

- [ ] Go to File (quick open)
- [ ] Go to Line
- [ ] Go to Symbol

**Run Menu:**

- [ ] Run File (execute in terminal)
- [ ] Run Tests
- [ ] Debug

**Terminal Menu:**

- [ ] New Terminal
- [ ] Split Terminal
- [ ] Clear Terminal

**Implementation:**

- Create `components/MenuBar.tsx`
- Add dropdown menus with keyboard shortcuts
- Connect to actual functionality

---

### Phase 3: Terminal Integration (1.5 hours)

**Goal:** Real terminal execution

**Options:**

**Option A: Server-Side Terminal (Recommended)**

- Use `node-pty` for pseudo-terminal
- WebSocket for real-time communication
- Full shell capabilities

**Option B: Command Execution**

- Simple command execution
- Return stdout/stderr
- No interactive shell

**Tasks:**

1. [ ] Create WebSocket server for terminal
2. [ ] Integrate `node-pty`
3. [ ] Handle terminal input/output
4. [ ] Support multiple terminal instances
5. [ ] Persist terminal state

**Files to Create:**

- `apps/web/pages/api/terminal/create.ts` - Create terminal session
- `apps/web/pages/api/terminal/execute.ts` - Execute command
- `apps/web/lib/terminal-manager.ts` - Terminal session manager

---

### Phase 4: GitHub Integration (1 hour)

**Goal:** Connect GitHub actions to UI

**Tasks:**

- [ ] Clone Repository
- [ ] Pull Changes
- [ ] Commit & Push
- [ ] Create Branch
- [ ] View Commits
- [ ] Open PR

**Already Implemented:**

- ✅ GitHub OAuth (`/api/auth/github/*`)
- ✅ GitHub API client (`packages/leo-client/src/github-client.ts`)

**Integration Points:**

- Add GitHub icon to sidebar
- Show repository status
- Git operations in menu bar

---

### Phase 5: Settings Panel (30 minutes)

**Goal:** User preferences and configuration

**Settings:**

- [ ] Theme (dark/light)
- [ ] Font size
- [ ] Tab size
- [ ] Auto-save
- [ ] AI Provider (Gemini/Claude/GPT)
- [ ] API Keys
- [ ] GitHub Token

**Implementation:**

- Modal dialog for settings
- LocalStorage for persistence
- Context provider for global state

---

### Phase 6: File Tree Operations (1 hour)

**Goal:** Context menu and drag-drop

**Features:**

- [ ] Right-click context menu
- [ ] Create new file/folder
- [ ] Rename file/folder
- [ ] Delete file/folder
- [ ] Copy/paste
- [ ] Drag & drop to move

**Implementation:**

- Add context menu to FileTree
- Connect to File System API
- Add confirmation dialogs

---

## 🚀 Quick Wins (Priority Order)

**1. File System Integration** (Highest Value)

- Users can open real projects
- Load actual code files
- Save changes

**2. Terminal Execution** (High Value)

- Run commands
- Execute scripts
- Build projects

**3. Menu Bar Actions** (Medium Value)

- Professional feel
- Keyboard shortcuts
- Power user features

**4. File Tree Operations** (Medium Value)

- Create/delete files
- Project management
- Better workflow

**5. Settings Panel** (Lower Value)

- Customization
- Preferences
- Nice-to-have

**6. GitHub Integration** (Lower Value - Already have LEO)

- Nice addition
- Visual git operations
- Complements LEO workflow

---

## 📦 Dependencies Needed

```bash
# Terminal support
npm install node-pty ws

# File system watching
npm install chokidar

# Git operations
npm install simple-git

# File dialogs (if needed)
npm install electron-dialog
```

---

## 🎯 Recommended Approach

**Phase 1 (Today): Core Functionality**

1. ✅ File System API (2 hours)
2. ✅ Connect FileTree to real files (30 min)
3. ✅ Connect CodeEditor to real files (30 min)
4. ✅ Save functionality (30 min)

**Phase 2 (Tomorrow): Terminal & Menu**

1. ✅ Terminal execution (1.5 hours)
2. ✅ Basic menu bar actions (1 hour)

**Phase 3 (Later): Polish**

1. ✅ File tree operations (1 hour)
2. ✅ Settings panel (30 min)
3. ✅ GitHub UI (1 hour)

---

## 🧪 Testing Strategy

**For Each Feature:**

1. Manual testing in browser
2. Unit tests for API endpoints
3. Integration tests for workflows
4. E2E tests for critical paths

**Critical User Flows:**

1. Open folder → See files → Open file → Edit → Save
2. Open terminal → Run command → See output
3. Create file → Edit → Save → Commit (LEO)

---

## ⚠️ Important Considerations

**Security:**

- ❗ File system access is DANGEROUS
- ❗ Limit to specific workspace directory
- ❗ Validate all paths (prevent directory traversal)
- ❗ Sanitize terminal commands

**Performance:**

- Use debouncing for file watchers
- Lazy load file tree (don't load entire tree)
- Stream large files
- Cache file contents

**User Experience:**

- Show loading states
- Error messages for failures
- Confirmation for destructive actions
- Keyboard shortcuts for power users

---

## 🎬 Let's Start!

**Immediate Next Steps:**

1. **Create File System API**
   - `/api/files/*` endpoints
   - Safe file operations
   - Path validation

2. **Wire Up FileTree**
   - Load real directory
   - Click to open files
   - Show actual content

3. **Connect CodeEditor**
   - Display real file content
   - Save changes to disk
   - Auto-save option

**Want me to:**

- ✅ Start implementing Phase 1 (File System)?
- ✅ Create the API endpoints?
- ✅ Wire up the components?

**Let's build the real thing! 🚀**
