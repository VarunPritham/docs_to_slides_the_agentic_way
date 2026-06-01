# Agentic Patterns Used

## Pattern 1 — Blackboard (Phase 1: Extraction)

**What it solves:** The source file is unknown until you look at it. You don't know upfront whether it has JSX, broken attachment refs, admonitions, or deeply nested headings. Multiple specialist agents must each contribute their part of the understanding before anything downstream can run.

**How it's implemented:**
- `PipelineState` TypedDict is the blackboard — shared, append-only (LangGraph handles merging)
- All 5 extraction agents post facts to state before Phase 2 begins
- No agent calls another agent — they only read/write state
- Each agent has a narrow responsibility: one reads the file, one cleans it, one extracts structure, one resolves paths, one copies files

**Key design decision:** Sequential in this implementation (one after another). Could be parallelised — `TextExtractor` and `AttachmentResolver` could run concurrently since they both read `cleaned_content`. Left sequential for simplicity and debuggability.

**Convergence:** Implicit — LangGraph's sequential edges guarantee all 5 nodes complete before the first content node runs.

---

## Pattern 2 — Agent Router (Phase 2: Content)

**What it solves:** Different content types need different treatment. A code block, a prose paragraph, an image, and a table each need different condensing strategies, different layouts, and different slide structures. You need to dispatch each chunk to the right downstream behaviour.

**How it's implemented:**
- `ContentTypeClassifier` labels every chunk with one of: `prose | code | image | table | list | heading_only`
- This label is then **read** by downstream agents to decide whether to act:
  - `ProseCondenser`: skips non-prose and short prose
  - `LayoutSelector`: uses label as key in layout lookup table
  - `CodeSlideAgent`: skips non-code chunks entirely
  - `SectionBreakAgent`: checks `heading_level`, not chunk_type

**Key design decision:** Routing is data-driven (via the label in state), NOT graph-structure-driven (no conditional edges). This keeps the LangGraph graph simple (17 sequential edges). The alternative — conditional edges per chunk type — would require fan-out/fan-in which adds significant complexity.

**Vocabulary:** 6 chunk types: `prose | code | image | table | list | heading_only`. This is the Goldilocks abstraction — specific enough to route correctly, broad enough to not explode.

---

## Pattern 3 — Tool Routing (Phase 3: Design)

**What it solves:** In a naive system, every design agent could accidentally call any tool. `CodeSlideAgent` might invoke the image dimension reader. `LayoutSelector` might try to split a code block. Scoping prevents misuse and keeps each agent's responsibilities clear.

**How it's implemented:**
- Each agent file imports ONLY its scoped tools at the top of the file
- `CodeSlideAgent` imports from `code_tools` only
- `LayoutSelector` imports from `layout_tools` only
- `SectionBreakAgent` imports `check_heading_level` and `lookup_layout` — two functions only
- `TransitionAgent` imports `lookup_transition` and `check_slide_type` only
- `PacingAgent` imports timing functions only

**Enforcement:** Python import structure — an agent physically cannot call a function it hasn't imported. This is stronger than a prompt-level restriction.

**Shared tools:** `lookup_layout` is imported by both `LayoutSelector` and `SectionBreakAgent`. This is fine — tools can be registered for multiple agents.

**Key design decision:** Tools are plain Python functions, not MCP tools or LangChain tools. This is intentional for this project — no network overhead, instant calls, easy to test. If this pipeline were exposed as an MCP server, the tools would become MCP tool definitions and the scoping would be enforced at the server registration level instead.

---

## Pattern Interaction

```
Blackboard facts (Phase 1) → feed the router (Phase 2)
  AttachmentResolver detects images → ContentTypeClassifier can label chunk as "image"
  TextExtractor counts code blocks → ContentTypeClassifier can label chunk as "code"

Router labels (Phase 2) → drive Tool Routing (Phase 3)
  chunk_type="code" → CodeSlideAgent processes it with code_tools
  chunk_type="image" → LayoutSelector uses get_image_dimensions
  chunk_type="heading_only" → SectionBreakAgent inserts section break
```

The three patterns compose: Blackboard builds understanding → Router categorises → Tool Routing executes with the right capabilities.
