# Agent: ITControlEvidence Layout

Reproduce or modify the **ITControlEvidence** component — an IT General Controls (ITGC) / SOX audit evidence log.

## Location
- Component: `docs-site/src/components/PageLayouts/wave5.tsx` (exported as `ITControlEvidence`)
- CSS: `docs-site/src/components/PageLayouts/wave-styles.module.css`
- Demo: `docs-site/docs/templates/it-control-evidence-itgc-001.mdx`

## What It Renders
**Header:**
- Control ID chip
- Control type badge (preventive/detective/corrective)
- Overall result badge (✅ Effective / ❌ Ineffective / ⚪ Not Tested)
- Framework tag (SOX ITGC / ISO 27001 etc.)
- Metadata: domain / frequency / owner / last tested / next review
- Control objective statement

**Tab 1 — Evidence Log:**
Table: Date / Type / Description / Result badge / Reviewer / Artefact link

**Tab 2 — Exceptions:**
- If exceptions exist: table with ID / Date / Description / Risk badge / Mitigation / Remediation / Status
- If none: "No exceptions recorded" empty state
- Open exception count shown in tab label

## TypeScript Interface
```typescript
interface EvidenceEntry {
  date: string;
  type: string;           // "Automated test", "Manual review"
  description: string;
  result: 'pass' | 'fail' | 'exception' | 'not-tested';
  reviewer: string;
  artefact?: string;      // URL or filename
}

interface ExceptionEntry {
  id: string;
  date: string;
  description: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  mitigation: string;
  remediation: string;
  status: string;         // "Open", "Remediated", "Accepted"
}

interface ITControlEvidenceProps {
  controlId: string;
  controlName: string;
  framework: string;
  controlObjective: string;
  controlType: 'preventive' | 'detective' | 'corrective';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  owner: string;
  itgcDomain: string;
  lastTested: string;
  nextReview: string;
  overallResult: 'effective' | 'ineffective' | 'not-tested';
  evidence: EvidenceEntry[];
  exceptions: ExceptionEntry[];
}
```

## State
```typescript
const [tab, setTab] = useState<'evidence' | 'exceptions'>('evidence');
```

## Evidence Result Colours
```typescript
const evidenceResultConfig = {
  pass:       { icon: '✅', text: '#065f46', bg: '#d1fae5' },
  fail:       { icon: '❌', text: '#991b1b', bg: '#fee2e2' },
  exception:  { icon: '⚠️', text: '#92400e', bg: '#fef3c7' },
  'not-tested': { icon: '—', text: '#6b7280', bg: '#f3f4f6' },
};
```

## Key CSS Classes
```css
.itc            { border:1px solid var(--border-color); border-radius:14px; overflow:hidden; margin:1.5rem 0; }
.itcHeader      { padding:1.25rem 1.5rem; background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.itcObjective   { font-size:0.85rem; color:var(--text-muted); margin-top:0.5rem; line-height:1.6;
                  padding-left:0.75rem; border-left:3px solid var(--brand-blue,#00AEEF); }
/* Tab bar: re-uses .tabBar / .tabBtn / .tabActive from wave5 shared styles */
.itcTable       { width:100%; border-collapse:collapse; font-size:0.83rem; }
.itcTable th    { background:var(--brand-navy,#003087); color:#fff; padding:0.5rem 0.75rem; text-align:left; font-size:0.72rem; }
.itcTable td    { padding:0.5rem 0.75rem; border-bottom:1px solid var(--border-color); vertical-align:top; }
.itcEmpty       { text-align:center; padding:2rem; color:var(--text-muted); font-size:0.85rem; }
```

## Reproduction Steps
1. Define `EvidenceEntry`, `ExceptionEntry`, `ITControlEvidenceProps`
2. `useState` for `tab`
3. Render header: control ID + type badge + overall result badge + framework + metadata grid
4. Render control objective with blue left border
5. Tab bar: Evidence Log / Exceptions (with open count)
6. Evidence tab: table with result badges (inline styles for small badges OK)
7. Exceptions tab: table if `exceptions.length > 0`, else empty state div
8. `RiskBadge` helper used for exception risk column

## MDX Usage
```mdx
import { ITControlEvidence } from '@site/src/components/PageLayouts/wave5';

<ITControlEvidence
  controlId="ITGC-001"
  controlName="User Access Review — Production Systems"
  framework="SOX ITGC"
  controlObjective="Ensure only authorised personnel have access to production pipeline infrastructure."
  controlType="detective"
  frequency="quarterly"
  owner="Information Security Team"
  itgcDomain="Access Management"
  lastTested="2026-03-31"
  nextReview="2026-06-30"
  overallResult="effective"
  evidence={[
    { date: "2026-03-31", type: "Automated review", description: "IAM user access report generated", result: "pass", reviewer: "Carol Singh", artefact: "iam-report-q1-2026.csv" },
    { date: "2026-03-31", type: "Manual sign-off", description: "Access list reviewed by CISO", result: "pass", reviewer: "CISO" },
  ]}
  exceptions={[]}
/>
```

## Validation
- [ ] Overall result badge shows ✅/❌/⚪ correctly
- [ ] Both tabs switch correctly
- [ ] Empty exceptions tab shows "No exceptions" message (not an empty table)
- [ ] Open exception count shows in tab label when `exceptions` array is non-empty
- [ ] Dark mode: no white/cream backgrounds on card or table header (table header is navy — intentional)
