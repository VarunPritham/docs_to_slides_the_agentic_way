Start the FastAPI pipeline server (server.py) on port 8000.

Usage: /start-server

Steps:
1. Check if port 8000 is already in use: `lsof -ti :8000`
   - If something is running: ask the user whether to kill it and restart, or leave it.
   - If the user confirms: `lsof -ti :8000 | xargs kill -9`
2. Check that `ANTHROPIC_API_KEY` is set in the environment. If not, warn that LLM mode will be unavailable — mock mode will be used.
3. Start the server: `python server.py` (in the project root).
4. Wait up to 5 seconds for port 8000 to open. Check with: `lsof -ti :8000`
5. If up: print "Server is live at http://localhost:8000"
6. If not up after 5s: print the error output and stop.

Note: The server runs in the foreground. Open a separate terminal for the Docusaurus site (`cd docs-site && npm start`).
