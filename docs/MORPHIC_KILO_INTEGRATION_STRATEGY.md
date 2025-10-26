# Morphic + Kilo Code Integration Strategy

**Story 3.9 Enhancement: Professional UI Redesign**
**Date:** January 2025
**Status:** In Development

---

## 1. Executive Summary

We are integrating two world-class open-source projects to create a professional, production-ready developer experience:

- **Morphic** (https://github.com/miurla/morphic): Beautiful AI-powered chat interface with streaming support
- **Kilo Code** (https://github.com/Kilo-Org/kilocode): VS Code-like split-panel editor with file tree, terminal, and browser preview

**Target Layout:**

```
┌─────────────────────────────────────┐
│         Story 3.9 Demo              │
├──────────────┬──────────────────────┤
│              │                      │
│   Morphic    │    Kilo Editor       │
│   Chat       │  ┌──────────────┐    │
│   Interface  │  │ File Tree    │    │
│              │  ├──────────────┤    │
│              │  │ Code Editor  │    │
│              │  ├──────────────┤    │
│              │  │ Terminal Out │    │
│              │  ├──────────────┤    │
│              │  │ Browser Prev │    │
│              │  └──────────────┘    │
└──────────────┴──────────────────────┘
```

---

## 2. Component Analysis

### 2.1 Morphic Architecture

**Key Components:**

- **Chat.tsx** (Main orchestrator)
  - Manages message state using `useChat` from Vercel AI SDK
  - Handles streaming responses
  - Organizes messages into sections (user + assistant)
  - 248 lines, production-ready

- **ChatMessages.tsx** (Display layer)
  - Renders chat message sections
  - Collapsible message groups
  - Tool invocations and search results
  - 191 lines

- **ChatPanel.tsx** (Input layer)
  - Textarea with auto-sizing
  - Model selector
  - Search mode toggle
  - Scroll-to-bottom button
  - 233 lines

- **AnswerSection.tsx** (Message rendering)
  - Collapsible answers with actions
  - Copy, share, reload functionality
  - Message formatting with Markdown

- **Streaming Architecture:**
  - `createToolCallingStreamResponse()` - Server-side streaming
  - Vercel AI SDK handles real-time updates
  - Data stream merges seamlessly into UI
  - Used for search results and tool calls

**Styling:**

- Tailwind CSS utility-first
- `shadcn/ui` components (Button, Textarea, etc.)
- Responsive design (mobile-first)
- Dark/light theme support

**Data Flow:**

```
User Input → ChatPanel
    ↓
handleSubmit() → useChat()
    ↓
POST /api/chat
    ↓
Streaming Response
    ↓
setMessages() → Chat State
    ↓
ChatMessages renders sections
```

### 2.2 Kilo Code Architecture

**Key Components:**

- **webview-ui/** (React frontend in VS Code webview)
  - Chat-based UI for agent interactions
  - CodeBlock with syntax highlighting
  - CodeAccordian for expandable code sections
  - TerminalSettings for configuration

- **CommandExecution.tsx**
  - Displays executed commands
  - Shows command output with expand/collapse
  - Terminal integration visualization

- **CodeBlock.tsx**
  - Syntax highlighting with Prism/highlight.js
  - Copy-to-clipboard button
  - Line numbers
  - Word wrap options
  - 123+ lines

- **DiffViewProvider.ts** (734 lines)
  - Shows side-by-side diffs
  - Original ↔ Changes view
  - Used for code edits visualization

- **File System Integration:**
  - `listFiles` tool - browse file tree
  - `readFile` tool - display file content
  - `writeToFile` tool - create files
  - `executeCommand` tool - run terminal commands

**Styling:**

- CSS modules with styled-components
- VSCode theme integration (`--vscode-editor-background`)
- Terminal styling
- Diff highlighting

**Architecture Pattern:**

- VS Code extension communication via messages
- Webview ↔ Extension messages
- Tool-based architecture

---

## 3. Integration Strategy

### 3.1 Component Extraction & Adaptation

#### Phase 1: Core Chat Interface (From Morphic)

**Files to Extract:**

- `components/chat.tsx` → `apps/web/components/MorphicChat/ChatContainer.tsx`
- `components/chat-messages.tsx` → `apps/web/components/MorphicChat/MessageDisplay.tsx`
- `components/chat-panel.tsx` → `apps/web/components/MorphicChat/InputPanel.tsx`
- `lib/streaming/create-tool-calling-stream.ts` → Keep our existing API

**Modifications:**

1. Remove Morphic's search integration (we have Coder Agent instead)
2. Update API endpoint from `/api/chat` to `/api/generate-code`
3. Replace search UI with code generation results display
4. Adapt message sections to show:
   - User's code prompt
   - Generated code files
   - Test results
   - Execution output

**Data Structure Mapping:**

```typescript
// Morphic's message format
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  parts?: MessagePart[];
}

// Our Coder Agent format
interface CodeGenMessage extends Message {
  parts?: [
    {
      type: "text";
      text: string; // User prompt
    },
    {
      type: "code-generation";
      files: GeneratedFile[];
      tests: TestResult;
      metrics: CodeMetrics;
    },
  ];
}
```

#### Phase 2: Split-View Editor (From Kilo Code)

**Files to Extract/Create:**

- `webview-ui/src/components/common/CodeBlock.tsx` → Adapt for web
- Create `apps/web/components/KiloEditor/SplitPane.tsx`
- Create `apps/web/components/KiloEditor/FileTree.tsx`
- Create `apps/web/components/KiloEditor/CodeEditor.tsx`
- Create `apps/web/components/KiloEditor/Terminal.tsx`
- Create `apps/web/components/KiloEditor/BrowserPreview.tsx`

**Split Pane Implementation:**

- Use `react-resizable-panels` (already in Morphic)
- Vertical split: Chat (40%) | Editor (60%)
- Editor has horizontal splits:
  - Top: File tree + Code editor (80%)
  - Bottom: Terminal + Preview (20%)

**Components Detail:**

**FileTree.tsx**

```tsx
interface FileTreeProps {
  files: GeneratedFile[];
  activeFile: string;
  onSelectFile: (path: string) => void;
}

// Features:
// - Hierarchical folder structure
// - Icons for file types
// - Click to select
// - Shows file size
```

**CodeEditor.tsx**

```tsx
interface CodeEditorProps {
  file: GeneratedFile;
  language: string;
  isLoading?: boolean;
}

// Features:
// - Syntax highlighting (highlight.js or Prism)
// - Line numbers
// - Read-only (for generated code)
// - Scroll sync with file tree
```

**Terminal.tsx**

```tsx
interface TerminalProps {
  output: string[];
  isExecuting?: boolean;
  testResults?: TestResult;
}

// Features:
// - Shows command execution output
// - Test results with pass/fail indicators
// - Scrollable output area
// - Color-coded (red for errors, green for pass)
```

**BrowserPreview.tsx**

```tsx
interface BrowserPreviewProps {
  content: string; // HTML or rendered output
  isLoading?: boolean;
}

// Features:
// - Renders HTML output
// - Shows preview in iframe if applicable
// - Fallback to code display
```

### 3.2 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Integrated Story 3.9 Demo                                  │
└─────────────────────────────────────────────────────────────┘

LEFT SIDE (Morphic Chat Interface):
1. User enters prompt: "Create a React button component"
2. ChatPanel.tsx captures input
3. Submit → POST /api/generate-code
4. Streaming response begins
5. ChatMessages.tsx shows:
   - User's prompt (collapsed)
   - Streaming: "Generating code..." spinner
   - Incremental code blocks appear

RIGHT SIDE (Kilo Code Editor):
1. FileTree.tsx populates with generated files:
   - button.tsx
   - button.test.tsx
   - button.stories.tsx
2. CodeEditor.tsx shows selected file content
3. Terminal.tsx shows:
   - "Running tests..."
   - Test output: "✓ 3 tests passed"
4. BrowserPreview.tsx shows:
   - Rendered component (if applicable)
   - Or preview URL

DATA FLOW:
```

useChat({
id: chatId,
body: { prompt }
})
↓
API Response (streaming)
↓
setMessages() updates state
↓
Extract files from response
↓
useGeneratedFiles() hook
↓
FileTree + CodeEditor re-render
↓
Terminal shows test execution

```

### 3.3 Component Tree

```

ProfessionalWorkflow (New demo page)
│
├── ResizablePanelGroup (horizontal)
│ │
│ ├── ResizablePanel (40% - Chat)
│ │ └── MorphicChat
│ │ ├── ChatContainer
│ │ │ ├── ChatMessages
│ │ │ │ └── RenderMessage
│ │ │ │ ├── UserMessage
│ │ │ │ ├── AnswerSection
│ │ │ │ └── CodeSection
│ │ │ └── ChatPanel
│ │ │ └── InputPanel
│ │ └── Context: useChat()
│ │
│ ├── ResizableHandle
│ │
│ └── ResizablePanel (60% - Editor)
│ └── KiloEditor
│ ├── ResizablePanelGroup (vertical)
│ │ │
│ │ ├── ResizablePanel (80%)
│ │ │ └── ResizablePanelGroup (horizontal)
│ │ │ ├── FileTree
│ │ │ ├── ResizableHandle
│ │ │ └── CodeEditor
│ │ │
│ │ ├── ResizableHandle
│ │ │
│ │ └── ResizablePanel (20%)
│ │ ├── Tabs
│ │ ├── Tab: Terminal
│ │ ├── Tab: Tests
│ │ └── Tab: Preview
│ │
│ └── Context: useGeneratedFiles()

````

### 3.4 Styling Strategy

**Tailwind + CSS Classes:**
- Import Morphic's button/input styles
- Use Kilo's color scheme (`--vscode-*` variables fallback)
- Consistent spacing (8px grid)
- Responsive breakpoints:
  - Mobile: Stack vertically
  - Tablet: 50/50 split
  - Desktop: 40/60 split

**Theme Integration:**
```css
/* Light theme */
.light-theme {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #000000;
  --border: #e0e0e0;
}

/* Dark theme */
.dark-theme {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --text-primary: #e0e0e0;
  --border: #3e3e42;
}
````

---

## 4. Implementation Plan

### Phase 1: Chat Interface (2 hours)

- [ ] Extract Morphic chat components
- [ ] Adapt to work with our API
- [ ] Test message streaming
- [ ] Add syntax highlighting for code blocks

### Phase 2: Editor Layout (2 hours)

- [ ] Create split-pane structure
- [ ] Implement FileTree component
- [ ] Implement CodeEditor component
- [ ] Add Terminal/Preview tabs

### Phase 3: Integration (2 hours)

- [ ] Connect chat to file generation
- [ ] Update state management
- [ ] Add file selection logic
- [ ] Implement terminal output display

### Phase 4: Polish (1 hour)

- [ ] Responsive design
- [ ] Dark/light theme support
- [ ] Loading states and spinners
- [ ] Error handling

### Phase 5: Testing (1 hour)

- [ ] End-to-end workflow test
- [ ] Browser compatibility
- [ ] Performance optimization
- [ ] Accessibility check

**Total Effort:** ~8 hours

---

## 5. File Structure

```
apps/web/
├── components/
│   ├── MorphicChat/
│   │   ├── ChatContainer.tsx (from Morphic)
│   │   ├── MessageDisplay.tsx (from Morphic)
│   │   ├── InputPanel.tsx (from Morphic)
│   │   ├── MessageActions.tsx (from Morphic)
│   │   └── index.ts
│   │
│   ├── KiloEditor/
│   │   ├── SplitPane.tsx (new)
│   │   ├── FileTree.tsx (new)
│   │   ├── CodeEditor.tsx (new)
│   │   ├── Terminal.tsx (new)
│   │   ├── BrowserPreview.tsx (new)
│   │   └── index.ts
│   │
│   └── ProfessionalWorkflow.tsx (new, main orchestrator)
│
└── pages/
    └── demo/
        └── professional-workflow.tsx (new demo page)
```

---

## 6. API Integration

### Current Endpoints (Exist)

- `POST /api/generate-code` - Generate code from prompt
- `POST /api/mode-router` - Detect mode
- `GET /api/health` - Health check

### Data Structures

**Request:**

```typescript
interface CodeGenerationRequest {
  prompt: string;
  mode?: "architect" | "coder" | "debugger";
  includeTests?: boolean;
  chatId: string;
}
```

**Response (Streaming):**

```typescript
interface CodeGenerationResponse {
  files: GeneratedFile[];
  tests?: {
    passed: number;
    failed: number;
    output: string;
  };
  metrics: {
    generationTime: number;
    codeQuality: number;
    testCoverage: number;
  };
}

interface GeneratedFile {
  path: string;
  name: string;
  language: string;
  content: string;
  size: number;
}
```

---

## 7. Success Metrics

### UI/UX

- ✅ Chat responsive to code generation prompts
- ✅ Generated files appear in file tree within 500ms of generation
- ✅ Code editor displays full file content
- ✅ Terminal shows test results in real-time
- ✅ Preview renders where applicable

### Performance

- ✅ First message: <500ms
- ✅ Code generation: <3s
- ✅ UI responsiveness: 60fps
- ✅ Memory usage: <200MB

### Functionality

- ✅ All 24 existing tests still pass
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ Accessibility score: 90+

### Code Quality

- ✅ 80%+ code reused from Morphic + Kilo Code
- ✅ Consistent with LEO styling standards
- ✅ Type-safe (TypeScript strict mode)
- ✅ Production-ready documentation

---

## 8. Risk Mitigation

| Risk                        | Probability | Mitigation                                 |
| --------------------------- | ----------- | ------------------------------------------ |
| Component incompatibilities | Medium      | Test each component in isolation first     |
| Performance degradation     | Low         | Profile with DevTools, optimize re-renders |
| Breaking existing tests     | Low         | Run tests after each phase                 |
| Styling conflicts           | Medium      | Use CSS modules/BEM naming                 |
| State management complexity | Medium      | Use React Context for file state           |

---

## 9. References

- **Morphic Chat Components:** https://github.com/miurla/morphic/tree/main/components
- **Morphic Streaming:** https://github.com/miurla/morphic/tree/main/lib/streaming
- **Kilo Code UI:** https://github.com/Kilo-Org/kilocode/tree/main/webview-ui
- **Kilo Code Editor:** https://github.com/Kilo-Org/kilocode/tree/main/src/integrations/editor
- **Our API:** `/pages/api/generate-code`
- **Our Tests:** `packages/leo-client/src/__tests__/`

---

## 10. Next Steps

1. ✅ Analyze both projects (COMPLETE)
2. 📝 Create this integration strategy (COMPLETE)
3. 🚀 Extract Morphic chat components
4. 🚀 Build Kilo editor layout
5. 🚀 Connect data flows
6. 🚀 Test end-to-end
7. 🚀 Optimize and polish
8. 📚 Update documentation
9. 🎉 Deploy to production

**Estimated Completion:** 4 hours from now

---

**Document Created:** January 2025
**Last Updated:** January 2025
**Status:** Ready for Implementation ✅
