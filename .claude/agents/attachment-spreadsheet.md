# Agent: Attachment — Spreadsheet

Handle spreadsheet attachments in the `AttachmentPanel` component.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (`AttachmentPanel`)
- Detection: `detectKind()` — `kind: 'spreadsheet'`
- CSS: `.apKind_spreadsheet`

## Supported Formats
| Extension | Notes |
|---|---|
| `.xlsx` | Excel Open XML (Office 2007+) — most common |
| `.xls` | Legacy Excel binary format |
| `.csv` | Comma-separated values — plaintext, previewable |
| `.ods` | LibreOffice / OpenDocument spreadsheet |
| `.tsv` | Tab-separated values — like CSV |

## TypeScript Interface
```typescript
interface Attachment {
  name: string;          // "access-review.csv"
  url: string;           // "/files/access-review.csv"
  kind?: 'spreadsheet';  // auto-detected from extension
  size?: string;         // "12 KB"
  description?: string;  // "ITGC-001 quarterly user access review export"
  preview?: string;      // CSV/TSV content as string — shows collapsible preview
  language?: string;     // rarely needed; leave undefined for CSV
}
```

## How It Renders
Download card with:
- 📊 icon + filename + green `Spreadsheet` badge + size
- Description in muted text
- `↓ Download` button
- **CSV/TSV only**: if `preview` is provided, a `Preview` button appears — expands inline dark code block

## Kind Badge
```css
.apKind_spreadsheet { background:#f0fdf4; color:#16a34a; }
[data-theme='dark'] .apKind_spreadsheet { background:rgba(22,163,74,0.12); color:#86efac; }
```

## CSV Inline Preview
```typescript
// Only works when preview string is provided
interface Attachment {
  name: "access-review.csv",
  url: "/files/access-review.csv",
  size: "12 KB",
  preview: `username,role,last_login,status
alice,admin,2026-06-01,active
bob,reader,2026-05-15,active
carol,admin,2026-01-10,stale`,
}
```

The `preview` field is displayed in the dark code block when the user clicks Preview.
Only files where `kind` is `'config'`, `'code'`, or `'text'` show the Preview button in the base component. To add CSV preview support, the `canPreview` condition must be extended:

```typescript
// In wave6.tsx AttachmentPanel render:
const canPreview = ['config','code','text','spreadsheet'].includes(f.kind!) && !!f.preview;
```

## MDX Usage
```mdx
import { AttachmentPanel } from '@site/src/components/PageLayouts/wave6';

<AttachmentPanel title="Test Evidence" files={[
  { name: "test-results.xlsx", url: "/files/test-results.xlsx",
    size: "88 KB", description: "Full regression test results for v1.4.0" },
  { name: "access-review.csv", url: "/files/access-review.csv",
    size: "12 KB", description: "ITGC-001 quarterly user access export",
    preview: "username,role,last_login\nalice,admin,2026-06-01\nbob,reader,2026-05-15" },
]} />
```

## Common Use Cases
- User access review exports in ITControlEvidence
- Test result matrices in SDLCGateChecklist
- Financial impact assessments in ChangeRequest
- Incident metrics in IncidentPostMortem
- Attendance / action item tracking in MeetingNotes

## Validation
- [ ] 📊 icon shown
- [ ] Green `Spreadsheet` badge renders correctly (light and dark)
- [ ] `.xlsx` / `.xls` / `.ods` show only Download (no Preview — binary format)
- [ ] `.csv` with `preview` prop shows Preview button → inline dark code block
- [ ] `↓ Download` opens file correctly
