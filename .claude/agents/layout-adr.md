# Agent: ADR Layout

Reproduce or modify the **ADR** (Architecture Decision Record) component.

## Location
- Component: `docs-site/src/components/PageLayouts/index.tsx` (exported as `ADR`)
- CSS: `docs-site/src/components/PageLayouts/styles.module.css`
- Demo: `docs-site/docs/templates/adr-001.mdx`

## What It Renders
A bordered card with 4 labelled sections:
1. Header: `ADR-{id}` chip + status badge
2. Title (large h2-style)
3. Meta row: 📅 date + 👥 deciders
4. Sections in order: Context → Decision → Alternatives (card grid, conditional) → Consequences

## TypeScript Interface
```typescript
interface ADRProps {
  id: string;        // "001" — rendered as "ADR-001"
  title: string;
  date: string;      // "2026-03-15"
  status: 'proposed' | 'accepted' | 'superseded' | 'deprecated';
  deciders: string[];
  context: ReactNode;
  decision: ReactNode;
  consequences: ReactNode;
  alternatives?: { option: string; reason: string }[];
}
```

## Status Badge Colours
```typescript
const adrStatus = {
  proposed:   { label: 'Proposed',   color: '#1e40af', bg: '#dbeafe' },
  accepted:   { label: 'Accepted',   color: '#065f46', bg: '#d1fae5' },
  superseded: { label: 'Superseded', color: '#6b7280', bg: '#f3f4f6' },
  deprecated: { label: 'Deprecated', color: '#92400e', bg: '#fef3c7' },
};
```
These are small badge inline styles — acceptable for badges (small surface area, text-on-bg is readable in both modes).

## CSS Classes
```css
.adr            { border: 1px solid var(--border-color,#e2e8f0); border-radius:14px; padding:2rem; margin:1.5rem 0; }
.adrHeader      { display:flex; align-items:center; gap:10px; margin-bottom:0.5rem; }
.adrId          { font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;
                  color:var(--text-muted); background:var(--surface-2); border-radius:6px; padding:3px 8px; }
.adrTitle       { font-size:1.375rem; font-weight:800; letter-spacing:-0.02em; margin:0 0 0.5rem; }
.adrMeta        { display:flex; gap:1.25rem; font-size:0.8rem; color:var(--text-muted); margin-bottom:1.5rem; }
.adrSection     { margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid var(--border-color); }
.adrSectionLabel { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;
                   color:var(--ifm-color-primary,#003087); margin-bottom:0.75rem; }
.altGrid        { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:1rem; margin-top:0.75rem; }
.altCard        { border:1px solid var(--border-color); border-radius:10px; padding:1rem; }
.altOption      { font-weight:700; font-size:0.9rem; margin-bottom:0.4rem; }
.altReason      { font-size:0.82rem; color:var(--text-muted); }
```

## Reproduction Steps
1. Read `index.tsx` and `styles.module.css`
2. Add `ADRProps` interface
3. Add `adrStatus` colour map
4. Render component:
   - Outer `.adr` card
   - `.adrHeader` with `.adrId` chip + status badge (inline style OK for badge)
   - `.adrTitle` h2
   - `.adrMeta` with date + deciders
   - Loop 3 `.adrSection` divs (context/decision/consequences), each with `.adrSectionLabel`
   - Conditionally render `.altGrid` for `alternatives[]`
5. Add CSS to `styles.module.css` using CSS variables

## MDX Usage
```mdx
import { ADR, DecisionTable } from '@site/src/components/PageLayouts';

<ADR
  id="001"
  title="Use LangGraph for pipeline orchestration"
  date="2026-03-15"
  status="accepted"
  deciders={["Alice Chan", "Bob Patel"]}
  context={<p>We need a multi-agent pipeline that can be debugged step by step...</p>}
  decision={<p>Use LangGraph's StateGraph with sequential edges and a shared TypedDict state.</p>}
  consequences={<p>Each agent is independently testable. Adding phases requires new nodes only.</p>}
  alternatives={[
    { option: "Crew AI", reason: "Less control over state transitions" },
    { option: "Autogen", reason: "Higher complexity for sequential pipelines" },
  ]}
/>
```

## Validation
- [ ] Status badge shows correct colour for all 4 statuses
- [ ] Alternatives grid renders only when `alternatives` prop is provided
- [ ] All text readable in dark mode (no hardcoded background on card body)
- [ ] Section labels use primary colour (navy in light, sky blue in dark)
