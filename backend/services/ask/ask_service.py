"""
Ask service — orchestrates the Ask workflow with real tool-calling.

Flow:
  user message → LLM (with tool schemas) → tool_use? → execute tools → LLM (with results) → final answer
"""
import logging
import copy
from services.data_repository import DataRepository
from services.ask.llm_client import LLMClient
from services.ask.ask_tools import TOOL_REGISTRY

logger = logging.getLogger(__name__)


def _compress_tool_results(results: list[dict]) -> list[dict]:
    """Compress tool results to save LLM tokens while preserving key insights."""
    compressed = []
    for r in results:
        # Create a deep copy to avoid mutating the original full result returned to the frontend
        cr = copy.deepcopy(r)
        res = cr.get("result", {})
        
        if type(res) is not dict:
            compressed.append(cr)
            continue
            
        name = cr.get("name")
        if name == "sales_summary":
            res.pop("daily_revenue_14d", None)
            res.pop("daily_orders_14d", None)
        elif name == "category_performance":
            res.pop("categories_by_orders", None)
            if "categories_by_revenue" in res:
                res["categories_by_revenue"] = res["categories_by_revenue"][:3]
        elif name == "product_performance":
            if "top_products_by_revenue" in res:
                res["top_products_by_revenue"] = res["top_products_by_revenue"][:3]
            if "top_products_by_orders" in res:
                res["top_products_by_orders"] = res["top_products_by_orders"][:3]
            if "bottom_products_by_revenue" in res:
                res["bottom_products_by_revenue"] = res["bottom_products_by_revenue"][:3]
        elif name == "refund_analysis":
            if "products_by_refund_rate" in res:
                res["products_by_refund_rate"] = res["products_by_refund_rate"][:3]
            if "categories_by_refund_rate" in res:
                res["categories_by_refund_rate"] = res["categories_by_refund_rate"][:1]
        
        cr["result"] = res
        compressed.append(cr)
    return compressed


class AskService:
    """
    Main orchestrator for the Ask feature.

    Constructor takes a DataRepository so the service is decoupled from
    any specific data source (CSV today, BigQuery tomorrow).
    """

    def __init__(self, data_repository: DataRepository):
        self._repo = data_repository
        self._llm = LLMClient()

    def process_message(self, message: str, history: list[dict] | None = None) -> dict:
        """
        Process an incoming user message and return a response.

        Flow:
        1. Send message + history to LLM with available tool schemas.
        2. If LLM requests tool calls, execute them from TOOL_REGISTRY.
        3. Send tool results back to LLM for final answer.
        4. Return structured response.
        """
        if history is None:
            history = []

        # Optimization 1: Conversation history windowing (last 4 messages)
        windowed_history = history[-4:] if len(history) > 4 else history

        # 1. First LLM call — Claude decides whether to use tools
        llm_response = self._llm.send_message(message, windowed_history)

        # Check for API error
        if llm_response.get("error"):
            return {
                "answer": llm_response.get("answer", "An error occurred."),
                "tool_results": [],
                "status": "error",
                "used_tools": [],
            }

        used_tools = []
        tool_results = []

        # 2. If Claude requested tools, execute them
        if llm_response.get("tool_calls"):
            for tool_call in llm_response["tool_calls"]:
                tool_name = tool_call.get("name")
                tool_id = tool_call.get("id")

                if tool_name in TOOL_REGISTRY:
                    try:
                        result = TOOL_REGISTRY[tool_name](self._repo)
                        tool_results.append({
                            "id": tool_id,
                            "name": tool_name,
                            "result": result,
                        })
                        used_tools.append(tool_name)
                    except Exception as e:
                        logger.error(f"Tool execution error ({tool_name}): {e}")
                        tool_results.append({
                            "id": tool_id,
                            "name": tool_name,
                            "result": {"error": f"Tool '{tool_name}' failed: {str(e)}"},
                        })
                        used_tools.append(tool_name)
                else:
                    logger.warning(f"Unknown tool requested by LLM: {tool_name}")
                    tool_results.append({
                        "id": tool_id,
                        "name": tool_name,
                        "result": {"error": f"Unknown tool: {tool_name}"},
                    })

            # Optimization 2: Compress tool results for LLM context
            compressed_tool_results = _compress_tool_results(tool_results)

            # 3. Second LLM call — send tool results back to Claude for final answer
            llm_response = self._llm.send_message(
                message,
                windowed_history,
                tool_results=compressed_tool_results,
                assistant_content=llm_response.get("assistant_content", []),
            )

            if llm_response.get("error"):
                return {
                    "answer": llm_response.get("answer", "An error occurred."),
                    "tool_results": tool_results,
                    "status": "error",
                    "used_tools": used_tools,
                }

        # Strip internal IDs from tool_results before returning to frontend
        clean_results = [{"name": tr["name"], "result": tr["result"]} for tr in tool_results]

        return {
            "answer": llm_response.get("answer", "No answer generated."),
            "tool_results": clean_results,
            "status": "ok",
            "used_tools": used_tools,
        }
