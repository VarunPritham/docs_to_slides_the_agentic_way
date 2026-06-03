Scaffold a new ops/incident/team layout component in `docs-site/src/components/PageLayouts/index.tsx`.

Usage: /add-layout <ComponentName> [--desc "short description"]

This command adds a layout to the **index.tsx** wave (ops runbooks, service health, team/meeting pages).
For compliance layouts (ChangeRequest, PIR, SDLC), use `/add-layout-compliance`.
For docs-as-code layouts (CodeWalkthrough, ArchitectureDiagram, etc.), use `/add-layout-docs`.

## Steps

1. **Define the TypeScript interface** at the top of `index.tsx`, before the component function:
   ```typescript
   interface <ComponentName>Props {
     // ... props
   }
   ```

2. **Add CSS classes** in `docs-site/src/components/PageLayouts/styles.module.css`:
   - Use CSS variables: `var(--surface-1)`, `var(--border-color)`, `var(--text-muted)`, `var(--brand-navy)`
   - Never hardcode hex colour values in `background` properties (breaks dark mode)
   - For any colour-coded variants (severity/status/type), add BOTH:
     ```css
     .variantName   { border-left-color: #hexvalue; background: #lighthex; }
     [data-theme='dark'] .variantName { background: rgba(r,g,b,0.12); }
     ```
   - Code/terminal blocks are always dark (`background: #1e293b` or `#0f172a`) — no dark override needed

3. **Write the component function** in `index.tsx`:
   - Export named: `export function <ComponentName>({ ... }: <ComponentName>Props) { ... }`
   - Reference CSS classes via `styles.<className>` (CSS modules)
   - Never pass `background` or `borderLeftColor` as inline `style` props — use class names instead
   - Copy buttons: `navigator.clipboard.writeText(text)` + 2-second "✓ Copied" flash via `useState`

4. **Create the MDX demo page** at `docs-site/docs/templates/<kebab-name>.mdx`:
   ```mdx
   ---
   id: <kebab-name>
   title: <Title>
   ---

   import { MetaBlock, <ComponentName> } from '@site/src/components/PageLayouts';

   <MetaBlock owner="Your Name" team="Platform" status="live" lastUpdated="2026-06-02" />

   # <Title>

   <ComponentName ... />
   ```

5. **Register in the sidebar** — add entry to `docs-site/sidebars.ts` under the `templates` category:
   ```typescript
   'templates/<kebab-name>',
   ```

6. **Create the agent file** at `.claude/agents/layout-<kebab-name>.md` following the same structure as the other layout agent files. Include: location, what it renders, TypeScript interface, state, CSS classes, reproduction steps, MDX usage, validation checklist.

## Dark Mode Checklist

Before finishing, verify:
- [ ] No inline `style={{ background: '...' }}` on any div that carries a semantic colour
- [ ] All colour-coded CSS classes have `[data-theme='dark']` `rgba()` overrides
- [ ] Search inputs use `background: var(--ifm-background-color)` not `white`
- [ ] Any code/terminal blocks use `background: #0f172a` (hardcoded dark — intentional)

## Agent Reference

For detailed prop interfaces and CSS patterns for existing layouts, see the corresponding agent file in `.claude/agents/layout-*.md`.
