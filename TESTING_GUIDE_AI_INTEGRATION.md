# AI Code Generation Testing Guide 🧪
## Quick Testing Checklist for Fix B3

---

## 🎯 What We Just Built

You now have a **complete AI code generation workflow**:
1. Type request in AI chat
2. Visual loading banner appears
3. AI generates code
4. Code opens in Monaco editor
5. All files added to file tree
6. Comprehensive terminal feedback
7. Files marked as unsaved

---

## ✅ Testing Steps

### Test 1: Basic Code Generation

**Steps:**
1. Go to running dev server: `http://localhost:3001`
2. Look at the right sidebar (AI Chat)
3. Type in the input box:
   ```
   Create a React button component with TypeScript and Tailwind CSS
   ```
4. Press Enter or click Send

**Expected Results:**
- ✅ Blue banner appears at top of editor: "🔄 AI is generating code..."
- ✅ Terminal shows: "🔄 AI is generating code..."
- ✅ After ~3-5 seconds, banner disappears
- ✅ Monaco editor opens with `Button.tsx` content
- ✅ File tree shows new file (left sidebar)
- ✅ Terminal shows:
  ```
  🤖 AI Generated 1 file(s):
    ✓ Button.tsx (XXX bytes) [Opened in editor]
  ```
- ✅ Terminal panel auto-opens (bottom)
- ✅ Status bar shows "● Unsaved" indicator

**If it works:** ✅ Basic generation is working!

**If it doesn't work:**
- Check browser console (F12) for errors
- Check terminal running dev server for errors
- Verify AI chat backend is working (try typing a question first)

---

### Test 2: Multi-File Generation

**Steps:**
1. In AI chat, type:
   ```
   Create a complete Todo component with:
   - TypeScript component (TodoList.tsx)
   - Test file (TodoList.test.tsx)
   - CSS styles (TodoList.css)
   ```
2. Press Enter

**Expected Results:**
- ✅ Loading banner appears
- ✅ After generation, Monaco editor opens `TodoList.tsx` (first file)
- ✅ File tree shows **all 3 files**:
  - TodoList.tsx
  - TodoList.test.tsx
  - TodoList.css
- ✅ Terminal shows all files:
  ```
  🤖 AI Generated 3 file(s):
    ✓ TodoList.tsx (XXX bytes) [Opened in editor]
    • TodoList.test.tsx (XXX bytes)
    • TodoList.css (XXX bytes)
  💡 Tip: Check the file tree for all generated files
  ```
- ✅ Tip message appears (because multiple files)

**If it works:** ✅ Multi-file generation is working!

---

### Test 3: Editing Generated Code

**Steps:**
1. After code is generated, click in Monaco editor
2. Make a change (add a comment, change text)
3. Look at status bar (bottom right)

**Expected Results:**
- ✅ Status bar shows "● Unsaved" in yellow
- ✅ Can type and edit freely
- ✅ Syntax highlighting works
- ✅ IntelliSense suggestions appear (start typing `const`)

**If it works:** ✅ Monaco editor integration is working!

---

### Test 4: Saving Generated Code

**Steps:**
1. After editing, press `Cmd+S` (Mac) or `Ctrl+S` (Windows)

**Expected Results:**
- ✅ Terminal shows: "💾 File saved: [filename]"
- ✅ Status bar "● Unsaved" disappears
- ✅ File is actually saved (check filesystem)

**If it works:** ✅ Save functionality is working!

---

### Test 5: Loading States

**Steps:**
1. Type a complex request that takes time:
   ```
   Create a complete authentication system with login, signup, and password reset
   ```
2. Watch the screen during generation

**Expected Results:**
- ✅ Blue banner appears immediately
- ✅ Banner shows spinning 🔄 icon
- ✅ Banner shows pulsing dots (animated)
- ✅ Terminal shows "🔄 AI is generating code..."
- ✅ Banner stays visible until generation completes
- ✅ Banner disappears when code appears

**If it works:** ✅ Visual feedback is working!

---

### Test 6: File Tree Integration

**Steps:**
1. Generate code (any prompt)
2. Look at left sidebar (File Explorer)
3. Click on generated file in tree

**Expected Results:**
- ✅ Generated files appear in tree
- ✅ Clicking file opens it in editor
- ✅ File icon matches file type (e.g., `.tsx` icon)

**If it works:** ✅ File tree integration is working!

---

## 🐛 Common Issues & Solutions

### Issue: "AI assistant still doesn't work"

**Check:**
1. Is the AI chat panel visible? (right sidebar)
2. Does the input box work? (can you type?)
3. Try a simple question first: "What is React?"
4. If chat works but code generation doesn't, check API

**Solution:**
```bash
# Check API is running
curl http://localhost:3001/api/chat

# Should return 405 (needs POST)
# If it returns 404, API is broken
```

---

### Issue: "Loading banner doesn't appear"

**Check:**
1. Browser console for errors
2. Verify `isAIGenerating` state is working

**Solution:**
Add console.log to debug:
```typescript
const handleAIGenerateStart = () => {
  console.log('🔄 AI GENERATION STARTED');
  setIsAIGenerating(true);
};
```

---

### Issue: "Code doesn't appear in editor"

**Check:**
1. Terminal for errors
2. ChatContainer is calling `onCodeGenerated`
3. `generatedCode.files` is not empty

**Solution:**
Add console.log to debug:
```typescript
const handleAIGenerate = (generatedCode: GeneratedCode) => {
  console.log('📥 AI RESPONSE:', generatedCode);
  // ... rest of function
};
```

---

### Issue: "Terminal output is missing"

**Check:**
1. Is bottom panel visible? (click "Terminal" tab)
2. Is `setTerminalOutput` being called?

**Solution:**
Make sure bottom panel is open:
- Look for minimize/maximize button
- Check `showBottomPanel` state is true

---

## 📊 Success Criteria

**Fix B3 is COMPLETE when:**

- ✅ AI chat generates code successfully
- ✅ Code appears in Monaco editor
- ✅ All generated files appear in file tree
- ✅ Terminal shows detailed output
- ✅ Loading banner appears during generation
- ✅ Files are marked as unsaved
- ✅ Can edit generated code
- ✅ Can save edited code

**All 8 items should work!**

---

## 🎥 Demo Flow (For Recording)

**Perfect Demo Scenario:**

1. **Start:** Show empty editor
2. **Type:** "Create a React dashboard component with charts"
3. **Show:** Loading banner appears
4. **Wait:** AI generates code (~5 seconds)
5. **Show:** Code appears in editor
6. **Show:** File tree updates with new files
7. **Show:** Terminal output (comprehensive feedback)
8. **Edit:** Add a comment in Monaco editor
9. **Show:** "● Unsaved" indicator
10. **Save:** Press Cmd+S
11. **Show:** "💾 File saved" in terminal
12. **Success:** Complete workflow demonstrated!

---

## 🚀 Next Testing Phase

After verifying Fix B3 works:

1. **Story 3.10 Phase 3:** Test multi-provider switching (Gemini/Claude/GPT)
2. **Story 3.10 Phase 4:** Test AIProviderSelector UI integration
3. **E2E Testing:** Write automated Playwright tests
4. **Documentation:** Update user guide with screenshots

---

## 📝 Reporting Results

**If everything works:**
Comment on this summary: "✅ All tests passing - Fix B3 verified!"

**If something breaks:**
1. Note which test failed
2. Copy error message from console
3. Check browser DevTools for stack trace
4. Report: "❌ Test X failed: [error message]"

---

**Good luck with testing! 🎉**

The AI code generation workflow should now be fully functional and visually polished.
