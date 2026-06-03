# Agent: OnCallRota Layout

Reproduce or modify the **OnCallRota** component — an on-call schedule display.

## Location
- Component: `docs-site/src/components/PageLayouts/index.tsx` (exported as `OnCallRota`)
- CSS: `docs-site/src/components/PageLayouts/styles.module.css`
- Demo: `docs-site/docs/templates/team-directory.mdx`, `service-status.mdx`

## What It Renders
- Header: 🟢 status dot + "On-Call Rota" title + optional escalation policy link/text
- List of on-call entries: week label + name + date range + optional "Current" badge

## TypeScript Interface
```typescript
interface OnCallEntry {
  name: string;
  week: string;        // "Week 23"
  start: string;       // "2026-06-02"
  end: string;         // "2026-06-08"
  primary?: boolean;   // shows "Current" badge
}

interface OnCallRotaProps {
  entries: OnCallEntry[];
  escalation?: string;    // "Page via PagerDuty"
}
```

## CSS Classes
```css
.oncallRota     { border:1px solid var(--border-color); border-radius:12px; overflow:hidden; margin:1.25rem 0; }
.oncallHeader   { display:flex; align-items:center; gap:10px; padding:0.875rem 1.25rem;
                  background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.oncallDot      { width:10px; height:10px; border-radius:50%; background:#22c55e; flex-shrink:0; }
.oncallTitle    { font-weight:700; font-size:0.9rem; flex:1; }
.oncallEsc      { font-size:0.78rem; color:var(--text-muted); }
.oncallList     { list-style:none; padding:0; margin:0; }
.oncallRow      { display:flex; align-items:center; gap:10px; padding:0.625rem 1.25rem;
                  border-bottom:1px solid var(--border-color); font-size:0.85rem; }
.oncallRow:last-child { border-bottom:none; }
.oncallRowCurrent { background:var(--brand-blue-light,#e0f6fe); }
.oncallWeek     { font-size:0.72rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;
                  color:var(--text-muted); width:60px; flex-shrink:0; }
.oncallName     { font-weight:600; flex:1; }
.oncallDates    { font-family:monospace; font-size:0.78rem; color:var(--text-muted); }
.currentBadge   { font-size:0.65rem; font-weight:700; padding:2px 6px; border-radius:100px;
                  background:#d1fae5; color:#065f46; }
```

## Reproduction Steps
1. Define `OnCallEntry` and `OnCallRotaProps`
2. Render header: green dot + title + optional escalation note
3. Map entries to rows — `primary` row gets `.oncallRowCurrent` class (blue tint background)
4. Show "Current" badge on primary entry
5. Date range in monospace
6. CSS: current row bg via CSS class (not inline) — uses `var(--brand-blue-light)`

## MDX Usage
```mdx
import { OnCallRota } from '@site/src/components/PageLayouts';

<OnCallRota
  escalation="Page via PagerDuty if no response within 15 min"
  entries={[
    { name: "Alice Chan", week: "Week 23", start: "2026-06-02", end: "2026-06-08", primary: true },
    { name: "Bob Patel",  week: "Week 24", start: "2026-06-09", end: "2026-06-15" },
    { name: "Carol Singh",week: "Week 25", start: "2026-06-16", end: "2026-06-22" },
  ]}
/>
```

## Validation
- [ ] Current (primary) row shows blue tint background + "Current" badge
- [ ] Dates render in monospace
- [ ] Escalation policy text renders in header
- [ ] Dark mode: current row bg uses CSS var (not hardcoded `#e0f6fe` via inline style)
