# Agent: Attachment — Document

Handle Word, PowerPoint, and other document attachments in the `AttachmentPanel` component.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (`AttachmentPanel`)
- Detection: `detectKind()` — `kind: 'document'`
- CSS: `.apKind_document`

## Supported Formats
| Extension | Type | Notes |
|---|---|---|
| `.docx` | Word (Office 2007+) | Most common for specs, assessments |
| `.doc` | Word (legacy) | Older binary format |
| `.pptx` | PowerPoint (Office 2007+) | Decks, presentations |
| `.ppt` | PowerPoint (legacy) | Older binary format |
| `.odt` | OpenDocument Text | LibreOffice equivalent of .docx |
| `.odp` | OpenDocument Presentation | LibreOffice equivalent of .pptx |
| `.rtf` | Rich Text Format | Cross-app compatible |

## TypeScript Interface
```typescript
interface Attachment {
  name: string;          // "impact-assessment.docx"
  url: string;           // "/files/impact-assessment.docx"
  kind?: 'document';     // auto-detected from extension
  size?: string;         // "340 KB"
  description?: string;  // "CAB impact assessment for upgrade CR-2026-0142"
}
```

## How It Renders
Download card with:
- 📝 icon + filename + blue `Document` badge + size
- Description in muted text
- `↓ Download` button — `<a href download target="_blank">`
- No inline preview (binary formats not renderable in browser without external library)

## Kind Badge
```css
.apKind_document { background:#eff6ff; color:#1d4ed8; }
[data-theme='dark'] .apKind_document { background:rgba(29,78,216,0.12); color:#93c5fd; }
```

## MDX Usage
```mdx
import { AttachmentPanel } from '@site/src/components/PageLayouts/wave6';

<AttachmentPanel title="CAB Package" files={[
  { name: "impact-assessment.docx", url: "/files/impact-assessment.docx",
    size: "340 KB", description: "CAB impact assessment — CR-2026-0142" },
  { name: "release-deck.pptx", url: "/files/release-deck.pptx",
    size: "2.8 MB", description: "v1.4.0 stakeholder release presentation" },
  { name: "rfc-002-async-messaging.odt", url: "/files/rfc-002.odt",
    size: "120 KB", description: "RFC-002 full specification document" },
]} />
```

## Common Use Cases
- CAB impact assessment + rollback plan in ChangeRequest
- RCA document draft in IncidentPostMortem
- RFC / design spec in ADR
- Stakeholder presentation decks in MeetingNotes
- Security assessment reports in ITControlEvidence

## Validation
- [ ] 📝 icon shown
- [ ] Blue `Document` badge renders correctly (light and dark)
- [ ] `.docx` / `.pptx` / `.odt` all detected correctly
- [ ] No `Preview` button appears (binary formats)
- [ ] `↓ Download` triggers browser download
- [ ] File size shown when provided
