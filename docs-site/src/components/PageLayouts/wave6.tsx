import React, { useState } from 'react';
// @ts-ignore — provided at runtime by @docusaurus/theme-mermaid
import Mermaid from '@theme/Mermaid';
import styles from './wave-styles.module.css';

/* ─────────────────────────────────────────────────────────────────────────────
   WAVE 6 — DOCS AS CODE
   Components:
     • AttachmentPanel      — file/media attachment viewer (image grid, video, download cards)
     • CodeWalkthrough      — step-by-step annotated code tour
     • ChangelogPage        — structured release history
     • EnvironmentReference — environment variable documentation
     • ArchitectureDiagram  — Mermaid diagram with metadata
     • CodeSnippetLibrary   — searchable tagged code patterns
───────────────────────────────────────────────────────────────────────────── */

// ── Attachment types ────────────────────────────────────────────────────────

type AttachmentKind =
  | 'image'        // .png .jpg .jpeg .gif .svg .webp
  | 'video'        // .mp4 .webm .mov  OR  youtube/vimeo URL
  | 'pdf'          // .pdf
  | 'spreadsheet'  // .xlsx .xls .csv
  | 'document'     // .docx .doc .pptx .ppt
  | 'archive'      // .zip .tar .gz .7z (also .tar.gz)
  | 'config'       // .yaml .yml .json .toml .env .ini .conf
  | 'code'         // .py .ts .tsx .js .jsx .sh .bash .sql .go .rs .java
  | 'text'         // .txt .log .md
  | 'unknown';

export interface Attachment {
  name: string;
  url: string;
  kind?: AttachmentKind;   // auto-detected from extension if omitted
  size?: string;           // "2.4 MB"
  description?: string;
  preview?: string;        // inline text content for config/code/text files
  language?: string;       // syntax highlight hint for preview block
}

// ── detectKind helper ───────────────────────────────────────────────────────

const detectKind = (name: string, url: string): AttachmentKind => {
  // Dotfiles: .env, .env.local, .env.production → config
  const basename = name.split('/').pop() ?? name;
  if (/^\.env(\.|$)/.test(basename)) return 'config';
  // .tar.gz / .tar.bz2 before single-ext check
  if (/\.(tar\.gz|tar\.bz2|tar\.xz)$/.test(name)) return 'archive';
  const ext = (basename.split('.').pop() ?? '').toLowerCase();
  if (['png','jpg','jpeg','gif','svg','webp','bmp','tiff','ico'].includes(ext)) return 'image';
  if (['mp4','webm','mov','avi','mkv','m4v'].includes(ext) || /youtube\.com|youtu\.be|vimeo\.com/.test(url)) return 'video';
  if (ext === 'pdf') return 'pdf';
  if (['xlsx','xls','csv','ods','tsv'].includes(ext)) return 'spreadsheet';
  if (['docx','doc','pptx','ppt','odt','odp','rtf'].includes(ext)) return 'document';
  if (['zip','tar','gz','bz2','xz','7z','rar','tgz'].includes(ext)) return 'archive';
  if (['yaml','yml','json','jsonc','toml','env','ini','conf','cfg','properties','xml','hcl','tf'].includes(ext)) return 'config';
  if (['py','ts','tsx','js','jsx','mjs','cjs','sh','bash','zsh','sql','go','rs','java','rb','php','cs','cpp','c','h','kt','swift','r','scala'].includes(ext)) return 'code';
  if (['txt','log','md','mdx','rst','nfo','diff','patch'].includes(ext)) return 'text';
  return 'unknown';
};

const kindMeta: Record<AttachmentKind, { icon: string; label: string }> = {
  image:       { icon: '🖼️',  label: 'Image' },
  video:       { icon: '🎬',  label: 'Video' },
  pdf:         { icon: '📄',  label: 'PDF' },
  spreadsheet: { icon: '📊',  label: 'Spreadsheet' },
  document:    { icon: '📝',  label: 'Document' },
  archive:     { icon: '🗜️',  label: 'Archive' },
  config:      { icon: '⚙️',  label: 'Config' },
  code:        { icon: '💻',  label: 'Code' },
  text:        { icon: '📋',  label: 'Text' },
  unknown:     { icon: '📎',  label: 'File' },
};

// ── AttachmentPanel component ───────────────────────────────────────────────

interface AttachmentPanelProps {
  title?: string;           // defaults to "Attachments"
  files: Attachment[];
}

export function AttachmentPanel({ title = 'Attachments', files }: AttachmentPanelProps) {
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const togglePreview = (name: string) =>
    setExpandedPreviews(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  if (!files.length) return null;

  const resolved = files.map(f => ({ ...f, kind: f.kind ?? detectKind(f.name, f.url) }));
  const images = resolved.filter(f => f.kind === 'image');
  const videos = resolved.filter(f => f.kind === 'video');
  const others = resolved.filter(f => f.kind !== 'image' && f.kind !== 'video');

  const isYT = (url: string) => /youtube\.com|youtu\.be/.test(url);
  const isVimeo = (url: string) => /vimeo\.com/.test(url);
  const ytEmbed = (url: string) => {
    const id = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  };
  const vimeoEmbed = (url: string) => {
    const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : url;
  };

  return (
    <div className={styles.apContainer}>
      <div className={styles.apHeader}>
        <span className={styles.apTitle}>📎 {title}</span>
        <span className={styles.apCount}>{files.length} file{files.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Image thumbnail grid */}
      {images.length > 0 && (
        <div className={styles.apImageGrid}>
          {images.map(f => (
            <div key={f.name} className={styles.apImageCard}>
              <img
                src={f.url}
                alt={f.name}
                className={styles.apThumb}
                onClick={() => setLightboxSrc(f.url)}
              />
              <div className={styles.apImageMeta}>
                <span className={styles.apFileName}>{f.name}</span>
                {f.size && <span className={styles.apFileSize}>{f.size}</span>}
              </div>
              {f.description && <p className={styles.apFileDesc}>{f.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Video players */}
      {videos.length > 0 && (
        <div className={styles.apVideoList}>
          {videos.map(f => (
            <div key={f.name} className={styles.apVideoCard}>
              <div className={styles.apVideoLabel}>
                <span>🎬</span>
                <span className={styles.apFileName}>{f.name}</span>
                {f.size && <span className={styles.apFileSize}>{f.size}</span>}
              </div>
              {isYT(f.url) ? (
                <iframe
                  className={styles.apVideoFrame}
                  src={ytEmbed(f.url)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isVimeo(f.url) ? (
                <iframe
                  className={styles.apVideoFrame}
                  src={vimeoEmbed(f.url)}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video controls className={styles.apVideoNative} src={f.url} />
              )}
              {f.description && <p className={styles.apFileDesc}>{f.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Document / archive / config / code / text download cards */}
      {others.length > 0 && (
        <div className={styles.apDocList}>
          {others.map(f => {
            const meta = kindMeta[f.kind!];
            const canPreview = ['config','code','text'].includes(f.kind!) && f.preview;
            const open = expandedPreviews.has(f.name);
            return (
              <div key={f.name} className={styles.apDocCard}>
                <div className={styles.apDocRow}>
                  <span className={styles.apDocIcon}>{meta.icon}</span>
                  <div className={styles.apDocInfo}>
                    <span className={styles.apFileName}>{f.name}</span>
                    <div className={styles.apDocMeta}>
                      <span className={`${styles.apKindBadge} ${styles[`apKind_${f.kind}`]}`}>{meta.label}</span>
                      {f.size && <span className={styles.apFileSize}>{f.size}</span>}
                      {f.description && <span className={styles.apFileDesc}>{f.description}</span>}
                    </div>
                  </div>
                  <div className={styles.apDocActions}>
                    {canPreview && (
                      <button className={styles.apPreviewBtn} onClick={() => togglePreview(f.name)}>
                        {open ? 'Hide' : 'Preview'}
                      </button>
                    )}
                    <a href={f.url} download={f.name} className={styles.apDownloadBtn} target="_blank" rel="noreferrer">
                      ↓ Download
                    </a>
                  </div>
                </div>
                {canPreview && open && (
                  <div className={styles.apPreviewBlock}>
                    <pre><code>{f.preview}</code></pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox overlay for images */}
      {lightboxSrc && (
        <div className={styles.apLightbox} onClick={() => setLightboxSrc(null)}>
          <img src={lightboxSrc} alt="full size" className={styles.apLightboxImg} />
          <button className={styles.apLightboxClose} onClick={() => setLightboxSrc(null)}>✕</button>
        </div>
      )}
    </div>
  );
}

// ── shared helpers ──────────────────────────────────────────────────────────

function FileBreadcrumb({ file, lines }: { file: string; lines?: string }) {
  return (
    <span className={styles.fileBreadcrumb}>
      <span className={styles.fileBreadcrumbPath}>{file}</span>
      {lines && <span className={styles.fileBreadcrumbLines}> : {lines}</span>}
    </span>
  );
}

// ── A. CodeWalkthrough ───────────────────────────────────────────────────────

interface WalkthroughStop {
  id: string;
  title: string;
  file: string;
  lines?: string;
  language: string;
  code: string;
  explanation: string;
  whyItMatters?: string;
  relatedStops?: string[];
}

interface CodeWalkthroughProps {
  title: string;
  repo: string;
  estimatedMinutes: number;
  stops: WalkthroughStop[];
}

export function CodeWalkthrough({ title, repo, estimatedMinutes, stops }: CodeWalkthroughProps) {
  const [current, setCurrent] = useState(0);
  const stop = stops[current];

  return (
    <div className={styles.cwContainer}>
      {/* Header */}
      <div className={styles.cwHeader}>
        <div>
          <div className={styles.sectionLabel}>Code Walkthrough</div>
          <h2 className={styles.cwTitle}>{title}</h2>
        </div>
        <div className={styles.cwMeta}>
          <span className={styles.cwMetaBadge}>⏱ {estimatedMinutes} min</span>
          <span className={styles.cwMetaBadge}>
            Stop {current + 1} of {stops.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.cwProgressBar}>
        {stops.map((s, i) => (
          <button
            key={s.id}
            className={`${styles.cwProgressDot} ${i === current ? styles.cwProgressDotActive : ''} ${i < current ? styles.cwProgressDotDone : ''}`}
            onClick={() => setCurrent(i)}
            title={s.title}
          />
        ))}
        <div
          className={styles.cwProgressFill}
          style={{ width: `${((current + 1) / stops.length) * 100}%` }}
        />
      </div>

      {/* Stop card */}
      <div className={styles.cwCard}>
        <div className={styles.cwCardHeader}>
          <div>
            <span className={styles.cwStopNumber}>Stop {current + 1}</span>
            <h3 className={styles.cwStopTitle}>{stop.title}</h3>
            <FileBreadcrumb file={stop.file} lines={stop.lines} />
          </div>
          <a
            href={`${repo}/-/blob/main/${stop.file}${stop.lines ? `#L${stop.lines.split('–')[0]}` : ''}`}
            target="_blank"
            rel="noreferrer"
            className={styles.cwRepoLink}
          >
            🔗 View in repo
          </a>
        </div>

        <pre className={styles.codeBlock}><code>{stop.code}</code></pre>

        <div className={styles.cwExplanation}>{stop.explanation}</div>

        {stop.whyItMatters && (
          <div className={styles.cwWhyBox}>
            <span className={styles.cwWhyLabel}>💡 Why it matters</span>
            <p>{stop.whyItMatters}</p>
          </div>
        )}

        {stop.relatedStops && stop.relatedStops.length > 0 && (
          <div className={styles.cwRelated}>
            <span className={styles.cwRelatedLabel}>Related stops:</span>
            {stop.relatedStops.map(rel => {
              const idx = stops.findIndex(s => s.id === rel);
              return (
                <button
                  key={rel}
                  className={styles.cwRelatedChip}
                  onClick={() => idx >= 0 && setCurrent(idx)}
                >
                  {idx >= 0 ? stops[idx].title : rel}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className={styles.cwNav}>
        <button
          className={styles.cwNavBtn}
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          ← Previous
        </button>

        <select
          className={styles.cwJumpSelect}
          value={current}
          onChange={e => setCurrent(Number(e.target.value))}
        >
          {stops.map((s, i) => (
            <option key={s.id} value={i}>Stop {i + 1}: {s.title}</option>
          ))}
        </select>

        <button
          className={styles.cwNavBtn}
          onClick={() => setCurrent(c => Math.min(stops.length - 1, c + 1))}
          disabled={current === stops.length - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ── B. ChangelogPage ─────────────────────────────────────────────────────────

type ChangeType = 'feat' | 'fix' | 'breaking' | 'deprecated' | 'perf' | 'docs' | 'chore';
type ReleaseStatus = 'latest' | 'stable' | 'deprecated' | 'yanked';

interface Change {
  type: ChangeType;
  description: string;
  pr?: string;
  author?: string;
}

interface Release {
  version: string;
  date: string;
  status: ReleaseStatus;
  summary?: string;
  changes: Change[];
}

interface ChangelogPageProps {
  repoUrl: string;
  releases: Release[];
}

const CHANGE_TYPE_COLORS: Record<ChangeType, { bg: string; color: string; label: string }> = {
  feat:       { bg: '#dcfce7', color: '#16a34a', label: 'feat' },
  fix:        { bg: '#dbeafe', color: '#2563eb', label: 'fix' },
  breaking:   { bg: '#fee2e2', color: '#dc2626', label: 'breaking' },
  deprecated: { bg: '#ffedd5', color: '#ea580c', label: 'deprecated' },
  perf:       { bg: '#f3e8ff', color: '#9333ea', label: 'perf' },
  docs:       { bg: '#e2e8f0', color: '#475569', label: 'docs' },
  chore:      { bg: '#f1f5f9', color: '#64748b', label: 'chore' },
};

const RELEASE_STATUS_COLORS: Record<ReleaseStatus, { bg: string; color: string }> = {
  latest:     { bg: '#dcfce7', color: '#16a34a' },
  stable:     { bg: '#dbeafe', color: '#2563eb' },
  deprecated: { bg: '#ffedd5', color: '#ea580c' },
  yanked:     { bg: '#fee2e2', color: '#dc2626' },
};

type ChangelogFilter = 'all' | 'latest' | 'breaking';

export function ChangelogPage({ repoUrl, releases }: ChangelogPageProps) {
  const [filter, setFilter] = useState<ChangelogFilter>('all');

  const filtered = releases.filter(r => {
    if (filter === 'latest') return r.status === 'latest' || r.status === 'stable';
    if (filter === 'breaking') return r.changes.some(c => c.type === 'breaking');
    return true;
  });

  const filters: { key: ChangelogFilter; label: string }[] = [
    { key: 'all', label: 'All releases' },
    { key: 'latest', label: 'Latest / Stable' },
    { key: 'breaking', label: 'Breaking changes' },
  ];

  // Group changes by type
  function groupByType(changes: Change[]): Record<string, Change[]> {
    return changes.reduce((acc, c) => {
      if (!acc[c.type]) acc[c.type] = [];
      acc[c.type].push(c);
      return acc;
    }, {} as Record<string, Change[]>);
  }

  return (
    <div className={styles.clContainer}>
      <div className={styles.clHeader}>
        <div className={styles.sectionLabel}>Changelog</div>
        <div className={styles.clFilterRow}>
          {filters.map(f => (
            <button
              key={f.key}
              className={`${styles.clFilterChip} ${filter === f.key ? styles.clFilterChipActive : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.map(release => {
        const sc = RELEASE_STATUS_COLORS[release.status];
        const grouped = groupByType(release.changes);
        return (
          <div key={release.version} className={styles.clCard}>
            <div className={styles.clCardHeader}>
              <div className={styles.clVersionRow}>
                <span className={styles.clVersion}>{release.version}</span>
                <span
                  className={styles.badge}
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {release.status}
                </span>
                <span className={styles.clDate}>{release.date}</span>
              </div>
              {release.summary && <p className={styles.clSummary}>{release.summary}</p>}
            </div>

            <div className={styles.clChanges}>
              {(Object.entries(grouped) as [ChangeType, Change[]][]).map(([type, changes]) => {
                const tc = CHANGE_TYPE_COLORS[type] || CHANGE_TYPE_COLORS.chore;
                return (
                  <div key={type} className={styles.clChangeGroup}>
                    <span
                      className={styles.badge}
                      style={{ background: tc.bg, color: tc.color, marginBottom: '0.5rem' }}
                    >
                      {tc.label}
                    </span>
                    <ul className={styles.clChangeList}>
                      {changes.map((c, i) => (
                        <li key={i} className={styles.clChangeItem}>
                          {c.description}
                          {c.pr && (
                            <a
                              href={`${repoUrl}/-/merge_requests/${c.pr.replace('#', '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.clPrLink}
                            >
                              {c.pr}
                            </a>
                          )}
                          {c.author && <span className={styles.clAuthor}>@{c.author}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className={styles.emptyState}>No releases match this filter.</div>
      )}
    </div>
  );
}

// ── C. EnvironmentReference ──────────────────────────────────────────────────

type EnvVarType = 'string' | 'url' | 'boolean' | 'number' | 'enum';

interface EnvVar {
  name: string;
  required: boolean;
  type: EnvVarType;
  default?: string;
  example?: string;
  description: string;
  service?: string;
  enumValues?: string[];
  secret?: boolean;
}

interface EnvironmentReferenceProps {
  service: string;
  configFile?: string;
  variables: EnvVar[];
}

const ENV_TYPE_COLORS: Record<EnvVarType, { bg: string; color: string }> = {
  string:  { bg: '#dbeafe', color: '#2563eb' },
  url:     { bg: '#dcfce7', color: '#16a34a' },
  boolean: { bg: '#f3e8ff', color: '#9333ea' },
  number:  { bg: '#ffedd5', color: '#ea580c' },
  enum:    { bg: '#fef9c3', color: '#ca8a04' },
};

export function EnvironmentReference({ service, configFile, variables }: EnvironmentReferenceProps) {
  const [search, setSearch] = useState('');
  const [requiredOnly, setRequiredOnly] = useState(false);
  const [secretOnly, setSecretOnly] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const filtered = variables.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase());
    const matchRequired = !requiredOnly || v.required;
    const matchSecret = !secretOnly || v.secret;
    return matchSearch && matchRequired && matchSecret;
  });

  const requiredCount = variables.filter(v => v.required).length;
  const optionalCount = variables.length - requiredCount;

  function toggleReveal(name: string) {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className={styles.erContainer}>
      <div className={styles.erHeader}>
        <div>
          <div className={styles.sectionLabel}>Environment Reference</div>
          <h2 className={styles.erTitle}>{service}</h2>
          <div className={styles.erCounts}>
            <span className={styles.erCountBadge} style={{ background: '#fee2e2', color: '#dc2626' }}>
              {requiredCount} required
            </span>
            <span className={styles.erCountBadge} style={{ background: '#f1f5f9', color: '#64748b' }}>
              {optionalCount} optional
            </span>
            {configFile && (
              <span className={styles.erConfigFile}>Config: <code>{configFile}</code></span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.erControls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search variables…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <label className={styles.erToggle}>
          <input type="checkbox" checked={requiredOnly} onChange={e => setRequiredOnly(e.target.checked)} />
          Required only
        </label>
        <label className={styles.erToggle}>
          <input type="checkbox" checked={secretOnly} onChange={e => setSecretOnly(e.target.checked)} />
          Secrets only
        </label>
      </div>

      <div className={styles.erTableWrapper}>
        <table className={styles.erTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Required</th>
              <th>Type</th>
              <th>Default</th>
              <th>Example</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => {
              const tc = ENV_TYPE_COLORS[v.type];
              const isRevealed = revealed.has(v.name);
              return (
                <tr key={v.name} className={v.required ? styles.erRowRequired : ''}>
                  <td>
                    <code className={styles.erVarName}>{v.name}</code>
                    {v.secret && <span className={styles.erSecretBadge}>🔐 secret</span>}
                  </td>
                  <td>
                    <span
                      className={styles.badge}
                      style={v.required
                        ? { background: '#fee2e2', color: '#dc2626' }
                        : { background: '#f1f5f9', color: '#64748b' }
                      }
                    >
                      {v.required ? 'required' : 'optional'}
                    </span>
                  </td>
                  <td>
                    <span className={styles.badge} style={{ background: tc.bg, color: tc.color }}>
                      {v.type}
                    </span>
                    {v.enumValues && (
                      <div className={styles.erEnumValues}>
                        {v.enumValues.map(ev => (
                          <code key={ev} className={styles.erEnumVal}>{ev}</code>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className={styles.erMono}>{v.default ?? <span className={styles.erNone}>—</span>}</td>
                  <td className={styles.erMono}>
                    {v.example ? (
                      <span>
                        {v.secret && !isRevealed
                          ? <span className={styles.erMasked}>{'•'.repeat(Math.min(v.example.length, 12))}</span>
                          : v.example
                        }
                        {v.secret && (
                          <button className={styles.erRevealBtn} onClick={() => toggleReveal(v.name)}>
                            {isRevealed ? '🙈' : '👁'}
                          </button>
                        )}
                      </span>
                    ) : <span className={styles.erNone}>—</span>}
                  </td>
                  <td className={styles.erDesc}>{v.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className={styles.emptyState}>No variables match your filters.</div>
        )}
      </div>
    </div>
  );
}

// ── D. ArchitectureDiagram ───────────────────────────────────────────────────

type DiagramType = 'flowchart' | 'sequence' | 'er' | 'class' | 'gantt' | 'mindmap';

interface ArchitectureDiagramProps {
  title: string;
  description: string;
  diagramType: DiagramType;
  owner: string;
  lastUpdated: string;
  sourceFile?: string;
  repoUrl?: string;
  mermaid: string;
}

const DIAGRAM_TYPE_COLORS: Record<DiagramType, { bg: string; color: string }> = {
  flowchart: { bg: '#dbeafe', color: '#2563eb' },
  sequence:  { bg: '#dcfce7', color: '#16a34a' },
  er:        { bg: '#f3e8ff', color: '#9333ea' },
  class:     { bg: '#ffedd5', color: '#ea580c' },
  gantt:     { bg: '#fef9c3', color: '#ca8a04' },
  mindmap:   { bg: '#ffe4e6', color: '#e11d48' },
};

export function ArchitectureDiagram({
  title, description, diagramType, owner, lastUpdated,
  sourceFile, repoUrl, mermaid
}: ArchitectureDiagramProps) {
  const [showSource, setShowSource] = useState(false);
  const dc = DIAGRAM_TYPE_COLORS[diagramType];

  return (
    <div className={styles.adContainer}>
      <div className={styles.adHeader}>
        <div className={styles.adHeaderLeft}>
          <div className={styles.sectionLabel}>Architecture Diagram</div>
          <h2 className={styles.adTitle}>{title}</h2>
          <p className={styles.adDescription}>{description}</p>
          <div className={styles.adMeta}>
            <span className={styles.badge} style={{ background: dc.bg, color: dc.color }}>
              {diagramType}
            </span>
            <span className={styles.adMetaItem}>👤 {owner}</span>
            <span className={styles.adMetaItem}>🗓 {lastUpdated}</span>
            {sourceFile && repoUrl && (
              <a
                href={`${repoUrl}/-/blob/main/${sourceFile}`}
                target="_blank"
                rel="noreferrer"
                className={styles.adSourceLink}
              >
                📄 View source
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={styles.adDiagramWrapper}>
        <Mermaid value={mermaid} />
      </div>

      {mermaid && (
        <details className={styles.adDetails} open={showSource} onToggle={e => setShowSource((e.target as HTMLDetailsElement).open)}>
          <summary className={styles.adDetailsSummary}>View raw Mermaid source</summary>
          <pre className={styles.codeBlock}><code>{mermaid}</code></pre>
        </details>
      )}

    </div>
  );
}

// ── E. CodeSnippetLibrary ────────────────────────────────────────────────────

interface Snippet {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  whenToUse: string;
  code: string;
  author?: string;
  addedDate?: string;
}

interface CodeSnippetLibraryProps {
  snippets: Snippet[];
}

const LANG_COLORS: Record<string, { bg: string; color: string }> = {
  python:     { bg: '#dbeafe', color: '#2563eb' },
  typescript: { bg: '#dcfce7', color: '#16a34a' },
  javascript: { bg: '#fef9c3', color: '#ca8a04' },
  mdx:        { bg: '#f3e8ff', color: '#9333ea' },
  bash:       { bg: '#ffedd5', color: '#ea580c' },
  yaml:       { bg: '#e2e8f0', color: '#475569' },
};

function getLangColor(lang: string) {
  return LANG_COLORS[lang.toLowerCase()] || { bg: '#f1f5f9', color: '#64748b' };
}

export function CodeSnippetLibrary({ snippets }: CodeSnippetLibraryProps) {
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Collect all unique tags
  const allTags = Array.from(new Set(snippets.flatMap(s => s.tags))).sort();

  function toggleTag(tag: string) {
    setActiveTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function copySnippet(snippet: Snippet) {
    navigator.clipboard.writeText(snippet.code).then(() => {
      setCopied(snippet.id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const filtered = snippets.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.language.toLowerCase().includes(search.toLowerCase());
    const matchTags = activeTags.size === 0 || s.tags.some(t => activeTags.has(t));
    return matchSearch && matchTags;
  });

  return (
    <div className={styles.cslContainer}>
      <div className={styles.cslHeader}>
        <div className={styles.sectionLabel}>Code Snippet Library</div>
        <div className={styles.cslControls}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search snippets…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className={styles.cslCount}>{filtered.length} snippet{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className={styles.cslTagFilters}>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`${styles.cslTagChip} ${activeTags.has(tag) ? styles.cslTagChipActive : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.cslGrid}>
        {filtered.map(snippet => {
          const lc = getLangColor(snippet.language);
          const isExpanded = expanded.has(snippet.id);
          return (
            <div key={snippet.id} className={styles.cslCard}>
              <div className={styles.cslCardHeader}>
                <div>
                  <h3 className={styles.cslCardTitle}>{snippet.title}</h3>
                  <p className={styles.cslCardDesc}>{snippet.description}</p>
                </div>
                <span
                  className={styles.badge}
                  style={{ background: lc.bg, color: lc.color, flexShrink: 0 }}
                >
                  {snippet.language}
                </span>
              </div>

              <div className={styles.cslTags}>
                {snippet.tags.map(tag => (
                  <span key={tag} className={styles.cslTag}>{tag}</span>
                ))}
              </div>

              <div className={styles.cslWhenToUse}>
                <button
                  className={styles.cslWhenToUseToggle}
                  onClick={() => toggleExpand(snippet.id)}
                >
                  {isExpanded ? '▼' : '▶'} When to use
                </button>
                {isExpanded && (
                  <p className={styles.cslWhenToUseText}>{snippet.whenToUse}</p>
                )}
              </div>

              <div className={styles.cslCodeWrapper}>
                <pre className={styles.codeBlock}><code>{snippet.code}</code></pre>
                <button
                  className={`${styles.cslCopyBtn} ${copied === snippet.id ? styles.cslCopyBtnCopied : ''}`}
                  onClick={() => copySnippet(snippet)}
                >
                  {copied === snippet.id ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>

              {(snippet.author || snippet.addedDate) && (
                <div className={styles.cslFooter}>
                  {snippet.author && <span>@{snippet.author}</span>}
                  {snippet.addedDate && <span>{snippet.addedDate}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className={styles.emptyState}>No snippets match your search or filters.</div>
      )}
    </div>
  );
}
