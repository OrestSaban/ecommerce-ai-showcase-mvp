"""
Abstract data repository contract.

Defines the interface that any data source (CSV, BigQuery, etc.) must implement.
Ask services depend on this abstraction, never on a specific data source directly.
"""
from abc import ABC, abstractmethod
import pandas as pd


class DataRepository(ABC):
    """
    Abstract base class for data access.
    
    Current implementation: LocalDataRepository (CSV/Pandas)
    Future implementation: BigQueryDataRepository
    """

    @abstractmethod
    def get_sales_data(self) -> pd.DataFrame:
        """Return sales orders data with at minimum: order_date, total_amount, gross_profit, category, order_id."""
        ...

    @abstractmethod
    def get_ad_data(self) -> pd.DataFrame:
        """Return ad performance data with at minimum: date, spend, clicks, conversions, revenue, campaign_name."""
        ...

    @abstractmethod
    def get_product_data(self) -> pd.DataFrame:
        """Return product catalog data with at minimum: product_id, product_name, category, price."""
        ...

    @abstractmethod
    def get_warning_data(self) -> pd.DataFrame:
        """Return warnings data with at minimum: warning_id, title, category, severity, impact_amount, status."""
        ...

    @abstractmethod
    def get_business_health(self) -> pd.DataFrame:
        """Return business health domain data with at minimum: domain, status, score."""
        ...

    @abstractmethod
    def get_inventory_data(self) -> pd.DataFrame:
        """Return inventory/product data suitable for stock analysis."""
        ...
