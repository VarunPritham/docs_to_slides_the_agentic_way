# Docs to Slides — The Agentic Way

Converts any Docusaurus MDX documentation page into a live Slidev presentation on demand, via an 18-agent LangGraph pipeline triggered by a button click in the doc footer.

The Docusaurus site is also a standalone knowledge hub with **25 reusable page layouts** for bank/tech teams — runbooks, ADRs, compliance evidence, code walkthroughs, and more. All layouts work in light and dark mode.

---

## Demo

Click **▶ Generate Slides** at the bottom of any doc page → the pipeline runs → a presentation opens at `localhost:3030`.

---

## Architecture

```
Button click (Docusaurus)
        ↓
POST /generate (FastAPI :8000)
        ↓
LangGraph pipeline — 18 agents, 4 phases
        ↓
Phase 1  Extraction   (Blackboard)    — 5 agents
Phase 2  Content      (Agent Router)  — 4 agents
Phase 3  Design       (Tool Routing)  — 5 agents
Phase 4  Assembly                     — 4 agents
        ↓
output/slides/slides.md  ← generated Slidev file
        ↓
npx slidev slides.md --port 3030
        ↓
Browser opens presentation in named tab
```

Three agentic patterns in one pipeline:

| Pattern | Phase | How |
|---|---|---|
| **Blackboard** | Extraction | All 5 agents post facts to `PipelineState` before Phase 2 starts |
| **Agent Router** | Content | `ContentTypeClassifier` labels each chunk; label drives all downstream behaviour |
| **Tool Routing** | Design | Each agent imports only its own scoped tools — enforced by Python imports |

---

## Quick Start

```bash
# 1. Clone and set up Python env
git clone <YOUR_REPO_URL>
cd docs_to_slides_the_agentic_way
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. Set your Anthropic API key (optional — runs in mock mode without it)
export ANTHROPIC_API_KEY=sk-ant-...

# 3. Install frontend deps
cd docs-site && npm install && cd ..
cd output/slides && npm install && cd ../..

# 4. Start the pipeline server
python server.py

# 5. Start Docusaurus (separate terminal)
cd docs-site && npm start

# 6. Open http://localhost:3000 → click "▶ Generate Slides" on any doc page
```

To run the pipeline from the CLI:

```bash
python main.py sample.mdx --output-dir ./output/slides
```

---

## LLM Support

| Provider | Env vars needed |
|---|---|
| Anthropic (default) | `ANTHROPIC_API_KEY` |
| Databricks | `LLM_PROVIDER=databricks`, `DATABRICKS_TOKEN`, `DATABRICKS_HOST` |
| Mock (no key) | — runs rule-based fallbacks |

Switch providers with `LLM_PROVIDER=databricks` — no code changes needed.

Only 4 of 18 agents make LLM calls: `ContentTypeClassifier`, `ProseCondenser`, `SpeakerNotesWriter`, `SummarySlideAgent`. All others are pure logic.

---

## Project Structure

```
├── state.py               # PipelineState TypedDict — the shared Blackboard
├── llm.py                 # LLM factory (anthropic / databricks)
├── graph.py               # LangGraph graph — 18 nodes, 17 edges
├── main.py                # CLI entry point
├── server.py              # FastAPI bridge — POST /generate
├── agents/
│   ├── extraction.py      # Phase 1 — 5 agents
│   ├── content.py         # Phase 2 — 4 agents
│   ├── design.py          # Phase 3 — 5 agents
│   └── assembly.py        # Phase 4 — 4 agents
├── tools/
│   ├── file_tools.py      # 6 functions
│   ├── text_tools.py      # 13 functions
│   ├── attachment_tools.py # 5 functions
│   ├── layout_tools.py    # 8 functions
│   └── code_tools.py      # 4 functions
├── docs-site/             # Docusaurus site with 25 page layouts + Generate Slides button
└── output/slides/         # Slidev project — slides.md overwritten per generation
```

---

## Ports

| Port | Service |
|---|---|
| `3000` | Docusaurus dev server |
| `3030` | Slidev presentation (auto-managed) |
| `8000` | FastAPI pipeline server |

---

## Docs-Site: 25 Page Layouts

The `docs-site/` directory is a standalone Docusaurus knowledge hub. It ships with 25 reusable React/TypeScript page layouts — Deep Navy + Sky Blue brand palette, full dark mode support.

### Layout Categories

**Ops & Incidents** (`index.tsx`)
| Component | Purpose |
|---|---|
| `MetaBlock` | Page header — owner, team, status badge, tags |
| `InfoPanel` | Callout box — 6 types: info / success / warning / danger / note / tip |
| `RunbookStep` | Numbered incident step with command copy block |
| `ServiceDashboard` | Live service health — operational / degraded / outage |
| `ApiTryIt` | Inline API tester — fire real requests from the docs page |

**Architecture & Decisions** (`index.tsx`)
| Component | Purpose |
|---|---|
| `ADR` | Architecture Decision Record — context / decision / consequences |
| `DecisionTable` | Options comparison — pros/cons, highlighted winner |

**Team & Collaboration** (`index.tsx`)
| Component | Purpose |
|---|---|
| `MeetingNotes` | Meeting metadata + action items |
| `RetroBoard` | Start / Stop / Continue / Action retrospective board |
| `TeamGrid` / `TeamCard` | Team directory with on-call indicator |
| `OnCallRota` | On-call schedule with current badge |

**Compliance & Governance** (`wave5.tsx`)
| Component | Purpose |
|---|---|
| `ChangeRequest` | CAB change record — 3 tabs: details / implementation steps / CAB approvals |
| `IncidentPostMortem` | PIR — 3 tabs: analysis / timeline / action items |
| `SDLCGateChecklist` | Release gate tracker with progress bar + accordion |
| `ITControlEvidence` | SOX/ITGC audit evidence — 2 tabs: evidence log / exceptions |

**Docs as Code** (`wave6.tsx`)
| Component | Purpose |
|---|---|
| `CodeWalkthrough` | Annotated code tour — stops, prev/next nav, jump dropdown |
| `ChangelogPage` | Release history — filter by all / latest / breaking changes |
| `EnvironmentReference` | Env var docs — search, secret masking, eye-reveal toggle |
| `ArchitectureDiagram` | Mermaid diagram — light/dark themes, collapsible raw source |
| `CodeSnippetLibrary` | Searchable tagged code snippet gallery |

### Using a Layout

Import from the appropriate wave file in any `.mdx` doc:

```mdx
import { MetaBlock, InfoPanel, RunbookStep } from '@site/src/components/PageLayouts';
import { ChangeRequest, IncidentPostMortem } from '@site/src/components/PageLayouts/wave5';
import { CodeWalkthrough, ArchitectureDiagram } from '@site/src/components/PageLayouts/wave6';
```

Live demos for every layout live under `docs-site/docs/templates/`.

### Adding a New Layout

```bash
/add-layout            # new ops/incident/team layout → index.tsx
/add-layout-compliance # new compliance layout → wave5.tsx
/add-layout-docs       # new docs-as-code layout → wave6.tsx
```

Each command walks through: defining interfaces → CSS classes (with dark mode) → component code → MDX demo page → sidebar registration → agent file.

### Dark Mode Rule

The critical rule: **never use inline `style={{ background: '...' }}`** for semantic colours — inline styles override `[data-theme='dark']` CSS rules. Use CSS module classes with `[data-theme='dark']` overrides using `rgba()` at 10–15% opacity instead.

---

## Reproducing at Your Firm

See [`CLAUDE-init.md`](CLAUDE-init.md) for a full 11-step rebuild guide.

The `.claude/` directory contains Claude Code agents and commands for rebuilding each piece:

### Commands

```bash
# Pipeline
/check-setup           # verify deps, ports, and env vars
/generate-slides       # run pipeline on any MDX file
/debug-pipeline        # verbose per-agent state inspection
/start-server          # start FastAPI with port conflict handling
/add-doc               # scaffold a new Docusaurus doc page

# Layouts
/add-layout            # scaffold a new ops/team layout in index.tsx
/add-layout-compliance # scaffold a new compliance layout in wave5.tsx
/add-layout-docs       # scaffold a new docs-as-code layout in wave6.tsx
```

### Agent Files

Detailed reproduction guides for every component in `.claude/agents/`:

```
Pipeline agents:
  extraction-agent.md       — Phase 1: 5 extraction agents
  content-agent.md          — Phase 2: 4 content agents
  design-agent.md           — Phase 3: 5 design agents
  assembly-agent.md         — Phase 4: 4 assembly agents
  orchestrator-agent.md     — full pipeline orchestration

Layout agents (one per component):
  layout-meta-block.md          layout-info-panel.md
  layout-adr.md                 layout-runbook-step.md
  layout-api-try-it.md          layout-service-dashboard.md
  layout-meeting-notes.md       layout-team-grid.md
  layout-decision-table.md      layout-retro-board.md
  layout-on-call-rota.md
  layout-change-request.md      layout-incident-postmortem.md
  layout-sdlc-gate-checklist.md layout-it-control-evidence.md
  layout-code-walkthrough.md    layout-changelog-page.md
  layout-environment-reference.md
  layout-architecture-diagram.md
  layout-code-snippet-library.md
```

### Rules / Reference Docs

```
.claude/rules/01-architecture.md  — full pipeline and state flow
.claude/rules/02-agents.md        — all 18 agents: inputs, outputs, logic
.claude/rules/03-tools.md         — all 28 tool functions with signatures
.claude/rules/04-patterns.md      — Blackboard, Agent Router, Tool Routing in depth
.claude/rules/05-setup.md         — full setup from scratch
.claude/rules/06-layouts.md       — all 25 layouts: props, dark mode, usage examples
```

---

## Patterns Reference

This project demonstrates three agentic patterns from [Multi-Agent-Architecture-Patterns](<YOUR_PATTERNS_REPO_URL>) applied to a real document processing pipeline.
