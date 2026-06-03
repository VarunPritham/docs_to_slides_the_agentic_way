# Agent: InfoPanel Layout

Reproduce or modify the **InfoPanel** component — a 6-type colour-coded callout box.

## Location
- Component: `docs-site/src/components/PageLayouts/index.tsx` (exported as `InfoPanel`)
- CSS: `docs-site/src/components/PageLayouts/styles.module.css`

## What It Renders
Left-bordered callout box with:
- Type icon (emoji)
- Bold label or custom title
- Body content (any ReactNode — text, code, links)

## TypeScript Interface
```typescript
type PanelType = 'info' | 'success' | 'warning' | 'danger' | 'note' | 'tip';

interface InfoPanelProps {
  type?: PanelType;    // default: 'info'
  title?: string;      // overrides default label
  children: ReactNode;
}
```

## Type Config Map
```typescript
const panelConfig = {
  info:    { icon: 'ℹ️',  label: 'Info',    cls: 'panelInfo',    color: '#1e40af' },
  success: { icon: '✅',  label: 'Success', cls: 'panelSuccess', color: '#166534' },
  warning: { icon: '⚠️', label: 'Warning', cls: 'panelWarning', color: '#92400e' },
  danger:  { icon: '🚨', label: 'Danger',  cls: 'panelDanger',  color: '#991b1b' },
  note:    { icon: '📝', label: 'Note',    cls: 'panelNote',    color: '#5b21b6' },
  tip:     { icon: '💡', label: 'Tip',     cls: 'panelTip',     color: '#0f766e' },
};
```

## CSS Classes (CRITICAL — dark mode pattern)
```css
/* Base */
.infoPanel     { border-left: 4px solid transparent; border-radius: 8px; padding: 1rem 1.25rem; margin: 1.25rem 0; }
.infoPanelHeader { display:flex; align-items:center; gap:8px; font-size:0.85rem; font-weight:700; margin-bottom:0.5rem; }
.infoPanelBody { font-size:0.9rem; line-height:1.65; }

/* Per-type: light bg + border colour */
.panelInfo     { border-left-color: #3b82f6; background: #eff6ff; }
.panelSuccess  { border-left-color: #22c55e; background: #f0fdf4; }
.panelWarning  { border-left-color: #f59e0b; background: #fffbeb; }
.panelDanger   { border-left-color: #ef4444; background: #fef2f2; }
.panelNote     { border-left-color: #8b5cf6; background: #f5f3ff; }
.panelTip      { border-left-color: #14b8a6; background: #f0fdfa; }

/* Dark mode overrides — translucent tints, never white */
[data-theme='dark'] .panelInfo    { background: rgba(59,130,246,0.12); }
[data-theme='dark'] .panelSuccess { background: rgba(34,197,94,0.12);  }
[data-theme='dark'] .panelWarning { background: rgba(245,158,11,0.12); }
[data-theme='dark'] .panelDanger  { background: rgba(239,68,68,0.12);  }
[data-theme='dark'] .panelNote    { background: rgba(139,92,246,0.12); }
[data-theme='dark'] .panelTip     { background: rgba(20,184,166,0.12); }
[data-theme='dark'] .infoPanelHeader { filter: brightness(1.4); }
```

## The Dark Mode Rule
**Never** use `style={{ background: '#fef2f2' }}` inline — inline styles beat all CSS and break dark mode. Always map to a CSS class via `styles[p.cls]`.

## Component Code
```tsx
export function InfoPanel({ type = 'info', title, children }: InfoPanelProps) {
  const p = panelConfig[type];
  return (
    <div className={`${styles.infoPanel} ${styles[p.cls]}`}>
      <div className={styles.infoPanelHeader} style={{ color: p.color }}>
        <span>{p.icon}</span>
        <strong>{title ?? p.label}</strong>
      </div>
      <div className={styles.infoPanelBody}>{children}</div>
    </div>
  );
}
```

Note: header `color` as inline style is fine — text colour works in both modes.

## Reproduction Steps
1. Read `index.tsx` and `styles.module.css`
2. Add `PanelType` union + `panelConfig` map using `cls` key (not `bg`/`border`)
3. Write component using `styles[p.cls]` for background + border
4. Add all 6 `.panel*` CSS classes to module
5. Add all 6 `[data-theme='dark']` overrides with `rgba()`

## MDX Usage
```mdx
import { InfoPanel } from '@site/src/components/PageLayouts';

<InfoPanel type="danger" title="Do NOT skip steps">
  This runbook covers P1 pipeline failures. Work through every step in order.
</InfoPanel>

<InfoPanel type="tip">
  You can switch LLM providers by setting `LLM_PROVIDER=databricks`.
</InfoPanel>
```

## Validation
- [ ] All 6 types render distinct colours in light mode
- [ ] In dark mode all panels show semi-transparent tinted bg (not white/cream)
- [ ] Custom `title` overrides the default label
- [ ] Body renders ReactNode including `<code>` tags
