# Story 3.11 Phase 2.3: Filesystem UI Components

## 🎯 Objective

Wire filesystem backend (LocalFileSystem, GitHubFileSystem, FilesystemService) to UI components for user interaction.

## 📋 Context

**Backend Complete:**
✅ LocalFileSystem (Browser File System Access API) - 85.27% coverage
✅ GitHubFileSystem (GitHub REST API) - 87.06% coverage
✅ FilesystemService (unified wrapper) - 79.38% coverage
✅ EditorContext integration (filesystem state + methods)

**UI Components Complete:**
✅ OpenFolderButton - Triggers File System Access API picker
✅ ConnectGitHubModal - GitHub repository connection UI
✅ FilesystemStatus - Shows current filesystem source

**Now Need:** Wire FileTree to real filesystem and add context menu operations.

## ✅ Acceptance Criteria

### FileTree Integration

- [ ] Wire FileTree to real filesystem data (`files` from EditorContext)
- [ ] Click handler to load file (`loadFile(path)`)
- [ ] Right-click context menu:
  - [ ] New File (triggers `createNewFile`)
  - [ ] New Folder
  - [ ] Rename (triggers `renameFile`)
  - [ ] Delete (triggers `deleteFile` with confirmation)
  - [ ] Copy Path
- [ ] Loading states for async operations
- [ ] Lazy loading for directories (expand on demand)

### Layout Integration

- [ ] Add OpenFolderButton to FileTree header/toolbar
- [ ] Add ConnectGitHubModal trigger button
- [ ] Add FilesystemStatus to main layout
- [ ] Update file tree in real-time after operations
- [ ] Auto-select file after creation

### Testing

- [ ] Unit tests for UI components (80%+ coverage)
- [ ] Integration tests (FileTree operations)
- [ ] E2E tests (Playwright): Open folder, connect GitHub, file operations

## 🔧 Implementation Plan

### Step 1: FileTree Context Menu Component

```typescript
// apps/web/components/FileSystem/FileTreeContextMenu.tsx
export function FileTreeContextMenu({ file, position, onClose }: Props) {
  const { createNewFile, deleteFile, renameFile } = useEditor();

  const handleNewFile = async () => {
    const name = prompt('Enter file name:');
    if (name) {
      await createNewFile(`${file.path}/${name}`);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (confirm(`Delete ${file.path}?`)) {
      await deleteFile(file.path);
    }
    onClose();
  };

  const handleRename = async () => {
    const newName = prompt('Enter new name:', file.path);
    if (newName && newName !== file.path) {
      await renameFile(file.path, newName);
    }
    onClose();
  };

  return (
    <ContextMenu position={position}>
      <MenuItem onClick={handleNewFile}>New File</MenuItem>
      <MenuItem onClick={handleRename}>Rename</MenuItem>
      <MenuItem onClick={handleDelete}>Delete</MenuItem>
    </ContextMenu>
  );
}
```

### Step 2: Update FileTree Component

```typescript
// apps/web/components/KiloEditor/FileTree.tsx
export function FileTree() {
  const { files, loadFile } = useEditor();
  const [contextMenu, setContextMenu] = useState<{ file: GeneratedFile; x: number; y: number } | null>(null);

  const handleFileClick = async (file: GeneratedFile) => {
    if (file.language !== 'directory') {
      await loadFile(file.path);
    }
  };

  const handleContextMenu = (file: GeneratedFile, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ file, x: e.clientX, y: e.clientY });
  };

  return (
    <div>
      {files.map(file => (
        <div
          key={file.path}
          onClick={() => handleFileClick(file)}
          onContextMenu={(e) => handleContextMenu(file, e)}
        >
          {file.path}
        </div>
      ))}

      {contextMenu && (
        <FileTreeContextMenu
          file={contextMenu.file}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
```

### Step 3: Add Components to Main Layout

```typescript
// apps/web/pages/index.tsx or appropriate layout file
import { OpenFolderButton, ConnectGitHubModal, FilesystemStatus } from '../components/FileSystem';

export function MainLayout() {
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b">
        <OpenFolderButton variant="outline" size="sm" />
        <button onClick={() => setShowGitHubModal(true)}>Connect GitHub</button>
      </div>

      {/* Status Bar */}
      <div className="border-b p-2">
        <FilesystemStatus />
      </div>

      {/* File Tree */}
      <FileTree />

      {/* Modal */}
      <ConnectGitHubModal open={showGitHubModal} onClose={() => setShowGitHubModal(false)} />
    </div>
  );
}
```

## 📦 Files to Create/Modify

**Create:**

```
apps/web/components/FileSystem/
├── FileTreeContextMenu.tsx    (new - right-click menu)
└── __tests__/
    ├── OpenFolderButton.test.tsx
    ├── ConnectGitHubModal.test.tsx
    ├── FilesystemStatus.test.tsx
    └── FileTreeContextMenu.test.tsx
```

**Modify:**

```
apps/web/components/KiloEditor/
├── FileTree.tsx               (wire to EditorContext, add context menu)
└── __tests__/
    └── FileTree.test.tsx      (add integration tests)

apps/web/pages/
└── index.tsx or layout file   (add filesystem components)
```

## 🧪 Testing Strategy

### Unit Tests

- [ ] OpenFolderButton renders correctly
- [ ] ConnectGitHubModal form validation
- [ ] FilesystemStatus displays correct state
- [ ] Context menu items trigger correct actions

### Integration Tests

- [ ] OpenFolder → updates EditorContext state → FileTree refreshes
- [ ] ConnectGitHub → updates state → FileTree shows repo files
- [ ] Context menu Delete → confirms → file removed → tree updates
- [ ] Error states display correctly

### E2E Tests (Playwright)

- [ ] User clicks Open Folder → selects directory → files appear
- [ ] User connects GitHub → enters repo → files load
- [ ] User right-clicks file → deletes → confirmation → file gone

**Target Coverage:** 80%+ for new UI components

## 🔗 Related

- #23 - Story 3.11 parent epic
- #25 - Phase 1 (closed - complete)
- Next: Phase 2.4 - FilesystemAgent (AI file operations)

## 📅 Status

- **Priority:** High
- **Complexity:** Medium
- **Estimated Effort:** 3-4 days

## ✅ Progress

- [x] OpenFolderButton component (committed 492b9b0)
- [x] ConnectGitHubModal component (committed 492b9b0)
- [x] FilesystemStatus component (committed 492b9b0)
- [ ] FileTreeContextMenu component
- [ ] Wire FileTree to EditorContext
- [ ] Add components to main layout
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
