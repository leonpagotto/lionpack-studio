#!/bin/bash

# Documentation Organization Script
# Organizes scattered markdown files according to LEO standards

set -e

ROOT_DIR="/Users/leo.de.souza1/lionpack-studio"
cd "$ROOT_DIR"

echo "🗂️  Organizing LionPack Studio Documentation"
echo "============================================="
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p docs/sessions/2025-01
mkdir -p docs/sessions/2025-10
mkdir -p docs/stories/story-3.9
mkdir -p docs/stories/story-3.10
mkdir -p docs/stories/story-3.11
mkdir -p docs/stories/story-3.12
mkdir -p docs/stories/story-3.13
mkdir -p docs/stories/story-3.14
mkdir -p docs/stories/story-3.15
mkdir -p docs/phases/phase-2
mkdir -p docs/phases/phase-4
mkdir -p docs/guides
mkdir -p archive/cleanup-reports
mkdir -p archive/planning

# Move January 2025 sessions
if [ -f "SESSION_SUMMARY_2025-01-26_PHASE4.md" ]; then
  echo "  → Moving January 2025 sessions..."
  mv SESSION_SUMMARY_2025-01-26_PHASE4.md docs/sessions/2025-01/ 2>/dev/null || true
fi

# Move October 2025 sessions (already moved, but check)
echo "  → Checking October 2025 sessions..."
for file in SESSION_SUMMARY_LOCAL_DEPLOYMENT.md SESSION_TEST_READY.md; do
  if [ -f "$file" ]; then
    mv "$file" docs/sessions/2025-10/ 2>/dev/null || true
  fi
done

# Move Story 3.9 documentation
echo "  → Organizing Story 3.9 files..."
for file in STORY_3_9_*.md README_STORY_3.9_STATUS.md; do
  if [ -f "$file" ]; then
    mv "$file" docs/stories/story-3.9/ 2>/dev/null || true
  fi
done

# Move Story 3.11 documentation
echo "  → Organizing Story 3.11 files..."
if [ -f "STORY_3.11_COMPLETE.md" ]; then
  mv STORY_3.11_COMPLETE.md docs/stories/story-3.11/ 2>/dev/null || true
fi

# Move Story 3.12 documentation
echo "  → Organizing Story 3.12 files..."
for file in STORY_3.12_*.md; do
  if [ -f "$file" ]; then
    mv "$file" docs/stories/story-3.12/ 2>/dev/null || true
  fi
done

# Move Story 3.13 documentation
echo "  → Organizing Story 3.13 files..."
for file in STORY_3.13_*.md SESSION_SUMMARY_STORY_3.13_COMPLETE.md; do
  if [ -f "$file" ]; then
    mv "$file" docs/stories/story-3.13/ 2>/dev/null || true
  fi
done

# Move Story 3.14 documentation
echo "  → Organizing Story 3.14 files..."
if [ -f "SESSION_SUMMARY_STORY_3.14.md" ]; then
  mv SESSION_SUMMARY_STORY_3.14.md docs/stories/story-3.14/ 2>/dev/null || true
fi

# Move Story 3.15 documentation
echo "  → Organizing Story 3.15 files..."
for file in STORY_3.15_*.md; do
  if [ -f "$file" ]; then
    mv "$file" docs/stories/story-3.15/ 2>/dev/null || true
  fi
done

# Move Story 3.8 (archived)
echo "  → Archiving Story 3.8 files..."
mkdir -p docs/stories/story-3.8
for file in STORY_3_8_*.md; do
  if [ -f "$file" ]; then
    mv "$file" docs/stories/story-3.8/ 2>/dev/null || true
  fi
done

# Move Phase 2 documentation
echo "  → Organizing Phase 2 files..."
for file in PHASE_2_*.md; do
  if [ -f "$file" ]; then
    mv "$file" docs/phases/phase-2/ 2>/dev/null || true
  fi
done

# Move Phase 4 documentation
echo "  → Organizing Phase 4 files..."
if [ -f "PHASE_4_COMPLETION_REPORT.md" ]; then
  mv PHASE_4_COMPLETION_REPORT.md docs/phases/phase-4/ 2>/dev/null || true
fi

# Move cleanup/planning docs to archive
echo "  → Archiving cleanup reports..."
for file in CLEANUP_*.md END_OF_DAY_*.md; do
  if [ -f "$file" ]; then
    mv "$file" archive/cleanup-reports/ 2>/dev/null || true
  fi
done

for file in COMPLETION_CHECKLIST.md EXECUTION_CHECKLIST.md COPILOT_INTEGRATION_PLAN.md FEATURE_IMPLEMENTATION_PLAN.md NEXT_STEPS_ROADMAP.md; do
  if [ -f "$file" ]; then
    mv "$file" archive/planning/ 2>/dev/null || true
  fi
done

# Move implementation files to archive
echo "  → Archiving implementation files..."
if [ -f "IMPLEMENTATION_START.txt" ]; then
  mv IMPLEMENTATION_START.txt archive/planning/ 2>/dev/null || true
fi

# Keep in root (important files)
echo ""
echo "✅ Keeping in root:"
echo "  • README.md (main project readme)"
echo "  • INDEX.md (documentation index)"
echo "  • CONTRIBUTING.md (contribution guidelines)"
echo "  • LICENSE (project license)"
echo "  • SECURITY.md (security policy)"
echo "  • LOCAL_DEPLOYMENT_GUIDE.md (deployment guide)"
echo ""

echo "✅ Documentation organized successfully!"
echo ""
echo "📊 Structure:"
echo "  docs/sessions/     - Session summaries by date"
echo "  docs/stories/      - Story-specific documentation"
echo "  docs/phases/       - Phase completion reports"
echo "  docs/guides/       - Testing and user guides"
echo "  archive/           - Historical/planning documents"
echo ""
