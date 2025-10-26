# 🦁 LionPack Studio

> **Vibe Coding App** — Where AI, Collaboration, and Workflow Automation Unite

[![Status](https://img.shields.io/badge/status-early%20access-yellow)](.)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)

**LionPack Studio** is a collaborative web IDE that merges **LEO Kit workflow automation**, **OpenCode editor environment**, and **Morphy AI assistant** into one seamless creative space for teams and solo builders.

> **Latest Update (Oct 26, 2025):**
>
> - ✅ **Story 3.9 Complete** — Morphic chat + Kilo Code editor UI with Tailwind CSS styling
> - 🚀 **Next Up:** Story 3.10 (Multi-AI Provider Support - Gemini) & Story 3.11 (File System Integration)
> - 🎨 **Demo:** http://localhost:3000/demo/professional-workflow

## 🧭 Vision

> **To empower small teams and individual creators to build high-quality software at the speed of thought — combining human creativity, AI collaboration, and shared design standards.**

LionPack Studio is where _speed meets structure_. We envision a world where developers don't have to choose between moving fast and maintaining excellence — where AI helps teams stay consistent, creative, and confident in every line of code and every interface decision.

## 🎯 Mission

> **To simplify and accelerate the creative development process while keeping code, design, and user experience standards consistent across every project.**

We're building an open, lovable, and AI-native development environment that unifies:

- **LEO Kit automation** for instant workflow orchestration
- **OpenCode** as a collaborative IDE foundation
- **GitHub** as the trusted source of truth for code and tasks

LionPack Studio helps creators:

- Generate ideas, code, and UX flows faster
- Stay aligned with best practices and team standards
- Deliver applications that are consistent, clean, and user-centered

Every pack — whether a solo developer or a team of four — can move from concept to deployment with flow, focus, and full creative control.

## 💎 Core Values

| Value                            | Description                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Speed with Purpose**           | Every tool and feature must help creators move from idea to impact — without friction or delay.                            |
| **Facilitation over Complexity** | The platform should feel like guidance, not governance. We simplify the process so creators can focus on what matters.     |
| **Quality through Standards**    | Built-in code and UX "constitutions" define best practices per language or framework, ensuring excellence and consistency. |
| **Creativity + Structure**       | We balance AI-powered automation with the freedom to explore — order without rigidity.                                     |
| **Collaboration**                | Small, tight-knit packs (1–4 creators) working in perfect sync — each playing a role in the flow.                          |
| **Empowerment**                  | We believe everyone should be able to bring ideas to life — fast, independently, and beautifully.                          |
| **Openness**                     | Built on open-source technologies, guided by transparency and shared progress.                                             |

## 🌍 Our Promise

> LionPack Studio exists to help humans and AI co-create — fast, consistent, and joyful.
> It's not just a coding environment — it's a **creative ecosystem** where clarity, flow, and quality coexist.

**Read the full vision:** [VISION.md](docs/VISION.md)

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
