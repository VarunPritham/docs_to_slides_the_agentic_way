"""
LangGraph pipeline — Docusaurus MDX → Slidev MD

Phase 1 (Blackboard)  : MDXFileReader → MDXCleaner → TextExtractor
                                                    → AttachmentResolver → AttachmentEmbedAgent
Phase 2 (Agent Router): ContentChunker → ContentTypeClassifier
                        → ProseCondenser → SpeakerNotesWriter
Phase 3 (Tool Routing): LayoutSelector → CodeSlideAgent → SectionBreakAgent
                        → TransitionAgent → PacingAgent
Phase 4 (Assembly)    : FrontmatterGenerator → SummarySlideAgent
                        → SlideAssembler → ValidatorAgent
"""

from langgraph.graph import StateGraph, END
from state import PipelineState

from agents.extraction import (
    mdx_file_reader, mdx_cleaner, text_extractor,
    attachment_resolver, attachment_embed_agent,
)
from agents.content import (
    content_chunker, content_type_classifier,
    prose_condenser, speaker_notes_writer,
)
from agents.design import (
    layout_selector, code_slide_agent, section_break_agent,
    transition_agent, pacing_agent,
)
from agents.assembly import (
    frontmatter_generator, summary_slide_agent,
    slide_assembler, validator_agent,
)


def build_graph() -> StateGraph:
    g = StateGraph(PipelineState)

    # ── Phase 1: Extraction (Blackboard) ──────────────────────────────────────
    g.add_node("mdx_file_reader",       mdx_file_reader)
    g.add_node("mdx_cleaner",           mdx_cleaner)
    g.add_node("text_extractor",        text_extractor)
    g.add_node("attachment_resolver",   attachment_resolver)
    g.add_node("attachment_embed",      attachment_embed_agent)

    # ── Phase 2: Content (Agent Router) ───────────────────────────────────────
    g.add_node("content_chunker",       content_chunker)
    g.add_node("content_classifier",    content_type_classifier)
    g.add_node("prose_condenser",       prose_condenser)
    g.add_node("speaker_notes",         speaker_notes_writer)

    # ── Phase 3: Design (Tool Routing) ────────────────────────────────────────
    g.add_node("layout_selector",       layout_selector)
    g.add_node("code_slide_agent",      code_slide_agent)
    g.add_node("section_break_agent",   section_break_agent)
    g.add_node("transition_agent",      transition_agent)
    g.add_node("pacing_agent",          pacing_agent)

    # ── Phase 4: Assembly ─────────────────────────────────────────────────────
    g.add_node("frontmatter_generator", frontmatter_generator)
    g.add_node("summary_slide_agent",   summary_slide_agent)
    g.add_node("slide_assembler",       slide_assembler)
    g.add_node("validator_agent",       validator_agent)

    # ── Edges: Phase 1 ────────────────────────────────────────────────────────
    g.set_entry_point("mdx_file_reader")
    g.add_edge("mdx_file_reader",     "mdx_cleaner")
    g.add_edge("mdx_cleaner",         "text_extractor")
    g.add_edge("text_extractor",      "attachment_resolver")
    g.add_edge("attachment_resolver", "attachment_embed")

    # ── Edges: Phase 2 ────────────────────────────────────────────────────────
    g.add_edge("attachment_embed",    "content_chunker")
    g.add_edge("content_chunker",     "content_classifier")
    g.add_edge("content_classifier",  "prose_condenser")
    g.add_edge("prose_condenser",     "speaker_notes")

    # ── Edges: Phase 3 ────────────────────────────────────────────────────────
    g.add_edge("speaker_notes",       "layout_selector")
    g.add_edge("layout_selector",     "code_slide_agent")
    g.add_edge("code_slide_agent",    "section_break_agent")
    g.add_edge("section_break_agent", "transition_agent")
    g.add_edge("transition_agent",    "pacing_agent")

    # ── Edges: Phase 4 ────────────────────────────────────────────────────────
    g.add_edge("pacing_agent",            "frontmatter_generator")
    g.add_edge("frontmatter_generator",   "summary_slide_agent")
    g.add_edge("summary_slide_agent",     "slide_assembler")
    g.add_edge("slide_assembler",         "validator_agent")
    g.add_edge("validator_agent",         END)

    return g.compile()


pipeline = build_graph()
