Add a new MDX documentation page to the Docusaurus site so it can be converted to slides.

Usage: /add-doc <doc-name> [--title "My Title"]

Steps:
1. Create `docs-site/docs/<doc-name>.mdx` with:
   - A frontmatter block: `---\nid: <doc-name>\ntitle: <title>\n---`
   - A placeholder H1 heading
   - A short intro paragraph
   - At least one H2 section
2. Add the doc to `docs-site/docs/docs.json` (or `sidebars.js` if that's the sidebar config used) so it appears in the Docusaurus nav.
3. Print the path of the created file.
4. Tell the user to open http://localhost:3000 to see the new doc, then click "▶ Generate Slides" at the bottom of the page.

If `docs-site/` does not exist, tell the user to run `/check-setup` first.
