# 🦁 LionPack Studio

> **Vibe Coding App** — Where AI, Collaboration, and Workflow Automation Unite

[![Status](https://img.shields.io/badge/status-early%20access-yellow)](.)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)

**LionPack Studio** is a collaborative web IDE that merges **LEO Kit workflow automation**, **OpenCode editor environment**, and **Morphy AI assistant** into one seamless creative space for teams and solo builders.

## 🎯 Vision

*To empower creators and small teams to build and ship ideas at the speed of thought — harnessing AI and human collaboration to turn imagination into reality.*

## 🚀 Mission

*We design tools that remove friction between creativity and execution. LionPack Studio merges AI, collaboration, and automation into one seamless workspace — where ideas evolve naturally into products.*

## 💎 Core Values

| Value | Description |
|-------|-------------|
| **Facilitation** | We simplify complexity — guiding teams to focus on what matters, not on managing tools. |
| **Speed** | We value flow and momentum; every feature should accelerate creative output. |
| **Creativity** | We celebrate experimentation and playful problem-solving — the spark that drives innovation. |
| **Collaboration** | We believe in the strength of small, tightly aligned teams — "packs" that hunt together. |
| **Autonomy** | Tools should empower creators to work solo or in sync, without friction or dependency. |
| **Human + AI Synergy** | We see AI not as a replacement, but as a co-creator that amplifies human capability. |
| **Transparency & Openness** | We build on open-source foundations and open collaboration. |

## 🧠 LionPack Ethos

> *We build tools for those who move fast, think freely, and create together.*
> *One pack, one flow, one hunt.*

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
open http://localhost:3000
```

## 🤖 Integration Points

### LEO Kit Integration
LionPack Studio uses **leo-workflow-kit** (v5.0.0+) as the automation engine:
- Workflow orchestration
- Task routing
- Specification management
- GitHub Projects sync

### OpenCode Editor
Embedded **OpenCode** web IDE for:
- In-browser code editing
- Real-time syntax highlighting
- Project file navigation
- Terminal integration

### Morphy AI Assistant
AI-powered chat layer for:
- Contextual code suggestions
- Architecture recommendations
- Workflow guidance
- Pack management

### Real-time Collaboration
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
- ✅ **Code Editor** - OpenCode embedded IDE
- ✅ **AI Assistant** - Morphy chat for guidance & suggestions
- ✅ **Real-time Collaboration** - Work solo or sync with team
- ✅ **Pack Management** - Role-based task distribution
- ✅ **Spec-First Development** - Guided planning before coding
- ✅ **GitHub Sync** - Automatic issue & project tracking
- ✅ **Multi-Model AI** - Claude 3.5/4/4.5/Haiku support

---

## 📚 Documentation

- **[Architecture Overview](docs/ARCHITECTURE.md)** — System design & component interactions
- **[Integration Guide](docs/INTEGRATION.md)** — LEO Kit + OpenCode + Morphy setup
- **[Development Roadmap](docs/ROADMAP.md)** — Phased approach (Phase 1-5)
- **[Quick Start Guide](docs/QUICK_START.md)** — Local development setup
- **[API Reference](docs/API.md)** — LEO Client API

---

## 🔄 Phased Approach

| Phase | Focus | Duration | Deliverable |
|-------|-------|----------|-------------|
| **Phase 1** | LEO integration as API | 2 weeks | Working backend API |
| **Phase 2** | OpenCode embedding | 2 weeks | Editor + frontend shell |
| **Phase 3** | Pack logic + Morphy | 3 weeks | Full collaboration |
| **Phase 4** | Polish & themes | 2 weeks | Production UI |
| **Phase 5** | Launch & feedback | 1 week | v1.0 Release |

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

**Status**: 🚧 Early Access (Phase 1 - Backend Integration)
**Latest Release**: v0.1.0
**Last Updated**: October 24, 2025
