# Agent: ServiceDashboard Layout

Reproduce or modify the **ServiceDashboard** component — a service health status page.

## Location
- Component: `docs-site/src/components/PageLayouts/index.tsx` (exported as `ServiceDashboard`)
- CSS: `docs-site/src/components/PageLayouts/styles.module.css`
- Demo: `docs-site/docs/templates/service-status.mdx`

## What It Renders
- Overall system status banner: green "All systems operational" OR amber/red "X services affected"
- List of services, each with:
  - Coloured health dot
  - Service name
  - Health label (Operational / Degraded / Outage / Maintenance)
  - Optional latency metric
  - Optional uptime percentage
  - Optional note
- Last checked timestamp

## TypeScript Interface
```typescript
type ServiceHealth = 'operational' | 'degraded' | 'outage' | 'maintenance';

interface Service {
  name: string;
  health: ServiceHealth;
  latency?: string;    // "42ms"
  uptime?: string;     // "99.98%"
  note?: string;
}

interface ServiceDashboardProps {
  services: Service[];
  lastChecked?: string;    // "2026-06-02 11:30 UTC"
}
```

## Health Colours
```typescript
const healthConfig = {
  operational: { dot: '#22c55e', label: 'Operational', text: '#065f46', bg: '#d1fae5' },
  degraded:    { dot: '#f59e0b', label: 'Degraded',    text: '#92400e', bg: '#fef3c7' },
  outage:      { dot: '#ef4444', label: 'Outage',      text: '#991b1b', bg: '#fee2e2' },
  maintenance: { dot: '#3b82f6', label: 'Maintenance', text: '#1e40af', bg: '#dbeafe' },
};
```

## Overall Status Logic
```typescript
const hasIssues = services.some(s => s.health !== 'operational');
const outageCount = services.filter(s => s.health === 'outage').length;
const degradedCount = services.filter(s => s.health === 'degraded').length;
```

## CSS Classes
```css
.dashboard       { border:1px solid var(--border-color); border-radius:14px; overflow:hidden; margin:1.25rem 0; }
.dashHeader      { padding:1.25rem 1.5rem; display:flex; align-items:center; gap:12px;
                   background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.statusDot       { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
.statusDotPulse  { animation: pulse 2s infinite; }
.dashTitle       { font-weight:700; font-size:1rem; }
.dashSubtitle    { font-size:0.82rem; color:var(--text-muted); }
.serviceList     { padding:0; list-style:none; margin:0; }
.serviceRow      { display:flex; align-items:center; gap:10px; padding:0.875rem 1.5rem;
                   border-bottom:1px solid var(--border-color); }
.serviceRow:last-child { border-bottom:none; }
.serviceDot      { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.serviceName     { flex:1; font-weight:600; font-size:0.9rem; }
.serviceHealth   { font-size:0.75rem; font-weight:600; padding:2px 8px; border-radius:6px; }
.serviceMetric   { font-size:0.78rem; color:var(--text-muted); font-family:monospace; }
.serviceNote     { font-size:0.78rem; color:var(--text-muted); font-style:italic; }
.dashFooter      { padding:0.5rem 1.5rem; font-size:0.75rem; color:var(--text-muted);
                   background:var(--surface-1); border-top:1px solid var(--border-color); }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
```

## Reproduction Steps
1. Define `ServiceHealth` type, `Service` interface, `ServiceDashboardProps`
2. Define `healthConfig` map
3. Compute overall status from `services.some(s => s.health !== 'operational')`
4. Render dashboard card with header (overall status dot + title + subtitle)
5. Map services to rows with coloured dots + health badges
6. Footer with last checked timestamp
7. CSS: all backgrounds use CSS vars; health badge inline styles (bg/text) are OK for small badges

## MDX Usage
```mdx
import { ServiceDashboard } from '@site/src/components/PageLayouts';

<ServiceDashboard
  lastChecked="2026-06-02 11:30 UTC"
  services={[
    { name: 'Pipeline API', health: 'operational', latency: '38ms', uptime: '99.99%' },
    { name: 'Slidev Server', health: 'degraded', latency: '2100ms', note: 'High memory usage' },
    { name: 'Docusaurus', health: 'operational', latency: '12ms', uptime: '100%' },
    { name: 'LLM Provider', health: 'maintenance', note: 'Scheduled maintenance 02:00–04:00 UTC' },
  ]}
/>
```

## Validation
- [ ] Overall "All systems operational" shows green when all services healthy
- [ ] Overall banner changes to amber/red when any service is degraded/outage
- [ ] Outage dot pulses (CSS animation)
- [ ] Latency and uptime render in monospace
- [ ] Dark mode: no white backgrounds (uses `var(--surface-1)`)
