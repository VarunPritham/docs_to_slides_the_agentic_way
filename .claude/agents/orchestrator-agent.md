---
name: orchestrator-agent
description: Builds the full docusaurus-to-slidev pipeline end-to-end — state.py, llm.py, graph.py, main.py, server.py, and all tool modules. Use this agent to orchestrate the entire rebuild from scratch on a new machine.
---

# Orchestrator Agent — Full Pipeline

You are rebuilding the full docusaurus-to-slidev system from scratch. This system converts Docusaurus MDX documentation pages into Slidev presentations via an 18-agent LangGraph pipeline triggered by a button in the doc footer.

## Your Job

Build all Python infrastructure in this order (each depends on the previous):
1. `state.py`
2. `llm.py`
3. `tools/` (5 files)
4. `agents/` (4 files) — use the 4 phase-specific agents for detail
5. `graph.py`
6. `main.py`
7. `server.py`

Then verify with: `python main.py sample.mdx --output-dir ./output`

## Step 1 — state.py

`PipelineState` TypedDict with these nested types:

```python
class Attachment(TypedDict):
    original_ref: str
    resolved_path: str
    file_type: str       # image/pdf/video/code_file/unknown
    broken: bool
    embedded_path: str   # set by attachment_embed_agent

class CodeBlock(TypedDict):
    language: str
    content: str
    line_count: int

class Chunk(TypedDict):
    chunk_id: str
    heading: str
    heading_level: int
    body: str
    code_blocks: List[CodeBlock]
    attachments: List[Attachment]
    word_count: int
    chunk_type: str      # prose|code|image|table|list|heading_only
    speaker_notes: str

class Slide(TypedDict):
    slide_id: str
    layout: str
    content: str
    heading: str
    heading_level: int
    notes: str
    transition: str
    estimated_seconds: int

class PipelineState(TypedDict):
    # Input
    source_path: str
    output_dir: str
    # Phase 1
    raw_content: str
    base_directory: str
    file_metadata: dict
    cleaned_content: str
    headings: List[dict]
    code_blocks: List[CodeBlock]
    lists: List[str]
    tables: List[str]
    prose_sections: List[str]
    attachments: List[Attachment]
    # Phase 2
    chunks: List[Chunk]
    # Phase 3
    slides: List[Slide]
    pacing_report: dict
    # Phase 4
    frontmatter: str
    summary_slide: str
    output_path: str
    validation_errors: List[str]
    # Meta
    errors: List[str]
```

## Step 2 — llm.py

```python
import os
from langchain_anthropic import ChatAnthropic
from langchain_community.chat_models import ChatDatabricks

USE_LLM = bool(os.getenv("ANTHROPIC_API_KEY") or os.getenv("DATABRICKS_TOKEN"))

def get_llm(model_name: str = None):
    provider = os.getenv("LLM_PROVIDER", "anthropic")
    if provider == "databricks":
        return ChatDatabricks(
            endpoint=os.getenv("DATABRICKS_ENDPOINT", "databricks-meta-llama-3-1-70b-instruct"),
            dapiToken=os.getenv("DATABRICKS_TOKEN"),
            host=os.getenv("DATABRICKS_HOST"),
        )
    return ChatAnthropic(
        model=model_name or "claude-haiku-4-5-20251001",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
    )
```

## Step 3 — graph.py

```python
from langgraph.graph import StateGraph, END
from state import PipelineState
from agents.extraction import mdx_file_reader, mdx_cleaner, text_extractor, attachment_resolver, attachment_embed_agent
from agents.content import content_chunker, content_type_classifier, prose_condenser, speaker_notes_writer
from agents.design import layout_selector, code_slide_agent, section_break_agent, transition_agent, pacing_agent
from agents.assembly import frontmatter_generator, summary_slide_agent, slide_assembler, validator_agent

def build_graph():
    g = StateGraph(PipelineState)
    nodes = [
        ("mdx_file_reader", mdx_file_reader),
        ("mdx_cleaner", mdx_cleaner),
        ("text_extractor", text_extractor),
        ("attachment_resolver", attachment_resolver),
        ("attachment_embed", attachment_embed_agent),
        ("content_chunker", content_chunker),
        ("content_classifier", content_type_classifier),
        ("prose_condenser", prose_condenser),
        ("speaker_notes", speaker_notes_writer),
        ("layout_selector", layout_selector),
        ("code_slide_agent", code_slide_agent),
        ("section_break_agent", section_break_agent),
        ("transition_agent", transition_agent),
        ("pacing_agent", pacing_agent),
        ("frontmatter_generator", frontmatter_generator),
        ("summary_slide_agent", summary_slide_agent),
        ("slide_assembler", slide_assembler),
        ("validator_agent", validator_agent),
    ]
    for name, fn in nodes:
        g.add_node(name, fn)

    names = [n for n, _ in nodes]
    for i in range(len(names) - 1):
        g.add_edge(names[i], names[i + 1])
    g.add_edge(names[-1], END)
    g.set_entry_point(names[0])
    return g.compile()

pipeline = build_graph()
```

## Step 4 — main.py

`run(source_path, output_dir)`:
1. Build initial state with all PipelineState keys set to empty values.
2. Call `pipeline.invoke(initial_state)`.
3. Print: output_path, slide count, duration estimate, validation errors.

Wire `argparse`: `python main.py <file.mdx> [--output-dir ./output]`

## Step 5 — server.py

FastAPI on port 8000. CORS allow `http://localhost:3000`.

Key functions:
- `url_path_to_file(doc_path)` — try `/docs/page.mdx`, `.md`, `/index.mdx`, `/index.md` under `docs-site/docs/`
- `kill_port(port)` — `lsof -ti :<port> | xargs kill -9 2>/dev/null || true`
- `ensure_slidev_running(slides_path)` — kill 3030, `subprocess.Popen(["npx", "slidev", "slides.md", "--port", "3030"])` from `output/slides/`, wait up to 15s for socket to open

`POST /generate`:
1. Resolve MDX file or 404
2. `run_pipeline(source_path, "output/slides")`
3. Copy result to `output/slides/slides.md` + append `<!-- generated: {time.time()} -->`
4. `ensure_slidev_running(...)`
5. Return `{slides_url: "http://localhost:3030", output_path, slide_count, warnings}`

Use `@asynccontextmanager` lifespan pattern (not deprecated `@app.on_event`).

## Verification

After building all files:
```bash
python main.py sample.mdx --output-dir ./output
```

Expected output:
```
[Pipeline] Starting — mode: mock (no API key) OR mode: anthropic LLM
...
[Pipeline] Done — output/sample.md (N slides, ~M min)
Validation: ✓ all checks passed
```

If errors appear, check: state field names match state.py, tool imports match tools/ file names, graph node names match the sequential edge list.
