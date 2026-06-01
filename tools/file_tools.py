import os
import shutil


def read_file(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def get_base_directory(path: str) -> str:
    return os.path.dirname(os.path.abspath(path))


def get_file_metadata(path: str) -> dict:
    abs_path = os.path.abspath(path)
    stat = os.stat(abs_path)
    return {
        "filename": os.path.basename(abs_path),
        "size_bytes": stat.st_size,
        "abs_path": abs_path,
    }


def get_output_directory(output_dir: str) -> str:
    os.makedirs(output_dir, exist_ok=True)
    assets_dir = os.path.join(output_dir, "assets")
    os.makedirs(assets_dir, exist_ok=True)
    return output_dir


def copy_file(src: str, output_dir: str) -> str:
    """Copy attachment to output/assets/. Returns new relative path."""
    if not src or not os.path.exists(src):
        return ""
    assets_dir = os.path.join(output_dir, "assets")
    os.makedirs(assets_dir, exist_ok=True)
    dest = os.path.join(assets_dir, os.path.basename(src))
    shutil.copy2(src, dest)
    return f"./assets/{os.path.basename(src)}"


def write_file(path: str, content: str) -> str:
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return path
