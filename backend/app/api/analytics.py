from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.analytics_service import (
    get_analytics_overview,
    get_category_distribution,
    get_bin_distribution,
    get_trend_history
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    """Summary metrics: total scans, high-risk alerts, pending collections, confidence."""
    return get_analytics_overview(db)

@router.get("/category")
def category_breakdown(db: Session = Depends(get_db)):
    """Category distribution percentages and counts."""
    return get_category_distribution(db)

@router.get("/bin")
def bin_breakdown(db: Session = Depends(get_db)):
    """Bin type distribution."""
    return get_bin_distribution(db)

@router.get("/trends")
def trends(days: int = 7, db: Session = Depends(get_db)):
    """Daily/weekly waste scanning trends."""
    return get_trend_history(db, days=days)
