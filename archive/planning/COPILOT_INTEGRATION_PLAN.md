# GitHub Copilot Integration Plan

## Overview

Integrate GitHub Copilot functionality into LionPack Studio, allowing users to authenticate with their GitHub account and receive AI-powered code suggestions similar to VS Code.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LionPack Studio                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌─────────────────┐         │
│  │  CodeEditor  │────────▶│ Copilot Service │         │
│  │              │         │                 │         │
│  │ - Inline     │         │ - Suggestions   │         │
│  │   suggestions│         │ - Completions   │         │
│  │ - Tab accept │         │ - Chat          │         │
│  └──────────────┘         └─────────────────┘         │
│         │                          │                   │
│         │                          ▼                   │
│         │                 ┌────────────────┐          │
│         └────────────────▶│  GitHub OAuth  │          │
│                           │                │          │
│                           │ - Auth flow    │          │
│                           │ - Token mgmt   │          │
│                           └────────────────┘          │
│                                    │                   │
└────────────────────────────────────┼───────────────────┘
                                     │
                                     ▼
                          ┌──────────────────┐
                          │  GitHub API      │
                          │                  │
                          │ - Copilot API    │
                          │ - User info      │
                          └──────────────────┘
```

## Implementation Phases

### Phase 1: GitHub OAuth Setup (30 minutes)

- ✅ Already have GitHub OAuth flow in `/api/auth/github/`
- ✅ Need to add Copilot scopes to OAuth request
- ✅ Store GitHub token in session/database

### Phase 2: Copilot API Client (1 hour)

- Create `CopilotProvider` class similar to `GeminiProvider`
- Implement completion endpoint
- Implement chat endpoint
- Handle token refresh

### Phase 3: CodeEditor Integration (1.5 hours)

- Add inline suggestion rendering
- Implement Tab to accept suggestion
- Add keyboard shortcuts (Alt+] for next, Alt+[ for previous)
- Show Copilot status indicator

### Phase 4: UI/UX Enhancements (1 hour)

- Add "Sign in to GitHub Copilot" button
- Show Copilot status in status bar
- Add settings for Copilot (enable/disable, suggestion delay)
- Add Copilot icon/badge when active

### Phase 5: File System Integration (2 hours)

- Wire FileTree to `/api/files` endpoints
- Connect CodeEditor to load real files
- Add save functionality (Cmd/Ctrl+S)
- Add file operations (create, delete, rename)

## Technical Details

### GitHub Copilot API

**Note:** GitHub Copilot uses a proprietary API that requires:

1. GitHub Copilot subscription
2. Special OAuth scopes
3. Access to `https://copilot-proxy.githubusercontent.com/`

**Alternative Approach:**
Since we don't have direct access to GitHub Copilot API, we'll create a **Copilot-like experience** using:

- GitHub Codex API (if available)
- OpenAI Codex API
- Google Gemini for code completions
- Our existing AI chat infrastructure

### Implementation Strategy

**Short-term (MVP):**

1. Use Gemini/GPT for code completions
2. Implement inline suggestion UI
3. Add "Copilot-like" UX

**Long-term (if GitHub provides API access):**

1. Integrate official GitHub Copilot API
2. Add GitHub authentication for Copilot subscription verification

## File Structure

```
apps/web/
├── pages/
│   └── api/
│       ├── copilot/
│       │   ├── completions.ts    # Code completion endpoint
│       │   ├── chat.ts            # Copilot chat endpoint
│       │   └── status.ts          # Check user's Copilot status
│       └── auth/
│           └── github/
│               ├── login.ts       # ✅ Already exists
│               └── callback.ts    # ✅ Already exists
├── components/
│   ├── Copilot/
│   │   ├── InlineSuggestion.tsx  # NEW: Inline suggestion overlay
│   │   ├── CopilotStatus.tsx     # NEW: Status indicator
│   │   └── CopilotSettings.tsx   # NEW: Settings panel
│   └── KiloEditor/
│       └── CodeEditor.tsx         # MODIFY: Add Copilot integration
└── lib/
    └── copilot/
        ├── copilot-client.ts      # NEW: Copilot API client
        └── suggestion-engine.ts   # NEW: Suggestion logic

packages/leo-client/src/lib/
├── copilot-provider.ts            # NEW: Copilot provider
└── code-completion.ts             # NEW: Code completion logic
```

## API Endpoints

### 1. POST `/api/copilot/completions`

Get code completions for current cursor position.

**Request:**

```json
{
  "code": "function add(a, b) {\n  ",
  "language": "typescript",
  "cursorPosition": { "line": 1, "column": 2 },
  "context": {
    "fileName": "math.ts",
    "imports": ["..."],
    "nearbyCode": "..."
  }
}
```

**Response:**

```json
{
  "completions": [
    {
      "text": "return a + b;",
      "displayText": "return a + b;",
      "position": { "line": 1, "column": 2 },
      "range": {
        "start": { "line": 1, "column": 2 },
        "end": { "line": 1, "column": 2 }
      }
    }
  ],
  "model": "gemini-2.5-flash"
}
```

### 2. POST `/api/copilot/chat`

Copilot chat for explanations and refactoring suggestions.

**Request:**

```json
{
  "message": "Explain this code",
  "code": "const result = arr.reduce((acc, val) => acc + val, 0);",
  "language": "typescript"
}
```

**Response:**

```json
{
  "response": "This code uses the reduce method to sum all values in the array...",
  "suggestions": [
    {
      "title": "Add type annotations",
      "code": "const result: number = arr.reduce((acc: number, val: number) => acc + val, 0);"
    }
  ]
}
```

### 3. GET `/api/copilot/status`

Check user's Copilot authentication status.

**Response:**

```json
{
  "authenticated": true,
  "githubUser": "username",
  "copilotEnabled": true,
  "plan": "individual" // or "business" or "none"
}
```

## UI Components

### InlineSuggestion Component

```tsx
interface InlineSuggestionProps {
  suggestion: string;
  position: { line: number; column: number };
  onAccept: () => void;
  onReject: () => void;
}

// Renders ghost text inline with code
// Tab to accept, Esc to reject
```

### CopilotStatus Component

```tsx
// Shows in status bar:
// 🤖 Copilot: Ready  (active)
// 🤖 Copilot: Disabled
// 🤖 Sign in to Copilot (not authenticated)
```

## Keyboard Shortcuts

- **Tab**: Accept current suggestion
- **Esc**: Reject current suggestion
- **Alt + ]**: Next suggestion
- **Alt + [**: Previous suggestion
- **Ctrl + Enter**: Open Copilot chat
- **Cmd/Ctrl + S**: Save file

## Security Considerations

1. **Token Storage**: Store GitHub tokens securely (encrypted in database)
2. **Scope Limitations**: Request minimal OAuth scopes
3. **Rate Limiting**: Implement rate limiting for Copilot API calls
4. **Code Privacy**: Warn users about code being sent to AI services
5. **Subscription Verification**: Check GitHub Copilot subscription status

## Testing Strategy

1. **Unit Tests**: Test Copilot provider, completion logic
2. **Integration Tests**: Test GitHub OAuth flow
3. **E2E Tests**: Test inline suggestions, acceptance flow
4. **Manual Testing**: Test in real coding scenarios

## Rollout Plan

### Week 1: MVP

- ✅ GitHub OAuth with Copilot scopes
- ✅ Basic code completion with Gemini
- ✅ Inline suggestion UI
- ✅ Tab to accept

### Week 2: Enhancement

- ✅ Multi-line suggestions
- ✅ Context-aware completions
- ✅ Copilot chat
- ✅ Settings panel

### Week 3: Polish

- ✅ Performance optimization
- ✅ Better suggestion ranking
- ✅ Keyboard shortcuts
- ✅ Status indicators

## Success Metrics

- ✅ Inline suggestions appear < 500ms after typing stops
- ✅ Suggestion acceptance rate > 30%
- ✅ GitHub OAuth success rate > 95%
- ✅ Zero token leakage incidents
- ✅ User satisfaction score > 4/5

## Notes

**GitHub Copilot API Access:**

- As of 2025, GitHub Copilot API is not publicly available
- We'll use Gemini/GPT as the AI backend
- UI/UX will match GitHub Copilot experience
- If GitHub releases public API, we'll integrate it

**Alternative: GitHub Codex**

- GitHub Models API may provide Codex access
- Need to investigate availability and pricing

**Fallback Plan:**

- Use existing Gemini integration for completions
- Focus on UX that mimics Copilot
- Add GitHub branding only if official API available
