import json
import logging
from dotenv import load_dotenv
import anthropic
import os
from services.ask.llm_client import LLMClient
from services.ask.tool_schemas import ASK_TOOL_SCHEMAS

load_dotenv(".env")
api_key = os.getenv("ANTHROPIC_API_KEY")
model = os.getenv("ANTHROPIC_MODEL")

client = anthropic.Anthropic(api_key=api_key)

llm = LLMClient()
anthropic_tools = []
for i, schema in enumerate(ASK_TOOL_SCHEMAS):
    func = schema["function"]
    tool = {
        "name": func["name"],
        "description": func["description"],
        "input_schema": func.get("parameters", {"type": "object", "properties": {}}),
    }
    if i == len(ASK_TOOL_SCHEMAS) - 1:
        tool["cache_control"] = {"type": "ephemeral"}
    anthropic_tools.append(tool)

messages = [{"role": "user", "content": "What should I focus on first?"}]

print("Run 1...")
r1 = client.messages.create(
    model=model,
    max_tokens=100,
    system=llm.system_prompt,
    tools=anthropic_tools,
    messages=messages,
    extra_headers={"anthropic-beta": "prompt-caching-2024-07-31"}
)
print("Run 1 Usage:", r1.usage)

print("Run 2...")
r2 = client.messages.create(
    model=model,
    max_tokens=100,
    system=llm.system_prompt,
    tools=anthropic_tools,
    messages=messages,
    extra_headers={"anthropic-beta": "prompt-caching-2024-07-31"}
)
print("Run 2 Usage:", r2.usage)
