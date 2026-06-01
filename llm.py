"""
LLM factory — swap provider via LLM_PROVIDER env var.
  LLM_PROVIDER=anthropic  (default)  uses ANTHROPIC_API_KEY
  LLM_PROVIDER=databricks            uses DATABRICKS_HOST + DATABRICKS_TOKEN
"""

import os


def get_llm(model_name: str = None):
    provider = os.getenv("LLM_PROVIDER", "anthropic").lower()

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=model_name or "claude-haiku-4-5-20251001",
            api_key=os.getenv("ANTHROPIC_API_KEY"),
            max_tokens=1024,
        )

    if provider == "databricks":
        from langchain_community.chat_models import ChatDatabricks
        return ChatDatabricks(
            endpoint=os.getenv("DATABRICKS_ENDPOINT", "databricks-meta-llama-3-1-70b-instruct"),
            max_tokens=1024,
        )

    raise ValueError(f"Unknown LLM_PROVIDER: {provider}. Use 'anthropic' or 'databricks'.")


USE_LLM = bool(os.getenv("ANTHROPIC_API_KEY") or os.getenv("DATABRICKS_TOKEN"))
