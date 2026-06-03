# Agent: Attachment — Text

Handle plain text, log, and markdown file attachments in the `AttachmentPanel` component.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (`AttachmentPanel`)
- Detection: `detectKind()` — `kind: 'text'`
- CSS: `.apKind_text`, `.apPreviewBlock`

## Supported Formats
| Extension | Notes |
|---|---|
| `.txt` | Plain text — notes, readmes, raw exports |
| `.log` | Application/server logs — most common use case |
| `.md` | Markdown — release notes, changelogs, READMEs |
| `.mdx` | MDX source files — Docusaurus page source |
| `.rst` | reStructuredText — Python project docs |
| `.nfo` | Info files — release packages |
| `.diff` / `.patch` | Git diffs, patch files |

## TypeScript Interface
```typescript
interface Attachment {
  name: string;          // "incident-2026-05-28.log" or "release-notes.md"
  url: string;           // "/files/incident.log"
  kind?: 'text';         // auto-detected from extension
  size?: string;         // "44 KB"
  description?: string;  // "Pipeline server logs from OOM crash window"
  preview?: string;      // file content excerpt — enables Preview button
}
```

## How It Renders
Download card with:
- 📋 icon + filename + grey `Text` badge + size
- Description in muted text
- **`Preview` button** when `preview` prop is set → inline dark `<pre>` block
- `↓ Download` button always present

For log files: show only a representative excerpt in `preview` — not the full file (which may be MBs).

## Kind Badge
```css
.apKind_text { background:#f9fafb; color:#4b5563; }
[data-theme='dark'] .apKind_text { background:rgba(75,85,99,0.12); color:#9ca3af; }
```

## MDX Usage
```mdx
export const logExcerpt = `2026-05-28 09:00:01 INFO  server.py:42   Pipeline server started. PID=18821
2026-05-28 09:12:33 INFO  graph.py:88    Job started: docs/architecture.mdx
2026-05-28 09:14:11 WARN  assembly.py:61 Memory pressure detected: 1.8GB / 2.0GB
2026-05-28 09:14:18 ERROR server.py:99   OOMKilled — process exceeded memory limit
MemoryError: Unable to allocate 512 MiB`;

export const releaseNotes = `# Release Notes — v1.4.0 (2026-06-07)

## Breaking Changes
- LangGraph 0.2.x: StateGraph API changed
- Pydantic v2: .dict() removed, use .model_dump()

## New Features
- AttachmentPanel across all layouts
- Dark mode Mermaid diagrams`;

import { AttachmentPanel } from '@site/src/components/PageLayouts/wave6';

<AttachmentPanel title="Logs & Notes" files={[
  { name: "incident-2026-05-28.log", url: "/logs/incident-2026-05-28.log",
    size: "44 KB", description: "Pipeline OOM crash logs (09:00–10:47 BST)",
    preview: logExcerpt },
  { name: "release-notes-v1.4.0.md", url: "/files/release-notes-v1.4.0.md",
    size: "2.1 KB", description: "Full release notes for pipeline-server v1.4.0",
    preview: releaseNotes },
  { name: "deployment.diff", url: "/files/deployment.diff",
    size: "3.8 KB", description: "Git diff for the LangGraph 0.2.x migration" },
]} />
```

## Log File Best Practice
Don't put entire large log files in `preview` — show a representative excerpt of the critical window:
```typescript
// Good — excerpt covering the failure
preview: `09:14:11 WARN  Memory pressure detected: 1.8GB
09:14:18 ERROR OOMKilled
MemoryError: Unable to allocate 512 MiB`

// Avoid — full 44KB log as a string in the page bundle
preview: entireLogFileContent  // slows page load
```

## Common Use Cases
- Incident server logs in IncidentPostMortem
- Change diff files in ChangeRequest
- Release notes in ChangelogPage or RunbookStep
- README / onboarding text files in MeetingNotes
- Patch files in SDLCGateChecklist evidence

## Validation
- [ ] 📋 icon shown
- [ ] Grey `Text` badge renders (light and dark)
- [ ] `.log`, `.txt`, `.md`, `.diff` all detected as `text`
- [ ] `preview` enables Preview button — collapses to dark code block
- [ ] Log excerpt renders with monospace fixed-width font
- [ ] `↓ Download` present
- [ ] Large log file previews are truncated to a meaningful excerpt (not the full file)
