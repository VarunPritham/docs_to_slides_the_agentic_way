# CLAUDE-init — Rebuild This Project From Scratch

Use this file when starting the project on a new machine or firm environment.
Hand this to Claude Code and say: "Follow CLAUDE-init.md to rebuild the project."

---

## What We Are Building

A system that converts Docusaurus MDX documentation pages into Slidev presentations on demand.
A button appears at the bottom of every Docusaurus doc page. Clicking it triggers an 18-agent
LangGraph pipeline that generates a valid Slidev `.md` file and opens it in a live presentation server.

---

## Step 1 — Repository & Python Environment

```bash
mkdir docusaurus-to-slidev && cd docusaurus-to-slidev
python -m venv .venv && source .venv/bin/activate
pip install langgraph langchain-anthropic langchain-community anthropic fastapi uvicorn
```

Create `requirements.txt`:
```
langgraph>=0.2.0
langchain-anthropic>=0.3.0
langchain-community>=0.3.0
anthropic>=0.40.0
fastapi
uvicorn
```

---

## Step 2 — Core Data Structures (state.py)

Create `state.py` with `PipelineState` TypedDict. This is the Blackboard — shared state
that flows through every LangGraph node.

Fields needed:
- Input: `source_path`, `output_dir`
- Extraction: `raw_content`, `base_directory`, `file_metadata`, `cleaned_content`,
  `headings`, `code_blocks`, `prose_sections`, `lists`, `tables`, `attachments`
- Content: `chunks`
- Design: `slides`, `pacing_report`
- Assembly: `frontmatter`, `summary_slide`, `output_path`, `validation_errors`
- Meta: `errors`

TypedDicts to define: `Attachment`, `CodeBlock`, `Chunk`, `Slide`, `PipelineState`

---

## Step 3 — LLM Factory (llm.py)

Create `llm.py` with `get_llm(model_name)` factory.
- Default provider: `anthropic` using `ANTHROPIC_API_KEY`
- Alternative: `databricks` using `DATABRICKS_ENDPOINT` + `DATABRICKS_TOKEN`
- Export `USE_LLM = bool(os.getenv("ANTHROPIC_API_KEY") or os.getenv("DATABRICKS_TOKEN"))`

Use `claude-haiku-4-5-20251001` as the default model (fast, cheap for routing tasks).

---

## Step 4 — Tool Modules (tools/)

Create `tools/__init__.py` (empty) and these 5 files:

### tools/file_tools.py
Functions: `read_file`, `get_base_directory`, `get_file_metadata`,
`get_output_directory`, `copy_file`, `write_file`

### tools/text_tools.py
Functions: `strip_imports`, `strip_jsx_components`, `convert_admonitions`,
`strip_html_tags`, `extract_headings`, `extract_code_blocks`, `extract_lists`,
`extract_tables`, `extract_prose`, `count_words`, `build_heading_tree`,
`split_by_heading`, `convert_to_bullets`

Key logic:
- `convert_admonitions`: regex `:::(\w+)\n(.*?):::` → `> **TYPE:** body`
- `extract_headings`: returns `[{level, text, position}]` from `^(#{1,3})\s+(.+)`
- `extract_code_blocks`: returns `[{language, content, line_count}]`
- `split_by_heading`: splits content at heading line positions

### tools/attachment_tools.py
Functions: `list_attachments_in_text`, `resolve_relative_path`,
`check_path_exists`, `classify_file_type`, `rewrite_path_to_relative`

Image extensions: `.png .jpg .jpeg .gif .svg .webp`
PDF: `.pdf` | Video: `.mp4 .webm .mov` | Code: `.py .ts .js .go .java .rs .sh`

### tools/layout_tools.py
Functions: `lookup_layout`, `lookup_transition`, `lookup_theme`,
`check_heading_level`, `check_slide_type`, `estimate_time_per_slide`,
`count_slides`, `flag_over_dense`, `get_image_dimensions`

Layout map: `(chunk_type, density)` → Slidev layout name
Transition map: `layout` → transition name
Seconds per layout: section=30, cover=20, image-right=60, center=90, two-cols=75, default=60

### tools/code_tools.py
Functions: `count_lines`, `detect_language`, `select_highlight_range`, `split_code_block`

MAX_LINES_PER_SLIDE = 20
Language aliases: `py→python`, `ts→typescript`, `js→javascript`, `sh→bash`, `yml→yaml`

---

## Step 5 — Agents (agents/)

Create `agents/__init__.py` (empty) and these 4 files.
Each agent is a function: `def agent_name(state: PipelineState) -> dict`
Return dict contains only the state keys the agent writes — LangGraph merges it.

### agents/extraction.py — Phase 1 (Blackboard)
5 agents that run sequentially. All post facts before Phase 2 starts.

1. `mdx_file_reader` — reads file, writes: `raw_content`, `base_directory`, `file_metadata`
2. `mdx_cleaner` — cleans MDX, writes: `cleaned_content`
3. `text_extractor` — extracts structure, writes: `headings`, `code_blocks`, `lists`, `tables`, `prose_sections`
4. `attachment_resolver` — resolves refs, writes: `attachments` list
5. `attachment_embed_agent` — copies images to output/assets/, updates `attachments[].embedded_path`

### agents/content.py — Phase 2 (Agent Router)
4 agents. `ContentTypeClassifier` is the router — its labels drive downstream behaviour.

6. `content_chunker` — splits by headings, writes: `chunks`
7. `content_type_classifier` — labels each chunk, updates: `chunks[].chunk_type` — **LLM**
8. `prose_condenser` — condenses prose >80 words to bullets, updates: `chunks[].body` — **LLM**
9. `speaker_notes_writer` — writes presenter notes, adds: `chunks[].speaker_notes` — **LLM**

### agents/design.py — Phase 3 (Tool Routing)
5 agents. Each imports ONLY its scoped tools.

10. `layout_selector` — assigns Slidev layout per chunk, writes: `slides`
11. `code_slide_agent` — refines code slides, splits long blocks, updates: `slides`
12. `section_break_agent` — inserts section slides before H2s, updates: `slides`
13. `transition_agent` — assigns transitions, updates: `slides[].transition`
14. `pacing_agent` — estimates timing, writes: `slides[].estimated_seconds`, `pacing_report`

### agents/assembly.py — Phase 4
4 agents that produce the final output file.

15. `frontmatter_generator` — builds Slidev frontmatter, writes: `frontmatter`
16. `summary_slide_agent` — writes key takeaways slide from H2s, writes: `summary_slide` — **LLM**
17. `slide_assembler` — stitches everything, writes: `output_path`
18. `validator_agent` — checks output file, writes: `validation_errors`

---

## Step 6 — LangGraph Graph (graph.py)

```python
from langgraph.graph import StateGraph, END

def build_graph():
    g = StateGraph(PipelineState)
    # Add all 18 nodes
    # Wire 17 edges sequentially
    # set_entry_point("mdx_file_reader")
    # Final edge: validator_agent → END
    return g.compile()

pipeline = build_graph()
```

Node names (in order):
`mdx_file_reader → mdx_cleaner → text_extractor → attachment_resolver →
attachment_embed → content_chunker → content_classifier → prose_condenser →
speaker_notes → layout_selector → code_slide_agent → section_break_agent →
transition_agent → pacing_agent → frontmatter_generator → summary_slide_agent →
slide_assembler → validator_agent`

---

## Step 7 — CLI Entry Point (main.py)

`run(source_path, output_dir)` function:
1. Build initial empty state dict with all PipelineState keys set to empty values
2. Call `pipeline.invoke(initial_state)`
3. Print summary: output path, slide count, duration estimate, validation errors

Also wire `argparse` for `python main.py <file.mdx> --output-dir ./output`

---

## Step 8 — FastAPI Bridge (server.py)

Endpoints:
- `POST /generate` — body: `{doc_path: "/docs/page-name"}`
- `GET /health`

Key functions:
- `url_path_to_file(doc_path)` — maps `/docs/agent-router` → `docs-site/docs/agent-router.mdx`
  Try suffixes: `.mdx`, `.md`, `/index.mdx`, `/index.md`
- `kill_port(port)` — `lsof -ti :<port> | xargs kill -9`
- `ensure_slidev_running()` — kill port, start fresh `npx slidev slides.md --port 3030`,
  wait up to 15s for socket to open

On generate:
1. Resolve MDX file or 404
2. Run `run_pipeline(source_path, output_dir)`
3. Overwrite `output/slides/slides.md` + append `<!-- generated: {timestamp} -->` to force hot-reload
4. Kill port 3030 and start fresh Slidev
5. Return `{slides_url, output_path, slide_count, warnings}`

CORS: allow `http://localhost:3000`
Run: `uvicorn server:app --host 0.0.0.0 --port 8000 --reload`

---

## Step 9 — Docusaurus Setup (docs-site/)

```bash
npx create-docusaurus@latest docs-site classic --typescript
cd docs-site && npm install
```

Swizzle `DocItem/Footer` to add the Generate Slides button.
Create `src/theme/DocItem/Footer/index.tsx`:

```typescript
// Wraps the original footer and appends GenerateSlidesButton
// Button: POST to http://localhost:8000/generate with {doc_path: window.location.pathname}
// States: idle | generating | done | error
// While generating: cycle through step labels every 800ms
// On done: show slide count + "open presentation" link to slides_url
// On error: show error + "is python server.py running?" hint
// window.open(slides_url, 'slidev-preview') — named target avoids duplicate tabs
```

Add `styles.module.css` for button styling using CSS variables
(`--ifm-color-primary`, `--ifm-color-success`, `--ifm-color-danger`).

---

## Step 10 — Slidev Output Project (output/slides/)

```bash
npm init slidev@latest output/slides -- --yes
cd output/slides && npm install
```

This creates the Slidev project. `slides.md` in this directory is the file that gets
overwritten on every generation. Slidev watches it and hot-reloads.

---

## Step 11 — Git Setup

```bash
git init
```

`.gitignore` must exclude:
- `__pycache__/`, `*.pyc`
- `node_modules/` (all levels)
- `docs-site/build/`, `.docusaurus/`
- `output/slides/node_modules/`
- `output/slides/slides.md` (ephemeral)
- `output/assets/` (ephemeral)
- `.env`

---

## Rebuild Checklist

- [ ] Python venv + requirements installed
- [ ] `state.py` — PipelineState TypedDict with all fields
- [ ] `llm.py` — factory with anthropic + databricks branches
- [ ] `tools/` — 5 files, 28 functions
- [ ] `agents/` — 4 files, 18 agent functions
- [ ] `graph.py` — 18 nodes, 17 edges, compiled pipeline
- [ ] `main.py` — run() + argparse CLI
- [ ] `server.py` — FastAPI with kill_port + ensure_slidev_running
- [ ] `docs-site/` — Docusaurus with swizzled DocItem/Footer
- [ ] `output/slides/` — Slidev project
- [ ] `.gitignore` — excludes node_modules and ephemeral output
- [ ] `ANTHROPIC_API_KEY` exported in shell
- [ ] Test: `python main.py sample.mdx` produces valid `output/sample.md`
- [ ] Test: `python server.py` starts on port 8000
- [ ] Test: `curl POST localhost:8000/generate` with a real doc path returns 200
