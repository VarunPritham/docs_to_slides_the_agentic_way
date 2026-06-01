Run the pipeline with verbose output, printing the state after each agent completes.

Usage: /debug-pipeline [path/to/file.mdx] [--agent <agent-name>]

If `--agent` is given, stop after that agent and print its full output.
If no agent is given, run the full pipeline and print a state summary after every phase.

Steps:
1. Check the file exists. Default to `sample.mdx`.
2. Instrument `main.py` or call agents directly to capture intermediate state.
3. After each phase, print:

**Phase 1 — Extraction:**
- raw_content length (chars)
- cleaned_content length (chars)
- headings count and first 3 headings
- code_blocks count
- attachments count and any broken ones (broken=True)

**Phase 2 — Content:**
- chunks count
- chunk type distribution (e.g. "prose: 4, code: 2, heading_only: 1")
- word counts: min / max / avg per chunk
- number of chunks condensed by prose_condenser

**Phase 3 — Design:**
- slides count (before and after section_break_agent)
- layout distribution (e.g. "default: 5, section: 2, two-cols: 1")
- total estimated duration (seconds)
- over-dense slides (if any)

**Phase 4 — Assembly:**
- output path
- output file size (bytes)
- validation errors (list each, or "none")

If `--agent <name>` was given, print the full raw dict returned by that agent.

Useful agent names to stop at:
- `mdx_cleaner` — check MDX cleaning output
- `content_chunker` — check how the doc was split
- `content_classifier` — check chunk type labels
- `layout_selector` — check layout assignments
- `validator_agent` — check final validation
