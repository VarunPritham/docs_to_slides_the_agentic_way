# Agent: CodeWalkthrough Layout

Reproduce or modify the **CodeWalkthrough** component — a guided annotated code tour for KT sessions.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (exported as `CodeWalkthrough`)
- CSS: `docs-site/src/components/PageLayouts/wave-styles.module.css`
- Demo: `docs-site/docs/templates/code-walkthrough-pipeline.mdx`

## What It Renders
- Header: section label + title + ⏱ estimated minutes + progress ("Stop N of M")
- Clickable progress dots (one per stop, filled up to current)
- Stop card:
  - "Stop N of M" label
  - Stop title
  - `FileBreadcrumb` — `path/to/file.ts : 42–67`
  - "View in repo" button (links to `{repo}/blob/main/{file}#L{lines}`)
  - Dark code block with language label
  - Explanation text
  - Optional "Why it matters" box (sky blue left border)
  - Optional related stops as clickable chips
- Navigation: ← Previous / Next → buttons (disabled at bounds)
- Jump dropdown: `<select>` with all stop titles

## TypeScript Interface
```typescript
interface WalkthroughStop {
  id: string;
  title: string;
  file: string;              // "agents/content.py"
  lines?: string;            // "42–67"
  language: string;          // "python"
  code: string;
  explanation: string;
  whyItMatters?: string;
  relatedStops?: string[];   // stop IDs to link to
}

interface CodeWalkthroughProps {
  title: string;
  repo: string;              // "<YOUR_REPO_URL>"
  estimatedMinutes: number;
  stops: WalkthroughStop[];
}
```

## State
```typescript
const [currentStop, setCurrentStop] = useState(0);
const stop = stops[currentStop];
```

## Key CSS Classes
```css
.cwHeader         { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; padding:1.25rem 1.5rem; }
.cwProgress       { display:flex; gap:6px; padding:0 1.5rem 0.75rem; }
.cwDot            { width:10px; height:10px; border-radius:50%; background:var(--border-color); cursor:pointer; border:none; flex-shrink:0; }
.cwDotActive      { background:var(--brand-navy,#003087); }
.cwDotDone        { background:var(--brand-blue,#00AEEF); }
.cwCard           { border:1px solid var(--border-color); border-radius:14px; overflow:hidden; margin:0 1.5rem; }
.cwCardHeader     { display:flex; align-items:center; justify-content:space-between; padding:0.875rem 1.25rem;
                    background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.cwStopLabel      { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted); }
.cwStopTitle      { font-weight:700; font-size:1rem; }
.fileBreadcrumb   { font-family:monospace; font-size:0.78rem; background:var(--surface-2); padding:2px 8px; border-radius:6px; }
.codeBlock        { background:#0f172a; padding:1.25rem; overflow-x:auto; }  /* ALWAYS dark */
.codeBlock pre    { color:#e2e8f0; font-family:'JetBrains Mono',monospace; font-size:0.82rem; margin:0; white-space:pre; }
.cwExplanation    { padding:1rem 1.25rem; font-size:0.875rem; line-height:1.7; }
.cwWhyBox         { margin:0.75rem 1.25rem; padding:0.875rem 1rem; border-left:3px solid var(--brand-blue,#00AEEF);
                    background:var(--brand-blue-light,#e0f6fe); border-radius:0 8px 8px 0; font-size:0.83rem; }
[data-theme='dark'] .cwWhyBox { background:rgba(0,174,239,0.1); }
.cwRelated        { padding:0.5rem 1.25rem 1rem; display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center; }
.cwRelatedChip    { font-size:0.75rem; padding:3px 10px; border-radius:100px; background:var(--surface-2);
                    border:1px solid var(--border-color); cursor:pointer; }
.cwNav            { display:flex; align-items:center; justify-content:space-between; padding:1rem 1.5rem; }
.cwNavBtn         { padding:7px 18px; border:1px solid var(--border-color); border-radius:8px;
                    background:var(--surface-1); font-weight:600; font-size:0.83rem; cursor:pointer; }
.cwNavBtn:disabled { opacity:0.4; cursor:not-allowed; }
.cwJumpSelect     { font-size:0.8rem; padding:6px 10px; border-radius:8px; border:1px solid var(--border-color);
                    background:var(--surface-1); color:var(--ifm-font-color-base); }
```

## Reproduction Steps
1. Import `Mermaid` stub and `styles` from wave-styles
2. Define `WalkthroughStop` and `CodeWalkthroughProps`
3. `useState` for `currentStop` index
4. Render header with title + time estimate + progress counter
5. Progress dots: map `stops.map((_, i) => ...)` — dot is `cwDotDone` if `i < currentStop`, `cwDotActive` if `i === currentStop`, else default
6. Stop card: breadcrumb, repo link, dark code block, explanation, optional whyItMatters, optional related stop chips
7. Related chip click: `const idx = stops.findIndex(s => s.id === relatedId); setCurrentStop(idx)`
8. Navigation buttons: disabled at bounds, jump select `onChange={e => setCurrentStop(Number(e.target.value))}`
9. Code block is ALWAYS dark (`background: #0f172a`) — no dark mode conditional needed

## MDX Usage
```mdx
import { CodeWalkthrough } from '@site/src/components/PageLayouts/wave6';

<CodeWalkthrough
  title="How the pipeline generates slides"
  repo="<YOUR_REPO_URL>"
  estimatedMinutes={12}
  stops={[
    {
      id: "entry",
      title: "1. Pipeline entry point",
      file: "graph.py", lines: "1–30",
      language: "python",
      code: `from langgraph.graph import StateGraph\nfrom state import PipelineState\n\nworkflow = StateGraph(PipelineState)`,
      explanation: "We create a LangGraph StateGraph backed by PipelineState — a TypedDict that acts as the Blackboard.",
      whyItMatters: "All 18 agents read and write the same state object. No agent calls another directly.",
    },
    {
      id: "classifier",
      title: "2. Content type classifier",
      file: "agents/content.py", lines: "45–82",
      language: "python",
      code: `def content_type_classifier(state: PipelineState) -> dict:\n    chunks = state["chunks"]\n    for chunk in chunks:\n        chunk["chunk_type"] = classify(chunk)\n    return {"chunks": chunks}`,
      explanation: "Each chunk gets labelled: prose / code / image / table / list / heading_only. This label drives all downstream routing.",
      relatedStops: ["entry"],
    },
  ]}
/>
```

## Validation
- [ ] Progress dots fill correctly as you navigate
- [ ] Jump dropdown selects the right stop
- [ ] Previous disabled on stop 0, Next disabled on last stop
- [ ] "Why it matters" box shows sky blue border in both modes
- [ ] Code block is dark in both light and dark mode
- [ ] Related stop chips navigate to the correct stop
