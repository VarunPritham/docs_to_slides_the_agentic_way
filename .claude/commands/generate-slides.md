Run the docusaurus-to-slidev pipeline on a given MDX file and open the result.

Usage: /generate-slides [path/to/file.mdx]

If no path is given, use `sample.mdx` in the project root.

Steps:
1. Confirm the file exists. If not, print an error and stop.
2. Check that `ANTHROPIC_API_KEY` is set. If not, warn the user that the pipeline will run in mock mode (no real LLM calls).
3. Run: `python main.py <file> --output-dir ./output/slides`
4. Print the full pipeline output.
5. If validation passed: print the slide count and estimated duration.
6. If validation errors exist: list them clearly.
7. Tell the user: if `server.py` is running, the slides are live at http://localhost:3030. If not, run `python server.py` to start it.
