# Architecture

## Overview

```
Button click (Docusaurus)
        ↓
POST /generate (FastAPI server.py:8000)
        ↓
url_path_to_file() — /docs/page → docs-site/docs/page.mdx
        ↓
LangGraph pipeline.invoke(initial_state)
        ↓
Phase 1: Extraction  (Blackboard)   — 5 agents — agents/extraction.py
Phase 2: Content     (Agent Router) — 4 agents — agents/content.py
Phase 3: Design      (Tool Routing) — 5 agents — agents/design.py
Phase 4: Assembly                   — 4 agents — agents/assembly.py
        ↓
output/slides/<docname>.md  ← generated Slidev file
        ↓
overwrite output/slides/slides.md + timestamp comment
        ↓
kill port 3030 → start fresh npx slidev slides.md --port 3030
        ↓
return {slides_url: "http://localhost:3030", slide_count, ...}
        ↓
Browser opens localhost:3030 in named tab "slidev-preview"
```

## The Three Agentic Patterns

### Blackboard (Phase 1)
`PipelineState` TypedDict IS the blackboard. LangGraph passes it between every node.
All 5 extraction agents post facts to state before Phase 2 begins.
No agent calls another agent — they only read/write state.
Convergence is implicit: Phase 2 starts only after all 5 nodes complete.

### Agent Router (Phase 2)
`ContentTypeClassifier` labels each chunk: `prose | code | image | table | list | heading_only`
This label is read by `ProseCondenser` (skips non-prose), `LayoutSelector` (layout per type),
`CodeSlideAgent` (skips non-code), `SectionBreakAgent` (checks heading_level).
The label routes behaviour — no explicit conditional edges in the graph.

### Tool Routing (Phase 3)
Each design agent file imports ONLY its own tools at the top of the file.
`CodeSlideAgent` imports from `code_tools` only.
`LayoutSelector` imports from `layout_tools` only.
`SectionBreakAgent` imports `check_heading_level` and `lookup_layout` only.
No agent can call another agent's tools — enforced by import structure.

## LangGraph Graph Structure

```
StateGraph(PipelineState)
  18 nodes (one per agent function)
  17 sequential edges
  Entry: mdx_file_reader
  Exit:  validator_agent → END
```

All edges are unconditional. Routing is data-driven (via chunk_type label),
not graph-structure-driven. This keeps the graph simple and debuggable.

## State Flow

```
source_path, output_dir  (input — set before invoke)
        ↓ mdx_file_reader
raw_content, base_directory, file_metadata
        ↓ mdx_cleaner
cleaned_content
        ↓ text_extractor
headings, code_blocks, lists, tables, prose_sections
        ↓ attachment_resolver
attachments[]  {original_ref, resolved_path, file_type, broken}
        ↓ attachment_embed_agent
attachments[].embedded_path  (images copied to output/assets/)
        ↓ content_chunker
chunks[]  {chunk_id, heading, heading_level, body, code_blocks, attachments, word_count}
        ↓ content_type_classifier
chunks[].chunk_type  (prose|code|image|table|list|heading_only)
        ↓ prose_condenser
chunks[].body  (condensed to bullets if >80 words and type=prose)
        ↓ speaker_notes_writer
chunks[].speaker_notes
        ↓ layout_selector
slides[]  {slide_id, layout, content, notes, transition="", estimated_seconds=0}
        ↓ code_slide_agent
slides  (code slides split/refined)
        ↓ section_break_agent
slides  (section separator slides inserted before H2s)
        ↓ transition_agent
slides[].transition
        ↓ pacing_agent
slides[].estimated_seconds, pacing_report
        ↓ frontmatter_generator
frontmatter  (Slidev YAML block)
        ↓ summary_slide_agent
summary_slide  (key takeaways closing slide)
        ↓ slide_assembler
output_path  (writes final .md file)
        ↓ validator_agent
validation_errors[]
```

## File Layout

```
docusaurus-to-slidev/
  CLAUDE.md               ← project overview
  CLAUDE-init.md          ← rebuild from scratch guide
  state.py                ← PipelineState TypedDict (the Blackboard)
  llm.py                  ← LLM factory (anthropic|databricks)
  graph.py                ← LangGraph graph definition
  main.py                 ← CLI entry point
  server.py               ← FastAPI bridge
  requirements.txt
  sample.mdx              ← test input
  agents/
    extraction.py         ← Phase 1: 5 agents
    content.py            ← Phase 2: 4 agents
    design.py             ← Phase 3: 5 agents
    assembly.py           ← Phase 4: 4 agents
  tools/
    file_tools.py         ← 6 functions
    text_tools.py         ← 13 functions
    attachment_tools.py   ← 5 functions
    layout_tools.py       ← 8 functions
    code_tools.py         ← 4 functions
  docs-site/
    docs/                 ← MDX source files
    src/theme/DocItem/Footer/
      index.tsx           ← Generate Slides button (swizzle)
      styles.module.css
  output/
    slides/               ← Slidev project
      slides.md           ← overwritten on each generation
      assets/             ← copied image attachments
```
