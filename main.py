"""
Entry point.

Usage:
    python main.py <source.mdx> [--output-dir ./output]

Environment:
    ANTHROPIC_API_KEY   — enables LLM calls (Anthropic)
    LLM_PROVIDER        — 'anthropic' (default) | 'databricks'
    DATABRICKS_HOST     — required if LLM_PROVIDER=databricks
    DATABRICKS_TOKEN    — required if LLM_PROVIDER=databricks
    DATABRICKS_ENDPOINT — model endpoint name (optional, has default)
"""

import argparse
import os
import sys
from graph import pipeline
from llm import USE_LLM


def run(source_path: str, output_dir: str) -> str:
    if not os.path.exists(source_path):
        print(f"Error: source file not found: {source_path}")
        sys.exit(1)

    provider = os.getenv("LLM_PROVIDER", "anthropic")
    mode = f"{provider} LLM" if USE_LLM else "mock (no API key)"
    print(f"\n[Pipeline] Starting — mode: {mode}")
    print(f"[Pipeline] Source : {source_path}")
    print(f"[Pipeline] Output : {output_dir}\n")

    initial_state = {
        "source_path":      source_path,
        "output_dir":       output_dir,
        "raw_content":      "",
        "base_directory":   "",
        "file_metadata":    {},
        "cleaned_content":  "",
        "headings":         [],
        "code_blocks":      [],
        "prose_sections":   [],
        "lists":            [],
        "tables":           [],
        "attachments":      [],
        "chunks":           [],
        "slides":           [],
        "pacing_report":    {},
        "frontmatter":      "",
        "summary_slide":    "",
        "output_path":      "",
        "validation_errors": [],
        "errors":           [],
    }

    final_state = pipeline.invoke(initial_state)

    output_path = final_state.get("output_path", "")
    errors      = final_state.get("validation_errors", [])
    pacing      = final_state.get("pacing_report", {})

    print(f"\n{'='*55}")
    print(f"  Output : {output_path}")
    print(f"  Slides : {pacing.get('slide_count', '?')}")
    print(f"  Est.   : {pacing.get('total_estimated_seconds', 0) // 60} min")
    if errors:
        print(f"  Issues : {len(errors)}")
        for e in errors:
            print(f"    ✗ {e}")
    else:
        print(f"  Status : valid ✓")
    print(f"{'='*55}\n")

    return output_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert Docusaurus MDX to Slidev MD")
    parser.add_argument("source", help="Path to source .mdx file")
    parser.add_argument("--output-dir", default="./output", help="Output directory (default: ./output)")
    args = parser.parse_args()

    run(args.source, args.output_dir)
