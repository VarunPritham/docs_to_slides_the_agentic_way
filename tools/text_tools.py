import re


def strip_imports(content: str) -> str:
    return re.sub(r"^import\s+.*?;?\s*$", "", content, flags=re.MULTILINE)


def strip_jsx_components(content: str) -> str:
    # Remove JSX opening/closing tags and self-closing tags
    content = re.sub(r"<[A-Z][a-zA-Z]*[^>]*?>.*?</[A-Z][a-zA-Z]*>", "", content, flags=re.DOTALL)
    content = re.sub(r"<[A-Z][a-zA-Z]*[^>]*/?>", "", content)
    return content


def convert_admonitions(content: str) -> str:
    """:::note/tip/warning/danger/info → plain blockquote with label."""
    def replace(m):
        kind = m.group(1).strip().upper()
        body = m.group(2).strip()
        return f"> **{kind}:** {body}"
    return re.sub(r":::([\w\s]*)\n(.*?):::", replace, content, flags=re.DOTALL)


def strip_html_tags(content: str) -> str:
    return re.sub(r"<[^>]+>", "", content)


def extract_headings(content: str) -> list:
    headings = []
    for i, line in enumerate(content.splitlines()):
        m = re.match(r"^(#{1,3})\s+(.+)", line)
        if m:
            headings.append({
                "level": len(m.group(1)),
                "text": m.group(2).strip(),
                "position": i,
            })
    return headings


def extract_code_blocks(content: str) -> list:
    blocks = []
    for m in re.finditer(r"```(\w*)\n(.*?)```", content, re.DOTALL):
        lang = m.group(1) or "text"
        code = m.group(2)
        blocks.append({
            "language": lang,
            "content": code,
            "line_count": len(code.splitlines()),
        })
    return blocks


def extract_lists(content: str) -> list:
    lists = []
    current = []
    for line in content.splitlines():
        if re.match(r"^(\s*[-*+]|\s*\d+\.)\s+", line):
            current.append(line)
        else:
            if current:
                lists.append("\n".join(current))
                current = []
    if current:
        lists.append("\n".join(current))
    return lists


def extract_tables(content: str) -> list:
    tables = []
    current = []
    for line in content.splitlines():
        if "|" in line:
            current.append(line)
        else:
            if len(current) >= 2:
                tables.append("\n".join(current))
            current = []
    if len(current) >= 2:
        tables.append("\n".join(current))
    return tables


def extract_prose(content: str) -> list:
    """Extract non-heading, non-code, non-list paragraphs."""
    clean = re.sub(r"```.*?```", "", content, flags=re.DOTALL)
    clean = re.sub(r"^#{1,6}\s.*$", "", clean, flags=re.MULTILINE)
    clean = re.sub(r"^(\s*[-*+]|\s*\d+\.)\s+.*$", "", clean, flags=re.MULTILINE)
    clean = re.sub(r"^\|.*\|.*$", "", clean, flags=re.MULTILINE)
    paragraphs = [p.strip() for p in re.split(r"\n{2,}", clean) if p.strip()]
    return paragraphs


def count_words(text: str) -> int:
    return len(text.split())


def build_heading_tree(headings: list) -> list:
    """Build flat list of headings with children indices for chunking."""
    tree = []
    for i, h in enumerate(headings):
        node = dict(h)
        node["index"] = i
        node["children"] = [
            j for j, other in enumerate(headings)
            if j > i and other["level"] > h["level"]
            and (i + 1 >= len(headings) or headings[i + 1]["level"] <= h["level"] or j < next(
                (k for k in range(i + 1, len(headings)) if headings[k]["level"] <= h["level"]),
                len(headings)
            ))
        ]
        tree.append(node)
    return tree


def split_by_heading(content: str, headings: list) -> list:
    """Split content into sections using heading positions."""
    lines = content.splitlines()
    sections = []
    positions = [h["position"] for h in headings] + [len(lines)]

    for i, h in enumerate(headings):
        start = h["position"] + 1
        end = positions[i + 1]
        body = "\n".join(lines[start:end]).strip()
        sections.append({
            "heading": h["text"],
            "heading_level": h["level"],
            "body": body,
        })
    return sections


def convert_to_bullets(text: str, max_items: int = 5) -> str:
    """Convert prose sentences to bullet points."""
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    bullets = [f"- {s.strip()}" for s in sentences[:max_items] if s.strip()]
    return "\n".join(bullets)
