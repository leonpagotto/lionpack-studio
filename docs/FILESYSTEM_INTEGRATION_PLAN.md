# Filesystem Integration Plan - Leveraging Existing Code

**Story 3.11 Phase 2: GitHub Integration**
**Date:** 2025-10-26
**Strategy:** Maximize code reuse from KiloEditor components

---

## 🎯 Objective

Extend the existing FileTree and EditorContext to work with **real filesystem data** (local browser + GitHub repos) rather than mock/generated files.

---

## 📦 Existing Components Audit

### ✅ What We Already Have (Reusable)

#### 1. **FileTree Component** (`apps/web/components/KiloEditor/FileTree.tsx`)

- **120 LOC** - Already implemented
- **Features:**
  - Hierarchical file/directory display
  - Expand/collapse functionality
  - File icons by language
  - Active file highlighting
  - Click to select file
  - Recursively renders `FileNode` children

**Current Interface:**

```typescript
export interface FileNode {
  path: string;
  content: string;
  language: string;
  isDirectory?: boolean;
  children?: FileNode[];
}
```

**Reuse Strategy:**

- ✅ Keep the UI component exactly as is
- ✅ Extend `FileNode` to support filesystem metadata
- ✅ Adapt data source from mock to real filesystem

---

#### 2. **EditorContext** (`apps/web/context/EditorContext.tsx`)

- **120 LOC** - Already implemented
- **Features:**
  - Central state management for files
  - Active file selection
  - Test results tracking
  - Loading states

**Current Interface:**

```typescript
export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface EditorContextType {
  files: GeneratedFile[];
  activeFile: GeneratedFile | null;
  selectFile: (file: GeneratedFile) => void;
  setFiles: (files: GeneratedFile[]) => void;
  // ... test results, etc.
}
```

**Reuse Strategy:**

- ✅ Extend `GeneratedFile` → `FilesystemFile` with metadata
- ✅ Add filesystem source tracking (local vs GitHub)
- ✅ Add file operations (create, delete, rename)
- ✅ Keep existing test result tracking

---

#### 3. **CodeEditor** (`apps/web/components/KiloEditor/CodeEditor.tsx`)

- **150 LOC** - Already implemented
- **Features:**
  - Syntax highlighting (basic)
  - Line numbers
  - File metadata display (size, language, lines)
  - Loading state

**Reuse Strategy:**

- ✅ Keep as-is for Phase 2
- 🔮 Future: Upgrade to Monaco Editor for full IDE features

---

#### 4. **GitHub OAuth** (`packages/leo-client/src/lib/github-oauth.ts`)

- **300 LOC** - Already implemented
- **Features:**
  - Exchange OAuth code for access token
  - Get GitHub user info
  - Get user emails
  - Session management

**Reuse Strategy:**

- ✅ Use existing `getGitHubUser()` for profile
- ✅ Extend with repository access methods
- ✅ Add token storage for GitHub API calls

---

## 🔧 What We Need to Build (Phase 2)

### 1. **Extend LocalFileSystem** (Already Done in Phase 1) ✅

- ✅ Interface defined
- ✅ Browser File System Access API implementation
- ✅ Error normalization
- ✅ Unit tests (85.27% coverage)

---

### 2. **GitHubFileSystem** (NEW - Phase 2)

**Purpose:** Read/write files from GitHub repos via REST API

**Implementation:**

```typescript
// packages/leo-client/src/lib/filesystem/github-filesystem.ts
import { Filesystem, FilesystemResult, FileSystemEntry } from "./types";

export interface GitHubFilesystemConfig {
  owner: string;
  repo: string;
  branch?: string;
  accessToken: string;
}

export class GitHubFileSystem implements Filesystem {
  private owner: string;
  private repo: string;
  private branch: string;
  private token: string;

  constructor(config: GitHubFilesystemConfig) {
    this.owner = config.owner;
    this.repo = config.repo;
    this.branch = config.branch || "main";
    this.token = config.accessToken;
  }

  supports(): boolean {
    return !!this.token;
  }

  async listDirectory(
    path: string
  ): Promise<FilesystemResult<FileSystemEntry[]>> {
    // GET /repos/{owner}/{repo}/contents/{path}
    // Returns array of files/dirs with SHA, size, type
  }

  async readFile(
    path: string,
    options?: ReadFileOptions
  ): Promise<FilesystemResult<string | Uint8Array>> {
    // GET /repos/{owner}/{repo}/contents/{path}
    // Decode base64 content
  }

  async writeFile(
    path: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<FilesystemResult<void>> {
    // PUT /repos/{owner}/{repo}/contents/{path}
    // Requires commit message, SHA (if updating existing)
  }

  async createFile(
    path: string,
    data?: string | Uint8Array
  ): Promise<FilesystemResult<void>> {
    // PUT with no SHA (new file only)
  }

  async deleteEntry(
    path: string,
    options?: DeleteEntryOptions
  ): Promise<FilesystemResult<void>> {
    // DELETE /repos/{owner}/{repo}/contents/{path}
    // Requires SHA, commit message
  }

  async renameEntry(
    src: string,
    dest: string,
    options?: RenameEntryOptions
  ): Promise<FilesystemResult<void>> {
    // Copy to new path + delete old (GitHub has no native rename)
  }

  // GitHub-specific helpers
  async getFileSHA(path: string): Promise<string | null>;
  async commit(
    message: string,
    changes: FileChange[]
  ): Promise<FilesystemResult<string>>;
  async createPullRequest(
    title: string,
    body: string,
    head: string
  ): Promise<FilesystemResult<string>>;
}
```

**Key Dependencies:**

- Use existing `github-oauth.ts` for token management
- Leverage GitHub REST API: https://docs.github.com/en/rest/repos/contents

---

### 3. **Extend EditorContext for Real Filesystem**

**New Interface:**

```typescript
// apps/web/context/EditorContext.tsx (extended)
export interface FilesystemFile extends GeneratedFile {
  // From GeneratedFile
  path: string;
  content: string;
  language: string;

  // NEW: Filesystem metadata
  source: "local" | "github";
  size?: number;
  lastModified?: number;
  sha?: string; // GitHub file SHA
  isDirty?: boolean; // Has unsaved changes
  isLoading?: boolean;
}

export interface FilesystemSource {
  type: "local" | "github";
  name: string;
  filesystem: Filesystem;
}

export interface EditorContextType {
  // Existing
  files: FilesystemFile[];
  activeFile: FilesystemFile | null;
  selectFile: (file: FilesystemFile) => void;

  // NEW: Filesystem operations
  sources: FilesystemSource[];
  activeSource: FilesystemSource | null;
  setActiveSource: (source: FilesystemSource) => void;

  // File operations
  createFile: (path: string, content?: string) => Promise<void>;
  saveFile: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;

  // Directory operations
  listDirectory: (path: string) => Promise<void>;
  refreshFiles: () => Promise<void>;

  // GitHub-specific
  connectGitHub: (
    owner: string,
    repo: string,
    branch?: string
  ) => Promise<void>;
  disconnectGitHub: () => void;
  commitChanges: (message: string) => Promise<void>;
  createPR: (title: string, body: string) => Promise<void>;
}
```

---

### 4. **Filesystem Service Layer**

**Purpose:** Abstract filesystem operations from UI

```typescript
// packages/leo-client/src/lib/filesystem/filesystem-service.ts
export class FilesystemService {
  private localFS: LocalFileSystem;
  private githubFS: GitHubFileSystem | null;

  constructor() {
    this.localFS = new LocalFileSystem();
    this.githubFS = null;
  }

  async requestLocalAccess(): Promise<void> {
    await this.localFS.requestRoot();
  }

  async connectGitHub(
    owner: string,
    repo: string,
    token: string
  ): Promise<void> {
    this.githubFS = new GitHubFileSystem({ owner, repo, accessToken: token });
  }

  async listFiles(
    source: "local" | "github",
    path: string
  ): Promise<FileSystemEntry[]> {
    const fs = source === "local" ? this.localFS : this.githubFS;
    if (!fs) throw new Error("Filesystem not initialized");

    const result = await fs.listDirectory(path);
    if (!result.ok) throw new Error(result.error?.message);
    return result.value!;
  }

  async readFile(source: "local" | "github", path: string): Promise<string> {
    // Similar pattern
  }

  async writeFile(
    source: "local" | "github",
    path: string,
    content: string
  ): Promise<void> {
    // Similar pattern
  }

  // ... other operations
}
```

---

### 5. **FileTree Integration**

**Adapt FileTree to use real filesystem:**

```typescript
// apps/web/components/KiloEditor/FileTree.tsx (extended)
interface FileTreeProps {
  files: FileNode[] // Keep existing interface
  activeFile?: string
  onSelectFile: (file: FileNode) => void

  // NEW: Filesystem operations
  onCreateFile?: (parentPath: string) => void
  onCreateDirectory?: (parentPath: string) => void
  onDeleteEntry?: (path: string) => void
  onRenameEntry?: (path: string) => void
  onRefresh?: () => void
}

// Add context menu for file operations
const FileTreeNode = ({ node, onContextMenu }) => {
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onContextMenu?.({
      x: e.clientX,
      y: e.clientY,
      actions: [
        { label: 'New File', onClick: () => onCreateFile(node.path) },
        { label: 'New Folder', onClick: () => onCreateDirectory(node.path) },
        { label: 'Rename', onClick: () => onRenameEntry(node.path) },
        { label: 'Delete', onClick: () => onDeleteEntry(node.path) },
      ]
    })
  }

  return <div onContextMenu={handleRightClick}>...</div>
}
```

---

## 🎨 UI Integration Flow

### User Story: Browse Local Files

```
1. User clicks "Open Local Folder" button
   ↓
2. EditorContext.requestLocalAccess()
   ↓
3. Browser shows directory picker (File System Access API)
   ↓
4. LocalFileSystem.requestRoot() stores handle
   ↓
5. EditorContext.listDirectory('') to get root files
   ↓
6. Convert FileSystemEntry[] → FileNode[] for FileTree
   ↓
7. FileTree renders with expand/collapse
   ↓
8. User clicks file → EditorContext.selectFile()
   ↓
9. LocalFileSystem.readFile() gets content
   ↓
10. CodeEditor displays content
```

### User Story: Browse GitHub Repo

```
1. User authenticates with GitHub OAuth (existing flow)
   ↓
2. User enters owner/repo/branch
   ↓
3. EditorContext.connectGitHub(owner, repo, branch)
   ↓
4. GitHubFileSystem initialized with token
   ↓
5. EditorContext.listDirectory('') to get repo root
   ↓
6. GitHub API: GET /repos/{owner}/{repo}/contents
   ↓
7. Convert GitHub response → FileNode[] for FileTree
   ↓
8. FileTree renders (same UI as local!)
   ↓
9. User clicks file → EditorContext.selectFile()
   ↓
10. GitHubFileSystem.readFile() decodes base64
    ↓
11. CodeEditor displays content
```

---

## 🧪 Testing Strategy

### Unit Tests (Packages)

**LocalFileSystem** ✅ Done (29 tests, 85.27% coverage)

**GitHubFileSystem** (NEW)

- Mock `fetch` for GitHub API calls
- Test success paths (list, read, write, delete)
- Test error handling (404, 403, rate limit)
- Test base64 encoding/decoding
- Test SHA management for updates
- **Target:** 80%+ coverage

**FilesystemService** (NEW)

- Test switching between local/GitHub sources
- Test error propagation
- Mock both filesystem implementations
- **Target:** 80%+ coverage

### Integration Tests (Apps/Web)

**EditorContext + FileTree**

- Test file selection updates active file
- Test directory expansion
- Test context menu actions
- Mock filesystem service

**GitHub OAuth + Filesystem**

- Test token retrieval
- Test authenticated API calls
- Mock GitHub responses

### E2E Tests (Optional Phase 3)

- Open local folder → browse → edit → save
- Connect GitHub repo → browse → edit → commit
- Switch between local and GitHub sources

---

## 📦 Implementation Phases

### Phase 2.1: GitHub Filesystem Layer (Current)

- ✅ Create `GitHubFileSystem` class
- ✅ Implement all `Filesystem` interface methods
- ✅ Add unit tests (80%+ coverage)
- ✅ Document GitHub API patterns

### Phase 2.2: Service Layer Integration

- ✅ Create `FilesystemService` wrapper
- ✅ Add source switching logic
- ✅ Wire into EditorContext
- ✅ Add filesystem state management

### Phase 2.3: UI Integration

- ✅ Add "Open Local Folder" button
- ✅ Add "Connect GitHub Repo" modal
- ✅ Wire FileTree to real filesystem
- ✅ Add context menu for file operations
- ✅ Add loading states

### Phase 2.4: File Operations

- ✅ Implement create/delete/rename in UI
- ✅ Add unsaved changes tracking
- ✅ Add save confirmation dialogs
- ✅ Test all CRUD operations

---

## 🔮 Future Enhancements (Phase 3+)

### Monaco Editor Integration

- Replace basic CodeEditor with Monaco
- Full IntelliSense, autocomplete, refactoring
- Multi-cursor editing
- Diff view for changes

### Real-time Collaboration

- Yjs + WebRTC for multi-user editing
- Cursor presence
- Conflict resolution

### Advanced GitHub Features

- Pull request creation
- Branch switching
- Commit history
- File blame view

---

## 📊 Code Reuse Metrics

| Component          | Existing LOC | New LOC | Reuse % |
| ------------------ | ------------ | ------- | ------- |
| FileTree           | 120          | 30      | 80%     |
| EditorContext      | 120          | 80      | 60%     |
| CodeEditor         | 150          | 0       | 100%    |
| GitHub OAuth       | 300          | 50      | 86%     |
| **Total Frontend** | **690**      | **160** | **81%** |
| LocalFileSystem    | 200 (done)   | 0       | 100%    |
| GitHubFileSystem   | 0            | 250     | NEW     |
| FilesystemService  | 0            | 150     | NEW     |
| **Total Backend**  | **200**      | **400** | **33%** |
| **Grand Total**    | **890**      | **560** | **61%** |

**Result:** ~61% code reuse across the entire filesystem integration!

---

## 🎯 Success Criteria

### Phase 2 Complete When:

- ✅ User can browse local folders via File System Access API
- ✅ User can browse GitHub repos via OAuth + REST API
- ✅ FileTree displays real filesystem hierarchy
- ✅ CodeEditor shows real file content
- ✅ User can switch between local and GitHub sources
- ✅ Basic file operations work (read, list)
- ✅ All new code has 80%+ test coverage
- ✅ No breaking changes to existing UI components

---

## 📚 References

**Existing Code:**

- `apps/web/components/KiloEditor/FileTree.tsx`
- `apps/web/components/KiloEditor/CodeEditor.tsx`
- `apps/web/context/EditorContext.tsx`
- `packages/leo-client/src/lib/github-oauth.ts`
- `packages/leo-client/src/lib/filesystem/local-filesystem.ts`

**APIs:**

- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [GitHub REST API - Contents](https://docs.github.com/en/rest/repos/contents)
- [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)

---

## 10. AI Agent File Operations via Morphic Chat

**Critical Integration: Conversational File Manipulation**

The Morphic chat interface will serve as the primary AI agent interaction layer for filesystem operations, enabling developers to manipulate files through natural language commands.

### 10.1 AI Agent Command Patterns

**Chat Commands for File Operations:**

```typescript
// User chat examples:
"Create a new React component called Button in components/ui/";
"Delete the old test file in __tests__/legacy/";
"Move all .css files from styles/ to assets/styles/";
"Rename user-profile.tsx to UserProfile.tsx";
"Create a new folder structure: src/features/auth/{components,hooks,utils}";
```

### 10.2 Tool-Based Architecture

**Extend ChatContainer with Filesystem Tools:**

```typescript
// apps/web/components/MorphicChat/ChatContainer.tsx (Enhanced)

interface FilesystemTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (params: any) => Promise<FilesystemResult<any>>;
}

const filesystemTools: FilesystemTool[] = [
  {
    name: "create_file",
    description: "Create a new file with specified content",
    parameters: {
      path: { type: "string", required: true },
      content: { type: "string", required: true },
      overwrite: { type: "boolean", default: false },
    },
    handler: async ({ path, content, overwrite }) => {
      const filesystem = useFilesystemService();
      return filesystem.createFile(path, content, { overwrite });
    },
  },
  {
    name: "delete_file",
    description: "Delete a file or directory",
    parameters: {
      path: { type: "string", required: true },
      recursive: { type: "boolean", default: false },
    },
    handler: async ({ path, recursive }) => {
      const filesystem = useFilesystemService();
      return filesystem.deleteEntry(path, { recursive });
    },
  },
  {
    name: "move_file",
    description: "Move or rename a file/directory",
    parameters: {
      oldPath: { type: "string", required: true },
      newPath: { type: "string", required: true },
    },
    handler: async ({ oldPath, newPath }) => {
      const filesystem = useFilesystemService();
      return filesystem.renameEntry(oldPath, newPath);
    },
  },
  {
    name: "read_file",
    description: "Read file contents",
    parameters: {
      path: { type: "string", required: true },
      encoding: { type: "string", default: "utf-8" },
    },
    handler: async ({ path, encoding }) => {
      const filesystem = useFilesystemService();
      return filesystem.readFile(path, { encoding });
    },
  },
  {
    name: "list_directory",
    description: "List contents of a directory",
    parameters: {
      path: { type: "string", required: true },
    },
    handler: async ({ path }) => {
      const filesystem = useFilesystemService();
      return filesystem.listDirectory(path);
    },
  },
  {
    name: "create_directory",
    description: "Create a new directory (recursive)",
    parameters: {
      path: { type: "string", required: true },
    },
    handler: async ({ path }) => {
      const filesystem = useFilesystemService();
      // Create a placeholder .gitkeep file to create directory structure
      return filesystem.createFile(`${path}/.gitkeep`, "", { recursive: true });
    },
  },
];
```

### 10.3 AI Agent Integration Layer

**New File: `packages/leo-client/src/lib/ai-agent/filesystem-agent.ts`**

```typescript
import { Filesystem, FilesystemResult } from "../filesystem/types";
import { FilesystemService } from "../filesystem/filesystem-service";

/**
 * AI Agent filesystem operations handler.
 * Parses natural language commands and executes filesystem operations.
 */
export class FilesystemAgent {
  constructor(private filesystemService: FilesystemService) {}

  /**
   * Execute filesystem operation from AI agent command.
   *
   * @example
   * await agent.execute({
   *   action: "create_file",
   *   parameters: { path: "Button.tsx", content: "..." }
   * });
   */
  async execute(command: {
    action: string;
    parameters: Record<string, any>;
  }): Promise<FilesystemResult<any>> {
    switch (command.action) {
      case "create_file":
        return this.filesystemService.createFile(
          command.parameters.path,
          command.parameters.content,
          {
            overwrite: command.parameters.overwrite,
            recursive: true, // AI agents always create parent dirs
          }
        );

      case "delete_file":
      case "delete_directory":
        return this.filesystemService.deleteEntry(command.parameters.path, {
          recursive: command.parameters.recursive ?? true,
        });

      case "move_file":
      case "rename_file":
        return this.filesystemService.renameEntry(
          command.parameters.oldPath,
          command.parameters.newPath
        );

      case "read_file":
        return this.filesystemService.readFile(command.parameters.path, {
          encoding: command.parameters.encoding ?? "utf-8",
        });

      case "list_directory":
        return this.filesystemService.listDirectory(command.parameters.path);

      case "create_directory":
        // Create directory by writing a .gitkeep file
        return this.filesystemService.createFile(
          `${command.parameters.path}/.gitkeep`,
          "",
          { recursive: true }
        );

      default:
        return {
          ok: false,
          error: {
            code: "UNKNOWN",
            message: `Unknown filesystem action: ${command.action}`,
          },
        };
    }
  }

  /**
   * Batch execute multiple filesystem operations.
   * Useful for AI agents performing complex refactoring.
   */
  async executeBatch(
    commands: Array<{
      action: string;
      parameters: Record<string, any>;
    }>
  ): Promise<FilesystemResult<any[]>> {
    const results = [];

    for (const command of commands) {
      const result = await this.execute(command);

      if (!result.ok) {
        // Fail-fast on first error
        return {
          ok: false,
          error: {
            code: result.error!.code,
            message: `Failed at command ${results.length + 1}: ${result.error!.message}`,
          },
        };
      }

      results.push(result.value);
    }

    return { ok: true, value: results };
  }

  /**
   * Validate filesystem operation before execution.
   * Used for AI agent confirmation prompts.
   */
  async validate(command: {
    action: string;
    parameters: Record<string, any>;
  }): Promise<{
    valid: boolean;
    warnings?: string[];
    confirmationRequired?: boolean;
  }> {
    const warnings: string[] = [];
    let confirmationRequired = false;

    // Check for destructive operations
    if (["delete_file", "delete_directory"].includes(command.action)) {
      confirmationRequired = true;
      warnings.push("This will permanently delete the file/directory");
    }

    // Check for overwrites
    if (command.action === "create_file" && command.parameters.overwrite) {
      confirmationRequired = true;
      warnings.push("This will overwrite an existing file");
    }

    // Check for moves that could break imports
    if (["move_file", "rename_file"].includes(command.action)) {
      warnings.push("This may break imports/references in other files");
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      confirmationRequired,
    };
  }
}
```

### 10.4 Morphic Chat Integration

**Update `ChatContainer.tsx` to Support Filesystem Tools:**

```typescript
// apps/web/components/MorphicChat/ChatContainer.tsx

import { FilesystemAgent } from '@/packages/leo-client/src/lib/ai-agent/filesystem-agent';
import { useFilesystemService } from '@/apps/web/context/FilesystemContext';

const ChatContainer: React.FC<ChatContainerProps> = ({ ... }) => {
  const filesystemService = useFilesystemService();
  const filesystemAgent = useMemo(
    () => new FilesystemAgent(filesystemService),
    [filesystemService]
  );

  const handleAIToolCall = useCallback(
    async (toolCall: { name: string; arguments: Record<string, any> }) => {
      // Map AI tool calls to filesystem operations
      const actionMap: Record<string, string> = {
        create_file: "create_file",
        delete_file: "delete_file",
        move_file: "move_file",
        read_file: "read_file",
        list_directory: "list_directory"
      };

      const action = actionMap[toolCall.name];
      if (!action) return;

      // Validate operation first
      const validation = await filesystemAgent.validate({
        action,
        parameters: toolCall.arguments
      });

      // Show confirmation dialog for destructive operations
      if (validation.confirmationRequired) {
        const confirmed = await showConfirmationDialog({
          title: `Confirm ${action}`,
          message: validation.warnings?.join('\n') || '',
          confirmText: 'Proceed',
          cancelText: 'Cancel'
        });

        if (!confirmed) {
          return { ok: false, error: { code: 'EACCES', message: 'User cancelled operation' } };
        }
      }

      // Execute filesystem operation
      const result = await filesystemAgent.execute({
        action,
        parameters: toolCall.arguments
      });

      // Update UI with result
      if (result.ok) {
        addSystemMessage(`✅ Successfully executed: ${action} ${toolCall.arguments.path || ''}`);

        // Refresh file tree if needed
        if (onFilesystemChange) {
          onFilesystemChange();
        }
      } else {
        addSystemMessage(`❌ Error: ${result.error!.message}`);
      }

      return result;
    },
    [filesystemAgent, onFilesystemChange]
  );

  // Modify handleSendMessage to process tool calls from AI response
  const handleSendMessage = useCallback(async (content: string) => {
    // ... existing code ...

    // After receiving AI response, check for tool calls
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: content,
        tools: filesystemTools.map(t => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters
        }))
      })
    });

    // Parse streaming response for tool calls
    if (data.type === 'tool_call') {
      await handleAIToolCall(data.toolCall);
    }
  }, [apiEndpoint, handleAIToolCall]);
};
```

### 10.5 UX Patterns for AI File Operations

**Confirmation Dialogs:**

```typescript
// apps/web/components/MorphicChat/ConfirmationDialog.tsx

interface ConfirmationDialogProps {
  action: string;
  path: string;
  warnings: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  action, path, warnings, onConfirm, onCancel
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 max-w-md">
      <h3 className="text-lg font-semibold mb-2">
        Confirm {action}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Path: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{path}</code>
      </p>

      {warnings.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-4">
          <ul className="text-sm space-y-1">
            {warnings.map((warning, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">⚠️</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm border rounded hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);
```

**System Messages for Filesystem Operations:**

```typescript
// Display AI file operation feedback in chat
interface SystemMessage extends Message {
  type: 'system';
  icon: '✅' | '❌' | '⚠️' | 'ℹ️';
  category: 'success' | 'error' | 'warning' | 'info';
}

// Example system messages:
{
  type: 'system',
  icon: '✅',
  category: 'success',
  content: 'Created file: components/ui/Button.tsx (234 bytes)'
}

{
  type: 'system',
  icon: '❌',
  category: 'error',
  content: 'Failed to delete: Permission denied for protected file'
}

{
  type: 'system',
  icon: '⚠️',
  category: 'warning',
  content: 'Renamed user-profile.tsx → UserProfile.tsx (may affect 3 imports)'
}
```

### 10.6 Permission Model

**Filesystem Access Control:**

```typescript
// packages/leo-client/src/lib/ai-agent/permissions.ts

export interface FilesystemPermissions {
  allowedPaths: string[];
  deniedPaths: string[];
  requireConfirmation: string[];
  maxFileSize: number; // bytes
  maxFilesPerOperation: number;
}

export const DEFAULT_AI_PERMISSIONS: FilesystemPermissions = {
  allowedPaths: [
    "src/**",
    "components/**",
    "lib/**",
    "utils/**",
    "pages/**",
    "styles/**",
    "__tests__/**",
  ],
  deniedPaths: [
    "node_modules/**",
    ".git/**",
    ".env*",
    "package.json",
    "tsconfig.json",
    ".github/workflows/**", // Protect CI/CD
  ],
  requireConfirmation: [
    "**/package.json",
    "**/tsconfig.json",
    "**/*.config.*",
    "**/Dockerfile",
    "**/.github/**",
  ],
  maxFileSize: 1024 * 1024, // 1MB per file
  maxFilesPerOperation: 50, // Max 50 files in batch operation
};

/**
 * Check if AI agent is allowed to perform operation on path.
 */
export function checkPermission(
  path: string,
  action: string,
  permissions: FilesystemPermissions = DEFAULT_AI_PERMISSIONS
): { allowed: boolean; requiresConfirmation: boolean; reason?: string } {
  // Check denied paths
  for (const deniedPattern of permissions.deniedPaths) {
    if (minimatch(path, deniedPattern)) {
      return {
        allowed: false,
        requiresConfirmation: false,
        reason: `Path matches protected pattern: ${deniedPattern}`,
      };
    }
  }

  // Check confirmation requirements
  for (const confirmPattern of permissions.requireConfirmation) {
    if (minimatch(path, confirmPattern)) {
      return {
        allowed: true,
        requiresConfirmation: true,
        reason: `This file requires confirmation before modification`,
      };
    }
  }

  // Check allowed paths
  const isAllowed = permissions.allowedPaths.some((pattern) =>
    minimatch(path, pattern)
  );

  return {
    allowed: isAllowed,
    requiresConfirmation: false,
    reason: isAllowed ? undefined : "Path not in allowed directories",
  };
}
```

### 10.7 Testing AI Filesystem Agent

**Test File: `packages/leo-client/src/lib/ai-agent/__tests__/filesystem-agent.test.ts`**

```typescript
import { FilesystemAgent } from "../filesystem-agent";
import { FilesystemService } from "../../filesystem/filesystem-service";
import { LocalFileSystem } from "../../filesystem/local-filesystem";

describe("FilesystemAgent", () => {
  let agent: FilesystemAgent;
  let filesystemService: FilesystemService;

  beforeEach(() => {
    const localFS = new LocalFileSystem();
    filesystemService = new FilesystemService(localFS);
    agent = new FilesystemAgent(filesystemService);
  });

  describe("execute()", () => {
    it("should create file from AI command", async () => {
      const result = await agent.execute({
        action: "create_file",
        parameters: {
          path: "Button.tsx",
          content: "export const Button = () => <button />;",
        },
      });

      expect(result.ok).toBe(true);
    });

    it("should delete file from AI command", async () => {
      // Setup: Create file first
      await agent.execute({
        action: "create_file",
        parameters: { path: "temp.txt", content: "test" },
      });

      // Test: Delete
      const result = await agent.execute({
        action: "delete_file",
        parameters: { path: "temp.txt" },
      });

      expect(result.ok).toBe(true);
    });

    it("should rename file from AI command", async () => {
      // Setup
      await agent.execute({
        action: "create_file",
        parameters: { path: "old-name.txt", content: "test" },
      });

      // Test
      const result = await agent.execute({
        action: "rename_file",
        parameters: {
          oldPath: "old-name.txt",
          newPath: "new-name.txt",
        },
      });

      expect(result.ok).toBe(true);
    });
  });

  describe("executeBatch()", () => {
    it("should execute multiple operations in sequence", async () => {
      const result = await agent.executeBatch([
        {
          action: "create_file",
          parameters: { path: "file1.txt", content: "a" },
        },
        {
          action: "create_file",
          parameters: { path: "file2.txt", content: "b" },
        },
        {
          action: "create_directory",
          parameters: { path: "folder" },
        },
      ]);

      expect(result.ok).toBe(true);
      expect(result.value).toHaveLength(3);
    });

    it("should fail fast on first error", async () => {
      const result = await agent.executeBatch([
        {
          action: "create_file",
          parameters: { path: "valid.txt", content: "test" },
        },
        {
          action: "delete_file",
          parameters: { path: "nonexistent.txt" },
        },
        {
          action: "create_file",
          parameters: { path: "never-reached.txt", content: "" },
        },
      ]);

      expect(result.ok).toBe(false);
      expect(result.error?.message).toContain("Failed at command 2");
    });
  });

  describe("validate()", () => {
    it("should require confirmation for delete operations", async () => {
      const validation = await agent.validate({
        action: "delete_file",
        parameters: { path: "important.tsx" },
      });

      expect(validation.confirmationRequired).toBe(true);
      expect(validation.warnings).toContain(
        "This will permanently delete the file/directory"
      );
    });

    it("should warn about potential import breaks for renames", async () => {
      const validation = await agent.validate({
        action: "rename_file",
        parameters: { oldPath: "Component.tsx", newPath: "NewComponent.tsx" },
      });

      expect(validation.warnings).toContain(
        "This may break imports/references in other files"
      );
    });
  });
});
```

### 10.8 Success Criteria

**AI Agent Filesystem Integration Goals:**

- ✅ AI can create files via chat command: `"Create Button.tsx in components/"`
- ✅ AI can delete files with confirmation: `"Delete old test files"`
- ✅ AI can rename/move files: `"Rename user-profile.tsx to UserProfile.tsx"`
- ✅ AI can read file contents: `"Show me what's in utils/helper.ts"`
- ✅ AI can list directories: `"What files are in the components folder?"`
- ✅ Permission system prevents dangerous operations (protected files)
- ✅ Confirmation dialogs for destructive actions
- ✅ System messages provide clear feedback in chat
- ✅ Batch operations support complex refactoring chains
- ✅ 80%+ test coverage for FilesystemAgent

---

**Next Action:** Implement `GitHubFileSystem` class with full test coverage, then add AI agent layer.
