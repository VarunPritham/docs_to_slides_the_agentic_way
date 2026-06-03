import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// ═══════════════════════════════════════════════════════════════
// BARCLAYS BRANDING — replace all REPLACE markers below
//
//  1. title       → e.g. "Barclays Engineering Hub"
//  2. tagline     → your team's strapline
//  3. favicon     → drop barclays-favicon.ico into static/img/
//  4. url         → your internal hosting URL
//  5. navbar logo → drop barclays-logo.svg into static/img/
//  6. navbar title→ your hub name
//  7. footer copy → Barclays copyright line
// ═══════════════════════════════════════════════════════════════

const config: Config = {
  title: 'DocSlide AI',        // REPLACE → 'Barclays Engineering Hub'
  tagline: 'Docs to Slidev presentations — powered by 18 AI agents', // REPLACE → your strapline
  favicon: 'img/favicon.ico', // REPLACE → 'img/barclays-favicon.ico'

  future: {
    v4: true,
  },

  url: 'https://your-docusaurus-site.example.com', // REPLACE → internal hosting URL e.g. https://docs.internal.barclays.com
  baseUrl: '/',

  organizationName: 'varunpritham', // REPLACE → 'barclays'
  projectName: 'docusaurus-to-slidev', // REPLACE → your repo name

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  /* ── Themes ──────────────────────────────────────────────── */
  themes: [
    'docusaurus-theme-openapi-docs',
    '@docusaurus/theme-live-codeblock',
    '@docusaurus/theme-mermaid',
  ],

  markdown: {
    mermaid: true,
  },

  /* ── Plugins ─────────────────────────────────────────────── */
  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'api',
        docsPluginId: 'classic',
        config: {
          pipeline: {
            specPath: 'static/openapi.yaml',
            outputDir: 'docs/api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          },
        },
      },
    ],
  ],

  /* ── Presets ─────────────────────────────────────────────── */
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          docItemComponent: '@theme/ApiItem',   // OpenAPI page layout
          editUrl: undefined,
        },
        blog: false,                             // hide blog for cleaner nav
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  /* ── Theme config ────────────────────────────────────────── */
  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',

    /* Dark mode default, respects system preference */
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    /* Live code blocks */
    liveCodeBlock: {
      playgroundPosition: 'bottom',
    },

    /* Announcement bar — REPLACE content/colour for Barclays */
    announcementBar: {
      id: 'launch',
      content: '🚀 <strong>DocSlide AI</strong> — click "Generate Slides" on any doc page to create a Slidev deck instantly',
      backgroundColor: '#003087',
      textColor: '#ffffff',
      isCloseable: true,
    },

    /* ── NAVBAR ─────────────────────────────────────────────
       REPLACE:
         title  → 'Barclays Engineering Hub'  (or leave blank if logo says it all)
         logo.src → 'img/barclays-logo.svg'   (drop file in static/img/)
         logo.alt → 'Barclays'
         GitHub href → your internal Bitbucket/GitLab URL or remove entirely
    ─────────────────────────────────────────────────────── */
    navbar: {
      title: 'DocSlide AI',          // REPLACE → 'Barclays Engineering Hub'
      logo: {
        alt: 'DocSlide AI',          // REPLACE → 'Barclays'
        src: 'img/logo.svg',         // REPLACE → 'img/barclays-logo.svg'
        // srcDark: 'img/barclays-logo-white.svg',  // ← uncomment for dark-mode logo variant
      },
      hideOnScroll: false,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/agent-router',
          label: 'Agent Router',
          position: 'left',
        },
        {
          to: '/docs/api',
          label: 'API Reference',
          position: 'left',
        },
        // REPLACE href → your internal Bitbucket / GitLab URL, or remove this item
        {
          href: 'https://github.com/varunpritham/docusaurus-to-slidev',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub',
          label: 'GitHub',
        },
      ],
    },

    /* Footer */
    footer: {
      style: 'light',
      links: [
        {
          title: 'Learn',
          items: [
            { label: 'Introduction', to: '/docs/intro' },
            { label: 'Agent Router Pattern', to: '/docs/agent-router' },
          ],
        },
        {
          title: 'API',
          items: [
            { label: 'API Reference', to: '/docs/api' },
            { label: 'POST /generate', to: '/docs/api' },
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/varunpritham/docusaurus-to-slidev',
            },
          ],
        },
      ],
      // REPLACE → '© 2026 Barclays Bank PLC. Internal use only. | Legal | Privacy'
      copyright: `© ${new Date().getFullYear()} DocSlide AI. Built with Docusaurus.`,
    },

    /* Mermaid diagram theming */
    mermaid: {
      theme: { light: 'neutral', dark: 'dark' },
    },

    /* Code syntax highlighting */
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ['python', 'yaml', 'bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
