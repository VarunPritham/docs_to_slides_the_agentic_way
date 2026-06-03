Scaffold a new compliance/governance layout component in `docs-site/src/components/PageLayouts/wave5.tsx`.

Usage: /add-layout-compliance <ComponentName> [--desc "short description"]

This command adds a layout to the **wave5.tsx** wave (ChangeRequest, IncidentPostMortem, SDLCGateChecklist, ITControlEvidence).
For ops/team layouts (RunbookStep, InfoPanel, TeamGrid), use `/add-layout`.
For docs-as-code layouts (CodeWalkthrough, ArchitectureDiagram), use `/add-layout-docs`.

## Steps

1. **Define TypeScript interfaces** at the top of `wave5.tsx`, before the component:
   - Start with sub-item types (e.g. `interface ApprovalEntry { ... }`)
   - Then the main props interface
   - Use string literal union types for status/severity fields: `'draft' | 'approved' | 'rejected'`

2. **Add CSS classes** in `docs-site/src/components/PageLayouts/wave-styles.module.css`:
   - Use the wave-styles CSS variable palette (same vars as styles.module.css)
   - For tab-based layouts, add: `.tabBar`, `.tabBtn`, `.tabActive` (or reuse existing ones with a component prefix)
   - Status/severity variants MUST have `[data-theme='dark']` overrides:
     ```css
     .statusApproved { background: #d1fae5; color: #065f46; }
     [data-theme='dark'] .statusApproved { background: rgba(34,197,94,0.12); color: #6ee7b7; }
     ```
   - Never use inline `style={{ background: ... }}` for semantic colours

3. **Write the component function** in `wave5.tsx`:
   - Export named: `export function <ComponentName>({ ... }: <ComponentName>Props) { ... }`
   - For tabbed layouts: `const [tab, setTab] = useState<'details' | 'impl' | 'approvals'>('details')`
   - Render: header section → tab bar → tab body (conditional on `tab === '...'`)
   - Table pattern:
     ```tsx
     <table className={styles.crTable}>
       <thead><tr><th>Column</th></tr></thead>
       <tbody>{items.map(item => <tr key={item.id}><td>...</td></tr>)}</tbody>
     </table>
     ```

4. **Create the MDX demo page** at `docs-site/docs/templates/<kebab-name>.mdx`:
   ```mdx
   ---
   id: <kebab-name>
   title: <Title>
   ---

   import { MetaBlock } from '@site/src/components/PageLayouts';
   import { <ComponentName> } from '@site/src/components/PageLayouts/wave5';

   <MetaBlock owner="Your Name" team="Compliance" status="live" lastUpdated="2026-06-02" />

   # <Title>

   <ComponentName ... />
   ```

5. **Register in the sidebar** — add to `docs-site/sidebars.ts` under `templates`:
   ```typescript
   'templates/<kebab-name>',
   ```

6. **Create the agent file** at `.claude/agents/layout-<kebab-name>.md` following the structure of:
   - `.claude/agents/layout-change-request.md` (for 3-tab CR-style layouts)
   - `.claude/agents/layout-sdlc-gate-checklist.md` (for accordion + progress bar layouts)
   - `.claude/agents/layout-it-control-evidence.md` (for 2-tab evidence logs)

## Compliance Layout Patterns

**3-tab layout (ChangeRequest / IncidentPostMortem pattern):**
```tsx
const [tab, setTab] = useState<'details' | 'steps' | 'approvals'>('details');
// Tab bar
<div className={styles.tabBar}>
  {(['details','steps','approvals'] as const).map(t => (
    <button key={t} className={`${styles.tabBtn} ${tab===t ? styles.tabActive : ''}`}
      onClick={() => setTab(t)}>{t}</button>
  ))}
</div>
// Body
{tab === 'details' && <div>...</div>}
{tab === 'steps'   && <table>...</table>}
{tab === 'approvals' && <div>...</div>}
```

**Accordion layout (SDLCGateChecklist pattern):**
```tsx
const [openGate, setOpenGate] = useState<string | null>(null);
// Each gate header
<div onClick={() => setOpenGate(openGate === gate.id ? null : gate.id)}>
  {/* chevron rotates when open */}
</div>
{openGate === gate.id && <div className={styles.gateBody}>...</div>}
```

## Dark Mode Checklist

- [ ] All status/risk/severity badge backgrounds have `[data-theme='dark']` `rgba()` overrides
- [ ] Table `th` background uses `var(--brand-navy,#003087)` (dark is fine for headers)
- [ ] Table `td` borders use `var(--border-color)`
- [ ] Tab active state uses `var(--brand-navy)` with white text (works in both modes)
- [ ] No inline `style={{ background: ... }}` on semantic elements
