"""
Generate realistic seed data CSVs for the Ecommerce Showcase MVP.
All data is coherent across tables to support the demo story.
"""
import csv
import json
import random
import os
from datetime import date, datetime, timedelta

random.seed(42)

OUT_DIR = "/Users/orestsaban/Desktop/ecommerce_showcase_mvp/ecommerce-ai-showcase-mvp/backend/seed_data"
os.makedirs(OUT_DIR, exist_ok=True)

TODAY = date(2026, 6, 9)
DAY_90_AGO = TODAY - timedelta(days=90)  # 2026-03-11

# ─────────────────────────────────────────
# 1. PRODUCTS
# ─────────────────────────────────────────
products = [
    ("PROD-001", "Wireless Headphones",   "Electronics",  "SoundMax",   49.99, 22.00, 150, True),
    ("PROD-002", "Bluetooth Speaker",     "Electronics",  "SoundMax",   79.99, 35.00, 210, True),
    ("PROD-003", "USB-C Charging Cable",  "Electronics",  "TechLine",    9.99,  2.50, 1200, True),
    ("PROD-004", "Laptop Stand",          "Electronics",  "DeskPro",    34.99, 14.00, 95,  True),
    ("PROD-005", "Phone Case - Classic",  "Accessories",  "CoverUp",    12.50,  3.20, 800, True),
    ("PROD-006", "Phone Case - Premium",  "Accessories",  "CoverUp",    24.99,  8.00, 320, True),
    ("PROD-007", "Leather Wallet",        "Accessories",  "UrbanCraft", 39.99, 15.00, 175, True),
    ("PROD-008", "Sunglasses - Aviator",  "Accessories",  "StyleVue",   29.99, 10.00, 260, True),
    ("PROD-009", "Running Shoes - Pro",   "Footwear",     "FastStep",   89.00, 35.00,  38, True),   # LOW STOCK!
    ("PROD-010", "Trail Hiking Boots",    "Footwear",     "FastStep",  119.00, 48.00, 85,  True),
    ("PROD-011", "Casual Sneakers",       "Footwear",     "UrbanStep",  59.99, 22.00, 190, True),
    ("PROD-012", "Cotton T-Shirt",        "Clothing",     "BasicWear",  19.99,  6.00, 450, True),
    ("PROD-013", "Slim Fit Jeans",        "Clothing",     "DenimCo",    49.99, 18.00, 280, True),
    ("PROD-014", "Hoodie - Oversized",    "Clothing",     "UrbanWear",  44.99, 16.00, 310, True),
    ("PROD-015", "Winter Jacket",         "Clothing",     "NordStyle",  129.00, 52.00, 65, True),
    ("PROD-016", "Yoga Mat",              "Home",         "FitLife",     29.99, 10.00, 340, True),
    ("PROD-017", "Stainless Water Bottle","Home",         "EcoFlow",    19.99,  5.50, 520, True),
    ("PROD-018", "Scented Candle Set",    "Home",         "AromaHome",  24.99,  8.00, 180, True),
    ("PROD-019", "Desk Organizer",        "Home",         "DeskPro",    22.99,  7.50, 145, True),
    ("PROD-020", "Backpack - Travel",     "Accessories",  "UrbanCraft", 69.99, 28.00,  18, True),   # LOW STOCK!
]

prod_cols = ["product_id","product_name","category","brand","unit_price","cost_price","stock_quantity","is_active"]
with open(f"{OUT_DIR}/products.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(prod_cols)
    for p in products:
        w.writerow(list(p))

prod_lookup = {p[0]: p for p in products}
categories = list(set(p[3 - 1] for p in products))  # unique categories

# ─────────────────────────────────────────
# 2. SALES ORDERS
# ─────────────────────────────────────────
countries = ["DE", "AT", "CH", "NL", "FR", "BE"]
channels = ["web", "mobile", "marketplace"]
country_weights = [0.40, 0.15, 0.10, 0.12, 0.13, 0.10]
channel_weights = [0.50, 0.30, 0.20]

# Products with their daily order probability (higher = more popular)
prod_popularity = {
    "PROD-001": 3.5, "PROD-002": 2.0, "PROD-003": 5.0, "PROD-004": 1.5,
    "PROD-005": 4.0,  # Phone Case Classic - will have refund spike
    "PROD-006": 2.5, "PROD-007": 1.8, "PROD-008": 2.2,
    "PROD-009": 3.0,  # Running Shoes - popular, low stock
    "PROD-010": 1.2, "PROD-011": 2.8,
    "PROD-012": 4.5, "PROD-013": 2.5, "PROD-014": 3.0, "PROD-015": 0.8,
    "PROD-016": 2.0, "PROD-017": 3.5, "PROD-018": 1.5, "PROD-019": 1.0,
    "PROD-020": 1.5,
}

orders = []
order_id = 1

current_day = DAY_90_AGO
while current_day <= TODAY:
    # Slight weekend boost
    day_of_week = current_day.weekday()
    weekend_multiplier = 1.3 if day_of_week >= 5 else 1.0
    
    # Slight upward trend over time
    days_in = (current_day - DAY_90_AGO).days
    trend_multiplier = 1.0 + (days_in / 90) * 0.15  # 15% growth over 90 days
    
    for prod_id, base_rate in prod_popularity.items():
        daily_orders = base_rate * weekend_multiplier * trend_multiplier
        # Add noise
        daily_orders *= random.uniform(0.6, 1.4)
        n_orders = int(daily_orders)
        if random.random() < (daily_orders - n_orders):
            n_orders += 1
        
        prod = prod_lookup[prod_id]
        for _ in range(n_orders):
            qty = random.choices([1, 2, 3, 4, 5], weights=[60, 25, 10, 3, 2])[0]
            unit_price = prod[4]
            cost_price = prod[5]
            total_amount = round(qty * unit_price, 2)
            gross_profit = round(total_amount - (cost_price * qty), 2)
            
            # Determine refund status
            # Phone Case Classic (PROD-005): high refund rate in last 14 days (the story!)
            refund_amount = 0.0
            order_status = "completed"
            
            if prod_id == "PROD-005" and (TODAY - current_day).days <= 14:
                # ~12% refund rate for phone cases recently
                r = random.random()
                if r < 0.08:
                    order_status = "refunded"
                    refund_amount = total_amount
                elif r < 0.12:
                    order_status = "partial_refund"
                    refund_amount = round(total_amount * random.uniform(0.3, 0.6), 2)
            elif prod_id == "PROD-005":
                # Normal ~4% refund rate before
                if random.random() < 0.04:
                    order_status = "refunded"
                    refund_amount = total_amount
            else:
                # General ~3% refund/cancel rate
                r = random.random()
                if r < 0.02:
                    order_status = "refunded"
                    refund_amount = total_amount
                elif r < 0.03:
                    order_status = "cancelled"
                    refund_amount = total_amount
                    gross_profit = 0.0
            
            country = random.choices(countries, weights=country_weights)[0]
            channel = random.choices(channels, weights=channel_weights)[0]
            
            orders.append([
                f"ORD-{order_id:05d}",
                current_day.isoformat(),
                prod_id,
                prod[1],  # product_name
                prod[2],  # category
                qty,
                unit_price,
                cost_price,
                total_amount,
                gross_profit,
                refund_amount,
                order_status,
                country,
                channel,
            ])
            order_id += 1
    
    current_day += timedelta(days=1)

order_cols = ["order_id","order_date","product_id","product_name","category","quantity",
              "unit_price","cost_price","total_amount","gross_profit","refund_amount",
              "order_status","country","channel"]
with open(f"{OUT_DIR}/sales_orders.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(order_cols)
    for o in orders:
        w.writerow(o)

print(f"Generated {len(orders)} sales orders")

# ─────────────────────────────────────────
# 3. AD PERFORMANCE
# ─────────────────────────────────────────
campaigns = [
    ("CAMP-01", "Summer Sale DE",        "google", 12000, 340, 150.0, 18, 890.0),
    ("CAMP-02", "Brand Awareness EU",    "meta",   45000, 620, 200.0,  8, 320.0),   # BAD ROAS
    ("CAMP-03", "Retargeting EU",        "google",  8000, 410,  95.0, 22, 1100.0),
    ("CAMP-04", "TikTok Summer Vibes",   "tiktok", 30000, 500, 180.0, 12, 550.0),
    ("CAMP-05", "Google Shopping Feed",  "google", 15000, 720, 250.0, 35, 1800.0),
    ("CAMP-06", "Meta Retargeting",      "meta",   10000, 380, 120.0, 20, 950.0),
]

ad_rows = []
current_day = DAY_90_AGO
while current_day <= TODAY:
    day_of_week = current_day.weekday()
    days_in = (current_day - DAY_90_AGO).days
    
    for camp_id, camp_name, platform, base_imp, base_clicks, base_spend, base_conv, base_rev in campaigns:
        # Daily variation
        noise = random.uniform(0.7, 1.3)
        weekend_mult = 1.15 if day_of_week >= 5 else 1.0
        
        impressions = int(base_imp * noise * weekend_mult / 1.0)
        clicks = int(base_clicks * noise * weekend_mult)
        spend = round(base_spend * noise * weekend_mult, 2)
        conversions = max(1, int(base_conv * noise * weekend_mult))
        revenue = round(base_rev * noise * weekend_mult, 2)
        
        # CAMP-02 gets worse over last 2 weeks (the story!)
        if camp_id == "CAMP-02" and (TODAY - current_day).days <= 14:
            spend = round(spend * 1.3, 2)  # Spend goes up
            revenue = round(revenue * 0.7, 2)  # Revenue drops
            conversions = max(1, int(conversions * 0.6))
        
        ad_rows.append([
            current_day.isoformat(),
            camp_id,
            camp_name,
            platform,
            impressions,
            clicks,
            spend,
            conversions,
            revenue,
        ])
    
    current_day += timedelta(days=1)

ad_cols = ["date","campaign_id","campaign_name","platform","impressions","clicks","spend","conversions","revenue"]
with open(f"{OUT_DIR}/ad_performance.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(ad_cols)
    for r in ad_rows:
        w.writerow(r)

print(f"Generated {len(ad_rows)} ad performance rows")

# ─────────────────────────────────────────
# 4. WARNINGS
# ─────────────────────────────────────────
warnings_data = [
    {
        "warning_id": "WARN-001",
        "title": "Low stock: Running Shoes Pro",
        "category": "inventory",
        "severity": "high",
        "impact_amount": 2670.0,
        "impact_label": "€2,670 potential lost sales",
        "detected_date": "2026-06-08",
        "why": "Running Shoes Pro (PROD-009) stock is at 38 units. Average daily sell rate is 8 units/day. At current velocity, stockout expected within 5 days.",
        "recommended_action": "Place expedited reorder of 200 units with FastStep supplier.",
        "status": "new",
        "sort_order": 1,
        "action_plan_preview_json": json.dumps([
            {"step": 1, "action": "Contact FastStep supplier for expedited reorder of 200 units"},
            {"step": 2, "action": "Increase price by 5% temporarily to slow demand"},
            {"step": 3, "action": "Enable backorder notification for customers"}
        ]),
        "deep_review_scenario_id": "SCENARIO-001",
    },
    {
        "warning_id": "WARN-002",
        "title": "Ad spend inefficiency: Brand Awareness EU",
        "category": "advertising",
        "severity": "medium",
        "impact_amount": 1240.0,
        "impact_label": "€1,240 wasted spend (14 days)",
        "detected_date": "2026-06-08",
        "why": "Campaign CAMP-02 (Brand Awareness EU) ROAS dropped to 1.1x over the last 14 days, well below the 2.0x target. Spend increased 30% while attributed revenue dropped 30%.",
        "recommended_action": "Pause Brand Awareness EU campaign and reallocate budget to Retargeting EU (CAMP-03) which has 11.6x ROAS.",
        "status": "new",
        "sort_order": 2,
        "action_plan_preview_json": json.dumps([
            {"step": 1, "action": "Pause CAMP-02 Brand Awareness EU immediately"},
            {"step": 2, "action": "Reallocate €200/day budget to CAMP-03 Retargeting EU"},
            {"step": 3, "action": "Review CAMP-02 audience targeting and creative assets"},
            {"step": 4, "action": "Re-evaluate in 7 days with new creative"}
        ]),
        "deep_review_scenario_id": "SCENARIO-002",
    },
    {
        "warning_id": "WARN-003",
        "title": "Refund spike: Phone Case Classic",
        "category": "returns",
        "severity": "high",
        "impact_amount": 890.0,
        "impact_label": "€890 in refunds (14 days)",
        "detected_date": "2026-06-07",
        "why": "Phone Case Classic (PROD-005) refund rate spiked from 4% to 12% over the last 14 days. 23 refund/partial-refund orders detected. Multiple customer complaints about fit for newer phone models.",
        "recommended_action": "Review product listing for compatibility accuracy. Contact supplier about quality issue.",
        "status": "new",
        "sort_order": 3,
        "action_plan_preview_json": json.dumps([
            {"step": 1, "action": "Pull recent customer feedback for PROD-005"},
            {"step": 2, "action": "Update product listing with accurate phone model compatibility"},
            {"step": 3, "action": "Contact CoverUp supplier about recent batch quality"},
            {"step": 4, "action": "Consider temporary listing pause until resolved"}
        ]),
        "deep_review_scenario_id": "SCENARIO-003",
    },
    {
        "warning_id": "WARN-004",
        "title": "Payment decline rate increasing",
        "category": "payments",
        "severity": "medium",
        "impact_amount": 450.0,
        "impact_label": "€450 est. lost conversions",
        "detected_date": "2026-06-06",
        "why": "Payment decline rate increased from 1.5% to 3.2% over the last 7 days. Primarily affecting credit card transactions from AT and CH customers.",
        "recommended_action": "Contact payment provider to investigate. Consider enabling alternative payment methods.",
        "status": "acknowledged",
        "sort_order": 4,
        "action_plan_preview_json": json.dumps([
            {"step": 1, "action": "Contact Stripe support with decline rate report"},
            {"step": 2, "action": "Enable Klarna as alternative payment for AT/CH"},
            {"step": 3, "action": "Monitor decline rate for 48 hours after fix"}
        ]),
        "deep_review_scenario_id": "SCENARIO-004",
    },
    {
        "warning_id": "WARN-005",
        "title": "Listing suppressed: Travel Backpack",
        "category": "listings",
        "severity": "low",
        "impact_amount": 210.0,
        "impact_label": "€210 daily lost revenue",
        "detected_date": "2026-06-05",
        "why": "Travel Backpack (PROD-020) marketplace listing was suppressed due to missing product dimension data. Stock is also low at 18 units.",
        "recommended_action": "Update product listing with required dimension fields. Resubmit for marketplace review.",
        "status": "acknowledged",
        "sort_order": 5,
        "action_plan_preview_json": json.dumps([
            {"step": 1, "action": "Add missing weight and dimension data to PROD-020"},
            {"step": 2, "action": "Resubmit listing for marketplace approval"},
            {"step": 3, "action": "Reorder stock once listing is restored"}
        ]),
        "deep_review_scenario_id": None,
    },
]

warn_cols = ["warning_id","title","category","severity","impact_amount","impact_label",
             "detected_date","why","recommended_action","status","sort_order",
             "action_plan_preview_json","deep_review_scenario_id"]
with open(f"{OUT_DIR}/warnings.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(warn_cols)
    for warn in warnings_data:
        w.writerow([warn.get(c, "") for c in warn_cols])

print(f"Generated {len(warnings_data)} warnings")

# ─────────────────────────────────────────
# 5. BUSINESS HEALTH
# ─────────────────────────────────────────
bh_data = [
    ("store",             "healthy",  "Store Healthy",       "All systems operational. 187 orders processed today. Uptime 99.9%.", 1),
    ("payments",          "warning",  "Payment Decline Rate","Payment decline rate at 3.2%, up from 1.5% baseline. Primarily AT/CH credit cards.", 2),
    ("inventory",         "critical", "Stock Alert",         "2 products below safety stock: Running Shoes Pro (38 units), Travel Backpack (18 units).", 3),
    ("fulfillment",       "healthy",  "Fulfillment on Track","Average fulfillment time: 1.8 days. All orders shipped within SLA.", 4),
    ("advertising",       "warning",  "Ad Spend Concern",    "Brand Awareness EU campaign ROAS at 1.1x, below 2.0x target. €1,240 at risk over 14 days.", 5),
    ("listings",          "warning",  "Listing Issue",       "1 product listing suppressed on marketplace: Travel Backpack (PROD-020). Missing dimension data.", 6),
    ("customer_feedback", "healthy",  "Feedback Positive",   "Average rating: 4.6/5 across 342 reviews this month. No negative trends detected.", 7),
    ("returns",           "warning",  "Returns Elevated",    "Phone Case Classic refund rate spiked to 12%, up from 4% average. 23 returns in 14 days.", 8),
]

bh_cols = ["domain","status","tooltip_title","tooltip_description","sort_order"]
with open(f"{OUT_DIR}/business_health.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(bh_cols)
    for r in bh_data:
        w.writerow(r)

print(f"Generated {len(bh_data)} business health rows")

# ─────────────────────────────────────────
# 6. CONVERSATIONS
# ─────────────────────────────────────────
conversations = [
    {
        "conversation_id": "CONV-001",
        "title": "Revenue last week",
        "created_at": "2026-06-08T10:15:00Z",
        "updated_at": "2026-06-08T10:15:04Z",
        "last_message_preview": "Total revenue last week was €48,230 across 612 orders...",
        "messages_json": json.dumps([
            {"role": "user", "content": "What was our total revenue last week?", "timestamp": "2026-06-08T10:15:00Z"},
            {"role": "assistant", "content": "Total revenue last week (June 1-7, 2026) was €48,230 across 612 orders. This represents an 8% increase compared to the previous week. The top performing category was Electronics with €12,450 in revenue.", "timestamp": "2026-06-08T10:15:04Z"}
        ])
    },
    {
        "conversation_id": "CONV-002",
        "title": "Best performing campaign",
        "created_at": "2026-06-07T14:30:00Z",
        "updated_at": "2026-06-07T14:30:12Z",
        "last_message_preview": "The Retargeting EU campaign has the highest ROAS at 11.6x...",
        "messages_json": json.dumps([
            {"role": "user", "content": "Which ad campaign has the best ROAS?", "timestamp": "2026-06-07T14:30:00Z"},
            {"role": "assistant", "content": "The Retargeting EU (CAMP-03) campaign has the best ROAS at 11.6x, spending €95/day and generating €1,100/day in attributed revenue. This is followed by Google Shopping Feed (CAMP-05) at 7.2x ROAS.", "timestamp": "2026-06-07T14:30:05Z"},
            {"role": "user", "content": "And which one is performing the worst?", "timestamp": "2026-06-07T14:30:08Z"},
            {"role": "assistant", "content": "Brand Awareness EU (CAMP-02) is the worst performer with a ROAS of 1.1x over the last 14 days. It's spending €260/day but only generating €224/day in revenue. I'd recommend reviewing this campaign — there's also an active warning about it.", "timestamp": "2026-06-07T14:30:12Z"}
        ])
    },
    {
        "conversation_id": "CONV-003",
        "title": "Top selling products",
        "created_at": "2026-06-06T09:00:00Z",
        "updated_at": "2026-06-06T09:00:06Z",
        "last_message_preview": "The top 5 products by revenue this month are...",
        "messages_json": json.dumps([
            {"role": "user", "content": "What are our top 5 selling products this month?", "timestamp": "2026-06-06T09:00:00Z"},
            {"role": "assistant", "content": "Top 5 products by revenue in June 2026 so far:\n\n1. Running Shoes Pro - €4,272 (48 orders)\n2. Trail Hiking Boots - €3,570 (30 orders)\n3. Winter Jacket - €2,580 (20 orders)\n4. Wireless Headphones - €2,499 (50 orders)\n5. Bluetooth Speaker - €2,399 (30 orders)\n\nNote: Running Shoes Pro is selling well but stock is critically low at 38 units.", "timestamp": "2026-06-06T09:00:06Z"}
        ])
    },
    {
        "conversation_id": "CONV-004",
        "title": "Refund analysis",
        "created_at": "2026-06-05T16:45:00Z",
        "updated_at": "2026-06-05T16:45:08Z",
        "last_message_preview": "The overall refund rate is 3.1%, but Phone Case Classic is at 12%...",
        "messages_json": json.dumps([
            {"role": "user", "content": "What's our current refund rate? Any products with issues?", "timestamp": "2026-06-05T16:45:00Z"},
            {"role": "assistant", "content": "Overall refund rate for the last 30 days is 3.1%, which is within normal range. However, Phone Case Classic (PROD-005) stands out with a 12% refund rate over the last 14 days — up from its usual 4%. This has resulted in approximately €890 in refunds. There's an active warning about this issue.", "timestamp": "2026-06-05T16:45:08Z"}
        ])
    },
    {
        "conversation_id": "CONV-005",
        "title": "Sales by country",
        "created_at": "2026-06-04T11:20:00Z",
        "updated_at": "2026-06-04T11:20:05Z",
        "last_message_preview": "Germany accounts for 40% of total revenue...",
        "messages_json": json.dumps([
            {"role": "user", "content": "Break down our sales by country for last month", "timestamp": "2026-06-04T11:20:00Z"},
            {"role": "assistant", "content": "Sales breakdown by country for May 2026:\n\n| Country | Revenue | Orders | Share |\n|---------|---------|--------|-------|\n| Germany (DE) | €62,400 | 820 | 40% |\n| France (FR) | €20,280 | 268 | 13% |\n| Austria (AT) | €23,400 | 310 | 15% |\n| Netherlands (NL) | €18,720 | 248 | 12% |\n| Switzerland (CH) | €15,600 | 206 | 10% |\n| Belgium (BE) | €15,600 | 206 | 10% |\n\nGermany remains the dominant market. Austria and Switzerland are growing but note the payment decline issue affecting those regions.", "timestamp": "2026-06-04T11:20:05Z"}
        ])
    },
]

conv_cols = ["conversation_id","title","created_at","updated_at","last_message_preview","messages_json"]
with open(f"{OUT_DIR}/conversations.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(conv_cols)
    for c in conversations:
        w.writerow([c[col] for col in conv_cols])

print(f"Generated {len(conversations)} conversations")

# ─────────────────────────────────────────
# 7. DEEP REVIEW SCENARIOS
# ─────────────────────────────────────────
deep_review = [
    {
        "scenario_id": "SCENARIO-001",
        "warning_id": "WARN-001",
        "consensus_status": "agree",
        "confidence": 0.88,
        "expected_recovery": "€2,670 in preserved sales over 5 days",
        "recommended_action": "Place expedited reorder of 200 units from FastStep. Temporarily increase price by 5% to slow demand while awaiting delivery.",
        "model_reasoning_json": json.dumps([
            {"model": "GPT-4", "verdict": "agree", "confidence": 0.92, "reasoning": "Stock depletion rate of 8 units/day confirms stockout within 5 days. Running Shoes Pro has consistent demand with no seasonal decline expected. Expedited reorder is critical."},
            {"model": "Claude", "verdict": "agree", "confidence": 0.88, "reasoning": "Historical data shows Running Shoes Pro maintains steady 7-9 units/day sell rate. Current stock of 38 units gives ~4.7 days of runway. Revenue impact is €2,670 based on average order value."},
            {"model": "Gemini", "verdict": "agree", "confidence": 0.85, "reasoning": "Concur with stockout timeline. Additionally, this product has high margins (60.7%) making it a priority SKU. Suggest reorder of 200 units and temporary price increase to manage demand."}
        ])
    },
    {
        "scenario_id": "SCENARIO-002",
        "warning_id": "WARN-002",
        "consensus_status": "partial_agree",
        "confidence": 0.74,
        "expected_recovery": "€620 savings in 2 weeks",
        "recommended_action": "Pause Brand Awareness EU campaign. Shift 60% of budget to Retargeting EU, 40% to Google Shopping Feed.",
        "model_reasoning_json": json.dumps([
            {"model": "GPT-4", "verdict": "agree", "confidence": 0.82, "reasoning": "ROAS decline from 1.6x to 1.1x over 14 days is significant. Ad fatigue is likely. Recommend full pause and budget reallocation to high-performing campaigns."},
            {"model": "Claude", "verdict": "partial_agree", "confidence": 0.72, "reasoning": "Agree ROAS is problematic, but brand awareness campaigns have long-term attribution. Suggest reducing spend by 70% rather than full pause. Keep running with refreshed creative."},
            {"model": "Gemini", "verdict": "agree", "confidence": 0.68, "reasoning": "Meta platform performance has declined across multiple metrics. CTR is down, CPA is up. Full pause is justified. Reallocate to Google campaigns which show stronger performance."}
        ])
    },
    {
        "scenario_id": "SCENARIO-003",
        "warning_id": "WARN-003",
        "consensus_status": "agree",
        "confidence": 0.82,
        "expected_recovery": "€890 in reduced refunds per 14-day cycle",
        "recommended_action": "Update product listing with accurate compatibility info. Contact CoverUp supplier about quality control for recent batch.",
        "model_reasoning_json": json.dumps([
            {"model": "GPT-4", "verdict": "agree", "confidence": 0.85, "reasoning": "Refund spike correlates with new phone model releases. Product listing shows outdated compatibility info. Updating listing should reduce return rate to baseline within 1-2 weeks."},
            {"model": "Claude", "verdict": "agree", "confidence": 0.80, "reasoning": "Pattern analysis shows 78% of returns cite 'wrong fit' or 'incompatible'. This is a listing accuracy issue, not a product quality issue. Fix is straightforward — update specs and images."},
            {"model": "Gemini", "verdict": "agree", "confidence": 0.82, "reasoning": "Agree this is a listing issue. Additionally recommend adding a compatibility checker widget to the product page to prevent future mismatches."}
        ])
    },
    {
        "scenario_id": "SCENARIO-004",
        "warning_id": "WARN-004",
        "consensus_status": "partial_agree",
        "confidence": 0.70,
        "expected_recovery": "€450 in recovered conversions per week",
        "recommended_action": "Contact payment provider. Enable Klarna for AT/CH. Monitor for 48 hours.",
        "model_reasoning_json": json.dumps([
            {"model": "GPT-4", "verdict": "agree", "confidence": 0.78, "reasoning": "Payment decline patterns are consistent with a processor-side issue. The regional concentration (AT/CH) suggests it may be related to 3DS2 authentication changes in those markets."},
            {"model": "Claude", "verdict": "partial_agree", "confidence": 0.65, "reasoning": "Decline rate increase is notable but 3.2% is still within industry norms. Could be seasonal. Recommend monitoring for another 48 hours before escalating to payment provider."},
            {"model": "Gemini", "verdict": "agree", "confidence": 0.68, "reasoning": "Correlation with AT/CH markets is strong. Adding Klarna as an alternative payment method is low-effort and could recover a portion of declined transactions immediately."}
        ])
    },
]

dr_cols = ["scenario_id","warning_id","consensus_status","confidence","expected_recovery",
           "recommended_action","model_reasoning_json"]
with open(f"{OUT_DIR}/deep_review_scenarios.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(dr_cols)
    for s in deep_review:
        w.writerow([s[c] for c in dr_cols])

print(f"Generated {len(deep_review)} deep review scenarios")

# ─────────────────────────────────────────
# 8. SETTINGS
# ─────────────────────────────────────────
settings_data = [
    ("low_stock_threshold",    "50",    "Low Stock Threshold",        "thresholds"),
    ("critical_stock_threshold","20",   "Critical Stock Threshold",   "thresholds"),
    ("min_roas_target",        "2.0",   "Minimum ROAS Target",        "thresholds"),
    ("max_acos_target",        "0.35",  "Maximum ACoS Target",        "thresholds"),
    ("refund_rate_threshold",  "5.0",   "Refund Rate Alert (%)",      "thresholds"),
    ("payment_decline_threshold","2.5", "Payment Decline Alert (%)",  "thresholds"),
    ("default_currency",       "EUR",   "Default Currency",           "display"),
    ("default_date_range",     "last_30_days", "Default Date Range",  "display"),
    ("dashboard_refresh_interval","300","Dashboard Refresh (seconds)","display"),
    ("enable_email_alerts",    "false", "Email Alerts",               "notifications"),
    ("enable_slack_alerts",    "false", "Slack Alerts",               "notifications"),
    ("alert_email_address",    "",      "Alert Email Address",        "notifications"),
]

set_cols = ["setting_key","setting_value","label","category"]
with open(f"{OUT_DIR}/settings.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(set_cols)
    for s in settings_data:
        w.writerow(s)

print(f"Generated {len(settings_data)} settings")
print("\nAll seed data generated successfully!")
