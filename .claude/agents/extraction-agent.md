---
name: extraction-agent
description: Builds Phase 1 of the docusaurus-to-slidev pipeline — the 5 extraction agents in agents/extraction.py. Run this agent when you need to create or rebuild the Blackboard extraction phase.
---

# Extraction Agent — Phase 1 (Blackboard)

You are building Phase 1 of a LangGraph pipeline that converts Docusaurus MDX files into Slidev presentations. Your job is to create `agents/extraction.py` containing 5 agent functions.

## Context

The pipeline uses a Blackboard pattern. All 5 agents in this phase post facts to the shared `PipelineState` TypedDict before Phase 2 begins. No agent calls another agent — they only read/write state.

State is defined in `state.py`. Import from there.
Tools are in `tools/file_tools.py`, `tools/text_tools.py`, `tools/attachment_tools.py`. Import only what you need per agent.

## The 5 Agents to Build

### 1. `mdx_file_reader(state: PipelineState) -> dict`
- Reads: `state["source_path"]`
- Writes: `raw_content` (str), `base_directory` (str), `file_metadata` (dict)
- Tools: `read_file`, `get_base_directory`, `get_file_metadata`
- Logic: Read file content. Get absolute directory of file. Get `{filename, size_bytes, abs_path}` metadata.

### 2. `mdx_cleaner(state: PipelineState) -> dict`
- Reads: `state["raw_content"]`
- Writes: `cleaned_content` (str)
- Tools: `strip_imports`, `strip_jsx_components`, `convert_admonitions`, `strip_html_tags`
- Logic: Apply all 4 cleaning passes in order. Collapse 3+ blank lines to 2.

### 3. `text_extractor(state: PipelineState) -> dict`
- Reads: `state["cleaned_content"]`
- Writes: `headings`, `code_blocks`, `lists`, `tables`, `prose_sections`
- Tools: `extract_headings`, `extract_code_blocks`, `extract_lists`, `extract_tables`, `extract_prose`
- Logic: Run all 5 extractions independently.

### 4. `attachment_resolver(state: PipelineState) -> dict`
- Reads: `state["cleaned_content"]`, `state["base_directory"]`
- Writes: `attachments` (list of Attachment dicts)
- Tools: `list_attachments_in_text`, `resolve_relative_path`, `check_path_exists`, `classify_file_type`
- Logic: Find all `![]()` and local `[]()` refs. Resolve each relative to base_directory. Check existence. Classify by extension. Set `broken=True` if not found. HTTP refs are never broken.

### 5. `attachment_embed_agent(state: PipelineState) -> dict`
- Reads: `state["attachments"]`, `state["output_dir"]`
- Writes: `attachments` (updated with `embedded_path`)
- Tools: `copy_file`, `get_output_directory`
- Logic: Create `output_dir/assets/`. For each non-broken image attachment: copy to assets, set `embedded_path = ./assets/<filename>`. Non-image attachments get empty `embedded_path`.

## Return Format

Each agent returns ONLY the keys it writes:
```python
def mdx_file_reader(state: PipelineState) -> dict:
    ...
    return {
        "raw_content": content,
        "base_directory": base_dir,
        "file_metadata": metadata,
    }
```

LangGraph merges this dict into state — never return the full state.

## File to Create

`agents/extraction.py` — imports at top, then all 5 functions. No class wrappers.

Check `state.py` for the exact field names before writing. Check each tool file for exact function signatures.
