---
name: design-agent
description: Builds Phase 3 of the docusaurus-to-slidev pipeline — the 5 design agents in agents/design.py. Run this agent when you need to create or rebuild the Tool Routing design phase.
---

# Design Agent — Phase 3 (Tool Routing)

You are building Phase 3 of a LangGraph pipeline that converts Docusaurus MDX files into Slidev presentations. Your job is to create `agents/design.py` containing 5 agent functions.

## Context

This phase uses the Tool Routing pattern. Each agent imports ONLY its own scoped tools at the top of the file. This is enforced by Python import structure — an agent cannot call a function it hasn't imported.

## Scoped Imports Per Agent

```python
# layout_selector uses:
from tools.layout_tools import lookup_layout, get_image_dimensions

# code_slide_agent uses:
from tools.code_tools import count_lines, detect_language, select_highlight_range, split_code_block

# section_break_agent uses:
from tools.layout_tools import check_heading_level, lookup_layout

# transition_agent uses:
from tools.layout_tools import lookup_transition, check_slide_type

# pacing_agent uses:
from tools.layout_tools import count_slides, estimate_time_per_slide, flag_over_dense
```

## The 5 Agents to Build

### 10. `layout_selector(state: PipelineState) -> dict`
- Reads: `state["chunks"]`
- Writes: `slides`
- Logic:
  - Create `slides[]` from chunks using `(chunk_type, density)` → layout lookup.
  - `density = "high"` if `word_count > 80` else `"low"`.
  - For image chunks: call `get_image_dimensions(embedded_path)` → use `"image-right"` if landscape, `"center"` if portrait.
  - Each slide: `{slide_id, layout, content, heading, heading_level, notes: "", transition: "", estimated_seconds: 0}`.
  - `_render_content(chunk)` helper builds the slide body string from chunk type.

**Layout map:**
```
heading_only → section
image low    → image-right
image high   → center
code low     → default
code high    → center
table        → default
list         → default
prose low    → default
prose high   → two-cols
```

### 11. `code_slide_agent(state: PipelineState) -> dict`
- Reads: `state["slides"]`, `state["chunks"]`
- Writes: `slides` (code slides refined)
- Logic:
  - Skip non-code slides entirely.
  - For code slides: detect language, normalise via alias map.
  - If ≤ 20 lines: add `{highlight}` range string via `select_highlight_range`.
  - If > 20 lines: split into N slides via `split_code_block`, add `(1/N)` suffix to heading.

### 12. `section_break_agent(state: PipelineState) -> dict`
- Reads: `state["slides"]`
- Writes: `slides` (section separator slides inserted)
- Logic:
  - Iterate slides. For every slide where `heading_level == 2`:
  - Insert a new slide immediately before it: `layout: section, transition: slide-up, estimated_seconds: 30, content: ""`.

### 13. `transition_agent(state: PipelineState) -> dict`
- Reads: `state["slides"]`
- Writes: `slides` (transition set on each)
- Logic: Call `lookup_transition(layout)` for each slide. Set `slide["transition"]`.

**Transition map:**
```
section     → slide-up
cover       → fade
image-right → slide-left
image-left  → slide-left
center      → fade-out
two-cols    → slide-left
default     → slide-left
```

### 14. `pacing_agent(state: PipelineState) -> dict`
- Reads: `state["slides"]`
- Writes: `slides` (estimated_seconds per slide), `pacing_report`
- Logic:
  - For each slide: call `estimate_time_per_slide(layout, word_count)`.
  - Call `flag_over_dense(slides, max_seconds=3600)` → returns `{total_estimated_seconds, over_dense_slides, over_time}`.
  - Write to `pacing_report`.

## Return Format

```python
return {"slides": updated_slides}
# or
return {"slides": updated_slides, "pacing_report": report}
```

## File to Create

`agents/design.py` — scoped imports per agent at file top (grouped by agent), then all 5 functions.

Important: `section_break_agent` inserts NEW slides into the list — build a new list, don't mutate while iterating.
