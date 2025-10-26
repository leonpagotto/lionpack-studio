# 🦁 LionPack Studio

> **Vibe Coding App** — Where AI, Collaboration, and Workflow Automation Unite

[![Status](https://img.shields.io/badge/status-early%20access-yellow)](.)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)

**LionPack Studio** is a collaborative web IDE that merges **LEO Kit workflow automation**, **OpenCode editor environment**, and **Morphy AI assistant** into one seamless creative space for teams and solo builders.

> **Latest Update (Oct 26, 2025):** 
> - ✅ **Story 3.9 Complete** — Morphic chat + Kilo Code editor UI with Tailwind CSS styling
> - 🚀 **Next Up:** Story 3.10 (Multi-AI Provider Support - Gemini) & Story 3.11 (File System Integration)
> - 🎨 **Demo:** http://localhost:3000/demo/professional-workflow

## 🎯 Vision

_To empower creators and small teams to build and ship ideas at the speed of thought — harnessing AI and human collaboration to turn imagination into reality._

## 🚀 Mission

_We design tools that remove friction between creativity and execution. LionPack Studio merges AI, collaboration, and automation into one seamless workspace — where ideas evolve naturally into products._

## 💎 Core Values

| Value                       | Description                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| **Facilitation**            | We simplify complexity — guiding teams to focus on what matters, not on managing tools.      |
| **Speed**                   | We value flow and momentum; every feature should accelerate creative output.                 |
| **Creativity**              | We celebrate experimentation and playful problem-solving — the spark that drives innovation. |
| **Collaboration**           | We believe in the strength of small, tightly aligned teams — "packs" that hunt together.     |
| **Autonomy**                | Tools should empower creators to work solo or in sync, without friction or dependency.       |
| **Human + AI Synergy**      | We see AI not as a replacement, but as a co-creator that amplifies human capability.         |
| **Transparency & Openness** | We build on open-source foundations and open collaboration.                                  |

## 🧠 LionPack Ethos

> _We build tools for those who move fast, think freely, and create together._
> _One pack, one flow, one hunt._

---

## 📦 Project Structure

```
lionpack-studio/
├── apps/
│   ├── web/              # Next.js frontend + UI layer
│   │   ├── pages/
│   │   ├── components/
│   │   ├── styles/
│   │   └── public/
│   └── api/              # Node.js backend (optional for advanced scenarios)
├── packages/
│   ├── leo-client/       # LEO Kit integration layer
│   ├── ui/               # Shared React components
│   ├── types/            # Shared TypeScript types
│   └── editor/           # OpenCode editor wrapper
├── docs/
│   ├── ARCHITECTURE.md   # System design & component interactions
│   ├── INTEGRATION.md    # LEO Kit + OpenCode + Morphy integration
│   ├── ROADMAP.md        # Phased development plan
│   └── QUICK_START.md    # Development setup guide
├── docker/               # Docker configuration
├── scripts/              # Setup & automation scripts
└── tests/                # Shared test utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker (optional, for containerized development)
- Git

### Local Development

```bash
# Clone repository
git clone https://github.com/leonpagotto/lionpack-studio.git
cd lionpack-studio

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development environment
npm run dev

# Open in browser
open http://localhost:3000/demo/professional-workflow
```

## ✨ Current Features

### Story 3.9: Professional Workflow UI ✅

**Morphic-Style Chat (Left 40%)**
- Clean chat interface for code generation prompts
- Message history display
- Streaming response support
- Error handling with user-friendly messages

**Kilo Code-Style Editor (Right 60%)**
- Tabbed interface (Files / Code / Terminal)
- File tree visualization
- Code editor with syntax highlighting
- Terminal output display
- Test results panel

**Integrated Layout**
- Split-pane responsive design
- Dark mode support
- Professional styling with Tailwind CSS
- Real-time code generation workflow

### Coming Soon 🚀

**Story 3.10: Multi-AI Provider Support** ([#22](https://github.com/leonpagotto/lionpack-studio/issues/22))
- Google Gemini integration (gemini-pro, gemini-flash, gemini-ultra)
- Provider selection UI (Claude, Gemini, GPT-4)
- Dynamic model selection based on provider
- Unified AIProvider interface

**Story 3.11: File System Integration** ([#23](https://github.com/leonpagotto/lionpack-studio/issues/23))
- Local file system access (Browser File System API)
- GitHub repository integration
- Real-time file tree synchronization
- File create/edit/delete operations
- Commit and push to GitHub
- Pull request creation

## 🤖 Integration Points

### LEO Kit Integration

LionPack Studio uses **leo-workflow-kit** (v5.0.0+) as the automation engine:

- Workflow orchestration
- Task routing
- Specification management
- GitHub Projects sync

### AI Providers (Planned)

Multi-provider support for flexibility:

- **Anthropic Claude** — claude-3-5-sonnet, claude-3-opus (current)
- **Google Gemini** — gemini-pro, gemini-flash, gemini-ultra (Story 3.10)
- **OpenAI GPT** — gpt-4, gpt-4-turbo (planned)

### Real-time Collaboration (Phase 3)

**Yjs + Supabase Realtime** for:

- Multi-user editing
- Live presence awareness
- Operational transformation
- Pack-based role management

---

## 🧩 Core Components

### 1. **Leo Client** (`packages/leo-client/`)

Wrapper around LEO Kit that exposes:

- Workflow automation APIs
- Task management
- Specification generation
- GitHub integration

### 2. **Web Frontend** (`apps/web/`)

Next.js application with:

- Integrated OpenCode editor
- Morphy AI chat sidebar
- Collaborative workspace
- Pack management UI
- Real-time presence

### 3. **Shared Types** (`packages/types/`)

TypeScript definitions for:

- Pack structures
- Workflow states
- User roles
- Collaboration events

### 4. **UI Library** (`packages/ui/`)

Reusable components:

- Editor sidebar
- Chat interface
- Workspace layouts
- Status indicators

---

## 🦁 Features

- ✅ **AI-Powered Workflow** - Multi-agent orchestration via LEO Kit
- ✅ **Code Editor** - OpenCode embedded IDE + Kilo Code split-view layout
- ✅ **AI Assistant** - Morphy chat for guidance & suggestions
- ✅ **Morphic Chat Interface** - Real-time code generation with streaming (Story 3.9 Phase 4)
- ✅ **Real-time Collaboration** - Work solo or sync with team
- ✅ **Pack Management** - Role-based task distribution
- ✅ **Spec-First Development** - Guided planning before coding
- ✅ **GitHub Sync** - Automatic issue & project tracking
- ✅ **Multi-Model AI** - Claude 3.5/4/4.5/Haiku support
- ✅ **Professional Workflow** - Integrated demo with 27/27 tests passing

---

## 📚 Documentation

- **[Architecture Overview](docs/ARCHITECTURE.md)** — System design & component interactions
- **[Integration Guide](docs/INTEGRATION.md)** — LEO Kit + OpenCode + Morphy setup
- **[Story 3.9 Verification](STORY_3.9_VERIFICATION_COMPLETE.md)** — Phase 4 component integration details
- **[Story 3.9 Status](README_STORY_3.9_STATUS.md)** — Quick reference status guide
- **[Phase 4 Report](PHASE_4_COMPLETION_REPORT.md)** — Comprehensive technical report
- **[Development Roadmap](docs/ROADMAP.md)** — Phased approach (Phase 1-5)
- **[Quick Start Guide](docs/QUICK_START.md)** — Local development setup
- **[API Reference](docs/API.md)** — LEO Client API

---

## 🔄 Phased Approach

| Phase       | Focus                  | Status         | Deliverable                                                       |
| ----------- | ---------------------- | -------------- | ----------------------------------------------------------------- |
| **Phase 1** | LEO integration as API | ✅ Complete    | Working backend API + Mode Router (Story 3.8)                     |
| **Phase 2** | OpenCode embedding     | ✅ Complete    | Editor + frontend shell + Coder Agent (Story 3.9 P1-3)            |
| **Phase 3** | Pack logic + Morphy    | ✅ Complete    | Full integration foundation                                       |
| **Phase 4** | Component Integration  | ✅ Complete    | Morphic chat + Kilo Editor + Professional Workflow (Story 3.9 P4) |
| **Phase 5** | Polish & Performance   | 🟡 In Progress | Performance optimization & accessibility                          |

---

## 🛠️ Development

### Available Commands

```bash
npm run dev        # Start dev environment (all apps)
npm run build      # Build all packages
npm run test       # Run all tests
npm run lint       # Lint codebase
npm run format     # Format code with Prettier
npm run clean      # Clean build artifacts
npm run setup      # Run setup script
```

### Docker Development

```bash
# Build containers
npm run docker:build

# Start services (PostgreSQL, Redis, etc.)
npm run docker:up

# Stop services
npm run docker:down
```

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT — See [LICENSE](LICENSE) for details.

---

## 🔗 Related Projects

- **[LEO Kit](https://github.com/leonpagotto/leo-kit)** — Workflow automation CLI
- **[OpenCode](https://github.com/sst/opencode)** — Web IDE framework
- **[Morphy](https://morphy.ai)** — AI chat layer (external)

---

## 👥 Team

Built with ❤️ by the LionPack community.

---

**Status**: � Phase 4 Complete - Component Integration (Phase 5 Pending)
**Current Story**: Story 3.9 - Professional Workflow Demo
**Branch**: feature/story-3.9-coder-agent
**Tests Passing**: 27/27 (100%) ✅
**Latest Release**: v0.2.0-beta (Phase 4 Integration)
**Last Updated**: October 26, 2025

---

## 🚀 Demo Page

Try the integrated professional workflow demo:

```bash
# Start dev server
npm run dev

# Open in browser
open http://localhost:3000/demo/professional-workflow
```

**Features:**

- 💬 Live chat interface with code generation prompts
- 📁 File tree with syntax-highlighted code display
- 🧪 Terminal showing test results and output
- ⚡ Resizable split-pane layout (40/60 split)
- 🎨 Dark mode support
- 📱 Mobile responsive design
