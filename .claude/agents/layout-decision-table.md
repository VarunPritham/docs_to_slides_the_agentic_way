# Agent: DecisionTable Layout

Reproduce or modify the **DecisionTable** component — a side-by-side options comparison.

## Location
- Component: `docs-site/src/components/PageLayouts/index.tsx` (exported as `DecisionTable`)
- CSS: `docs-site/src/components/PageLayouts/styles.module.css`
- Demo: `docs-site/docs/templates/adr-001.mdx`

## What It Renders
Column-per-option comparison table:
- Option name header (chosen option gets blue highlight)
- ✅ Pros list (green)
- ❌ Cons list (red)
- Optional "Chosen" banner at bottom of winning column

## TypeScript Interface
```typescript
interface DecisionOption {
  name: string;
  pros: string[];
  cons: string[];
  chosen?: boolean;
}

interface DecisionTableProps {
  options: DecisionOption[];
}
```

## CSS Classes
```css
.decisionTable      { display:grid; gap:1rem; margin:1.25rem 0; }
/* Grid columns = number of options, set via inline style */
.decisionCol        { border:1px solid var(--border-color); border-radius:12px; overflow:hidden; }
.decisionColChosen  { border-color:var(--brand-blue,#00AEEF); box-shadow:0 0 0 2px var(--brand-blue,#00AEEF); }
.decisionColHeader  { padding:0.75rem 1rem; font-weight:700; font-size:0.9rem;
                      background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.decisionColHeaderChosen { background:var(--brand-blue-light,#e0f6fe); color:var(--brand-navy,#003087); }
.decisionPros       { padding:0.75rem 1rem; border-bottom:1px solid var(--border-color); }
.decisionCons       { padding:0.75rem 1rem; }
.decisionListLabel  { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em;
                      color:var(--text-muted); margin-bottom:0.4rem; }
.decisionList       { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.25rem; }
.decisionList li    { font-size:0.83rem; display:flex; gap:6px; align-items:flex-start; }
.chosenBanner       { padding:0.4rem 1rem; background:var(--brand-blue,#00AEEF);
                      color:#fff; font-size:0.75rem; font-weight:700; text-align:center; }
```

## Reproduction Steps
1. Define `DecisionOption` and `DecisionTableProps`
2. Calculate grid column count: `gridTemplateColumns: \`repeat(${options.length}, 1fr)\``
3. For each option: render column card with header (chosen = highlighted), pros list (✅ prefix), cons list (❌ prefix), optional chosen banner
4. Use CSS class modifiers for chosen state — no inline backgrounds on card body

## MDX Usage
```mdx
import { DecisionTable } from '@site/src/components/PageLayouts';

<DecisionTable options={[
  {
    name: "LangGraph",
    pros: ["Built-in state management", "Visual graph debugging", "Parallel node execution"],
    cons: ["New library, smaller community"],
    chosen: true,
  },
  {
    name: "Crew AI",
    pros: ["Simple agent config", "Good documentation"],
    cons: ["Less control over state transitions", "Role-based model forces abstractions"],
  },
  {
    name: "Raw Python",
    pros: ["Full control", "No dependencies"],
    cons: ["Manual state wiring", "No observability built in"],
  },
]} />
```

## Validation
- [ ] Chosen column has blue border + highlighted header
- [ ] Pros show ✅, cons show ❌
- [ ] Works for 2, 3, or 4 options (grid adjusts)
- [ ] Dark mode: headers use CSS vars (no white bg hardcoded)
