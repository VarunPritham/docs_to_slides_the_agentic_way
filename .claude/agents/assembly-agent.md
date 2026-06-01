---
name: assembly-agent
description: Builds Phase 4 of the docusaurus-to-slidev pipeline — the 4 assembly agents in agents/assembly.py. Run this agent when you need to create or rebuild the final output assembly phase.
---

# Assembly Agent — Phase 4

You are building Phase 4 of a LangGraph pipeline that converts Docusaurus MDX files into Slidev presentations. Your job is to create `agents/assembly.py` containing 4 agent functions.

## Context

This phase produces the final `.md` output file in Slidev format. It reads from the accumulated state built by Phases 1–3, stitches everything together, and validates the result.

## The 4 Agents to Build

### 15. `frontmatter_generator(state: PipelineState) -> dict`
- Reads: `state["file_metadata"]`, `state["pacing_report"]`
- Writes: `frontmatter` (str — the `---\n...\n---` block)
- Tools: `lookup_theme` from `tools/layout_tools.py`
- Logic:
  - Title: `file_metadata["filename"]` → strip extension, replace `-_` with spaces, title-case.
  - Duration: `pacing_report["total_estimated_seconds"] // 60`
  - Theme: `lookup_theme(doc_tags=[])` → `"seriph"` by default
  - Always include: `highlighter: shiki`, `colorSchema: auto`, `transition: slide-left`
  - Output format:
    ```yaml
    ---
    theme: seriph
    title: My Document
    highlighter: shiki
    colorSchema: auto
    transition: slide-left
    duration: 12
    ---
    ```

### 16. `summary_slide_agent(state: PipelineState) -> dict`
- Reads: `state["headings"]`
- Writes: `summary_slide` (str — full Slidev slide block)
- LLM: **Yes**
- LLM prompt: `"Write 3-5 concise key takeaways for a presentation that covered these topics: {h2_list}. Format as bullet points, each under 12 words."`
- Mock fallback: Use H2 headings directly as bullets (max 5)
- Output slide format:
  ```
  ---
  layout: center
  transition: fade
  ---

  # Key Takeaways

  - bullet one
  - bullet two

  <!--
  Summary of the main points covered in this presentation.
  -->
  ```
- Skip (return empty string): if no H2 headings found.

### 17. `slide_assembler(state: PipelineState) -> dict`
- Reads: `state["frontmatter"]`, `state["slides"]`, `state["summary_slide"]`, `state["attachments"]`, `state["source_path"]`, `state["output_dir"]`
- Writes: `output_path` (str)
- Tools: `write_file` from `tools/file_tools.py`
- Logic:
  1. Build a cover slide: `layout: cover, transition: fade, # {title}` using title from frontmatter.
  2. For each slide, render:
     ```
     ---
     layout: {layout}
     transition: {transition}
     ---

     {content}

     <!--
     {notes}
     -->
     ```
  3. Rewrite attachment `original_ref` → `embedded_path` in content strings (only where `embedded_path` is set).
  4. Join: `[frontmatter, cover, ...slide blocks..., summary_slide]` with `\n\n`
  5. Output filename: `{source_basename}.md` (no directory, just filename with `.md`)
  6. Write to `output_dir/{filename}` via `write_file`.

### 18. `validator_agent(state: PipelineState) -> dict`
- Reads: `state["output_path"]`
- Writes: `validation_errors` (list of str)
- Logic — run these checks, print ✓ or ✗ to stdout:
  1. Output file exists on disk
  2. Content starts with `---` (frontmatter present)
  3. No `^import\s+` lines (leftover MDX imports)
  4. No `<[A-Z][a-zA-Z]+` patterns (leftover JSX components)
  5. All local image refs `![alt](path)` resolve on disk — skip refs starting with `http://`, `https://`, `pathname://`
- Collect all failures as strings in `validation_errors`.

## Return Format

```python
return {"frontmatter": fm_string}
return {"summary_slide": slide_block}
return {"output_path": str(written_path)}
return {"validation_errors": errors}
```

## File to Create

`agents/assembly.py` — imports at top, then all 4 functions.

The `slide_assembler` is the most complex — get the separator format right. Slidev requires `---` between slides with frontmatter keys immediately after `---`. Speaker notes go in `<!-- ... -->` at the end of each slide block.
