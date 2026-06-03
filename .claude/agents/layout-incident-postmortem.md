# Agent: IncidentPostMortem Layout

Reproduce or modify the **IncidentPostMortem** component — a blameless Post-Incident Review (PIR).

## Location
- Component: `docs-site/src/components/PageLayouts/wave5.tsx` (exported as `IncidentPostMortem`)
- CSS: `docs-site/src/components/PageLayouts/wave-styles.module.css`
- Demo: `docs-site/docs/templates/incident-postmortem-inc-2026-0031.mdx`

## What It Renders
Full PIR with 3 tabs:

**Header:**
- Incident ID + severity badge (P1/P2/P3/P4) + status pill
- Detected at / Resolved at / Duration
- Affected services chips
- Customer impact statement

**Tab 1 — Analysis:**
- Executive summary
- Root cause (red left-border highlight)
- Contributing factors (bulleted list)
- 2-column retro grid: "What Went Well" (green) + "What to Improve" (orange)

**Tab 2 — Timeline:**
- Vertical timeline with coloured dots per event type
- Each event: time + actor + description

**Tab 3 — Actions:**
- Table: ID / Title / Owner / Due / Priority / Status
- Count of open items shown in tab label

## TypeScript Interface
```typescript
interface TimelineEvent {
  time: string;
  type: 'detect' | 'escalate' | 'mitigate' | 'resolve' | 'action';
  actor: string;
  description: string;
}

interface ActionItem {
  id: string;
  title: string;
  owner: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'done';
}

interface IncidentPostMortemProps {
  incidentId: string;
  title: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'draft' | 'in-review' | 'published';
  detectedAt: string;
  resolvedAt: string;
  duration: string;        // "2h 34m"
  affectedServices: string[];
  customerImpact: string;
  summary: string;
  rootCause: string;
  contributingFactors: string[];
  timeline: TimelineEvent[];
  whatWentWell: string[];
  whatToImprove: string[];
  actionItems: ActionItem[];
}
```

## State
```typescript
const [tab, setTab] = useState<'summary' | 'timeline' | 'actions'>('summary');
```

## Timeline Event Colours
```typescript
const timelineColors = {
  detect:   '#3b82f6',  // blue
  escalate: '#f59e0b',  // amber
  mitigate: '#14b8a6',  // teal
  resolve:  '#22c55e',  // green
  action:   '#8b5cf6',  // purple
};
```

## Key CSS Classes
```css
.pir          { border:1px solid var(--border-color); border-radius:14px; overflow:hidden; margin:1.5rem 0; }
.pirHeader    { padding:1.25rem 1.5rem; background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.pirImpact    { font-size:0.83rem; color:var(--text-muted); margin-top:0.5rem;
                padding-left:0.75rem; border-left:3px solid #ef4444; }
.timeline     { display:flex; flex-direction:column; gap:0; position:relative; padding-left:2rem; }
.timeline::before { content:''; position:absolute; left:8px; top:0; bottom:0; width:2px;
                    background:var(--border-color); }
.timelineEvent { position:relative; padding:0 0 1.25rem 1rem; }
.timelineEvent::before { content:''; position:absolute; left:-1.75rem; top:4px; width:12px; height:12px;
                          border-radius:50%; border:2px solid white; }
/* dot colour set via inline style from timelineColors */
```

## Reproduction Steps
1. Define `TimelineEvent`, `ActionItem`, `IncidentPostMortemProps`
2. Define `timelineColors` map
3. `useState` for `tab`
4. Render header: incident ID + severity badge (P1=red, P2=orange, P3=amber, P4=blue) + status + impact
5. Tab bar with open action count in Actions tab label
6. Analysis tab: summary → root cause (red left border) → contributing factors → 2-col grid
7. Timeline tab: vertical list with coloured dots (inline dot colour OK)
8. Actions tab: table with priority and status badges

## MDX Usage
```mdx
import { IncidentPostMortem } from '@site/src/components/PageLayouts/wave5';

<IncidentPostMortem
  incidentId="INC-2026-0031"
  title="Pipeline API returning 503 on all generate requests"
  severity="P1"
  status="published"
  detectedAt="2026-05-28T09:14"
  resolvedAt="2026-05-28T11:48"
  duration="2h 34m"
  affectedServices={["pipeline-api", "slide-generator"]}
  customerImpact="100% of POST /generate requests failed. All slide generation unavailable."
  summary="The FastAPI server exhausted its file descriptor limit due to unclosed LangGraph state objects..."
  rootCause="LangGraph graph objects were not explicitly closed after each pipeline run, leaking file descriptors."
  contributingFactors={[
    "No resource limit monitoring on the pipeline server",
    "Load test ran in production environment without rate limiting",
  ]}
  timeline={[
    { time: "09:14", type: "detect", actor: "AlertManager", description: "503 rate spike alert fired" },
    { time: "09:22", type: "escalate", actor: "Alice Chan", description: "Paged on-call SRE" },
    { time: "10:45", type: "mitigate", actor: "Bob Patel", description: "Restarted server, throttled load" },
    { time: "11:48", type: "resolve", actor: "Bob Patel", description: "Deployed fix with explicit graph teardown" },
  ]}
  whatWentWell={["Alert fired within 8 minutes", "Root cause identified within 1 hour"]}
  whatToImprove={["Need fd monitoring alert", "Load tests should run in staging only"]}
  actionItems={[
    { id: "ACT-001", title: "Add fd limit monitoring", owner: "Alice", due: "2026-06-05", priority: "high", status: "in-progress" },
    { id: "ACT-002", title: "Block prod load tests in CI", owner: "Bob", due: "2026-06-03", priority: "medium", status: "open" },
  ]}
/>
```

## Validation
- [ ] All 3 tabs switch correctly
- [ ] Open action count shows correctly in Actions tab label
- [ ] Timeline dots are coloured per event type
- [ ] Root cause block has red left border
- [ ] 2-column retro grid renders side by side on desktop
- [ ] Dark mode: no white/cream backgrounds
