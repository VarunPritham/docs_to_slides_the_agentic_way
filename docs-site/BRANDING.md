# Barclays Branding Checklist

Everything needed to white-label this site for Barclays internal use.
Search all files for the string `REPLACE` to find every placeholder.

---

## 1. Colours  →  `src/css/custom.css`

| Token | Current (placeholder) | Replace with |
|---|---|---|
| `--ifm-color-primary` | `#4f46e5` | `#00AEEF` (Barclays Sky Blue) |
| `--ifm-color-primary-darkest` | `#312e81` | `#003087` (Barclays Deep Navy) |
| Hero background gradient | `#0f172a → #1e1b4b` | `#003087 → #001a4d` |
| Announcement bar bg | `#4f46e5` | `#003087` |

Full Barclays colour ramp (Sky Blue shades):
```
#99dff9  lightest
#66cff6  lighter
#33bef3  light
#00AEEF  PRIMARY ← main brand colour
#0099d6  dark
#007ab8  darker
#003087  darkest / Deep Navy
```

---

## 2. Fonts  →  `src/css/custom.css`

Replace the Google Fonts `@import` with your licensed Barclays typeface.
If using a CDN:
```css
@import url('https://fonts.internal.barclays.com/barclaysagate.css');
```
Or use `@font-face` blocks pointing to `static/fonts/`.
Then update:
```css
--ifm-font-family-base: 'BarclaysAgate', 'Segoe UI', system-ui, sans-serif;
```

---

## 3. Logos

| File to create | Where to put it | Used by |
|---|---|---|
| `barclays-logo.svg` | `static/img/` | Navbar (light mode) |
| `barclays-logo-white.svg` | `static/img/` | Navbar (dark mode) + Hero |
| `barclays-favicon.ico` | `static/img/` | Browser tab |
| `barclays-social-card.jpg` | `static/img/` | OG/Twitter card |

After adding files, update `docusaurus.config.ts`:
```ts
favicon: 'img/barclays-favicon.ico',
navbar: {
  logo: {
    src: 'img/barclays-logo.svg',
    srcDark: 'img/barclays-logo-white.svg',
    alt: 'Barclays',
  }
}
image: 'img/barclays-social-card.jpg',
```

And uncomment the logo `<img>` block in `src/pages/index.tsx`.

---

## 4. Site Text  →  `docusaurus.config.ts`

```ts
title:   'Barclays Engineering Hub'    // or your team's name
tagline: 'One place for every engineering decision'
url:     'https://docs.internal.barclays.com'
```

---

## 5. Navbar  →  `docusaurus.config.ts`

- Change `title: 'DocSlide AI'` → `'Barclays Engineering Hub'`
- Replace GitHub link with internal Bitbucket / GitLab URL, or remove it
- Add SSO login button if needed (use `navbar.items` custom HTML item)

---

## 6. Footer  →  `docusaurus.config.ts`

```ts
copyright: '© 2026 Barclays Bank PLC. Internal use only. | Legal | Privacy'
```
Add footer links to your internal Legal / Privacy / Accessibility pages.

---

## 7. Announcement Bar  →  `docusaurus.config.ts`

Update `content` to your internal launch message or remove the bar entirely:
```ts
announcementBar: {
  content: '📣 Now available to all Barclays engineering teams — <a href="/docs/intro">get started</a>',
  backgroundColor: '#003087',
  textColor: '#ffffff',
}
```

---

## 8. MetaBlock default owner  →  MDX files under `docs/`

Each page has `owner: '...'` and `team: '...'` in its `<MetaBlock>`.
Update these to real Barclays team names as you populate the hub.

---

## Quick "am I done?" check

Run this to find every remaining placeholder:
```bash
grep -r "REPLACE" docs-site/src docs-site/docusaurus.config.ts --include="*.ts" --include="*.tsx" --include="*.css"
```
Zero results = fully branded. ✅
