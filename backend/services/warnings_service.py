import json
import pandas as pd
from services.local_data_service import get_warnings, get_deep_review_scenarios

def get_all_warnings() -> list[dict]:
    """
    Returns a list of all warnings from the seed data.
    """
    df = get_warnings()
    
    # Sort warnings by sort_order
    if "sort_order" in df.columns:
        df = df.sort_values("sort_order")
        
    warnings = []
    for _, row in df.iterrows():
        # Parse action_plan_preview_json safely
        action_plan = []
        if pd.notna(row.get("action_plan_preview_json")):
            try:
                action_plan = json.loads(row["action_plan_preview_json"])
            except json.JSONDecodeError:
                action_plan = []
                
        warning = {
            "warning_id": str(row["warning_id"]),
            "title": str(row["title"]),
            "category": str(row["category"]),
            "severity": str(row["severity"]),
            "impact_amount": float(row["impact_amount"]) if pd.notna(row.get("impact_amount")) else 0.0,
            "impact_label": str(row["impact_label"]) if pd.notna(row.get("impact_label")) else "",
            "detected_date": row["detected_date"].isoformat() if pd.notna(row.get("detected_date")) else "",
            "why": str(row["why"]) if pd.notna(row.get("why")) else "",
            "recommended_action": str(row["recommended_action"]) if pd.notna(row.get("recommended_action")) else "",
            "status": str(row["status"]),
            "sort_order": int(row["sort_order"]) if pd.notna(row.get("sort_order")) else 0,
            "action_plan_preview": action_plan,
            "deep_review_scenario_id": str(row["deep_review_scenario_id"]) if pd.notna(row.get("deep_review_scenario_id")) else None,
        }
        warnings.append(warning)
        
    return warnings

def get_warning_by_id(warning_id: str) -> dict | None:
    """
    Returns a single warning by ID.
    """
    warnings = get_all_warnings()
    for w in warnings:
        if w["warning_id"] == warning_id:
            return w
    return None

def get_deep_review_scenario(warning_id: str) -> dict | None:
    """
    Returns the deep review scenario for a given warning ID.
    """
    df = get_deep_review_scenarios()
    
    # Filter by warning_id
    scenario_df = df[df["warning_id"] == warning_id]
    if scenario_df.empty:
        return None
        
    row = scenario_df.iloc[0]
    
    # Parse model_reasoning_json
    model_reasoning = []
    if pd.notna(row.get("model_reasoning_json")):
        try:
            model_reasoning = json.loads(row["model_reasoning_json"])
        except json.JSONDecodeError:
            model_reasoning = []
            
    return {
        "scenario_id": str(row["scenario_id"]),
        "warning_id": str(row["warning_id"]),
        "consensus_status": str(row["consensus_status"]),
        "confidence": float(row["confidence"]) if pd.notna(row.get("confidence")) else 0.0,
        "expected_recovery": str(row["expected_recovery"]) if pd.notna(row.get("expected_recovery")) else "",
        "recommended_action": str(row["recommended_action"]) if pd.notna(row.get("recommended_action")) else "",
        "model_reasoning": model_reasoning
    }
