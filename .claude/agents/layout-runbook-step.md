# Agent: RunbookStep Layout

Reproduce or modify the **RunbookStep** component — a numbered step card for operational runbooks.

## Location
- Component: `docs-site/src/components/PageLayouts/index.tsx` (exported as `RunbookStep`)
- CSS: `docs-site/src/components/PageLayouts/styles.module.css`
- Demo: `docs-site/docs/templates/runbook-pipeline-failure.mdx`

## What It Renders
A left-bordered card containing:
- Step circle (navy, numbered)
- Step title
- Optional severity badge (HIGH / MEDIUM etc.)
- Body content (expected output, instructions)
- Optional command block: dark terminal with `$` prompt + copy button

## TypeScript Interface
```typescript
interface RunbookStepProps {
  step: number;
  title: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  children: ReactNode;
  command?: string;   // shell command to copy
}
```

## CSS Classes (CRITICAL — dark mode pattern)
```css
/* Base step card — uses CSS vars, no hardcoded bg */
.runbookStep    { border-left:4px solid var(--border-color,#e2e8f0); border-radius:8px;
                  background:var(--surface-1,#f8fafc); padding:1.25rem; margin:1rem 0; }

/* Severity variants: CSS classes, NOT inline styles */
.sevLow      { border-left-color:#22c55e !important; background:#f0fdf4 !important; }
.sevMedium   { border-left-color:#f59e0b !important; background:#fffbeb !important; }
.sevHigh     { border-left-color:#f97316 !important; background:#fff7ed !important; }
.sevCritical { border-left-color:#ef4444 !important; background:#fef2f2 !important; }

/* Dark mode — translucent tints */
[data-theme='dark'] .sevLow      { background: rgba(34,197,94,0.10)  !important; }
[data-theme='dark'] .sevMedium   { background: rgba(245,158,11,0.10) !important; }
[data-theme='dark'] .sevHigh     { background: rgba(249,115,22,0.10) !important; }
[data-theme='dark'] .sevCritical { background: rgba(239,68,68,0.10)  !important; }
[data-theme='dark'] .severityBadge { filter: brightness(1.4); }

/* Layout */
.runbookStepHeader { display:flex; align-items:center; gap:10px; margin-bottom:0.75rem; }
.stepCircle        { width:30px; height:30px; border-radius:50%; background:var(--brand-navy,#003087);
                     color:#fff; font-weight:700; font-size:0.8rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.runbookStepTitle  { font-weight:700; font-size:0.95rem; flex:1; }
.severityBadge     { border-radius:6px; padding:2px 8px; font-size:0.7rem; font-weight:700; letter-spacing:0.05em; }
.runbookStepBody   { font-size:0.875rem; line-height:1.65; margin-bottom:0.75rem; }

/* Command block — always dark regardless of mode */
.commandBlock  { display:flex; align-items:center; gap:8px; background:#1e293b;
                 border-radius:8px; padding:10px 14px; margin-top:0.75rem; }
.commandPrompt { color:#94a3b8; font-family:monospace; font-weight:700; user-select:none; }
.commandText   { flex:1; color:#e2e8f0; font-size:0.85rem; background:transparent; border:none; padding:0; }
.copyBtn       { background:transparent; border:none; cursor:pointer; font-size:1rem; color:#94a3b8; }
```

## Component Code
```tsx
const severityClsMap: Record<string, string> = {
  low: 'sevLow', medium: 'sevMedium', high: 'sevHigh', critical: 'sevCritical',
};
const severityBadgeColors = {
  low:      { badge: '#d1fae5', badgeText: '#065f46' },
  medium:   { badge: '#fef3c7', badgeText: '#92400e' },
  high:     { badge: '#ffedd5', badgeText: '#9a3412' },
  critical: { badge: '#fee2e2', badgeText: '#991b1b' },
};

export function RunbookStep({ step, title, severity, children, command }: RunbookStepProps) {
  const sevCls = severity ? styles[severityClsMap[severity]] : '';
  const badge = severity ? severityBadgeColors[severity] : null;
  return (
    <div className={`${styles.runbookStep} ${sevCls}`}>
      <div className={styles.runbookStepHeader}>
        <div className={styles.stepCircle}>{step}</div>
        <div className={styles.runbookStepTitle}>{title}</div>
        {severity && badge && (
          <span className={styles.severityBadge} style={{ background: badge.badge, color: badge.badgeText }}>
            {severity.toUpperCase()}
          </span>
        )}
      </div>
      <div className={styles.runbookStepBody}>{children}</div>
      {command && (
        <div className={styles.commandBlock}>
          <span className={styles.commandPrompt}>$</span>
          <code className={styles.commandText}>{command}</code>
          <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(command)} title="Copy">📋</button>
        </div>
      )}
    </div>
  );
}
```

## Reproduction Steps
1. Read `index.tsx` and `styles.module.css`
2. Define `RunbookStepProps` interface
3. Create `severityClsMap` and `severityBadgeColors`
4. Build component using CSS class for severity (not inline background)
5. Add all severity CSS classes + dark mode overrides to `styles.module.css`
6. Command block always dark — `background: #1e293b` is correct in both modes

## MDX Usage
```mdx
<RunbookStep step={1} title="Verify the server is responding" severity="critical"
  command="curl -s http://localhost:8000/health | jq .">

**Expected:** `{"status":"ok","slidev_running":true}`

If `Connection refused` → server is down. Go to Step 2.
</RunbookStep>
```

## Combining Into a Runbook
A full runbook is typically:
1. `<MetaBlock>` at top
2. `<InfoPanel type="danger">` for P1 warning
3. `<RunbookStep step={1..N}>` for each step
4. `<ApiTryIt>` for live request test
5. Escalation `<InfoPanel type="warning">`

## Validation
- [ ] All 4 severity colours display correctly in light mode
- [ ] In dark mode, steps show semi-transparent tinted bg (not bright white/cream)
- [ ] Command block is always dark (no mode change)
- [ ] Copy button writes correct command to clipboard
- [ ] Steps without `severity` show neutral surface-1 background
