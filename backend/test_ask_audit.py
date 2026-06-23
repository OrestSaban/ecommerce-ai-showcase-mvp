import json
import os
import sys
from dotenv import load_dotenv
import anthropic
from services.local_data_repository import LocalDataRepository
from services.ask.ask_service import AskService
from services.ask.llm_client import LLMClient
from services.ask.tool_schemas import ASK_TOOL_SCHEMAS

load_dotenv()

# We want to trace the token usage.
repo = LocalDataRepository()
ask_service = AskService(repo)

message = "What should I focus on first?"
history = []

print("=== AUDIT SCRIPT START ===")

# 1. Ask LLM to evaluate message
print("Sending first message to LLM...")
client = ask_service._llm._anthropic_client
model = ask_service._llm.anthropic_model
system_prompt = ask_service._llm.system_prompt
tools = ask_service._llm.available_tools

anthropic_tools = []
for schema in tools:
    func = schema["function"]
    anthropic_tools.append({
        "name": func["name"],
        "description": func["description"],
        "input_schema": func.get("parameters", {"type": "object", "properties": {}}),
    })

messages = [{"role": "user", "content": message}]

print(f"System Prompt Length: {len(system_prompt)} chars")
print(f"Tools Count: {len(anthropic_tools)}")
for t in anthropic_tools:
    print(f"  Tool: {t['name']}")

response1 = client.messages.create(
    model=model,
    max_tokens=2048,
    system=system_prompt,
    tools=anthropic_tools,
    messages=messages,
)

print(f"\nCall 1 Usage: {response1.usage}")

tool_calls = []
raw_content = []
for block in response1.content:
    raw_content.append(block.model_dump())
    if block.type == "tool_use":
        tool_calls.append({
            "id": block.id,
            "name": block.name,
            "input": block.input,
        })

print("\nTool Calls Requested by Claude:")
for tc in tool_calls:
    print(f"  {tc['name']}")

tool_results = []
from services.ask.ask_tools import TOOL_REGISTRY
for tc in tool_calls:
    res = TOOL_REGISTRY[tc["name"]](repo)
    tool_results.append({
        "id": tc["id"],
        "name": tc["name"],
        "result": res
    })

print(f"\nTool Results Payload Size (JSON string): {len(json.dumps(tool_results, default=str))} chars")

# Call 2
messages.append({"role": "assistant", "content": raw_content})

tool_result_blocks = []
for tr in tool_results:
    tool_result_blocks.append({
        "type": "tool_result",
        "tool_use_id": tr["id"],
        "content": json.dumps(tr["result"], default=str),
    })
messages.append({"role": "user", "content": tool_result_blocks})

response2 = client.messages.create(
    model=model,
    max_tokens=2048,
    system=system_prompt,
    tools=anthropic_tools,
    messages=messages,
)
print(f"\nCall 2 Usage: {response2.usage}")

print("=== AUDIT SCRIPT END ===")
