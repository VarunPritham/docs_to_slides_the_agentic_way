# Agent: Attachment — Config

Handle configuration file attachments in the `AttachmentPanel` component, including inline preview.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (`AttachmentPanel`)
- Detection: `detectKind()` — `kind: 'config'`
- CSS: `.apKind_config`, `.apPreviewBlock`, `.apPreviewBtn`

## Supported Formats
| Extension / Name | Notes |
|---|---|
| `.yaml` / `.yml` | Most common — Kubernetes, CI/CD, app config |
| `.json` / `.jsonc` | App config, API schemas, package.json |
| `.toml` | Rust/Python config (Cargo.toml, pyproject.toml) |
| `.env` / `.env.*` | dotenv files — **detected by name pattern, not extension** |
| `.ini` | Classic Windows/Linux config |
| `.conf` / `.cfg` | Nginx, Apache, generic config |
| `.properties` | Java/Spring config |
| `.xml` | Maven, Ant, Spring XML config |
| `.hcl` / `.tf` | Terraform / HashiCorp config |

## Dotfile Detection (Special Case)
Files like `.env`, `.env.local`, `.env.production` have no extension — their "extension" from `split('.').pop()` would be `env`, but dotfiles starting with `.` need explicit handling:

```typescript
// In detectKind() — runs BEFORE extension check:
const basename = name.split('/').pop() ?? name;
if (/^\.env(\.|$)/.test(basename)) return 'config';
```

This matches: `.env`, `.env.local`, `.env.production`, `.env.staging`, `.env.test`

## TypeScript Interface
```typescript
interface Attachment {
  name: string;          // "langgraph-config.yaml" or ".env.production"
  url: string;           // "/files/config.yaml"
  kind?: 'config';       // auto-detected
  size?: string;         // "1.1 KB"
  description?: string;  // "LangGraph pipeline execution config"
  preview?: string;      // file content as string — enables Preview button
  language?: string;     // syntax hint: "yaml", "json", "toml" (optional)
}
```

## How It Renders
Download card with:
- ⚙️ icon + filename + grey `Config` badge + size
- Description in muted text
- **`Preview` button** when `preview` prop is set → expands dark code block inline
- `↓ Download` button always present

Button label toggles `Preview` ↔ `Hide` via `expandedPreviews` Set state.

## Kind Badge
```css
.apKind_config { background:#f3f4f6; color:#374151; }
[data-theme='dark'] .apKind_config { background:rgba(55,65,81,0.15); color:#d1d5db; }
```

## Inline Preview State
```typescript
const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());

const togglePreview = (name: string) =>
  setExpandedPreviews(prev => {
    const next = new Set(prev);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });

const canPreview = ['config','code','text'].includes(f.kind!) && !!f.preview;
const open = expandedPreviews.has(f.name);
```

## Preview Block CSS
```css
.apPreviewBlock     { margin:0; background:#0f172a; padding:1rem 1.25rem; overflow-x:auto; }
.apPreviewBlock pre { color:#e2e8f0; font-size:0.8rem; margin:0; white-space:pre; }
```

## MDX Usage
```mdx
export const envContent = `ANTHROPIC_API_KEY=sk-ant-api03-[REDACTED]
LLM_PROVIDER=anthropic
PORT=8000
MAX_CONCURRENT_JOBS=4`;

export const yamlContent = `pipeline:
  name: docusaurus-to-slidev
  timeout_seconds: 120
llm:
  provider: anthropic`;

import { AttachmentPanel } from '@site/src/components/PageLayouts/wave6';

<AttachmentPanel title="Configuration Files" files={[
  { name: ".env.production", url: "/files/.env.production",
    size: "640 B", description: "Production environment variables (secrets redacted)",
    preview: envContent },
  { name: "langgraph-config.yaml", url: "/files/langgraph-config.yaml",
    size: "1.1 KB", description: "LangGraph pipeline execution config",
    language: "yaml", preview: yamlContent },
]} />
```

## MDX Gotcha — No Backtick Strings Inside JSX Props
MDX parses template literals in JSX attributes as MDX expressions. **Always define preview content as `export const` variables** above the JSX:
```mdx
// ✅ CORRECT — variable defined outside JSX
export const yamlContent = `key: value`;
<AttachmentPanel files={[{ preview: yamlContent }]} />

// ❌ WRONG — triple backtick inside JSX breaks MDX parser
<AttachmentPanel files={[{ preview: `key: value` }]} />
```

## Common Use Cases
- Deployment env vars (redacted) in ChangeRequest
- CI/CD config in SDLCGateChecklist evidence
- Kubernetes manifests in ADR
- Pipeline config in CodeWalkthrough
- Terraform state config in ITControlEvidence

## Validation
- [ ] ⚙️ icon shown
- [ ] Grey `Config` badge renders (light and dark)
- [ ] `.env` dotfile detected as `config` (not `unknown`)
- [ ] `.env.production` dotfile detected as `config`
- [ ] `preview` prop enables Preview button
- [ ] Preview expands inline dark code block
- [ ] Preview button toggles to `Hide` when open
- [ ] Multiple previews can be open independently (Set-based state)
- [ ] `↓ Download` present alongside Preview button
