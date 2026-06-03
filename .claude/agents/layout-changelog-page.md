# Agent: ChangelogPage Layout

Reproduce or modify the **ChangelogPage** component — a structured, filterable release history.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (exported as `ChangelogPage`)
- CSS: `docs-site/src/components/PageLayouts/wave-styles.module.css`
- Demo: `docs-site/docs/templates/changelog-pipeline.mdx`

## What It Renders
- Header: section label + filter chips (All / Latest & Stable / Breaking changes)
- Release cards (filtered):
  - Version number + status badge + date
  - Optional summary sentence
  - Changes grouped by type: each group has a coloured type badge + list of change items

## TypeScript Interface
```typescript
type ChangeType = 'feat' | 'fix' | 'breaking' | 'deprecated' | 'perf' | 'docs' | 'chore';
type ReleaseStatus = 'latest' | 'stable' | 'deprecated' | 'yanked';

interface ChangeItem {
  type: ChangeType;
  text: string;
  pr?: string;       // "#142"
  author?: string;   // "@alice"
}

interface Release {
  version: string;   // "1.4.0"
  date: string;      // "2026-06-02"
  status: ReleaseStatus;
  summary?: string;
  changes: ChangeItem[];
}

interface ChangelogPageProps {
  repoUrl: string;
  releases: Release[];
}
```

## State
```typescript
const [filter, setFilter] = useState<'all' | 'latest' | 'breaking'>('all');
```

## Filter Logic
```typescript
const filtered = releases.filter(r => {
  if (filter === 'latest') return r.status === 'latest' || r.status === 'stable';
  if (filter === 'breaking') return r.changes.some(c => c.type === 'breaking');
  return true;
});
```

## Change Type Config
```typescript
const changeTypeConfig: Record<ChangeType, { icon: string; label: string; color: string; bg: string }> = {
  feat:       { icon: '✨', label: 'Feature',    color: '#1e40af', bg: '#dbeafe' },
  fix:        { icon: '🐛', label: 'Fix',        color: '#065f46', bg: '#d1fae5' },
  breaking:   { icon: '💥', label: 'Breaking',   color: '#991b1b', bg: '#fee2e2' },
  deprecated: { icon: '⚠️', label: 'Deprecated', color: '#92400e', bg: '#fef3c7' },
  perf:       { icon: '⚡', label: 'Performance', color: '#5b21b6', bg: '#f5f3ff' },
  docs:       { icon: '📝', label: 'Docs',       color: '#0f766e', bg: '#f0fdfa' },
  chore:      { icon: '🔧', label: 'Chore',      color: '#374151', bg: '#f3f4f6' },
};
```

## Release Status Badge Colours
```typescript
const releaseStatusConfig = {
  latest:     { label: '● Latest',     color: '#065f46', bg: '#d1fae5' },
  stable:     { label: '✓ Stable',     color: '#1e40af', bg: '#dbeafe' },
  deprecated: { label: 'Deprecated',  color: '#92400e', bg: '#fef3c7' },
  yanked:     { label: '✕ Yanked',    color: '#991b1b', bg: '#fee2e2' },
};
```

## Key CSS Classes
```css
.clHeader       { padding:1.25rem 1.5rem; border-bottom:1px solid var(--border-color); }
.clFilters      { display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.75rem; }
.clFilterBtn    { padding:5px 14px; border-radius:100px; font-size:0.78rem; font-weight:600;
                  border:1px solid var(--border-color); background:var(--surface-1); cursor:pointer; }
.clFilterActive { background:var(--brand-navy,#003087); color:#fff; border-color:var(--brand-navy); }
.clList         { padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:1.5rem; }
.clCard         { border:1px solid var(--border-color); border-radius:12px; overflow:hidden; }
.clCardHeader   { display:flex; align-items:center; gap:10px; padding:0.875rem 1.25rem;
                  background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.clVersion      { font-size:1rem; font-weight:800; font-family:monospace; }
.clDate         { font-size:0.78rem; color:var(--text-muted); margin-left:auto; }
.clSummary      { font-size:0.83rem; color:var(--text-muted); padding:0.5rem 1.25rem; }
.clChanges      { padding:0.75rem 1.25rem; display:flex; flex-direction:column; gap:0.5rem; }
.clChangeGroup  { display:flex; gap:0.75rem; align-items:flex-start; font-size:0.83rem; }
.clTypeBadge    { font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:6px; white-space:nowrap; flex-shrink:0; }
.clChangeItems  { flex:1; display:flex; flex-direction:column; gap:0.2rem; }
.clChangeItem   { display:flex; gap:0.5rem; align-items:baseline; }
.clPr           { font-size:0.72rem; color:var(--ifm-color-primary); font-family:monospace; }
.clAuthor       { font-size:0.72rem; color:var(--text-muted); }
.clEmpty        { text-align:center; padding:2rem; color:var(--text-muted); font-size:0.85rem; }
```

## Reproduction Steps
1. Define `ChangeType`, `ReleaseStatus`, `ChangeItem`, `Release`, `ChangelogPageProps`
2. `useState` for `filter`
3. Apply filter logic to `releases`
4. Render filter chips (3 buttons, active class on selected)
5. Map filtered releases to cards
6. Group `release.changes` by type: `Object.entries(grouped)` where `grouped` built via reduce
7. Each change type group: type badge + list of change items with optional PR + author
8. Type badge uses inline style (small badge — OK)
9. Empty state if no releases match filter

## MDX Usage
```mdx
import { ChangelogPage } from '@site/src/components/PageLayouts/wave6';

<ChangelogPage
  repoUrl="https://github.com/varunpritham/docusaurus-to-slidev"
  releases={[
    {
      version: "1.4.0",
      date: "2026-06-02",
      status: "latest",
      summary: "Dark mode fixes across all layout components.",
      changes: [
        { type: "fix", text: "InfoPanel backgrounds now use CSS classes instead of inline styles", pr: "#187", author: "@alice" },
        { type: "fix", text: "RunbookStep severity colours respect dark mode", pr: "#188", author: "@alice" },
        { type: "feat", text: "Architecture Diagram uses Mermaid dark theme in dark mode", pr: "#183" },
      ],
    },
    {
      version: "1.3.0",
      date: "2026-05-20",
      status: "stable",
      changes: [
        { type: "feat", text: "Added Wave 6 layouts: CodeWalkthrough, ChangelogPage, EnvironmentReference, ArchitectureDiagram, CodeSnippetLibrary" },
        { type: "breaking", text: "Renamed RunbookPage to RunbookStep for consistency" },
      ],
    },
  ]}
/>
```

## Validation
- [ ] "Latest & Stable" filter hides deprecated/yanked releases
- [ ] "Breaking changes" filter shows only releases with at least one breaking change
- [ ] Change types render in their correct badge colours
- [ ] "All" filter shows everything
- [ ] Empty state shows when filter matches no releases
- [ ] Dark mode: filter buttons + card headers use CSS vars (no white bg)
