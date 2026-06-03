# Firm Setup — Replicating This Project From Scratch

Use this file with Claude Code to rebuild the entire project at your firm.
All `.claude/agents/`, `.claude/commands/`, and `.claude/rules/` files are self-contained.
**No source code is required** — Claude Code regenerates everything from these files.

---

## Before You Start — Placeholders to Replace

Every `.claude/` file uses these tokens. Search-replace them once across the entire `.claude/` directory before running any agent:

| Token | Replace with |
|---|---|
| `<YOUR_REPO_URL>` | Your internal Git repo URL, e.g. `https://git.yourfirm.com/team/docs-site` |
| `<YOUR_ORG>` | Your GitHub org or internal SCM namespace |
| `<YOUR_DOMAIN>` | Your internal Docusaurus domain, e.g. `docs.yourfirm.com` |
| `<YOUR_TEAM>` | Your team name, e.g. `Platform Engineering` |
| `<YOUR_LLM_PROVIDER>` | `anthropic` or `databricks` (or your firm's LLM gateway) |
| `<YOUR_NPM_REGISTRY>` | Your internal npm registry, e.g. `https://nexus.yourfirm.com/repository/npm/` |

---

## npm Packages Required

### Standard (almost certainly already in your firm's npm mirror)
```
@docusaurus/core               ^3.x
@docusaurus/preset-classic     ^3.x
@docusaurus/faster             ^3.x
@mdx-js/react                  ^3.x
react                          ^19.x
react-dom                      ^19.x
typescript                     ~6.x
prism-react-renderer           ^2.x
clsx                           ^2.x
```

### Require explicit approval / internal mirroring

| Package | Version | Used by | Why needed |
|---|---|---|---|
| `@docusaurus/theme-mermaid` | `^3.x` | **ArchitectureDiagram** layout | Renders Mermaid diagrams. Without it, the component falls back to raw text. |
| `@docusaurus/theme-live-codeblock` | `^3.x` | API Reference page | Interactive code playground in docs. Can be omitted if not needed. |
| `docusaurus-plugin-openapi-docs` | `^5.x` | API Reference page | Auto-generates API docs from OpenAPI/Swagger YAML. Can be omitted if not needed. |
| `docusaurus-theme-openapi-docs` | `^5.x` | API Reference page | Theme for above. Omit together with the plugin. |

### If using the Python pipeline (slide generation)
```
langgraph          >= 0.2.0
langchain-core     compatible with above
anthropic          >= 0.40.0   (or your firm's LLM SDK)
fastapi            >= 0.111.0
uvicorn            >= 0.29.0
pydantic           >= 2.0.0
python-dotenv
```

### If using Databricks as LLM provider
```
databricks-sdk     (or mlflow with databricks integration)
```

---

## What Layouts Use Which Packages

| Layout | Extra package needed | Can omit? |
|---|---|---|
| `ArchitectureDiagram` | `@docusaurus/theme-mermaid` | Yes — remove the layout if Mermaid not approved |
| All others (index.tsx, wave5.tsx, wave6.tsx) | None beyond standard Docusaurus | No extras needed |

**All 24 other layouts** (RunbookStep, InfoPanel, ADR, ChangeRequest, IncidentPostMortem, SDLCGateChecklist, ITControlEvidence, CodeWalkthrough, ChangelogPage, EnvironmentReference, CodeSnippetLibrary, AttachmentPanel, etc.) use **only standard React + CSS modules** — no additional packages.

---

## Project Structure to Create

```
your-docs-project/
├── CLAUDE.md                    ← project overview for Claude Code
├── .claude/
│   ├── rules/                   ← reference documentation (these files)
│   ├── agents/                  ← component reproduction guides
│   └── commands/                ← slash commands
├── docs-site/                   ← Docusaurus site
│   ├── docs/
│   │   └── templates/           ← one .mdx per layout demo
│   ├── src/
│   │   ├── components/
│   │   │   └── PageLayouts/
│   │   │       ├── index.tsx        ← ops/incidents/team layouts
│   │   │       ├── styles.module.css
│   │   │       ├── wave5.tsx        ← compliance/governance layouts
│   │   │       ├── wave6.tsx        ← docs-as-code layouts + AttachmentPanel
│   │   │       └── wave-styles.module.css
│   │   ├── css/
│   │   │   └── custom.css       ← CSS variables + Mermaid dark mode overrides
│   │   └── pages/
│   │       └── index.tsx        ← homepage
│   ├── static/
│   ├── docusaurus.config.ts
│   ├── sidebars.ts
│   └── package.json
└── (optional: pipeline/)        ← slide generation pipeline
    ├── server.py
    ├── graph.py
    ├── state.py
    └── agents/
```

---

## Step-by-Step: Docs-Site Only (layouts, no pipeline)

### 1. Scaffold Docusaurus
```bash
npx create-docusaurus@latest docs-site classic --typescript
cd docs-site
```

Set your internal npm registry first if required:
```bash
npm config set registry <YOUR_NPM_REGISTRY>
```

### 2. Install extra packages
```bash
# Required for ArchitectureDiagram layout:
npm install @docusaurus/theme-mermaid

# Optional — only if you want the API reference page:
npm install docusaurus-plugin-openapi-docs docusaurus-theme-openapi-docs
```

### 3. Create the PageLayouts directory
```bash
mkdir -p src/components/PageLayouts
```

### 4. Use Claude Code to build each layout
With Claude Code open in your project root:
```
/add-layout RunbookStep
/add-layout InfoPanel
/add-layout ADR
# ... (see .claude/commands/add-layout.md for the full list)
```

Or ask Claude to reproduce a specific layout from its agent file:
```
Reproduce the RunbookStep layout using .claude/agents/layout-runbook-step.md
```

### 5. Configure Docusaurus for Mermaid (ArchitectureDiagram only)
In `docusaurus.config.ts`:
```typescript
themes: ['@docusaurus/theme-mermaid'],
markdown: { mermaid: true },
themeConfig: {
  mermaid: { theme: { light: 'neutral', dark: 'dark' } },
},
```

### 6. Set up CSS variables
Ask Claude to generate `src/css/custom.css` with:
```
Generate the CSS variable palette for the docs-site following .claude/rules/06-layouts.md#css-variable-palette
```

### 7. Add dark mode Mermaid fix (if using ArchitectureDiagram)
In `src/css/custom.css`:
```css
[data-theme='dark'] .docusaurus-mermaid-container svg {
  background: transparent !important;
}
[data-theme='dark'] .docusaurus-mermaid-container rect.background {
  fill: transparent !important;
}
```

---

## Step-by-Step: Full Pipeline (docs + slide generation)

### Python setup
```bash
python -m venv .venv && source .venv/bin/activate
pip install langgraph langchain-core anthropic fastapi uvicorn pydantic python-dotenv
```

Set your LLM credentials:
```bash
export ANTHROPIC_API_KEY=<YOUR_KEY>
# OR for Databricks:
export LLM_PROVIDER=databricks
export DATABRICKS_HOST=<YOUR_DATABRICKS_HOST>
export DATABRICKS_TOKEN=<YOUR_TOKEN>
```

### Use Claude Code to rebuild the pipeline
```
Reproduce the full LangGraph pipeline using .claude/agents/orchestrator-agent.md
```

Or phase by phase:
```
Reproduce Phase 1 (Extraction) using .claude/agents/extraction-agent.md
Reproduce Phase 2 (Content) using .claude/agents/content-agent.md
Reproduce Phase 3 (Design) using .claude/agents/design-agent.md
Reproduce Phase 4 (Assembly) using .claude/agents/assembly-agent.md
```

---

## Claude Code Workflow at Your Firm

### Reproducing a single layout
```bash
# Open Claude Code in your project
claude

# Then ask:
> Reproduce the ChangeRequest layout from .claude/agents/layout-change-request.md
> Add it to src/components/PageLayouts/wave5.tsx and create a demo page at docs/templates/change-request.mdx
```

### Adding a new layout from scratch
```bash
> /add-layout-compliance MyNewComplianceWidget --desc "Tracks approval chains for DR tests"
```

### Checking your setup
```bash
> /check-setup
```

---

## What is NOT in these files

The following are intentionally excluded — adapt them to your firm's standards:

- **Authentication** — Docusaurus has no auth by default. Add your firm's SSO/SAML plugin separately.
- **Deployment config** — no CI/CD pipeline definition included. Wire to your firm's CD tooling.
- **Internal brand colours** — the CSS variable palette uses a Deep Navy + Sky Blue scheme. Override `--brand-navy`, `--brand-blue`, `--brand-blue-light` in `custom.css` to match your firm's palette.
- **LLM keys / endpoints** — never commit these. Use your firm's secrets manager.
- **OpenAPI/Swagger specs** — the `static/openapi.yaml` in the reference is illustrative. Replace with your actual API spec.
