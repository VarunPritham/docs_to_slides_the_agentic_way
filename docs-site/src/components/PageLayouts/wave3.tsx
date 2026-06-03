/**
 * Wave 3 — Data Governance Components
 * DataDictionary · DataContract · MLModelCard
 */
import React, { useState, type ReactNode } from 'react';
import styles from './wave-styles.module.css';

/* ================================================================
   DATA DICTIONARY / GLOSSARY
   ================================================================ */
type FieldType = 'string' | 'integer' | 'decimal' | 'boolean' | 'date' | 'timestamp' | 'enum' | 'array' | 'object';

interface DataField {
  name: string;
  type: FieldType;
  description: string;
  example?: string;
  nullable?: boolean;
  pii?: boolean;
  owner?: string;
  tags?: string[];
}

interface DataDictionaryProps {
  domain: string;
  entity: string;
  version: string;
  steward: string;
  fields: DataField[];
  description?: string;
}

const typeColors: Record<FieldType, { color: string; bg: string }> = {
  string:    { color: '#065f46', bg: '#d1fae5' },
  integer:   { color: '#1e40af', bg: '#dbeafe' },
  decimal:   { color: '#1e40af', bg: '#dbeafe' },
  boolean:   { color: '#5b21b6', bg: '#f3e8ff' },
  date:      { color: '#92400e', bg: '#fef3c7' },
  timestamp: { color: '#92400e', bg: '#fef3c7' },
  enum:      { color: '#9a3412', bg: '#ffedd5' },
  array:     { color: '#0f766e', bg: '#f0fdfa' },
  object:    { color: '#6b7280', bg: '#f3f4f6' },
};

export function DataDictionary({ domain, entity, version, steward, fields, description }: DataDictionaryProps) {
  const [search, setSearch] = useState('');
  const [piiOnly, setPiiOnly] = useState(false);
  const filtered = fields.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());
    const matchPii = piiOnly ? !!f.pii : true;
    return matchSearch && matchPii;
  });

  const piiCount = fields.filter(f => f.pii).length;

  return (
    <div className={styles.dataDict}>
      <div className={styles.dataDictHeader}>
        <div>
          <div className={styles.dataDictTitle}>{domain} · <strong>{entity}</strong></div>
          <div className={styles.dataDictMeta}>
            <span>v{version}</span>
            <span>Data Steward: {steward}</span>
            <span>{fields.length} fields</span>
            {piiCount > 0 && <span className={styles.piiWarning}>🔒 {piiCount} PII fields</span>}
          </div>
          {description && <div className={styles.dataDictDesc}>{description}</div>}
        </div>
        <div className={styles.dataDictControls}>
          <input
            className={styles.searchInput}
            placeholder="Search fields…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className={`${styles.piiToggle} ${piiOnly ? styles.piiToggleActive : ''}`}
            onClick={() => setPiiOnly(!piiOnly)}
          >
            🔒 PII only
          </button>
        </div>
      </div>

      <div className={styles.fieldTable}>
        <div className={styles.fieldTableHeader}>
          <span>Field</span><span>Type</span><span>Description</span>
          <span>Example</span><span>Flags</span>
        </div>
        {filtered.map(f => {
          const tc = typeColors[f.type];
          return (
            <div key={f.name} className={styles.fieldRow}>
              <span className={styles.fieldName}>{f.name}</span>
              <span className={styles.fieldType} style={{ color: tc.color, background: tc.bg }}>{f.type}</span>
              <span className={styles.fieldDesc}>{f.description}</span>
              <span className={styles.fieldExample}>{f.example ? <code>{f.example}</code> : '—'}</span>
              <span className={styles.fieldFlags}>
                {f.nullable && <span className={styles.flag}>nullable</span>}
                {f.pii      && <span className={styles.flagPii}>🔒 PII</span>}
                {f.tags?.map(t => <span key={t} className={styles.flag}>{t}</span>)}
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className={styles.emptyState}>No fields match your search.</div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   DATA CONTRACT
   ================================================================ */
type ContractStatus = 'active' | 'deprecated' | 'draft' | 'breached';

interface QualityRule { check: string; threshold: string; action: string }
interface SchemaField { name: string; type: string; required: boolean; description: string }

interface DataContractProps {
  contractId: string;
  name: string;
  producer: string;
  consumers: string[];
  status: ContractStatus;
  version: string;
  effectiveDate: string;
  reviewDate: string;
  sla: { freshness: string; availability: string; latency: string };
  schema: SchemaField[];
  qualityRules: QualityRule[];
  breakingChangePolicy: string;
}

const contractStatusConfig: Record<ContractStatus, { color: string; bg: string }> = {
  active:     { color: '#065f46', bg: '#d1fae5' },
  deprecated: { color: '#6b7280', bg: '#f3f4f6' },
  draft:      { color: '#92400e', bg: '#fef3c7' },
  breached:   { color: '#991b1b', bg: '#fee2e2' },
};

export function DataContract({ contractId, name, producer, consumers, status, version,
  effectiveDate, reviewDate, sla, schema, qualityRules, breakingChangePolicy }: DataContractProps) {
  const s = contractStatusConfig[status];
  return (
    <div className={styles.contract}>
      <div className={styles.contractHeader}>
        <div className={styles.contractMeta}>
          <span className={styles.contractId}>{contractId}</span>
          <span className={styles.badge} style={{ color: s.color, background: s.bg }}>{status}</span>
          <span className={styles.contractVersion}>v{version}</span>
        </div>
        <div className={styles.contractName}>{name}</div>
        <div className={styles.contractParties}>
          <div><span className={styles.partyLabel}>Producer</span>
            <span className={styles.partyValue}>{producer}</span></div>
          <div className={styles.partySep}>→</div>
          <div><span className={styles.partyLabel}>Consumers</span>
            <span className={styles.partyValue}>{consumers.join(', ')}</span></div>
        </div>
        <div className={styles.contractDates}>
          <span>Effective {effectiveDate}</span>
          <span>Review {reviewDate}</span>
        </div>
      </div>

      {/* SLA row */}
      <div className={styles.slaRow}>
        <div className={styles.slaItem}>
          <div className={styles.slaLabel}>Freshness</div>
          <div className={styles.slaValue}>{sla.freshness}</div>
        </div>
        <div className={styles.slaItem}>
          <div className={styles.slaLabel}>Availability</div>
          <div className={styles.slaValue}>{sla.availability}</div>
        </div>
        <div className={styles.slaItem}>
          <div className={styles.slaLabel}>Latency</div>
          <div className={styles.slaValue}>{sla.latency}</div>
        </div>
      </div>

      {/* Schema */}
      <div className={styles.contractSection}>
        <div className={styles.sectionLabel}>Schema</div>
        <div className={styles.schemaTable}>
          <div className={styles.schemaHeader}>
            <span>Field</span><span>Type</span><span>Required</span><span>Description</span>
          </div>
          {schema.map(f => (
            <div key={f.name} className={styles.schemaRow}>
              <code className={styles.schemaField}>{f.name}</code>
              <span className={styles.schemaType}>{f.type}</span>
              <span className={f.required ? styles.required : styles.optional}>
                {f.required ? 'Required' : 'Optional'}
              </span>
              <span className={styles.schemaDesc}>{f.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quality rules */}
      <div className={styles.contractSection}>
        <div className={styles.sectionLabel}>Quality Rules</div>
        <div className={styles.qualityList}>
          {qualityRules.map((r, i) => (
            <div key={i} className={styles.qualityRule}>
              <span className={styles.qualityCheck}>{r.check}</span>
              <span className={styles.qualityThreshold}>≥ {r.threshold}</span>
              <span className={styles.qualityAction}>{r.action}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.contractSection}>
        <div className={styles.sectionLabel}>Breaking Change Policy</div>
        <div className={styles.contractPolicy}>{breakingChangePolicy}</div>
      </div>
    </div>
  );
}

/* ================================================================
   ML MODEL CARD
   ================================================================ */
type ModelRiskTier = 'tier-1' | 'tier-2' | 'tier-3';
type ModelStatus   = 'development' | 'validation' | 'production' | 'retired' | 'under-review';

interface ModelMetric { name: string; value: string; threshold?: string; passing?: boolean }
interface BiasCheck   { group: string; metric: string; value: string; acceptable: boolean }

interface MLModelCardProps {
  modelId: string;
  name: string;
  version: string;
  owner: string;
  team: string;
  status: ModelStatus;
  riskTier: ModelRiskTier;
  lastValidated: string;
  nextReview: string;
  purpose: string;
  trainingData: string;
  inputFeatures: string[];
  outputDescription: string;
  performanceMetrics: ModelMetric[];
  biasChecks?: BiasCheck[];
  limitations: string[];
  regulatoryFramework?: string;
  validatedBy?: string;
}

const modelStatusConfig: Record<ModelStatus, { color: string; bg: string }> = {
  development:   { color: '#92400e', bg: '#fef3c7' },
  validation:    { color: '#1e40af', bg: '#dbeafe' },
  production:    { color: '#065f46', bg: '#d1fae5' },
  retired:       { color: '#6b7280', bg: '#f3f4f6' },
  'under-review':{ color: '#9a3412', bg: '#ffedd5' },
};

const riskTierConfig: Record<ModelRiskTier, { label: string; color: string }> = {
  'tier-1': { label: 'Tier 1 — High Risk',   color: '#991b1b' },
  'tier-2': { label: 'Tier 2 — Medium Risk',  color: '#92400e' },
  'tier-3': { label: 'Tier 3 — Low Risk',     color: '#065f46' },
};

export function MLModelCard({ modelId, name, version, owner, team, status, riskTier, lastValidated,
  nextReview, purpose, trainingData, inputFeatures, outputDescription, performanceMetrics,
  biasChecks, limitations, regulatoryFramework, validatedBy }: MLModelCardProps) {
  const s = modelStatusConfig[status];
  const r = riskTierConfig[riskTier];
  return (
    <div className={styles.modelCard}>
      <div className={styles.modelHeader}>
        <div className={styles.modelMeta}>
          <span className={styles.modelId}>{modelId}</span>
          <span className={styles.badge} style={{ color: s.color, background: s.bg }}>{status}</span>
          <span className={styles.riskTier} style={{ color: r.color }}>⚠️ {r.label}</span>
        </div>
        <div className={styles.modelName}>{name} <span className={styles.modelVersion}>v{version}</span></div>
        <div className={styles.modelByline}>
          <span>👤 {owner}</span><span>🏢 {team}</span>
          <span>✅ Validated {lastValidated}</span><span>🔄 Review {nextReview}</span>
          {validatedBy && <span>👀 {validatedBy}</span>}
          {regulatoryFramework && <span className={styles.regBadge}>{regulatoryFramework}</span>}
        </div>
      </div>

      <div className={styles.modelGrid}>
        <div className={styles.modelSection}>
          <div className={styles.sectionLabel}>Purpose</div>
          <div>{purpose}</div>
        </div>
        <div className={styles.modelSection}>
          <div className={styles.sectionLabel}>Training Data</div>
          <div>{trainingData}</div>
        </div>
        <div className={styles.modelSection}>
          <div className={styles.sectionLabel}>Output</div>
          <div>{outputDescription}</div>
        </div>
        <div className={styles.modelSection}>
          <div className={styles.sectionLabel}>Input Features ({inputFeatures.length})</div>
          <div className={styles.featureTags}>
            {inputFeatures.map(f => <span key={f} className={styles.featureTag}>{f}</span>)}
          </div>
        </div>
      </div>

      {/* Performance metrics */}
      <div className={styles.modelSection}>
        <div className={styles.sectionLabel}>Performance Metrics</div>
        <div className={styles.metricsGrid}>
          {performanceMetrics.map(m => (
            <div key={m.name} className={`${styles.metricBox} ${m.passing === false ? styles.metricFail : ''}`}>
              <div className={styles.metricName}>{m.name}</div>
              <div className={styles.metricValue}>{m.value}</div>
              {m.threshold && <div className={styles.metricThreshold}>threshold: {m.threshold}</div>}
              {m.passing !== undefined && (
                <div className={styles.metricStatus}>{m.passing ? '✅ Pass' : '❌ Fail'}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bias checks */}
      {biasChecks && biasChecks.length > 0 && (
        <div className={styles.modelSection}>
          <div className={styles.sectionLabel}>Bias & Fairness Checks</div>
          <div className={styles.biasTable}>
            <div className={styles.biasHeader}>
              <span>Group</span><span>Metric</span><span>Value</span><span>Result</span>
            </div>
            {biasChecks.map((b, i) => (
              <div key={i} className={styles.biasRow}>
                <span>{b.group}</span>
                <span>{b.metric}</span>
                <span>{b.value}</span>
                <span style={{ color: b.acceptable ? '#065f46' : '#991b1b' }}>
                  {b.acceptable ? '✅ Acceptable' : '❌ Review needed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limitations */}
      <div className={styles.modelSection}>
        <div className={styles.sectionLabel}>Known Limitations</div>
        <ul className={styles.limitationList}>
          {limitations.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      </div>
    </div>
  );
}
