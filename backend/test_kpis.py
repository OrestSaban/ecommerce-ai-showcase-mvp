import sys
import os
sys.path.append('/Users/orestsaban/Desktop/ecommerce_showcase_mvp/ecommerce-ai-showcase-mvp/backend')

from services.analytics_service import get_dashboard_kpis

print("LAST 7 DAYS:")
kpis = get_dashboard_kpis("last_7_days")
for k, v in kpis.items():
    if k.endswith("_change"):
        print(f"{k}: {v}")

print("\nLAST 30 DAYS:")
kpis = get_dashboard_kpis("last_30_days")
for k, v in kpis.items():
    if k.endswith("_change"):
        print(f"{k}: {v}")
