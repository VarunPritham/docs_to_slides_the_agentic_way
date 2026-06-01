"""
Content Layer — Agent Router phase.
ContentTypeClassifier labels each chunk; router dispatches accordingly.
"""

import uuid
from state import PipelineState
from tools.text_tools import (
    build_heading_tree, split_by_heading,
    count_words, convert_to_bullets,
)
from llm import get_llm, USE_LLM


# ── Helpers ───────────────────────────────────────────────────────────────────

def _chunk_id() -> str:
    return str(uuid.uuid4())[:8]


def _mock_classify(chunk: dict) -> str:
    body = chunk["body"].lower()
    if chunk["code_blocks"]:
        return "code"
    if any(att["file_type"] == "image" for att in chunk.get("attachments", [])):
        return "image"
    if not chunk["body"].strip():
        return "heading_only"
    if "| " in body or " |" in body:
        return "table"
    if body.strip().startswith(("-", "*", "1.")):
        return "list"
    return "prose"


def _mock_condense(text: str) -> str:
    return convert_to_bullets(text, max_items=5)


def _mock_notes(heading: str, body: str) -> str:
    return f"Detailed explanation of {heading}. {body[:200]}..."


# ── Agents ────────────────────────────────────────────────────────────────────

def content_chunker(state: PipelineState) -> dict:
    """Break cleaned content into slide-sized chunks at heading boundaries."""
    content  = state["cleaned_content"]
    headings = state.get("headings", [])
    att_list = state.get("attachments", [])
    cb_list  = state.get("code_blocks", [])

    if not headings:
        # No headings — one big chunk
        return {"chunks": [{
            "chunk_id":     _chunk_id(),
            "heading":      state["file_metadata"].get("filename", "Document"),
            "heading_level": 1,
            "body":         content,
            "code_blocks":  cb_list,
            "attachments":  att_list,
            "word_count":   count_words(content),
            "chunk_type":   "",
        }]}

    sections = split_by_heading(content, headings)
    # Build heading tree for level-aware splitting
    tree = build_heading_tree(headings)

    chunks = []
    import re
    for i, section in enumerate(sections):
        body   = section["body"]
        # Associate code blocks by presence in body
        cbs    = [cb for cb in cb_list if cb["content"] in body]
        # Associate attachments by checking if ref appears in body
        atts   = [a for a in att_list if a["original_ref"] in body]

        chunks.append({
            "chunk_id":      _chunk_id(),
            "heading":       section["heading"],
            "heading_level": section["heading_level"],
            "body":          body,
            "code_blocks":   cbs,
            "attachments":   atts,
            "word_count":    count_words(body),
            "chunk_type":    "",  # filled by ContentTypeClassifier
        })
    return {"chunks": chunks}


def content_type_classifier(state: PipelineState) -> dict:
    """Label each chunk with its type — routes the Agent Router downstream."""
    chunks = state.get("chunks", [])

    if USE_LLM:
        llm = get_llm()
        classified = []
        for chunk in chunks:
            prompt = (
                f"Classify this slide chunk into exactly one type: "
                f"prose | code | image | table | list | heading_only\n\n"
                f"Heading: {chunk['heading']}\n"
                f"Body (first 300 chars): {chunk['body'][:300]}\n"
                f"Has code blocks: {bool(chunk['code_blocks'])}\n"
                f"Has image attachments: {any(a['file_type']=='image' for a in chunk['attachments'])}\n\n"
                f"Reply with only the type word."
            )
            result = llm.invoke(prompt)
            ctype = result.content.strip().lower()
            if ctype not in {"prose", "code", "image", "table", "list", "heading_only"}:
                ctype = _mock_classify(chunk)
            classified.append(dict(chunk, chunk_type=ctype))
        return {"chunks": classified}

    return {"chunks": [dict(c, chunk_type=_mock_classify(c)) for c in chunks]}


def prose_condenser(state: PipelineState) -> dict:
    """Condense long prose chunks to slide-friendly bullets. Body > 80 words."""
    chunks = state.get("chunks", [])
    updated = []

    for chunk in chunks:
        if chunk["chunk_type"] != "prose" or chunk["word_count"] <= 80:
            updated.append(chunk)
            continue

        if USE_LLM:
            llm = get_llm()
            prompt = (
                f"Convert this documentation text into 3-5 concise bullet points "
                f"suitable for a presentation slide. Each bullet max 12 words.\n\n"
                f"{chunk['body']}"
            )
            result = llm.invoke(prompt)
            condensed = result.content.strip()
        else:
            condensed = _mock_condense(chunk["body"])

        updated.append(dict(chunk, body=condensed, word_count=count_words(condensed)))

    return {"chunks": updated}


def speaker_notes_writer(state: PipelineState) -> dict:
    """Generate speaker notes for each chunk from its original body."""
    chunks = state.get("chunks", [])

    if USE_LLM:
        llm = get_llm()
        noted = []
        for chunk in chunks:
            prompt = (
                f"Write concise presenter speaker notes (3-5 sentences) for a slide titled "
                f"'{chunk['heading']}'. Use the full content below as context.\n\n"
                f"{chunk['body'][:600]}"
            )
            result = llm.invoke(prompt)
            noted.append(dict(chunk, speaker_notes=result.content.strip()))
        return {"chunks": noted}

    return {"chunks": [
        dict(c, speaker_notes=_mock_notes(c["heading"], c["body"]))
        for c in chunks
    ]}
