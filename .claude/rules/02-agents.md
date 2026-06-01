# All 18 Agents

## Phase 1 — Extraction (agents/extraction.py)

### 1. mdx_file_reader
- **Input state reads:** `source_path`
- **Output state writes:** `raw_content`, `base_directory`, `file_metadata`
- **Tools used:** `read_file`, `get_base_directory`, `get_file_metadata`
- **LLM:** No
- **Logic:** Opens file at `source_path`. Returns raw string content, absolute directory path, and `{filename, size_bytes, abs_path}` metadata dict.

### 2. mdx_cleaner
- **Input state reads:** `raw_content`
- **Output state writes:** `cleaned_content`
- **Tools used:** `strip_imports`, `strip_jsx_components`, `convert_admonitions`, `strip_html_tags`
- **LLM:** No
- **Logic:** Sequential cleaning passes. Import lines removed first (they break everything downstream). JSX block/self-closing tags removed. Docusaurus admonitions (`:::note`) converted to `> **NOTE:**` blockquotes. Stray HTML tags stripped. 3+ blank lines collapsed to 2.

### 3. text_extractor
- **Input state reads:** `cleaned_content`
- **Output state writes:** `headings`, `code_blocks`, `lists`, `tables`, `prose_sections`
- **Tools used:** `extract_headings`, `extract_code_blocks`, `extract_lists`, `extract_tables`, `extract_prose`
- **LLM:** No
- **Logic:** Runs 5 independent regex extractions. Headings carry `{level, text, position}` where position is line number — critical for `split_by_heading`. Code blocks carry language tag and line count.

### 4. attachment_resolver
- **Input state reads:** `cleaned_content`, `base_directory`
- **Output state writes:** `attachments`
- **Tools used:** `list_attachments_in_text`, `resolve_relative_path`, `check_path_exists`, `classify_file_type`
- **LLM:** No
- **Logic:** Finds all `![]()` and local `[]()` refs. For each: resolves relative to `base_directory` using `os.path.normpath(join(...))`. Checks existence. Classifies by extension. Sets `broken=True` if file not found. HTTP refs pass through as non-broken.

### 5. attachment_embed_agent
- **Input state reads:** `attachments`, `output_dir`
- **Output state writes:** `attachments` (updated with `embedded_path`)
- **Tools used:** `copy_file`, `get_output_directory`
- **LLM:** No
- **Logic:** Creates `output_dir/assets/`. For each non-broken image attachment: copies file to assets dir, sets `embedded_path = ./assets/<filename>`. PDFs, videos, code files are left with empty `embedded_path` — handled as reference slides later.

---

## Phase 2 — Content (agents/content.py)

### 6. content_chunker
- **Input state reads:** `cleaned_content`, `headings`, `attachments`, `code_blocks`
- **Output state writes:** `chunks`
- **Tools used:** `build_heading_tree`, `split_by_heading`, `count_words`
- **LLM:** No
- **Logic:** If no headings: one chunk for the whole document. Otherwise: calls `split_by_heading` which uses heading line positions to split content into sections. Each chunk associates code blocks (by substring match in body) and attachments (by `original_ref` in body). `chunk_type` is left empty — filled by classifier.

### 7. content_type_classifier
- **Input state reads:** `chunks`
- **Output state writes:** `chunks` (with `chunk_type` set)
- **Tools used:** `llm_classify` (via `get_llm().invoke()`), `keyword_match` (mock fallback)
- **LLM:** **Yes**
- **LLM prompt:** Heading + body (first 300 chars) + structural hints (has code? has images?) → classify into: `prose | code | image | table | list | heading_only`
- **Mock fallback:** Rule-based: code_blocks → code, image attachments → image, empty body → heading_only, `|` chars → table, starts with `-/*` → list, else → prose
- **Validation:** If LLM returns value outside the 6 valid types, falls back to mock classify.

### 8. prose_condenser
- **Input state reads:** `chunks`
- **Output state writes:** `chunks` (body replaced for prose chunks >80 words)
- **Tools used:** `llm_summarize` (via `get_llm().invoke()`), `count_words`, `convert_to_bullets` (mock)
- **LLM:** **Yes** (only for prose chunks with word_count > 80)
- **LLM prompt:** "Convert this documentation text into 3-5 concise bullet points suitable for a presentation slide. Each bullet max 12 words." + chunk body
- **Mock fallback:** `convert_to_bullets()` splits on sentence boundaries, takes first 5.
- **Passthrough:** Non-prose chunks and short prose chunks are passed through unchanged.

### 9. speaker_notes_writer
- **Input state reads:** `chunks`
- **Output state writes:** `chunks` (adds `speaker_notes` key to each)
- **Tools used:** `llm_write_notes` (via `get_llm().invoke()`), `count_words`
- **LLM:** **Yes**
- **LLM prompt:** "Write concise presenter speaker notes (3-5 sentences) for a slide titled '{heading}'. Use the full content below as context." + body (first 600 chars)
- **Mock fallback:** `"Detailed explanation of {heading}. {body[:200]}..."`
- **Output location:** Notes written into `<!-- ... -->` comment blocks in final slide by `SlideAssembler`.

---

## Phase 3 — Design (agents/design.py)

### 10. layout_selector
- **Input state reads:** `chunks`
- **Output state writes:** `slides`
- **Scoped tools:** `lookup_layout`, `get_image_dimensions`
- **LLM:** No
- **Logic:** Creates initial `slides[]` list from chunks. Layout assigned via `(chunk_type, density)` lookup table where density = "high" if word_count > 80 else "low". For image chunks: reads PNG header bytes to get width/height → `image-right` if landscape, `center` if portrait. Renders initial slide content via `_render_content()`.

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

### 11. code_slide_agent
- **Input state reads:** `slides`, `chunks`
- **Output state writes:** `slides` (code slides refined)
- **Scoped tools:** `count_lines`, `detect_language`, `select_highlight_range`, `split_code_block`
- **LLM:** No
- **Logic:** Skips non-code slides. For code slides: counts lines. If ≤20: adds `{highlight}` range string. If >20: splits into N slides with `(1/N)` suffix in heading. Language normalised via alias map. `split_code_block()` chunks at 20-line boundaries.

### 12. section_break_agent
- **Input state reads:** `slides`
- **Output state writes:** `slides` (section separator slides inserted)
- **Scoped tools:** `check_heading_level`, `lookup_layout`
- **LLM:** No
- **Logic:** Iterates slides. For every slide where `heading_level == 2`: inserts a new `layout: section` slide immediately before it. Section slide has empty notes, `transition: slide-up`, `estimated_seconds: 30`.

### 13. transition_agent
- **Input state reads:** `slides`
- **Output state writes:** `slides` (transition assigned to each)
- **Scoped tools:** `lookup_transition`, `check_slide_type`
- **LLM:** No
- **Transition map:**
```
section     → slide-up
cover       → fade
image-right → slide-left
image-left  → slide-left
center      → fade-out
two-cols    → slide-left
default     → slide-left
```

### 14. pacing_agent
- **Input state reads:** `slides`
- **Output state writes:** `slides` (estimated_seconds per slide), `pacing_report`
- **Scoped tools:** `count_slides`, `estimate_time_per_slide`, `flag_over_dense`
- **LLM:** No
- **Time formula:** `base_seconds + max(0, (word_count - 50) // 10) * 5`
- **Over-dense threshold:** >120 seconds per slide
- **Pacing report:** `{total_estimated_seconds, slide_count, over_dense_slides[], over_time}`

---

## Phase 4 — Assembly (agents/assembly.py)

### 15. frontmatter_generator
- **Input state reads:** `file_metadata`, `pacing_report`
- **Output state writes:** `frontmatter`
- **Tools used:** `render_frontmatter_template`, `lookup_theme`
- **LLM:** No
- **Logic:** Title from filename (strip extension, replace `-_` with spaces, title-case). Theme from doc tags via lookup (`seriph` default). Duration from `pacing_report.total_estimated_seconds // 60`. Always sets: `highlighter: shiki`, `colorSchema: auto`, `transition: slide-left`.

### 16. summary_slide_agent
- **Input state reads:** `headings`
- **Output state writes:** `summary_slide`
- **Tools used:** `llm_summarize` (via `get_llm().invoke()`), `read_headings_from_blackboard`
- **LLM:** **Yes**
- **LLM prompt:** "Write 3-5 concise key takeaways for a presentation that covered these topics: [H2 list]. Format as bullet points, each under 12 words."
- **Mock fallback:** H2 headings directly as bullets (max 5)
- **Output:** Full Slidev slide block: `layout: center, transition: fade, # Key Takeaways`
- **Skip:** Returns empty string if no H2 headings found.

### 17. slide_assembler
- **Input state reads:** `frontmatter`, `slides`, `summary_slide`, `attachments`, `source_path`, `output_dir`
- **Output state writes:** `output_path`
- **Tools used:** `join_slides`, `rewrite_attachment_paths`, `write_file`
- **LLM:** No
- **Logic:** Builds parts list: [frontmatter, cover slide, ...slide blocks..., summary]. Each slide block: `\n---\nlayout: X\ntransition: Y\n---\n\ncontent\n\n<!--\nnotes\n-->`. Rewrites attachment `original_ref` → `embedded_path` in content strings. Output filename: `{source_basename}.md`. Writes to `output_dir`.

### 18. validator_agent
- **Input state reads:** `output_path`
- **Output state writes:** `validation_errors`
- **Tools used:** `validate_frontmatter`, `check_broken_refs`, `check_leftover_mdx`
- **LLM:** No
- **Checks:**
  1. Output file exists
  2. Content starts with `---` (frontmatter present)
  3. No `^import\s+` lines (leftover MDX imports)
  4. No `<[A-Z][a-zA-Z]+` patterns (leftover JSX)
  5. All local image refs (`![](path)`) resolve on disk — excludes `http://` and `pathname://`
- **Output:** Prints ✓ or ✗ per check to stdout. Writes list of error strings to state.
