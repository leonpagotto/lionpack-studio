# LionPack Studio Quick Start

Get started with LionPack Studio development in minutes.

## 📋 Prerequisites

- Node.js 18+
- npm 9+
- Git
- GitHub account
- GitHub Personal Access Token (with `repo` + `workflow` scopes)
- Anthropic API key (for Claude integration)

## 🚀 Setup (5 minutes)

### 1. Clone & Install

```bash
git clone https://github.com/leonpagotto/lionpack-studio.git
cd lionpack-studio
npm install
```

### 2. Configure Environment

```bash
# Copy template
cp .env.example .env.local

# Edit with your tokens
nano .env.local
```

**Required variables:**

```bash
# LEO Kit
LEO_GITHUB_TOKEN=ghp_xxxxx           # GitHub Personal Access Token
LEO_ANTHROPIC_KEY=sk-ant-xxxxx       # Anthropic API key
LEO_MODEL_PREFERENCE=opus-4-5        # Default: sonnet

# Supabase (Phase 2+)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# GitHub OAuth (Phase 2+)
NEXT_PUBLIC_GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

### 3. Start Development

```bash
# Start all services in dev mode
npm run dev

# Or individually:
npm run dev:leo-client      # Test LEO client
npm run dev:api             # API server (Phase 1)
npm run dev:web             # Frontend (Phase 2+)
```

## 📦 Project Structure

```
lionpack-studio/
├── apps/
│   ├── web/          # Next.js frontend (Phase 2+)
│   └── api/          # Node backend (Phase 2+)
├── packages/
│   ├── leo-client/   # LEO Kit wrapper (Phase 1)
│   ├── types/        # Shared types
│   └── ui/           # Shared components
├── docs/
│   ├── FRAMEWORK.md      # Vision & values
│   ├── ARCHITECTURE.md   # System design
│   ├── INTEGRATION.md    # LEO + OpenCode + Morphy
│   └── ROADMAP.md        # Development plan
└── docker/           # Docker Compose
```

## 🛠️ Common Commands

```bash
# Development
npm run dev            # Start all services
npm run build          # Build all packages
npm run test           # Run all tests
npm run lint           # Lint codebase
npm run format         # Format with Prettier

# Docker
npm run docker:build   # Build containers
npm run docker:up      # Start services
npm run docker:down    # Stop services

# Utility
npm run clean          # Clean artifacts
npm run setup          # Run setup script
```

## 🧪 Testing LEO Client (Phase 1)

### Test Spec Generation

```bash
# From root
cd packages/leo-client
npm test -- spec-generator.test.ts
```

### Test API Integration

```bash
# Start dev server
npm run dev:api

# In another terminal
curl -X POST http://localhost:3000/api/workflows/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Workflow",
    "description": "Add login feature with OAuth",
    "model": "opus-4-5"
  }'
```

## 📚 Documentation

- **[Framework & Philosophy](./FRAMEWORK.md)** — Vision, mission, values
- **[Architecture](./ARCHITECTURE.md)** — System design & components
- **[Integration Guide](./INTEGRATION.md)** — LEO + OpenCode + Morphy
- **[Roadmap](./ROADMAP.md)** — Development phases

## 🚀 Next Steps

1. **Review Framework** — Read [FRAMEWORK.md](./FRAMEWORK.md) to understand philosophy
2. **Understand Architecture** — Study [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Check Roadmap** — See what's planned in [ROADMAP.md](./ROADMAP.md)
4. **Start Phase 1** — Begin with `packages/leo-client` implementation

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Environment Variables Missing

```bash
# Check what's needed
cat .env.example

# Copy any missing to .env.local
```

### Dependencies Won't Install

```bash
# Clear cache and reinstall
npm run clean
npm install
```

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📝 License

MIT — See [LICENSE](../LICENSE)

---

**Questions?** Open an issue or check the [documentation](./README.md).

**Last Updated**: October 24, 2025
