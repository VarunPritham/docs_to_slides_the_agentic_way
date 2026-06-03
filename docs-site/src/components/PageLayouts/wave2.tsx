/**
 * Wave 2 — Engineering Maturity Components
 * RFC · TechDebtRegister · SLODefinition · DORAMetrics
 */
import React, { useState, type ReactNode } from 'react';
import styles from './wave-styles.module.css';

/* ================================================================
   RFC / TECHNICAL DESIGN DOC
   ================================================================ */
type RFCStatus = 'draft' | 'open-for-comment' | 'decided' | 'withdrawn';

interface RFCSection { title: string; content: ReactNode }

interface RFCProps {
  rfcId: string;
  title: string;
  author: string;
  date: string;
  status: RFCStatus;
  reviewers?: string[];
  deadline?: string;
  problemStatement: ReactNode;
  proposedSolution: ReactNode;
  alternatives?: { name: string; description: string; tradeoff: string }[];
  openQuestions?: string[];
  sections?: RFCSection[];
}

const rfcStatusMap: Record<RFCStatus, { label: string; color: string; bg: string }> = {
  'draft':            { label: 'Draft',            color: '#92400e', bg: '#fef3c7' },
  'open-for-comment': { label: 'Open for Comment', color: '#1e40af', bg: '#dbeafe' },
  'decided':          { label: 'Decided',          color: '#065f46', bg: '#d1fae5' },
  'withdrawn':        { label: 'Withdrawn',        color: '#6b7280', bg: '#f3f4f6' },
};

export function RFC({ rfcId, title, author, date, status, reviewers, deadline, problemStatement, proposedSolution, alternatives, openQuestions, sections }: RFCProps) {
  const s = rfcStatusMap[status];
  return (
    <div className={styles.rfc}>
      <div className={styles.rfcHeader}>
        <div className={styles.rfcMeta}>
          <span className={styles.rfcId}>RFC-{rfcId}</span>
          <span className={styles.badge} style={{ color: s.color, background: s.bg }}>{s.label}</span>
          {deadline && status === 'open-for-comment' && (
            <span className={styles.deadline}>💬 Comment by {deadline}</span>
          )}
        </div>
        <h2 className={styles.rfcTitle}>{title}</h2>
        <div className={styles.rfcByline}>
          <span>✍️ {author}</span>
          <span>📅 {date}</span>
          {reviewers && <span>👀 {reviewers.join(', ')}</span>}
        </div>
      </div>

      <div className={styles.rfcSection}>
        <div className={styles.sectionLabel}>Problem Statement</div>
        <div className={styles.sectionBody}>{problemStatement}</div>
      </div>

      <div className={styles.rfcSection}>
        <div className={styles.sectionLabel}>Proposed Solution</div>
        <div className={styles.sectionBody}>{proposedSolution}</div>
      </div>

      {alternatives && alternatives.length > 0 && (
        <div className={styles.rfcSection}>
          <div className={styles.sectionLabel}>Alternatives Considered</div>
          <div className={styles.altList}>
            {alternatives.map((a, i) => (
              <div key={i} className={styles.altItem}>
                <div className={styles.altName}>{a.name}</div>
                <div className={styles.altDesc}>{a.description}</div>
                <div className={styles.altTradeoff}>⚖️ {a.tradeoff}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sections && sections.map((sec, i) => (
        <div key={i} className={styles.rfcSection}>
          <div className={styles.sectionLabel}>{sec.title}</div>
          <div className={styles.sectionBody}>{sec.content}</div>
        </div>
      ))}

      {openQuestions && openQuestions.length > 0 && (
        <div className={styles.rfcSection}>
          <div className={styles.sectionLabel}>Open Questions</div>
          <ul className={styles.openQList}>
            {openQuestions.map((q, i) => (
              <li key={i} className={styles.openQItem}>
                <span className={styles.qIcon}>❓</span> {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TECH DEBT REGISTER
   ================================================================ */
type DebtSeverity = 'critical' | 'high' | 'medium' | 'low';
type DebtStatus   = 'open' | 'in-progress' | 'resolved' | 'accepted';

interface DebtItem {
  id: string;
  title: string;
  system: string;
  severity: DebtSeverity;
  status: DebtStatus;
  owner: string;
  created: string;
  targetSprint?: string;
  description: string;
  impact: string;
}

const debtSeverityConfig: Record<DebtSeverity, { color: string; bg: string }> = {
  critical: { color: '#991b1b', bg: '#fee2e2' },
  high:     { color: '#9a3412', bg: '#ffedd5' },
  medium:   { color: '#92400e', bg: '#fef3c7' },
  low:      { color: '#065f46', bg: '#d1fae5' },
};

const debtStatusConfig: Record<DebtStatus, { label: string; color: string; bg: string }> = {
  'open':        { label: 'Open',        color: '#991b1b', bg: '#fee2e2' },
  'in-progress': { label: 'In Progress', color: '#1e40af', bg: '#dbeafe' },
  'resolved':    { label: 'Resolved',    color: '#065f46', bg: '#d1fae5' },
  'accepted':    { label: 'Accepted Risk', color: '#6b7280', bg: '#f3f4f6' },
};

export function TechDebtRegister({ items }: { items: DebtItem[] }) {
  const [filter, setFilter] = useState<DebtSeverity | 'all'>('all');
  const filtered = filter === 'all' ? items : items.filter(i => i.severity === filter);
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  items.forEach(i => counts[i.severity]++);

  return (
    <div className={styles.debtRegister}>
      {/* Summary row */}
      <div className={styles.debtSummary}>
        {(['critical','high','medium','low'] as DebtSeverity[]).map(sev => {
          const c = debtSeverityConfig[sev];
          return (
            <button key={sev} className={`${styles.debtSummaryChip} ${filter === sev ? styles.active : ''}`}
              style={{ borderColor: c.bg }} onClick={() => setFilter(filter === sev ? 'all' : sev)}>
              <span className={styles.debtCount} style={{ color: c.color }}>{counts[sev]}</span>
              <span className={styles.debtSevLabel}>{sev.charAt(0).toUpperCase() + sev.slice(1)}</span>
            </button>
          );
        })}
        {filter !== 'all' && (
          <button className={styles.clearFilter} onClick={() => setFilter('all')}>✕ Clear</button>
        )}
      </div>

      {/* Table */}
      <div className={styles.debtTable}>
        <div className={styles.debtTableHeader}>
          <span>ID</span><span>Title</span><span>System</span>
          <span>Severity</span><span>Status</span><span>Owner</span><span>Target</span>
        </div>
        {filtered.map(item => {
          const sev = debtSeverityConfig[item.severity];
          const st  = debtStatusConfig[item.status];
          return (
            <details key={item.id} className={styles.debtRow}>
              <summary className={styles.debtRowSummary}>
                <span className={styles.debtId}>{item.id}</span>
                <span className={styles.debtTitle}>{item.title}</span>
                <span className={styles.debtSystem}>{item.system}</span>
                <span className={styles.badge} style={{ color: sev.color, background: sev.bg }}>{item.severity}</span>
                <span className={styles.badge} style={{ color: st.color,  background: st.bg  }}>{st.label}</span>
                <span className={styles.debtOwner}>{item.owner}</span>
                <span className={styles.debtTarget}>{item.targetSprint ?? '—'}</span>
              </summary>
              <div className={styles.debtDetail}>
                <div><strong>Description:</strong> {item.description}</div>
                <div><strong>Impact:</strong> {item.impact}</div>
                <div className={styles.debtCreated}>Created {item.created}</div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   SLO / ERROR BUDGET DEFINITION
   ================================================================ */
interface SLI { name: string; description: string; measurement: string }
interface SLO {
  service: string;
  owner: string;
  period: string;
  slis: SLI[];
  target: number;        // e.g. 99.9
  currentUptime: number; // e.g. 99.94
  errorBudgetMinutes: number;
  errorBudgetConsumed: number; // percentage 0-100
  alertPolicy: string;
  exhaustionPolicy: string;
}

export function SLODefinition({ slo }: { slo: SLO }) {
  const budgetRemaining = 100 - slo.errorBudgetConsumed;
  const budgetColor = slo.errorBudgetConsumed > 90 ? '#ef4444'
    : slo.errorBudgetConsumed > 70 ? '#f59e0b' : '#22c55e';
  const isBreaching = slo.currentUptime < slo.target;

  return (
    <div className={styles.slo}>
      <div className={styles.sloHeader}>
        <div>
          <div className={styles.sloService}>{slo.service}</div>
          <div className={styles.sloOwner}>Owner: {slo.owner} · Period: {slo.period}</div>
        </div>
        <div className={styles.sloTargetBig}>
          <span className={styles.sloTargetNum} style={{ color: isBreaching ? '#ef4444' : '#22c55e' }}>
            {slo.currentUptime}%
          </span>
          <span className={styles.sloTargetLabel}>/ {slo.target}% target</span>
          {isBreaching && <span className={styles.breachBadge}>⚠️ Breaching</span>}
        </div>
      </div>

      {/* Error budget gauge */}
      <div className={styles.budgetSection}>
        <div className={styles.budgetLabel}>
          Error Budget — {budgetRemaining.toFixed(1)}% remaining
          <span className={styles.budgetMinutes}>({slo.errorBudgetMinutes} min/period total)</span>
        </div>
        <div className={styles.budgetBar}>
          <div className={styles.budgetFill}
            style={{ width: `${budgetRemaining}%`, background: budgetColor }} />
        </div>
        <div className={styles.budgetMeta}>
          <span style={{ color: budgetColor }}>{slo.errorBudgetConsumed}% consumed</span>
          <span>{budgetRemaining.toFixed(1)}% remaining</span>
        </div>
      </div>

      {/* SLIs */}
      <div className={styles.sloSection}>
        <div className={styles.sectionLabel}>Service Level Indicators</div>
        <div className={styles.sliList}>
          {slo.slis.map((sli, i) => (
            <div key={i} className={styles.sliItem}>
              <div className={styles.sliName}>{sli.name}</div>
              <div className={styles.sliDesc}>{sli.description}</div>
              <div className={styles.sliMeasure}><code>{sli.measurement}</code></div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sloGrid}>
        <div className={styles.sloSection}>
          <div className={styles.sectionLabel}>Alert Policy</div>
          <div className={styles.sloPolicy}>{slo.alertPolicy}</div>
        </div>
        <div className={styles.sloSection}>
          <div className={styles.sectionLabel}>Budget Exhaustion Policy</div>
          <div className={styles.sloPolicy}>{slo.exhaustionPolicy}</div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   DORA METRICS
   ================================================================ */
type DoraRating = 'elite' | 'high' | 'medium' | 'low';

interface DoraMetric {
  name: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  rating: DoraRating;
  description: string;
  benchmark: string;
}

const doraRatingConfig: Record<DoraRating, { label: string; color: string; bg: string }> = {
  elite:  { label: 'Elite',  color: '#065f46', bg: '#d1fae5' },
  high:   { label: 'High',   color: '#1e40af', bg: '#dbeafe' },
  medium: { label: 'Medium', color: '#92400e', bg: '#fef3c7' },
  low:    { label: 'Low',    color: '#991b1b', bg: '#fee2e2' },
};

const trendIcon = { up: '↑', down: '↓', flat: '→' };
const trendColor = {
  'Deployment Frequency': { up: '#22c55e', down: '#ef4444', flat: '#94a3b8' },
  'Lead Time for Changes': { up: '#ef4444', down: '#22c55e', flat: '#94a3b8' },
  'Mean Time to Recovery': { up: '#ef4444', down: '#22c55e', flat: '#94a3b8' },
  'Change Failure Rate':   { up: '#ef4444', down: '#22c55e', flat: '#94a3b8' },
};

export function DORAMetrics({ team, period, metrics, notes }: {
  team: string; period: string; metrics: DoraMetric[]; notes?: string
}) {
  return (
    <div className={styles.dora}>
      <div className={styles.doraHeader}>
        <div>
          <div className={styles.doraTeam}>{team}</div>
          <div className={styles.doraPeriod}>Reporting period: {period}</div>
        </div>
        <a href="https://dora.dev" target="_blank" rel="noreferrer" className={styles.doraLink}>
          DORA Framework ↗
        </a>
      </div>

      <div className={styles.doraGrid}>
        {metrics.map((m) => {
          const r = doraRatingConfig[m.rating];
          const tc = (trendColor[m.name as keyof typeof trendColor] ?? { up: '#22c55e', down: '#ef4444', flat: '#94a3b8' })[m.trend];
          return (
            <div key={m.name} className={styles.doraCard}>
              <div className={styles.doraCardHeader}>
                <span className={styles.doraMetricName}>{m.name}</span>
                <span className={styles.badge} style={{ color: r.color, background: r.bg }}>{r.label}</span>
              </div>
              <div className={styles.doraValue}>
                {m.value}
                <span className={styles.doraTrend} style={{ color: tc }}>
                  {trendIcon[m.trend]}
                </span>
              </div>
              <div className={styles.doraDesc}>{m.description}</div>
              <div className={styles.doraBenchmark}>Elite benchmark: {m.benchmark}</div>
            </div>
          );
        })}
      </div>

      {notes && <div className={styles.doraNotes}>{notes}</div>}
    </div>
  );
}
