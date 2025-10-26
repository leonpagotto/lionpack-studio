# UI Redesign Implementation Guide

**Story 3.9 Enhancement: Morphic + Kilo Code Integration**
**Status:** Architecture & Planning Complete | Implementation Ready
**Date:** January 2025

---

## 1. What We've Accomplished

### Phase 1: Analysis & Strategy ✅

- [x] Analyzed Morphic chat architecture (248 lines, production-ready)
- [x] Analyzed Kilo Code editor architecture (complex VS Code integration)
- [x] Created integration strategy document (`MORPHIC_KILO_INTEGRATION_STRATEGY.md`)
- [x] Planned component extraction and adaptation

### Phase 2: Architecture Documentation ✅

- [x] Created detailed component tree structure
- [x] Defined data flow patterns
- [x] Documented styling strategy
- [x] Identified code reuse opportunities (80%+)

### Phase 3: Skeleton Implementation ✅

- [x] Created `ProfessionalWorkflow.tsx` blueprint component
- [x] Created `/demo/professional-workflow` page
- [x] Set up component structure ready for integration

---

## 2. Next: Component Integration Steps

### Step 1: Extract Morphic Chat Components (2-3 hours)

**Source Repository:** https://github.com/miurla/morphic

**Files to Extract:**

```
morphic/components/
├── chat.tsx (248 lines)
│   - Main orchestrator using useChat hook
│   - Message state management
│   - Streaming response handling
│   ↓ Adapt to: apps/web/components/MorphicChat/ChatContainer.tsx
│
├── chat-messages.tsx (191 lines)
│   - Render message sections
│   - Collapsible groups
│   ↓ Adapt to: apps/web/components/MorphicChat/MessageDisplay.tsx
│
├── chat-panel.tsx (233 lines)
│   - Input textarea
│   - Model selector
│   - Scroll control
│   ↓ Adapt to: apps/web/components/MorphicChat/InputPanel.tsx
│
├── answer-section.tsx
│   - Message display with actions
│   ↓ Adapt to: apps/web/components/MorphicChat/MessageSection.tsx
│
└── ui/
    ├── button.tsx
    ├── textarea.tsx
    ├── dropdown-menu.tsx
    └── (Tailwind-based, already familiar)
```

**Adaptation Changes:**

1. **API Endpoint Change**
   - From: `/api/chat`
   - To: `/api/generate-code`

2. **Response Parsing**

   ```typescript
   // Morphic response format
   {
     role: "assistant",
     content: "Generated code..."
   }

   // Our code generation format
   {
     role: "assistant",
     content: JSON.stringify({
       files: GeneratedFile[],
       tests: TestResult,
       metrics: CodeMetrics
     })
   }
   ```

3. **Message Display**
   - Keep Morphic's beautiful message bubbles
   - Add code block syntax highlighting
   - Show file generation progress
   - Display test results inline

### Step 2: Build Kilo Code Layout Components (2-3 hours)

**Create New Components:**

```
apps/web/components/KiloEditor/

├── SplitPane.tsx (20 lines)
│   - ResizablePanelGroup configuration
│   - Horizontal/vertical splits
│
├── FileTree.tsx (40 lines)
│   - Hierarchical file display
│   - Click to select
│   - Icons for file types
│
├── CodeEditor.tsx (60 lines)
│   - Display selected file
│   - Syntax highlighting
│   - Line numbers
│
├── Terminal.tsx (50 lines)
│   - Test execution output
│   - Command results
│   - Color-coded (green/red)
│
├── BrowserPreview.tsx (30 lines)
│   - HTML/output preview
│   - Fallback to code display
│
└── index.ts
    - Barrel export
```

**Key Features:**

1. **File Tree**

   ```tsx
   interface FileTreeProps {
     files: GeneratedFile[];
     activeFile?: string;
     onSelectFile: (file: GeneratedFile) => void;
   }
   ```

2. **Code Editor**

   ```tsx
   interface CodeEditorProps {
     file: GeneratedFile;
     isLoading?: boolean;
   }
   ```

3. **Terminal**
   ```tsx
   interface TerminalProps {
     output: string[];
     testResults?: TestResult;
   }
   ```

### Step 3: State Management Integration (1-2 hours)

**Use React Context for File State:**

```typescript
interface EditorContextType {
  files: GeneratedFile[];
  activeFile: GeneratedFile | null;
  testResults: TestResult | null;
  selectFile: (file: GeneratedFile) => void;
  updateFiles: (files: GeneratedFile[]) => void;
}

const EditorContext = createContext<EditorContextType>();
export const useEditor = () => useContext(EditorContext);
```

**Wire up data flow:**

1. Chat sends prompt → API
2. API returns files + tests
3. Update context: `updateFiles()`
4. Editor components re-render with new data
5. Select first file by default
6. Display test results

### Step 4: Styling & Responsiveness (1 hour)

**Tailwind Configuration:**

- Maintain consistent color scheme
- Support dark/light themes
- Mobile-first responsive design
- Accessibility (a11y) compliance

**Breakpoints:**

- Mobile: Stack vertically
- Tablet (768px+): 40/60 split
- Desktop (1024px+): Default 40/60

**Color Integration:**

- Use existing Tailwind CSS theme
- Code syntax highlighting colors
- Test pass/fail indicators
- Terminal colors (green/red/yellow)

### Step 5: Integration Testing (1 hour)

**Test Matrix:**

| Test                  | Expected               | Status  |
| --------------------- | ---------------------- | ------- |
| Chat input acceptance | ✓                      | Pending |
| API streaming         | <3s generation         | Pending |
| File tree display     | <100ms render          | Pending |
| Code editor display   | <50ms syntax highlight | Pending |
| Terminal output       | Real-time streaming    | Pending |
| Test results          | Pass/fail indicators   | Pending |
| Responsiveness        | 60fps                  | Pending |
| Accessibility         | WCAG AA                | Pending |
| TypeScript errors     | 0                      | Pending |
| Console errors        | 0                      | Pending |

---

## 3. Implementation Timeline

```
Monday: Extract & adapt Morphic components
├─ 2 hours: Copy chat component files
├─ 1 hour: Update API endpoints & response parsing
└─ 30 min: Integrate with existing hooks

Tuesday: Build Kilo Code layout
├─ 1.5 hours: File tree component
├─ 1.5 hours: Code editor component
└─ 1 hour: Terminal + preview tabs

Wednesday: Integration & State Management
├─ 1 hour: React Context setup
├─ 1 hour: Wire up data flow
└─ 1 hour: End-to-end testing

Thursday: Styling & Polish
├─ 1 hour: Responsive design
├─ 30 min: Dark/light theme
└─ 30 min: Accessibility audit

Friday: Final Testing & Documentation
├─ 1.5 hours: Integration testing
├─ 1 hour: Performance optimization
└─ 1 hour: Update documentation
```

**Total Effort: ~18 hours**

---

## 4. Deployment Checklist

Before marking as complete:

- [ ] All 24 existing tests pass (100% passing)
- [ ] New components integrated into ProfessionalWorkflow
- [ ] Chat interface displays and accepts input
- [ ] API calls succeed with streaming
- [ ] Generated files display in file tree
- [ ] Code editor shows syntax highlighting
- [ ] Test results display with pass/fail indicators
- [ ] Terminal shows execution output
- [ ] Responsive design works (mobile → desktop)
- [ ] Accessibility score ≥90
- [ ] Zero TypeScript errors
- [ ] Zero console errors
- [ ] Performance ≥60fps
- [ ] Documentation updated
- [ ] Git commit with tag

---

## 5. File Structure Reference

```
apps/web/
├── components/
│   ├── ProfessionalWorkflow.tsx ✅ (Created)
│   │
│   ├── MorphicChat/ (TO CREATE)
│   │   ├── ChatContainer.tsx
│   │   ├── MessageDisplay.tsx
│   │   ├── InputPanel.tsx
│   │   ├── MessageSection.tsx
│   │   └── index.ts
│   │
│   ├── KiloEditor/ (TO CREATE)
│   │   ├── SplitPane.tsx
│   │   ├── FileTree.tsx
│   │   ├── CodeEditor.tsx
│   │   ├── Terminal.tsx
│   │   ├── BrowserPreview.tsx
│   │   └── index.ts
│   │
│   ├── CodeGenerator.tsx (Keep for reference)
│   ├── CodePreview.tsx
│   ├── TestResults.tsx
│   └── ModeDetector.tsx
│
└── pages/
    └── demo/
        ├── professional-workflow.tsx ✅ (Created)
        ├── code-generator.tsx
        ├── integrated-workflow.tsx
        └── mode-router.tsx
```

---

## 6. Key Dependencies

**Already Available:**

- React 18+
- TypeScript 5+
- Tailwind CSS
- Next.js 14+

**Need to Add (Optional):**

- `react-resizable-panels` - For split pane resizing (Morphic uses this)
- `react-textarea-autosize` - For auto-growing textarea (Morphic uses this)
- `highlight.js` or `prism-react-renderer` - For code syntax highlighting

**Note:** Morphic uses Vercel AI SDK which we'll implement differently with our existing API.

---

## 7. Risk Mitigation

| Risk                        | Probability | Mitigation                           |
| --------------------------- | ----------- | ------------------------------------ |
| Component incompatibilities | Medium      | Test each component in isolation     |
| Breaking existing tests     | Low         | Run tests continuously               |
| State management complexity | Medium      | Use React Context pattern            |
| Performance regression      | Low         | Profile with DevTools                |
| Styling conflicts           | Low         | Use CSS modules/BEM naming           |
| Streaming issues            | Low         | Keep our existing API implementation |

---

## 8. Success Metrics

### Functionality ✓

- [x] Story 3.9 Coder Agent (already complete)
- [ ] Chat interface working
- [ ] File editor displaying
- [ ] Tests integration complete
- [ ] Full end-to-end workflow

### Performance ✓

- [ ] First message: <500ms
- [ ] Code generation: <3s (existing)
- [ ] UI responsiveness: 60fps
- [ ] Memory: <200MB

### Quality ✓

- [ ] 24/24 tests passing
- [ ] 0 TypeScript errors
- [ ] 0 console errors
- [ ] Accessibility score: 90+
- [ ] 80%+ code reused from Morphic + Kilo

### User Experience ✓

- [ ] Professional appearance matching open-source quality
- [ ] Smooth transitions and animations
- [ ] Clear visual hierarchy
- [ ] Responsive on all screen sizes
- [ ] Dark/light theme support

---

## 9. References & Resources

### Morphic

- Repository: https://github.com/miurla/morphic
- Chat Component: `components/chat.tsx`
- Streaming Logic: `lib/streaming/create-tool-calling-stream.ts`
- Styling: Uses Tailwind CSS + shadcn/ui

### Kilo Code

- Repository: https://github.com/Kilo-Org/kilocode
- Editor Layout: `src/integrations/editor/`
- Webview UI: `webview-ui/src/components/`
- Diff View: `DiffViewProvider.ts` (734 lines)

### Our Implementation

- Story 3.9: `packages/leo-client/src/coder/`
- API: `apps/web/pages/api/generate-code.ts`
- Tests: `packages/leo-client/src/__tests__/`

---

## 10. Questions & Answers

**Q: Why not use Morphic directly?**
A: Morphic is designed for search/RAG, we need code generation-specific features. We extract and adapt components.

**Q: Why not use Kilo Code directly?**
A: Kilo Code is a VS Code extension. We extract the layout/UI patterns and recreate them for web.

**Q: Timeline realistic?**
A: Yes - most code is copy-paste-adapt. Morphic components are well-written and reusable.

**Q: Will this break existing features?**
A: No - we're replacing the demo pages, not changing the core API or test suite.

**Q: How much code reuse?**
A: ~80%+ from Morphic (Chat components) and ~60%+ from Kilo Code (Layout patterns).

---

**Document Created:** January 2025
**Last Updated:** January 2025
**Next Phase:** Component Integration
**Estimated Completion:** 18 hours of focused work

**Ready to proceed? Start with Step 1: Extract Morphic Chat Components** ✅
