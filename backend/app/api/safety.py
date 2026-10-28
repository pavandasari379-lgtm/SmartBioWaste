from fastapi import APIRouter, HTTPException, status
from app.rules.waste_rules import get_waste_rule, WASTE_RULES

router = APIRouter(prefix="/safety", tags=["Safety System"])

@router.get("/{category}")
def get_safety_instructions(category: str):
    """
    Returns PPE requirements, precautions, handling protocol,
    and emergency procedure for a given waste category.
    """
    cat_clean = category.lower().strip()
    rule = get_waste_rule(cat_clean)
    
    return {
        "category": cat_clean,
        "display_name": rule.get("display_name"),
        "risk_level": rule.get("risk_level"),
        "recommended_bin": rule.get("recommended_bin"),
        "ppe": rule.get("ppe", []),
        "safety_precautions": rule.get("safety_precautions", []),
        "handling_method": rule.get("handling_method"),
        "disposal_method": rule.get("disposal_method"),
        "emergency_action": rule.get("emergency_action"),
        "guidelines": "Compliant with World Health Organization (WHO) and National Bio-Medical Waste Standards."
    }
