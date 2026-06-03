# Agent: CodeSnippetLibrary Layout

Reproduce or modify the **CodeSnippetLibrary** component — a searchable, tagged code pattern gallery.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (exported as `CodeSnippetLibrary`)
- CSS: `docs-site/src/components/PageLayouts/wave-styles.module.css`
- Demo: `docs-site/docs/templates/code-snippets-platform.mdx`

## What It Renders
- Header: section label + search input (title/description/language) + result count
- Tag filter chips: all unique tags from all snippets, toggleable (OR logic)
- Snippet cards:
  - Title + language badge + description
  - Tag chips
  - "When to use" — collapsible section
  - Dark code block + copy button (shows "✓ Copied" for 2s then resets)
  - Optional footer: @author + date added
- Empty state if no snippets match

## TypeScript Interface
```typescript
interface Snippet {
  id: string;
  title: string;
  description: string;
  language: string;        // "python", "typescript", "bash"
  tags: string[];          // ["async", "langgraph", "state"]
  whenToUse: string;
  code: string;
  author?: string;         // "alice"
  addedDate?: string;      // "2026-06-02"
}

interface CodeSnippetLibraryProps {
  snippets: Snippet[];
}
```

## State
```typescript
const [search, setSearch] = useState('');
const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
const [copied, setCopied] = useState<string | null>(null);           // snippet id
const [expandedWtu, setExpandedWtu] = useState<Set<string>>(new Set());  // "when to use"
```

## Tag Extraction
```typescript
const allTags = [...new Set(snippets.flatMap(s => s.tags))].sort();
```

## Filter Logic
```typescript
const filtered = snippets.filter(s => {
  const q = search.toLowerCase();
  const matchesSearch = !q ||
    s.title.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.language.toLowerCase().includes(q);
  const matchesTags = activeTags.size === 0 ||
    [...activeTags].some(t => s.tags.includes(t));  // OR logic
  return matchesSearch && matchesTags;
});
```

## Tag Toggle Logic
```typescript
const toggleTag = (tag: string) => {
  setActiveTags(prev => {
    const next = new Set(prev);
    next.has(tag) ? next.delete(tag) : next.add(tag);
    return next;
  });
};
```

## Copy Handler (2-second flash)
```typescript
const handleCopy = (id: string, code: string) => {
  navigator.clipboard.writeText(code);
  setCopied(id);
  setTimeout(() => setCopied(null), 2000);
};
```

## Key CSS Classes
```css
.cslContainer   { border:1px solid var(--border-color); border-radius:14px; overflow:hidden; margin:1.25rem 0; }
.cslHeader      { padding:1.25rem 1.5rem; background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.cslSearch      { width:100%; padding:7px 12px; border-radius:8px; font-size:0.85rem; margin-top:0.75rem;
                  border:1px solid var(--border-color); background:var(--ifm-background-color); color:var(--ifm-font-color-base); }
.cslCount       { font-size:0.78rem; color:var(--text-muted); margin-top:0.4rem; }
.cslTagChips    { display:flex; flex-wrap:wrap; gap:0.4rem; padding:0.75rem 1.5rem;
                  border-bottom:1px solid var(--border-color); background:var(--surface-1); }
.cslTagChip     { font-size:0.72rem; padding:3px 10px; border-radius:100px; border:1px solid var(--border-color);
                  background:var(--surface-1); cursor:pointer; }
.cslTagChipActive { background:var(--ifm-color-primary,#003087); color:#fff; border-color:var(--ifm-color-primary); }
.cslGrid        { display:flex; flex-direction:column; gap:1rem; padding:1.25rem 1.5rem; }
.cslCard        { border:1px solid var(--border-color); border-radius:14px; overflow:hidden; }
.cslCardHeader  { display:flex; justify-content:space-between; align-items:flex-start; padding:1rem 1.25rem 0.75rem; }
.cslCardTitle   { font-size:0.97rem; font-weight:700; margin:0 0 0.25rem; }
.cslCardDesc    { font-size:0.83rem; color:var(--text-muted); margin:0; line-height:1.5; }
.cslLangBadge   { font-size:0.72rem; font-weight:600; padding:3px 8px; border-radius:6px;
                  background:var(--brand-blue-light); color:var(--brand-navy); white-space:nowrap; }
.cslTags        { display:flex; flex-wrap:wrap; gap:0.35rem; padding:0 1.25rem 0.75rem; }
.cslTag         { font-size:0.72rem; background:var(--surface-2); border:1px solid var(--border-color);
                  border-radius:100px; padding:2px 8px; color:var(--text-muted); }
.cslWhenToUse   { padding:0 1.25rem 0.75rem; }
.cslWtuToggle   { background:none; border:none; font-size:0.82rem; font-weight:600;
                  color:var(--ifm-color-primary); cursor:pointer; padding:0; }
.cslWtuText     { font-size:0.84rem; color:var(--text-muted); margin:0.4rem 0 0; line-height:1.6; }
.cslCodeWrapper { position:relative; }
.codeBlock      { background:#0f172a; padding:1.25rem; overflow-x:auto; }  /* ALWAYS dark */
.codeBlock pre  { color:#e2e8f0; font-size:0.82rem; margin:0; white-space:pre; }
.cslCopyBtn     { position:absolute; top:0.5rem; right:0.75rem; font-size:0.75rem; font-weight:600;
                  padding:4px 10px; border-radius:6px; border:1px solid #334155;
                  background:#1e293b; color:#94a3b8; cursor:pointer; transition:background 0.15s; }
.cslCopyBtn:hover     { background:#334155; color:#e2e8f0; }
.cslCopyBtnCopied     { background:#166534 !important; color:#bbf7d0 !important; border-color:#166534 !important; }
.cslFooter      { display:flex; justify-content:space-between; padding:0.5rem 1.25rem;
                  font-size:0.75rem; color:var(--text-muted); background:var(--surface-1);
                  border-top:1px solid var(--border-color); }
.cslEmpty       { text-align:center; padding:2rem; color:var(--text-muted); font-size:0.85rem; }
```

## Reproduction Steps
1. Define `Snippet` and `CodeSnippetLibraryProps`
2. Extract `allTags` from snippets
3. 4× `useState` for search/activeTags/copied/expandedWtu
4. Apply filter logic
5. Render header: search + result count
6. Render tag chips with active/inactive state
7. Render snippet cards:
   - `cslCardHeader`: title, lang badge, description
   - Tags row
   - When-to-use toggle (button clicks `setExpandedWtu`)
   - Code wrapper + copy button (`cslCopyBtnCopied` class when `copied === s.id`)
   - Optional footer
8. Code block is always dark (`#0f172a`)
9. Empty state if `filtered.length === 0`

## MDX Usage
```mdx
import { CodeSnippetLibrary } from '@site/src/components/PageLayouts/wave6';

<CodeSnippetLibrary snippets={[
  {
    id: "langgraph-state",
    title: "LangGraph state node",
    description: "Minimal agent that reads from and writes to PipelineState",
    language: "python",
    tags: ["langgraph", "agent", "state", "blackboard"],
    whenToUse: "Use this pattern for any agent that needs to read existing state keys and return a partial update.",
    code: `def my_agent(state: PipelineState) -> dict:
    # Read from shared blackboard
    content = state["cleaned_content"]
    # Process...
    result = do_something(content)
    # Return only the keys this agent owns
    return {"my_output": result}`,
    author: "alice",
    addedDate: "2026-06-02",
  },
  {
    id: "copy-button",
    title: "Copy-to-clipboard with 2s flash",
    description: "React copy button that briefly shows success state",
    language: "typescript",
    tags: ["react", "clipboard", "ux"],
    whenToUse: "Use for any code block or command that users will copy-paste.",
    code: `const [copied, setCopied] = useState(false);
const handleCopy = () => {
  navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};`,
  },
]} />
```

## Validation
- [ ] Search filters across title, description, and language
- [ ] Tag chips toggle correctly (active = navy bg)
- [ ] Multiple active tags use OR logic (snippet shows if it has ANY selected tag)
- [ ] Copy button shows "✓ Copied" for 2 seconds then resets
- [ ] "When to use" toggles open/closed per card independently
- [ ] Code block is always dark regardless of page mode
- [ ] Empty state shows when search + tags match nothing
