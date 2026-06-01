import os

# Slidev layout lookup: (chunk_type, density) → layout
LAYOUT_MAP = {
    ("heading_only", "any"):   "section",
    ("image",        "low"):   "image-right",
    ("image",        "high"):  "center",
    ("code",         "low"):   "default",
    ("code",         "high"):  "center",
    ("table",        "any"):   "default",
    ("list",         "any"):   "default",
    ("prose",        "low"):   "default",
    ("prose",        "high"):  "two-cols",
}

TRANSITION_MAP = {
    "section":     "slide-up",
    "cover":       "fade",
    "image-right": "slide-left",
    "image-left":  "slide-left",
    "center":      "fade-out",
    "two-cols":    "slide-left",
    "default":     "slide-left",
}

THEME_MAP = {
    "default": "seriph",
    "technical": "seriph",
    "minimal": "default",
}

SECONDS_PER_SLIDE = {
    "section":     30,
    "cover":       20,
    "image-right": 60,
    "center":      90,
    "two-cols":    75,
    "default":     60,
}


def lookup_layout(chunk_type: str, word_count: int) -> str:
    density = "high" if word_count > 80 else "low"
    return (
        LAYOUT_MAP.get((chunk_type, density))
        or LAYOUT_MAP.get((chunk_type, "any"))
        or "default"
    )


def lookup_transition(layout: str) -> str:
    return TRANSITION_MAP.get(layout, "slide-left")


def lookup_theme(doc_tags: list = None) -> str:
    if doc_tags and "minimal" in doc_tags:
        return THEME_MAP["minimal"]
    return THEME_MAP["default"]


def check_heading_level(level: int) -> bool:
    return level <= 2


def check_slide_type(layout: str) -> str:
    return layout


def estimate_time_per_slide(layout: str, word_count: int) -> int:
    base = SECONDS_PER_SLIDE.get(layout, 60)
    extra = max(0, (word_count - 50) // 10) * 5
    return base + extra


def count_slides(slides: list) -> int:
    return len(slides)


def flag_over_dense(slides: list, max_seconds: int = 3600) -> dict:
    over_dense = [s["slide_id"] for s in slides if s.get("estimated_seconds", 0) > 120]
    total = sum(s.get("estimated_seconds", 60) for s in slides)
    return {
        "total_estimated_seconds": total,
        "over_dense_slides": over_dense,
        "over_time": total > max_seconds,
    }


def get_image_dimensions(path: str) -> dict:
    """Return aspect ratio hint without PIL dependency."""
    if not os.path.exists(path):
        return {"width": 0, "height": 0, "landscape": True}
    try:
        import struct, zlib
        with open(path, "rb") as f:
            header = f.read(24)
        if header[:8] == b"\x89PNG\r\n\x1a\n":
            w = struct.unpack(">I", header[16:20])[0]
            h = struct.unpack(">I", header[20:24])[0]
            return {"width": w, "height": h, "landscape": w >= h}
    except Exception:
        pass
    return {"width": 0, "height": 0, "landscape": True}
