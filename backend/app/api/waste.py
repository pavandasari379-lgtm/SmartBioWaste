import csv
import io
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.database import get_db
from app.database.models import WasteCategory, WasteScan, User
from app.schemas.schemas import WasteCategoryResponse, WasteScanResponse
from app.auth.security import get_current_user

router = APIRouter(prefix="", tags=["Waste Management & History"])

@router.get("/waste/categories", response_model=List[WasteCategoryResponse])
def list_waste_categories(db: Session = Depends(get_db)):
    """Returns all regulatory waste categories and disposal criteria."""
    return db.query(WasteCategory).all()

@router.get("/scans", response_model=List[WasteScanResponse])
def get_waste_scans(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    bin_type: Optional[str] = None,
    risk: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Retrieves paginated and filtered historical waste scan logs."""
    query = db.query(WasteScan)

    if category and category.lower() != "all":
        query = query.filter(WasteScan.predicted_class == category.lower())

    if bin_type and bin_type.upper() != "ALL":
        query = query.filter(WasteScan.recommended_bin == bin_type.upper())

    if risk and risk.lower() != "all":
        query = query.filter(WasteScan.risk_level.ilike(f"%{risk}%"))

    if search:
        query = query.filter(
            (WasteScan.display_name.ilike(f"%{search}%")) |
            (WasteScan.predicted_class.ilike(f"%{search}%"))
        )

    if start_date:
        try:
            s_date = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(WasteScan.created_at >= s_date)
        except ValueError:
            pass

    if end_date:
        try:
            e_date = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(WasteScan.created_at <= e_date)
        except ValueError:
            pass

    scans = query.order_by(desc(WasteScan.created_at)).offset(skip).limit(limit).all()
    return scans

@router.delete("/scans/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_waste_scan(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Deletes a waste scan record (requires authentication)."""
    scan = db.query(WasteScan).filter(WasteScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan record not found.")
    db.delete(scan)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/scans/export/csv")
def export_scans_csv(db: Session = Depends(get_db)):
    """Exports all scan records as CSV file for institutional reporting."""
    scans = db.query(WasteScan).order_by(desc(WasteScan.created_at)).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Scan ID", "Timestamp", "Item Name", "Predicted Class",
        "Confidence", "Confidence Level", "Risk Level", "Destination Bin",
        "Segregation Guidance", "Handling Guidance", "Disposal Guidance", "Is Demo"
    ])

    for s in scans:
        writer.writerow([
            s.id,
            s.created_at.strftime("%Y-%m-%d %H:%M:%S") if s.created_at else "",
            s.display_name,
            s.predicted_class,
            f"{s.confidence:.3f}",
            s.confidence_level,
            s.risk_level,
            s.recommended_bin,
            s.segregation_method or "",
            s.handling_method or "",
            s.disposal_method or "",
            "Yes" if s.is_demo else "No"
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=smartbiowaste_scans_export.csv"}
    )
