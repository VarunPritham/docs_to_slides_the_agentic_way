"""
Assembly Layer — produce the final Slidev MD file.
"""

import os
import re
from state import PipelineState
from tools.file_tools import write_file
from tools.layout_tools import lookup_theme
from llm import get_llm, USE_LLM


# ── Frontmatter Generator ──────────────────────────────────────────────────────

def frontmatter_generator(state: PipelineState) -> dict:
    """Build Slidev frontmatter from extracted doc metadata."""
    meta  = state.get("file_metadata", {})
    fname = meta.get("filename", "presentation.mdx")
    title = os.path.splitext(fname)[0].replace("-", " ").replace("_", " ").title()

    tags  = state.get("file_metadata", {}).get("tags", [])
    theme = lookup_theme(tags)

    pacing = state.get("pacing_report", {})
    total_sec = pacing.get("total_estimated_seconds", 0)
    duration_min = max(1, total_sec // 60)

    frontmatter = f"""---
theme: {theme}
title: {title}
info: |
  Generated from {fname}
drawings:
  persist: false
transition: slide-left
highlighter: shiki
colorSchema: auto
duration: {duration_min}min
---"""

    return {"frontmatter": frontmatter}


# ── Summary Slide Agent ────────────────────────────────────────────────────────

def summary_slide_agent(state: PipelineState) -> dict:
    """Generate a closing key-takeaways slide from H2 headings."""
    headings = state.get("headings", [])
    h2s = [h["text"] for h in headings if h["level"] == 2]

    if not h2s:
        return {"summary_slide": ""}

    if USE_LLM:
        llm = get_llm()
        prompt = (
            f"Write 3-5 concise key takeaways for a presentation that covered these topics:\n"
            f"{chr(10).join(f'- {h}' for h in h2s)}\n\n"
            f"Format as bullet points, each under 12 words."
        )
        result = llm.invoke(prompt)
        bullets = result.content.strip()
    else:
        bullets = "\n".join(f"- {h}" for h in h2s[:5])

    summary = f"""---
layout: center
transition: fade
---

# Key Takeaways

{bullets}"""

    return {"summary_slide": summary}


# ── Slide Assembler ────────────────────────────────────────────────────────────

def slide_assembler(state: PipelineState) -> dict:
    """Stitch frontmatter + all slides + summary into the final MD file."""
    output_dir   = state.get("output_dir", "./output")
    frontmatter  = state.get("frontmatter", "---\n---")
    slides       = state.get("slides", [])
    summary      = state.get("summary_slide", "")
    source_path  = state.get("source_path", "doc.mdx")

    parts = [frontmatter]

    # Cover slide — title from frontmatter
    title_match = re.search(r"^title:\s*(.+)$", frontmatter, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else "Presentation"
    fname = state.get("file_metadata", {}).get("filename", "")
    parts.append(f"""
---
layout: cover
---

# {title}
""")

    for slide in slides:
        layout     = slide["layout"]
        content    = _rewrite_paths(slide["content"], state.get("attachments", []))
        notes      = slide.get("notes", "")
        transition = slide.get("transition", "slide-left")

        slide_block = f"\n---\nlayout: {layout}\ntransition: {transition}\n---\n\n{content}\n"
        if notes:
            slide_block += f"\n<!--\n{notes}\n-->\n"
        parts.append(slide_block)

    if summary:
        parts.append(summary)

    final_content = "\n".join(parts)
    output_filename = os.path.splitext(os.path.basename(source_path))[0] + ".md"
    output_path = os.path.join(output_dir, output_filename)
    write_file(output_path, final_content)

    return {"output_path": output_path}


def _rewrite_paths(content: str, attachments: list) -> str:
    """Replace original attachment refs with embedded paths in slide content."""
    for att in attachments:
        if att.get("embedded_path"):
            content = content.replace(att["original_ref"], att["embedded_path"])
    return content


# ── Validator Agent ────────────────────────────────────────────────────────────

def validator_agent(state: PipelineState) -> dict:
    """Check the output MD for broken refs, leftover MDX, invalid frontmatter."""
    output_path = state.get("output_path", "")
    errors = []

    if not output_path or not os.path.exists(output_path):
        return {"validation_errors": ["Output file not found"]}

    with open(output_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Check frontmatter exists
    if not content.startswith("---"):
        errors.append("Missing frontmatter block")

    # Check for leftover JSX/imports
    if re.search(r"^import\s+", content, re.MULTILINE):
        errors.append("Leftover import statements found")
    if re.search(r"<[A-Z][a-zA-Z]+", content):
        errors.append("Possible leftover JSX components found")

    # Check for broken image refs (images that still point to non-existent local paths)
    for m in re.finditer(r"!\[.*?\]\(([^)]+)\)", content):
        ref = m.group(1)
        if ref.startswith("http") or ref.startswith("pathname://"):
            continue
        if not os.path.exists(os.path.join(os.path.dirname(output_path), ref)):
            errors.append(f"Broken image ref: {ref}")

    if errors:
        print(f"[ValidatorAgent] {len(errors)} issue(s) found:")
        for e in errors:
            print(f"  ✗ {e}")
    else:
        print(f"[ValidatorAgent] Output is valid ✓  →  {output_path}")

    return {"validation_errors": errors}
