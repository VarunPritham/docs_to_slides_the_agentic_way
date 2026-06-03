/**
 * PageLayouts — reusable Confluence-style components for a tech-team knowledge hub.
 * Import any of these in your .mdx files.
 */
import React, { useState, type ReactNode } from 'react';
import styles from './styles.module.css';

/* ================================================================
   META BLOCK — page header with owner / status / dates
   ================================================================ */
type PageStatus = 'draft' | 'review' | 'live' | 'deprecated' | 'incident';

interface MetaBlockProps {
  owner: string;
  team?: string;
  status: PageStatus;
  lastUpdated: string;
  reviewedBy?: string;
  tags?: string[];
}

const statusConfig: Record<PageStatus, { label: string; color: string; bg: string }> = {
  draft:      { label: 'Draft',      color: '#92400e', bg: '#fef3c7' },
  review:     { label: 'In Review',  color: '#1e40af', bg: '#dbeafe' },
  live:       { label: 'Live',       color: '#065f46', bg: '#d1fae5' },
  deprecated: { label: 'Deprecated', color: '#6b7280', bg: '#f3f4f6' },
  incident:   { label: 'Incident',   color: '#991b1b', bg: '#fee2e2' },
};

export function MetaBlock({ owner, team, status, lastUpdated, reviewedBy, tags }: MetaBlockProps) {
  const s = statusConfig[status];
  return (
    <div className={styles.metaBlock}>
      <div className={styles.metaRow}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Owner</span>
          <span className={styles.metaValue}>
            <span className={styles.avatar}>{owner[0]}</span> {owner}
          </span>
        </div>
        {team && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Team</span>
            <span className={styles.metaValue}>{team}</span>
          </div>
        )}
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Status</span>
          <span className={styles.statusBadge} style={{ color: s.color, background: s.bg }}>
            {s.label}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Last updated</span>
          <span className={styles.metaValue}>{lastUpdated}</span>
        </div>
        {reviewedBy && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Reviewed by</span>
            <span className={styles.metaValue}>{reviewedBy}</span>
          </div>
        )}
      </div>
      {tags && tags.length > 0 && (
        <div className={styles.tagRow}>
          {tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   INFO PANEL — coloured callout box (Confluence "info macro")
   ================================================================ */
type PanelType = 'info' | 'success' | 'warning' | 'danger' | 'note' | 'tip';

const panelConfig: Record<PanelType, { icon: string; label: string; cls: string; color: string }> = {
  info:    { icon: 'ℹ️', label: 'Info',    cls: 'panelInfo',    color: '#1e40af' },
  success: { icon: '✅', label: 'Success', cls: 'panelSuccess', color: '#166534' },
  warning: { icon: '⚠️', label: 'Warning', cls: 'panelWarning', color: '#92400e' },
  danger:  { icon: '🚨', label: 'Danger',  cls: 'panelDanger',  color: '#991b1b' },
  note:    { icon: '📝', label: 'Note',    cls: 'panelNote',    color: '#5b21b6' },
  tip:     { icon: '💡', label: 'Tip',     cls: 'panelTip',     color: '#0f766e' },
};

export function InfoPanel({ type = 'info', title, children }: { type?: PanelType; title?: string; children: ReactNode }) {
  const p = panelConfig[type];
  return (
    <div className={`${styles.infoPanel} ${styles[p.cls]}`}>
      <div className={styles.infoPanelHeader} style={{ color: p.color }}>
        <span>{p.icon}</span>
        <strong>{title ?? p.label}</strong>
      </div>
      <div className={styles.infoPanelBody}>{children}</div>
    </div>
  );
}

/* ================================================================
   ADR — Architecture Decision Record
   ================================================================ */
interface ADRProps {
  id: string;
  title: string;
  date: string;
  status: 'proposed' | 'accepted' | 'superseded' | 'deprecated';
  deciders: string[];
  context: ReactNode;
  decision: ReactNode;
  consequences: ReactNode;
  alternatives?: { option: string; reason: string }[];
}

const adrStatus: Record<ADRProps['status'], { label: string; color: string; bg: string }> = {
  proposed:   { label: 'Proposed',   color: '#1e40af', bg: '#dbeafe' },
  accepted:   { label: 'Accepted',   color: '#065f46', bg: '#d1fae5' },
  superseded: { label: 'Superseded', color: '#6b7280', bg: '#f3f4f6' },
  deprecated: { label: 'Deprecated', color: '#92400e', bg: '#fef3c7' },
};

export function ADR({ id, title, date, status, deciders, context, decision, consequences, alternatives }: ADRProps) {
  const s = adrStatus[status];
  return (
    <div className={styles.adr}>
      <div className={styles.adrHeader}>
        <div className={styles.adrId}>ADR-{id}</div>
        <span className={styles.statusBadge} style={{ color: s.color, background: s.bg }}>{s.label}</span>
      </div>
      <h2 className={styles.adrTitle}>{title}</h2>
      <div className={styles.adrMeta}>
        <span>📅 {date}</span>
        <span>👥 {deciders.join(', ')}</span>
      </div>
      <div className={styles.adrSection}>
        <div className={styles.adrSectionLabel}>Context</div>
        <div>{context}</div>
      </div>
      <div className={styles.adrSection}>
        <div className={styles.adrSectionLabel}>Decision</div>
        <div>{decision}</div>
      </div>
      {alternatives && alternatives.length > 0 && (
        <div className={styles.adrSection}>
          <div className={styles.adrSectionLabel}>Alternatives Considered</div>
          <div className={styles.altGrid}>
            {alternatives.map(a => (
              <div key={a.option} className={styles.altCard}>
                <div className={styles.altOption}>{a.option}</div>
                <div className={styles.altReason}>{a.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={styles.adrSection}>
        <div className={styles.adrSectionLabel}>Consequences</div>
        <div>{consequences}</div>
      </div>
    </div>
  );
}

/* ================================================================
   RUNBOOK STEP — numbered incident/ops steps
   ================================================================ */
interface RunbookStepProps {
  step: number;
  title: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  children: ReactNode;
  command?: string;
}

const severityClsMap: Record<string, string> = {
  low: 'sevLow', medium: 'sevMedium', high: 'sevHigh', critical: 'sevCritical',
};
const severityBadgeColors = {
  low:      { badge: '#d1fae5', badgeText: '#065f46' },
  medium:   { badge: '#fef3c7', badgeText: '#92400e' },
  high:     { badge: '#ffedd5', badgeText: '#9a3412' },
  critical: { badge: '#fee2e2', badgeText: '#991b1b' },
};

export function RunbookStep({ step, title, severity, children, command }: RunbookStepProps) {
  const sevCls = severity ? styles[severityClsMap[severity]] : '';
  const badge = severity ? severityBadgeColors[severity] : null;
  return (
    <div className={`${styles.runbookStep} ${sevCls}`}>
      <div className={styles.runbookStepHeader}>
        <div className={styles.stepCircle}>{step}</div>
        <div className={styles.runbookStepTitle}>{title}</div>
        {severity && badge && (
          <span className={styles.severityBadge} style={{ background: badge.badge, color: badge.badgeText }}>
            {severity.toUpperCase()}
          </span>
        )}
      </div>
      <div className={styles.runbookStepBody}>{children}</div>
      {command && (
        <div className={styles.commandBlock}>
          <span className={styles.commandPrompt}>$</span>
          <code className={styles.commandText}>{command}</code>
          <button
            className={styles.copyBtn}
            onClick={() => navigator.clipboard.writeText(command)}
            title="Copy command"
          >
            📋
          </button>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   SERVICE STATUS DASHBOARD
   ================================================================ */
type ServiceHealth = 'operational' | 'degraded' | 'outage' | 'maintenance';

interface Service {
  name: string;
  health: ServiceHealth;
  latency?: string;
  uptime?: string;
  note?: string;
}

const healthConfig: Record<ServiceHealth, { label: string; color: string; dot: string }> = {
  operational: { label: 'Operational',  color: '#065f46', dot: '#22c55e' },
  degraded:    { label: 'Degraded',     color: '#92400e', dot: '#f59e0b' },
  outage:      { label: 'Outage',       color: '#991b1b', dot: '#ef4444' },
  maintenance: { label: 'Maintenance',  color: '#1e40af', dot: '#3b82f6' },
};

export function ServiceDashboard({ services, lastChecked }: { services: Service[]; lastChecked?: string }) {
  const allOk = services.every(s => s.health === 'operational');
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <div className={styles.dashboardStatus}>
          <span className={styles.dashDot} style={{ background: allOk ? '#22c55e' : '#f59e0b' }} />
          <strong>{allOk ? 'All systems operational' : 'Some systems affected'}</strong>
        </div>
        {lastChecked && <span className={styles.dashChecked}>Checked {lastChecked}</span>}
      </div>
      <div className={styles.serviceList}>
        {services.map(svc => {
          const h = healthConfig[svc.health];
          return (
            <div key={svc.name} className={styles.serviceRow}>
              <div className={styles.serviceLeft}>
                <span className={styles.serviceDot} style={{ background: h.dot }} />
                <span className={styles.serviceName}>{svc.name}</span>
                {svc.note && <span className={styles.serviceNote}>{svc.note}</span>}
              </div>
              <div className={styles.serviceRight}>
                {svc.latency && <span className={styles.serviceMetric}>{svc.latency}</span>}
                {svc.uptime  && <span className={styles.serviceMetric}>{svc.uptime} uptime</span>}
                <span className={styles.healthLabel} style={{ color: h.color }}>{h.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   MEETING NOTES
   ================================================================ */
interface MeetingNotesProps {
  date: string;
  attendees: string[];
  facilitator: string;
  children: ReactNode;
  actionItems?: { owner: string; task: string; due: string; done?: boolean }[];
}

export function MeetingNotes({ date, attendees, facilitator, children, actionItems }: MeetingNotesProps) {
  return (
    <div className={styles.meeting}>
      <div className={styles.meetingHeader}>
        <div className={styles.meetingMeta}>
          <span>📅 {date}</span>
          <span>🎙 {facilitator}</span>
          <span>👥 {attendees.join(' · ')}</span>
        </div>
      </div>
      <div className={styles.meetingBody}>{children}</div>
      {actionItems && actionItems.length > 0 && (
        <div className={styles.actionItems}>
          <div className={styles.actionTitle}>Action Items</div>
          {actionItems.map((a, i) => (
            <div key={i} className={`${styles.actionRow} ${a.done ? styles.actionDone : ''}`}>
              <span className={styles.actionCheck}>{a.done ? '✅' : '⬜'}</span>
              <span className={styles.actionTask}>{a.task}</span>
              <span className={styles.actionOwner}>@{a.owner}</span>
              <span className={styles.actionDue}>Due {a.due}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TEAM DIRECTORY CARD
   ================================================================ */
interface TeamMember {
  name: string;
  role: string;
  team: string;
  timezone?: string;
  oncall?: boolean;
  slack?: string;
  email?: string;
  avatar?: string;
}

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className={styles.teamCard}>
      <div className={styles.teamAvatar}>
        {member.avatar
          ? <img src={member.avatar} alt={member.name} />
          : <span>{member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
        }
        {member.oncall && <span className={styles.oncallDot} title="On-call" />}
      </div>
      <div className={styles.teamInfo}>
        <div className={styles.teamName}>{member.name}</div>
        <div className={styles.teamRole}>{member.role}</div>
        <div className={styles.teamTeam}>{member.team}</div>
        {member.timezone && <div className={styles.teamTz}>🌍 {member.timezone}</div>}
        <div className={styles.teamLinks}>
          {member.slack && <a href={`slack://user?team=T0&id=${member.slack}`} className={styles.teamLink}>Slack</a>}
          {member.email && <a href={`mailto:${member.email}`} className={styles.teamLink}>Email</a>}
        </div>
      </div>
    </div>
  );
}

export function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <div className={styles.teamGrid}>
      {members.map(m => <TeamCard key={m.name} member={m} />)}
    </div>
  );
}

/* ================================================================
   API CALL BUTTON — inline "Try it" for internal endpoints
   ================================================================ */
interface ApiTryItProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  body?: object;
  description?: string;
}

const methodColors = {
  GET:    { bg: '#d1fae5', color: '#065f46' },
  POST:   { bg: '#dbeafe', color: '#1e40af' },
  PUT:    { bg: '#fef3c7', color: '#92400e' },
  DELETE: { bg: '#fee2e2', color: '#991b1b' },
  PATCH:  { bg: '#f3e8ff', color: '#5b21b6' },
};

export function ApiTryIt({ method, url, body, description }: ApiTryItProps) {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mc = methodColors[method];

  const run = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      try { setResponse(JSON.stringify(JSON.parse(text), null, 2)); }
      catch { setResponse(text); }
    } catch (e: any) {
      setError(e.message ?? 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.tryIt}>
      <div className={styles.tryItHeader}>
        <span className={styles.methodBadge} style={{ background: mc.bg, color: mc.color }}>{method}</span>
        <code className={styles.tryItUrl}>{url}</code>
        {description && <span className={styles.tryItDesc}>{description}</span>}
      </div>
      {body && (
        <details className={styles.tryItBody}>
          <summary>Request body</summary>
          <pre>{JSON.stringify(body, null, 2)}</pre>
        </details>
      )}
      <button className={styles.tryItBtn} onClick={run} disabled={loading}>
        {loading ? '⏳ Sending…' : '▶ Send Request'}
      </button>
      {error && <div className={styles.tryItError}>❌ {error}</div>}
      {response && <pre className={styles.tryItResponse}>{response}</pre>}
    </div>
  );
}

/* ================================================================
   DECISION TABLE — lightweight options comparison
   ================================================================ */
interface Option { name: string; pros: string[]; cons: string[]; chosen?: boolean }

export function DecisionTable({ options }: { options: Option[] }) {
  return (
    <div className={styles.decisionTable}>
      {options.map(o => (
        <div key={o.name} className={`${styles.decisionCol} ${o.chosen ? styles.decisionChosen : ''}`}>
          <div className={styles.decisionName}>
            {o.chosen && <span className={styles.chosenBadge}>✓ Chosen</span>}
            {o.name}
          </div>
          <div className={styles.prosSection}>
            {o.pros.map(p => <div key={p} className={styles.pro}>✅ {p}</div>)}
          </div>
          <div className={styles.consSection}>
            {o.cons.map(c => <div key={c} className={styles.con}>❌ {c}</div>)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   RETRO BOARD — Start / Stop / Continue / Action
   ================================================================ */
type RetroColumn = 'start' | 'stop' | 'continue' | 'action';

interface RetroItem { text: string; votes?: number }

const retroConfig: Record<RetroColumn, { label: string; icon: string; color: string; bg: string }> = {
  start:    { label: 'Start',    icon: '🚀', color: '#065f46', bg: '#d1fae5' },
  stop:     { label: 'Stop',     icon: '🛑', color: '#991b1b', bg: '#fee2e2' },
  continue: { label: 'Continue', icon: '🔄', color: '#1e40af', bg: '#dbeafe' },
  action:   { label: 'Actions',  icon: '⚡', color: '#5b21b6', bg: '#f3e8ff' },
};

export function RetroBoard({ items }: { items: Partial<Record<RetroColumn, RetroItem[]>> }) {
  return (
    <div className={styles.retroBoard}>
      {(Object.keys(retroConfig) as RetroColumn[]).map(col => {
        const c = retroConfig[col];
        const colItems = items[col] ?? [];
        return (
          <div key={col} className={styles.retroCol}>
            <div className={styles.retroColHeader} style={{ background: c.bg, color: c.color }}>
              {c.icon} {c.label}
            </div>
            <div className={styles.retroItems}>
              {colItems.length === 0
                ? <div className={styles.retroEmpty}>Nothing here yet</div>
                : colItems.map((item, i) => (
                    <div key={i} className={styles.retroItem}>
                      <span>{item.text}</span>
                      {item.votes !== undefined && (
                        <span className={styles.retroVotes}>👍 {item.votes}</span>
                      )}
                    </div>
                  ))
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   ON-CALL ROTA
   ================================================================ */
interface OnCallEntry { name: string; week: string; start: string; end: string; primary?: boolean }

export function OnCallRota({ entries, escalation }: { entries: OnCallEntry[]; escalation?: string }) {
  return (
    <div className={styles.oncall}>
      <div className={styles.oncallHeader}>
        <span className={styles.oncallDotLarge}>🟢</span>
        <strong>On-Call Schedule</strong>
        {escalation && <span className={styles.escalation}>Escalation: {escalation}</span>}
      </div>
      <div className={styles.oncallList}>
        {entries.map((e, i) => (
          <div key={i} className={`${styles.oncallRow} ${e.primary ? styles.oncallCurrent : ''}`}>
            <span className={styles.oncallWeek}>{e.week}</span>
            <span className={styles.oncallName}>{e.name}</span>
            <span className={styles.oncallRange}>{e.start} → {e.end}</span>
            {e.primary && <span className={styles.primaryBadge}>Current</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
