"""
Design Layer — Tool Routing phase.
Each agent has access only to its scoped tools.
"""

from state import PipelineState
from tools.layout_tools import (
    lookup_layout, lookup_transition, check_heading_level,
    check_slide_type, estimate_time_per_slide, count_slides, flag_over_dense,
    get_image_dimensions,
)
from tools.code_tools import (
    count_lines, detect_language, select_highlight_range, split_code_block,
)


# ── Layout Selector ────────────────────────────────────────────────────────────

def layout_selector(state: PipelineState) -> dict:
    """Assign Slidev layout to each chunk. Scoped tools: lookup_layout, get_image_dimensions, count_words."""
    chunks = state.get("chunks", [])
    slides = []

    for chunk in chunks:
        ctype  = chunk.get("chunk_type", "prose")
        wcount = chunk.get("word_count", 0)
        layout = lookup_layout(ctype, wcount)

        # For image chunks — check aspect ratio to decide left/right
        if ctype == "image" and chunk.get("attachments"):
            img_att = next((a for a in chunk["attachments"] if a["file_type"] == "image"), None)
            if img_att and not img_att["broken"]:
                dims = get_image_dimensions(img_att["resolved_path"])
                layout = "image-right" if dims["landscape"] else "center"

        slides.append({
            "slide_id":          chunk["chunk_id"],
            "layout":            layout,
            "content":           _render_content(chunk, layout),
            "notes":             chunk.get("speaker_notes", ""),
            "transition":        "",
            "estimated_seconds": 0,
            "heading_level":     chunk.get("heading_level", 1),
            "chunk_type":        ctype,
        })

    return {"slides": slides}


def _render_content(chunk: dict, layout: str) -> str:
    """Render the slide markdown body from the chunk."""
    heading = chunk["heading"]
    body    = chunk["body"]
    atts    = chunk.get("attachments", [])

    lines = [f"# {heading}", ""]

    if layout == "section":
        return f"# {heading}"

    if chunk["chunk_type"] == "image":
        img = next((a for a in atts if a["file_type"] == "image"), None)
        if img:
            ref = img["embedded_path"] or img["original_ref"]
            lines.append(f"![]({ref})")
            if body:
                lines.append("")
                lines.append(body)
        return "\n".join(lines)

    if chunk["chunk_type"] == "code" and chunk.get("code_blocks"):
        cb   = chunk["code_blocks"][0]
        lang = detect_language(cb["language"])
        lines.append(f"```{lang}")
        lines.append(cb["content"].strip())
        lines.append("```")
        return "\n".join(lines)

    if chunk["chunk_type"] == "pdf":
        att = next((a for a in atts if a["file_type"] == "pdf"), None)
        ref = att["original_ref"] if att else "attachment"
        lines.append(f"> **See attached:** [{ref}]({ref})")
        return "\n".join(lines)

    lines.append(body)
    return "\n".join(lines)


# ── Code Slide Agent ───────────────────────────────────────────────────────────

def code_slide_agent(state: PipelineState) -> dict:
    """
    Refine code slides: split long blocks, add highlight ranges.
    Scoped tools: count_lines, detect_language, select_highlight_range, split_code_block.
    """
    slides  = state.get("slides", [])
    chunks  = state.get("chunks", [])
    chunk_map = {c["chunk_id"]: c for c in chunks}
    updated = []

    for slide in slides:
        if slide["chunk_type"] != "code":
            updated.append(slide)
            continue

        chunk = chunk_map.get(slide["slide_id"])
        if not chunk or not chunk.get("code_blocks"):
            updated.append(slide)
            continue

        cb     = chunk["code_blocks"][0]
        lang   = detect_language(cb["language"])
        n_lines = count_lines(cb["content"])

        if n_lines <= 20:
            # Short enough — add highlight range for key lines
            highlight = select_highlight_range(cb["content"])
            content = f"# {chunk['heading']}\n\n```{lang}{highlight}\n{cb['content'].strip()}\n```"
            updated.append(dict(slide, content=content))
        else:
            # Split into multiple slides
            parts = split_code_block(cb["content"], lang)
            for i, part in enumerate(parts):
                suffix = f" ({i+1}/{len(parts)})" if len(parts) > 1 else ""
                content = f"# {chunk['heading']}{suffix}\n\n```{lang}\n{part['content'].strip()}\n```"
                new_slide = dict(slide,
                    slide_id=f"{slide['slide_id']}-{i}",
                    content=content,
                )
                updated.append(new_slide)

    return {"slides": updated}


# ── Section Break Agent ────────────────────────────────────────────────────────

def section_break_agent(state: PipelineState) -> dict:
    """
    Insert layout:section separator slides before H2 headings.
    Scoped tools: check_heading_level, lookup_layout.
    """
    slides  = state.get("slides", [])
    result  = []

    for slide in slides:
        level = slide.get("heading_level", 3)
        if check_heading_level(level) and level == 2:
            # Extract just the heading text for the section break
            heading = slide["content"].splitlines()[0].lstrip("# ").strip()
            section_slide = {
                "slide_id":          f"section-{slide['slide_id']}",
                "layout":            "section",
                "content":           f"# {heading}",
                "notes":             "",
                "transition":        "slide-up",
                "estimated_seconds": 30,
                "heading_level":     2,
                "chunk_type":        "heading_only",
            }
            result.append(section_slide)
        result.append(slide)

    return {"slides": result}


# ── Transition Agent ───────────────────────────────────────────────────────────

def transition_agent(state: PipelineState) -> dict:
    """
    Assign transition to every slide based on its layout.
    Scoped tools: lookup_transition, check_slide_type.
    """
    slides = state.get("slides", [])
    updated = [
        dict(s, transition=lookup_transition(check_slide_type(s["layout"])))
        for s in slides
    ]
    return {"slides": updated}


# ── Pacing Agent ───────────────────────────────────────────────────────────────

def pacing_agent(state: PipelineState) -> dict:
    """
    Estimate time per slide, flag over-dense slides.
    Scoped tools: count_slides, estimate_time_per_slide, flag_over_dense.
    """
    slides = state.get("slides", [])

    timed = [
        dict(s, estimated_seconds=estimate_time_per_slide(s["layout"], s.get("word_count", 40)))
        for s in slides
    ]

    report = flag_over_dense(timed)
    report["slide_count"] = count_slides(timed)

    return {"slides": timed, "pacing_report": report}
