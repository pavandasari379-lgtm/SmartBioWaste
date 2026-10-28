from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Incident, User, Notification
from app.schemas.schemas import IncidentCreate, IncidentUpdate, IncidentResponse
from app.auth.security import get_current_user_optional

router = APIRouter(prefix="/incidents", tags=["Incident Reporting"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None
):
    """Retrieves all logged biomedical waste incidents and hazards."""
    query = db.query(Incident)
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Incident.status == status_filter.upper())
    if priority_filter and priority_filter.upper() != "ALL":
        query = query.filter(Incident.priority == priority_filter.upper())
    return query.order_by(Incident.created_at.desc()).all()

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def report_incident(
    inc_in: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Logs a new safety incident, exposure, or spill."""
    incident = Incident(
        user_id=current_user.id if current_user else None,
        type=inc_in.type,
        category=inc_in.category,
        location=inc_in.location,
        description=inc_in.description,
        priority=inc_in.priority.upper(),
        status="OPEN"
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Broadcast notification to admin
    notif = Notification(
        title=f"Incident Reported: {incident.type} ({incident.priority})",
        message=f"New incident logged in {incident.location}: {incident.description[:100]}...",
        type="ALERT" if incident.priority in ["HIGH", "CRITICAL"] else "WARNING",
        link="/incidents"
    )
    db.add(notif)
    db.commit()

    return incident

@router.put("/{incident_id}", response_model=IncidentResponse)
def update_incident_status(
    incident_id: int,
    update_data: IncidentUpdate,
    db: Session = Depends(get_db)
):
    """Updates incident investigation status and corrective actions."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

    if update_data.status:
        incident.status = update_data.status.upper()
    if update_data.priority:
        incident.priority = update_data.priority.upper()
    if update_data.resolution_notes:
        incident.resolution_notes = update_data.resolution_notes

    db.commit()
    db.refresh(incident)
    return incident
