# Constitution Template

> **Development Standards in a Single File**

This is a template for creating a `.lionpack/constitution.yml` file that defines your project's technical standards, design principles, and AI agent alignment.

---

## 📋 Full Template

Save this as `.lionpack/constitution.yml` in your project root:

```yaml
# =============================================================================
# LionPack Studio Constitution
# =============================================================================
# This file defines the standards, principles, and AI alignment for this project.
# AI agents read this file to understand what "good code" and "good UX" mean.
#
# Version: 1.0.0
# Last Updated: 2025-10-26
# =============================================================================

# -----------------------------------------------------------------------------
# PROJECT METADATA
# -----------------------------------------------------------------------------
project:
  name: "My Awesome SaaS"
  type: "Next.js Application"
  description: "A brief description of what this project does"
  version: "0.1.0"
  repository: "https://github.com/username/my-awesome-saas"
  
  # Team information
  team:
    size: 2
    roles:
      - alpha         # Project lead
      - developer     # Code implementation
  
  # Development stage
  stage: "mvp"  # Options: prototype, mvp, beta, production

# -----------------------------------------------------------------------------
# TECHNICAL STACK
# -----------------------------------------------------------------------------
languages:
  primary: "typescript"
  versions:
    typescript: "5.0+"
    node: "18+"
  
  # Frameworks and libraries
  frameworks:
    - name: "Next.js"
      version: "14+"
      features:
        - "App Router"
        - "Server Components"
        - "Server Actions"
    
    - name: "React"
      version: "18+"
    
    - name: "Tailwind CSS"
      version: "3+"

# -----------------------------------------------------------------------------
# CODE STANDARDS
# -----------------------------------------------------------------------------
code_standards:
  # Formatting and linting
  formatting:
    tool: "prettier"
    config:
      semi: true
      singleQuote: true
      tabWidth: 2
      trailingComma: "es5"
      printWidth: 100
  
  linting:
    tool: "eslint"
    extends:
      - "eslint:recommended"
      - "plugin:@typescript-eslint/recommended"
      - "plugin:react/recommended"
      - "plugin:react-hooks/recommended"
  
  # Code organization
  architecture:
    pattern: "feature-based"  # Options: feature-based, layered, modular
    folder_structure: |
      src/
      ├── app/              # Next.js App Router pages
      ├── components/       # React components
      │   ├── ui/          # Reusable UI components
      │   └── features/    # Feature-specific components
      ├── lib/             # Utilities and helpers
      ├── hooks/           # Custom React hooks
      ├── types/           # TypeScript type definitions
      └── styles/          # Global styles
  
  # Naming conventions
  naming:
    components: "PascalCase"         # UserProfile.tsx
    files: "kebab-case"              # user-profile.tsx
    functions: "camelCase"           # getUserById()
    constants: "SCREAMING_SNAKE_CASE" # MAX_RETRY_COUNT
    types: "PascalCase"              # UserProfile
    css_classes: "kebab-case"        # user-profile-card
  
  # Component patterns
  component_style: "functional"  # Options: functional, class, mixed
  state_management: "React Context + hooks"
  
  # Preferred patterns
  prefer:
    - "Functional components over class components"
    - "TypeScript strict mode"
    - "Explicit return types for functions"
    - "Named exports over default exports"
    - "Composition over inheritance"
    - "Pure functions where possible"
  
  # Anti-patterns to avoid
  avoid:
    - "Any type (use unknown or proper types)"
    - "Prop drilling (use Context or state management)"
    - "Large component files (> 300 lines)"
    - "Inline styles (use Tailwind or CSS modules)"
    - "Magic numbers (use named constants)"

# -----------------------------------------------------------------------------
# TESTING STANDARDS
# -----------------------------------------------------------------------------
testing:
  framework: "Jest + React Testing Library"
  
  coverage:
    minimum: 80
    target: 90
    critical_paths: 100  # Auth, payments, etc.
  
  test_types:
    - unit: "Test individual functions and components"
    - integration: "Test feature workflows"
    - e2e: "Test user journeys (Playwright)"
  
  conventions:
    - "Test files: *.test.ts or *.test.tsx"
    - "Location: __tests__ folder or co-located with source"
    - "Naming: describe('ComponentName') / it('should do something')"
    - "AAA pattern: Arrange, Act, Assert"

# -----------------------------------------------------------------------------
# UX/UI DESIGN PRINCIPLES
# -----------------------------------------------------------------------------
ux_principles:
  # Design system
  design_system: "Material Design 3"  # Or: custom, shadcn/ui, etc.
  
  # Core principles
  principles:
    - "Mobile-first responsive design"
    - "Progressive enhancement"
    - "Accessibility first (WCAG 2.1 AA minimum)"
    - "Clear visual hierarchy"
    - "Consistent spacing and typography"
    - "Meaningful animations (< 300ms)"
  
  # Component architecture
  component_architecture: "Atomic Design"
  levels:
    - atoms: "Button, Input, Icon, Label"
    - molecules: "SearchBar, FormField, Card"
    - organisms: "Header, Footer, DataTable"
    - templates: "PageLayout, DashboardLayout"
    - pages: "HomePage, DashboardPage"
  
  # Design tokens
  tokens:
    colors:
      primary: "#0066CC"
      secondary: "#6B7280"
      success: "#10B981"
      error: "#EF4444"
      warning: "#F59E0B"
      info: "#3B82F6"
    
    spacing:
      unit: "4px"
      scale: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
    
    typography:
      font_family: "Inter, system-ui, sans-serif"
      font_sizes: [12, 14, 16, 18, 20, 24, 30, 36, 48, 60]
      line_heights: [1.2, 1.5, 1.75, 2]
    
    breakpoints:
      mobile: "320px"
      tablet: "768px"
      laptop: "1024px"
      desktop: "1440px"
  
  # Interaction guidelines
  interactions:
    max_click_depth: 3
    button_min_size: "44x44px"  # Touch-friendly
    animation_duration: "200ms - 300ms"
    feedback_delay: "< 100ms"
  
  # Dark mode
  dark_mode:
    enabled: true
    default: "system"  # Options: light, dark, system

# -----------------------------------------------------------------------------
# ACCESSIBILITY STANDARDS
# -----------------------------------------------------------------------------
accessibility:
  compliance: "WCAG 2.1 AA"
  
  requirements:
    - "All interactive elements keyboard accessible"
    - "Minimum color contrast ratio: 4.5:1 (text), 3:1 (UI)"
    - "All images have alt text"
    - "Form inputs have associated labels"
    - "ARIA labels for complex components"
    - "Focus visible on all interactive elements"
    - "No auto-playing media"
    - "Responsive text (no fixed px for body text)"
  
  testing:
    tools:
      - "axe DevTools"
      - "WAVE"
      - "Lighthouse"
    frequency: "Every PR"

# -----------------------------------------------------------------------------
# PERFORMANCE STANDARDS
# -----------------------------------------------------------------------------
performance:
  # Core Web Vitals targets
  web_vitals:
    lcp: "< 2.5s"   # Largest Contentful Paint
    fid: "< 100ms"  # First Input Delay
    cls: "< 0.1"    # Cumulative Layout Shift
  
  # Lighthouse scores (minimum)
  lighthouse:
    performance: 90
    accessibility: 95
    best_practices: 90
    seo: 90
  
  # Bundle size
  bundle:
    max_js: "500KB"
    max_css: "100KB"
    max_initial_load: "1MB"
  
  # Optimization strategies
  optimizations:
    - "Code splitting by route"
    - "Lazy load non-critical components"
    - "Image optimization (Next.js Image)"
    - "Font optimization (next/font)"
    - "Debounce expensive operations"
    - "Memoize pure components"

# -----------------------------------------------------------------------------
# AI AGENT ALIGNMENT
# -----------------------------------------------------------------------------
ai_alignment:
  # Communication style
  tone: "professional, friendly, concise"
  verbosity: "balanced"  # Options: minimal, balanced, detailed
  
  # Code generation preferences
  code_generation:
    comment_density: "moderate"  # Options: minimal, moderate, extensive
    explain_complex: true
    include_tests: true
    include_types: true
    defensive_programming: true
  
  # Decision-making
  when_uncertain:
    - "Ask for clarification"
    - "Provide 2-3 options with tradeoffs"
    - "Default to simpler solution"
    - "Cite this constitution for reasoning"
  
  # Learning and adaptation
  learning:
    track_preferences: true
    suggest_improvements: true
    learn_from_feedback: true
  
  # Safety and security
  security:
    - "Never expose secrets or API keys"
    - "Validate all user input"
    - "Use parameterized queries (no SQL injection)"
    - "Sanitize HTML output (no XSS)"
    - "HTTPS only in production"
    - "Secure session management"

# -----------------------------------------------------------------------------
# WORKFLOW STANDARDS
# -----------------------------------------------------------------------------
workflow:
  # Git workflow
  git:
    branch_strategy: "GitHub Flow"  # Options: GitHub Flow, Git Flow, Trunk
    branch_naming: "feature/story-number-short-description"
    commit_format: "conventional"  # feat, fix, docs, style, refactor, test, chore
    commit_max_length: 72
    require_pr_review: true
    squash_merge: true
  
  # Issue tracking
  issues:
    auto_create: true
    link_to_work: true
    status_updates: true
    close_on_merge: true
  
  # Code review
  code_review:
    required_approvals: 1
    automated_checks:
      - "Linting (ESLint)"
      - "Type checking (TypeScript)"
      - "Tests passing"
      - "Coverage threshold"
      - "Accessibility audit"
    review_focus:
      - "Logic and architecture"
      - "Security vulnerabilities"
      - "Performance implications"
      - "UX consistency"

# -----------------------------------------------------------------------------
# DEPLOYMENT STANDARDS
# -----------------------------------------------------------------------------
deployment:
  platform: "Vercel"
  
  environments:
    - name: "development"
      url: "http://localhost:3000"
      auto_deploy: false
    
    - name: "staging"
      url: "https://staging.myapp.com"
      auto_deploy: true
      branch: "develop"
    
    - name: "production"
      url: "https://myapp.com"
      auto_deploy: true
      branch: "main"
      require_approval: true
  
  # Environment variables
  env_management: ".env.local (local), Vercel (staging/prod)"
  
  # Monitoring
  monitoring:
    errors: "Sentry"
    analytics: "Vercel Analytics"
    performance: "Lighthouse CI"

# -----------------------------------------------------------------------------
# DOCUMENTATION STANDARDS
# -----------------------------------------------------------------------------
documentation:
  # Code documentation
  code:
    jsdoc: true
    inline_comments: "For complex logic only"
    readme_per_feature: false
  
  # API documentation
  api:
    format: "OpenAPI 3.0"
    auto_generate: true
    include_examples: true
  
  # User documentation
  user_docs:
    format: "Markdown"
    location: "docs/"
    include:
      - "README.md"
      - "CONTRIBUTING.md"
      - "ARCHITECTURE.md"
      - "API.md"

# -----------------------------------------------------------------------------
# EXTERNAL DEPENDENCIES
# -----------------------------------------------------------------------------
dependencies:
  # Dependency management
  policy: "conservative"  # Options: aggressive, conservative, locked
  
  # Update strategy
  updates:
    frequency: "monthly"
    automated: false
    security_patches: "immediate"
  
  # Approved libraries
  approved:
    - "@tanstack/react-query"
    - "zod"
    - "clsx"
    - "date-fns"
  
  # Restricted libraries
  restricted:
    - name: "moment"
      reason: "Use date-fns instead (smaller bundle)"
    - name: "lodash"
      reason: "Use native ES6 or lodash-es"

# -----------------------------------------------------------------------------
# CUSTOM RULES (PROJECT-SPECIFIC)
# -----------------------------------------------------------------------------
custom_rules:
  # Add any project-specific rules here
  - "All user-facing strings must be i18n-ready"
  - "All API responses must include error codes"
  - "All forms must have loading states"
  - "All mutations must optimistic updates"

# =============================================================================
# END OF CONSTITUTION
# =============================================================================
```

---

## 🎯 How to Use This Template

### 1. Copy and Customize

```bash
# Create the directory
mkdir -p .lionpack

# Copy this template
cp docs/CONSTITUTION_TEMPLATE.md .lionpack/constitution.yml

# Edit to match your project
code .lionpack/constitution.yml
```

### 2. Start Simple, Grow Over Time

**Minimum viable constitution (5 minutes):**
```yaml
project:
  name: "My Project"
  type: "Next.js App"

languages:
  primary: "typescript"

code_standards:
  formatting: "prettier"
  linting: "eslint:recommended"

ux_principles:
  - "Mobile-first"
  - "WCAG 2.1 AA"
  - "Dark mode support"
```

**Add sections as you go:**
- Week 1: Project + Languages + Code Standards
- Week 2: UX Principles + Design Tokens
- Week 3: Testing + Performance
- Week 4: AI Alignment + Workflow

### 3. Share with Your Team

```bash
# Commit the constitution
git add .lionpack/constitution.yml
git commit -m "docs: add project constitution"

# Everyone on the team now has the same standards
```

### 4. Let AI Read It

LionPack Studio AI agents will automatically read your constitution and:
- ✅ Generate code that follows your standards
- ✅ Suggest improvements aligned with your principles
- ✅ Enforce accessibility and performance requirements
- ✅ Ask clarifying questions when uncertain

---

## 📚 Constitution Examples

### Minimal Startup MVP

```yaml
project:
  name: "Startup MVP"
  stage: "prototype"

languages:
  primary: "typescript"

code_standards:
  formatting: "prettier"
  component_style: "functional"

ux_principles:
  - "Mobile-first"
  - "Ship fast, iterate"
  - "Simple > complex"

ai_alignment:
  tone: "casual, helpful"
  when_uncertain: "Choose simpler option"
```

### Enterprise SaaS

```yaml
project:
  name: "Enterprise Dashboard"
  stage: "production"

languages:
  primary: "typescript"
  versions:
    typescript: "5.3+"

code_standards:
  coverage:
    minimum: 90
  architecture: "layered"

ux_principles:
  design_system: "Material Design 3"
  accessibility: "WCAG 2.1 AAA"

security:
  compliance: ["SOC 2", "GDPR"]
```

### Open Source Library

```yaml
project:
  name: "React UI Library"
  type: "Component Library"

code_standards:
  testing:
    coverage: 95
  documentation:
    jsdoc: true
    storybook: true

ux_principles:
  component_architecture: "Atomic Design"
  design_tokens: true

ai_alignment:
  comment_density: "extensive"
  include_examples: true
```

---

## 🔧 Advanced Features

### Conditional Rules

```yaml
rules:
  - condition: "stage === 'production'"
    enforce:
      - "Test coverage >= 90%"
      - "Performance budget enforced"
      - "Security audit passing"
  
  - condition: "stage === 'prototype'"
    relax:
      - "Test coverage >= 60%"
      - "Performance budget ignored"
```

### Team-Specific Overrides

```yaml
teams:
  - name: "Backend Team"
    code_standards:
      testing:
        coverage: 95
  
  - name: "Frontend Team"
    code_standards:
      testing:
        coverage: 85
      e2e: true
```

### AI Learning from Feedback

```yaml
ai_alignment:
  learning:
    track_preferences: true
    feedback_file: ".lionpack/ai-feedback.log"
    adapt_suggestions: true
```

---

## 🌍 Community Constitutions

Coming soon: Browse and fork popular constitutions:

- **Next.js SaaS Starter** — Production-ready standards
- **React Component Library** — Package publishing best practices
- **Mobile-First PWA** — Performance-optimized defaults
- **Accessible First** — WCAG AAA compliance template

---

## 📝 Constitution Validation

Validate your constitution file:

```bash
# Coming soon
lionpack validate .lionpack/constitution.yml

# Output
✅ Valid constitution
✅ All required fields present
⚠️ Warning: accessibility.compliance missing (defaulting to WCAG 2.1 AA)
```

---

**Last Updated:** October 26, 2025
**Template Version:** 1.0.0

🦁 **One constitution, one standard, one pack.**
