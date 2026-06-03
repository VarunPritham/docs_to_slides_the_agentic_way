# docusaurus-to-slidev

Two things in one repo:

1. **Slide generation pipeline** — 18-agent LangGraph pipeline that converts any Docusaurus MDX page into a hosted Slidev presentation via a button click
2. **Docs-site** — a Docusaurus 3.10 knowledge hub with 25 reusable page layouts for bank/tech teams (runbooks, ADRs, SDLC gates, compliance evidence, code walkthroughs, and more)

---

## Quick Start

```bash
# Python pipeline
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
python server.py                     # starts FastAPI on :8000

# Docusaurus site
cd docs-site && npm install && npm start   # starts on :3000

# Click "▶ Generate Slides" on any doc page → presentation opens on :3030
```

---

## Part 1 — Slide Generation Pipeline

Four-phase LangGraph pipeline. 18 agents. 5 tool modules.

```
Phase 1  Extraction   (Blackboard)    → agents/extraction.py   — 5 agents
Phase 2  Content      (Agent Router)  → agents/content.py      — 4 agents
Phase 3  Design       (Tool Routing)  → agents/design.py       — 5 agents
Phase 4  Assembly                     → agents/assembly.py     — 4 agents
```

### Key Pipeline Files

| File | Purpose |
|---|---|
| `server.py` | FastAPI bridge — `POST /generate` triggers pipeline |
| `graph.py` | LangGraph graph — 18 nodes, 17 edges |
| `state.py` | `PipelineState` TypedDict — the shared Blackboard |
| `llm.py` | LLM factory — `anthropic` (default) or `databricks` |
| `main.py` | CLI: `python main.py <file.mdx>` |
| `agents/` | All 18 agent functions |
| `tools/` | 28 pure-logic tool functions |
| `output/slides/` | Slidev project — `slides.md` overwritten each run |

### LLM Agents (4 of 18)

Only these make LLM calls; all others are pure logic:

- `ContentTypeClassifier` — labels each chunk: prose/code/image/table/list/heading_only
- `ProseCondenser` — condenses prose >80 words into 3–5 bullets
- `SpeakerNotesWriter` — writes presenter notes per slide
- `SummarySlideAgent` — writes key takeaways closing slide

### Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | For LLM mode | — | Enables real LLM calls |
| `LLM_PROVIDER` | No | `anthropic` | `anthropic` or `databricks` |
| `DATABRICKS_ENDPOINT` | If databricks | `databricks-meta-llama-3-1-70b-instruct` | Model endpoint |
| `DATABRICKS_TOKEN` | If databricks | — | Auth token |
| `DATABRICKS_HOST` | If databricks | — | Workspace URL |

### Ports

| Port | Service |
|---|---|
| `3000` | Docusaurus dev server |
| `3030` | Slidev presentation (auto-managed by server.py) |
| `8000` | FastAPI pipeline server |

---

## Part 2 — Docs-Site: 25 Page Layouts

The Docusaurus site in `docs-site/` is also a standalone knowledge hub. It ships with 25 reusable React/TypeScript page layouts used in MDX files. All layouts work in light and dark mode (Deep Navy + Sky Blue brand palette, Barclays-ready).

### Layout Files

| File | Layouts |
|---|---|
| `src/components/PageLayouts/index.tsx` | MetaBlock, InfoPanel, ADR, RunbookStep, ApiTryIt, ServiceDashboard, MeetingNotes, TeamGrid, TeamCard, DecisionTable, RetroBoard, OnCallRota |
| `src/components/PageLayouts/wave5.tsx` | ChangeRequest, IncidentPostMortem, SDLCGateChecklist, ITControlEvidence |
| `src/components/PageLayouts/wave6.tsx` | CodeWalkthrough, ChangelogPage, EnvironmentReference, ArchitectureDiagram, CodeSnippetLibrary |
| `src/components/PageLayouts/styles.module.css` | CSS for index.tsx components |
| `src/components/PageLayouts/wave-styles.module.css` | CSS for wave5 + wave6 components |

### Layout Categories

**Ops & Incidents**
- `RunbookStep` — numbered incident step with command block + copy button
- `InfoPanel` — 6-type callout: info/success/warning/danger/note/tip
- `ServiceDashboard` — live service health dashboard with on-call integration
- `ApiTryIt` — inline API request tester with live response

**Architecture & Decisions**
- `ADR` — Architecture Decision Record (context / decision / consequences / alternatives)
- `DecisionTable` — options comparison (pros/cons, highlighted winner)

**Team & Collaboration**
- `MetaBlock` — page header (owner, team, status, last updated, tags)
- `MeetingNotes` — meeting metadata + action items
- `RetroBoard` — Start/Stop/Continue/Action retrospective board
- `TeamGrid` / `TeamCard` — team directory cards with on-call indicator
- `OnCallRota` — on-call schedule

**Compliance & Governance** (wave5)
- `ChangeRequest` — CAB change record (CR-ID, risk, 3-tab: details/implementation/CAB approvals)
- `IncidentPostMortem` — PIR (timeline, what went well/to improve, action items, 3-tab)
- `SDLCGateChecklist` — release gate checklist with progress bar + accordion
- `ITControlEvidence` — SOX/audit control evidence log with exceptions tab

**Docs as Code** (wave6)
- `CodeWalkthrough` — annotated code tour with stops, prev/next nav, jump dropdown
- `ChangelogPage` — release history with filter chips (all / latest / breaking)
- `EnvironmentReference` — env var docs with search + secret masking
- `ArchitectureDiagram` — Mermaid diagram with metadata + raw source toggle
- `CodeSnippetLibrary` — searchable tagged code snippet gallery

### Adding a New Layout

See `/add-layout` command for the full scaffold. The short version:

1. Export the component from the appropriate wave file
2. Add CSS classes to `wave-styles.module.css` using only CSS variables (no hardcoded light colours — dark mode must work)
3. Create an MDX page in `docs/templates/`
4. Add to `sidebars.ts`

### Dark Mode Rules

All layout CSS must use CSS custom properties, never hardcoded light hex values in component inline styles:
- Use `var(--ifm-background-color)`, `var(--surface-1)`, `var(--border-color)`, `var(--text-muted)`
- For colour-coded variants (severity/type), define both light bg AND `[data-theme='dark']` override in the CSS module
- Never set `background: white` or `background: #fff` — use `background: transparent` or a CSS var

---

## .claude/ Reference

### Rules (documentation)

| File | Contents |
|---|---|
| `.claude/rules/01-architecture.md` | Full pipeline architecture and state flow |
| `.claude/rules/02-agents.md` | All 18 pipeline agents — inputs, outputs, logic |
| `.claude/rules/03-tools.md` | All 28 tool functions with signatures |
| `.claude/rules/04-patterns.md` | Blackboard, Agent Router, Tool Routing in depth |
| `.claude/rules/05-setup.md` | Full setup from scratch |
| `.claude/rules/06-layouts.md` | All 25 docs-site layouts — props, rendering, usage, dark mode |

### Agents (reproducers)

**Pipeline agents:**

| File | Reproduces |
|---|---|
| `.claude/agents/extraction-agent.md` | Phase 1: Extraction agents |
| `.claude/agents/content-agent.md` | Phase 2: Content agents |
| `.claude/agents/design-agent.md` | Phase 3: Design agents |
| `.claude/agents/assembly-agent.md` | Phase 4: Assembly agents |
| `.claude/agents/orchestrator-agent.md` | Full pipeline orchestration |

**Layout agents (one file per component):**

| File | Component |
|---|---|
| `.claude/agents/layout-meta-block.md` | MetaBlock |
| `.claude/agents/layout-info-panel.md` | InfoPanel |
| `.claude/agents/layout-adr.md` | ADR |
| `.claude/agents/layout-runbook-step.md` | RunbookStep |
| `.claude/agents/layout-api-try-it.md` | ApiTryIt |
| `.claude/agents/layout-service-dashboard.md` | ServiceDashboard |
| `.claude/agents/layout-meeting-notes.md` | MeetingNotes |
| `.claude/agents/layout-team-grid.md` | TeamGrid / TeamCard |
| `.claude/agents/layout-decision-table.md` | DecisionTable |
| `.claude/agents/layout-retro-board.md` | RetroBoard |
| `.claude/agents/layout-on-call-rota.md` | OnCallRota |
| `.claude/agents/layout-change-request.md` | ChangeRequest |
| `.claude/agents/layout-incident-postmortem.md` | IncidentPostMortem |
| `.claude/agents/layout-sdlc-gate-checklist.md` | SDLCGateChecklist |
| `.claude/agents/layout-it-control-evidence.md` | ITControlEvidence |
| `.claude/agents/layout-code-walkthrough.md` | CodeWalkthrough |
| `.claude/agents/layout-changelog-page.md` | ChangelogPage |
| `.claude/agents/layout-environment-reference.md` | EnvironmentReference |
| `.claude/agents/layout-architecture-diagram.md` | ArchitectureDiagram |
| `.claude/agents/layout-code-snippet-library.md` | CodeSnippetLibrary |

### Commands

| Command | What it does |
|---|---|
| `/generate-slides` | Run slide generation pipeline on an MDX file |
| `/add-doc` | Scaffold a new Docusaurus doc page |
| `/start-server` | Start FastAPI with port conflict handling |
| `/check-setup` | Verify all deps, ports, and env vars |
| `/debug-pipeline` | Verbose per-agent state inspection |
| `/add-layout` | Create a new ops/incident/team layout in index.tsx |
| `/add-layout-compliance` | Create a new compliance layout in wave5.tsx |
| `/add-layout-docs` | Create a new docs-as-code layout in wave6.tsx |
