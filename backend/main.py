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

app = FastAPI(title="Ecommerce Showcase API")

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
