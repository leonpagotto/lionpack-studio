# 🔗 LEO Kit + OpenCode + Morphy Integration Guide

## Overview

LionPack Studio integrates three major systems:

1. **LEO Kit** (v5.0.0+) — Workflow automation & AI orchestration
2. **OpenCode** — Web-based code editor
3. **Morphy** — AI-powered chat assistant

This guide shows how they work together.

---

## 1️⃣ LEO Kit Integration

### What LEO Kit Provides

- Multi-agent orchestration (Orchestrator, Frontend, Backend, DevOps, Testing, Docs)
- Spec-first development workflow
- GitHub Projects integration
- Multi-model Claude support (Sonnet, 4, 4.5, Haiku)
- Automated issue creation & routing

### How LionPack Uses LEO

```
User describes feature in Morphy chat
    ↓
Morphy sends to leo-client
    ↓
leo-client calls LEO Orchestrator
    ↓
LEO routes to best agent(s)
    ↓
Agent generates spec + creates GitHub issue
    ↓
Result synced to pack members in real-time
```

### Implementation: `packages/leo-client`

```typescript
// src/orchestrator.ts
import { Orchestrator as LEOOrchestrator } from 'leo-workflow-kit'

export class Orchestrator {
  private leo: LEOOrchestrator
  
  constructor(config: OrchestratorConfig) {
    this.leo = new LEOOrchestrator({
      modelPreference: config.modelPreference || 'sonnet',
      githubToken: config.githubToken,
      anthropicKey: config.anthropicKey,
    })
  }

  async analyzeUserRequest(request: string): Promise<RoutingDecision> {
    // LEO analyzes and routes
    const decision = await this.leo.classify(request)
    return {
      taskType: decision.type, // 'frontend' | 'backend' | 'devops' | etc
      agents: decision.agents,
      complexity: decision.complexity,
    }
  }

  async createWorkflow(spec: SpecInput): Promise<Workflow> {
    // LEO creates GitHub issue, generates code, etc
    const result = await this.leo.executeWorkflow(spec)
    
    return {
      id: result.issueNumber,
      spec: result.spec,
      githubIssue: result.issueUrl,
      agents: result.assignedAgents,
      status: 'in-progress',
    }
  }

  async generateSpec(description: string, model: 'sonnet' | '4' | '4-5' | 'haiku') {
    // Multi-model spec generation
    const spec = await this.leo.generateSpec(description, { model })
    
    return {
      title: spec.title,
      description: spec.description,
      acceptanceCriteria: spec.criteria,
      estimatedEffort: spec.effort,
      suggestedArchitecture: spec.architecture,
    }
  }
}
```

### Configuration

```typescript
// .env.local
NEXT_PUBLIC_LEO_API_ENDPOINT=http://localhost:3000/api/leo
NEXT_PUBLIC_LEO_VERSION=5.0.0

# For direct LEO Kit usage (Phase 1)
LEO_GITHUB_TOKEN=ghp_xxx
LEO_ANTHROPIC_KEY=sk-xxx

# Model preferences
LEO_MODEL_PREFERENCE=opus-4-5
LEO_AUTO_SELECT_MODELS=true
```

### Usage in Frontend

```typescript
// apps/web/hooks/useLEOOrchestrator.ts
import { useCallback } from 'react'
import { Orchestrator } from '@lionpack/leo-client'

const orchestrator = new Orchestrator({
  modelPreference: 'opus-4-5',
  githubToken: process.env.LEO_GITHUB_TOKEN,
})

export const useLEOOrchestrator = () => {
  const createWorkflow = useCallback(async (description: string) => {
    const workflow = await orchestrator.createWorkflow({
      title: 'Feature request from LionPack',
      description,
      source: 'morphy-chat',
    })
    
    return workflow
  }, [])

  return { createWorkflow }
}
```

---

## 2️⃣ OpenCode Editor Integration

### What OpenCode Provides

- Web-based code editor
- File browser
- Syntax highlighting
- Integrated terminal
- Git operations
- Live preview (for web projects)

### How LionPack Uses OpenCode

```
LionPack embeds OpenCode in /editor/:projectId
Editor syncs files to backend
Real-time collaboration via Yjs
Terminal output broadcasted to pack
```

### Implementation: `apps/web/components/Editor`

```typescript
// apps/web/components/Editor/EditorContainer.tsx
import { Editor } from '@opencode/react'
import { useYjs } from '@/hooks/useYjs'
import { useRealtime } from '@/hooks/useRealtime'

export const EditorContainer = ({ projectId }: { projectId: string }) => {
  const { ydoc, provider } = useYjs(projectId)
  const { fileUpdates$ } = useRealtime(projectId)

  return (
    <Editor
      projectId={projectId}
      ydoc={ydoc}
      onChange={(files) => {
        // Yjs automatically syncs
      }}
      onTerminalOutput={(output) => {
        // Broadcast to pack members
        provider.awareness.setLocalState({
          terminalOutput: output,
          timestamp: Date.now(),
        })
      }}
    />
  )
}
```

### File Sync Strategy

```
OpenCode (local) ↔️ Yjs (shared state) ↔️ Supabase (persistence)

1. User edits file in OpenCode
2. Change captured by Yjs
3. Broadcasted to Supabase Realtime
4. Other pack members receive update
5. Their OpenCode updates in real-time
6. Periodic save to backend storage
```

### Terminal Integration

```typescript
// Terminal output synced to all pack members
export const useTerminal = () => {
  const { provider } = useYjs()
  
  const executeCommand = async (command: string) => {
    const output = await runCommand(command)
    
    // Broadcast to awareness
    provider.awareness.setLocalState({
      terminalCommand: command,
      terminalOutput: output,
      author: currentUser.id,
      timestamp: Date.now(),
    })
    
    return output
  }
  
  return { executeCommand }
}
```

---

## 3️⃣ Morphy AI Chat Integration

### What Morphy Provides

- Contextual AI chat
- Code understanding
- Suggestion generation
- Architecture recommendations
- Task guidance

### How LionPack Uses Morphy

```
User types in chat sidebar
    ↓
Morphy receives context (current file, selection, workflow)
    ↓
Morphy generates response with code suggestions
    ↓
User can apply suggestion to editor
    ↓
Applied code synced to pack via Yjs
```

### Implementation: `apps/web/components/Chat`

```typescript
// apps/web/components/Chat/ChatPanel.tsx
import { MorphyChat } from '@morphy/react'
import { useEditor } from '@/hooks/useEditor'
import { useWorkflow } from '@/hooks/useWorkflow'

export const ChatPanel = () => {
  const { currentFile, selection } = useEditor()
  const { workflow, tasks } = useWorkflow()

  const messageContext = {
    currentFile,
    selection,
    workflow: {
      title: workflow?.title,
      status: workflow?.status,
      agents: workflow?.agents,
    },
    activeTasks: tasks.filter(t => t.status === 'in-progress'),
  }

  return (
    <MorphyChat
      context={messageContext}
      onSuggestion={({ code, action }) => {
        if (action === 'insert') {
          applyToEditor(code)
        } else if (action === 'replace') {
          replaceInEditor(selection, code)
        }
      }}
      systemPrompt={generateSystemPrompt(workflow)}
    />
  )
}

function generateSystemPrompt(workflow: Workflow): string {
  return `
You are LionPack Studio assistant. You help developers ship features faster using:

1. LEO Kit workflow automation (orchestration, specs, GitHub sync)
2. Real-time collaboration (packs with role-based tasks)
3. Spec-first development (requirements → code)

Current workflow: ${workflow.title}
Assigned agents: ${workflow.agents.join(', ')}

Help the user by:
- Suggesting next steps in their workflow
- Providing code templates
- Recommending pack members for tasks
- Explaining LEO Kit capabilities
  `
}
```

### Suggestion Application

```typescript
// apps/web/hooks/useApplyMorphySuggestion.ts
export const useApplyMorphySuggestion = () => {
  const { editor } = useEditor()
  const { ydoc } = useYjs()

  const apply = (code: string, action: 'insert' | 'replace' = 'insert') => {
    const update = ydoc.getMap('files').get(editor.currentFile)
    
    if (action === 'insert') {
      update.insert(editor.cursorPosition, code)
    } else {
      update.delete(editor.selection.start, editor.selection.length)
      update.insert(editor.selection.start, code)
    }
    
    // Yjs automatically syncs via provider
  }

  return { apply }
}
```

---

## 4️⃣ Real-Time Collaboration

### Yjs + Supabase Realtime

```typescript
// apps/web/lib/collaboration.ts
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export const initializeCollaboration = async (projectId: string) => {
  const ydoc = new Y.Doc()
  
  // Create shared types
  const yfiles = ydoc.getMap('files')
  const ytasks = ydoc.getArray('tasks')
  
  // Connect to Supabase Realtime
  const provider = new WebsocketProvider(
    process.env.NEXT_PUBLIC_SUPABASE_REALTIME_URL,
    `project:${projectId}`,
    ydoc
  )

  // Awareness (presence info)
  const awareness = provider.awareness
  
  return { ydoc, provider, yfiles, ytasks, awareness }
}
```

### Awareness (Presence)

```typescript
// Each user broadcasts their state
provider.awareness.setLocalState({
  user: {
    id: currentUser.id,
    name: currentUser.name,
    avatar: currentUser.avatar,
    color: getUserColor(currentUser.id),
  },
  editor: {
    file: currentFile,
    cursorLine: cursorLine,
    cursorColumn: cursorColumn,
    selection: { start, end },
  },
  timestamp: Date.now(),
})

// Listen for awareness updates
awareness.on('change', (changes) => {
  changes.added.forEach((clientID) => {
    const state = awareness.getStates().get(clientID)
    console.log(`${state.user.name} is now here`)
    showRemoteCursor(state)
  })
})
```

---

## 5️⃣ Workflow → Morphy → LEO Sync

### Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User in Morphy chat: "Add login feature with OAuth"         │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ Morphy processes request + current editor context           │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend calls /api/workflows/create with:                  │
│ - description: "Add login feature with OAuth"               │
│ - context: { currentFile, editors, workflow }               │
│ - morphy_suggestion: { code, steps }                        │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ API calls leo-client.createWorkflow()                       │
│ LEO analyzes + creates GitHub issue + assigns agents        │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ Result broadcasted to all pack members via Yjs:             │
│ - New task created                                           │
│ - GitHub issue linked                                        │
│ - Assigned architect for spec                               │
│ - Assigned developers for implementation                     │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ Pack members see:                                            │
│ - Task appears in sidebar                                   │
│ - Morphy suggests next steps                                │
│ - GitHub issue opens in context                             │
│ - "Claim task" button ready                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration

### Environment Variables

```bash
# LEO Kit
LEO_GITHUB_TOKEN=ghp_xxx
LEO_ANTHROPIC_KEY=sk-xxx
LEO_MODEL_PREFERENCE=opus-4-5

# OpenCode (if self-hosted)
NEXT_PUBLIC_OPENCODE_API=https://opencode.yourhost.com
OPENCODE_API_KEY=xxx

# Morphy
NEXT_PUBLIC_MORPHY_API=https://api.morphy.ai
MORPHY_API_KEY=xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Realtime
NEXT_PUBLIC_SUPABASE_REALTIME_URL=wss://xxx.supabase.co/realtime/v1

# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

---

## 📝 Development Checklist

- [ ] Install leo-workflow-kit@5.0.0 as dependency
- [ ] Create `packages/leo-client` wrapper
- [ ] Implement Orchestrator class
- [ ] Create Next.js API routes
- [ ] Embed OpenCode in editor page
- [ ] Integrate Morphy chat sidebar
- [ ] Set up Yjs + Supabase Realtime
- [ ] Implement awareness (presence)
- [ ] Create workflow creation flow
- [ ] Add task assignment UI
- [ ] Implement real-time sync
- [ ] Test multi-user collaboration
- [ ] Deploy to staging
- [ ] Gather feedback

---

**Last Updated**: October 24, 2025
