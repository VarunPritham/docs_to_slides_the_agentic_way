import os
import re


IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}
VIDEO_EXTS = {".mp4", ".webm", ".mov"}
CODE_EXTS  = {".py", ".ts", ".js", ".go", ".java", ".rs", ".sh"}


def list_attachments_in_text(content: str) -> list:
    """Find all image and link references in markdown."""
    refs = []
    # ![alt](path)
    for m in re.finditer(r"!\[([^\]]*)\]\(([^)]+)\)", content):
        refs.append({"alt": m.group(1), "ref": m.group(2), "kind": "image"})
    # [text](path) — only local paths (no http)
    for m in re.finditer(r"(?<!!)\[([^\]]*)\]\(([^)]+)\)", content):
        ref = m.group(2)
        if not ref.startswith("http"):
            refs.append({"alt": m.group(1), "ref": ref, "kind": "link"})
    return refs


def resolve_relative_path(ref: str, base_directory: str) -> str:
    if ref.startswith("http"):
        return ref
    return os.path.normpath(os.path.join(base_directory, ref))


def check_path_exists(path: str) -> bool:
    if path.startswith("http"):
        return True
    return os.path.exists(path)


def classify_file_type(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    if ext in IMAGE_EXTS:
        return "image"
    if ext == ".pdf":
        return "pdf"
    if ext in VIDEO_EXTS:
        return "video"
    if ext in CODE_EXTS:
        return "code_file"
    return "unknown"


def rewrite_path_to_relative(original: str, embedded_path: str) -> str:
    return embedded_path if embedded_path else original
