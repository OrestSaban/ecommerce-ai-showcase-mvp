"""
Ask service skeleton.

Orchestrates the Ask workflow: receive message → select tools → build context → generate answer.
No LLM integration yet. process_message() returns a safe placeholder response.
"""
from services.data_repository import DataRepository


class AskService:
    """
    Main orchestrator for the Ask feature.

    Constructor takes a DataRepository so the service is decoupled from
    any specific data source (CSV today, BigQuery tomorrow).
    """

    def __init__(self, data_repository: DataRepository):
        self._repo = data_repository

    def process_message(self, message: str, history: list[dict] | None = None) -> dict:
        """
        Process an incoming user message and return a response.

        Future implementation will:
        1. Call select_tools() to determine which data tools are relevant.
        2. Execute those tools against the data repository.
        3. Call build_context() to assemble the LLM prompt.
        4. Send to LLM and return the answer.

        For now, returns a safe placeholder.
        """
        return {
            "answer": "Ask backend architecture is ready. Real AI/data tools will be connected next.",
            "tool_results": [],
            "status": "placeholder",
            "used_tools": [],
        }

    def select_tools(self, message: str) -> list[str]:
        """
        Analyze the user message and return a list of tool names to execute.

        Will be implemented when LLM integration is added.
        """
        raise NotImplementedError("Tool selection requires LLM integration (not yet connected).")

    def build_context(self, tool_results: list[dict]) -> str:
        """
        Assemble tool results into a context string for the LLM prompt.

        Will be implemented when LLM integration is added.
        """
        raise NotImplementedError("Context building requires LLM integration (not yet connected).")
