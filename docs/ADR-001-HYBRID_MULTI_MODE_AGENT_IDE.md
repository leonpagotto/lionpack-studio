# ADR-001: Hybrid Multi-Mode Agent IDE Architecture

**Date:** 2025-10-25
**Status:** Accepted
**Participants:** Development Team, Technical Leadership

---

## 🎯 Context

LionPack Studio is building an AI-first IDE platform. The team investigated three architectural approaches:

1. **Current Plan (OpenCode + Morphic + LEO Kit):**
   - Standard IDE with generic AI chat
   - 66 working days
   - Medium differentiation

2. **KiloCode-Only Approach:**
   - Proven multi-mode agents (11.5k stars, 381 contributors)
   - But desktop-only (VS Code extension), single-user
   - Incompatible with LionPack's collaborative vision

3. **Hybrid Multi-Mode Agent IDE (Recommended):**
   - KiloCode's multi-mode architecture adapted for web
   - Morphic's chat patterns for UX
   - Web-native collaborative capabilities
   - 80 working days (+14 days additional investment)

---

## 🤔 Problem Statement

**Core Challenge:** How do we differentiate LionPack Studio in a crowded IDE market?

**Observation:** KiloCode's multi-mode agent system (Architect/Coder/Debugger/Custom modes) is significantly more effective than generic chat for code tasks. But it's locked into VS Code.

**Opportunity:** Build the first web-based multi-mode AI agent IDE by combining:

- Proven patterns from KiloCode (open source, battle-tested)
- Web-native architecture for collaboration
- Chat UI patterns from Morphic
- LEO Kit's workflow automation

---

## ✅ Decision

**Implement Hybrid Multi-Mode Agent IDE**

We will build a custom web-based IDE featuring:

1. **Four Specialized AI Modes:**
   - **Architect Mode:** Plans and designs implementation
   - **Coder Mode:** Generates code with automatic test verification
   - **Debugger Mode:** Finds and fixes bugs
   - **Reviewer Mode:** Quality gate before merge

2. **Web-First Architecture:**
   - Collaborative multi-user editing (unlike KiloCode)
   - Cloud-deployable
   - Mobile-friendly

3. **Intelligent Integration:**
   - Multi-provider AI orchestration
   - MCP-inspired tool marketplace
   - LEO Kit workflow automation
   - Terminal integration

---

## 🎯 Consequences

### ✅ Advantages

1. **Genuine Differentiation**
   - No competitor has web-based multi-mode agents
   - First-mover advantage in this category
   - Defensible competitive moat

2. **Superior User Experience**
   - Task-specific AI behavior (not generic chat)
   - Self-verifying code (tests included automatically)
   - Higher code quality (fewer bugs)

3. **Technical Excellence**
   - Following proven patterns from KiloCode (open source reference)
   - Clear separation of concerns (each mode is isolated)
   - Extensible architecture (tools, modes, providers)

4. **Business Impact**
   - Premium market positioning (unique value)
   - 5-10% faster code generation than alternatives
   - Better quality due to self-verification
   - Higher customer lifetime value

### ⚠️ Challenges

1. **Complexity**
   - More complex than standalone OpenCode + chat
   - Requires building custom agent system
   - Multi-mode coordination logic needed

2. **Timeline**
   - +14 additional working days (80 total vs 66)
   - 4-5 weeks with 4+ developers (still achievable)
   - But leaves less buffer for issues

3. **Execution Risk**
   - Unproven in web context (though patterns proven in KiloCode)
   - Spike investigation required to validate approach
   - Need strong architecture skills

### 🛡️ Mitigations

1. **Spike Investigation (Issue #5)**
   - 2-day investigation of KiloCode architecture
   - Prototype Coder mode to validate approach
   - Go/no-go decision before full commitment

2. **Reference Architecture**
   - KiloCode's implementation is open source
   - Can study and adapt proven patterns
   - Reduces architectural risk

3. **Phased Implementation**
   - Start with 2 modes (Coder + Debugger)
   - Add Architect and Reviewer modes in Phase 2 if needed
   - This de-risks the timeline

4. **Proven Patterns**
   - Multi-mode approach: Proven by KiloCode (11.5k stars)
   - Chat UI: Proven by Morphic (8.3k stars)
   - Web collaboration: Proven by many (VS Code Live Share, etc.)
   - Tool marketplace: Proven by VS Code extensions

---

## 🏗️ Implementation Approach

### Phase 1: Validation (Spike - Days 1-2)

- Deep-dive KiloCode architecture
- Prototype Coder mode for web
- Identify adaptation requirements

### Phase 2: Core System (Days 3-12)

- Build multi-mode framework
- Implement Architect and Coder modes
- Mode routing and switching

### Phase 3: Verification (Days 13-20)

- Self-verification framework
- Debugger and Reviewer modes
- Mode cooperation logic

### Phase 4: Tools & Integration (Days 21-28)

- Tool registry and execution
- LEO Kit integration
- Terminal and Git tools

### Phase 5: Polish & Optimize (Days 29-40)

- Chat UI enhancements
- Performance optimization
- End-to-end testing

---

## 📊 Success Metrics

### User-Facing

- **Code generation quality:** First-pass test success > 95%
- **Time to working code:** < 5 minutes average
- **User satisfaction:** 4.5+/5 stars on IDE quality
- **Productivity gain:** 30-50% faster feature development

### Technical

- **Verification accuracy:** Catches 90%+ of issues
- **Mode switching:** < 100ms latency
- **API cost efficiency:** 20-30% savings through intelligent fallback
- **Uptime:** 99.5%+ availability

### Business

- **Market positioning:** Only web-based multi-mode agent IDE
- **Premium pricing:** Justified by unique value
- **Competitive moat:** 12+ months for competitors to replicate
- **Customer retention:** Higher than standard IDE

---

## 🔄 Related Decisions

- **ADR-002** (planned): Multi-mode agent mode specifications
- **ADR-003** (planned): Tool registry and execution system
- **ADR-004** (planned): LEO Kit integration strategy

---

## 📚 References

- **KiloCode GitHub:** https://github.com/Kilo-Org/kilocode
- **Morphic GitHub:** https://github.com/miurla/morphic
- **Analysis Documents:** See /docs/ARCHITECTURE_DECISION_ANALYSIS.md
- **Implementation Guide:** See /docs/MULTI_MODE_AGENT_ARCHITECTURE.md

---

## 🎬 Next Steps

1. ✅ **Approve ADR** (this decision)
2. **Start Spike #5** immediately (KiloCode investigation)
3. **Prototype** Coder mode end-to-end
4. **Review findings** at end of spike
5. **Go/no-go decision** to proceed with full implementation
6. **Begin Core System** implementation if approved

---

## 📝 Decision Trail

- **2025-10-25:** Investigation completed
- **2025-10-25:** Team decision to approve hybrid approach
- **2025-10-25:** This ADR written and accepted
- **2025-10-25:** Spike #5 created to validate approach
- **Ongoing:** Epics #3.5, #3.6 created with story breakdown

---

**Decision Status:** ✅ **ACCEPTED**

This decision chart the course for LionPack Studio to become the first web-based AI-first collaborative IDE with intelligent multi-mode agents.
