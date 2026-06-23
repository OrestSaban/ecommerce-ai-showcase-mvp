"""
Machine-readable tool schemas for Ask backend.

These schemas define the Ask tools available to the LLM copilot.
Future implementations using OpenAI or Anthropic will pass these schemas 
directly to the provider's API.
"""

ASK_TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "sales_summary",
            "description": "Summarize total sales, order count, gross profit, average order value, and 14-day revenue trends. Useful for answering general questions about revenue, overall sales performance, and recent sales trends.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "category_performance",
            "description": "Break down sales by product category, ranking them by revenue and order count. Includes gross margins and revenue share. Useful for identifying the best and worst performing product categories.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "ad_performance",
            "description": "Summarize advertising metrics including spend, ACOS, ROAS, conversions, and campaign performance. Useful for evaluating marketing efficiency and identifying top/bottom ad campaigns.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "product_performance",
            "description": "Analyze individual product performance. Returns top products by revenue and orders, as well as the worst performing products. Useful for answering questions about specific top sellers.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "refund_analysis",
            "description": "Analyze refund rates and patterns across categories and individual products. Highlights products with unusually high refund rates compared to the store average.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "inventory_analysis",
            "description": "Analyze inventory levels to identify low-stock products. Includes estimated daily sales velocity and days until stockout for items at risk of running out of stock.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "warnings_summary",
            "description": "Summarize active automated system warnings. Returns active warnings grouped by severity and category, and ranks them by estimated financial impact.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "business_health_summary",
            "description": "Summarize the overall business health across various domains (e.g. store, payments, inventory, returns). Useful for answering general health checks or identifying domains in critical states.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    }
]
