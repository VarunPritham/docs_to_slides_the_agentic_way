Scaffold a new docs-as-code layout component in `docs-site/src/components/PageLayouts/wave6.tsx`.

Usage: /add-layout-docs <ComponentName> [--desc "short description"]

This command adds a layout to the **wave6.tsx** wave (CodeWalkthrough, ChangelogPage, EnvironmentReference, ArchitectureDiagram, CodeSnippetLibrary).
For ops/team layouts (RunbookStep, InfoPanel), use `/add-layout`.
For compliance layouts (ChangeRequest, PIR, SDLC gates), use `/add-layout-compliance`.

## Steps

1. **Define TypeScript interfaces** at the top of `wave6.tsx`, before the component:
   - Small item types first, then the main props interface
   - Keep `language` fields as `string` (not a union) for extensibility

2. **Add CSS classes** in `docs-site/src/components/PageLayouts/wave-styles.module.css`:
   - Prefix all classes with the component abbreviation (e.g. `.csl` for CodeSnippetLibrary, `.cw` for CodeWalkthrough)
   - Search inputs: `background: var(--ifm-background-color); color: var(--ifm-font-color-base)`
   - Code blocks are ALWAYS dark: `background: #0f172a` — do NOT add a dark override for code blocks
   - Tag/chip active state: `background: var(--ifm-color-primary,#003087); color: #fff`
   - For any colour-coded badges, add `[data-theme='dark']` overrides

3. **Write the component function** in `wave6.tsx`:
   - Export named: `export function <ComponentName>({ ... }: <ComponentName>Props) { ... }`
   - Derive computed values outside JSX: `const allTags = [...new Set(items.flatMap(i => i.tags))].sort()`
   - Use `Set<string>` state for multi-select: `const [active, setActive] = useState<Set<string>>(new Set())`
   - Copy handler (2-second flash):
     ```tsx
     const [copied, setCopied] = useState<string | null>(null);
     const handleCopy = (id: string, text: string) => {
       navigator.clipboard.writeText(text);
       setCopied(id);
       setTimeout(() => setCopied(null), 2000);
     };
     ```

4. **Special case — ArchitectureDiagram (Mermaid):**
   - Install: `cd docs-site && npm install @docusaurus/theme-mermaid`
   - Add to `docusaurus.config.ts`:
     - `themes: ['@docusaurus/theme-mermaid', ...]`
     - Top-level: `markdown: { mermaid: true }`
     - `themeConfig.mermaid: { theme: { light: 'neutral', dark: 'dark' } }`
   - Import with `// @ts-ignore — provided at runtime`:
     `import Mermaid from '@theme/Mermaid';`
   - Render: `<Mermaid value={mermaid} />` (NOT `<div className="mermaid">`)
   - Wrapper must use `background: transparent` (never white — creates white box in dark mode)
   - Add to `docs-site/src/css/custom.css`:
     ```css
     [data-theme='dark'] .docusaurus-mermaid-container svg { background: transparent !important; }
     [data-theme='dark'] .docusaurus-mermaid-container rect.background { fill: transparent !important; }
     ```

5. **Create the MDX demo page** at `docs-site/docs/templates/<kebab-name>.mdx`:
   ```mdx
   ---
   id: <kebab-name>
   title: <Title>
   ---

   import { MetaBlock } from '@site/src/components/PageLayouts';
   import { <ComponentName> } from '@site/src/components/PageLayouts/wave6';

   <MetaBlock owner="Your Name" team="Platform" status="live" lastUpdated="2026-06-02" />

   # <Title>

   <ComponentName ... />
   ```

6. **Register in the sidebar** — add to `docs-site/sidebars.ts` under `templates`.

7. **Create the agent file** at `.claude/agents/layout-<kebab-name>.md`. Reference structure:
   - `.claude/agents/layout-code-snippet-library.md` (search + tag filter + copy button)
   - `.claude/agents/layout-code-walkthrough.md` (step navigation + prev/next/jump)
   - `.claude/agents/layout-architecture-diagram.md` (Mermaid integration)
   - `.claude/agents/layout-environment-reference.md` (table + secret masking)
   - `.claude/agents/layout-changelog-page.md` (filter chips + grouped items)

## Wave 6 Pattern Reference

**Search + tag filter (CodeSnippetLibrary pattern):**
```tsx
const [search, setSearch] = useState('');
const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
const allTags = [...new Set(items.flatMap(i => i.tags))].sort();
const filtered = items.filter(i => {
  const q = search.toLowerCase();
  const matchesSearch = !q || i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
  const matchesTags = activeTags.size === 0 || [...activeTags].some(t => i.tags.includes(t));
  return matchesSearch && matchesTags;
});
```

**Step navigator (CodeWalkthrough pattern):**
```tsx
const [current, setCurrent] = useState(0);
const stop = stops[current];
// Dots
{stops.map((_, i) => (
  <button key={i} className={`${styles.cwDot}
    ${i < current ? styles.cwDotDone : ''}
    ${i === current ? styles.cwDotActive : ''}`}
    onClick={() => setCurrent(i)} />
))}
// Nav
<button onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>← Previous</button>
<button onClick={() => setCurrent(c => c + 1)} disabled={current === stops.length - 1}>Next →</button>
```

**Collapsible section (toggle pattern):**
```tsx
const [expanded, setExpanded] = useState<Set<string>>(new Set());
const toggle = (id: string) => setExpanded(prev => {
  const next = new Set(prev);
  next.has(id) ? next.delete(id) : next.add(id);
  return next;
});
```

## Dark Mode Checklist

- [ ] Wrapper backgrounds use CSS vars, not hardcoded hex
- [ ] Search/input fields use `var(--ifm-background-color)` and `var(--ifm-font-color-base)`
- [ ] Code blocks use `background: #0f172a` (dark intentional — no dark override needed)
- [ ] Tag chip active state uses `var(--ifm-color-primary)` + `color: #fff`
- [ ] Any diagram wrapper uses `background: transparent`
- [ ] No inline `style={{ background: '...' }}` on semantic elements
