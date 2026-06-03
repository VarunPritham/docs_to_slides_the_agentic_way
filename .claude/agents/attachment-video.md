# Agent: Attachment — Video

Handle video attachments in the `AttachmentPanel` component.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (`AttachmentPanel`)
- Detection: `detectKind()` — `kind: 'video'`
- CSS: `.apVideoList`, `.apVideoCard`, `.apVideoFrame`, `.apVideoNative`

## Supported Formats
| Format | Detection method | Player |
|---|---|---|
| `.mp4` | Extension | Native `<video controls>` |
| `.webm` | Extension | Native `<video controls>` |
| `.mov` | Extension | Native `<video controls>` |
| `.avi` | Extension | Native `<video controls>` |
| `.mkv` | Extension | Native `<video controls>` |
| `.m4v` | Extension | Native `<video controls>` |
| `youtube.com/watch?v=ID` | URL regex | `<iframe>` embed |
| `youtu.be/ID` | URL regex | `<iframe>` embed |
| `vimeo.com/ID` | URL regex | `<iframe>` embed |

## TypeScript Interface
```typescript
interface Attachment {
  name: string;          // "demo-walkthrough" or "walkthrough.mp4"
  url: string;           // file path OR YouTube/Vimeo URL
  kind?: 'video';        // auto-detected from extension or URL
  size?: string;         // "48 MB" — shown in header label
  description?: string;  // shown below player
}
```

## How It Renders
1. **Label row** — 🎬 icon + name + size
2. **YouTube** → `<iframe>` with `aspect-ratio: 16/9`, `allow` attributes for autoplay/fullscreen
3. **Vimeo** → `<iframe>` with `allow="autoplay; fullscreen; picture-in-picture"`
4. **Local file** → `<video controls>` — browser handles playback
5. **Description** — small muted text below player
6. Video section renders after images, before document cards

## URL → Embed Conversion
```typescript
const isYT    = (url: string) => /youtube\.com|youtu\.be/.test(url);
const isVimeo = (url: string) => /vimeo\.com/.test(url);

const ytEmbed = (url: string) => {
  const id = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : url;
};
const vimeoEmbed = (url: string) => {
  const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
  return id ? `https://player.vimeo.com/video/${id}` : url;
};
```

## Key CSS Classes
```css
.apVideoList   { display:flex; flex-direction:column; gap:0.75rem; padding:1rem 1.25rem;
                 border-bottom:1px solid var(--border-color); }
.apVideoCard   { display:flex; flex-direction:column; gap:0.5rem; }
.apVideoLabel  { display:flex; align-items:center; gap:0.5rem; font-size:0.83rem; }
.apVideoFrame  { width:100%; aspect-ratio:16/9; border:none; border-radius:8px; background:#000; }
.apVideoNative { width:100%; border-radius:8px; max-height:320px; }
```

## Render Logic
```tsx
const videos = resolved.filter(f => f.kind === 'video');
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
          <iframe className={styles.apVideoFrame} src={ytEmbed(f.url)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen />
        ) : isVimeo(f.url) ? (
          <iframe className={styles.apVideoFrame} src={vimeoEmbed(f.url)}
            allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        ) : (
          <video controls className={styles.apVideoNative} src={f.url} />
        )}
        {f.description && <p className={styles.apFileDesc}>{f.description}</p>}
      </div>
    ))}
  </div>
)}
```

## Detection: URL vs File
```typescript
// URL detection takes priority over extension
if (['mp4','webm','mov','avi','mkv','m4v'].includes(ext)
    || /youtube\.com|youtu\.be|vimeo\.com/.test(url)) return 'video';

// For YouTube/Vimeo, set name to a human-readable title:
{ name: "Sprint Demo — Sprint 4", url: "<YOUR_VIDEO_URL>" }
```

## MDX Usage
```mdx
import { AttachmentPanel } from '@site/src/components/PageLayouts/wave6';

<AttachmentPanel title="Demo Recordings" files={[
  { name: "Pipeline Walkthrough", url: "<YOUR_VIDEO_URL>",
    description: "End-to-end demo: click Generate Slides → Slidev" },
  { name: "incident-replay.mp4", url: "/videos/incident-replay.mp4",
    size: "48 MB", description: "Screen recording from incident INC-2026-0031" },
]} />
```

## Common Use Cases
- Sprint demo recordings linked from MeetingNotes
- Incident timeline replays in IncidentPostMortem
- Architecture walkthroughs in ADR
- Onboarding screencasts in RunbookStep

## Validation
- [ ] YouTube URL renders as embedded iframe (16:9)
- [ ] Vimeo URL renders as embedded iframe
- [ ] Local .mp4 renders as `<video controls>`
- [ ] Name + size shown in label row above player
- [ ] Description shown below player
- [ ] `kind: 'video'` override works when extension is absent (YouTube links)
