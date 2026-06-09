"""
Local CSV data service.
Loads seed CSV files into pandas DataFrames.
Used as a drop-in replacement for BigQuery while it is blocked.
"""
import os
import pandas as pd

SEED_DIR = os.path.join(os.path.dirname(__file__), "..", "seed_data")


def _load(filename: str) -> pd.DataFrame:
    path = os.path.join(SEED_DIR, filename)
    return pd.read_csv(path)


def get_sales_orders() -> pd.DataFrame:
    df = _load("sales_orders.csv")
    df["order_date"] = pd.to_datetime(df["order_date"])
    return df


def get_products() -> pd.DataFrame:
    return _load("products.csv")


def get_ad_performance() -> pd.DataFrame:
    df = _load("ad_performance.csv")
    df["date"] = pd.to_datetime(df["date"])
    return df


def get_warnings() -> pd.DataFrame:
    df = _load("warnings.csv")
    df["detected_date"] = pd.to_datetime(df["detected_date"])
    return df


def get_business_health() -> pd.DataFrame:
    return _load("business_health.csv")


def get_deep_review_scenarios() -> pd.DataFrame:
    return _load("deep_review_scenarios.csv")


def get_settings() -> pd.DataFrame:
    return _load("settings.csv")


def get_conversations() -> pd.DataFrame:
    df = _load("conversations.csv")
    df["created_at"] = pd.to_datetime(df["created_at"])
    df["updated_at"] = pd.to_datetime(df["updated_at"])
    return df
