"""
LLM client abstraction with real Anthropic tool-calling support.

Reads configuration from environment:
  - LLM_PROVIDER (openai | anthropic)
  - ANTHROPIC_API_KEY
  - ANTHROPIC_MODEL
  - OPENAI_API_KEY

Falls back to placeholder if unconfigured.
"""
import os
import json
import logging
from dotenv import load_dotenv
from services.ask.tool_schemas import ASK_TOOL_SCHEMAS

# Load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

logger = logging.getLogger(__name__)


# System instructions to govern the LLM Copilot's behavior.
SYSTEM_PROMPT = """
You are an advanced Ecommerce AI Copilot. You help merchants understand their business performance, 
diagnose issues, and discover insights.

RULES AND GUARDRAILS:
1. Only use numerical claims and metrics provided to you through the data tools. DO NOT invent or estimate numbers.
2. If data to answer a user's question is unavailable, state clearly that you do not have that information.
3. Explain business implications in simple, accessible language. Avoid overly dense jargon.
4. Keep your answers concise, direct, and highly useful. 
5. Recommend next actions or next steps only when they are logically supported by the tool data.
6. When referencing products, categories, or campaigns, use their exact names as provided in the tool results.
7. Always call at least one data tool before answering a question that involves metrics, performance, or business data.
8. Format your answers with clear structure. Use bullet points or numbered lists when presenting multiple data points.
"""


def _convert_schemas_to_anthropic(schemas: list[dict]) -> list[dict]:
    """Convert OpenAI-style tool schemas to Anthropic format."""
    anthropic_tools = []
    for i, schema in enumerate(schemas):
        func = schema["function"]
        tool = {
            "name": func["name"],
            "description": func["description"],
            "input_schema": func.get("parameters", {"type": "object", "properties": {}}),
        }
        # Optimization: Add prompt caching breakpoint to the last tool schema
        if i == len(schemas) - 1:
            tool["cache_control"] = {"type": "ephemeral"}
        anthropic_tools.append(tool)
    return anthropic_tools


class LLMClient:
    """
    Provider abstraction for LLM interactions.
    Supports Anthropic with real tool-calling.
    """

    def __init__(self):
        self.provider_name = os.environ.get("LLM_PROVIDER", "unconfigured").lower()
        self.openai_key = os.environ.get("OPENAI_API_KEY")
        self.anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
        self.anthropic_model = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5")
        self.available_tools = ASK_TOOL_SCHEMAS
        self.system_prompt = SYSTEM_PROMPT

        # Check SDK availability
        self.anthropic_sdk_available = False
        self._anthropic_client = None
        try:
            import anthropic
            self.anthropic_sdk_available = True
            if self.provider_name == "anthropic" and self.anthropic_key:
                self._anthropic_client = anthropic.Anthropic(api_key=self.anthropic_key)
        except ImportError:
            pass

    def _is_configured(self) -> bool:
        if self.provider_name == "openai" and self.openai_key:
            return True
        if self.provider_name == "anthropic" and self.anthropic_key and self.anthropic_sdk_available:
            return True
        return False

    def send_message(
        self,
        message: str,
        history: list[dict],
        tool_results: list[dict] | None = None,
        assistant_content: list | None = None,
    ) -> dict:
        """
        Send a message to the LLM provider.

        Args:
            message: The user's current message.
            history: Previous conversation messages [{"role": ..., "content": ...}].
            tool_results: Tool execution results from AskService (for the follow-up call).
            assistant_content: Raw assistant content blocks from the first call (needed for tool result round-trip).

        Returns:
            {
                "answer": str | None,
                "tool_calls": [{"id": str, "name": str, "input": dict}],
                "assistant_content": list  (raw content blocks to pass back if tools are called)
            }
        """
        if not self._is_configured():
            return {
                "answer": "AI provider is not configured yet. Ask backend and data tools are ready.",
                "tool_calls": [],
                "assistant_content": [],
            }

        if self.provider_name == "anthropic":
            return self._call_anthropic(message, history, tool_results, assistant_content)

        return {
            "answer": f"Provider '{self.provider_name}' is not implemented yet.",
            "tool_calls": [],
            "assistant_content": [],
        }

    def _call_anthropic(
        self,
        message: str,
        history: list[dict],
        tool_results: list[dict] | None = None,
        assistant_content: list | None = None,
    ) -> dict:
        """Make a real Anthropic API call with tool support."""
        try:
            # Build messages array
            messages = []

            # Add conversation history
            for h in history:
                messages.append({"role": h["role"], "content": h["content"]})

            if tool_results and assistant_content:
                # This is the follow-up call after tool execution.
                # Add the user's original message
                messages.append({"role": "user", "content": message})

                # Add the assistant's tool_use response (raw content blocks)
                messages.append({"role": "assistant", "content": assistant_content})

                # Add tool results as a user message
                tool_result_blocks = []
                for tr in tool_results:
                    tool_result_blocks.append({
                        "type": "tool_result",
                        "tool_use_id": tr["id"],
                        "content": json.dumps(tr["result"], default=str),
                    })
                messages.append({"role": "user", "content": tool_result_blocks})
            else:
                # First call — just the user message
                messages.append({"role": "user", "content": message})

            # Convert tool schemas to Anthropic format
            anthropic_tools = _convert_schemas_to_anthropic(self.available_tools)

            # Make the API call
            response = self._anthropic_client.messages.create(
                model=self.anthropic_model,
                max_tokens=2048,
                system=[{
                    "type": "text",
                    "text": self.system_prompt,
                    "cache_control": {"type": "ephemeral"}
                }],
                tools=anthropic_tools,
                messages=messages,
                extra_headers={"anthropic-beta": "prompt-caching-2024-07-31"}
            )

            # Parse the response
            tool_calls = []
            text_parts = []
            raw_content = []

            for block in response.content:
                raw_content.append(block.model_dump())
                if block.type == "text":
                    text_parts.append(block.text)
                elif block.type == "tool_use":
                    tool_calls.append({
                        "id": block.id,
                        "name": block.name,
                        "input": block.input,
                    })

            answer = "\n".join(text_parts) if text_parts else None

            # Optimization 3: Token usage logging
            if hasattr(response, "usage") and response.usage:
                in_tok = getattr(response.usage, "input_tokens", 0)
                out_tok = getattr(response.usage, "output_tokens", 0)
                
                cache_creation = getattr(response.usage, "cache_creation_input_tokens", 0)
                cache_read = getattr(response.usage, "cache_read_input_tokens", 0)
                
                tot_tok = in_tok + out_tok
                tool_names = [tc["name"] for tc in tool_calls] if tool_calls else "None"
                logger.info(
                    f"Anthropic API Usage - Input: {in_tok} (Cache Read: {cache_read}, Create: {cache_creation}) | "
                    f"Output: {out_tok} | Total In/Out: {tot_tok} | Tools: {tool_names}"
                )

            return {
                "answer": answer,
                "tool_calls": tool_calls,
                "assistant_content": raw_content,
            }

        except Exception as e:
            logger.error(f"Anthropic API error: {type(e).__name__}: {e}")
            return {
                "answer": "I could not complete the AI analysis right now. Please try again.",
                "tool_calls": [],
                "assistant_content": [],
                "error": True,
            }
