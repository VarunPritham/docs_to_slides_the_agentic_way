# /init — Full Project Bootstrap

Spin up the complete docs-site (and optionally the slide generation pipeline) from scratch in the current directory.

Run this command once in a **fresh empty folder**. It will:
1. Ask 6 config questions
2. Scaffold Docusaurus
3. Install all packages
4. Write every layout component, CSS module, and config file
5. Create demo MDX pages for every layout
6. Start the dev server

---

## Step 0 — Collect config

Before writing any files, ask the user for:

1. **Site title** — e.g. `Platform Docs` (used in docusaurus.config.ts `title` and navbar)
2. **Internal domain** — e.g. `docs.yourfirm.com` (used in `url` field)
3. **npm registry** — leave blank to use the public registry; otherwise e.g. `https://nexus.yourfirm.com/repository/npm/`
4. **Brand navy colour** — hex code for the primary dark colour, default `#003087`
5. **Brand blue colour** — hex code for the accent colour, default `#00AEEF`
6. **Include slide generation pipeline?** — yes / no (Python FastAPI + LangGraph)
7. **Include ArchitectureDiagram layout?** — yes / no (requires `@docusaurus/theme-mermaid` from npm)

Store the answers in variables for use throughout the rest of this command. If the user skips a question, use the default.

---

## Step 1 — Set npm registry (if provided)

If the user gave a custom npm registry, run:
```bash
npm config set registry <REGISTRY_URL>
```

---

## Step 2 — Scaffold Docusaurus

```bash
npx create-docusaurus@latest docs-site classic --typescript --skip-install
cd docs-site
```

Then set up `package.json` with the correct name and delete the default boilerplate content from `docs/` and `src/pages/` (keep the folder structure, clear the content):
```bash
rm -rf docs/tutorial* docs/intro.md src/pages/index.*  src/css/custom.css src/components
```

---

## Step 3 — Install packages

```bash
cd docs-site
npm install
```

Then install the extras:
```bash
npm install @docusaurus/faster
```

If the user said **yes** to ArchitectureDiagram:
```bash
npm install @docusaurus/theme-mermaid
```

If the user said **yes** to the slide generation pipeline, also install Slidev runner (npx-based, no install needed) and note the Python deps separately.

---

## Step 4 — Write `docusaurus.config.ts`

Write `docs-site/docusaurus.config.ts` with:
- `title` from user input
- `url` from user input (`https://<domain>`)
- `baseUrl: '/'`
- `organizationName` and `projectName` from user input
- `themes: []` — add `'@docusaurus/theme-mermaid'` only if user said yes
- `markdown: { mermaid: true }` — only if user said yes to ArchitectureDiagram
- `themeConfig.mermaid: { theme: { light: 'neutral', dark: 'dark' } }` — only if yes
- Standard navbar: title + GitHub link placeholder
- Standard footer: three columns — Learn / API / Project
- `plugins: []` — empty unless user adds openapi later

Full template:
```typescript
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: '<SITE_TITLE>',
  tagline: '<tagline>',
  favicon: 'img/favicon.ico',
  url: 'https://<YOUR_INTERNAL_DOMAIN>',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: { defaultLocale: 'en', locales: ['en'] },
  // ADD: themes: ['@docusaurus/theme-mermaid'] if mermaid enabled
  // ADD: markdown: { mermaid: true } if mermaid enabled
  presets: [
    ['classic', {
      docs: { sidebarPath: './sidebars.ts', editUrl: undefined },
      blog: false,
      theme: { customCss: './src/css/custom.css' },
    } satisfies Preset.Options],
  ],
  themeConfig: {
    navbar: {
      title: '<SITE_TITLE>',
      items: [
        { type: 'docSidebar', sidebarId: 'mainSidebar', position: 'left', label: 'Docs' },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `© ${new Date().getFullYear()} <YOUR_TEAM>`,
    },
    prism: { theme: require('prism-react-renderer').themes.github,
             darkTheme: require('prism-react-renderer').themes.dracula },
    // ADD: mermaid: { theme: { light: 'neutral', dark: 'dark' } } if mermaid enabled
  } satisfies Preset.ThemeConfig,
};
export default config;
```

---

## Step 5 — Write `src/css/custom.css`

Write the full CSS variable palette. Use the brand colours from user input (defaults: `#003087` and `#00AEEF`):

```css
/**
 * Global CSS Variables
 * Override --brand-navy and --brand-blue to match your firm's palette.
 */

/* ── Brand palette ── */
:root {
  --brand-navy:          <BRAND_NAVY>;
  --brand-navy-mid:      <BRAND_NAVY_MID>;   /* lighten navy by ~20% */
  --brand-blue:          <BRAND_BLUE>;
  --brand-blue-light:    <BRAND_BLUE_LIGHT>; /* 10% opacity of brand-blue on white */
}

/* ── Docusaurus overrides (light mode) ── */
:root {
  --ifm-color-primary:              var(--brand-blue);
  --ifm-color-primary-dark:         var(--brand-navy-mid);
  --ifm-color-primary-darker:       var(--brand-navy);
  --ifm-color-primary-darkest:      var(--brand-navy);
  --ifm-color-primary-light:        var(--brand-blue-light);
  --ifm-color-primary-lighter:      var(--brand-blue-light);
  --ifm-color-primary-lightest:     var(--brand-blue-light);
  --ifm-code-font-size:             95%;
  --docusaurus-highlighted-code-line-bg: rgba(0,0,0,0.1);
}

/* ── Surface & border tokens (light) ── */
:root {
  --surface-1:     #f4f7fb;
  --surface-2:     #e8f0fb;
  --border-color:  #d0dbe8;
  --text-muted:    #4a5568;
}

/* ── Dark mode overrides ── */
[data-theme='dark'] {
  --ifm-color-primary:  var(--brand-blue);
  --surface-1:          #1e2a3a;
  --surface-2:          #243042;
  --border-color:       #2d3e55;
  --text-muted:         #8899aa;
  --docusaurus-highlighted-code-line-bg: rgba(0,0,0,0.3);
}

/* ── Mermaid dark mode fix (only needed if @docusaurus/theme-mermaid installed) ── */
[data-theme='dark'] .docusaurus-mermaid-container svg,
[data-theme='dark'] [class*='adDiagramWrapper'] svg {
  background: transparent !important;
}
[data-theme='dark'] .docusaurus-mermaid-container rect.background,
[data-theme='dark'] [class*='adDiagramWrapper'] rect.background {
  fill: transparent !important;
}
```

Compute `--brand-navy-mid` as a ~20% lighter version of the navy, and `--brand-blue-light` as a 10% opacity tint of the blue on white.

---

## Step 6 — Create `src/components/PageLayouts/` directory

```bash
mkdir -p docs-site/src/components/PageLayouts
```

Then build each file by following the corresponding agent file:

### 6a — `styles.module.css`
Follow `.claude/rules/06-layouts.md` CSS section for index.tsx components.
Must include: all `.infoPanel`, `.panelInfo`, `.panelDanger`, etc. classes WITH their `[data-theme='dark']` rgba overrides. All `.runbookStep`, `.sevLow`, `.sevCritical`, etc. severity classes. See `.claude/agents/layout-info-panel.md` and `.claude/agents/layout-runbook-step.md` for exact class lists.

### 6b — `wave-styles.module.css`
Follow `.claude/rules/06-layouts.md` CSS section for wave5/wave6 components.
Must include: all `.cr*`, `.pir*`, `.sdlc*`, `.itc*` (wave5) and `.cw*`, `.cl*`, `.er*`, `.ad*`, `.csl*`, `.ap*` (wave6) class groups with `[data-theme='dark']` variants for every colour-coded badge.

### 6c — `index.tsx`
Follow `.claude/agents/layout-meta-block.md` through `.claude/agents/layout-on-call-rota.md` in order. Exports: `MetaBlock`, `InfoPanel`, `ADR`, `RunbookStep`, `ApiTryIt`, `ServiceDashboard`, `MeetingNotes`, `TeamGrid`, `TeamCard`, `DecisionTable`, `RetroBoard`, `OnCallRota`. Imports `Attachment` and `AttachmentPanel` from `./wave6`.

### 6d — `wave5.tsx`
Follow `.claude/agents/layout-change-request.md`, `.claude/agents/layout-incident-postmortem.md`, `.claude/agents/layout-sdlc-gate-checklist.md`, `.claude/agents/layout-it-control-evidence.md`. Imports `Attachment` and `AttachmentPanel` from `./wave6`.

### 6e — `wave6.tsx`
Follow `.claude/agents/layout-code-walkthrough.md`, `.claude/agents/layout-changelog-page.md`, `.claude/agents/layout-environment-reference.md`, `.claude/agents/layout-architecture-diagram.md` (skip if user said no to Mermaid), `.claude/agents/layout-code-snippet-library.md`. Also build `AttachmentPanel` following all 9 `.claude/agents/attachment-*.md` files — this must come first in wave6.tsx as other files import from it.

---

## Step 7 — Write `sidebars.ts`

```typescript
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    { type: 'doc', id: 'intro', label: 'Introduction' },
    {
      type: 'category', label: '🧩 Layout Templates', collapsed: false,
      items: [
        { type: 'category', label: 'Ops & Incidents', items: [
          'templates/service-status',
          'templates/runbook-pipeline-failure',
          'templates/incident-postmortem',
          'templates/meeting-notes',
          'templates/team-directory',
          'templates/retro',
        ]},
        { type: 'category', label: 'Architecture', items: [
          'templates/adr-001',
          'templates/rfc-002-async-messaging',
          // add 'templates/architecture-diagram' if mermaid enabled
        ]},
        { type: 'category', label: 'Compliance & Governance', items: [
          'templates/change-request',
          'templates/sdlc-gate-checklist',
          'templates/it-control-evidence',
        ]},
        { type: 'category', label: 'Docs as Code', items: [
          'templates/code-walkthrough',
          'templates/changelog',
          'templates/env-reference',
          'templates/code-snippets',
          'templates/attachment-demo',
        ]},
      ],
    },
  ],
};
export default sidebars;
```

---

## Step 8 — Write `docs/intro.md`

Simple intro page explaining what the docs site contains and how to use layouts.

---

## Step 9 — Create demo MDX pages

For each layout, create a minimal working demo under `docs/templates/`. Each page must:
- Have `---\nid: <id>\ntitle: <Title>\n---` frontmatter
- Import `MetaBlock` and the layout component
- Show a `<MetaBlock>` at the top
- Show one complete working example of the component with realistic firm-relevant data (not lorem ipsum, not personal names — use generic org names like "Platform Team", "SRE", "Compliance")

Create these pages (use the MDX Usage sections in each `.claude/agents/layout-*.md` as the template, replacing personal names and public URLs with generic firm-appropriate values):

| File | Layout demonstrated |
|---|---|
| `docs/templates/service-status.mdx` | ServiceDashboard + OnCallRota |
| `docs/templates/runbook-pipeline-failure.mdx` | RunbookStep × 5 + InfoPanel |
| `docs/templates/incident-postmortem.mdx` | IncidentPostMortem |
| `docs/templates/meeting-notes.mdx` | MeetingNotes |
| `docs/templates/team-directory.mdx` | TeamGrid |
| `docs/templates/retro.mdx` | RetroBoard |
| `docs/templates/adr-001.mdx` | ADR |
| `docs/templates/rfc-002.mdx` | ADR (RFC variant) |
| `docs/templates/architecture-diagram.mdx` | ArchitectureDiagram (skip if no Mermaid) |
| `docs/templates/change-request.mdx` | ChangeRequest |
| `docs/templates/sdlc-gate-checklist.mdx` | SDLCGateChecklist |
| `docs/templates/it-control-evidence.mdx` | ITControlEvidence |
| `docs/templates/code-walkthrough.mdx` | CodeWalkthrough |
| `docs/templates/changelog.mdx` | ChangelogPage |
| `docs/templates/env-reference.mdx` | EnvironmentReference |
| `docs/templates/code-snippets.mdx` | CodeSnippetLibrary |
| `docs/templates/attachment-demo.mdx` | AttachmentPanel (all file types) |

---

## Step 10 — Write `src/pages/index.tsx` (homepage)

Simple homepage with:
- Hero: site title + tagline from user config
- 4 cards linking to the layout categories
- "Built with Docusaurus" footer note

---

## Step 11 — (Optional) Pipeline setup

If the user said yes to the slide generation pipeline:

### 11a — Python files
Create at the project root (one level above `docs-site/`):
- `requirements.txt` — list all Python deps from `.claude/rules/00-firm-setup.md`
- `state.py` — follow `.claude/agents/extraction-agent.md` (PipelineState TypedDict)
- `llm.py` — LLM factory supporting `anthropic` and `databricks` providers
- `graph.py` — LangGraph StateGraph with 18 nodes following `.claude/rules/01-architecture.md`
- `server.py` — FastAPI bridge, `POST /generate` endpoint
- `main.py` — CLI entry point
- `agents/extraction.py` — follow `.claude/agents/extraction-agent.md`
- `agents/content.py` — follow `.claude/agents/content-agent.md`
- `agents/design.py` — follow `.claude/agents/design-agent.md`
- `agents/assembly.py` — follow `.claude/agents/assembly-agent.md`
- `tools/file_tools.py`, `tools/text_tools.py`, `tools/attachment_tools.py`, `tools/layout_tools.py`, `tools/code_tools.py` — follow `.claude/rules/03-tools.md`

### 11b — Slidev output project
```bash
mkdir -p output/slides
cd output/slides && npm init -y && npm install @slidev/cli @slidev/theme-seriph
```

### 11c — Docusaurus "Generate Slides" button
Swizzle the DocItem Footer component and inject the button. Follow the pattern in `.claude/rules/01-architecture.md` (Button click → POST /generate section).

---

## Step 12 — Start the site

```bash
cd docs-site && npm start
```

Then confirm to the user:
- ✅ Docusaurus running at http://localhost:3000
- ✅ All layout components created (list count)
- ✅ All demo pages created (list count)
- ⚠️ Any packages that couldn't be installed (e.g. if npm registry was blocked)
- (If pipeline) ✅ Python pipeline ready — run `python server.py` to start on :8000

---

## Error handling

- If `npm install` fails due to registry: print the exact packages that failed and instruct the user to add them to their internal mirror
- If `@docusaurus/theme-mermaid` can't be installed but user said yes to ArchitectureDiagram: skip that layout and warn — add it later when the package is available
- If the `docs-site/` directory already exists: stop and ask the user whether to overwrite or abort
- Never commit secrets or API keys — remind the user to set env vars after setup
