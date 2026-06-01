# Tool Modules — 5 Files, 28 Functions

Tools are pure Python functions — no LLM calls, no state mutation.
Each agent imports only the tools it needs (Tool Routing pattern).

---

## tools/file_tools.py — 6 functions

Used by: MDXFileReader, AttachmentEmbedAgent, SlideAssembler, FrontmatterGenerator

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `read_file` | `(path: str) → str` | File content as string | UTF-8 |
| `get_base_directory` | `(path: str) → str` | Absolute directory of file | `os.path.dirname(os.path.abspath(path))` |
| `get_file_metadata` | `(path: str) → dict` | `{filename, size_bytes, abs_path}` | Uses `os.stat()` |
| `get_output_directory` | `(output_dir: str) → str` | output_dir path | Creates `output_dir/` and `output_dir/assets/` |
| `copy_file` | `(src: str, output_dir: str) → str` | New relative path `./assets/<name>` | `shutil.copy2`. Returns `""` if src missing |
| `write_file` | `(path: str, content: str) → str` | Written path | Creates parent dirs. UTF-8 |

---

## tools/text_tools.py — 13 functions

Used by: MDXCleaner, TextExtractor, ContentChunker, ProseCondenser

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `strip_imports` | `(content: str) → str` | Cleaned content | Regex: `^import\s+.*?;?\s*$` multiline |
| `strip_jsx_components` | `(content: str) → str` | Cleaned content | Removes `<CamelCase>...</CamelCase>` and self-closing |
| `convert_admonitions` | `(content: str) → str` | Cleaned content | `:::note body :::` → `> **NOTE:** body` |
| `strip_html_tags` | `(content: str) → str` | Cleaned content | Removes all `<tag>` patterns |
| `extract_headings` | `(content: str) → list` | `[{level, text, position}]` | position = line number |
| `extract_code_blocks` | `(content: str) → list` | `[{language, content, line_count}]` | Regex ` ```lang\n...\n``` ` |
| `extract_lists` | `(content: str) → list` | `[str]` | Groups consecutive `-/*` or `1.` lines |
| `extract_tables` | `(content: str) → list` | `[str]` | Groups lines containing `|` (min 2 lines) |
| `extract_prose` | `(content: str) → list` | `[str]` | Removes code/headings/lists/tables, splits on `\n\n` |
| `count_words` | `(text: str) → int` | Word count | `len(text.split())` |
| `build_heading_tree` | `(headings: list) → list` | Headings with `children` index list | Used for level-aware chunking |
| `split_by_heading` | `(content: str, headings: list) → list` | `[{heading, heading_level, body}]` | Uses heading line positions to slice content |
| `convert_to_bullets` | `(text: str, max_items: int=5) → str` | Bullet string | Splits on `[.!?]\s+`, prefixes `- ` |

---

## tools/attachment_tools.py — 5 functions

Used by: AttachmentResolver, AttachmentEmbedAgent

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `list_attachments_in_text` | `(content: str) → list` | `[{alt, ref, kind}]` | Regex for `![]()` and local `[]()` refs |
| `resolve_relative_path` | `(ref: str, base_directory: str) → str` | Absolute path | `os.path.normpath(join(base, ref))`. HTTP refs returned as-is |
| `check_path_exists` | `(path: str) → bool` | Exists on disk | HTTP refs always return True |
| `classify_file_type` | `(path: str) → str` | `image/pdf/video/code_file/unknown` | Extension lookup |
| `rewrite_path_to_relative` | `(original: str, embedded_path: str) → str` | New path or original | Returns embedded_path if set |

**Extension sets:**
- image: `.png .jpg .jpeg .gif .svg .webp`
- pdf: `.pdf`
- video: `.mp4 .webm .mov`
- code_file: `.py .ts .js .go .java .rs .sh`

---

## tools/layout_tools.py — 8 functions

Used by: LayoutSelector, SectionBreakAgent, TransitionAgent, PacingAgent, FrontmatterGenerator

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `lookup_layout` | `(chunk_type: str, word_count: int) → str` | Slidev layout name | density="high" if word_count>80. Falls back to "default" |
| `lookup_transition` | `(layout: str) → str` | Transition name | Falls back to "slide-left" |
| `lookup_theme` | `(doc_tags: list=None) → str` | Theme name | "seriph" default. "default" if "minimal" in tags |
| `check_heading_level` | `(level: int) → bool` | True if level ≤ 2 | Used by SectionBreakAgent to decide section break insertion |
| `check_slide_type` | `(layout: str) → str` | Same layout string | Identity passthrough — used by TransitionAgent |
| `estimate_time_per_slide` | `(layout: str, word_count: int) → int` | Seconds | `base + max(0, (words-50)//10)*5` |
| `count_slides` | `(slides: list) → int` | Slide count | `len(slides)` |
| `flag_over_dense` | `(slides: list, max_seconds: int=3600) → dict` | Pacing report dict | `{total_estimated_seconds, over_dense_slides, over_time}` |
| `get_image_dimensions` | `(path: str) → dict` | `{width, height, landscape}` | Reads PNG header bytes without PIL. Returns landscape=True on failure |

**Layout map table:**
```python
{
    ("heading_only", "any"):  "section",
    ("image",  "low"):        "image-right",
    ("image",  "high"):       "center",
    ("code",   "low"):        "default",
    ("code",   "high"):       "center",
    ("table",  "any"):        "default",
    ("list",   "any"):        "default",
    ("prose",  "low"):        "default",
    ("prose",  "high"):       "two-cols",
}
```

**Seconds per layout:**
```python
{"section": 30, "cover": 20, "image-right": 60, "center": 90, "two-cols": 75, "default": 60}
```

---

## tools/code_tools.py — 4 functions

Used exclusively by: CodeSlideAgent

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `count_lines` | `(code: str) → int` | Line count | `len(code.strip().splitlines())` |
| `detect_language` | `(lang_hint: str) → str` | Normalised language | Alias map: `py→python`, `ts→typescript`, `js→javascript`, `rb→ruby`, `sh→bash`, `yml→yaml` |
| `select_highlight_range` | `(code: str, focus_keywords: list=None) → str` | `"{1,4,7}"` string or `""` | Scans lines for keyword matches, returns Slidev highlight syntax |
| `split_code_block` | `(code: str, language: str) → list` | `[{language, content, line_count}]` | Splits at MAX_LINES_PER_SLIDE=20. Returns single-item list if short enough |
