"""
FastAPI bridge — exposes the LangGraph pipeline as an HTTP endpoint.

POST /generate  { "doc_path": "/docs/agent-router" }
  → runs pipeline on the corresponding .mdx file
  → starts Slidev dev server if not running
  → returns { "slides_url": "http://localhost:3030", "output_path": "..." }
"""

import os
import subprocess
import signal
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add pipeline to path
sys.path.insert(0, str(Path(__file__).parent))
from main import run as run_pipeline

DOCS_ROOT    = Path(__file__).parent / "docs-site" / "docs"
OUTPUT_DIR   = Path(__file__).parent / "output" / "slides"
SLIDES_PORT  = 3030
SLIDEV_PROC  = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    if SLIDEV_PROC:
        SLIDEV_PROC.terminate()

app = FastAPI(title="Docusaurus → Slidev Generator", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ── Request / Response ────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    doc_path: str   # e.g. "/docs/agent-router"


class GenerateResponse(BaseModel):
    slides_url:  str
    output_path: str
    slide_count: int
    warnings:    list[str]


# ── Helpers ───────────────────────────────────────────────────────────────────

def url_path_to_file(doc_path: str) -> Path:
    """
    Map Docusaurus URL path → .mdx file on disk.
    /docs/agent-router → docs-site/docs/agent-router.mdx
    /docs/patterns/router → docs-site/docs/patterns/router.mdx
    """
    # Strip leading /docs/
    relative = doc_path.lstrip("/")
    if relative.startswith("docs/"):
        relative = relative[len("docs/"):]

    # Try direct .mdx, .md, and index variants
    for suffix in [".mdx", ".md", "/index.mdx", "/index.md"]:
        candidate = DOCS_ROOT / (relative + suffix)
        if candidate.exists():
            return candidate

    raise FileNotFoundError(
        f"No MDX file found for path '{doc_path}'. "
        f"Looked in {DOCS_ROOT / relative}{{.mdx,.md}}"
    )


def kill_port(port: int):
    """Kill any process occupying the given port."""
    try:
        result = subprocess.run(
            ["lsof", "-ti", f":{port}"],
            capture_output=True, text=True
        )
        pids = result.stdout.strip().split()
        for pid in pids:
            if pid:
                subprocess.run(["kill", "-9", pid], capture_output=True)
                print(f"[server] Killed PID {pid} on port {port}")
    except Exception as e:
        print(f"[server] Could not kill port {port}: {e}")


def ensure_slidev_running():
    """Kill anything on SLIDES_PORT, then start a fresh Slidev instance."""
    global SLIDEV_PROC
    import socket, time

    # Always kill whatever is on the port and start fresh
    kill_port(SLIDES_PORT)
    time.sleep(0.5)

    # Terminate our own previous Slidev process if we have one
    if SLIDEV_PROC and SLIDEV_PROC.poll() is None:
        SLIDEV_PROC.terminate()
        SLIDEV_PROC = None

    slides_md = OUTPUT_DIR / "slides.md"
    if not slides_md.exists():
        slides_md.parent.mkdir(parents=True, exist_ok=True)
        slides_md.write_text("---\n---\n\n# Loading...\n")

    SLIDEV_PROC = subprocess.Popen(
        ["npx", "slidev", str(slides_md), "--port", str(SLIDES_PORT), "--open", "false"],
        cwd=str(OUTPUT_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    # Wait up to 15s for Slidev to bind
    for _ in range(30):
        time.sleep(0.5)
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("localhost", SLIDES_PORT)) == 0:
                return
    print("[server] Warning: Slidev may not have started yet")


# ── Endpoint ──────────────────────────────────────────────────────────────────

@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    print(f"\n{'='*55}")
    print(f"[/generate] doc_path = {req.doc_path}")

    # 1. Resolve MDX file
    try:
        mdx_path = url_path_to_file(req.doc_path)
        print(f"[1/5] Resolved file → {mdx_path}")
    except FileNotFoundError as e:
        print(f"[1/5] ERROR: {e}")
        raise HTTPException(status_code=404, detail=str(e))

    # 2. Run the LangGraph pipeline
    print(f"[2/5] Running pipeline...")
    try:
        output_path = run_pipeline(
            source_path=str(mdx_path),
            output_dir=str(OUTPUT_DIR),
        )
        print(f"[2/5] Pipeline done → {output_path}")
    except Exception as e:
        print(f"[2/5] ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Pipeline error: {e}")

    # 3. Copy output to slides.md so the running Slidev picks it up
    import time
    generated = Path(output_path)
    if generated.exists():
        target = OUTPUT_DIR / "slides.md"
        content = generated.read_text(encoding="utf-8")
        # Append timestamp comment — forces Slidev's file watcher to detect the change
        content += f"\n\n<!-- generated: {time.time()} -->\n"
        target.write_text(content, encoding="utf-8")
        print(f"[3/5] Copied to slides.md → Slidev will hot-reload")
    else:
        print(f"[3/5] WARNING: output file not found at {output_path}")

    # 4. Ensure Slidev dev server is running
    import socket
    print(f"[4/5] Checking Slidev on port {SLIDES_PORT}...")
    try:
        ensure_slidev_running()
    except Exception as e:
        print(f"[4/5] Slidev start warning: {e}")
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as _s:
        slidev_up = _s.connect_ex(("localhost", SLIDES_PORT)) == 0
    if slidev_up:
        print(f"[4/5] Slidev is up at http://localhost:{SLIDES_PORT}")
    else:
        print(f"[4/5] Slidev not running — start it manually:")
        print(f"      cd output/slides && npx slidev slides.md --port 3030")

    # 5. Build response
    slides_url  = f"http://localhost:{SLIDES_PORT}"
    slide_count = generated.read_text().count("\n---\n") if generated.exists() else 0
    warnings    = []
    if not generated.exists():
        warnings.append("Output file not found — pipeline may have failed")

    print(f"[5/5] Done — {slide_count} slides, url={slides_url}")
    print(f"{'='*55}\n")

    return GenerateResponse(
        slides_url=slides_url,
        output_path=str(output_path),
        slide_count=slide_count,
        warnings=warnings,
    )


@app.get("/health")
def health():
    return {"status": "ok"}


# ── Startup / Shutdown ────────────────────────────────────────────────────────



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
