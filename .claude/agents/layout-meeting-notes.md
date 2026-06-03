# Agent: MeetingNotes Layout

Reproduce or modify the **MeetingNotes** component — a structured meeting notes page with action items.

## Location
- Component: `docs-site/src/components/PageLayouts/index.tsx` (exported as `MeetingNotes`)
- CSS: `docs-site/src/components/PageLayouts/styles.module.css`
- Demo: `docs-site/docs/templates/meeting-2026-06-01.mdx`

## What It Renders
- Metadata row: 📅 date, 🎙 facilitator, 👥 attendees (count + list on hover/expand)
- Body content (ReactNode — agenda, decisions, notes)
- Action items section: table with checkbox ✅/⬜ + task + @owner + due date

## TypeScript Interface
```typescript
interface ActionItem {
  owner: string;
  task: string;
  due: string;
  done?: boolean;
}

interface MeetingNotesProps {
  date: string;          // "2026-06-02"
  attendees: string[];   // ["Alice", "Bob", "Carol"]
  facilitator: string;
  children: ReactNode;
  actionItems?: ActionItem[];
}
```

## CSS Classes
```css
.meeting        { border:1px solid var(--border-color); border-radius:14px; overflow:hidden; margin:1.25rem 0; }
.meetingHeader  { display:flex; flex-wrap:wrap; gap:1.5rem; align-items:center; padding:1rem 1.5rem;
                  background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.meetingMeta    { display:flex; align-items:center; gap:6px; font-size:0.83rem; color:var(--text-muted); }
.meetingBody    { padding:1.5rem; }
.actionItems    { border-top:1px solid var(--border-color); padding:1.25rem 1.5rem; }
.actionTitle    { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;
                  color:var(--ifm-color-primary,#003087); margin-bottom:0.75rem; }
.actionTable    { width:100%; border-collapse:collapse; font-size:0.85rem; }
.actionTable th { text-align:left; padding:0.4rem 0.75rem; font-size:0.72rem; font-weight:600;
                  text-transform:uppercase; color:var(--text-muted); border-bottom:1px solid var(--border-color); }
.actionTable td { padding:0.5rem 0.75rem; border-bottom:1px solid var(--border-color); }
.actionTable tr:last-child td { border-bottom:none; }
.actionDone     { opacity:0.5; text-decoration:line-through; }
.ownerTag       { font-size:0.78rem; color:var(--ifm-color-primary); font-weight:600; }
.dueDate        { font-family:monospace; font-size:0.78rem; color:var(--text-muted); }
```

## Reproduction Steps
1. Define `ActionItem` and `MeetingNotesProps`
2. Render meeting card:
   - Header: date / facilitator / attendee count with `👥 N attendees`
   - Body: `children` in `.meetingBody`
   - Conditional `.actionItems` section with table
3. Action item row: `{done ? '✅' : '⬜'}` + task + `@owner` + due date
4. Apply `.actionDone` class to completed rows
5. CSS: all backgrounds via CSS vars

## MDX Usage
```mdx
import { MeetingNotes } from '@site/src/components/PageLayouts';

<MeetingNotes
  date="2026-06-02"
  facilitator="Alice Chan"
  attendees={["Alice Chan", "Bob Patel", "Carol Singh", "Dave Kim"]}
  actionItems={[
    { owner: "Bob", task: "Add dark mode CSS overrides for InfoPanel", due: "2026-06-05", done: true },
    { owner: "Carol", task: "Write agent docs for each layout", due: "2026-06-09" },
    { owner: "Dave", task: "Review SDLC gate checklist template", due: "2026-06-07" },
  ]}
>

## Agenda

1. Review dark mode issues on runbook page
2. Plan Wave 7 layouts
3. Sprint retrospective action items

## Decisions

- All new layouts must ship with a `[data-theme='dark']` CSS override
- Wave 7 will cover API documentation layouts

</MeetingNotes>
```

## Validation
- [ ] Attendee count shows correctly
- [ ] Done items show strikethrough + reduced opacity
- [ ] Action items table renders without action items (section hidden)
- [ ] Body content (MDX children) renders correctly
- [ ] Dark mode: no white backgrounds
