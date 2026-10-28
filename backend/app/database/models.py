import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.database.database import Base

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    HEALTHCARE_STAFF = "HEALTHCARE_STAFF"
    WASTE_COLLECTOR = "WASTE_COLLECTOR"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="HEALTHCARE_STAFF", nullable=False)
    is_active = Column(Boolean, default=True)
    department = Column(String(100), default="General Ward")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scans = relationship("WasteScan", back_populates="user", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="user")
    assigned_collections = relationship("CollectionRecord", back_populates="collector")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class WasteCategory(Base):
    __tablename__ = "waste_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)  # infectious, sharps, etc.
    display_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    default_bin = Column(String(50), nullable=False)  # YELLOW, RED, WHITE, BLUE, RADIATION_ALERT
    risk_level = Column(String(50), default="Moderate")  # Low, Moderate, High, Critical
    segregation_guide = Column(Text, nullable=False)
    handling_guide = Column(Text, nullable=False)
    disposal_guide = Column(Text, nullable=False)
    emergency_action = Column(Text, nullable=True)
    ppe_requirements = Column(JSON, default=list)  # list of strings
    safety_precautions = Column(JSON, default=list)  # list of strings
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    safety_instructions = relationship("SafetyInstruction", back_populates="category", uselist=False)


class WasteScan(Base):
    __tablename__ = "waste_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    image_path = Column(String(500), nullable=False)
    predicted_class = Column(String(100), nullable=False)
    display_name = Column(String(150), nullable=False)
    confidence = Column(Float, nullable=False)
    confidence_level = Column(String(50), nullable=False)  # High, Moderate, Low
    risk_level = Column(String(50), nullable=False)  # Low, Moderate, High, Critical
    recommended_bin = Column(String(50), nullable=False)  # YELLOW, RED, WHITE, BLUE, RADIATION_ALERT
    segregation_method = Column(Text, nullable=True)
    handling_method = Column(Text, nullable=True)
    disposal_method = Column(Text, nullable=True)
    ppe_used = Column(JSON, default=list)
    safety_precautions = Column(JSON, default=list)
    emergency_action = Column(Text, nullable=True)
    gradcam_path = Column(String(500), nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="scans")


class SafetyInstruction(Base):
    __tablename__ = "safety_instructions"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("waste_categories.id"), nullable=False)
    ppe_list = Column(JSON, default=list)
    handling_steps = Column(JSON, default=list)
    emergency_action = Column(Text, nullable=False)
    precautions = Column(JSON, default=list)

    category = relationship("WasteCategory", back_populates="safety_instructions")


class BinStatus(Base):
    __tablename__ = "bin_status"

    id = Column(Integer, primary_key=True, index=True)
    bin_name = Column(String(100), nullable=False)
    bin_type = Column(String(50), nullable=False)  # YELLOW, RED, WHITE, BLUE
    location = Column(String(200), nullable=False)  # e.g., ICU Floor 2, Operation Theatre 1
    capacity_percentage = Column(Float, default=0.0)
    status = Column(String(50), default="NORMAL")  # NORMAL, NEAR_CAPACITY, COLLECTION_REQUIRED
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    collections = relationship("CollectionRecord", back_populates="bin")


class CollectionRecord(Base):
    __tablename__ = "collection_records"

    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(Integer, ForeignKey("bin_status.id"), nullable=False)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    scheduled_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="PENDING")  # PENDING, SCHEDULED, IN_PROGRESS, COMPLETED
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    bin = relationship("BinStatus", back_populates="collections")
    collector = relationship("User", back_populates="assigned_collections")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(String(100), nullable=False)  # Needle-stick injury, Spill, Leakage, etc.
    category = Column(String(100), nullable=True)
    location = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    photo_path = Column(String(500), nullable=True)
    priority = Column(String(50), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(50), default="OPEN")  # OPEN, UNDER_REVIEW, RESOLVED, CLOSED
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="incidents")


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True)
    forecast_date = Column(DateTime, nullable=False)
    horizon = Column(String(50), nullable=False)  # next_day, next_7_days, next_month
    category = Column(String(100), nullable=False)
    predicted_kg = Column(Float, nullable=False)
    confidence_interval = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # Segregation, PPE, Spill response, etc.
    content = Column(Text, nullable=False)
    language = Column(String(10), default="en")  # en, ta, hi
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="INFO")  # ALERT, WARNING, INFO, SUCCESS
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="notifications")
