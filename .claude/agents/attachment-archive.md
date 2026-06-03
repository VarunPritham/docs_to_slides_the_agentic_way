# Agent: Attachment — Archive

Handle ZIP, tar, and other compressed archive attachments in the `AttachmentPanel` component.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (`AttachmentPanel`)
- Detection: `detectKind()` — `kind: 'archive'`
- CSS: `.apKind_archive`

## Supported Formats
| Extension | Notes |
|---|---|
| `.zip` | Most universal — deployment packages, evidence bundles |
| `.tar.gz` / `.tgz` | Linux/macOS common — log archives, source bundles |
| `.tar.bz2` | Higher compression than gzip |
| `.tar.xz` | Maximum compression |
| `.tar` | Uncompressed tape archive |
| `.gz` | Single-file gzip |
| `.bz2` | Single-file bzip2 |
| `.7z` | 7-Zip high compression |
| `.rar` | WinRAR archive |

## TypeScript Interface
```typescript
interface Attachment {
  name: string;          // "pipeline-server-1.4.0.zip" or "logs-2026-05-28.tar.gz"
  url: string;           // "/files/pipeline-server-1.4.0.zip"
  kind?: 'archive';      // auto-detected from extension
  size?: string;         // "4.1 MB"
  description?: string;  // "Deployment package — pipeline-server v1.4.0"
}
```

## Detection Priority
`.tar.gz`, `.tar.bz2`, `.tar.xz` are compound extensions — they are checked **before** single-extension matching to avoid the filename being classified by the `.gz` suffix alone:

```typescript
// In detectKind():
if (/\.(tar\.gz|tar\.bz2|tar\.xz)$/.test(name)) return 'archive';
// Then single-ext check:
if (['zip','tar','gz','bz2','xz','7z','rar','tgz'].includes(ext)) return 'archive';
```

## How It Renders
Download card with:
- 🗜️ icon + filename + amber `Archive` badge + size
- Description in muted text
- `↓ Download` button — no Preview (binary)

## Kind Badge
```css
.apKind_archive { background:#fef3c7; color:#92400e; }
[data-theme='dark'] .apKind_archive { background:rgba(146,64,14,0.12); color:#fcd34d; }
```

## MDX Usage
```mdx
import { AttachmentPanel } from '@site/src/components/PageLayouts/wave6';

<AttachmentPanel title="Deployment Packages" files={[
  { name: "pipeline-server-1.4.0.zip", url: "/releases/pipeline-server-1.4.0.zip",
    size: "4.1 MB", description: "Deployment package — pipeline-server v1.4.0" },
  { name: "logs-2026-05-28.tar.gz", url: "/logs/logs-2026-05-28.tar.gz",
    size: "18 MB", description: "Pipeline server logs from INC-2026-0031 window" },
  { name: "source-backup.tar.bz2", url: "/backups/source-backup.tar.bz2",
    size: "2.2 MB", description: "Full source backup pre-upgrade" },
]} />
```

## Common Use Cases
- Deployment packages in ChangeRequest implementation tab
- Log bundles for incident analysis in IncidentPostMortem
- Artefact evidence bundles in ITControlEvidence
- Test run outputs archived for SDLCGateChecklist
- Full environment snapshots for rollback reference

## Validation
- [ ] 🗜️ icon shown
- [ ] Amber `Archive` badge renders correctly (light and dark)
- [ ] `.zip` detected correctly
- [ ] `.tar.gz` detected as `archive` (not `text` from `.gz` suffix)
- [ ] `.tgz` detected as `archive`
- [ ] No `Preview` button (binary)
- [ ] `↓ Download` works
