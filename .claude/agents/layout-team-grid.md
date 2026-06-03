# Agent: TeamGrid / TeamCard Layout

Reproduce or modify the **TeamGrid** and **TeamCard** components — a team directory.

## Location
- Component: `docs-site/src/components/PageLayouts/index.tsx` (exported as `TeamGrid`, `TeamCard`)
- CSS: `docs-site/src/components/PageLayouts/styles.module.css`
- Demo: `docs-site/docs/templates/team-directory.mdx`

## What It Renders
**TeamGrid:** Responsive card grid containing TeamCard components.
**TeamCard:** Individual member card with:
- Circular avatar (initials or image) with optional green on-call dot
- Member name + role
- Team name chip
- Timezone (with emoji flag)
- Slack + Email links

## TypeScript Interface
```typescript
interface TeamMember {
  name: string;
  role: string;
  team: string;
  timezone?: string;      // "Europe/London 🇬🇧"
  oncall?: boolean;       // shows green dot on avatar
  slack?: string;         // "@<team-member>.chan"
  email?: string;
  avatar?: string;        // URL — falls back to initials
}

interface TeamGridProps {
  members: TeamMember[];
}
```

## Avatar Initials Logic
```typescript
const initials = name.split(' ').map(w => w[0].toUpperCase()).join('').slice(0, 2);
```

## CSS Classes
```css
.teamGrid       { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:1rem; margin:1.25rem 0; }
.teamCard       { border:1px solid var(--border-color); border-radius:12px; padding:1.25rem;
                  background:var(--surface-1); display:flex; flex-direction:column; gap:0.5rem; }
.teamCard:hover { box-shadow:0 4px 12px rgba(0,48,135,0.08); transform:translateY(-1px); transition:all 0.15s; }
.avatarWrap     { position:relative; display:inline-block; width:48px; }
.avatar48       { width:48px; height:48px; border-radius:50%; background:var(--brand-navy,#003087);
                  color:#fff; font-weight:700; font-size:1rem; display:flex; align-items:center; justify-content:center; }
.oncallDot      { position:absolute; bottom:1px; right:1px; width:12px; height:12px;
                  border-radius:50%; background:#22c55e; border:2px solid var(--ifm-background-color); }
.memberName     { font-weight:700; font-size:0.95rem; margin:0; }
.memberRole     { font-size:0.82rem; color:var(--text-muted); margin:0; }
.memberTeam     { font-size:0.72rem; font-weight:600; padding:2px 8px; border-radius:100px;
                  background:var(--brand-blue-light,#e0f6fe); color:var(--brand-navy,#003087); display:inline-block; }
.memberTz       { font-size:0.78rem; color:var(--text-muted); }
.memberLinks    { display:flex; gap:0.75rem; margin-top:0.25rem; }
.memberLink     { font-size:0.78rem; color:var(--ifm-color-primary); text-decoration:none; font-weight:600; }
.memberLink:hover { text-decoration:underline; }
```

## Reproduction Steps
1. Define `TeamMember` interface and `TeamGridProps`
2. `TeamCard`: render avatar wrap (initials or `<img>`), optional on-call dot, name, role, team chip, timezone, links
3. `TeamGrid`: map members → `<TeamCard key={m.name} member={m} />`
4. CSS: card uses `var(--surface-1)` bg, hover lift effect, no hardcoded light bg
5. On-call dot positioned absolute bottom-right of avatar

## MDX Usage
```mdx
import { TeamGrid } from '@site/src/components/PageLayouts';

<TeamGrid members={[
  {
    name: "Alice Chan",
    role: "Platform Lead",
    team: "SRE",
    timezone: "Europe/London 🇬🇧",
    oncall: true,
    slack: "@<team-member>.chan",
    email: "alice@example.com",
  },
  {
    name: "Bob Patel",
    role: "Senior Engineer",
    team: "Platform",
    timezone: "Asia/Kolkata 🇮🇳",
    slack: "@bob.patel",
  },
]} />
```

## Validation
- [ ] Grid is responsive (2+ columns on desktop, 1 on mobile)
- [ ] On-call green dot appears only when `oncall: true`
- [ ] Avatar shows initials when no `avatar` URL
- [ ] Dark mode: card background uses `var(--surface-1)` (not white)
- [ ] Hover lift effect works
