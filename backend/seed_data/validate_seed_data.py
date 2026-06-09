"""
Validate seed data CSVs for the Ecommerce Showcase MVP.
Checks file existence, columns, relationships, date coverage, and demo story integrity.
"""
import csv
import os
import sys
from datetime import datetime, date

SEED_DIR = os.path.dirname(os.path.abspath(__file__))

REQUIRED_FILES = [
    "sales_orders.csv",
    "products.csv",
    "ad_performance.csv",
    "warnings.csv",
    "business_health.csv",
    "conversations.csv",
    "deep_review_scenarios.csv",
    "settings.csv",
]

REQUIRED_COLUMNS = {
    "sales_orders.csv": [
        "order_id", "order_date", "product_id", "product_name", "category",
        "quantity", "unit_price", "cost_price", "total_amount", "gross_profit",
        "refund_amount", "order_status", "country", "channel",
    ],
    "products.csv": [
        "product_id", "product_name", "category", "brand",
        "unit_price", "cost_price", "stock_quantity", "is_active",
    ],
    "ad_performance.csv": [
        "date", "campaign_id", "campaign_name", "platform",
        "impressions", "clicks", "spend", "conversions", "revenue",
    ],
    "warnings.csv": [
        "warning_id", "title", "category", "severity", "impact_amount",
        "impact_label", "detected_date", "why", "recommended_action",
        "status", "sort_order", "action_plan_preview_json", "deep_review_scenario_id",
    ],
    "business_health.csv": [
        "domain", "status", "tooltip_title", "tooltip_description", "sort_order",
    ],
    "conversations.csv": [
        "conversation_id", "title", "created_at", "updated_at",
        "last_message_preview", "messages_json",
    ],
    "deep_review_scenarios.csv": [
        "scenario_id", "warning_id", "consensus_status", "confidence",
        "expected_recovery", "recommended_action", "model_reasoning_json",
    ],
    "settings.csv": [
        "setting_key", "setting_value", "label", "category",
    ],
}

passed = 0
failed = 0


def check(label, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  ✅ PASS: {label}")
    else:
        failed += 1
        msg = f"  ❌ FAIL: {label}"
        if detail:
            msg += f" — {detail}"
        print(msg)
    return condition


def load_csv(filename):
    path = os.path.join(SEED_DIR, filename)
    with open(path, newline="") as f:
        reader = csv.DictReader(f)
        return list(reader), reader.fieldnames


def main():
    global passed, failed

    print("=" * 60)
    print("SEED DATA VALIDATION REPORT")
    print("=" * 60)

    # ── 1. File existence ──
    print("\n── File Existence ──")
    all_exist = True
    for fname in REQUIRED_FILES:
        exists = os.path.isfile(os.path.join(SEED_DIR, fname))
        check(f"{fname} exists", exists)
        if not exists:
            all_exist = False

    if not all_exist:
        print("\n❌ Missing required files. Cannot continue validation.")
        sys.exit(1)

    # Load all data
    data = {}
    headers = {}
    for fname in REQUIRED_FILES:
        rows, cols = load_csv(fname)
        data[fname] = rows
        headers[fname] = cols

    # ── 2. Column validation ──
    print("\n── Column Validation ──")
    for fname, required_cols in REQUIRED_COLUMNS.items():
        actual_cols = headers[fname]
        missing = [c for c in required_cols if c not in actual_cols]
        check(f"{fname} has all required columns", len(missing) == 0,
              f"missing: {missing}" if missing else "")

    # ── 3. Row counts ──
    print("\n── Row Counts ──")
    for fname in REQUIRED_FILES:
        count = len(data[fname])
        print(f"  📊 {fname}: {count} rows")

    check("sales_orders has enough data (>1000)", len(data["sales_orders.csv"]) > 1000,
          f"got {len(data['sales_orders.csv'])}")
    check("ad_performance has enough data (>300)", len(data["ad_performance.csv"]) > 300,
          f"got {len(data['ad_performance.csv'])}")
    check("products has 15+ products", len(data["products.csv"]) >= 15,
          f"got {len(data['products.csv'])}")

    # ── 4. Relationship validation ──
    print("\n── Relationship Validation ──")

    product_ids = {r["product_id"] for r in data["products.csv"]}
    order_product_ids = {r["product_id"] for r in data["sales_orders.csv"]}
    orphan_products = order_product_ids - product_ids
    check("All sales_orders.product_id exist in products",
          len(orphan_products) == 0,
          f"orphaned product_ids: {orphan_products}" if orphan_products else "")

    scenario_ids = {r["scenario_id"] for r in data["deep_review_scenarios.csv"]}
    for w in data["warnings.csv"]:
        ds_id = w.get("deep_review_scenario_id", "").strip()
        if ds_id:
            check(f"Warning {w['warning_id']} → {ds_id} exists in deep_review_scenarios",
                  ds_id in scenario_ids)

    bh_domains = {r["domain"] for r in data["business_health.csv"]}
    warn_categories = {r["category"] for r in data["warnings.csv"]}
    missing_domains = warn_categories - bh_domains
    check("All warning categories exist in business_health domains",
          len(missing_domains) == 0,
          f"missing: {missing_domains}" if missing_domains else "")

    # ── 5. Date coverage ──
    print("\n── Date Coverage ──")

    order_dates = sorted({r["order_date"] for r in data["sales_orders.csv"]})
    min_order = order_dates[0]
    max_order = order_dates[-1]
    order_span = (datetime.strptime(max_order, "%Y-%m-%d") - datetime.strptime(min_order, "%Y-%m-%d")).days
    print(f"  📅 sales_orders: {min_order} → {max_order} ({order_span} days)")
    check("sales_orders covers at least 90 days", order_span >= 90,
          f"only {order_span} days")

    ad_dates = sorted({r["date"] for r in data["ad_performance.csv"]})
    min_ad = ad_dates[0]
    max_ad = ad_dates[-1]
    ad_span = (datetime.strptime(max_ad, "%Y-%m-%d") - datetime.strptime(min_ad, "%Y-%m-%d")).days
    print(f"  📅 ad_performance: {min_ad} → {max_ad} ({ad_span} days)")
    check("ad_performance covers at least 90 days", ad_span >= 90,
          f"only {ad_span} days")

    # ── 6. Demo story validation ──
    print("\n── Demo Story Validation ──")

    # PROD-009 low stock
    prod009 = next((r for r in data["products.csv"] if r["product_id"] == "PROD-009"), None)
    if prod009:
        stock = int(prod009["stock_quantity"])
        check(f"PROD-009 (Running Shoes Pro) stock < 50", stock < 50,
              f"stock is {stock}")
    else:
        check("PROD-009 exists in products", False, "not found")

    # PROD-005 refund spike in last 14 days
    today = datetime.strptime(max_order, "%Y-%m-%d").date()
    cutoff_14 = (today - __import__("datetime").timedelta(days=14)).isoformat()
    recent_005 = [r for r in data["sales_orders.csv"]
                  if r["product_id"] == "PROD-005" and r["order_date"] >= cutoff_14]
    if recent_005:
        refunded = sum(1 for r in recent_005 if r["order_status"] in ("refunded", "partial_refund"))
        refund_rate = refunded / len(recent_005) * 100
        check(f"PROD-005 refund rate > 8% in last 14 days",
              refund_rate > 8,
              f"refund rate is {refund_rate:.1f}% ({refunded}/{len(recent_005)})")
    else:
        check("PROD-005 has recent orders", False, "no orders in last 14 days")

    # CAMP-02 poor ROAS vs others
    camp02_rows = [r for r in data["ad_performance.csv"]
                   if r["campaign_id"] == "CAMP-02" and r["date"] >= cutoff_14]
    other_rows = [r for r in data["ad_performance.csv"]
                  if r["campaign_id"] != "CAMP-02" and r["date"] >= cutoff_14]
    if camp02_rows and other_rows:
        c02_spend = sum(float(r["spend"]) for r in camp02_rows)
        c02_rev = sum(float(r["revenue"]) for r in camp02_rows)
        c02_roas = c02_rev / c02_spend if c02_spend > 0 else 0

        other_spend = sum(float(r["spend"]) for r in other_rows)
        other_rev = sum(float(r["revenue"]) for r in other_rows)
        other_roas = other_rev / other_spend if other_spend > 0 else 0

        print(f"  📊 CAMP-02 ROAS (14d): {c02_roas:.2f}x | Others avg: {other_roas:.2f}x")
        check("CAMP-02 ROAS < 2.0x in last 14 days", c02_roas < 2.0,
              f"ROAS is {c02_roas:.2f}x")
        check("CAMP-02 ROAS worse than average", c02_roas < other_roas,
              f"CAMP-02={c02_roas:.2f}x vs others={other_roas:.2f}x")

    # Business health checks
    bh_lookup = {r["domain"]: r["status"] for r in data["business_health.csv"]}
    check("business_health: inventory is critical",
          bh_lookup.get("inventory") == "critical",
          f"got '{bh_lookup.get('inventory')}'")
    check("business_health: advertising is warning",
          bh_lookup.get("advertising") == "warning",
          f"got '{bh_lookup.get('advertising')}'")
    check("business_health: returns is warning",
          bh_lookup.get("returns") == "warning",
          f"got '{bh_lookup.get('returns')}'")

    # ── 7. Summary KPIs ──
    print("\n── Summary KPIs (for reference) ──")

    total_revenue = sum(float(r["total_amount"]) for r in data["sales_orders.csv"])
    total_orders = len(data["sales_orders.csv"])
    total_profit = sum(float(r["gross_profit"]) for r in data["sales_orders.csv"])
    total_refunds = sum(float(r["refund_amount"]) for r in data["sales_orders.csv"])
    total_ad_spend = sum(float(r["spend"]) for r in data["ad_performance.csv"])
    total_ad_revenue = sum(float(r["revenue"]) for r in data["ad_performance.csv"])

    print(f"  💰 Total Revenue (90d): €{total_revenue:,.2f}")
    print(f"  📦 Total Orders (90d): {total_orders:,}")
    print(f"  📈 Gross Profit (90d): €{total_profit:,.2f}")
    print(f"  🔄 Total Refunds (90d): €{total_refunds:,.2f}")
    print(f"  📢 Total Ad Spend (90d): €{total_ad_spend:,.2f}")
    print(f"  📢 Total Ad Revenue (90d): €{total_ad_revenue:,.2f}")
    print(f"  📢 Overall ROAS: {total_ad_revenue / total_ad_spend:.2f}x")

    # ── Final ──
    print("\n" + "=" * 60)
    print(f"RESULT: {passed} passed, {failed} failed")
    if failed == 0:
        print("✅ All validations passed!")
    else:
        print("❌ Some validations failed. Review above.")
    print("=" * 60)

    sys.exit(1 if failed > 0 else 0)


if __name__ == "__main__":
    main()
