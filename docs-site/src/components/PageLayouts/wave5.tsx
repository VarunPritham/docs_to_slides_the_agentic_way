import React, { useState } from 'react';
import styles from './wave-styles.module.css';
import type { Attachment } from './wave6';
import { AttachmentPanel } from './wave6';

/* ─────────────────────────────────────────────────────────────────────────────
   WAVE 5 — COMPLIANCE & REGULATORY
   Components:
     • ChangeRequest     — CAB change record
     • IncidentPostMortem — PIR / post-incident review
     • SDLCGateChecklist — environment promotion gate
     • ITControlEvidence — SOX / audit control evidence log
───────────────────────────────────────────────────────────────────────────── */

// ── shared helpers ──────────────────────────────────────────────────────────

type Severity = 'critical' | 'high' | 'medium' | 'low';
type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#dc2626', high: '#ea580c', medium: '#d97706', low: '#16a34a',
};
const SEV_COLORS: Record<string, string> = {
  P1: '#dc2626', P2: '#ea580c', P3: '#d97706', P4: '#2563eb',
};

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={styles.badge}
      style={{ background: RISK_COLORS[level] + '18', color: RISK_COLORS[level], border: `1px solid ${RISK_COLORS[level]}40` }}>
      {level.toUpperCase()}
    </span>
  );
}

function StatusPill({ status, colorMap }: { status: string; colorMap: Record<string, string> }) {
  const color = colorMap[status] ?? '#64748b';
  return (
    <span className={styles.badge}
      style={{ background: color + '18', color, border: `1px solid ${color}40` }}>
      {status.replace(/-/g, ' ').toUpperCase()}
    </span>
  );
}

// ── ChangeRequest ────────────────────────────────────────────────────────────

interface CabApproval {
  approver: string;
  role: string;
  status: 'approved' | 'rejected' | 'pending';
  comment?: string;
  timestamp?: string;
}

interface ImplementationStep {
  step: number;
  action: string;
  owner: string;
  duration: string;
}

interface ChangeRequestProps {
  crId: string;
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
  attachments?: Attachment[];
}

const CR_STATUS_COLORS: Record<string, string> = {
  draft: '#64748b', 'pending-cab': '#d97706', approved: '#16a34a',
  rejected: '#dc2626', implemented: '#2563eb', 'rolled-back': '#9333ea',
};
const CR_TYPE_COLORS: Record<string, string> = {
  normal: '#4f46e5', standard: '#2563eb', emergency: '#dc2626',
};

export function ChangeRequest({
  crId, title, type, risk, status, requestor, implementor,
  scheduledStart, scheduledEnd, affectedServices,
  description, businessJustification, implementationSteps,
  testPlan, rollbackPlan, cabApprovals, attachments,
}: ChangeRequestProps) {
  const [tab, setTab] = useState<'details' | 'steps' | 'cab' | 'attachments'>('details');

  const approvedCount = cabApprovals.filter(a => a.status === 'approved').length;
  const rejectedCount = cabApprovals.filter(a => a.status === 'rejected').length;
  const hasAttachments = attachments && attachments.length > 0;

  return (
    <div className={styles.cr}>
      {/* Header */}
      <div className={styles.crHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span className={styles.crId}>{crId}</span>
          <span className={styles.badge} style={{
            background: CR_TYPE_COLORS[type] + '18', color: CR_TYPE_COLORS[type],
            border: `1px solid ${CR_TYPE_COLORS[type]}40`,
          }}>{type.toUpperCase()}{type === 'emergency' && ' 🚨'}</span>
          <RiskBadge level={risk} />
          <StatusPill status={status} colorMap={CR_STATUS_COLORS} />
        </div>
        <h3 className={styles.crTitle}>{title}</h3>
        <div className={styles.crMeta}>
          <span>🙋 {requestor}</span>
          <span>🔧 {implementor}</span>
          <span>🕐 {scheduledStart} → {scheduledEnd}</span>
          <span>🖥 {affectedServices.join(', ')}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        <button className={`${styles.tabBtn} ${tab === 'details' ? styles.tabActive : ''}`}
          onClick={() => setTab('details')}>📋 Details</button>
        <button className={`${styles.tabBtn} ${tab === 'steps' ? styles.tabActive : ''}`}
          onClick={() => setTab('steps')}>🔢 Implementation</button>
        <button className={`${styles.tabBtn} ${tab === 'cab' ? styles.tabActive : ''}`}
          onClick={() => setTab('cab')}>{`✅ CAB (${approvedCount}/${cabApprovals.length})`}</button>
        {hasAttachments && (
          <button className={`${styles.tabBtn} ${tab === 'attachments' ? styles.tabActive : ''}`}
            onClick={() => setTab('attachments')}>📎 Attachments ({attachments!.length})</button>
        )}
      </div>

      <div className={styles.crBody}>
        {tab === 'details' && (
          <div className={styles.crSections}>
            <div className={styles.crSection}>
              <div className={styles.sectionLabel}>Description</div>
              <div className={styles.sectionBody}>{description}</div>
            </div>
            <div className={styles.crSection}>
              <div className={styles.sectionLabel}>Business Justification</div>
              <div className={styles.sectionBody}>{businessJustification}</div>
            </div>
            <div className={styles.crSection}>
              <div className={styles.sectionLabel}>Test Plan</div>
              <div className={styles.sectionBody}>{testPlan}</div>
            </div>
            <div className={styles.crSection}>
              <div className={styles.sectionLabel}>Rollback Plan</div>
              <div className={styles.sectionBody} style={{ color: '#dc2626' }}>
                ⚠️ {rollbackPlan}
              </div>
            </div>
          </div>
        )}

        {tab === 'steps' && (
          <table className={styles.crTable}>
            <thead>
              <tr>
                <th>#</th><th>Action</th><th>Owner</th><th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {implementationSteps.map(s => (
                <tr key={s.step}>
                  <td><span className={styles.stepNum}>{s.step}</span></td>
                  <td>{s.action}</td>
                  <td>{s.owner}</td>
                  <td><code>{s.duration}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'cab' && (
          <div>
            {rejectedCount > 0 && (
              <div className={styles.cabAlert}>
                ❌ {rejectedCount} rejection(s) — change cannot proceed until resolved
              </div>
            )}
            {cabApprovals.map((a, i) => (
              <div key={i} className={styles.cabRow}>
                <div className={styles.cabLeft}>
                  <strong>{a.approver}</strong>
                  <span className={styles.cabRole}>{a.role}</span>
                </div>
                <div className={styles.cabRight}>
                  {a.comment && <div className={styles.cabComment}>"{a.comment}"</div>}
                  {a.timestamp && <div className={styles.cabTime}>{a.timestamp}</div>}
                  <StatusPill status={a.status} colorMap={{ approved: '#16a34a', rejected: '#dc2626', pending: '#d97706' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'attachments' && hasAttachments && (
          <AttachmentPanel files={attachments!} />
        )}
      </div>
    </div>
  );
}

// ── IncidentPostMortem ───────────────────────────────────────────────────────

interface TimelineEvent {
  timestamp: string;
  event: string;
  actor?: string;
  type?: 'detect' | 'escalate' | 'mitigate' | 'resolve' | 'action';
}

interface ActionItem {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  priority: 'p1' | 'p2' | 'p3';
  status: 'open' | 'in-progress' | 'done';
}

interface IncidentPostMortemProps {
  incidentId: string;
  title: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'draft' | 'in-review' | 'published';
  detectedAt: string;
  resolvedAt: string;
  duration: string;
  affectedServices: string[];
  customerImpact: string;
  summary: string;
  rootCause: string;
  contributingFactors: string[];
  timeline: TimelineEvent[];
  whatWentWell: string[];
  whatToImprove: string[];
  actionItems: ActionItem[];
  attachments?: Attachment[];
}

const TIMELINE_COLORS: Record<string, string> = {
  detect: '#dc2626', escalate: '#ea580c', mitigate: '#d97706',
  resolve: '#16a34a', action: '#2563eb',
};
const TIMELINE_ICONS: Record<string, string> = {
  detect: '🚨', escalate: '📣', mitigate: '🛠', resolve: '✅', action: '📋',
};
const AI_STATUS_COLORS: Record<string, string> = {
  open: '#dc2626', 'in-progress': '#d97706', done: '#16a34a',
};

export function IncidentPostMortem({
  incidentId, title, severity, status, detectedAt, resolvedAt, duration,
  affectedServices, customerImpact, summary, rootCause, contributingFactors,
  timeline, whatWentWell, whatToImprove, actionItems, attachments,
}: IncidentPostMortemProps) {
  const [tab, setTab] = useState<'summary' | 'timeline' | 'actions' | 'attachments'>('summary');
  const openActions = actionItems.filter(a => a.status !== 'done').length;
  const hasAttachments = attachments && attachments.length > 0;

  return (
    <div className={styles.pir}>
      {/* Header */}
      <div className={styles.pirHeader}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={styles.crId}>{incidentId}</span>
          <span className={styles.badge} style={{
            background: SEV_COLORS[severity] + '18', color: SEV_COLORS[severity],
            border: `1px solid ${SEV_COLORS[severity]}40`, fontSize: '0.8rem',
          }}>{severity}</span>
          <StatusPill status={status} colorMap={{ draft: '#64748b', 'in-review': '#d97706', published: '#16a34a' }} />
        </div>
        <h3 className={styles.crTitle}>{title}</h3>
        <div className={styles.crMeta}>
          <span>🕐 Detected: {detectedAt}</span>
          <span>✅ Resolved: {resolvedAt}</span>
          <span>⏱ Duration: <strong>{duration}</strong></span>
          <span>🖥 {affectedServices.join(', ')}</span>
        </div>
        <div className={styles.pirImpact}>👥 Customer Impact: {customerImpact}</div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        <button className={`${styles.tabBtn} ${tab === 'summary' ? styles.tabActive : ''}`}
          onClick={() => setTab('summary')}>📋 Analysis</button>
        <button className={`${styles.tabBtn} ${tab === 'timeline' ? styles.tabActive : ''}`}
          onClick={() => setTab('timeline')}>⏱ Timeline</button>
        <button className={`${styles.tabBtn} ${tab === 'actions' ? styles.tabActive : ''}`}
          onClick={() => setTab('actions')}>{`🎯 Actions (${openActions} open)`}</button>
        {hasAttachments && (
          <button className={`${styles.tabBtn} ${tab === 'attachments' ? styles.tabActive : ''}`}
            onClick={() => setTab('attachments')}>📎 Attachments ({attachments!.length})</button>
        )}
      </div>

      <div className={styles.crBody}>
        {tab === 'summary' && (
          <div className={styles.crSections}>
            <div className={styles.crSection}>
              <div className={styles.sectionLabel}>Executive Summary</div>
              <div className={styles.sectionBody}>{summary}</div>
            </div>
            <div className={styles.crSection}>
              <div className={styles.sectionLabel}>Root Cause</div>
              <div className={styles.sectionBody} style={{ borderLeft: '3px solid #dc2626', paddingLeft: 12 }}>
                {rootCause}
              </div>
            </div>
            <div className={styles.crSection}>
              <div className={styles.sectionLabel}>Contributing Factors</div>
              <ul className={styles.factorList}>
                {contributingFactors.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
            <div className={styles.retroGrid}>
              <div className={styles.retroCol} style={{ borderColor: '#16a34a40', background: '#16a34a08' }}>
                <div className={styles.sectionLabel} style={{ color: '#16a34a' }}>✅ What Went Well</div>
                <ul className={styles.factorList}>
                  {whatWentWell.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
              <div className={styles.retroCol} style={{ borderColor: '#ea580c40', background: '#ea580c08' }}>
                <div className={styles.sectionLabel} style={{ color: '#ea580c' }}>🔧 What to Improve</div>
                <ul className={styles.factorList}>
                  {whatToImprove.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === 'timeline' && (
          <div className={styles.timeline}>
            {timeline.map((e, i) => {
              const type = e.type ?? 'action';
              return (
                <div key={i} className={styles.timelineEvent}>
                  <div className={styles.timelineDot}
                    style={{ background: TIMELINE_COLORS[type] ?? '#64748b' }}>
                    {TIMELINE_ICONS[type] ?? '•'}
                  </div>
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineTs}>{e.timestamp}</span>
                    <span className={styles.timelineText}>{e.event}</span>
                    {e.actor && <span className={styles.timelineActor}>— {e.actor}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'actions' && (
          <table className={styles.crTable}>
            <thead>
              <tr><th>ID</th><th>Action Item</th><th>Owner</th><th>Due</th><th>Priority</th><th>Status</th></tr>
            </thead>
            <tbody>
              {actionItems.map(a => (
                <tr key={a.id}>
                  <td><code>{a.id}</code></td>
                  <td>{a.title}</td>
                  <td>{a.owner}</td>
                  <td>{a.dueDate}</td>
                  <td><RiskBadge level={a.priority as RiskLevel} /></td>
                  <td><StatusPill status={a.status} colorMap={AI_STATUS_COLORS} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'attachments' && hasAttachments && (
          <AttachmentPanel files={attachments!} />
        )}
      </div>
    </div>
  );
}

// ── SDLCGateChecklist ────────────────────────────────────────────────────────

type GateStatus = 'not-started' | 'in-progress' | 'passed' | 'blocked' | 'waived';
type CheckStatus = 'pass' | 'fail' | 'na' | 'pending';

interface GateCheck {
  check: string;
  status: CheckStatus;
  evidence?: string;
  blockerNote?: string;
}

interface Gate {
  id: string;
  label: string;
  status: GateStatus;
  approver?: string;
  approvedAt?: string;
  checks: GateCheck[];
}

interface SDLCGateChecklistProps {
  serviceId: string;
  serviceName: string;
  version: string;
  releaseDate: string;
  releaseManager: string;
  gates: Gate[];
}

const GATE_STATUS_COLORS: Record<GateStatus, string> = {
  'not-started': '#94a3b8', 'in-progress': '#2563eb',
  passed: '#16a34a', blocked: '#dc2626', waived: '#9333ea',
};
const CHECK_STATUS_COLORS: Record<CheckStatus, string> = {
  pass: '#16a34a', fail: '#dc2626', na: '#94a3b8', pending: '#d97706',
};
const CHECK_ICONS: Record<CheckStatus, string> = {
  pass: '✅', fail: '❌', na: '—', pending: '⏳',
};

export function SDLCGateChecklist({
  serviceId, serviceName, version, releaseDate, releaseManager, gates,
}: SDLCGateChecklistProps) {
  const [openGate, setOpenGate] = useState<string | null>(gates[0]?.id ?? null);
  const passedGates = gates.filter(g => g.status === 'passed').length;

  return (
    <div className={styles.sdlc}>
      {/* Header */}
      <div className={styles.sdlcHeader}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={styles.crId}>{serviceId}</span>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{serviceName}</span>
          <code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>{version}</code>
        </div>
        <div className={styles.crMeta}>
          <span>📅 Release: {releaseDate}</span>
          <span>🚀 Release Manager: {releaseManager}</span>
        </div>

        {/* Gate progress bar */}
        <div className={styles.sdlcProgress}>
          {gates.map(g => (
            <div key={g.id} className={styles.sdlcProgressSegment}
              title={g.label}
              style={{ background: GATE_STATUS_COLORS[g.status], flex: 1 }}>
              {g.status === 'passed' ? '✓' : g.status === 'blocked' ? '✗' : '…'}
            </div>
          ))}
        </div>
        <div className={styles.sdlcProgressLabel}>
          {passedGates} / {gates.length} gates passed
        </div>
      </div>

      {/* Gate accordion */}
      {gates.map(gate => {
        const isOpen = openGate === gate.id;
        const passCount = gate.checks.filter(c => c.status === 'pass').length;
        const failCount = gate.checks.filter(c => c.status === 'fail').length;
        return (
          <div key={gate.id} className={styles.gateBlock}>
            <button className={styles.gateHeader} onClick={() => setOpenGate(isOpen ? null : gate.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', display: 'inline-block',
                  background: GATE_STATUS_COLORS[gate.status], flexShrink: 0 }} />
                <strong>{gate.label}</strong>
                <StatusPill status={gate.status} colorMap={GATE_STATUS_COLORS} />
                {gate.approver && <span className={styles.gateApprover}>✅ {gate.approver} {gate.approvedAt && `· ${gate.approvedAt}`}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#16a34a' }}>✓ {passCount}</span>
                {failCount > 0 && <span style={{ color: '#dc2626' }}>✗ {failCount}</span>}
                <span>{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <div className={styles.gateBody}>
                <table className={styles.crTable}>
                  <thead>
                    <tr><th>Check</th><th>Status</th><th>Evidence / Note</th></tr>
                  </thead>
                  <tbody>
                    {gate.checks.map((c, i) => (
                      <tr key={i}>
                        <td>{c.check}</td>
                        <td>
                          <span style={{ color: CHECK_STATUS_COLORS[c.status] }}>
                            {CHECK_ICONS[c.status]}{' '}
                            <span className={styles.badge} style={{
                              background: CHECK_STATUS_COLORS[c.status] + '18',
                              color: CHECK_STATUS_COLORS[c.status],
                              border: `1px solid ${CHECK_STATUS_COLORS[c.status]}40`,
                            }}>{c.status.toUpperCase()}</span>
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: c.blockerNote ? '#dc2626' : undefined }}>
                          {c.blockerNote ? `⚠️ ${c.blockerNote}` : (c.evidence ?? '—')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── ITControlEvidence ────────────────────────────────────────────────────────

type ControlFrequency = 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
type EvidenceResult = 'pass' | 'fail' | 'exception' | 'not-tested';

interface EvidenceEntry {
  date: string;
  evidenceType: string;
  description: string;
  result: EvidenceResult;
  reviewer: string;
  artefact?: string;
}

interface ExceptionEntry {
  id: string;
  date: string;
  description: string;
  risk: RiskLevel;
  mitigatingControl: string;
  remediationDate: string;
  status: 'open' | 'remediated' | 'accepted';
}

interface ITControlEvidenceProps {
  controlId: string;
  controlName: string;
  framework: string;
  controlObjective: string;
  controlType: 'preventive' | 'detective' | 'corrective';
  frequency: ControlFrequency;
  owner: string;
  itgcDomain: string;
  lastTested: string;
  nextReview: string;
  overallResult: 'effective' | 'ineffective' | 'not-tested';
  evidence: EvidenceEntry[];
  exceptions: ExceptionEntry[];
  attachments?: Attachment[];
}

const EVIDENCE_COLORS: Record<EvidenceResult, string> = {
  pass: '#16a34a', fail: '#dc2626', exception: '#d97706', 'not-tested': '#94a3b8',
};
const CTRL_TYPE_COLORS: Record<string, string> = {
  preventive: '#2563eb', detective: '#9333ea', corrective: '#ea580c',
};
const OVERALL_COLORS: Record<string, string> = {
  effective: '#16a34a', ineffective: '#dc2626', 'not-tested': '#94a3b8',
};

export function ITControlEvidence({
  controlId, controlName, framework, controlObjective, controlType,
  frequency, owner, itgcDomain, lastTested, nextReview,
  overallResult, evidence, exceptions, attachments,
}: ITControlEvidenceProps) {
  const [tab, setTab] = useState<'evidence' | 'exceptions' | 'attachments'>('evidence');
  const openExceptions = exceptions.filter(e => e.status === 'open').length;
  const hasAttachments = attachments && attachments.length > 0;

  return (
    <div className={styles.itc}>
      {/* Header */}
      <div className={styles.itcHeader}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={styles.crId}>{controlId}</span>
          <span className={styles.badge} style={{
            background: CTRL_TYPE_COLORS[controlType] + '18',
            color: CTRL_TYPE_COLORS[controlType],
            border: `1px solid ${CTRL_TYPE_COLORS[controlType]}40`,
          }}>{controlType.toUpperCase()}</span>
          <span className={styles.badge} style={{
            background: OVERALL_COLORS[overallResult] + '18',
            color: OVERALL_COLORS[overallResult],
            border: `1px solid ${OVERALL_COLORS[overallResult]}40`,
            fontSize: '0.82rem',
          }}>{overallResult === 'effective' ? '✅' : overallResult === 'ineffective' ? '❌' : '⏳'} {overallResult.replace('-', ' ').toUpperCase()}</span>
          <span className={styles.badge} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
            {framework}
          </span>
        </div>
        <h3 className={styles.crTitle}>{controlName}</h3>
        <div className={styles.crMeta}>
          <span>📂 {itgcDomain}</span>
          <span>🔁 {frequency}</span>
          <span>👤 {owner}</span>
          <span>🔍 Last tested: {lastTested}</span>
          <span>📅 Next review: {nextReview}</span>
        </div>
        <div className={styles.itcObjective}>{controlObjective}</div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        <button className={`${styles.tabBtn} ${tab === 'evidence' ? styles.tabActive : ''}`}
          onClick={() => setTab('evidence')}>📎 Evidence Log ({evidence.length})</button>
        <button className={`${styles.tabBtn} ${tab === 'exceptions' ? styles.tabActive : ''}`}
          onClick={() => setTab('exceptions')}>
          ⚠️ Exceptions {openExceptions > 0 && `(${openExceptions} open)`}
        </button>
        {hasAttachments && (
          <button className={`${styles.tabBtn} ${tab === 'attachments' ? styles.tabActive : ''}`}
            onClick={() => setTab('attachments')}>📎 Attachments ({attachments!.length})</button>
        )}
      </div>

      <div className={styles.crBody}>
        {tab === 'evidence' && (
          <table className={styles.crTable}>
            <thead>
              <tr><th>Date</th><th>Type</th><th>Description</th><th>Result</th><th>Reviewer</th><th>Artefact</th></tr>
            </thead>
            <tbody>
              {evidence.map((e, i) => (
                <tr key={i}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{e.date}</td>
                  <td><code style={{ fontSize: '0.78rem' }}>{e.evidenceType}</code></td>
                  <td style={{ fontSize: '0.85rem' }}>{e.description}</td>
                  <td>
                    <span className={styles.badge} style={{
                      background: EVIDENCE_COLORS[e.result] + '18',
                      color: EVIDENCE_COLORS[e.result],
                      border: `1px solid ${EVIDENCE_COLORS[e.result]}40`,
                    }}>{e.result.replace('-', ' ').toUpperCase()}</span>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{e.reviewer}</td>
                  <td>
                    {e.artefact ? (
                      <a href={e.artefact} className={styles.apDownloadBtn} target="_blank" rel="noreferrer" download>
                        ↓ {e.artefact.split('/').pop()}
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'exceptions' && (
          exceptions.length === 0 ? (
            <div className={styles.emptyState}>✅ No exceptions logged for this control</div>
          ) : (
            <table className={styles.crTable}>
              <thead>
                <tr><th>ID</th><th>Date</th><th>Exception</th><th>Risk</th><th>Mitigating Control</th><th>Remediation</th><th>Status</th></tr>
              </thead>
              <tbody>
                {exceptions.map(ex => (
                  <tr key={ex.id}>
                    <td><code>{ex.id}</code></td>
                    <td style={{ fontSize: '0.8rem' }}>{ex.date}</td>
                    <td style={{ fontSize: '0.85rem' }}>{ex.description}</td>
                    <td><RiskBadge level={ex.risk} /></td>
                    <td style={{ fontSize: '0.82rem' }}>{ex.mitigatingControl}</td>
                    <td style={{ fontSize: '0.8rem' }}>{ex.remediationDate}</td>
                    <td><StatusPill status={ex.status} colorMap={{ open: '#dc2626', remediated: '#16a34a', accepted: '#9333ea' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {tab === 'attachments' && hasAttachments && (
          <AttachmentPanel files={attachments!} />
        )}
      </div>
    </div>
  );
}
