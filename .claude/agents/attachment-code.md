# Agent: Attachment — Code

Handle source code file attachments in the `AttachmentPanel` component, with inline preview.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (`AttachmentPanel`)
- Detection: `detectKind()` — `kind: 'code'`
- CSS: `.apKind_code`, `.apPreviewBlock`, `.apPreviewBtn`

## Supported Formats
| Extension | Language | Notes |
|---|---|---|
| `.py` | Python | Pipeline agents, scripts |
| `.ts` / `.tsx` | TypeScript | React components, configs |
| `.js` / `.jsx` / `.mjs` / `.cjs` | JavaScript | Node scripts |
| `.sh` / `.bash` / `.zsh` | Shell | Runbook scripts, deploy scripts |
| `.sql` | SQL | DB migrations, queries |
| `.go` | Go | Services, tools |
| `.rs` | Rust | Performance-critical tools |
| `.java` | Java | Enterprise services |
| `.rb` | Ruby | Scripts, Rake tasks |
| `.php` | PHP | Legacy services |
| `.cs` | C# | .NET services |
| `.cpp` / `.c` / `.h` | C/C++ | Native extensions |
| `.kt` | Kotlin | Android / JVM |
| `.swift` | Swift | iOS / macOS |
| `.r` | R | Data analysis |
| `.scala` | Scala | Spark jobs |

## TypeScript Interface
```typescript
interface Attachment {
  name: string;          // "state.py" or "rollback.sh"
  url: string;           // "/files/state.py"
  kind?: 'code';         // auto-detected from extension
  size?: string;         // "1.8 KB"
  description?: string;  // "PipelineState TypedDict — the shared Blackboard"
  preview?: string;      // file content as string — enables Preview button
  language?: string;     // "python", "bash", "typescript" — hint for future highlighting
}
```

## How It Renders
Download card with:
- 💻 icon + filename + teal `Code` badge + size
- Description in muted text
- **`Preview` button** when `preview` prop is set → expands inline dark code block
- `↓ Download` button always present

## Kind Badge
```css
.apKind_code { background:#f0fdfa; color:#0f766e; }
[data-theme='dark'] .apKind_code { background:rgba(15,118,110,0.12); color:#5eead4; }
```

## canPreview Logic
```typescript
const canPreview = ['config','code','text'].includes(f.kind!) && !!f.preview;
```

Code files use the same preview toggle mechanism as config files — per-file `expandedPreviews` Set.

## MDX Usage (variable pattern — required for multiline content)
```mdx
export const stateCode = `from typing import TypedDict

class PipelineState(TypedDict):
    source_path: str
    output_dir: str
    raw_content: str
    cleaned_content: str
    chunks: list
    slides: list
    output_path: str`;

export const rollbackScript = `#!/bin/bash
set -euo pipefail
PREV_TAG="\${1:-v1.3.2}"
pkill -f "python server.py" || true
git checkout "tags/$PREV_TAG" -- server.py agents/ tools/
pip install -r requirements.txt --quiet
nohup python server.py > /var/log/pipeline.log 2>&1 &
echo "Rollback complete. PID: $!"`;

import { AttachmentPanel } from '@site/src/components/PageLayouts/wave6';

<AttachmentPanel title="Source Files" files={[
  { name: "state.py", url: "/files/state.py", size: "1.8 KB",
    description: "PipelineState TypedDict — the shared Blackboard",
    language: "python", preview: stateCode },
  { name: "rollback.sh", url: "/files/rollback.sh", size: "920 B",
    description: "Emergency rollback script", language: "bash",
    preview: rollbackScript },
]} />
```

## Shell Script Gotcha in MDX
Shell scripts use `${}` variable syntax which conflicts with JS template literals. Escape dollar signs when embedding shell content in JS template literals:
```javascript
// ✅ Escaped
export const script = `PREV_TAG="\${1:-v1.3.2}"`;

// ❌ Unescaped — JS will try to interpolate ${ as a template expression
export const script = `PREV_TAG="${1:-v1.3.2}"`;
```

## Common Use Cases
- Pipeline agent source in CodeWalkthrough stops
- Migration scripts in ChangeRequest implementation tab
- Validation scripts as RunbookStep attachments
- DB migration `.sql` files in SDLCGateChecklist
- Analysis notebooks (`.py`) in IncidentPostMortem
- Terraform (`.tf`) modules in ADR

## Validation
- [ ] 💻 icon shown
- [ ] Teal `Code` badge renders (light and dark)
- [ ] All major extensions detected: `.py`, `.ts`, `.sh`, `.sql`, `.go`
- [ ] `preview` prop enables Preview button
- [ ] Preview block renders in dark (`#0f172a`) regardless of page mode
- [ ] Shell scripts with `${}` don't break when properly escaped
- [ ] Multiple code file previews open independently
- [ ] `↓ Download` present alongside Preview
