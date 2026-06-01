from typing import TypedDict, Optional


class Attachment(TypedDict):
    original_ref: str
    resolved_path: str
    file_type: str          # image | pdf | code_file | unknown
    embedded_path: str      # path in output dir after copy
    broken: bool


class CodeBlock(TypedDict):
    language: str
    content: str
    line_count: int


class Chunk(TypedDict):
    chunk_id: str
    heading: str
    heading_level: int      # 1 | 2 | 3
    body: str
    code_blocks: list       # list[CodeBlock]
    attachments: list       # list[Attachment] relevant to this chunk
    word_count: int
    chunk_type: str         # prose | code | image | table | list | heading_only


class Slide(TypedDict):
    slide_id: str
    layout: str             # Slidev layout name
    content: str            # slide markdown body
    notes: str              # speaker notes
    transition: str
    estimated_seconds: int


class PipelineState(TypedDict):
    # ── Input ──────────────────────────────────────────────
    source_path: str
    output_dir: str

    # ── Extraction (Blackboard facts) ──────────────────────
    raw_content: str
    base_directory: str
    file_metadata: dict
    cleaned_content: str
    headings: list          # list[dict] {level, text, position}
    code_blocks: list       # list[CodeBlock]
    prose_sections: list    # list[str]
    lists: list             # list[str]
    tables: list            # list[str]
    attachments: list       # list[Attachment]

    # ── Content ────────────────────────────────────────────
    chunks: list            # list[Chunk]

    # ── Design ─────────────────────────────────────────────
    slides: list            # list[Slide]
    pacing_report: dict

    # ── Assembly ───────────────────────────────────────────
    frontmatter: str
    summary_slide: str
    output_path: str
    validation_errors: list

    # ── Meta ───────────────────────────────────────────────
    errors: list
