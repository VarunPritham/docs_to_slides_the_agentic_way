# Agent: MetaBlock Layout

Reproduce or modify the **MetaBlock** component — the standard page header used at the top of every doc page.

## Location
- Component: `docs-site/src/components/PageLayouts/index.tsx` (exported as `MetaBlock`)
- CSS: `docs-site/src/components/PageLayouts/styles.module.css`
- Demo MDX: any `docs-site/docs/templates/*.mdx` — all pages use it

## What It Renders
Horizontal metadata bar across the top of a doc page:
- Circular avatar with owner initials (or image if avatar URL provided)
- Owner name + optional team chip
- Coloured status badge
- "Updated {date}" timestamp
- "Reviewed by {name}" if provided
- Tag chips row

## TypeScript Interface
```typescript
interface MetaBlockProps {
  owner: string;           // "Jane Smith"
  team?: string;           // "Platform SRE"
  status: 'draft' | 'review' | 'live' | 'deprecated' | 'incident';
  lastUpdated: string;     // "2026-06-02"
  reviewedBy?: string;     // "Priya Shah"
  tags?: string[];         // ['runbook', 'p1']
}
```

## Status Badge Colours
| Status | Text colour | Background |
|---|---|---|
| `draft` | `#374151` | `#f3f4f6` |
| `review` | `#92400e` | `#fef3c7` |
| `live` | `#065f46` | `#d1fae5` |
| `deprecated` | `#991b1b` | `#fee2e2` |
| `incident` | `#ffffff` | `#dc2626` (red, pulses) |

## CSS Classes Needed
```css
.metaBlock      /* flex row, gap, padding, border-bottom */
.metaOwner      /* flex align-center gap */
.avatar         /* 32px circle, navy bg, white text, font-weight 700 */
.metaTeam       /* small chip, surface-2 bg */
.statusBadge    /* rounded pill, font-size 0.72rem, padding 2px 8px */
.metaDate       /* text-muted, font-size 0.8rem */
.metaReviewer   /* text-muted, font-size 0.8rem */
.tag            /* small chip, brand-blue-light bg, brand-navy text */
```

All use CSS variables — no hardcoded colours for backgrounds.

## Reproduction Steps
1. Read `index.tsx` and `styles.module.css`
2. Add `MetaBlockProps` interface
3. Build `statusColorMap` for badge background/color pairs
4. Generate avatar initials: `owner.split(' ').map(w => w[0]).join('')`
5. Render horizontal flex container with all fields
6. Add CSS classes (vars-only, no hardcoded light hex in backgrounds)
7. Export from `index.tsx`

## MDX Usage
```mdx
import { MetaBlock } from '@site/src/components/PageLayouts';

<MetaBlock
  owner="Jane Smith"
  team="Platform SRE"
  status="live"
  lastUpdated="2026-06-02"
  reviewedBy="Priya Shah"
  tags={['runbook', 'pipeline', 'p1']}
/>
```

## Validation
- [ ] Renders in both light and dark mode with no white boxes
- [ ] Status badge colour matches the status
- [ ] Tags appear as chips
- [ ] Avatar shows initials when no `avatar` URL provided
