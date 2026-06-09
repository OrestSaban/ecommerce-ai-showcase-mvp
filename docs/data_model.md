# Data Model — Ecommerce Showcase MVP

BigQuery dataset: `ecommerce_showcase`

---

## 1. `sales_orders`

**Purpose:** Core transactional data. Powers revenue KPIs, sales trends, profit calculations, and refund tracking. This is the primary table queried by the Ask assistant.

| Column | Type | Description |
|--------|------|-------------|
| order_id | STRING | Unique order identifier |
| order_date | DATE | Date the order was placed |
| product_id | STRING | FK to `products` |
| product_name | STRING | Denormalized for query convenience |
| category | STRING | Product category |
| quantity | INT64 | Units sold |
| unit_price | FLOAT64 | Price per unit (EUR) |
| cost_price | FLOAT64 | Cost per unit (EUR) |
| total_amount | FLOAT64 | quantity × unit_price |
| gross_profit | FLOAT64 | total_amount − (cost_price × quantity) |
| refund_amount | FLOAT64 | Refunded amount (0 if none) |
| order_status | STRING | completed, refunded, partial_refund, cancelled |
| country | STRING | Customer country |
| channel | STRING | Sales channel (web, mobile, marketplace) |

**Example rows:**

| order_id | order_date | product_id | product_name | category | quantity | unit_price | cost_price | total_amount | gross_profit | refund_amount | order_status | country | channel |
|----------|------------|------------|--------------|----------|----------|------------|------------|--------------|--------------|---------------|--------------|---------|---------|
| ORD-001 | 2025-06-01 | PROD-010 | Wireless Headphones | Electronics | 2 | 49.99 | 22.00 | 99.98 | 55.98 | 0.00 | completed | DE | web |
| ORD-002 | 2025-06-01 | PROD-023 | Running Shoes | Footwear | 1 | 89.00 | 35.00 | 89.00 | 54.00 | 89.00 | refunded | AT | mobile |
| ORD-003 | 2025-06-02 | PROD-005 | Phone Case | Accessories | 5 | 12.50 | 3.20 | 62.50 | 46.50 | 0.00 | completed | DE | marketplace |

**Used by:** Dashboard (revenue, profit, refund KPIs, sales chart), Ask (natural language queries via Pandas)

---

## 2. `products`

**Purpose:** Product catalog. Used for product-level analytics, category breakdowns, and stock warnings.

| Column | Type | Description |
|--------|------|-------------|
| product_id | STRING | Unique product identifier |
| product_name | STRING | Display name |
| category | STRING | Product category |
| brand | STRING | Brand name |
| unit_price | FLOAT64 | Current selling price (EUR) |
| cost_price | FLOAT64 | Cost per unit (EUR) |
| stock_quantity | INT64 | Current stock level |
| is_active | BOOL | Whether product is currently listed |

**Example rows:**

| product_id | product_name | category | brand | unit_price | cost_price | stock_quantity | is_active |
|------------|--------------|----------|-------|------------|------------|----------------|-----------|
| PROD-010 | Wireless Headphones | Electronics | SoundMax | 49.99 | 22.00 | 150 | true |
| PROD-023 | Running Shoes | Footwear | FastStep | 89.00 | 35.00 | 42 | true |
| PROD-005 | Phone Case | Accessories | CoverUp | 12.50 | 3.20 | 800 | true |

**Used by:** Dashboard (product KPIs), Warnings (low stock alerts), Ask (product queries via Pandas)

---

## 3. `ad_performance`

**Purpose:** Marketing/advertising data. Powers ROAS metrics, ad spend charts, and campaign analysis.

Derived metrics (computed in Pandas over aggregated data, not stored):
- `ad_spend` = sum(spend)
- `ad_conversion_rate` = sum(conversions) / sum(clicks)
- `acos` = sum(spend) / sum(revenue)
- `roas` = sum(revenue) / sum(spend)

| Column | Type | Description |
|--------|------|-------------|
| date | DATE | Performance date |
| campaign_id | STRING | Unique campaign identifier |
| campaign_name | STRING | Display name |
| platform | STRING | Ad platform (google, meta, tiktok) |
| impressions | INT64 | Number of impressions |
| clicks | INT64 | Number of clicks |
| spend | FLOAT64 | Ad spend (EUR) |
| conversions | INT64 | Number of conversions |
| revenue | FLOAT64 | Revenue attributed to this campaign (EUR) |

**Example rows:**

| date | campaign_id | campaign_name | platform | impressions | clicks | spend | conversions | revenue |
|------|-------------|---------------|----------|-------------|--------|-------|-------------|---------|
| 2025-06-01 | CAMP-01 | Summer Sale DE | google | 12000 | 340 | 150.00 | 18 | 890.00 |
| 2025-06-01 | CAMP-02 | Brand Awareness | meta | 45000 | 620 | 200.00 | 8 | 320.00 |
| 2025-06-02 | CAMP-03 | Retargeting EU | google | 8000 | 410 | 95.00 | 22 | 1100.00 |

**Derived values (computed in backend):**

| campaign_id | roas | acos | conversion_rate |
|-------------|------|------|-----------------|
| CAMP-01 | 5.93 | 0.17 | 5.29% |
| CAMP-02 | 1.60 | 0.63 | 1.29% |
| CAMP-03 | 11.58 | 0.09 | 5.37% |

**Used by:** Dashboard (ROAS KPI, ad spend chart), Ask (marketing queries via Pandas)

---

## 4. `warnings`

**Purpose:** Pre-generated showcase alerts. These are **not** detected in real-time — they are seeded data designed to demonstrate the Warnings UI, including severity, impact, and drill-down to Deep Review.

| Column | Type | Description |
|--------|------|-------------|
| warning_id | STRING | Unique warning identifier |
| title | STRING | Short alert headline |
| category | STRING | Domain: store, payments, inventory, fulfillment, advertising, listings, customer_feedback, returns |
| severity | STRING | low, medium, high, critical |
| impact_amount | FLOAT64 | Estimated financial impact (EUR) |
| impact_label | STRING | Human-readable impact (e.g. "€2,400 potential loss") |
| detected_date | DATE | When the warning was "detected" |
| why | STRING | Explanation of why this was flagged |
| recommended_action | STRING | Suggested next step |
| status | STRING | new, acknowledged, resolved, dismissed |
| sort_order | INT64 | Display order in the Warnings list |
| action_plan_preview_json | STRING | JSON string with action plan steps for the preview card |
| deep_review_scenario_id | STRING | FK to `deep_review_scenarios` (nullable) |

**Example rows:**

| warning_id | title | category | severity | impact_amount | impact_label | detected_date | why | recommended_action | status | sort_order | deep_review_scenario_id |
|------------|-------|----------|----------|---------------|--------------|---------------|-----|--------------------|--------|------------|-------------------------|
| WARN-001 | Low stock: Running Shoes | inventory | high | 2400.00 | €2,400 potential loss | 2025-06-02 | Stock at 42 units, below 50-unit threshold. Current sell rate: 8/day. | Reorder 200 units from supplier. | new | 1 | SCENARIO-001 |
| WARN-002 | Low ROAS: Brand Awareness | advertising | medium | 850.00 | €850 wasted spend | 2025-06-02 | ROAS is 1.6x, below the 2.0x target for 5 consecutive days. | Pause campaign and reallocate budget. | new | 2 | SCENARIO-002 |
| WARN-003 | High return rate: Phone Cases | returns | low | 600.00 | €600 weekly loss | 2025-06-01 | Return rate for Phone Cases spiked to 12%, up from 4% average. | Investigate product listing accuracy and packaging. | acknowledged | 3 | NULL |

**`action_plan_preview_json` example:**
```json
[
  {"step": 1, "action": "Contact supplier for expedited order"},
  {"step": 2, "action": "Increase price by 5% to slow demand"},
  {"step": 3, "action": "Enable backorder for affected SKUs"}
]
```

**Used by:** Warnings (alert list, detail cards), Dashboard (warning count badge)

---

## 5. `business_health`

**Purpose:** Static/mocked business health indicators. Displayed as status tiles with functional tooltips. Data is pre-seeded and not computed in real-time.

| Column | Type | Description |
|--------|------|-------------|
| domain | STRING | Business domain: store, payments, inventory, fulfillment, advertising, listings, customer_feedback, returns |
| status | STRING | healthy, warning, critical |
| tooltip_title | STRING | Tooltip headline |
| tooltip_description | STRING | Tooltip detail text |
| sort_order | INT64 | Display order in the health bar |

**Example rows:**

| domain | status | tooltip_title | tooltip_description | sort_order |
|--------|--------|---------------|---------------------|------------|
| store | healthy | Store Healthy | All systems operational. 187 orders processed today. | 1 |
| payments | healthy | Payments Normal | Payment success rate at 98.5%. No issues detected. | 2 |
| inventory | critical | Stock Alert | 2 products below safety stock threshold. | 3 |
| fulfillment | healthy | Fulfillment on Track | Average fulfillment time: 1.8 days. Within SLA. | 4 |
| advertising | warning | Ad Spend Concern | 1 campaign below ROAS target. €850 at risk. | 5 |
| listings | healthy | Listings Active | 142 active listings. No suppressed products. | 6 |
| customer_feedback | healthy | Feedback Positive | Average rating: 4.6/5. No negative trends. | 7 |
| returns | warning | Returns Elevated | Phone Cases return rate spiked to 12%. | 8 |

**Used by:** Dashboard (business health status bar with tooltips)

---

## 6. `conversations`

**Purpose:** Stores Ask assistant conversation history. Supports the Past Conversations sidebar and message replay.

| Column | Type | Description |
|--------|------|-------------|
| conversation_id | STRING | Unique conversation identifier |
| title | STRING | Auto-generated or user-set conversation title |
| created_at | TIMESTAMP | When the conversation started |
| updated_at | TIMESTAMP | When the last message was added |
| last_message_preview | STRING | Truncated preview of the last message |
| messages_json | STRING | JSON array of all messages in the conversation |

**`messages_json` example:**
```json
[
  {"role": "user", "content": "What was our revenue last week?", "timestamp": "2025-06-02T10:00:00Z"},
  {"role": "assistant", "content": "Total revenue last week was €12,450 across 187 orders.", "timestamp": "2025-06-02T10:00:02Z"}
]
```

**Example rows:**

| conversation_id | title | created_at | updated_at | last_message_preview |
|-----------------|-------|------------|------------|----------------------|
| CONV-001 | Revenue last week | 2025-06-02 10:00:00 | 2025-06-02 10:00:02 | Total revenue last week was €12,450... |
| CONV-002 | Best ROAS campaign | 2025-06-02 11:30:00 | 2025-06-02 11:30:03 | The Retargeting EU campaign has the best... |

> **Note:** BigQuery is used to store conversations for simplicity in this showcase MVP. This is not intended as a production chat database — a dedicated store (e.g. Firestore, PostgreSQL) would be used in production.

**Used by:** Ask (chat UI, past conversations sidebar)

---

## 7. `deep_review_scenarios`

**Purpose:** Hardcoded/prepared Deep Review scenarios. Each scenario is linked to a warning and presents a pre-built "multi-model consensus" view. This is **not** a real multi-model engine — all data is pre-seeded for the showcase.

| Column | Type | Description |
|--------|------|-------------|
| scenario_id | STRING | Unique scenario identifier |
| warning_id | STRING | FK to `warnings` |
| consensus_status | STRING | agree, partial_agree, disagree |
| confidence | FLOAT64 | Confidence score (0.0–1.0) |
| expected_recovery | STRING | Expected outcome (e.g. "€2,400 recovered in 5 days") |
| recommended_action | STRING | Final recommended action |
| model_reasoning_json | STRING | JSON with per-model reasoning breakdown |

**`model_reasoning_json` example:**
```json
[
  {"model": "GPT-4", "verdict": "agree", "confidence": 0.92, "reasoning": "Stock depletion rate confirms stockout within 5 days at current velocity."},
  {"model": "Claude", "verdict": "agree", "confidence": 0.88, "reasoning": "Historical patterns show similar products stock out at this threshold."},
  {"model": "Gemini", "verdict": "partial_agree", "confidence": 0.75, "reasoning": "Agrees on urgency but suggests a smaller reorder of 150 units."}
]
```

**Example rows:**

| scenario_id | warning_id | consensus_status | confidence | expected_recovery | recommended_action |
|-------------|------------|------------------|------------|-------------------|--------------------|
| SCENARIO-001 | WARN-001 | agree | 0.85 | €2,400 recovered in 5 days | Reorder 200 units from supplier immediately. |
| SCENARIO-002 | WARN-002 | partial_agree | 0.72 | €500 savings in 2 weeks | Pause Brand Awareness campaign, shift budget to Retargeting. |

**Used by:** Warnings → Deep Review modal

---

## 8. `settings`

**Purpose:** UI settings persistence. Stores user preferences and display thresholds. This is **not** a real system configuration layer — it powers the Control page UI and allows the user to toggle showcase preferences.

| Column | Type | Description |
|--------|------|-------------|
| setting_key | STRING | Unique setting identifier |
| setting_value | STRING | Value (parsed by frontend as needed) |
| label | STRING | Human-readable label for the Control UI |
| category | STRING | Grouping (thresholds, display, notifications) |

**Example rows:**

| setting_key | setting_value | label | category |
|-------------|---------------|-------|----------|
| low_stock_threshold | 50 | Low Stock Threshold | thresholds |
| min_roas_target | 2.0 | Minimum ROAS Target | thresholds |
| default_currency | EUR | Default Currency | display |
| enable_email_alerts | false | Email Alerts | notifications |

**Used by:** Control (settings UI)

---

## Table → Screen Mapping

| Screen | Tables Used |
|--------|-------------|
| Dashboard | `sales_orders`, `products`, `ad_performance`, `business_health`, `warnings` (count) |
| Warnings | `warnings`, `deep_review_scenarios` |
| Ask | `conversations`, + queries across `sales_orders`, `products`, `ad_performance`, `warnings`, `business_health` |
| Control | `settings` |

---

## Functional vs Mocked Data

| Table | Status | Notes |
|-------|--------|-------|
| `sales_orders` | **Functional** | Real BigQuery queries via Pandas. Powers KPIs, charts, and Ask tools. |
| `products` | **Functional** | Real BigQuery queries. Stock levels and product analytics. |
| `ad_performance` | **Functional** | Real BigQuery queries. ROAS/ACoS computed in Pandas. |
| `warnings` | **Mocked** | Pre-seeded showcase data. Not generated by real detection logic. |
| `business_health` | **Mocked** | Static pre-seeded data. Tooltips are functional, statuses are fixed. |
| `conversations` | **Functional** | Real conversations stored and retrieved. Messages saved as JSON. |
| `deep_review_scenarios` | **Mocked** | Hardcoded scenarios. No real multi-model engine behind it. |
| `settings` | **Partially Functional** | UI persistence only. Settings are saved and loaded, but do not control real backend behavior. |

---

## Tables Needed for Ask Tools

The Ask assistant uses predefined tools that query BigQuery via Pandas. The following tables are queryable:

| Tool | Table(s) | Example Questions |
|------|----------|-------------------|
| Revenue & Sales | `sales_orders` | "What was revenue last week?", "Top selling products?" |
| Product Analytics | `products`, `sales_orders` | "Which products are low on stock?", "Best margin products?" |
| Ad Performance | `ad_performance` | "Which campaign has the best ROAS?", "Total ad spend this month?" |
| Profit & Refunds | `sales_orders` | "What's our refund rate?", "Gross profit by category?" |
| Warnings & Alerts | `warnings` | "How many critical warnings do we have?", "What are the current inventory alerts?" |
| Business Health | `business_health` | "What's the status of advertising?", "Which domains have issues?" |

Tables **not** queried by Ask: `deep_review_scenarios`, `settings`.
