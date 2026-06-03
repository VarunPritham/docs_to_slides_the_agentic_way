# Agent: ArchitectureDiagram Layout

Reproduce or modify the **ArchitectureDiagram** component — a Mermaid diagram with metadata and dark mode support.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (exported as `ArchitectureDiagram`)
- CSS: `docs-site/src/components/PageLayouts/wave-styles.module.css`
- Demo: `docs-site/docs/templates/architecture-diagram-pipeline.mdx`

## What It Renders
- Header: section label, title, description, diagram type badge, owner, last updated, optional source link
- Mermaid diagram (renders via `@docusaurus/theme-mermaid`, adapts to light/dark mode)
- Collapsible `<details>` for raw Mermaid source

## TypeScript Interface
```typescript
type DiagramType = 'flowchart' | 'sequence' | 'er' | 'class' | 'gantt' | 'mindmap';

interface ArchitectureDiagramProps {
  title: string;
  description: string;
  diagramType: DiagramType;
  owner: string;
  lastUpdated: string;
  sourceFile?: string;    // "docs/architecture.mmd"
  repoUrl?: string;
  mermaid: string;        // full Mermaid diagram source string
}
```

## State
```typescript
const [showSource, setShowSource] = useState(false);
```

## Mermaid Import (CRITICAL)
```typescript
// @ts-ignore — provided at runtime by @docusaurus/theme-mermaid
import Mermaid from '@theme/Mermaid';
```
Use `<Mermaid value={mermaid} />` — NOT `<div className="mermaid">`. The class-based approach won't trigger Docusaurus Mermaid rendering.

## Required Config in docusaurus.config.ts
```typescript
// 1. Add to themes array:
themes: ['@docusaurus/theme-mermaid', ...],

// 2. Add top-level markdown config:
markdown: { mermaid: true },

// 3. Add to themeConfig:
mermaid: {
  theme: { light: 'neutral', dark: 'dark' },
},
```

## Dark Mode CSS (CRITICAL — add to src/css/custom.css)
```css
/* Mermaid SVG transparent bg in dark mode */
[data-theme='dark'] .docusaurus-mermaid-container svg,
[data-theme='dark'] [class*='adDiagramWrapper'] svg {
  background: transparent !important;
}
[data-theme='dark'] .docusaurus-mermaid-container rect.background,
[data-theme='dark'] [class*='adDiagramWrapper'] rect.background {
  fill: transparent !important;
}
```

## Key CSS Classes
```css
.adContainer      { border:1px solid var(--border-color); border-radius:14px; overflow:hidden; margin:1.5rem 0; }
.adHeader         { padding:1.25rem 1.5rem; background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.adTitle          { font-size:1.1rem; font-weight:800; margin:0.25rem 0; }
.adDesc           { font-size:0.83rem; color:var(--text-muted); margin:0; }
.adMeta           { display:flex; flex-wrap:wrap; gap:0.5rem 1.25rem; margin-top:0.75rem; font-size:0.78rem; color:var(--text-muted); }
.adTypeBadge      { font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:6px; background:var(--brand-blue-light); color:var(--brand-navy); }
.adDiagramWrapper { padding:1.5rem; background:transparent; border-bottom:1px solid var(--border-color); }
/* transparent bg is critical — 'white' creates white box on dark pages */
.adDetails        { padding:0; }
.adDetailsSummary { padding:0.75rem 1.5rem; font-size:0.83rem; font-weight:600;
                    color:var(--text-muted); cursor:pointer; background:var(--surface-1);
                    border-bottom:1px solid var(--border-color); list-style:none; display:flex; align-items:center; gap:0.4rem; }
.adSourceBlock    { padding:1rem 1.5rem; background:var(--surface-1); }
.adSourcePre      { font-family:monospace; font-size:0.8rem; color:var(--text-muted); white-space:pre-wrap; margin:0; }
```

## Reproduction Steps
1. Install `@docusaurus/theme-mermaid`: `cd docs-site && npm install @docusaurus/theme-mermaid`
2. Update `docusaurus.config.ts`:
   - Add `'@docusaurus/theme-mermaid'` to `themes[]`
   - Add `markdown: { mermaid: true }`
   - Add `mermaid: { theme: { light: 'neutral', dark: 'dark' } }` to `themeConfig`
3. Add dark mode CSS overrides to `src/css/custom.css`
4. In `wave6.tsx`: `// @ts-ignore` import Mermaid from `@theme/Mermaid`
5. Render component with `<Mermaid value={mermaid} />` inside `.adDiagramWrapper`
6. `.adDiagramWrapper` must use `background: transparent` — never `white`
7. Wrap raw source in `<details>/<summary>` with toggle state

## MDX Usage
```mdx
import { ArchitectureDiagram } from '@site/src/components/PageLayouts/wave6';

<ArchitectureDiagram
  title="AI Slide Generation Pipeline"
  description="Four-phase LangGraph pipeline converting MDX to Slidev presentations"
  diagramType="flowchart"
  owner="Platform Team"
  lastUpdated="2026-06-02"
  repoUrl="https://github.com/varunpritham/docusaurus-to-slidev"
  mermaid={`flowchart LR
    A[MDX Page] --> B[POST /generate]
    B --> C{LangGraph Pipeline}
    C --> D[Phase 1: Extraction]
    D --> E[Phase 2: Content]
    E --> F[Phase 3: Design]
    F --> G[Phase 4: Assembly]
    G --> H[slides.md]
    H --> I[Slidev :3030]`}
/>
```

## Validation
- [ ] Diagram renders (not raw text) — requires `@docusaurus/theme-mermaid` + config
- [ ] Light mode: diagram on neutral/light background
- [ ] Dark mode: diagram uses dark theme, NO white box background
- [ ] "View raw source" collapsible shows the Mermaid text
- [ ] Source file link appears in header when `sourceFile` + `repoUrl` provided
