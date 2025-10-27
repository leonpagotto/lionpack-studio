# Security Guidelines - LionPack Studio

## 🔐 API Key Management

### ⚠️ NEVER COMMIT API KEYS

API keys, tokens, and secrets must **NEVER** be committed to the repository.

### Protected Files

The following files are in `.gitignore` and should **NEVER** be committed:

- `.env`
- `.env.local`
- `.env.*.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`

### How to Set Up API Keys

1. **Copy the template:**
   ```bash
   cp .env.example .env.local
   # OR
   cp .env.local.template .env.local
   ```

2. **Add your actual API keys** to `.env.local`:
   ```bash
   # Google Gemini API key
   GOOGLE_AI_API_KEY=AIzaSy... # Your actual key here
   
   # Anthropic Claude API key
   LEO_ANTHROPIC_KEY=sk-ant-... # Your actual key here
   
   # GitHub token
   LEO_GITHUB_TOKEN=ghp_... # Your actual token here
   ```

3. **Verify `.env.local` is ignored:**
   ```bash
   git check-ignore .env.local
   # Should output: .env.local
   ```

### Getting API Keys

| Service | Get API Key | Documentation |
|---------|-------------|---------------|
| **Google Gemini** | [Get Key](https://makersuite.google.com/app/apikey) | [Docs](https://ai.google.dev/docs) |
| **Anthropic Claude** | [Get Key](https://console.anthropic.com/) | [Docs](https://docs.anthropic.com/) |
| **GitHub** | [Create Token](https://github.com/settings/tokens?type=beta) | [Docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) |

## 🛡️ Pre-Commit Checklist

Before committing, always verify:

- [ ] **No API keys in code** - Run: `git diff | grep -E "AIza|sk-ant-|ghp_"`
- [ ] **No `.env` files staged** - Run: `git status | grep ".env"`
- [ ] **Check staged files** - Run: `git diff --cached`
- [ ] **Review commit message** - Ensure no sensitive info in messages

## 🔍 Scanning for Exposed Secrets

### Check your local files:
```bash
# Search for Gemini API keys
git grep -E "AIza[0-9A-Za-z_-]{35}" | grep -v ".example" | grep -v "truncated"

# Search for Anthropic API keys
git grep -E "sk-ant-[0-9A-Za-z_-]{95}"

# Search for GitHub tokens
git grep -E "ghp_[0-9A-Za-z]{36}"
```

### Check git history:
```bash
# Search entire git history for secrets
git log -p -S "AIzaSy" | grep -v "truncated"
```

## 🚨 If You Accidentally Commit an API Key

### Immediate Steps:

1. **Revoke the key immediately:**
   - Gemini: https://makersuite.google.com/app/apikey
   - Anthropic: https://console.anthropic.com/
   - GitHub: https://github.com/settings/tokens

2. **Remove from git history:**
   ```bash
   # If in the last commit:
   git reset --soft HEAD~1
   git restore --staged .env.local
   git commit -m "Your commit message"
   
   # If already pushed, you need to force push (⚠️ coordinate with team):
   git push --force
   ```

3. **Generate new API key** and update `.env.local`

4. **Never reuse compromised keys**

## 📋 Safe Documentation Practices

When documenting API usage:

✅ **GOOD - Use placeholders:**
```bash
GOOGLE_AI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GOOGLE_AI_API_KEY=AIzaSy...  # Truncated example
```

❌ **BAD - Real keys:**
```bash
GOOGLE_AI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  # Never commit real keys!
```

## 🔒 Environment Variable Prefixes

Understanding which variables are safe to expose:

| Prefix | Exposure | Example |
|--------|----------|---------|
| `NEXT_PUBLIC_*` | **Public** (browser) | `NEXT_PUBLIC_SUPABASE_URL` |
| No prefix | **Private** (server only) | `GOOGLE_AI_API_KEY` |

**Rule:** API keys and secrets should **NEVER** have `NEXT_PUBLIC_` prefix.

## 🛠️ Git Hooks for Protection

Consider setting up a pre-commit hook:

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Check for API keys
if git diff --cached | grep -E "AIza[0-9A-Za-z_-]{35}|sk-ant-[0-9A-Za-z_-]{95}|ghp_[0-9A-Za-z]{36}"; then
    echo "❌ ERROR: API key detected in staged changes!"
    echo "Remove the API key before committing."
    exit 1
fi

# Check for .env files
if git diff --cached --name-only | grep -E "^\.env$|^\.env\.local$"; then
    echo "❌ ERROR: .env file in staged changes!"
    echo "Never commit .env files."
    exit 1
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## 📞 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. Email: security@lionpack.studio (or project maintainer)
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact

## 🎯 Security Best Practices

1. **Rotate API keys regularly** (every 90 days recommended)
2. **Use separate keys for dev/staging/production**
3. **Set up billing alerts** to detect unauthorized usage
4. **Review access logs** periodically
5. **Use environment-specific keys** (don't share prod keys in dev)
6. **Implement rate limiting** on API endpoints
7. **Monitor for leaked credentials** using services like GitGuardian

## ✅ Security Checklist Status

- [x] `.gitignore` configured to exclude `.env` files
- [x] `.env.example` provides safe template
- [x] `.env.local.template` created for local development
- [x] All API keys removed from tracked files
- [x] Security documentation created
- [ ] Pre-commit hooks installed (optional but recommended)
- [ ] Team trained on security practices

---

**Remember:** Security is everyone's responsibility! 🔐
