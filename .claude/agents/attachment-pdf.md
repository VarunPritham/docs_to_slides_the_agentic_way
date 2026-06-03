# Agent: Attachment — PDF

Handle PDF attachments in the `AttachmentPanel` component.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (`AttachmentPanel`)
- Detection: `detectKind()` — `kind: 'pdf'`
- CSS: `.apDocCard`, `.apDocRow`, `.apKindBadge`, `.apKind_pdf`, `.apDownloadBtn`

## Supported Formats
| Extension | Notes |
|---|---|
| `.pdf` | Only extension. PDF/A, PDF/X and all PDF versions included. |

## TypeScript Interface
```typescript
interface Attachment {
  name: string;          // "architecture-spec.pdf"
  url: string;           // "/files/spec.pdf" or https URL
  kind?: 'pdf';          // auto-detected from .pdf extension
  size?: string;         // "1.2 MB"
  description?: string;  // "Full architecture specification"
}
```

## How It Renders
Download card row:
- 📄 icon (left)
- Filename (bold) + red `PDF` kind badge + file size
- Description in muted text below
- `↓ Download` button (right) — `<a href download target="_blank">`
- No inline preview (PDFs are binary — use an `<iframe>` embed if needed in future)

## Kind Badge
```css
.apKind_pdf { background:#fef2f2; color:#dc2626; }
[data-theme='dark'] .apKind_pdf { background:rgba(220,38,38,0.12); color:#fca5a5; }
```

## Render Logic (download card pattern)
```tsx
const others = resolved.filter(f => f.kind !== 'image' && f.kind !== 'video');
{others.map(f => {
  const meta = kindMeta[f.kind!];  // { icon: '📄', label: 'PDF' }
  return (
    <div key={f.name} className={styles.apDocCard}>
      <div className={styles.apDocRow}>
        <span className={styles.apDocIcon}>{meta.icon}</span>
        <div className={styles.apDocInfo}>
          <span className={styles.apFileName}>{f.name}</span>
          <div className={styles.apDocMeta}>
            <span className={`${styles.apKindBadge} ${styles.apKind_pdf}`}>{meta.label}</span>
            {f.size && <span className={styles.apFileSize}>{f.size}</span>}
            {f.description && <span className={styles.apFileDesc}>{f.description}</span>}
          </div>
        </div>
        <a href={f.url} download={f.name} className={styles.apDownloadBtn}
           target="_blank" rel="noreferrer">↓ Download</a>
      </div>
    </div>
  );
})}
```

## MDX Usage
```mdx
import { AttachmentPanel } from '@site/src/components/PageLayouts/wave6';

<AttachmentPanel title="Compliance Documents" files={[
  { name: "sox-itgc-report-q1-2026.pdf", url: "/files/sox-report.pdf",
    size: "3.4 MB", description: "SOX ITGC audit report — Q1 2026" },
  { name: "pen-test-results.pdf", url: "/files/pen-test.pdf",
    size: "890 KB", description: "External penetration test findings" },
]} />
```

## Common Use Cases
- Audit reports in ITControlEvidence
- Architecture specifications in ADR
- CAB sign-off documents in ChangeRequest
- Test reports in SDLCGateChecklist
- Meeting minutes exports from MeetingNotes

## Validation
- [ ] 📄 icon shown
- [ ] Red `PDF` badge renders (light and dark mode)
- [ ] `↓ Download` opens file in new tab / triggers browser download
- [ ] File size shown when provided
- [ ] Description shown in muted text
- [ ] No "Preview" button (PDFs are not previewable inline)
