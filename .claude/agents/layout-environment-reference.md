# Agent: EnvironmentReference Layout

Reproduce or modify the **EnvironmentReference** component — a searchable environment variable documentation table with secret masking.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (exported as `EnvironmentReference`)
- CSS: `docs-site/src/components/PageLayouts/wave-styles.module.css`
- Demo: `docs-site/docs/templates/env-reference-pipeline.mdx`

## What It Renders
- Header: service name, required count, optional count, optional config file chip
- Search input + two toggle checkboxes: "Required only" / "Secrets only"
- Table: Name / Required / Type / Default / Example / Description
  - Name column: monospace code + optional 🔒 secret badge
  - Type column: badge + enum values if `enumValues` set
  - Example column: `••••••••` masked by default for secrets, eye button to reveal
- Empty state if no variables match filters

## TypeScript Interface
```typescript
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
  configFile?: string;        // ".env.local"
  variables: EnvVar[];
}
```

## State
```typescript
const [search, setSearch] = useState('');
const [requiredOnly, setRequiredOnly] = useState(false);
const [secretOnly, setSecretOnly] = useState(false);
const [revealed, setRevealed] = useState<Set<string>>(new Set());
```

## Filter Logic
```typescript
const filtered = variables.filter(v => {
  const q = search.toLowerCase();
  const matchesSearch = !q || v.name.toLowerCase().includes(q) ||
    v.description.toLowerCase().includes(q) || v.type.includes(q);
  const matchesRequired = !requiredOnly || v.required;
  const matchesSecret = !secretOnly || v.secret;
  return matchesSearch && matchesRequired && matchesSecret;
});
```

## Secret Masking
```typescript
// In table cell for example column:
const isRevealed = revealed.has(v.name);
const displayValue = v.secret && !isRevealed ? '••••••••' : (v.example ?? '—');

// Eye toggle:
const toggleReveal = (name: string) => {
  setRevealed(prev => {
    const next = new Set(prev);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });
};
```

## Key CSS Classes
```css
.erContainer    { border:1px solid var(--border-color); border-radius:14px; overflow:hidden; margin:1.25rem 0; }
.erHeader       { padding:1.25rem 1.5rem; background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.erCounts       { display:flex; gap:0.75rem; margin-top:0.5rem; }
.erCount        { font-size:0.75rem; font-weight:600; padding:2px 8px; border-radius:6px; }
.erRequired     { background:#d1fae5; color:#065f46; }
.erOptional     { background:#dbeafe; color:#1e40af; }
.erConfigFile   { font-family:monospace; font-size:0.75rem; background:var(--surface-2); padding:2px 8px; border-radius:6px; }
.erControls     { display:flex; align-items:center; gap:1rem; flex-wrap:wrap; padding:0.75rem 1.5rem;
                  border-bottom:1px solid var(--border-color); background:var(--surface-1); }
.erSearch       { flex:1; min-width:200px; padding:6px 12px; border-radius:8px; font-size:0.83rem;
                  border:1px solid var(--border-color); background:var(--ifm-background-color); color:var(--ifm-font-color-base); }
.erToggle       { display:flex; align-items:center; gap:6px; font-size:0.8rem; cursor:pointer; }
.erTable        { width:100%; border-collapse:collapse; font-size:0.83rem; }
.erTable th     { background:var(--brand-navy,#003087); color:#fff; padding:0.5rem 0.75rem; text-align:left; font-size:0.72rem; }
.erTable td     { padding:0.5rem 0.75rem; border-bottom:1px solid var(--border-color); vertical-align:top; }
.erTable tr:last-child td { border-bottom:none; }
.erVarName      { font-family:monospace; font-weight:700; font-size:0.82rem; }
.erSecretBadge  { font-size:0.65rem; padding:1px 5px; border-radius:4px; background:#fee2e2; color:#991b1b; margin-left:4px; }
.erTypeBadge    { font-size:0.72rem; padding:2px 6px; border-radius:6px; background:var(--surface-2); color:var(--text-muted); }
.erMasked       { font-family:monospace; letter-spacing:0.1em; color:var(--text-muted); }
.erRevealBtn    { background:none; border:none; cursor:pointer; padding:0 0 0 6px; font-size:0.9rem; color:var(--text-muted); }
.erEmpty        { text-align:center; padding:2rem; color:var(--text-muted); font-size:0.85rem; }
```

## Reproduction Steps
1. Define `EnvVarType`, `EnvVar`, `EnvironmentReferenceProps`
2. 4× `useState` (search, requiredOnly, secretOnly, revealed)
3. Apply filter logic to `variables`
4. Render header: service name + counts + optional config file
5. Controls: search input + 2 checkboxes (required only / secrets only)
6. Table: required col has ✓/— badge, type col has type badge + enum values, example col has masking + eye toggle
7. Empty state if `filtered.length === 0`

## MDX Usage
```mdx
import { EnvironmentReference } from '@site/src/components/PageLayouts/wave6';

<EnvironmentReference
  service="docusaurus-to-slidev pipeline"
  configFile=".env.local"
  variables={[
    { name: "ANTHROPIC_API_KEY", required: true, type: "string", secret: true,
      example: "sk-ant-api03-<REDACTED>", description: "Anthropic API key for LLM calls. Omit to run in mock mode." },
    { name: "LLM_PROVIDER", required: false, type: "enum", default: "anthropic",
      enumValues: ["anthropic", "databricks"],
      description: "LLM backend provider. Switch without code changes." },
    { name: "DATABRICKS_HOST", required: false, type: "url",
      example: "https://<YOUR_DATABRICKS_HOST>",
      description: "Databricks workspace URL. Required only if LLM_PROVIDER=databricks." },
  ]}
/>
```

## Validation
- [ ] Search filters by name and description
- [ ] "Required only" hides optional variables
- [ ] "Secrets only" shows only variables with `secret: true`
- [ ] Secret example shows `••••••••` by default
- [ ] Eye button reveals/hides the real value
- [ ] Enum values display below type badge when `enumValues` is set
- [ ] Dark mode: search input and table use CSS vars (no hardcoded white bg)
