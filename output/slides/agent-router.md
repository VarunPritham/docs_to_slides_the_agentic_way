---
theme: seriph
title: Agent Router
info: |
  Generated from agent-router.mdx
drawings:
  persist: false
transition: slide-left
highlighter: shiki
colorSchema: auto
duration: 6min
---

---
layout: cover
---

# Agent Router


---
layout: section
transition: slide-up
---

# Agent Router Pattern

<!--
# Agent Router Pattern - Speaker Notes

The Agent Router pattern is the foundational "Hello World" of agentic coordination—a simple yet powerful way to get started with multi-agent systems. This pattern uses a central router component that receives user requests and intelligently directs them to the most appropriate specialized agent based on the task requirements. It's ideal for scenarios where you have distinct, well-defined agent capabilities and need to match incoming requests to the right handler. The simplicity of this pattern makes it an excellent starting point before moving to more complex coordination strategies like hierarchical or collaborative patterns. Use this pattern when your agents have clear, non-overlapping responsibilities and routing logic is straightforward.
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
# Speaker Notes: What Problem Does This Solve?

When you have multiple specialized agents, directing user requests to the right one becomes complex—keyword matching fails because users phrase the same intent differently, and adding new agents forces you to update routing logic throughout your system. The Agent Router solves this by decoupling intent understanding from routing decisions, eliminating brittle if/else logic and making it easy to scale. This approach lets your system understand what users actually want, then intelligently direct requests without constant code changes.
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

The router works in two distinct steps. First, an LLM extracts a structured intent object from the raw query. Second, a capability graph maps that intent to the correct agent. The LLM never names an agent directly.

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
# The Two-Step Architecture - Speaker Notes

This router uses a two-step process to eliminate direct agent naming by the LLM. First, the LLM parses the user's raw query and extracts a structured intent object—essentially identifying what action the user wants and what domain it applies to. Second, that intent is used as a lookup key in a capability graph, which deterministically maps to the appropriate agent. This separation of concerns means the LLM never needs to know agent names directly; it only needs to understand intents, making the system more flexible and maintainable.
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
# The Capability Graph - Speaker Notes

The capability graph functions as a whitelist that enforces our system's security boundary—any action-resource pair not explicitly listed is physically rejected, not silently ignored. This means unknown or unauthorized requests fail safely and visibly. Adding new agent capabilities is simple, requiring only a single line addition to the graph, while the LLM itself cannot circumvent these routing decisions. Importantly, any ambiguous or unrecognized intent is explicitly blocked rather than defaulting to unsafe behavior.
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

![Architecture Diagram](pathname://./assets/router-diagram.png)

<!--
# When to Use - Speaker Notes

Use the Agent Router pattern when you have multiple specialized agents (three or more) that need to intelligently route user requests based on their domain expertise. This approach is essential when your users communicate through natural language, as the router intelligently interprets intent and directs queries to the appropriate agent. The pattern provides critical safety guarantees by preventing out-of-scope commands from reaching agents they shouldn't handle, protecting system integrity. Consider implementing this when you need reliable request distribution across a complex multi-agent system while maintaining security boundaries between specialized agents.
-->

---
layout: center
transition: fade
---

# Key Takeaways

# Key Takeaways

• Solves multi-step reasoning by breaking complex problems into manageable components.

• Two-step architecture separates planning from execution for clearer, more reliable outcomes.

• Capability graph enables intelligent routing of tasks to appropriate specialized tools.

• Best applied when problems require sequential steps and diverse expertise.