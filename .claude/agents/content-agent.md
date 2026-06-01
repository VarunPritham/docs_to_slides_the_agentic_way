---
name: content-agent
description: Builds Phase 2 of the docusaurus-to-slidev pipeline — the 4 content agents in agents/content.py. Run this agent when you need to create or rebuild the Agent Router content phase.
---

# Content Agent — Phase 2 (Agent Router)

You are building Phase 2 of a LangGraph pipeline that converts Docusaurus MDX files into Slidev presentations. Your job is to create `agents/content.py` containing 4 agent functions.

## Context

This phase uses the Agent Router pattern. `content_type_classifier` labels each chunk with one of 6 types. All downstream agents in this phase read that label and decide whether to act — there are no conditional graph edges.

Imports needed:
- `from state import PipelineState`
- `from llm import get_llm, USE_LLM`
- `from tools.text_tools import ...` (per agent)

## The 4 Agents to Build

### 6. `content_chunker(state: PipelineState) -> dict`
- Reads: `state["cleaned_content"]`, `state["headings"]`, `state["attachments"]`, `state["code_blocks"]`
- Writes: `chunks`
- Tools: `build_heading_tree`, `split_by_heading`, `count_words`
- Logic:
  - If no headings: one chunk for the whole doc.
  - Otherwise: call `split_by_heading` using heading line positions.
  - Each chunk: `{chunk_id, heading, heading_level, body, code_blocks, attachments, word_count, chunk_type: ""}`.
  - Associate code blocks by substring match in body.
  - Associate attachments where `original_ref` appears in body.

### 7. `content_type_classifier(state: PipelineState) -> dict`
- Reads: `state["chunks"]`
- Writes: `chunks` (with `chunk_type` set on each)
- LLM: **Yes** — classifies each chunk
- LLM prompt: `"Classify this documentation section. Heading: {heading}. Content preview: {body[:300]}. Has code blocks: {has_code}. Has images: {has_images}. Return exactly one word from: prose, code, image, table, list, heading_only"`
- Mock fallback (when `USE_LLM` is False):
  - `code_blocks` present → `"code"`
  - image attachment → `"image"`
  - empty body → `"heading_only"`
  - `|` characters → `"table"`
  - starts with `- ` or `* ` → `"list"`
  - else → `"prose"`
- Validation: if LLM returns value not in the 6 valid types, fall back to mock.

### 8. `prose_condenser(state: PipelineState) -> dict`
- Reads: `state["chunks"]`
- Writes: `chunks` (body replaced for long prose chunks)
- LLM: **Yes** — but only for chunks where `chunk_type == "prose"` AND `word_count > 80`
- LLM prompt: `"Convert this documentation text into 3-5 concise bullet points suitable for a presentation slide. Each bullet max 12 words.\n\n{body}"`
- Mock fallback: `convert_to_bullets(body, max_items=5)`
- Passthrough: non-prose and short prose chunks returned unchanged.

### 9. `speaker_notes_writer(state: PipelineState) -> dict`
- Reads: `state["chunks"]`
- Writes: `chunks` (adds `speaker_notes` to each)
- LLM: **Yes** — for every chunk
- LLM prompt: `"Write concise presenter speaker notes (3-5 sentences) for a slide titled '{heading}'. Use the full content below as context.\n\n{body[:600]}"`
- Mock fallback: `f"Detailed explanation of {heading}. {body[:200]}..."`

## LLM Call Pattern

```python
from llm import get_llm, USE_LLM

if USE_LLM:
    llm = get_llm()
    response = llm.invoke(prompt)
    result = response.content.strip()
else:
    result = mock_fallback(...)
```

## Return Format

Return only the keys written:
```python
return {"chunks": updated_chunks}
```

Important: return a new list, not mutation-in-place, so LangGraph state merging works correctly.

## File to Create

`agents/content.py` — imports at top, then all 4 functions. No class wrappers.
