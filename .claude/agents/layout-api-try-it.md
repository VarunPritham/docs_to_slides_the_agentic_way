# Agent: ApiTryIt Layout

Reproduce or modify the **ApiTryIt** component — an inline API request tester embedded in a docs page.

## Location
- Component: `docs-site/src/components/PageLayouts/index.tsx` (exported as `ApiTryIt`)
- CSS: `docs-site/src/components/PageLayouts/styles.module.css`
- Demo: `docs-site/docs/templates/runbook-pipeline-failure.mdx`

## What It Renders
A self-contained API call widget:
- Coloured HTTP method badge (GET/POST/PUT/DELETE/PATCH)
- URL display
- Optional description text
- Optional body JSON preview (collapsible)
- "Send Request" button
- Response area: JSON output OR error message

## TypeScript Interface
```typescript
interface ApiTryItProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  body?: object;
  description?: string;
}
```

## State
```typescript
const [response, setResponse] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## Method Colours
```typescript
const methodColors = {
  GET:    { bg: '#d1fae5', text: '#065f46' },
  POST:   { bg: '#dbeafe', text: '#1e40af' },
  PUT:    { bg: '#fef3c7', text: '#92400e' },
  DELETE: { bg: '#fee2e2', text: '#991b1b' },
  PATCH:  { bg: '#f5f3ff', text: '#5b21b6' },
};
```

## Fetch Handler
```typescript
const handleSend = async () => {
  setLoading(true); setError(null); setResponse(null);
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  } catch (e) {
    setError(String(e));
  } finally {
    setLoading(false);
  }
};
```

## CSS Classes
```css
.apiTryIt       { border:1px solid var(--border-color); border-radius:12px; overflow:hidden; margin:1.25rem 0; }
.apiTryItHeader { display:flex; align-items:center; gap:10px; padding:0.75rem 1rem;
                  background:var(--surface-1); border-bottom:1px solid var(--border-color); }
.methodBadge    { font-size:0.7rem; font-weight:700; padding:3px 8px; border-radius:6px; letter-spacing:0.05em; }
.apiUrl         { font-family:monospace; font-size:0.85rem; color:var(--text-muted); flex:1; }
.apiDesc        { font-size:0.83rem; color:var(--text-muted); padding:0.5rem 1rem; }
.apiBody        { padding:0.5rem 1rem; }
.sendBtn        { margin:0.75rem 1rem; padding:8px 20px; background:var(--brand-navy,#003087);
                  color:#fff; border:none; border-radius:8px; font-weight:600; cursor:pointer; font-size:0.85rem; }
.sendBtn:hover  { background:var(--brand-navy-mid,#004aad); }
.apiResponse    { margin:0 1rem 1rem; background:#0f172a; border-radius:8px; padding:1rem;
                  color:#e2e8f0; font-family:monospace; font-size:0.8rem; white-space:pre-wrap; }
.apiError       { margin:0 1rem 1rem; padding:0.75rem 1rem; background:rgba(239,68,68,0.1);
                  border:1px solid #ef4444; border-radius:8px; color:#dc2626; font-size:0.83rem; }
```

## Reproduction Steps
1. Read `index.tsx` and `styles.module.css`
2. Define `ApiTryItProps` interface
3. Add 3× `useState` (response / loading / error)
4. Write `handleSend` async fetch function
5. Render: method badge (inline style for bg/text OK) + URL + description + body preview
6. Send button triggers `handleSend`
7. Conditionally render: loading spinner → response JSON block → error box
8. Response block always dark (`background: #0f172a`)

## MDX Usage
```mdx
import { ApiTryIt } from '@site/src/components/PageLayouts';

<ApiTryIt
  method="POST"
  url="http://localhost:8000/generate"
  description="Test pipeline — generates slides for the intro doc"
  body={{ url_path: '/docs/intro' }}
/>
```

## Validation
- [ ] Send button fires the request to the correct URL
- [ ] Response JSON renders in dark code block
- [ ] Error message displays for network failures (server not running)
- [ ] Loading state shown while fetch is in flight
- [ ] Method badge colour matches the HTTP verb
