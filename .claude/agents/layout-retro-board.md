# Agent: RetroBoard Layout

Reproduce or modify the **RetroBoard** component — a Start/Stop/Continue/Action retrospective board.

## Location
- Component: `docs-site/src/components/PageLayouts/index.tsx` (exported as `RetroBoard`)
- CSS: `docs-site/src/components/PageLayouts/styles.module.css`
- Demo: `docs-site/docs/templates/retro-sprint-4.mdx`

## What It Renders
4-column board:
- 🚀 **Start** — things to try (green)
- 🛑 **Stop** — things to drop (red)
- 🔄 **Continue** — things going well (blue)
- ⚡ **Action** — concrete follow-ups (amber)

Each card: optional 👍 vote count badge + item text.

## TypeScript Interface
```typescript
type RetroCategory = 'start' | 'stop' | 'continue' | 'action';

interface RetroItem {
  text: string;
  votes?: number;
}

interface RetroBoardProps {
  items: Partial<Record<RetroCategory, RetroItem[]>>;
}
```

## Category Config
```typescript
const retroConfig: Record<RetroCategory, { icon: string; label: string; borderColor: string; headerBg: string; }> = {
  start:    { icon: '🚀', label: 'Start',    borderColor: '#22c55e', headerBg: 'rgba(34,197,94,0.1)' },
  stop:     { icon: '🛑', label: 'Stop',     borderColor: '#ef4444', headerBg: 'rgba(239,68,68,0.1)' },
  continue: { icon: '🔄', label: 'Continue', borderColor: '#3b82f6', headerBg: 'rgba(59,130,246,0.1)' },
  action:   { icon: '⚡', label: 'Action',   borderColor: '#f59e0b', headerBg: 'rgba(245,158,11,0.1)' },
};
```

Header bg uses `rgba()` — works in both light and dark mode. Never hardcode `#f0fdf4` etc.

## CSS Classes
```css
.retroBoard     { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1rem; margin:1.25rem 0; }
.retroCol       { border:1px solid var(--border-color); border-radius:12px; overflow:hidden; }
.retroHeader    { display:flex; align-items:center; gap:8px; padding:0.75rem 1rem;
                  font-weight:700; font-size:0.85rem; border-bottom:2px solid; }
/* border-bottom-color and background set via inline style from retroConfig */
.retroItems     { padding:0.75rem; display:flex; flex-direction:column; gap:0.5rem; }
.retroItem      { display:flex; align-items:flex-start; gap:8px; font-size:0.83rem;
                  padding:0.5rem 0.75rem; background:var(--surface-1); border-radius:8px; line-height:1.5; }
.retroVotes     { font-size:0.72rem; font-weight:700; color:var(--text-muted);
                  background:var(--surface-2); border-radius:100px; padding:1px 6px; white-space:nowrap; }
.retroEmpty     { font-size:0.82rem; color:var(--text-muted); font-style:italic; padding:0.5rem 0.75rem; }
```

## Reproduction Steps
1. Define `RetroCategory`, `RetroItem`, `RetroBoardProps`
2. Define `retroConfig` with `rgba()` backgrounds (NOT light hex)
3. Render 4-column grid, each column a `retroCol` card
4. For each category: render header with icon/label (inline border + bg from config), then items list
5. If category not in `items` prop, show empty state message
6. Votes badge: only render if `votes` is defined and `> 0`
7. CSS: item bg uses `var(--surface-1)` so it adapts to dark mode

## MDX Usage
```mdx
import { RetroBoard } from '@site/src/components/PageLayouts';

<RetroBoard items={{
  start: [
    { text: "Write dark mode tests before merging layout PRs", votes: 5 },
    { text: "Peer review all new agent docs", votes: 3 },
  ],
  stop: [
    { text: "Hardcoding light hex colours in inline React styles", votes: 8 },
    { text: "Skipping the validation checklist", votes: 4 },
  ],
  continue: [
    { text: "One agent file per layout", votes: 6 },
    { text: "Parallel Write calls to save time", votes: 3 },
  ],
  action: [
    { text: "Alice: Update all existing layouts to use CSS class pattern", votes: 0 },
    { text: "Bob: Write README section on dark mode rules", votes: 0 },
  ],
}} />
```

## Validation
- [ ] All 4 columns render with correct colour accents
- [ ] Items with `votes: 0` or no votes don't show the badge
- [ ] Missing categories show empty state, not an error
- [ ] Dark mode: item cards use `var(--surface-1)`, no white bg
- [ ] Responsive: stacks to 2 or 1 column on narrow screens
