# Docs to Slides — The Agentic Way

Converts any Docusaurus MDX documentation page into a live Slidev presentation on demand, via an 18-agent LangGraph pipeline triggered by a button click in the doc footer.

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
git clone https://github.com/VarunPritham/docs_to_slides_the_agentic_way.git
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
├── docs-site/             # Docusaurus site with Generate Slides button
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

## Reproducing at Your Firm

See [`CLAUDE-init.md`](CLAUDE-init.md) for a full 11-step rebuild guide.

The `.claude/` directory contains Claude Code agents and commands for rebuilding each phase:

```bash
/check-setup       # verify deps, ports, env vars
/generate-slides   # run pipeline on any MDX file
/debug-pipeline    # verbose per-agent state inspection
/start-server      # start FastAPI with port conflict handling
/add-doc           # scaffold a new Docusaurus doc page
```

Detailed documentation in [`.claude/rules/`](.claude/rules/):
- `01-architecture.md` — full pipeline and state flow
- `02-agents.md` — all 18 agents with inputs, outputs, and logic
- `03-tools.md` — all 28 tool functions with signatures
- `04-patterns.md` — Blackboard, Agent Router, Tool Routing in depth

---

## Patterns Reference

This project demonstrates three agentic patterns from [Multi-Agent-Architecture-Patterns](https://github.com/VarunPritham/Multi-Agent-Architecture-Pattens) applied to a real document processing pipeline.
