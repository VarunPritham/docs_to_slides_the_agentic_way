/**
 * Wave 4 — Onboarding & Knowledge Components
 * OnboardingGuide · GlossaryPage · TechRadar
 */
import React, { useState, type ReactNode } from 'react';
import styles from './wave-styles.module.css';

/* ================================================================
   TEAM ONBOARDING GUIDE
   ================================================================ */
interface OnboardingTask {
  task: string;
  link?: string;
  owner?: string;
  done?: boolean;
}
interface OnboardingPhase {
  phase: '30' | '60' | '90' | 'pre-start';
  label: string;
  goal: string;
  tasks: OnboardingTask[];
}
interface AccessItem { system: string; howToGet: string; owner: string; critical?: boolean }

interface OnboardingGuideProps {
  team: string;
  role: string;
  buddy: string;
  manager: string;
  phases: OnboardingPhase[];
  accessList: AccessItem[];
  mustReadPages?: { title: string; link: string; why: string }[];
}

const phaseColors: Record<OnboardingPhase['phase'], { color: string; bg: string; border: string }> = {
  'pre-start': { color: '#5b21b6', bg: '#f5f3ff', border: '#8b5cf6' },
  '30':        { color: '#1e40af', bg: '#eff6ff', border: '#3b82f6' },
  '60':        { color: '#92400e', bg: '#fffbeb', border: '#f59e0b' },
  '90':        { color: '#065f46', bg: '#f0fdf4', border: '#22c55e' },
};

export function OnboardingGuide({ team, role, buddy, manager, phases, accessList, mustReadPages }: OnboardingGuideProps) {
  const [completedTasks, setCompleted] = useState<Set<string>>(new Set());
  const toggle = (key: string) => setCompleted(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  return (
    <div className={styles.onboarding}>
      <div className={styles.onboardingHeader}>
        <div className={styles.onboardingRole}>{role}</div>
        <div className={styles.onboardingTeam}>{team}</div>
        <div className={styles.onboardingContacts}>
          <span>👤 Manager: <strong>{manager}</strong></span>
          <span>🤝 Buddy: <strong>{buddy}</strong></span>
        </div>
      </div>

      {/* Phases */}
      <div className={styles.phases}>
        {phases.map(p => {
          const c = phaseColors[p.phase];
          const total = p.tasks.length;
          const done  = p.tasks.filter((t, i) => completedTasks.has(`${p.phase}-${i}`)).length;
          return (
            <div key={p.phase} className={styles.phase} style={{ borderTopColor: c.border }}>
              <div className={styles.phaseHeader} style={{ background: c.bg }}>
                <div>
                  <span className={styles.phaseLabel} style={{ color: c.color }}>
                    {p.phase === 'pre-start' ? 'Before Day 1' : `First ${p.phase} Days`}
                  </span>
                  <div className={styles.phaseGoal}>{p.goal}</div>
                </div>
                <div className={styles.phaseProgress} style={{ color: c.color }}>
                  {done}/{total}
                </div>
              </div>
              <div className={styles.taskList}>
                {p.tasks.map((t, i) => {
                  const key = `${p.phase}-${i}`;
                  const checked = completedTasks.has(key) || !!t.done;
                  return (
                    <div key={i} className={`${styles.taskItem} ${checked ? styles.taskDone : ''}`}
                      onClick={() => toggle(key)}>
                      <span className={styles.taskCheck}>{checked ? '✅' : '⬜'}</span>
                      <span className={styles.taskText}>
                        {t.link ? <a href={t.link} onClick={e => e.stopPropagation()}>{t.task}</a> : t.task}
                      </span>
                      {t.owner && <span className={styles.taskOwner}>@{t.owner}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Access list */}
      <div className={styles.accessSection}>
        <div className={styles.sectionLabel}>Access Checklist</div>
        <div className={styles.accessTable}>
          {accessList.map(a => (
            <div key={a.system} className={`${styles.accessRow} ${a.critical ? styles.accessCritical : ''}`}>
              <span className={styles.accessSystem}>
                {a.critical && <span className={styles.criticalDot}>●</span>}
                {a.system}
              </span>
              <span className={styles.accessHow}>{a.howToGet}</span>
              <span className={styles.accessOwner}>@{a.owner}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Must-reads */}
      {mustReadPages && mustReadPages.length > 0 && (
        <div className={styles.mustReads}>
          <div className={styles.sectionLabel}>Must-Read Pages</div>
          {mustReadPages.map((p, i) => (
            <div key={i} className={styles.mustReadItem}>
              <a href={p.link} className={styles.mustReadTitle}>📄 {p.title}</a>
              <span className={styles.mustReadWhy}>{p.why}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   GLOSSARY / ACRONYM LIST
   ================================================================ */
interface GlossaryTerm {
  term: string;
  expansion?: string;      // for acronyms
  definition: string;
  domain?: string;         // e.g. 'Risk', 'Payments', 'Engineering'
  seeAlso?: string[];
}

export function GlossaryPage({ terms, domains }: { terms: GlossaryTerm[]; domains?: string[] }) {
  const [search, setSearch] = useState('');
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [activeChar, setActiveChar] = useState<string | null>(null);

  const filtered = terms.filter(t => {
    const matchSearch = search === '' ||
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase()) ||
      (t.expansion ?? '').toLowerCase().includes(search.toLowerCase());
    const matchDomain = !activeDomain || t.domain === activeDomain;
    const matchChar = !activeChar || t.term[0].toUpperCase() === activeChar;
    return matchSearch && matchDomain && matchChar;
  });

  const chars = [...new Set(terms.map(t => t.term[0].toUpperCase()))].sort();

  return (
    <div className={styles.glossary}>
      <div className={styles.glossaryControls}>
        <input className={styles.searchInput} placeholder="Search terms…"
          value={search} onChange={e => setSearch(e.target.value)} />
        {domains && (
          <div className={styles.domainFilters}>
            {domains.map(d => (
              <button key={d} className={`${styles.domainChip} ${activeDomain === d ? styles.domainActive : ''}`}
                onClick={() => setActiveDomain(activeDomain === d ? null : d)}>
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Alpha index */}
      <div className={styles.alphaIndex}>
        {chars.map(c => (
          <button key={c} className={`${styles.alphaBtn} ${activeChar === c ? styles.alphaActive : ''}`}
            onClick={() => setActiveChar(activeChar === c ? null : c)}>
            {c}
          </button>
        ))}
      </div>

      <div className={styles.glossaryList}>
        {filtered.map((t, i) => (
          <div key={i} className={styles.glossaryItem}>
            <div className={styles.glossaryTerm}>
              <span className={styles.termText}>{t.term}</span>
              {t.expansion && <span className={styles.expansion}>{t.expansion}</span>}
              {t.domain && <span className={styles.domainTag}>{t.domain}</span>}
            </div>
            <div className={styles.glossaryDef}>{t.definition}</div>
            {t.seeAlso && (
              <div className={styles.seeAlso}>See also: {t.seeAlso.join(', ')}</div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className={styles.emptyState}>No terms match your search.</div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   TECHNOLOGY RADAR
   ================================================================ */
type RadarRing    = 'adopt' | 'trial' | 'assess' | 'hold';
type RadarQuadrant = 'languages' | 'frameworks' | 'platforms' | 'tools';

interface RadarEntry {
  name: string;
  ring: RadarRing;
  quadrant: RadarQuadrant;
  description: string;
  isNew?: boolean;
  movedFrom?: RadarRing;
}

const ringConfig: Record<RadarRing, { label: string; color: string; bg: string; border: string; desc: string }> = {
  adopt:  { label: 'Adopt',  color: '#065f46', bg: '#d1fae5', border: '#22c55e',
    desc: 'Ready for production use. We strongly recommend this.' },
  trial:  { label: 'Trial',  color: '#1e40af', bg: '#dbeafe', border: '#3b82f6',
    desc: 'Worth pursuing. Use on a project that can handle the risk.' },
  assess: { label: 'Assess', color: '#92400e', bg: '#fef3c7', border: '#f59e0b',
    desc: 'Worth exploring with the goal of understanding how it will affect us.' },
  hold:   { label: 'Hold',   color: '#991b1b', bg: '#fee2e2', border: '#ef4444',
    desc: 'Proceed with caution. Do not start new work with this.' },
};

const quadrantLabels: Record<RadarQuadrant, string> = {
  languages:  'Languages & Frameworks',
  frameworks: 'Frameworks',
  platforms:  'Platforms & Infra',
  tools:      'Tools & Techniques',
};

export function TechRadar({ entries, lastUpdated, owner }: {
  entries: RadarEntry[]; lastUpdated: string; owner: string
}) {
  const [activeRing, setActiveRing] = useState<RadarRing | null>(null);
  const [activeQuadrant, setActiveQuadrant] = useState<RadarQuadrant | null>(null);

  const filtered = entries.filter(e => {
    const rMatch = !activeRing || e.ring === activeRing;
    const qMatch = !activeQuadrant || e.quadrant === activeQuadrant;
    return rMatch && qMatch;
  });

  const rings: RadarRing[] = ['adopt', 'trial', 'assess', 'hold'];
  const quadrants: RadarQuadrant[] = ['languages', 'frameworks', 'platforms', 'tools'];

  return (
    <div className={styles.radar}>
      <div className={styles.radarHeader}>
        <div>
          <div className={styles.radarTitle}>Technology Radar</div>
          <div className={styles.radarMeta}>Last updated {lastUpdated} · Owned by {owner}</div>
        </div>
        <a href="https://www.thoughtworks.com/radar" target="_blank" rel="noreferrer" className={styles.radarRef}>
          Thoughtworks format ↗
        </a>
      </div>

      {/* Ring legend + filter */}
      <div className={styles.ringLegend}>
        {rings.map(r => {
          const c = ringConfig[r];
          const count = entries.filter(e => e.ring === r).length;
          return (
            <button key={r} className={`${styles.ringChip} ${activeRing === r ? styles.ringActive : ''}`}
              style={{ borderColor: c.border, background: activeRing === r ? c.bg : '' }}
              onClick={() => setActiveRing(activeRing === r ? null : r)}>
              <span style={{ color: c.color }}>{c.label}</span>
              <span className={styles.ringCount}>{count}</span>
            </button>
          );
        })}
        {/* Quadrant filter */}
        {quadrants.map(q => (
          <button key={q} className={`${styles.quadrantChip} ${activeQuadrant === q ? styles.quadrantActive : ''}`}
            onClick={() => setActiveQuadrant(activeQuadrant === q ? null : q)}>
            {quadrantLabels[q]}
          </button>
        ))}
      </div>

      {/* Grouped by ring */}
      {rings.map(ring => {
        const ringEntries = filtered.filter(e => e.ring === ring);
        if (ringEntries.length === 0) return null;
        const c = ringConfig[ring];
        return (
          <div key={ring} className={styles.radarRingSection}>
            <div className={styles.radarRingHeader} style={{ borderLeftColor: c.border }}>
              <span className={styles.radarRingName} style={{ color: c.color }}>{c.label}</span>
              <span className={styles.radarRingDesc}>{c.desc}</span>
            </div>
            <div className={styles.radarEntries}>
              {ringEntries.map(e => (
                <div key={e.name} className={styles.radarEntry}>
                  <div className={styles.radarEntryTop}>
                    <span className={styles.radarEntryName}>{e.name}</span>
                    <div className={styles.radarEntryBadges}>
                      <span className={styles.radarQuadrant}>{quadrantLabels[e.quadrant]}</span>
                      {e.isNew && <span className={styles.newBadge}>NEW</span>}
                      {e.movedFrom && (
                        <span className={styles.movedBadge}>
                          moved from {e.movedFrom}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.radarEntryDesc}>{e.description}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
