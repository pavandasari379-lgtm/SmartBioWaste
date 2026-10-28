import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import BinStatus, CollectionRecord, User, Notification
from app.schemas.schemas import (
    BinStatusResponse, BinStatusUpdate, CollectionRecordCreate,
    CollectionRecordUpdate, CollectionRecordResponse, CollectionSafetyChecklist
)
from app.auth.security import get_current_user_optional

router = APIRouter(prefix="", tags=["Smart Collection & Bins"])

@router.get("/collection/safety", response_model=CollectionSafetyChecklist)
def get_collection_safety_checklist():
    """Mandatory pre-collection safety checklist for hospital waste handlers."""
    return {
        "title": "Hospital Waste Collector Pre-Dispatch Safety Protocol",
        "checklist": [
            {"id": "c1", "item": "Heavy-duty puncture-resistant utility gloves donned", "required": True},
            {"id": "c2", "item": "Fluid-impermeable protective apron / full uniform worn", "required": True},
            {"id": "c3", "item": "Closed-toe steel/composite shank safety footwear on", "required": True},
            {"id": "c4", "item": "Inspect external container condition before lifting", "required": True},
            {"id": "c5", "item": "Verify zero leakage, liquid seeping, or puncturing sharps", "required": True},
            {"id": "c6", "item": "DO NOT manually compress, stomp, or squeeze bags", "required": True},
            {"id": "c7", "item": "NEVER touch needles or loose sharps with hands", "required": True},
            {"id": "c8", "item": "Ensure color-coded waste streams are NOT cross-mixed", "required": True},
            {"id": "c9", "item": "Verify barcode tags and biohazard labels are intact", "required": True},
            {"id": "c10", "item": "Lock trolley securely before corridor transit", "required": True}
        ],
        "general_precautions": [
            "Maintain dedicated collection transit routes away from intensive care patient corridors.",
            "Decontaminate waste transit trolleys with 1% hypochlorite at end of each shift.",
            "Report any defective puncture-proof bins or torn biohazard bags immediately."
        ]
    }

@router.get("/bins", response_model=List[BinStatusResponse])
def get_all_bins(db: Session = Depends(get_db)):
    """Retrieves real-time capacity and statuses for all hospital waste bins."""
    return db.query(BinStatus).all()

@router.put("/bins/{bin_id}", response_model=BinStatusResponse)
def update_bin_status(bin_id: int, update_data: BinStatusUpdate, db: Session = Depends(get_db)):
    bin_obj = db.query(BinStatus).filter(BinStatus.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bin not found.")
    
    bin_obj.capacity_percentage = update_data.capacity_percentage
    if update_data.status:
        bin_obj.status = update_data.status
    else:
        if bin_obj.capacity_percentage >= 85.0:
            bin_obj.status = "COLLECTION_REQUIRED"
        elif bin_obj.capacity_percentage >= 70.0:
            bin_obj.status = "NEAR_CAPACITY"
        else:
            bin_obj.status = "NORMAL"

    db.commit()
    db.refresh(bin_obj)
    return bin_obj

@router.get("/collections", response_model=List[CollectionRecordResponse])
def get_collections(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = None
):
    """Lists waste collection operations and schedules."""
    query = db.query(CollectionRecord)
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(CollectionRecord.status == status_filter.upper())
    return query.order_by(CollectionRecord.created_at.desc()).all()

@router.post("/collections", response_model=CollectionRecordResponse, status_code=status.HTTP_201_CREATED)
def schedule_collection(
    col_in: CollectionRecordCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Schedules a new collection run for a high-fill bin."""
    bin_obj = db.query(BinStatus).filter(BinStatus.id == col_in.bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bin not found.")

    sched = CollectionRecord(
        bin_id=col_in.bin_id,
        collector_id=col_in.collector_id or (current_user.id if current_user else None),
        scheduled_date=col_in.scheduled_date or datetime.datetime.utcnow(),
        status="SCHEDULED",
        notes=col_in.notes or f"Scheduled collection for {bin_obj.bin_name}"
    )
    db.add(sched)
    db.commit()
    db.refresh(sched)
    return sched

@router.put("/collections/{record_id}", response_model=CollectionRecordResponse)
def update_collection_record(
    record_id: int,
    update_data: CollectionRecordUpdate,
    db: Session = Depends(get_db)
):
    """Updates collection execution status and notes."""
    record = db.query(CollectionRecord).filter(CollectionRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection record not found.")

    record.status = update_data.status.upper()
    if update_data.notes:
        record.notes = update_data.notes
    if update_data.collector_id:
        record.collector_id = update_data.collector_id

    if record.status == "COMPLETED":
        record.completed_at = datetime.datetime.utcnow()
        # Reset the bin capacity back to 0%
        if record.bin:
            record.bin.capacity_percentage = 0.0
            record.bin.status = "NORMAL"

    db.commit()
    db.refresh(record)
    return record
