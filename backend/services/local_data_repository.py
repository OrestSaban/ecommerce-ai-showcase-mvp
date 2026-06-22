"""
Local CSV data repository.

Concrete implementation of DataRepository that delegates to the existing
local_data_service.py CSV loaders. No duplicate loading — just wraps
the functions that already exist.

Swap this out for BigQueryDataRepository later without touching Ask logic.
"""
import pandas as pd
from services.data_repository import DataRepository
from services.local_data_service import (
    get_sales_orders,
    get_ad_performance,
    get_products,
    get_warnings,
    get_business_health,
)


class LocalDataRepository(DataRepository):
    """
    Data repository backed by local CSV seed data.
    Delegates all loading to services/local_data_service.py.
    """

    def get_sales_data(self) -> pd.DataFrame:
        return get_sales_orders()

    def get_ad_data(self) -> pd.DataFrame:
        return get_ad_performance()

    def get_product_data(self) -> pd.DataFrame:
        return get_products()

    def get_warning_data(self) -> pd.DataFrame:
        return get_warnings()

    def get_business_health(self) -> pd.DataFrame:
        return get_business_health()

    def get_inventory_data(self) -> pd.DataFrame:
        # For now, inventory insights are derived from the products table.
        # BigQuery implementation may have a dedicated inventory table.
        return get_products()
