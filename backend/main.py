from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from services.analytics_service import (
    DATE_RANGES,
    get_dashboard_kpis,
    get_sales_over_time,
    get_sales_by_category,
    get_top_priority_warning,
    get_business_health_summary,
)
from services.warnings_service import (
    get_all_warnings,
    get_warning_by_id,
    get_deep_review_scenario,
)
from services.local_data_repository import LocalDataRepository
from services.ask.ask_service import AskService
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="Ecommerce Showcase API")

# Initialize AskService
ask_repository = LocalDataRepository()
ask_service_instance = AskService(ask_repository)

# Pydantic models for Ask API
class MessageHistory(BaseModel):
    role: str
    content: str

class AskRequest(BaseModel):
    message: str
    history: Optional[List[MessageHistory]] = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _validate_range(range: str) -> None:
    if range not in DATE_RANGES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid range '{range}'. Valid options: {list(DATE_RANGES.keys())}",
        )


@app.get("/health")
def health_check():
    return {"status": "ok"}


# ── Dashboard endpoints ──────────────────────────────────

@app.get("/api/dashboard/kpis")
def dashboard_kpis(range: str = Query(default="last_30_days")):
    _validate_range(range)
    try:
        return get_dashboard_kpis(range)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/sales-over-time")
def sales_over_time(range: str = Query(default="last_30_days")):
    _validate_range(range)
    try:
        return get_sales_over_time(range)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/sales-by-category")
def sales_by_category(range: str = Query(default="last_30_days")):
    _validate_range(range)
    try:
        return get_sales_by_category(range)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/top-priority")
def top_priority_warning():
    try:
        result = get_top_priority_warning()
        if result is None:
            return {"warning": None}
        return {"warning": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/business-health")
def business_health():
    try:
        return get_business_health_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Warnings endpoints ──────────────────────────────────

@app.get("/api/warnings")
def warnings_list():
    try:
        return get_all_warnings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/warnings/{warning_id}")
def warning_details(warning_id: str):
    try:
        warning = get_warning_by_id(warning_id)
        if not warning:
            raise HTTPException(status_code=404, detail=f"Warning {warning_id} not found")
        return warning
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/warnings/{warning_id}/deep-review")
def warning_deep_review(warning_id: str):
    try:
        scenario = get_deep_review_scenario(warning_id)
        if not scenario:
            # The prompt says: "Return null or clear message if no scenario exists."
            return {"scenario": None, "message": "No deep review scenario exists for this warning."}
        return {"scenario": scenario}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Ask endpoints ───────────────────────────────────────

@app.post("/api/ask/message")
def ask_message(request: AskRequest):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    try:
        history = [h.model_dump() for h in request.history] if request.history else []
        return ask_service_instance.process_message(message, history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ask/debug")
def ask_debug():
    """Temporary diagnostic endpoint to verify LLM provider configuration."""
    llm = ask_service_instance._llm
    key = llm.anthropic_key
    return {
        "provider": llm.provider_name,
        "configured": llm._is_configured(),
        "model": llm.anthropic_model,
        "anthropic_sdk_available": llm.anthropic_sdk_available,
        "api_key_set": bool(key and len(key) > 0),
        "api_key_prefix": (key[:12] + "...") if key and len(key) > 12 else None,
    }
