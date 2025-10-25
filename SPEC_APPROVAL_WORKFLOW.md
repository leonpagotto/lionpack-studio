# LionPack Studio – Spec Approval & Issue Creation Workflow

> **Purpose:** Guide for reviewing, approving, and converting specs to GitHub issues
> **Status:** Active
> **Last Updated:** 2025-10-25

---

## 📋 Overview

This document explains how to move LionPack Studio specs through the approval pipeline and convert them into actionable GitHub issues using the LEO Kit workflow.

**Key Principle:** Specifications are files (in `docs/specs/`). Tasks are GitHub issues.

---

## 🔄 Spec Lifecycle

```
┌─────────────┐
│   Draft     │  Initial write, internal review
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Team Review        │  Share with team, collect feedback
│  (1–3 days)         │  Comment on spec, iterate
└──────┬──────────────┘
       │
       ▼
┌──────────────────────┐
│  Approved            │  Status: Approved, ready for issues
│  (Signed off)        │  Owner: [Person/Team]
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Issue Breakdown     │  Create GitHub issues from spec
│  (Create Issues)     │  One epic or feature per issue
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  In Development      │  Team assigns & works on issues
│  (Tracking)          │  Track in GitHub Project Board
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Completed           │  Issues closed via PRs
│  (Delivered)         │  Spec reflects implementation
└──────────────────────┘
```

---

## ✅ Spec Review Checklist

When reviewing a spec, ensure:

- [ ] **Clear Problem Statement** – Why are we doing this?
- [ ] **Acceptance Criteria** – How do we know it's done?
- [ ] **API/Data Design** – Schema defined, endpoints clear
- [ ] **Dependencies** – What else must be done first?
- [ ] **Effort Estimate** – Rough T-shirt size (XS, S, M, L, XL)
- [ ] **Risks Identified** – What could go wrong?
- [ ] **Testing Strategy** – How will we validate?
- [ ] **Implementation Details** – Clear enough for a dev to start?

---

## 🚀 Phase 1: Strategic Specs (Current Status)

### Current Specs

| Spec                               | Status   | Effort | Next Action            |
| ---------------------------------- | -------- | ------ | ---------------------- |
| **LIONPACK_STRATEGIC_OVERVIEW.md** | ✍️ Draft | —      | Team review (3–5 days) |
| **PHASE_1_ARCHITECTURE.md**        | ✍️ Draft | —      | Team review (3–5 days) |
| **PHASE_1_API_CONTRACT.md**        | ✍️ Draft | —      | Team review (3–5 days) |
| **PHASE_1_ROADMAP.md**             | ✍️ Draft | —      | Team review (3–5 days) |

### How to Review a Spec

1. **Read the entire spec** (15–30 min depending on length)
2. **Comment on concerns or questions** (use GitHub PR or inline comments)
3. **Check acceptance criteria** – Are they measurable?
4. **Suggest improvements** – Be specific
5. **Approve or request changes** – Update status in header

### Example Approval Comment

```markdown
✅ **Approved** – PHASE_1_ARCHITECTURE.md

**Feedback:**

- Clear tech stack and rationale
- Docker setup details are solid
- API layers well-defined

**Minor suggestions:**

- Add performance targets for Phase 1
- Consider adding diagram for auth flow

**Approved by:** @leonpagotto
**Date:** 2025-10-25
**Condition:** Incorporate suggestions before issue breakdown
```

---

## 📝 Converting Specs to GitHub Issues

### Step 1: Mark Spec as "Approved"

Update the spec header:

```markdown
> **Status:** Approved ✅
> **Approved By:** @leonpagotto
> **Approved Date:** 2025-10-25
> **Ready for Issues:** Yes
```

### Step 2: Break Down Into Issues

For each approved spec, create **1 GitHub issue per epic/feature**.

**Example: From PHASE_1_ROADMAP.md**

Spec has 8 epics:

```
Epic 1: OpenCode Integration
Epic 2: LEO Backend Integration
Epic 3: AI Orchestrator
... etc
```

**Create 8 GitHub issues:**

```
Issue #1: feat: OpenCode integration layer
Issue #2: feat: LEO backend API integration
Issue #3: feat: AI orchestrator setup
... etc
```

### Step 3: Issue Template

Use this template for each issue:

```markdown
## Title

[feat/fix/docs]: [Brief title from spec]

## Description

### Related Spec

Closes #[spec reference] or See: `docs/specs/[SPEC_NAME].md`

### Summary

[1–2 paragraph summary from spec]

### Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Implementation Notes

[Any specific guidance from spec]

### Testing

[How to test this feature]

### Effort Estimate

[XS/S/M/L/XL]

### Labels

`type:implementation`, `phase:1`, `priority:high`
```

### Step 4: Assign & Schedule

1. Assign team member
2. Set milestone (e.g., "Phase 1 – Week 1")
3. Add to Project Board
4. Link related issues

---

## 💻 Using LEO CLI to Create Issues

### Option A: Manual via GitHub UI

1. Go to https://github.com/leonpagotto/lionpack-studio/issues
2. Click "New Issue"
3. Use template above
4. Assign labels, milestone, project

### Option B: LEO CLI (Recommended)

```bash
# List available issue templates
leo issue list

# Create new issue interactively
leo issue create

# Create issue from spec
leo issue from-spec docs/specs/PHASE_1_ROADMAP.md
```

### Example LEO Command

```bash
leo issue create \
  --title "feat: OpenCode integration layer" \
  --body "$(cat docs/specs/PHASE_1_ARCHITECTURE.md | grep -A 50 'OpenCode Integration')" \
  --labels "type:implementation,phase:1,priority:high" \
  --milestone "Phase 1 – Week 1"
```

---

## 🎯 Next Steps for LionPack Studio

### Week 1: Spec Review (NOW)

- [ ] Team reads LIONPACK_STRATEGIC_OVERVIEW.md
- [ ] Team reads PHASE_1_ARCHITECTURE.md
- [ ] Team reviews PHASE_1_API_CONTRACT.md
- [ ] Team reviews PHASE_1_ROADMAP.md
- [ ] Collect feedback (comments on specs)
- [ ] Update specs based on feedback

### Week 2: Approval & Issue Breakdown

- [ ] Mark all specs as "Approved"
- [ ] Break into GitHub issues (one per epic)
- [ ] Create 8–10 GitHub issues for Phase 1
- [ ] Assign issues to team members
- [ ] Set Phase 1 milestone

### Week 3: Implementation Kickoff

- [ ] Team pulls assigned issues
- [ ] Creates feature branches
- [ ] Starts implementation
- [ ] Tracks in GitHub Project Board

---

## 📊 GitHub Project Board Setup

### Columns

```
📋 Backlog
  └─ Issues not yet started

🔵 Ready
  └─ Assigned, ready to start

🟢 In Progress
  └─ Active work

🔍 Review
  └─ PR open, awaiting review

✅ Done
  └─ Merged, closed
```

### Automation

LEO Kit GitHub Actions:

- Auto-adds issues to "Backlog"
- Auto-moves to "In Progress" when branch created
- Auto-moves to "Review" when PR opened
- Auto-moves to "Done" when PR merged

---

## 🏷️ Issue Labels (LEO Kit Standard)

### Type

- `type:implementation` – Code feature
- `type:docs` – Documentation
- `type:bug` – Bug fix
- `type:chore` – Maintenance
- `type:test` – Testing

### Priority

- `priority:critical` – Blocking other work
- `priority:high` – Important, start soon
- `priority:medium` – Important, can wait
- `priority:low` – Nice to have

### Phase

- `phase:1` – Phase 1 work
- `phase:2` – Future phase

### Status

- `status:blocked` – Waiting on something
- `status:discussion` – Needs clarification
- `status:help-wanted` – Open for contributors

---

## 🧪 Testing the Workflow

### Test Scenario: Create one issue

1. Pick one epic from PHASE_1_ROADMAP.md (e.g., "OpenCode Integration")
2. Create GitHub issue with acceptance criteria
3. Assign to team member
4. Add to Phase 1 milestone
5. Add to Project Board
6. Track for 1–2 days
7. Validate that automation works (status updates, etc.)

---

## 📞 Communication

### During Review Phase

- **Where:** GitHub spec discussion or Slack channel
- **What:** "I reviewed [spec name]. Here's feedback: ..."
- **Timeline:** 3–5 days per spec

### During Issue Breakdown

- **Where:** Sync meeting or Slack
- **What:** "We're breaking down [spec]. Issues will be: #1, #2, #3"
- **Timeline:** 1–2 days

### During Implementation

- **Where:** GitHub issues & PRs
- **What:** Link commits, PRs, issues
- **Timeline:** Ongoing

---

## 🔗 Related Documents

- **LIONPACK_STRATEGIC_OVERVIEW.md** – Project vision (spec)
- **PHASE_1_ARCHITECTURE.md** – Tech design (spec)
- **PHASE_1_API_CONTRACT.md** – API details (spec)
- **PHASE_1_ROADMAP.md** – Epics & timeline (spec)
- **LEO Kit Documentation** – https://github.com/leonpagotto/leo-kit

---

## ✨ Best Practices

✅ **Do:**

- Write acceptance criteria that are measurable
- Link issues to specs
- Update spec status as you move through phases
- Reference issues in commits
- Keep specs in docs/specs/ (always)

❌ **Don't:**

- Create issues without corresponding spec
- Change specs after work starts (create new issue instead)
- Skip the review phase
- Leave issues unassigned for long periods

---

## 📞 Questions?

- **Architecture questions:** Comment on spec or ask @leonpagotto
- **Timeline questions:** Check PHASE_1_ROADMAP.md or ask in planning
- **Workflow questions:** See LEO Kit docs or ask @leonpagotto

---

**Version:** 1.0
**Maintained By:** Leo / LionPack Team
**Last Updated:** 2025-10-25
