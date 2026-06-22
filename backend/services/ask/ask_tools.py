"""
Ask tool implementations.

Each tool takes a DataRepository and optional keyword arguments,
queries the relevant data, and returns a structured dict.

The TOOL_REGISTRY at the bottom maps tool names to their functions,
making it easy for AskService.select_tools() to look them up later.
"""
import pandas as pd
from services.data_repository import DataRepository


def sales_summary(repo: DataRepository, **kwargs) -> dict:
    """
    Summarize total sales, order count, revenue trends, and comparisons.
    """
    df = repo.get_sales_data()

    total_revenue = round(float(df["total_amount"].sum()), 2)
    total_orders = int(df["order_id"].nunique())
    gross_profit = round(float(df["gross_profit"].sum()), 2)
    avg_order_value = round(total_revenue / total_orders, 2) if total_orders > 0 else 0.0

    # Revenue trend: last 7 days vs prior 7 days
    max_date = df["order_date"].max()
    last_7_start = max_date - pd.Timedelta(days=6)
    prior_7_end = last_7_start - pd.Timedelta(days=1)
    prior_7_start = prior_7_end - pd.Timedelta(days=6)

    last_7_rev = float(df[(df["order_date"] >= last_7_start) & (df["order_date"] <= max_date)]["total_amount"].sum())
    prior_7_rev = float(df[(df["order_date"] >= prior_7_start) & (df["order_date"] <= prior_7_end)]["total_amount"].sum())
    revenue_change_pct = round(((last_7_rev - prior_7_rev) / prior_7_rev) * 100, 2) if prior_7_rev > 0 else 0.0

    # Daily breakdown for the latest 14 days
    last_14_start = max_date - pd.Timedelta(days=13)
    recent = df[(df["order_date"] >= last_14_start) & (df["order_date"] <= max_date)]
    daily = (
        recent.groupby("order_date")
        .agg(revenue=("total_amount", "sum"), orders=("order_id", "nunique"))
        .reset_index()
        .sort_values("order_date")
    )
    daily_revenue = [
        {"date": row["order_date"].date().isoformat(), "revenue": round(float(row["revenue"]), 2)}
        for _, row in daily.iterrows()
    ]
    daily_orders = [
        {"date": row["order_date"].date().isoformat(), "orders": int(row["orders"])}
        for _, row in daily.iterrows()
    ]

    best_day = daily.sort_values("revenue", ascending=False).iloc[0] if not daily.empty else None
    worst_day = daily.sort_values("revenue", ascending=True).iloc[0] if not daily.empty else None

    def _day_dict(row):
        if row is None:
            return None
        return {"date": row["order_date"].date().isoformat(), "revenue": round(float(row["revenue"]), 2), "orders": int(row["orders"])}

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "gross_profit": gross_profit,
        "average_order_value": avg_order_value,
        "last_7_days_revenue": round(last_7_rev, 2),
        "prior_7_days_revenue": round(prior_7_rev, 2),
        "revenue_change_pct": revenue_change_pct,
        "daily_revenue_14d": daily_revenue,
        "daily_orders_14d": daily_orders,
        "best_revenue_day": _day_dict(best_day),
        "worst_revenue_day": _day_dict(worst_day),
        "date_range": {
            "start": df["order_date"].min().date().isoformat(),
            "end": max_date.date().isoformat(),
        },
    }


def category_performance(repo: DataRepository, **kwargs) -> dict:
    """
    Break down sales by product category.
    """
    df = repo.get_sales_data()

    grouped = (
        df.groupby("category")
        .agg(
            revenue=("total_amount", "sum"),
            orders=("order_id", "nunique"),
            gross_profit=("gross_profit", "sum"),
        )
        .reset_index()
    )

    total_revenue = float(grouped["revenue"].sum())
    by_revenue = grouped.sort_values("revenue", ascending=False)
    by_orders = grouped.sort_values("orders", ascending=False)

    categories_ranked = []
    for _, row in by_revenue.iterrows():
        rev = float(row["revenue"])
        gp = float(row["gross_profit"])
        categories_ranked.append({
            "category": row["category"],
            "revenue": round(rev, 2),
            "orders": int(row["orders"]),
            "gross_profit": round(gp, 2),
            "share_of_revenue_pct": round((rev / total_revenue) * 100, 2) if total_revenue > 0 else 0.0,
            "gross_margin_pct": round((gp / rev) * 100, 2) if rev > 0 else 0.0,
        })

    best = categories_ranked[0] if categories_ranked else None
    worst = categories_ranked[-1] if categories_ranked else None

    return {
        "categories_by_revenue": categories_ranked,
        "categories_by_orders": [
            {"category": r["category"], "orders": int(r["orders"])}
            for _, r in by_orders.iterrows()
        ],
        "best_category": best,
        "worst_category": worst,
        "total_categories": len(categories_ranked),
    }


def ad_performance(repo: DataRepository, **kwargs) -> dict:
    """
    Summarize advertising metrics: spend, ACOS, conversions, campaigns.
    """
    df = repo.get_ad_data()

    total_spend = round(float(df["spend"].sum()), 2)
    total_revenue = float(df["revenue"].sum())
    total_clicks = int(df["clicks"].sum())
    total_conversions = int(df["conversions"].sum())

    avg_acos = round((total_spend / total_revenue) * 100, 2) if total_revenue > 0 else 0.0
    avg_conversion_rate = round((total_conversions / total_clicks) * 100, 2) if total_clicks > 0 else 0.0

    # Per-campaign aggregation
    campaigns = (
        df.groupby("campaign_name")
        .agg(
            spend=("spend", "sum"),
            revenue=("revenue", "sum"),
            conversions=("conversions", "sum"),
            clicks=("clicks", "sum"),
        )
        .reset_index()
    )
    campaigns["acos"] = campaigns.apply(
        lambda r: round((r["spend"] / r["revenue"]) * 100, 2) if r["revenue"] > 0 else 0.0, axis=1
    )
    campaigns["roas"] = campaigns.apply(
        lambda r: round(r["revenue"] / r["spend"], 2) if r["spend"] > 0 else 0.0, axis=1
    )

    best_campaign = campaigns.sort_values("roas", ascending=False).iloc[0] if not campaigns.empty else None
    worst_campaign = campaigns.sort_values("roas", ascending=True).iloc[0] if not campaigns.empty else None
    highest_spend = campaigns.sort_values("spend", ascending=False).iloc[0] if not campaigns.empty else None

    def _camp_dict(row):
        if row is None:
            return None
        return {
            "campaign_name": row["campaign_name"],
            "spend": round(float(row["spend"]), 2),
            "revenue": round(float(row["revenue"]), 2),
            "roas": float(row["roas"]),
            "acos": float(row["acos"]),
        }

    return {
        "total_spend": total_spend,
        "total_revenue": round(total_revenue, 2),
        "avg_acos_pct": avg_acos,
        "avg_conversion_rate_pct": avg_conversion_rate,
        "best_campaign": _camp_dict(best_campaign),
        "worst_campaign": _camp_dict(worst_campaign),
        "highest_spend_campaign": _camp_dict(highest_spend),
        "total_campaigns": int(campaigns.shape[0]),
    }


def product_performance(repo: DataRepository, **kwargs) -> dict:
    """
    Analyze individual product performance.
    """
    df = repo.get_sales_data()

    grouped = (
        df.groupby(["product_id", "product_name"])
        .agg(
            revenue=("total_amount", "sum"),
            orders=("order_id", "nunique"),
            gross_profit=("gross_profit", "sum"),
            units_sold=("quantity", "sum"),
        )
        .reset_index()
    )

    def _prod_list(sorted_df, n=5):
        result = []
        for _, row in sorted_df.head(n).iterrows():
            result.append({
                "product_id": row["product_id"],
                "product_name": row["product_name"],
                "revenue": round(float(row["revenue"]), 2),
                "orders": int(row["orders"]),
                "units_sold": int(row["units_sold"]),
                "gross_profit": round(float(row["gross_profit"]), 2),
            })
        return result

    by_revenue_desc = grouped.sort_values("revenue", ascending=False)
    by_revenue_asc = grouped.sort_values("revenue", ascending=True)
    by_orders_desc = grouped.sort_values("orders", ascending=False)

    return {
        "top_products_by_revenue": _prod_list(by_revenue_desc),
        "top_products_by_orders": _prod_list(by_orders_desc),
        "bottom_products_by_revenue": _prod_list(by_revenue_asc),
        "product_count": int(grouped.shape[0]),
    }


def refund_analysis(repo: DataRepository, **kwargs) -> dict:
    """
    Analyze refund rates and patterns.
    """
    df = repo.get_sales_data()

    total_revenue = float(df["total_amount"].sum())
    total_refunds = float(df["refund_amount"].sum()) if "refund_amount" in df.columns else 0.0
    refund_rate = round((total_refunds / total_revenue) * 100, 2) if total_revenue > 0 else 0.0

    # By category
    if "refund_amount" in df.columns:
        by_category = (
            df.groupby("category")
            .agg(
                revenue=("total_amount", "sum"),
                refunds=("refund_amount", "sum"),
            )
            .reset_index()
        )
        by_category["refund_rate_pct"] = by_category.apply(
            lambda r: round((r["refunds"] / r["revenue"]) * 100, 2) if r["revenue"] > 0 else 0.0, axis=1
        )
        by_category = by_category.sort_values("refund_rate_pct", ascending=False)

        categories = []
        for _, row in by_category.iterrows():
            categories.append({
                "category": row["category"],
                "refunds": round(float(row["refunds"]), 2),
                "revenue": round(float(row["revenue"]), 2),
                "refund_rate_pct": float(row["refund_rate_pct"]),
            })

        # By product
        by_product = (
            df.groupby(["product_id", "product_name"])
            .agg(
                revenue=("total_amount", "sum"),
                refunds=("refund_amount", "sum"),
            )
            .reset_index()
        )
        by_product["refund_rate_pct"] = by_product.apply(
            lambda r: round((r["refunds"] / r["revenue"]) * 100, 2) if r["revenue"] > 0 else 0.0, axis=1
        )
        by_product = by_product.sort_values("refund_rate_pct", ascending=False)

        top_refund_products = []
        for _, row in by_product.head(5).iterrows():
            prod_rate = float(row["refund_rate_pct"])
            top_refund_products.append({
                "product_id": row["product_id"],
                "product_name": row["product_name"],
                "refunds": round(float(row["refunds"]), 2),
                "refund_rate_pct": prod_rate,
                "refund_amount_share_pct": round((float(row["refunds"]) / total_refunds) * 100, 2) if total_refunds > 0 else 0.0,
                "vs_overall_pct": round(prod_rate - refund_rate, 2),
            })
    else:
        categories = []
        top_refund_products = []

    return {
        "total_refunds": round(total_refunds, 2),
        "total_revenue": round(total_revenue, 2),
        "refund_rate_pct": refund_rate,
        "categories_by_refund_rate": categories,
        "top_refund_products": top_refund_products,
    }


def inventory_analysis(repo: DataRepository, **kwargs) -> dict:
    """
    Analyze inventory levels and stock health.
    """
    products = repo.get_inventory_data()
    sales = repo.get_sales_data()

    LOW_STOCK_THRESHOLD = 50
    AT_RISK_THRESHOLD = 20

    low_stock = products[products["stock_quantity"] <= LOW_STOCK_THRESHOLD] if "stock_quantity" in products.columns else pd.DataFrame()
    at_risk = products[products["stock_quantity"] <= AT_RISK_THRESHOLD] if "stock_quantity" in products.columns else pd.DataFrame()

    # Compute recent sales velocity (last 14 days)
    max_date = sales["order_date"].max()
    last_14_start = max_date - pd.Timedelta(days=13)
    recent_sales = sales[(sales["order_date"] >= last_14_start) & (sales["order_date"] <= max_date)]
    velocity = (
        recent_sales.groupby("product_id")
        .agg(units_sold_14d=("quantity", "sum"))
        .reset_index()
    )
    velocity["daily_sales"] = (velocity["units_sold_14d"] / 14).round(2)

    def _inv_list(subset):
        result = []
        for _, row in subset.iterrows():
            pid = row["product_id"]
            vel_row = velocity[velocity["product_id"] == pid]
            daily = float(vel_row["daily_sales"].iloc[0]) if not vel_row.empty else 0.0
            stock = int(row["stock_quantity"])
            days_left = round(stock / daily, 1) if daily > 0 else None
            result.append({
                "product_id": pid,
                "product_name": row["product_name"],
                "stock_quantity": stock,
                "category": row["category"],
                "estimated_daily_sales": daily,
                "estimated_days_until_stockout": days_left,
            })
        return result

    total_products = int(products.shape[0])
    active_products = int(products[products["is_active"] == True].shape[0]) if "is_active" in products.columns else total_products

    return {
        "total_products": total_products,
        "active_products": active_products,
        "low_stock_products": _inv_list(low_stock),
        "low_stock_count": int(low_stock.shape[0]),
        "at_risk_products": _inv_list(at_risk),
        "at_risk_count": int(at_risk.shape[0]),
        "low_stock_threshold": LOW_STOCK_THRESHOLD,
        "at_risk_threshold": AT_RISK_THRESHOLD,
    }


def warnings_summary(repo: DataRepository, **kwargs) -> dict:
    """
    Summarize active warnings: count, severity breakdown, top issues.
    """
    df = repo.get_warning_data()

    active = df[df["status"] == "new"] if "status" in df.columns else df

    severity_counts = {}
    if "severity" in active.columns:
        for sev, count in active["severity"].value_counts().items():
            severity_counts[sev] = int(count)

    category_counts = {}
    if "category" in active.columns:
        for cat, count in active["category"].value_counts().items():
            category_counts[cat] = int(count)

    top_warning = None
    if "sort_order" in active.columns and not active.empty:
        top_row = active.sort_values("sort_order").iloc[0]
        top_warning = {
            "warning_id": str(top_row["warning_id"]),
            "title": str(top_row["title"]),
            "severity": str(top_row["severity"]),
            "category": str(top_row["category"]),
            "impact_amount": float(top_row["impact_amount"]) if pd.notna(top_row.get("impact_amount")) else 0.0,
        }

    # Warnings ranked by impact
    warnings_ranked = []
    total_impact = 0.0
    if "impact_amount" in active.columns and not active.empty:
        ranked = active.sort_values("impact_amount", ascending=False)
        for _, row in ranked.iterrows():
            amt = float(row["impact_amount"]) if pd.notna(row.get("impact_amount")) else 0.0
            total_impact += amt
            warnings_ranked.append({
                "warning_id": str(row["warning_id"]),
                "title": str(row["title"]),
                "severity": str(row["severity"]),
                "category": str(row["category"]),
                "impact_amount": amt,
            })

    return {
        "active_warnings": int(active.shape[0]),
        "total_warnings": int(df.shape[0]),
        "by_severity": severity_counts,
        "by_category": category_counts,
        "top_warning": top_warning,
        "warnings_ranked_by_impact": warnings_ranked,
        "total_estimated_impact": round(total_impact, 2),
    }


def business_health_summary(repo: DataRepository, **kwargs) -> dict:
    """
    Summarize overall business health across all domains.
    """
    df = repo.get_business_health()

    status_counts = {}
    if "status" in df.columns:
        for st, count in df["status"].value_counts().items():
            status_counts[st] = int(count)

    critical = []
    healthy = []
    if "status" in df.columns and "domain" in df.columns:
        for _, row in df.iterrows():
            entry = {"domain": row["domain"], "status": row["status"]}
            status_lower = str(row["status"]).lower()
            if status_lower in ("critical", "warning"):
                critical.append(entry)
            elif status_lower == "healthy":
                healthy.append(entry)

    total_domains = int(df.shape[0])

    has_critical = any(str(s).lower() == "critical" for s in status_counts.keys())
    has_warning = any(str(s).lower() == "warning" for s in status_counts.keys())
    healthy_count = sum(v for k, v in status_counts.items() if str(k).lower() == "healthy")

    if healthy_count == total_domains:
        overall = "Healthy"
    elif has_critical:
        overall = "Critical"
    elif has_warning:
        overall = "Warning"
    else:
        overall = "Unknown"

    return {
        "overall_health": overall,
        "total_domains": total_domains,
        "status_counts": status_counts,
        "critical_areas": critical,
        "healthy_areas": healthy,
    }


# ── Tool Registry ────────────────────────────────────────────
# Maps tool names (used by select_tools) to their callable functions.

TOOL_REGISTRY: dict[str, callable] = {
    "sales_summary": sales_summary,
    "category_performance": category_performance,
    "ad_performance": ad_performance,
    "product_performance": product_performance,
    "refund_analysis": refund_analysis,
    "inventory_analysis": inventory_analysis,
    "warnings_summary": warnings_summary,
    "business_health_summary": business_health_summary,
}
