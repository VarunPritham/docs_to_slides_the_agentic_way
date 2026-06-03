# Agent: SDLCGateChecklist Layout

Reproduce or modify the **SDLCGateChecklist** component — a release gate tracker with accordion.

## Location
- Component: `docs-site/src/components/PageLayouts/wave5.tsx` (exported as `SDLCGateChecklist`)
- CSS: `docs-site/src/components/PageLayouts/wave-styles.module.css`
- Demo: `docs-site/docs/templates/sdlc-gate-checklist-pipeline-v1-4.mdx`

## What It Renders
- Header: service ID / name / version / release date / release manager
- **Progress bar**: segmented strip — one coloured segment per gate, colour = gate status
- **Accordion of gates**: each gate can expand/collapse
  - Gate header: status dot + gate label + status pill + approver + approved timestamp
  - Gate body: table of checks (check name / status badge / evidence link)

## TypeScript Interface
```typescript
type GateStatus = 'not-started' | 'in-progress' | 'passed' | 'blocked' | 'waived';
type CheckStatus = 'pass' | 'fail' | 'na' | 'pending';

interface Check {
  name: string;
  status: CheckStatus;
  evidence?: string;     // URL or text reference
}

interface Gate {
  id: string;
  label: string;
  status: GateStatus;
  approver?: string;
  approvedAt?: string;
  checks: Check[];
}

interface SDLCGateChecklistProps {
  serviceId: string;
  serviceName: string;
  version: string;
  releaseDate: string;
  releaseManager: string;
  gates: Gate[];
}
```

## State
```typescript
const [openGate, setOpenGate] = useState<string | null>(gates[0]?.id ?? null);
// Click gate header toggles: openGate === id ? setOpenGate(null) : setOpenGate(id)
```

## Gate Status Colours
```typescript
const gateStatusConfig = {
  passed:      { dot: '#22c55e', label: 'Passed',      bg: '#d1fae5', text: '#065f46' },
  'in-progress': { dot: '#3b82f6', label: 'In Progress', bg: '#dbeafe', text: '#1e40af' },
  blocked:     { dot: '#ef4444', label: 'Blocked',     bg: '#fee2e2', text: '#991b1b' },
  waived:      { dot: '#6b7280', label: 'Waived',      bg: '#f3f4f6', text: '#374151' },
  'not-started': { dot: '#d1d5db', label: 'Not Started', bg: '#f9fafb', text: '#6b7280' },
};
```

## Check Status Colours
```typescript
const checkConfig = {
  pass:    { icon: '✅', text: '#065f46', bg: '#d1fae5' },
  fail:    { icon: '❌', text: '#991b1b', bg: '#fee2e2' },
  na:      { icon: '—',  text: '#6b7280', bg: '#f3f4f6' },
  pending: { icon: '⏳', text: '#92400e', bg: '#fef3c7' },
};
```

## Key CSS Classes
```css
.sdlc           { border:1px solid var(--border-color); border-radius:14px; overflow:hidden; margin:1.5rem 0; }
.sdlcHeader     { padding:1.25rem 1.5rem; background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.sdlcProgress   { display:flex; height:8px; gap:2px; padding:0 1.5rem; margin:0.75rem 0; }
.sdlcSeg        { flex:1; border-radius:4px; }   /* background set inline from gateStatusConfig.dot */
.gateBlock      { border-bottom:1px solid var(--border-color); }
.gateBlock:last-child { border-bottom:none; }
.gateHeader     { display:flex; align-items:center; gap:10px; padding:0.875rem 1.25rem;
                  cursor:pointer; background:var(--surface-1); user-select:none; }
.gateHeader:hover { background:var(--surface-2); }
.gateBody       { padding:0 1.25rem 1.25rem; }
.gateTable      { width:100%; border-collapse:collapse; font-size:0.83rem; margin-top:0.75rem; }
.gateTable th   { background:var(--brand-navy,#003087); color:#fff; padding:0.4rem 0.75rem; font-size:0.72rem; text-align:left; }
.gateTable td   { padding:0.4rem 0.75rem; border-bottom:1px solid var(--border-color); }
```

## Reproduction Steps
1. Define `GateStatus`, `CheckStatus`, `Check`, `Gate`, `SDLCGateChecklistProps`
2. `useState` for `openGate`
3. Render header: service ID + name + version + date + manager metadata
4. Render progress bar: `gates.map()` → segments, each bg from `gateStatusConfig[gate.status].dot`
5. Render gates accordion: click header toggles open state
6. Expanded gate body: check table with status badges
7. Progress bar segment bg is inline — OK for colour (small decorative element)

## MDX Usage
```mdx
import { SDLCGateChecklist } from '@site/src/components/PageLayouts/wave5';

<SDLCGateChecklist
  serviceId="SVC-PIPELINE"
  serviceName="AI Slide Generation Pipeline"
  version="1.4.0"
  releaseDate="2026-06-10"
  releaseManager="Alice Chan"
  gates={[
    {
      id: "security",
      label: "Security Review",
      status: "passed",
      approver: "Security Team",
      approvedAt: "2026-06-08",
      checks: [
        { name: "SAST scan", status: "pass", evidence: "sonar-report-1.4.0.pdf" },
        { name: "Dependency audit", status: "pass" },
        { name: "Secrets scan", status: "pass" },
      ],
    },
    {
      id: "testing",
      label: "Test Gate",
      status: "in-progress",
      checks: [
        { name: "Unit tests (>90% coverage)", status: "pass" },
        { name: "Integration tests", status: "pending" },
        { name: "Load test on staging", status: "pending" },
      ],
    },
    {
      id: "cab",
      label: "CAB Approval",
      status: "not-started",
      checks: [
        { name: "CR submitted", status: "pending" },
        { name: "CAB sign-off", status: "pending" },
      ],
    },
  ]}
/>
```

## Validation
- [ ] Progress bar segments show correct colours per gate status
- [ ] Accordion opens/closes on gate header click
- [ ] Only one gate open at a time (or all closed)
- [ ] Check status badges render correct icon + colour
- [ ] Dark mode: gate headers use `var(--surface-1)`, no white bg
