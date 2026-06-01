import re

MAX_LINES_PER_SLIDE = 20

LANGUAGE_ALIASES = {
    "js": "javascript", "ts": "typescript", "py": "python",
    "rb": "ruby", "sh": "bash", "yml": "yaml",
}


def count_lines(code: str) -> int:
    return len(code.strip().splitlines())


def detect_language(lang_hint: str) -> str:
    return LANGUAGE_ALIASES.get(lang_hint.lower(), lang_hint.lower() or "text")


def select_highlight_range(code: str, focus_keywords: list = None) -> str:
    """Return a Slidev {lines} highlight string for key lines."""
    if not focus_keywords:
        return ""
    lines = code.splitlines()
    highlighted = [
        str(i + 1)
        for i, line in enumerate(lines)
        if any(kw.lower() in line.lower() for kw in focus_keywords)
    ]
    if not highlighted:
        return ""
    return "{" + ",".join(highlighted) + "}"


def split_code_block(code: str, language: str) -> list:
    """Split long code blocks into chunks of MAX_LINES_PER_SLIDE lines each."""
    lines = code.strip().splitlines()
    if len(lines) <= MAX_LINES_PER_SLIDE:
        return [{"language": language, "content": code, "line_count": len(lines)}]

    chunks = []
    for i in range(0, len(lines), MAX_LINES_PER_SLIDE):
        chunk_lines = lines[i: i + MAX_LINES_PER_SLIDE]
        chunks.append({
            "language": language,
            "content": "\n".join(chunk_lines),
            "line_count": len(chunk_lines),
        })
    return chunks
