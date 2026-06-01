---
theme: seriph
title: Sample
info: |
  Generated from sample.mdx
drawings:
  persist: false
transition: slide-left
highlighter: shiki
colorSchema: auto
duration: 7min
---

---
layout: cover
---

# Sample


---
layout: default
transition: slide-left
---

# Agent Router Pattern

> **NOTE:** The Agent Router is the "Hello World" of agentic coordination.

<!--
Detailed explanation of Agent Router Pattern. > **NOTE:** The Agent Router is the "Hello World" of agentic coordination....
-->


---
layout: section
transition: slide-up
---

# What Problem Does This Solve?


---
layout: default
transition: slide-left
---

# What Problem Does This Solve?

In a system with many specialized agents, how do you map a user's natural language request to the right agent without hardcoding if/else logic? Keyword matching breaks because the same intent can be phrased in many ways. Adding a new agent requires touching routing logic everywhere. The Agent Router solves this by separating intent understanding from routing decisions.

<!--
Detailed explanation of What Problem Does This Solve?. In a system with many specialized agents, how do you map a user's natural language request to the right agent without hardcoding if/else logic? Keyword matching breaks because the same intent can be p...
-->


---
layout: section
transition: slide-up
---

# The Two-Step Architecture


---
layout: default
transition: slide-left
---

# The Two-Step Architecture

```python
class AgentRouter:
    def __init__(self):
        self.capability_graph = {
            ("find", "sales_report"): "SalesAgent",
            ("analyze", "invoice"):   "FinanceAgent",
            ("create", "server_log"): "DevOpsAgent",
        }

    def route(self, query: str) -> str:
        intent = self.extract_intent(query)
        agent = self.capability_graph.get(
            (intent.action, intent.resource)
        )
        return agent or "REJECTED"
```

<!--
Detailed explanation of The Two-Step Architecture. The router works in two distinct steps. First, an LLM extracts a structured intent object from the raw query. Second, a capability graph maps that intent to the correct agent. The LLM never names an a...
-->


---
layout: section
transition: slide-up
---

# The Capability Graph


---
layout: default
transition: slide-left
---

# The Capability Graph

The capability graph is a whitelist. Any (action, resource) pair not in the graph is physically rejected — not silently routed to a fallback. This is the security boundary of the system.

- Adding a new agent requires only one new line in the graph
- The LLM cannot override routing decisions
- Unknown intent is explicitly blocked

<!--
Detailed explanation of The Capability Graph. The capability graph is a whitelist. Any (action, resource) pair not in the graph is physically rejected — not silently routed to a fallback. This is the security boundary of the system.

- Adding a n...
-->


---
layout: section
transition: slide-up
---

# When to Use


---
layout: default
transition: slide-left
---

# When to Use

Use the Agent Router when you have three or more specialized agents, users interact via natural language, and you need safety guarantees that no agent receives out-of-scope commands.

![Architecture Diagram](./assets/router-diagram.png)

<!--
Detailed explanation of When to Use. Use the Agent Router when you have three or more specialized agents, users interact via natural language, and you need safety guarantees that no agent receives out-of-scope commands.

![Architecture D...
-->

---
layout: center
transition: fade
---

# Key Takeaways

- What Problem Does This Solve?
- The Two-Step Architecture
- The Capability Graph
- When to Use