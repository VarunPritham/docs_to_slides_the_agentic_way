import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

/* ── Feature card data ─────────────────────────────────────── */
const features = [
  {
    icon: '🤖',
    iconClass: 'feature-icon-purple',
    title: 'AI-Powered Pipeline',
    desc: '18 specialised agents across 4 phases convert any MDX doc into a polished Slidev presentation automatically.',
  },
  {
    icon: '⚡',
    iconClass: 'feature-icon-blue',
    title: 'One-Click Generation',
    desc: 'Click "Generate Slides" in any doc footer. The pipeline runs, Slidev spins up, and your browser opens the deck.',
  },
  {
    icon: '🗺️',
    iconClass: 'feature-icon-teal',
    title: 'Agent Router Pattern',
    desc: 'Intent is extracted structurally — no hardcoded if/else. The capability graph is the single source of routing truth.',
  },
  {
    icon: '🎨',
    iconClass: 'feature-icon-pink',
    title: 'Smart Layout Selection',
    desc: 'Code, prose, images, and tables each get optimal Slidev layouts chosen by a pure-logic design agent.',
  },
  {
    icon: '🔌',
    iconClass: 'feature-icon-orange',
    title: 'FastAPI Bridge',
    desc: 'A lightweight POST /generate endpoint wires Docusaurus to the LangGraph pipeline on port 8000.',
  },
  {
    icon: '🛡️',
    iconClass: 'feature-icon-green',
    title: 'Validated Output',
    desc: 'A validator agent checks the final slide file for leftover JSX, broken image refs, and frontmatter integrity.',
  },
];

/* ── Quick-start steps ──────────────────────────────────────── */
const steps = [
  { title: 'Install dependencies', desc: 'pip install -r requirements.txt && cd docs-site && npm install' },
  { title: 'Set your API key', desc: 'export ANTHROPIC_API_KEY=sk-ant-...' },
  { title: 'Start the pipeline server', desc: 'python server.py  # runs on :8000' },
  { title: 'Start Docusaurus', desc: 'cd docs-site && npm start  # runs on :3000' },
  { title: 'Click Generate Slides', desc: 'Open any doc → click the button in the footer — deck opens on :3030' },
];

/* ── Stats ──────────────────────────────────────────────────── */
const stats = [
  { number: '18', label: 'Agents' },
  { number: '4', label: 'Phases' },
  { number: '28', label: 'Tools' },
  { number: '<5s', label: 'Avg generation' },
];

/* ── Hero ───────────────────────────────────────────────────── */
// ═══════════════════════════════════════════════════════════════
// BARCLAYS HERO — replace the 4 values marked REPLACE below:
//   1. heroBadgeText  → your team / division tag
//   2. heroTitle      → your hub's main headline
//   3. heroTitleSpan  → the gradient-highlighted word(s)
//   4. heroSubtitle   → one-liner describing the hub's purpose
//   5. primaryCta     → primary button label + destination
//   6. secondaryCta   → secondary button label + destination
// ═══════════════════════════════════════════════════════════════
const BRAND = {
  heroBadgeText:  '✨ LangGraph · 18 Agents · Slidev',       // REPLACE → e.g. '🏦 Barclays · Engineering · AI'
  heroTitle:      'Docs to Decks,',                           // REPLACE → e.g. 'One place for'
  heroTitleSpan:  'Instantly',                                // REPLACE → e.g. 'every engineering decision'
  heroSubtitle:   'Paste any Docusaurus MDX page. A multi-agent AI pipeline extracts structure, condenses prose, picks layouts, and hands you a ready-to-present Slidev deck.',
                                                              // REPLACE → your hub description
  primaryCta:     { label: 'Read the Docs →',       to: '/docs/intro' },         // REPLACE labels/paths
  secondaryCta:   { label: 'Agent Router Pattern',  to: '/docs/agent-router' },   // REPLACE labels/paths
};

function Hero() {
  return (
    <section className="hero-gradient" style={{ padding: '6rem 0 5rem', textAlign: 'center' }}>
      <div className="container">
        {/* ── BARCLAYS LOGO SLOT ──────────────────────────────
            Uncomment the block below and replace the src once
            you have barclays-logo-white.svg in static/img/
        ────────────────────────────────────────────────────── */}
        {/* <img
          src="/img/barclays-logo-white.svg"
          alt="Barclays"
          style={{ height: 36, marginBottom: '2rem', opacity: 0.9 }}
        /> */}

        <div className="hero-badge">{BRAND.heroBadgeText}</div>
        <h1 className="hero-title">
          {BRAND.heroTitle}<br />
          <span>{BRAND.heroTitleSpan}</span>
        </h1>
        <p className="hero-subtitle">{BRAND.heroSubtitle}</p>
        <div className="hero-actions">
          <Link className="btn-primary-hero" to={BRAND.primaryCta.to}>
            {BRAND.primaryCta.label}
          </Link>
          <Link className="btn-secondary-hero" to={BRAND.secondaryCta.to}>
            {BRAND.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Stats bar ──────────────────────────────────────────────── */
function StatsBar() {
  return (
    <div className="container">
      <div className="stats-bar">
        {stats.map((s) => (
          <div key={s.label} className="stat-item">
            <span className="stat-number">{s.number}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Features ───────────────────────────────────────────────── */
function Features() {
  return (
    <section className="features-section">
      <div className="container" style={{ textAlign: 'center' }}>
        <p className="section-label">What's inside</p>
        <h2 className="section-title">Everything you need, zero config</h2>
        <p className="section-subtitle">
          From a single MDX file to a fully-themed, timestamped Slidev presentation —
          the pipeline handles every step.
        </p>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card" style={{ textAlign: 'left' }}>
              <div className={`feature-icon ${f.iconClass}`}>{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Quick start ────────────────────────────────────────────── */
function QuickStart() {
  return (
    <section className="quickstart">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <p className="section-label">Get running in minutes</p>
            <h2 className="section-title" style={{ margin: '0 0 1rem' }}>Quick Start</h2>
            <p className="section-subtitle" style={{ margin: '0 0 2rem', textAlign: 'left' }}>
              Five commands and you're live. The server auto-manages the Slidev process
              so you never touch the terminal again.
            </p>
            <Link className="btn-primary-hero" to="/docs/intro" style={{ display: 'inline-flex' }}>
              Full Setup Guide →
            </Link>
          </div>
          <ol className="step-list">
            {steps.map((s, i) => (
              <li key={s.title} className="step-item">
                <div className="step-number">{i + 1}</div>
                <div className="step-content">
                  <h4>{s.title}</h4>
                  <p><code style={{ fontSize: '0.8rem' }}>{s.desc}</code></p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ── CTA banner ─────────────────────────────────────────────── */
function CTABanner() {
  return (
    <section style={{
      padding: '5rem 0',
      background: 'linear-gradient(135deg, #001a57, #003087)',
      textAlign: 'center',
    }}>
      <div className="container">
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
          Ready to build?
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.75)', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
          Dive into the architecture docs or jump straight to the Agent Router pattern —
          the most interesting piece of the system.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/docs/agent-router"
            style={{
              background: '#fff',
              color: '#003087',
              borderRadius: 10,
              padding: '13px 28px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
            }}
          >
            Agent Router →
          </Link>
          <Link
            to="/docs/intro"
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10,
              padding: '13px 28px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            Browse All Docs
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Docs → Slides in seconds"
      description="Multi-agent AI pipeline that converts Docusaurus MDX pages into Slidev presentations instantly."
    >
      <Hero />
      <StatsBar />
      <Features />
      <QuickStart />
      <CTABanner />
    </Layout>
  );
}
