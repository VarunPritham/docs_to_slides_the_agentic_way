# Agent: ChangeRequest Layout

Reproduce or modify the **ChangeRequest** component — a CAB (Change Advisory Board) change record.

## Location
- Component: `docs-site/src/components/PageLayouts/wave5.tsx` (exported as `ChangeRequest`)
- CSS: `docs-site/src/components/PageLayouts/wave-styles.module.css`
- Demo: `docs-site/docs/templates/change-request.mdx`

## What It Renders
Full CAB change management record with 3 tabs:

**Header:**
- CR-ID chip
- Change type badge: 🚨 Emergency / Standard / Normal
- Risk badge (critical/high/medium/low)
- Status pill
- Title
- Metadata: requestor / implementor / scheduled window / affected services

**Tab 1 — Details:**
- Description (prose)
- Business justification
- Test plan
- Rollback plan

**Tab 2 — Implementation:**
- Table: Step # / Action / Owner / Duration

**Tab 3 — CAB:**
- Rejection alert (if any approver rejected)
- List of CAB approvers: name + role + status + comment + timestamp

## TypeScript Interface
```typescript
type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

interface ImplementationStep {
  step: number;
  action: string;
  owner: string;
  duration: string;   // "15 min"
}

interface CabApproval {
  approver: string;
  role: string;
  status: 'approved' | 'rejected' | 'pending';
  comment?: string;
  timestamp?: string;
}

interface ChangeRequestProps {
  crId: string;               // "CR-2026-0142"
  title: string;
  type: 'normal' | 'standard' | 'emergency';
  risk: RiskLevel;
  status: 'draft' | 'pending-cab' | 'approved' | 'rejected' | 'implemented' | 'rolled-back';
  requestor: string;
  implementor: string;
  scheduledStart: string;
  scheduledEnd: string;
  affectedServices: string[];
  description: string;
  businessJustification: string;
  implementationSteps: ImplementationStep[];
  testPlan: string;
  rollbackPlan: string;
  cabApprovals: CabApproval[];
}
```

## State
```typescript
const [tab, setTab] = useState<'details' | 'steps' | 'cab'>('details');
```

## Key CSS Classes (wave-styles.module.css)
```css
.cr           { border:1px solid var(--border-color); border-radius:14px; overflow:hidden; margin:1.5rem 0; }
.crHeader     { padding:1.25rem 1.5rem; border-bottom:1px solid var(--border-color); background:var(--surface-1); }
.crId         { font-size:0.75rem; font-weight:700; background:var(--brand-blue-light); color:var(--brand-navy);
                padding:2px 8px; border-radius:6px; text-transform:uppercase; letter-spacing:0.08em; }
.crTitle      { font-size:1.15rem; font-weight:800; margin:0.5rem 0; }
.crMeta       { display:flex; flex-wrap:wrap; gap:0.75rem 1.5rem; font-size:0.8rem; color:var(--text-muted); }
.tabBar       { display:flex; border-bottom:1px solid var(--border-color); background:var(--surface-1); }
.tabBtn       { padding:0.625rem 1.25rem; font-size:0.83rem; font-weight:600; background:none; border:none;
                border-bottom:2px solid transparent; cursor:pointer; color:var(--text-muted); }
.tabActive    { border-bottom-color:var(--brand-blue,#00AEEF); color:var(--brand-navy,#003087); }
.crBody       { padding:1.5rem; }
.crTable      { width:100%; border-collapse:collapse; font-size:0.85rem; }
.crTable th   { background:var(--brand-navy,#003087); color:#fff; padding:0.5rem 0.75rem; text-align:left; font-size:0.75rem; }
.crTable td   { padding:0.5rem 0.75rem; border-bottom:1px solid var(--border-color); }
.cabRow       { padding:0.875rem; border:1px solid var(--border-color); border-radius:10px; margin-bottom:0.75rem; }
```

## Reproduction Steps
1. Read `wave5.tsx` and `wave-styles.module.css`
2. Define all 3 interfaces (`ImplementationStep`, `CabApproval`, `ChangeRequestProps`)
3. `useState` for `tab`
4. Render header: CR-ID chip + type badge (🚨 for emergency) + risk + status pills
5. Render tab bar: 3 buttons with `.tabActive` on selected
6. Render tab body conditionally:
   - Details: description/justification/test/rollback as labelled prose sections
   - Implementation: `<table>` with `.crTable`
   - CAB: rejection alert + approver cards
7. All CSS via CSS vars — no hardcoded light backgrounds

## MDX Usage
```mdx
import { ChangeRequest } from '@site/src/components/PageLayouts/wave5';

<ChangeRequest
  crId="CR-2026-0142"
  title="Upgrade LangGraph from 0.1.x to 0.2.x"
  type="normal"
  risk="medium"
  status="approved"
  requestor="Alice Chan"
  implementor="Bob Patel"
  scheduledStart="2026-06-10T22:00:00"
  scheduledEnd="2026-06-11T00:00:00"
  affectedServices={["pipeline-api", "slide-generator"]}
  description="Upgrade LangGraph to benefit from parallel node execution and improved state debugging."
  businessJustification="New version reduces P99 generation latency by ~30%."
  testPlan="Run full test suite. Smoke test /generate on 3 doc pages."
  rollbackPlan="Revert to 0.1.x via pip install langgraph==0.1.x and restart server."
  implementationSteps={[
    { step: 1, action: "pip install langgraph==0.2.x", owner: "Bob", duration: "5 min" },
    { step: 2, action: "Run pytest", owner: "Bob", duration: "10 min" },
    { step: 3, action: "Deploy to staging", owner: "Alice", duration: "15 min" },
  ]}
  cabApprovals={[
    { approver: "Carol Singh", role: "Change Manager", status: "approved", comment: "Looks good", timestamp: "2026-06-09T14:32" },
    { approver: "Dave Kim", role: "Security", status: "approved", timestamp: "2026-06-09T15:01" },
  ]}
/>
```

## Validation
- [ ] All 3 tabs switch correctly
- [ ] Emergency type shows 🚨 badge
- [ ] Rejection alert appears in CAB tab if any approver has `status: 'rejected'`
- [ ] Implementation table renders with navy header row
- [ ] Dark mode: no white/cream backgrounds on card or tab body
