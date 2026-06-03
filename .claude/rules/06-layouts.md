# Docs-Site Page Layouts — Complete Reference

25 reusable React/TypeScript components for a bank tech team knowledge hub.
All live in `docs-site/src/components/PageLayouts/`.

---

## File Map

| Source file | CSS module | Exports |
|---|---|---|
| `index.tsx` | `styles.module.css` | 12 components |
| `wave5.tsx` | `wave-styles.module.css` | 4 components + 2 helpers |
| `wave6.tsx` | `wave-styles.module.css` | 5 components + 1 helper |

Import in any MDX file:
```mdx
import { MetaBlock, InfoPanel, RunbookStep } from '@site/src/components/PageLayouts';
import { ChangeRequest, IncidentPostMortem } from '@site/src/components/PageLayouts/wave5';
import { CodeWalkthrough, ArchitectureDiagram } from '@site/src/components/PageLayouts/wave6';
```

---

## WAVE 1–3 (index.tsx)

---

### 1. MetaBlock

**Purpose:** Standard page header. Every doc page should open with this.

**Props:**
```typescript
interface MetaBlockProps {
  owner: string;             // "Jane Smith"
  team?: string;             // "Platform SRE"
  status: 'draft' | 'review' | 'live' | 'deprecated' | 'incident';
  lastUpdated: string;       // "2026-06-02"
  reviewedBy?: string;       // "Priya Shah"
  tags?: string[];           // ['runbook', 'pipeline', 'p1']
}
```

**Renders:** Horizontal metadata bar — owner avatar (initials), team, coloured status badge, last updated date, reviewer, tag chips.

**Status badge colours:**
- `draft` → grey
- `review` → amber
- `live` → green
- `deprecated` → red/muted
- `incident` → red pulsing

**Dark mode:** Uses CSS variables throughout. No hardcoded backgrounds.

**Usage:**
```mdx
<MetaBlock owner="Jane Smith" team="SRE" status="live" lastUpdated="2026-06-02" tags={['runbook']} />
```

---

### 2. InfoPanel

**Purpose:** Callout box for warnings, tips, notes. Use to draw attention without breaking reading flow.

**Props:**
```typescript
interface InfoPanelProps {
  type?: 'info' | 'success' | 'warning' | 'danger' | 'note' | 'tip';
  title?: string;    // overrides default label
  children: ReactNode;
}
```

**Renders:** Left-bordered box with icon, bold label/title, body content.

**Type → icon + colour:**
- `info` → ℹ️ blue
- `success` → ✅ green
- `warning` → ⚠️ amber
- `danger` → 🚨 red
- `note` → 📝 purple
- `tip` → 💡 teal

**Dark mode:** CSS classes `.panelInfo/.panelDanger/...` with `[data-theme='dark']` overrides using `rgba()` backgrounds. Never inline `background`.

**Creation steps:**
1. Add type config entry in `panelConfig` map (icon, label, cls, color)
2. Add `.panel<Type>` CSS class in `styles.module.css` with light bg and border-left-color
3. Add `[data-theme='dark'] .panel<Type>` with `rgba(r,g,b,0.12)` background
4. Map cls in `InfoPanel` component via `styles[p.cls]`

---

### 3. ADR (Architecture Decision Record)

**Purpose:** Formal record of an architectural decision — why it was made, what was considered, and what the consequences are.

**Props:**
```typescript
interface ADRProps {
  id: string;           // "001"
  title: string;        // "Use LangGraph for pipeline orchestration"
  date: string;         // "2026-03-15"
  status: 'proposed' | 'accepted' | 'superseded' | 'deprecated';
  deciders: string[];   // ["Alice", "Bob"]
  context: ReactNode;
  decision: ReactNode;
  consequences: ReactNode;
  alternatives?: { option: string; reason: string }[];
}
```

**Renders:** Bordered card with:
- Header: `ADR-{id}` chip + status badge
- Title (h2)
- Meta: date + deciders
- Sections: Context / Decision / Alternatives (grid) / Consequences
- Each section has labelled separator

**No tabs.** All content visible at once.

**Creation steps:**
1. Define props interface
2. Add `adrStatus` colour map (`proposed/accepted/superseded/deprecated`)
3. Render header, title, meta row, loop `adrSection` divs for context/decision/consequences
4. Conditionally render `.altGrid` for alternatives array
5. CSS: `.adr`, `.adrHeader`, `.adrId`, `.adrTitle`, `.adrMeta`, `.adrSection`, `.adrSectionLabel`, `.altGrid`, `.altCard`

---

### 4. RunbookStep

**Purpose:** A single numbered step in an operational runbook. Combine 5–12 of these in sequence for a full runbook.

**Props:**
```typescript
interface RunbookStepProps {
  step: number;
  title: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  children: ReactNode;   // explanation, expected output
  command?: string;      // shell command to copy-paste
}
```

**Renders:**
- Left-bordered card (colour = severity)
- Row: step number circle + title + optional severity badge
- Body: children
- Optional command block: dark terminal `$ command` with 📋 copy button

**Severity → left border + bg:**
- `low` → green / `.sevLow`
- `medium` → amber / `.sevMedium`
- `high` → orange / `.sevHigh`
- `critical` → red / `.sevCritical`

**Dark mode:** CSS classes `.sevLow/.sevMedium/...` with `[data-theme='dark']` `rgba()` overrides. The `command` block is always dark (`background: #1e293b`) — no mode issue.

**Creation steps:**
1. Define severity CSS classes in `styles.module.css` (border-left-color + background)
2. Add `[data-theme='dark']` variants with `rgba()` backgrounds
3. Map severity → className in component via `severityClsMap`
4. Render step circle (navy bg), title, badge (inline style for badge colours is OK — badge is small)
5. Render `commandBlock` div with monospace code + clipboard button

---

### 5. ApiTryIt

**Purpose:** Inline API request tester. Lets readers fire a real request without leaving the docs page.

**Props:**
```typescript
interface ApiTryItProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  body?: object;
  description?: string;
}
```

**State:** `response: string | null`, `loading: boolean`, `error: string | null`

**Renders:** Method badge (coloured by verb) + URL + optional description + body preview + "Send" button. On click: shows loading spinner, then JSON response or error.

**Creation steps:**
1. `useState` for response/loading/error
2. `onClick` handler: `fetch(url, {method, headers, body: JSON.stringify(body)})`
3. Render method badge (GET=green, POST=blue, PUT=amber, DELETE=red, PATCH=purple)
4. Render response in dark code block, error in red box

---

### 6. ServiceDashboard

**Purpose:** Real-time service health overview. Use on status pages or incident docs.

**Props:**
```typescript
type ServiceHealth = 'operational' | 'degraded' | 'outage' | 'maintenance';

interface Service {
  name: string;
  health: ServiceHealth;
  latency?: string;   // "42ms"
  uptime?: string;    // "99.98%"
  note?: string;
}

interface ServiceDashboardProps {
  services: Service[];
  lastChecked?: string;
}
```

**Renders:** Overall status header (green dot "All operational" OR amber/red "Some affected") + service list with colour-coded health dots + latency/uptime metrics.

**Health → colour:** operational=green, degraded=amber, outage=red, maintenance=blue

---

### 7. MeetingNotes

**Props:**
```typescript
interface ActionItem { owner: string; task: string; due: string; done?: boolean; }
interface MeetingNotesProps {
  date: string;
  attendees: string[];
  facilitator: string;
  children: ReactNode;
  actionItems?: ActionItem[];
}
```

**Renders:** Metadata row (📅 date, 🎙 facilitator, 👥 attendees count), body content, action items section with ✅/⬜ status, @owner, due date.

---

### 8. TeamGrid / TeamCard

**Props:**
```typescript
interface TeamMember {
  name: string; role: string; team: string;
  timezone?: string; oncall?: boolean;
  slack?: string; email?: string; avatar?: string;
}
interface TeamGridProps { members: TeamMember[]; }
```

**Renders:** Responsive card grid. Each card: circular avatar (initials or image) with optional on-call green dot, name, role, team, timezone emoji, Slack/email links.

---

### 9. DecisionTable

**Props:**
```typescript
interface DecisionOption { name: string; pros: string[]; cons: string[]; chosen?: boolean; }
interface DecisionTableProps { options: DecisionOption[]; }
```

**Renders:** Column-per-option comparison table with option name, ✅ pros list, ❌ cons list. Chosen option gets blue highlight border.

---

### 10. RetroBoard

**Props:**
```typescript
type RetroCategory = 'start' | 'stop' | 'continue' | 'action';
interface RetroItem { text: string; votes?: number; }
interface RetroBoardProps {
  items: Partial<Record<RetroCategory, RetroItem[]>>;
}
```

**Renders:** 4-column board: 🚀 Start (green) / 🛑 Stop (red) / 🔄 Continue (blue) / ⚡ Action (amber). Each item has optional 👍 vote count.

---

### 11. OnCallRota

**Props:**
```typescript
interface OnCallEntry { name: string; week: string; start: string; end: string; primary?: boolean; }
interface OnCallRotaProps { entries: OnCallEntry[]; escalation?: string; }
```

**Renders:** On-call schedule list with 🟢 status dot, week label, name, date range, "Current" badge for primary.

---

## WAVE 5 — Compliance & Governance (wave5.tsx)

---

### 12. ChangeRequest

**Purpose:** CAB change management record. Full CR lifecycle from submission to implementation.

**Props:**
```typescript
interface ChangeRequestProps {
  crId: string;                    // "CR-2026-0142"
  title: string;
  type: 'normal' | 'standard' | 'emergency';
  risk: 'critical' | 'high' | 'medium' | 'low';
  status: 'draft' | 'pending-cab' | 'approved' | 'rejected' | 'implemented' | 'rolled-back';
  requestor: string;
  implementor: string;
  scheduledStart: string;          // ISO datetime
  scheduledEnd: string;
  affectedServices: string[];
  description: string;
  businessJustification: string;
  implementationSteps: {
    step: number; action: string; owner: string; duration: string;
  }[];
  testPlan: string;
  rollbackPlan: string;
  cabApprovals: {
    approver: string; role: string;
    status: 'approved' | 'rejected' | 'pending';
    comment?: string; timestamp?: string;
  }[];
}
```

**Renders:**
- Header: CR-ID chip, type badge (🚨 for emergency), risk + status pills
- Title, metadata row (requestor/implementor/schedule/services)
- **3 tabs:**
  - `Details` — description, business justification, test plan, rollback plan (prose)
  - `Implementation` — table: step / action / owner / duration
  - `CAB` — rejection alert if any, list of approvers with status/comment/timestamp

**State:** `tab: 'details' | 'steps' | 'cab'`

**Creation steps:**
1. Define all interfaces (`ImplementationStep`, `CabApproval`)
2. `useState` for active tab
3. Render header section: CR-ID + type badge + risk/status pills
4. Render tab bar (3 buttons with active class)
5. Render tab content conditionally
6. CSS: `.cr`, `.crHeader`, `.crId`, `.crMeta`, `.tabBar`, `.tabBtn`, `.tabActive`, `.crBody`, `.crTable`, `.cabRow`

---

### 13. IncidentPostMortem

**Purpose:** Post-Incident Review (PIR). Complete blameless postmortem with timeline and action items.

**Props:**
```typescript
interface TimelineEvent {
  time: string; type: 'detect' | 'escalate' | 'mitigate' | 'resolve' | 'action';
  actor: string; description: string;
}
interface ActionItem {
  id: string; title: string; owner: string; due: string;
  priority: 'high' | 'medium' | 'low'; status: 'open' | 'in-progress' | 'done';
}
interface IncidentPostMortemProps {
  incidentId: string; title: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'draft' | 'in-review' | 'published';
  detectedAt: string; resolvedAt: string; duration: string;
  affectedServices: string[]; customerImpact: string;
  summary: string; rootCause: string;
  contributingFactors: string[];
  timeline: TimelineEvent[];
  whatWentWell: string[]; whatToImprove: string[];
  actionItems: ActionItem[];
}
```

**Renders:**
- Header: incident ID, severity badge, status pill, detected/resolved/duration, services, customer impact
- **3 tabs:**
  - `Analysis` — summary, root cause (red left border), contributing factors, 2-col retro grid (went well / to improve)
  - `Timeline` — vertical timeline: coloured dot per event type, actor, time, description
  - `Actions` — table: ID / title / owner / due / priority / status; count of open items in tab label

**State:** `tab: 'summary' | 'timeline' | 'actions'`

**Timeline event colours:** detect=blue, escalate=amber, mitigate=teal, resolve=green, action=purple

**Creation steps:**
1. Define `TimelineEvent`, `ActionItem` interfaces
2. `useState` for tab
3. Render severity badge (P1=red, P2=orange, P3=amber, P4=blue)
4. Render 3 tab contents with conditional display
5. Timeline: map events to vertical `timeline` div, each with coloured dot + content
6. CSS: `.pir`, `.pirHeader`, `.pirImpact`, `.timeline`, `.timelineEvent`

---

### 14. SDLCGateChecklist

**Purpose:** Release gate tracker. Shows which SDLC phases (security, testing, CAB, etc.) have passed before a deploy.

**Props:**
```typescript
type GateStatus = 'not-started' | 'in-progress' | 'passed' | 'blocked' | 'waived';
type CheckStatus = 'pass' | 'fail' | 'na' | 'pending';

interface Check { name: string; status: CheckStatus; evidence?: string; }
interface Gate {
  id: string; label: string; status: GateStatus;
  approver?: string; approvedAt?: string;
  checks: Check[];
}
interface SDLCGateChecklistProps {
  serviceId: string; serviceName: string;
  version: string; releaseDate: string; releaseManager: string;
  gates: Gate[];
}
```

**Renders:**
- Header: service ID / name / version / release date / manager
- Segmented progress bar (one segment per gate, coloured by status)
- Accordion of gates — header: status dot + label + status pill + approver; body: check table

**State:** `openGate: string | null` (accordion open/close)

**Gate status → colour:** passed=green, in-progress=blue, blocked=red, waived=grey, not-started=grey

**Creation steps:**
1. Define Gate/Check interfaces
2. `useState` for `openGate`
3. Render progress bar: `gates.map()` → flex segments with colour classes
4. Render accordion: click toggles `openGate` state
5. CSS: `.sdlc`, `.sdlcProgress`, `.gateBlock`, `.gateHeader`

---

### 15. ITControlEvidence

**Purpose:** IT General Controls (ITGC) / SOX audit evidence log. Maps controls to test results and exceptions.

**Props:**
```typescript
interface EvidenceEntry {
  date: string; type: string; description: string;
  result: 'pass' | 'fail' | 'exception' | 'not-tested';
  reviewer: string; artefact?: string;
}
interface ExceptionEntry {
  id: string; date: string; description: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  mitigation: string; remediation: string;
  status: string;
}
interface ITControlEvidenceProps {
  controlId: string; controlName: string;
  framework: string;           // "SOX ITGC", "ISO 27001"
  controlObjective: string;
  controlType: 'preventive' | 'detective' | 'corrective';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  owner: string; itgcDomain: string;
  lastTested: string; nextReview: string;
  overallResult: 'effective' | 'ineffective' | 'not-tested';
  evidence: EvidenceEntry[];
  exceptions: ExceptionEntry[];
}
```

**Renders:**
- Header: control ID, control type badge, overall result badge (✅/❌), framework tag, metadata
- Control objective statement
- **2 tabs:**
  - `Evidence Log` — table: date / type / description / result badge / reviewer / artefact link
  - `Exceptions` — table if any, else "No exceptions" empty state; count in tab label

**State:** `tab: 'evidence' | 'exceptions'`

**Creation steps:**
1. Define `EvidenceEntry`, `ExceptionEntry` interfaces
2. `useState` for tab
3. Render overall result badge with emoji
4. Evidence table with result-coloured badges
5. Exceptions table with risk-coloured badge using `RiskBadge` helper
6. CSS: `.itc`, `.itcHeader`, `.itcObjective`

---

## WAVE 6 — Docs as Code (wave6.tsx)

---

### 16. CodeWalkthrough

**Purpose:** Guided code tour for knowledge transfer. Readers click through stops as if reading a tutorial.

**Props:**
```typescript
interface WalkthroughStop {
  id: string; title: string; file: string;
  lines?: string;           // "42–67"
  language: string;
  code: string;
  explanation: string;
  whyItMatters?: string;
  relatedStops?: string[];  // stop IDs
}
interface CodeWalkthroughProps {
  title: string; repo: string;
  estimatedMinutes: number;
  stops: WalkthroughStop[];
}
```

**State:** `currentStop: number` (index)

**Renders:**
- Header: section label, title, ⏱ time estimate, progress (X of N)
- Progress dots row (clickable, filled up to current)
- Stop card: "Stop N of M", title, FileBreadcrumb (file + lines), 🔗 View in repo button
- Code block (dark: `background: #0f172a`)
- Explanation text
- Optional `whyItMatters` highlighted box (sky blue left border)
- Optional related stops as chip links
- Navigation: ← Previous / Next → buttons

**Creation steps:**
1. `useState` for `currentStop`
2. Render progress dots: map stops, click sets current
3. Render stop card with FileBreadcrumb helper
4. Code block: `<pre className={styles.codeBlock}>` with copy button
5. Conditional `whyItMatters` box
6. Previous/Next nav buttons (disabled at bounds)
7. Jump dropdown: `<select>` mapping stop titles
8. CSS: `.fileBreadcrumb`, `.walkthroughCard`, `.codeBlock` (always dark bg)

---

### 17. ChangelogPage

**Purpose:** Structured release history browser. Better than a plain CHANGELOG.md.

**Props:**
```typescript
type ChangeType = 'feat' | 'fix' | 'breaking' | 'deprecated' | 'perf' | 'docs' | 'chore';
type ReleaseStatus = 'latest' | 'stable' | 'deprecated' | 'yanked';

interface ChangeItem { type: ChangeType; text: string; pr?: string; author?: string; }
interface Release {
  version: string; date: string; status: ReleaseStatus;
  summary?: string; changes: ChangeItem[];
}
interface ChangelogPageProps { repoUrl: string; releases: Release[]; }
```

**State:** `filter: 'all' | 'latest' | 'breaking'`

**Renders:**
- Header + filter chips: All / Latest & Stable / Breaking changes
- Filtered release cards: version + status badge + date + optional summary
- Changes grouped by type (feat/fix/breaking...) with coloured badge + list

**ChangeType → label + colour:** feat=blue(✨), fix=green(🐛), breaking=red(💥), deprecated=amber(⚠️), perf=purple(⚡), docs=teal(📝), chore=grey(🔧)

**Creation steps:**
1. `changeTypeConfig` map (label, icon, colour)
2. `useState` for filter
3. Filter releases: 'latest' keeps `status: 'latest'|'stable'`; 'breaking' keeps releases with ≥1 breaking change
4. Render filter chips, release cards, change-type groups
5. CSS: `.clCard`, `.clVersion`, `.clStatus`, `.clChanges`

---

### 18. EnvironmentReference

**Purpose:** Self-documenting environment variable reference. Replaces a README table with search, filtering, and secret masking.

**Props:**
```typescript
type EnvVarType = 'string' | 'url' | 'boolean' | 'number' | 'enum';
interface EnvVar {
  name: string; required: boolean; type: EnvVarType;
  default?: string; example?: string; description: string;
  service?: string; enumValues?: string[]; secret?: boolean;
}
interface EnvironmentReferenceProps { service: string; configFile?: string; variables: EnvVar[]; }
```

**State:** `search: string`, `requiredOnly: boolean`, `secretOnly: boolean`, `revealed: Set<string>`

**Renders:**
- Header: service name, counts (X required / Y optional), optional config file chip
- Search input + toggle checkboxes (Required only / Secrets only)
- Table: Name / Required / Type / Default / Example (masked if secret, eye-toggle reveal) / Description
- Empty state if no matches

**Secret masking:** example shows `••••••••` by default; eye button adds name to `revealed` Set.

**Creation steps:**
1. 4× `useState` for search/requiredOnly/secretOnly/revealed
2. Filter pipeline: search matches name/description, required filter, secret filter
3. Render table with conditional masking logic
4. Eye toggle button updates `revealed` Set (immutable update: `new Set([...prev, name])`)
5. CSS: `.erTable`, `.erSearch`, `.erToggles`

---

### 19. ArchitectureDiagram

**Purpose:** Mermaid architecture diagram embedded in a docs page with metadata and version info.

**Props:**
```typescript
type DiagramType = 'flowchart' | 'sequence' | 'er' | 'class' | 'gantt' | 'mindmap';
interface ArchitectureDiagramProps {
  title: string; description: string;
  diagramType: DiagramType;
  owner: string; lastUpdated: string;
  sourceFile?: string; repoUrl?: string;
  mermaid: string;   // full Mermaid diagram source
}
```

**State:** `showSource: boolean` (for collapsible raw source)

**Renders:**
- Header: section label, title, description, diagram type badge, owner, last updated, optional source link
- `<Mermaid value={mermaid} />` (from `@docusaurus/theme-mermaid`) — adapts to dark/light mode via `themeConfig.mermaid`
- Collapsible `<details>` with raw Mermaid source

**Dark mode requirement:**
- `docusaurus.config.ts` must have `themeConfig.mermaid: { theme: { light: 'neutral', dark: 'dark' } }`
- `.adDiagramWrapper` must use `background: transparent` (not `white`)
- Global CSS override: `[data-theme='dark'] .docusaurus-mermaid-container svg { background: transparent }`

**Creation steps:**
1. `// @ts-ignore` import: `import Mermaid from '@theme/Mermaid';`
2. Install `@docusaurus/theme-mermaid` and add to `themes[]` in `docusaurus.config.ts`
3. Add `markdown: { mermaid: true }` to config
4. Add `mermaid: { theme: { light: 'neutral', dark: 'dark' } }` to `themeConfig`
5. Render `<Mermaid value={mermaid} />` inside `.adDiagramWrapper` div
6. CSS: `.adContainer`, `.adMeta`, `.adDiagramWrapper { background: transparent }`, `.adDetails`

---

### 20. CodeSnippetLibrary

**Purpose:** Searchable, tagged code snippet gallery. Replaces a static code block with a discoverable pattern library.

**Props:**
```typescript
interface Snippet {
  id: string; title: string; description: string;
  language: string; tags: string[];
  whenToUse: string; code: string;
  author?: string; addedDate?: string;
}
interface CodeSnippetLibraryProps { snippets: Snippet[]; }
```

**State:** `search: string`, `activeTags: Set<string>`, `copied: string | null`, `expandedWhenToUse: Set<string>`

**Renders:**
- Header: section label, search input, result count
- Tag filter chips (all unique tags from snippets, toggleable)
- Snippet card grid: title + description + language badge, tags, collapsible "When to use", code block + copy button
- Copy button shows "✓ Copied" for 2 seconds then resets
- Empty state if no matches

**Filter logic:** Search by `title + description + language` OR active tags (OR logic across selected tags).

**Creation steps:**
1. Extract all unique tags from snippets: `[...new Set(snippets.flatMap(s => s.tags))]`
2. 4× `useState` for search/activeTags/copied/expandedWhenToUse
3. Filter: `filteredSnippets = snippets.filter(s => matchesSearch && matchesTags)`
4. Copy handler: `navigator.clipboard.writeText(code)` + `setCopied(id)` + `setTimeout(() => setCopied(null), 2000)`
5. Tag toggle: `setActiveTags(prev => prev.has(t) ? new Set([...prev].filter(x=>x!==t)) : new Set([...prev, t]))`
6. CSS: `.cslHeader`, `.cslTagChips`, `.cslTagChip/.cslTagChipActive`, `.cslGrid`, `.cslCard`, `.cslCopyBtn/.cslCopyBtnCopied`

---

## CSS Rules for All Layouts

### The Three Laws

1. **Never hardcode light hex colours as inline React styles for backgrounds** — they bypass dark mode. Use CSS module classes instead.
2. **Every colour-coded variant** (severity, type, status) must have a `[data-theme='dark']` override in the CSS module using `rgba()` at 10–15% opacity.
3. **Code blocks are always dark** — `background: #0f172a` (or equivalent) regardless of mode. This is intentional.

### CSS Variable Palette

```css
/* Light-mode defaults — set in custom.css :root */
--ifm-color-primary:         #00AEEF;   /* Sky Blue */
--brand-navy:                #003087;   /* Deep Navy */
--brand-navy-mid:            #004aad;
--brand-blue:                #00AEEF;
--brand-blue-light:          #e0f6fe;
--surface-1:                 #f4f7fb;
--surface-2:                 #e8f0fb;
--border-color:              #d0dbe8;
--text-muted:                #4a5568;
```

### Adding a New Colour-Coded Variant

```css
/* In styles.module.css or wave-styles.module.css */
.sevNew      { border-left-color: #7c3aed; background: #f5f3ff; }
[data-theme='dark'] .sevNew { background: rgba(124, 58, 237, 0.12); }
```

```tsx
// In the component
const sevClsMap = { ..., new: 'sevNew' };
<div className={`${styles.step} ${styles[sevClsMap[severity]]}`}>
```

---

## Layout Decision Guide

| I need to show... | Use |
|---|---|
| Page metadata (owner, status, date) | `MetaBlock` |
| A callout or warning | `InfoPanel` |
| A technical decision record | `ADR` + `DecisionTable` |
| An incident runbook | `RunbookStep` (×N) + `InfoPanel` |
| Live API testing | `ApiTryIt` |
| Service health | `ServiceDashboard` |
| A retrospective | `RetroBoard` |
| Team directory | `TeamGrid` |
| On-call schedule | `OnCallRota` |
| A change request (CAB) | `ChangeRequest` |
| Post-incident review | `IncidentPostMortem` |
| Release gate status | `SDLCGateChecklist` |
| Audit evidence | `ITControlEvidence` |
| Code KT walkthrough | `CodeWalkthrough` |
| Release history | `ChangelogPage` |
| Environment variables | `EnvironmentReference` |
| Architecture diagram | `ArchitectureDiagram` |
| Code patterns / snippets | `CodeSnippetLibrary` |
