from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, WasteCategory, Notification
from app.schemas.schemas import UserResponse, NotificationResponse
from app.auth.security import require_role
from app.rules.waste_rules import WASTE_RULES

router = APIRouter(prefix="", tags=["Admin & System Management"])

class UserRoleUpdate(BaseModel):
    role: str
    is_active: Optional[bool] = None

class WasteRuleUpdate(BaseModel):
    recommended_bin: Optional[str] = None
    risk_level: Optional[str] = None
    segregation_method: Optional[str] = None
    handling_method: Optional[str] = None
    disposal_method: Optional[str] = None

@router.get("/admin/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(require_role(["ADMIN"]))):
    """Admin-only: Retrieve all registered hospital users and staff."""
    return db.query(User).all()

@router.put("/admin/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """Admin-only: Update user permissions or deactivate account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    if data.role.upper() in ["ADMIN", "HEALTHCARE_STAFF", "WASTE_COLLECTOR"]:
        user.role = data.role.upper()
    if data.is_active is not None:
        user.is_active = data.is_active

    db.commit()
    db.refresh(user)
    return user

@router.get("/admin/rules")
def get_admin_rules(current_user: User = Depends(require_role(["ADMIN"]))):
    """Admin-only: Retrieve configurable segregation rules."""
    return WASTE_RULES

@router.put("/admin/rules/{category}")
def update_admin_rule(
    category: str,
    update: WasteRuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """Admin-only: Override waste segregation bin rules or guidelines."""
    cat_clean = category.lower().strip()
    if cat_clean not in WASTE_RULES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not recognized.")

    rule = WASTE_RULES[cat_clean]
    if update.recommended_bin:
        rule["recommended_bin"] = update.recommended_bin.upper()
    if update.risk_level:
        rule["risk_level"] = update.risk_level
    if update.segregation_method:
        rule["segregation_method"] = update.segregation_method
    if update.handling_method:
        rule["handling_method"] = update.handling_method
    if update.disposal_method:
        rule["disposal_method"] = update.disposal_method

    # Sync to DB if category exists
    db_cat = db.query(WasteCategory).filter(WasteCategory.name == cat_clean).first()
    if db_cat:
        if update.recommended_bin:
            db_cat.default_bin = update.recommended_bin.upper()
        if update.risk_level:
            db_cat.risk_level = update.risk_level
        if update.segregation_method:
            db_cat.segregation_guide = update.segregation_method
        if update.handling_method:
            db_cat.handling_guide = update.handling_method
        if update.disposal_method:
            db_cat.disposal_guide = update.disposal_method
        db.commit()

    return {"message": f"Rules updated for {category}", "rule": rule}

# --- NOTIFICATIONS ---
@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    """Retrieves unread and recent system notifications."""
    return db.query(Notification).order_by(Notification.created_at.desc()).limit(20).all()

@router.put("/notifications/{notif_id}/read")
def mark_notification_as_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "ok"}
