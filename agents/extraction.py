"""
Extraction Layer — runs as Blackboard phase.
All 5 agents post facts to State before content phase begins.
"""

from state import PipelineState
from tools.file_tools import (
    read_file, get_base_directory, get_file_metadata,
    get_output_directory, copy_file,
)
from tools.text_tools import (
    strip_imports, strip_jsx_components, convert_admonitions, strip_html_tags,
    extract_headings, extract_code_blocks, extract_lists, extract_tables, extract_prose,
)
from tools.attachment_tools import (
    list_attachments_in_text, resolve_relative_path,
    check_path_exists, classify_file_type,
)


def mdx_file_reader(state: PipelineState) -> dict:
    """Read the source MDX file and record base directory + metadata."""
    path = state["source_path"]
    raw = read_file(path)
    base = get_base_directory(path)
    meta = get_file_metadata(path)
    return {
        "raw_content": raw,
        "base_directory": base,
        "file_metadata": meta,
        "errors": state.get("errors", []),
    }


def mdx_cleaner(state: PipelineState) -> dict:
    """Strip MDX-specific syntax — imports, JSX, admonitions, stray HTML."""
    content = state["raw_content"]
    content = strip_imports(content)
    content = strip_jsx_components(content)
    content = convert_admonitions(content)
    content = strip_html_tags(content)
    # Collapse 3+ blank lines → 2
    import re
    content = re.sub(r"\n{3,}", "\n\n", content)
    return {"cleaned_content": content.strip()}


def text_extractor(state: PipelineState) -> dict:
    """Extract structured text elements from cleaned content."""
    content = state["cleaned_content"]
    return {
        "headings":       extract_headings(content),
        "code_blocks":    extract_code_blocks(content),
        "lists":          extract_lists(content),
        "tables":         extract_tables(content),
        "prose_sections": extract_prose(content),
    }


def attachment_resolver(state: PipelineState) -> dict:
    """Find, resolve, and classify all attachment references."""
    content  = state["cleaned_content"]
    base_dir = state["base_directory"]
    refs     = list_attachments_in_text(content)

    attachments = []
    for r in refs:
        resolved = resolve_relative_path(r["ref"], base_dir)
        exists   = check_path_exists(resolved)
        ftype    = classify_file_type(resolved) if exists else "unknown"
        attachments.append({
            "original_ref":  r["ref"],
            "resolved_path": resolved,
            "file_type":     ftype,
            "embedded_path": "",
            "broken":        not exists,
        })
    return {"attachments": attachments}


def attachment_embed_agent(state: PipelineState) -> dict:
    """Copy valid image attachments to the output assets directory."""
    output_dir  = state.get("output_dir", "./output")
    attachments = state.get("attachments", [])
    get_output_directory(output_dir)

    updated = []
    for att in attachments:
        if not att["broken"] and att["file_type"] == "image":
            new_path = copy_file(att["resolved_path"], output_dir)
            att = dict(att, embedded_path=new_path)
        updated.append(att)
    return {"attachments": updated}
