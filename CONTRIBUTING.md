# Contributing to LionPack Studio

Thank you for your interest in contributing! Here's how to get involved.

## Code of Conduct

We're committed to providing a welcoming and inclusive environment. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your feature: `git checkout -b feature/your-feature`
4. **Make changes** following our guidelines
5. **Commit** with clear messages
6. **Push** to your fork
7. **Open a PR** with detailed description

## Development Setup

See [QUICK_START.md](docs/QUICK_START.md) for setup instructions.

## Code Style

- **TypeScript** — Always use `.ts` or `.tsx`
- **Prettier** — Format before committing: `npm run format`
- **ESLint** — Fix issues: `npm run lint`
- **Comments** — Explain the "why", not the "what"

## Commit Messages

Follow conventional commits:

```
type(scope): brief description

Optional longer explanation here.

Related: #42
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
- `feat(leo-client): add multi-model orchestrator`
- `fix(editor): resolve file sync race condition`
- `docs(roadmap): update Phase 1 timeline`

## Testing

All changes require tests:

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

**Coverage target**: > 80%

## Pull Request Process

1. **Branch naming**: `feature/*, fix/*, docs/*`
2. **Keep focused** — One feature per PR
3. **Describe changes** — Clear PR description with:
   - What changed and why
   - How to test
   - Related issues (#42)
4. **Pass checks** — All CI must pass
5. **Wait for review** — Usually 24-48 hours

## Documentation

- **README updates** — If changing usage
- **Architecture changes** — Update `docs/ARCHITECTURE.md`
- **API changes** — Update `docs/INTEGRATION.md`
- **New features** — Add to roadmap if significant

## Performance

Before submitting, check:

- **Bundle size** — No significant increases
- **Runtime performance** — Profile with DevTools
- **Database queries** — Avoid N+1 queries
- **Memory leaks** — Test in DevTools

## Questions?

- **Documentation** — Check `docs/` folder
- **Issues** — Search existing, then open new
- **Discussions** — Use GitHub Discussions
- **Email** — Contact maintainers

---

**Thank you for helping make LionPack Studio better!** 🦁
