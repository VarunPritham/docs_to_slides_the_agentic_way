# Agent: Attachment — Images

Handle image attachments in the `AttachmentPanel` component.

## Location
- Component: `docs-site/src/components/PageLayouts/wave6.tsx` (`AttachmentPanel`)
- Detection: `detectKind()` — `kind: 'image'`
- CSS: `docs-site/src/components/PageLayouts/wave-styles.module.css` (`.apImageGrid`, `.apThumb`, `.apLightbox`)

## Supported Formats
| Extension | Notes |
|---|---|
| `.png` | Most common — screenshots, diagrams |
| `.jpg` / `.jpeg` | Photos, compressed screenshots |
| `.gif` | Animated demos, status indicators |
| `.svg` | Architecture diagrams, logos — renders inline |
| `.webp` | Modern compressed images |
| `.bmp` | Legacy Windows bitmaps |
| `.tiff` | High-res scans, print assets |
| `.ico` | Favicon / icon files |

## TypeScript Interface
```typescript
interface Attachment {
  name: string;          // "architecture.png"
  url: string;           // relative path or absolute URL
  kind?: 'image';        // auto-detected from extension
  size?: string;         // "340 KB"
  description?: string;  // shown below thumbnail
}
```

## How It Renders
1. **Thumbnail grid** — wrapping flex row, max-height 150px per thumbnail, `object-fit: cover`
2. **Filename + size** — displayed below each thumbnail
3. **Description** — small muted text below filename
4. **Lightbox** — clicking any thumbnail sets `lightboxSrc` state, renders full-screen overlay with `✕` close button
5. Images section is rendered **before** videos and document cards in the panel

## Key CSS Classes
```css
.apImageGrid   { display:flex; flex-wrap:wrap; gap:0.75rem; padding:1rem 1.25rem; }
.apImageCard   { display:flex; flex-direction:column; gap:0.25rem; max-width:200px; }
.apThumb       { width:100%; max-height:150px; object-fit:cover; border-radius:8px;
                 cursor:zoom-in; border:1px solid var(--border-color); transition:opacity 0.15s; }
.apThumb:hover { opacity:0.85; }
.apLightbox    { position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:1000;
                 display:flex; align-items:center; justify-content:center; cursor:zoom-out; }
.apLightboxImg { max-width:90vw; max-height:90vh; object-fit:contain; border-radius:8px; }
.apLightboxClose { position:absolute; top:1rem; right:1rem; background:rgba(255,255,255,0.15);
                   border:none; color:#fff; font-size:1.25rem; width:36px; height:36px;
                   border-radius:50%; cursor:pointer; }
```

## State
```typescript
const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
```

## Render Logic
```tsx
// Auto-detection
const ext = basename.split('.').pop()?.toLowerCase();
if (['png','jpg','jpeg','gif','svg','webp','bmp','tiff','ico'].includes(ext)) return 'image';

// Rendering
const images = resolved.filter(f => f.kind === 'image');
{images.length > 0 && (
  <div className={styles.apImageGrid}>
    {images.map(f => (
      <div key={f.name} className={styles.apImageCard}>
        <img src={f.url} alt={f.name} className={styles.apThumb}
          onClick={() => setLightboxSrc(f.url)} />
        <div className={styles.apImageMeta}>
          <span className={styles.apFileName}>{f.name}</span>
          {f.size && <span className={styles.apFileSize}>{f.size}</span>}
        </div>
        {f.description && <p className={styles.apFileDesc}>{f.description}</p>}
      </div>
    ))}
  </div>
)}

// Lightbox
{lightboxSrc && (
  <div className={styles.apLightbox} onClick={() => setLightboxSrc(null)}>
    <img src={lightboxSrc} alt="full size" className={styles.apLightboxImg} />
    <button className={styles.apLightboxClose} onClick={() => setLightboxSrc(null)}>✕</button>
  </div>
)}
```

## MDX Usage
```mdx
import { AttachmentPanel } from '@site/src/components/PageLayouts/wave6';

<AttachmentPanel title="Architecture Diagrams" files={[
  { name: "pipeline-overview.png", url: "/img/pipeline-overview.png",
    size: "42 KB", description: "High-level pipeline flowchart" },
  { name: "dark-mode.svg", url: "/img/dark-mode.svg",
    size: "8 KB", description: "Dark mode brand palette" },
]} />
```

## Common Use Cases
- Architecture screenshots in ADRs
- Monitoring graph exports in IncidentPostMortem
- UI mockups in MeetingNotes
- Evidence screenshots in ITControlEvidence

## Validation
- [ ] Thumbnails render in a wrapping flex grid
- [ ] Clicking a thumbnail opens the full-screen lightbox
- [ ] Lightbox closes on overlay click or ✕ button
- [ ] Works in dark mode (borders use `var(--border-color)`)
- [ ] SVG files render as images (not as code)
- [ ] `description` shows below thumbnail in muted text
