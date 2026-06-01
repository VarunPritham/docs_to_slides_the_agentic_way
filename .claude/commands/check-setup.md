Verify that all dependencies and services are correctly installed and configured.

Usage: /check-setup

Run all of these checks and print a ✓ or ✗ for each:

**Python environment:**
- [ ] Python 3.10+ is available: `python --version`
- [ ] Virtual env active (`.venv/` exists): check `sys.prefix`
- [ ] Required packages installed: `pip show langgraph langchain-anthropic fastapi uvicorn anthropic`

**Environment variables:**
- [ ] `ANTHROPIC_API_KEY` is set (don't print the value, just whether it's set)
- [ ] `LLM_PROVIDER` — print current value or "(default: anthropic)"

**Node / npm:**
- [ ] Node.js available: `node --version`
- [ ] npm available: `npm --version`
- [ ] npx available: `npx --version`
- [ ] Docusaurus deps installed: `docs-site/node_modules` exists
- [ ] Slidev deps installed: `output/slides/node_modules` exists

**Ports (check with lsof):**
- [ ] Port 3000 (Docusaurus): print "running" or "not running"
- [ ] Port 3030 (Slidev): print "running" or "not running"
- [ ] Port 8000 (FastAPI): print "running" or "not running"

**Project files:**
- [ ] `state.py` exists
- [ ] `llm.py` exists
- [ ] `graph.py` exists
- [ ] `agents/extraction.py`, `content.py`, `design.py`, `assembly.py` all exist
- [ ] `tools/` has 5 files: file_tools, text_tools, attachment_tools, layout_tools, code_tools
- [ ] `sample.mdx` exists

At the end, print a summary: "X/Y checks passed" and list any failures with a one-line fix hint.
