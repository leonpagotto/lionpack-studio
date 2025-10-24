#!/bin/bash

# 🦁 LionPack Studio - Phase 1 Initialization Script
#
# This script sets up the LionPack Studio development environment
# for Phase 1 (Backend Integration).
#
# Usage: bash scripts/init-phase1.sh

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║     🦁 LionPack Studio - Phase 1 Initialization 🦁           ║"
echo "║                                                               ║"
echo "║              Backend Integration Setup                        ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js version is $(node -v). Please upgrade to 18+"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install npm"
  exit 1
fi

if ! command -v git &> /dev/null; then
  echo "❌ Git not found. Please install Git"
  exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"
echo "✅ Git $(git -v | cut -d' ' -f3)"
echo ""

# Check .env.local exists
echo "🔧 Checking configuration..."
echo ""

if [ ! -f .env.local ]; then
  echo "⚠️  .env.local not found. Creating from template..."
  cp .env.example .env.local
  echo "✅ Created .env.local"
  echo ""
  echo "⚠️  IMPORTANT: Edit .env.local with your credentials:"
  echo "   • LEO_GITHUB_TOKEN"
  echo "   • LEO_ANTHROPIC_KEY"
  echo "   • Other Supabase credentials (for Phase 2+)"
  echo ""
else
  echo "✅ .env.local exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
echo ""

npm install
echo "✅ Dependencies installed"
echo ""

# Create packages/leo-client directory structure
echo "🏗️  Setting up packages/leo-client..."
echo ""

if [ ! -d "packages/leo-client" ]; then
  mkdir -p packages/leo-client/{src,tests}

  cat > packages/leo-client/package.json << 'EOF'
{
  "name": "@lionpack/leo-client",
  "version": "0.1.0",
  "description": "LEO Kit integration wrapper for LionPack Studio",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "leo-workflow-kit": "^5.0.0"
  },
  "devDependencies": {
    "@types/jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.0.0"
  }
}
EOF

  cat > packages/leo-client/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
EOF

  cat > packages/leo-client/src/index.ts << 'EOF'
/**
 * 🦁 LionPack Studio - LEO Client
 *
 * Wrapper around leo-workflow-kit providing convenient APIs
 * for workflow orchestration, specification generation, and
 * GitHub integration.
 */

export * from './orchestrator'
export * from './workflow-manager'
export * from './spec-generator'
export * from './github-client'
export * from './types'
EOF

  echo "✅ Created packages/leo-client structure"
else
  echo "✅ packages/leo-client already exists"
fi

echo ""

# Create basic application structure
echo "🏛️  Setting up application structure..."
echo ""

if [ ! -d "apps/web" ]; then
  mkdir -p apps/web/{pages,components,lib}
  echo "✅ Created apps/web structure"
else
  echo "✅ apps/web already exists"
fi

echo ""

# Summary
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║              ✅ PHASE 1 INITIALIZATION COMPLETE              ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

echo "📝 Next Steps:"
echo ""
echo "1. Edit configuration:"
echo "   nano .env.local"
echo ""
echo "2. Review documentation:"
echo "   • docs/FRAMEWORK.md      (philosophy)"
echo "   • docs/ARCHITECTURE.md   (system design)"
echo "   • docs/INTEGRATION.md    (LEO Kit integration)"
echo ""
echo "3. Start Phase 1 development:"
echo "   npm run dev"
echo ""
echo "4. Implement packages/leo-client:"
echo "   • src/orchestrator.ts"
echo "   • src/workflow-manager.ts"
echo "   • src/spec-generator.ts"
echo "   • src/github-client.ts"
echo ""
echo "5. Create API routes in apps/web/pages/api/"
echo ""
echo "📚 Documentation: Read docs/QUICK_START.md for details"
echo ""
