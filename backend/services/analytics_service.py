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
    "ytd": 365,
    "last_12_months": 365,
}


def _resolve_date_range(date_range: str) -> tuple[pd.Timestamp, pd.Timestamp]:
    """Return (start_date, end_date) based on the latest available data date."""
    days = DATE_RANGES.get(date_range, 30)
    orders = get_sales_orders()
    end_date = orders["order_date"].max()
    start_date = end_date - pd.Timedelta(days=days - 1)
    return start_date, end_date


def _calc_slice(start, end, orders, ads):
    filtered_orders = orders[(orders["order_date"] >= start) & (orders["order_date"] <= end)]
    total_sales = float(filtered_orders["total_amount"].sum())
    order_count = len(filtered_orders)
    gross_profit = float(filtered_orders["gross_profit"].sum())

    filtered_ads = ads[(ads["date"] >= start) & (ads["date"] <= end)]
    ad_spend = float(filtered_ads["spend"].sum())
    total_clicks = float(filtered_ads["clicks"].sum())
    total_conversions = float(filtered_ads["conversions"].sum())
    total_ad_revenue = float(filtered_ads["revenue"].sum())

    ad_conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0.0
    acos = (ad_spend / total_ad_revenue) if total_ad_revenue > 0 else 0.0

    return total_sales, order_count, gross_profit, ad_spend, ad_conversion_rate, acos

def _pct_change(curr, prev):
    if prev == 0:
        return 0.0
    return round(((curr - prev) / prev) * 100, 2)

def get_dashboard_kpis(date_range: str) -> dict:
    """
    Returns KPIs for the selected date range and their period-over-period change.
    """
    start, end = _resolve_date_range(date_range)
    
    days = DATE_RANGES.get(date_range, 30)
    prev_end = start - pd.Timedelta(days=1)
    prev_start = prev_end - pd.Timedelta(days=days - 1)

    orders = get_sales_orders()
    ads = get_ad_performance()

    curr_vals = _calc_slice(start, end, orders, ads)
    prev_vals = _calc_slice(prev_start, prev_end, orders, ads)

    return {
        "date_range": date_range,
        "start_date": start.date().isoformat(),
        "end_date": end.date().isoformat(),
        "total_sales": round(curr_vals[0], 2),
        "orders": curr_vals[1],
        "gross_profit": round(curr_vals[2], 2),
        "ad_spend": round(curr_vals[3], 2),
        "ad_conversion_rate": round(curr_vals[4], 2),
        "acos": round(curr_vals[5], 4),
        "total_sales_change": _pct_change(curr_vals[0], prev_vals[0]),
        "orders_change": _pct_change(curr_vals[1], prev_vals[1]),
        "gross_profit_change": _pct_change(curr_vals[2], prev_vals[2]),
        "ad_spend_change": _pct_change(curr_vals[3], prev_vals[3]),
        "ad_conversion_rate_change": round(curr_vals[4] - prev_vals[4], 2),
        "acos_change": round((curr_vals[5] - prev_vals[5]) * 100, 2)
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
        filtered.groupby("order_date")
        .agg(
            revenue=("total_amount", "sum"),
            orders=("order_id", "count"),
            gross_profit=("gross_profit", "sum")
        )
        .reset_index()
        .rename(columns={"order_date": "date"})
    )
    daily["date"] = daily["date"].dt.date.astype(str)

    ads = get_ad_performance()
    ads_filtered = ads[(ads["date"] >= start) & (ads["date"] <= end)]
    ads_daily = ads_filtered.groupby("date").agg(ad_spend=("spend", "sum")).reset_index()
    ads_daily["date"] = ads_daily["date"].dt.date.astype(str)

    merged = pd.merge(daily, ads_daily, on="date", how="left").fillna(0)
    merged["revenue"] = merged["revenue"].round(2)
    merged["gross_profit"] = merged["gross_profit"].round(2)
    merged["ad_spend"] = merged["ad_spend"].round(2)

    return merged.to_dict(orient="records")


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
        .agg(
            revenue=("total_amount", "sum"), 
            orders=("order_id", "count"),
            gross_profit=("gross_profit", "sum")
        )
        .reset_index()
        .sort_values("revenue", ascending=False)
    )
    grouped["revenue"] = grouped["revenue"].round(2)
    grouped["gross_profit"] = grouped["gross_profit"].round(2)

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
