"""
Analytics service for the Dashboard.
All calculations use Pandas over local CSV seed data.
"Today" is derived from the latest date in the seed data, not the system clock.
"""
import json
import pandas as pd
from services.local_data_service import (
    get_sales_orders,
    get_ad_performance,
    get_warnings,
    get_business_health,
)

# Valid date range keys
DATE_RANGES = {
    "last_7_days": 7,
    "last_30_days": 30,
    "last_90_days": 90,
}


def _resolve_date_range(date_range: str) -> tuple[pd.Timestamp, pd.Timestamp]:
    """Return (start_date, end_date) based on the latest available data date."""
    days = DATE_RANGES.get(date_range, 30)
    orders = get_sales_orders()
    end_date = orders["order_date"].max()
    start_date = end_date - pd.Timedelta(days=days - 1)
    return start_date, end_date


def get_dashboard_kpis(date_range: str) -> dict:
    """
    Returns KPIs for the selected date range:
    - total_sales
    - orders
    - gross_profit
    - ad_spend
    - ad_conversion_rate
    - acos
    """
    start, end = _resolve_date_range(date_range)

    # Sales orders slice
    orders = get_sales_orders()
    filtered = orders[(orders["order_date"] >= start) & (orders["order_date"] <= end)]

    total_sales = round(filtered["total_amount"].sum(), 2)
    order_count = len(filtered)
    gross_profit = round(filtered["gross_profit"].sum(), 2)

    # Ad performance slice
    ads = get_ad_performance()
    ads_filtered = ads[(ads["date"] >= start) & (ads["date"] <= end)]

    ad_spend = round(ads_filtered["spend"].sum(), 2)
    total_clicks = ads_filtered["clicks"].sum()
    total_conversions = ads_filtered["conversions"].sum()
    total_ad_revenue = ads_filtered["revenue"].sum()

    ad_conversion_rate = round(total_conversions / total_clicks * 100, 2) if total_clicks > 0 else 0.0
    acos = round(ad_spend / total_ad_revenue, 4) if total_ad_revenue > 0 else 0.0

    return {
        "date_range": date_range,
        "start_date": start.date().isoformat(),
        "end_date": end.date().isoformat(),
        "total_sales": total_sales,
        "orders": order_count,
        "gross_profit": gross_profit,
        "ad_spend": ad_spend,
        "ad_conversion_rate": ad_conversion_rate,
        "acos": acos,
    }


def get_sales_over_time(date_range: str) -> list[dict]:
    """
    Returns daily revenue totals for the selected date range.
    Suitable for a line/bar chart.
    """
    start, end = _resolve_date_range(date_range)

    orders = get_sales_orders()
    filtered = orders[(orders["order_date"] >= start) & (orders["order_date"] <= end)]

    daily = (
        filtered.groupby("order_date")["total_amount"]
        .sum()
        .reset_index()
        .rename(columns={"order_date": "date", "total_amount": "revenue"})
    )
    daily["date"] = daily["date"].dt.date.astype(str)
    daily["revenue"] = daily["revenue"].round(2)

    return daily.to_dict(orient="records")


def get_sales_by_category(date_range: str) -> list[dict]:
    """
    Returns revenue and order count grouped by product category.
    Suitable for a pie/bar chart.
    """
    start, end = _resolve_date_range(date_range)

    orders = get_sales_orders()
    filtered = orders[(orders["order_date"] >= start) & (orders["order_date"] <= end)]

    grouped = (
        filtered.groupby("category")
        .agg(revenue=("total_amount", "sum"), orders=("order_id", "count"))
        .reset_index()
        .sort_values("revenue", ascending=False)
    )
    grouped["revenue"] = grouped["revenue"].round(2)

    return grouped.to_dict(orient="records")


def get_top_priority_warning() -> dict | None:
    """
    Returns the highest-priority unresolved warning (lowest sort_order, status = new).
    """
    warnings = get_warnings()
    active = warnings[warnings["status"] == "new"].sort_values("sort_order")

    if active.empty:
        return None

    row = active.iloc[0]

    # Parse action_plan_preview_json safely
    try:
        action_plan = json.loads(row["action_plan_preview_json"])
    except Exception:
        action_plan = []

    return {
        "warning_id": row["warning_id"],
        "title": row["title"],
        "category": row["category"],
        "severity": row["severity"],
        "impact_label": row["impact_label"],
        "why": row["why"],
        "recommended_action": row["recommended_action"],
        "action_plan_preview": action_plan,
        "deep_review_scenario_id": row["deep_review_scenario_id"]
        if pd.notna(row["deep_review_scenario_id"]) else None,
    }


def get_business_health_summary() -> list[dict]:
    """
    Returns all business health domain rows sorted by sort_order.
    """
    bh = get_business_health().sort_values("sort_order")
    return bh.to_dict(orient="records")
