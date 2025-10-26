# LionPack Studio Wiki Structure

> **GitHub Wiki Pages Setup Guide**

This document outlines the recommended structure for the LionPack Studio GitHub Wiki.

---

## 📚 Wiki Home Page

**URL:** `https://github.com/leonpagotto/lionpack-studio/wiki`

**Content:**

```markdown
# Welcome to LionPack Studio

> **Development Culture in a Box** — Where speed meets structure.

LionPack Studio empowers small teams and solo developers to build high-quality software at the speed of thought — combining human creativity, AI collaboration, and shared design standards.

## 🚀 Quick Links

- **[Vision & Mission](Vision-and-Mission)** — Our North Star
- **[Getting Started](Getting-Started)** — Installation and first steps
- **[Constitution System](Constitution-System)** — Standards and AI alignment
- **[Roadmap](Roadmap)** — Development phases and timeline
- **[Contributing](Contributing)** — How to contribute

## 📖 Documentation

### For Users

- [Installation Guide](Installation-Guide)
- [Quick Start Tutorial](Quick-Start-Tutorial)
- [Constitution Templates](Constitution-Templates)
- [Keyboard Shortcuts](Keyboard-Shortcuts)
- [FAQ](FAQ)

### For Developers

- [Architecture Overview](Architecture-Overview)
- [API Reference](API-Reference)
- [Contributing Guide](Contributing-Guide)
- [Development Setup](Development-Setup)
- [Testing Guide](Testing-Guide)

### Concepts

- [What is a Constitution?](What-is-a-Constitution)
- [AI Agent System](AI-Agent-System)
- [Pack-Based Collaboration](Pack-Based-Collaboration)
- [Workflow Automation](Workflow-Automation)

## 🦁 Philosophy

LionPack Studio is built on seven core values:

1. **Speed with Purpose** — Fast without sacrificing quality
2. **Facilitation over Complexity** — Guidance, not governance
3. **Quality through Standards** — Constitution-driven excellence
4. **Creativity + Structure** — Automation with freedom
5. **Collaboration** — Small packs working in sync
6. **Empowerment** — Solo developers can ship beautifully
7. **Openness** — Built on open-source foundations

[Read the full vision →](Vision-and-Mission)

## 🌟 Features

- **AI-Powered Code Generation** — Context-aware, standards-compliant
- **Constitution System** — Define your standards once, enforce everywhere
- **Real-Time Collaboration** — Multi-user editing with awareness
- **Workflow Automation** — LEO Kit integration for instant orchestration
- **GitHub Integration** — Issues, PRs, and projects in one place

## 💬 Community

- [GitHub Discussions](https://github.com/leonpagotto/lionpack-studio/discussions)
- [Discord Server](https://discord.gg/lionpack) (coming soon)
- [Twitter/X](https://twitter.com/lionpackstudio)

---

**Last Updated:** October 26, 2025 | [Edit this page](https://github.com/leonpagotto/lionpack-studio/wiki/Home/_edit)
```

---

## 📄 Vision and Mission Page

**URL:** `https://github.com/leonpagotto/lionpack-studio/wiki/Vision-and-Mission`

**Content:** Copy from `docs/VISION.md` (first 2000 words)

```markdown
# Vision, Mission & Values

[Copy content from docs/VISION.md]
```

---

## 🏗️ Constitution System Page

**URL:** `https://github.com/leonpagotto/lionpack-studio/wiki/Constitution-System`

**Content:**

```markdown
# Constitution System

> **Development Standards in a Single File**

## What is a Constitution?

A Constitution is a declarative YAML file (`.lionpack/constitution.yml`) that defines your project's:

- **Technical Stack** — Languages, frameworks, versions
- **Code Standards** — Formatting, linting, naming conventions
- **UX/UI Principles** — Design system, accessibility, responsive design
- **AI Agent Alignment** — What "good code" means for your project
- **Testing Requirements** — Coverage, test types, strategies
- **Performance Budgets** — Core Web Vitals, bundle size limits

## Why Use Constitutions?

### For Solo Developers

- ✅ Define your coding style once
- ✅ AI becomes your senior developer pair programmer
- ✅ Consistency across all projects
- ✅ Less decision fatigue

### For Teams

- ✅ Onboard new developers instantly
- ✅ No more style guide debates
- ✅ Automated code review for standards
- ✅ Focus reviews on logic, not formatting

### For AI Agents

- ✅ Clear instructions on what "good" means
- ✅ Context-aware suggestions
- ✅ Aligned with project goals
- ✅ Continuous learning from feedback

## Example Constitution

[Copy example from docs/CONSTITUTION_TEMPLATE.md]

## How AI Uses Your Constitution

[Add workflow diagram and examples]

## Constitution Templates

Browse community templates:

- [Next.js SaaS Starter](Constitution-Templates#nextjs-saas)
- [React Component Library](Constitution-Templates#react-library)
- [Mobile-First PWA](Constitution-Templates#mobile-pwa)
- [Enterprise Dashboard](Constitution-Templates#enterprise)

[Read the full template guide →](Constitution-Templates)
```

---

## 📖 Getting Started Page

**URL:** `https://github.com/leonpagotto/lionpack-studio/wiki/Getting-Started`

**Content:**

```markdown
# Getting Started

Get up and running with LionPack Studio in under 5 minutes.

## Prerequisites

- Node.js 18+ and npm 9+
- Git
- GitHub account
- (Optional) Docker for containerized development

## Installation

### Step 1: Clone Repository

\`\`\`bash
git clone https://github.com/leonpagotto/lionpack-studio.git
cd lionpack-studio
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 3: Environment Setup

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` and add your API keys:

- `ANTHROPIC_API_KEY` — Get from https://console.anthropic.com
- `GITHUB_TOKEN` — Generate at https://github.com/settings/tokens

### Step 4: Start Development Server

\`\`\`bash
npm run dev
\`\`\`

### Step 5: Open in Browser

Navigate to http://localhost:3000/demo/professional-workflow

## Your First Project

### Create a Constitution

\`\`\`bash
mkdir -p .lionpack
cp docs/CONSTITUTION_TEMPLATE.md .lionpack/constitution.yml
\`\`\`

Edit `.lionpack/constitution.yml` to match your project.

### Generate Your First Component

[Add tutorial steps]

## Next Steps

- [Read the Vision](Vision-and-Mission)
- [Explore Constitution System](Constitution-System)
- [View Roadmap](Roadmap)
- [Join Community](https://github.com/leonpagotto/lionpack-studio/discussions)
```

---

## 🗺️ Roadmap Page

**URL:** `https://github.com/leonpagotto/lionpack-studio/wiki/Roadmap`

**Content:** Copy from `docs/ROADMAP.md`

---

## 🤝 Contributing Page

**URL:** `https://github.com/leonpagotto/lionpack-studio/wiki/Contributing`

**Content:** Copy from `CONTRIBUTING.md`

---

## 🏛️ Architecture Overview Page

**URL:** `https://github.com/leonpagotto/lionpack-studio/wiki/Architecture-Overview`

**Content:** Copy from `docs/ARCHITECTURE.md`

---

## ❓ FAQ Page

**URL:** `https://github.com/leonpagotto/lionpack-studio/wiki/FAQ`

**Content:**

```markdown
# Frequently Asked Questions

## General

### What is LionPack Studio?

LionPack Studio is a collaborative web IDE that combines AI-powered code generation, workflow automation, and real-time collaboration — all while enforcing your team's quality standards automatically.

### Is it free?

Yes! LionPack Studio is open-source (MIT License). You can use it for free, forever.

### What makes it different from VS Code / GitHub Copilot?

LionPack Studio is **constitution-aware** — AI agents read your project's standards file and enforce them automatically. It's not just code completion, it's culture enforcement.

## Constitution System

### What is a Constitution file?

A YAML file that defines your project's technical standards, design principles, and AI alignment rules. Think of it as a "DNA file" for your project.

### Do I need to create one?

No, but it's highly recommended. Without a constitution, AI agents use sensible defaults. With one, they follow YOUR standards.

### Can I share constitutions between projects?

Yes! Constitutions are portable. You can fork community templates or share your own.

## AI & Code Generation

### Which AI models are supported?

Currently:

- Anthropic Claude (3.5 Sonnet, Opus, Haiku)
- Google Gemini (coming in Story 3.10)
- OpenAI GPT-4 (planned)

### Does AI replace developers?

No. AI handles boilerplate and enforces standards. You handle creative logic and architecture.

### How does AI know my coding style?

It reads your `.lionpack/constitution.yml` file and learns from your feedback.

## Collaboration

### How many users can collaborate?

We recommend 1-4 users per "pack" (project team) for optimal flow.

### Does it work for solo developers?

Absolutely! Solo developers get an AI pair programmer that knows their standards.

## Technical

### What stack is it built on?

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS for styling
- LEO Kit for workflow automation
- Supabase for database and auth
- OpenCode for editor foundation

### Can I self-host it?

Yes! Full self-hosting instructions coming soon.

### Is my code stored on your servers?

No. Your code stays in your GitHub repositories. We don't store code.

## Pricing

### Is there a paid tier?

Not yet. LionPack Studio is currently free and open-source. Future plans may include:

- Pro features for teams
- Enterprise on-premises hosting
- Priority support

All core features will remain free forever.

---

**More questions?** Ask in [GitHub Discussions](https://github.com/leonpagotto/lionpack-studio/discussions)
```

---

## 📝 How to Set Up the Wiki

### Option 1: Manual Setup (GitHub UI)

1. Go to your repo: https://github.com/leonpagotto/lionpack-studio
2. Click the **Wiki** tab
3. Click **Create the first page**
4. Copy content from this document for each page
5. Create links between pages

### Option 2: Clone Wiki Repo (Git)

```bash
# Clone the wiki repository
git clone https://github.com/leonpagotto/lionpack-studio.wiki.git
cd lionpack-studio.wiki

# Create pages (as .md files)
touch Home.md
touch Vision-and-Mission.md
touch Constitution-System.md
touch Getting-Started.md
touch Roadmap.md
touch FAQ.md

# Copy content from this guide
# ...

# Commit and push
git add .
git commit -m "docs: initialize wiki structure"
git push origin master
```

### Option 3: Automated Script

```bash
# Create a script to auto-generate wiki pages
# (Coming soon)
```

---

## 🎨 Wiki Customization

### Sidebar Navigation

Create `_Sidebar.md` in the wiki repo:

```markdown
### 🦁 LionPack Studio

**Getting Started**

- [Home](Home)
- [Installation](Getting-Started)
- [Quick Start](Quick-Start-Tutorial)

**Core Concepts**

- [Vision](Vision-and-Mission)
- [Constitution System](Constitution-System)
- [AI Agents](AI-Agent-System)

**Guides**

- [Constitution Templates](Constitution-Templates)
- [Development Setup](Development-Setup)
- [Contributing](Contributing)

**Reference**

- [Architecture](Architecture-Overview)
- [API Reference](API-Reference)
- [Roadmap](Roadmap)
- [FAQ](FAQ)

**Community**

- [Discussions](https://github.com/leonpagotto/lionpack-studio/discussions)
- [Discord](https://discord.gg/lionpack)
```

### Footer

Create `_Footer.md`:

```markdown
---

🦁 [LionPack Studio](https://github.com/leonpagotto/lionpack-studio) | [Discussions](https://github.com/leonpagotto/lionpack-studio/discussions) | [Discord](https://discord.gg/lionpack) | MIT License
```

---

## 📊 Analytics & Tracking

Consider adding:

- Page view tracking (GitHub native)
- Search functionality (wiki built-in)
- Feedback widgets (Canny, UserVoice)

---

**Last Updated:** October 26, 2025
**Wiki Version:** 1.0.0

🦁 **One pack, one knowledge base, one hunt.**
