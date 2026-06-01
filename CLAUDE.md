# docusaurus-to-slidev

Converts any Docusaurus `.mdx` page into a hosted Slidev presentation on demand via a button in the doc footer.

## Quick Start

```bash
# 1. Install Python deps
pip install -r requirements.txt

# 2. Set LLM key
export ANTHROPIC_API_KEY=sk-ant-...

# 3. Start the pipeline server
python server.py

# 4. Start Docusaurus (separate terminal)
cd docs-site && npm start

# 5. Open any doc page → click "▶ Generate Slides" at the bottom
```

## Architecture

Four-phase LangGraph pipeline. 18 agents. 5 tool modules. See `.claude/rules/` for full detail.

```
Phase 1 Extraction  (Blackboard)    → agents/extraction.py   — 5 agents
Phase 2 Content     (Agent Router)  → agents/content.py      — 4 agents
Phase 3 Design      (Tool Routing)  → agents/design.py       — 5 agents
Phase 4 Assembly                    → agents/assembly.py     — 4 agents
```

## Key Files

| File | Purpose |
|---|---|
| `server.py` | FastAPI bridge — `POST /generate` triggers the pipeline |
| `graph.py` | LangGraph graph — 18 nodes, 17 edges |
| `state.py` | `PipelineState` TypedDict — the shared Blackboard |
| `llm.py` | LLM factory — `anthropic` (default) or `databricks` |
| `main.py` | CLI entry: `python main.py <file.mdx>` |
| `agents/` | All 18 agent functions |
| `tools/` | 28 pure-logic tool functions |
| `docs-site/` | Docusaurus site with Generate Slides button |
| `output/slides/` | Slidev project — `slides.md` is overwritten per generation |

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | For LLM mode | — | Enables real LLM calls |
| `LLM_PROVIDER` | No | `anthropic` | `anthropic` or `databricks` |
| `DATABRICKS_ENDPOINT` | If databricks | `databricks-meta-llama-3-1-70b-instruct` | Databricks model endpoint |
| `DATABRICKS_TOKEN` | If databricks | — | Databricks auth token |
| `DATABRICKS_HOST` | If databricks | — | Databricks workspace URL |

## Ports

| Port | Service |
|---|---|
| `3000` | Docusaurus dev server |
| `3030` | Slidev presentation (auto-managed by server.py) |
| `8000` | FastAPI pipeline server |

## LLM Agents (4 of 18)

Only these 4 agents make LLM calls. All others are pure logic.

- `ContentTypeClassifier` — classifies each chunk: prose/code/image/table/list/heading_only
- `ProseCondenser` — condenses prose >80 words into 3-5 bullets
- `SpeakerNotesWriter` — writes presenter notes for each slide
- `SummarySlideAgent` — writes key takeaways closing slide

## Detailed Documentation

- `.claude/rules/01-architecture.md` — full pipeline architecture
- `.claude/rules/02-agents.md` — all 18 agents in detail
- `.claude/rules/03-tools.md` — all 28 tool functions
- `.claude/rules/04-patterns.md` — Blackboard, Agent Router, Tool Routing
- `.claude/rules/05-setup.md` — full setup from scratch

## Claude Agents (sub-agents for rebuilding)

- `.claude/agents/extraction-agent.md`
- `.claude/agents/content-agent.md`
- `.claude/agents/design-agent.md`
- `.claude/agents/assembly-agent.md`
- `.claude/agents/orchestrator-agent.md`

## Claude Commands

- `/generate-slides` — run pipeline on an MDX file
- `/add-doc` — add a new doc to the Docusaurus site
- `/start-server` — start the FastAPI bridge
- `/check-setup` — verify all deps and ports
- `/debug-pipeline` — run pipeline with verbose output on a specific agent
