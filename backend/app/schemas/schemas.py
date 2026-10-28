from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "HEALTHCARE_STAFF"
    department: Optional[str] = "General Ward"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- IMAGE QUALITY & PREDICTION SCHEMAS ---
class ImageQualityResponse(BaseModel):
    valid: bool
    quality_score: float
    message: str
    blur_score: float
    brightness_score: float
    resolution: List[int]

class PredictionResponse(BaseModel):
    predicted_class: str
    display_name: str
    confidence: float
    confidence_level: str  # High, Moderate, Low
    risk_level: str        # Low, Moderate, High, Critical
    recommended_bin: str   # YELLOW, RED, WHITE, BLUE, RADIATION_ALERT
    segregation_method: str
    handling_method: str
    disposal_method: str
    ppe: List[str]
    safety_precautions: List[str]
    emergency_action: Optional[str] = None
    gradcam_image: Optional[str] = None
    original_image: str
    scan_id: Optional[int] = None
    is_demo: bool = False
    warning: Optional[str] = None

class WastePredictionRequest(BaseModel):
    horizon: str = "next_7_days"  # next_day, next_7_days, next_month
    department: Optional[str] = None

class WasteForecastItem(BaseModel):
    date: str
    category: str
    estimated_kg: float
    confidence_interval: str

class WastePredictionResponse(BaseModel):
    horizon: str
    total_estimated_kg: float
    disclaimer: str = "Estimated Waste Generation based on historical trend modeling. Not a guaranteed value."
    forecasts: List[WasteForecastItem]

# --- WASTE CATEGORY & SAFETY SCHEMAS ---
class SafetyInstructionResponse(BaseModel):
    category_id: int
    category_name: str
    ppe_list: List[str]
    handling_steps: List[str]
    emergency_action: str
    precautions: List[str]

class WasteCategoryResponse(BaseModel):
    id: int
    name: str
    display_name: str
    description: str
    default_bin: str
    risk_level: str
    segregation_guide: str
    handling_guide: str
    disposal_guide: str
    emergency_action: Optional[str]
    ppe_requirements: List[str]
    safety_precautions: List[str]

    class Config:
        from_attributes = True

# --- SCAN HISTORY SCHEMAS ---
class WasteScanResponse(BaseModel):
    id: int
    user_id: Optional[int]
    image_path: str
    predicted_class: str
    display_name: str
    confidence: float
    confidence_level: str
    risk_level: str
    recommended_bin: str
    segregation_method: Optional[str]
    handling_method: Optional[str]
    disposal_method: Optional[str]
    ppe_used: List[str] = []
    safety_precautions: List[str] = []
    emergency_action: Optional[str]
    gradcam_path: Optional[str]
    is_demo: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- SMART COLLECTION & BIN SCHEMAS ---
class BinStatusResponse(BaseModel):
    id: int
    bin_name: str
    bin_type: str
    location: str
    capacity_percentage: float
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True

class BinStatusUpdate(BaseModel):
    capacity_percentage: float
    status: Optional[str] = None

class CollectionRecordCreate(BaseModel):
    bin_id: int
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None
    collector_id: Optional[int] = None

class CollectionRecordUpdate(BaseModel):
    status: str  # PENDING, SCHEDULED, IN_PROGRESS, COMPLETED
    notes: Optional[str] = None
    collector_id: Optional[int] = None

class CollectionRecordResponse(BaseModel):
    id: int
    bin_id: int
    bin: Optional[BinStatusResponse] = None
    collector_id: Optional[int] = None
    collector: Optional[UserResponse] = None
    scheduled_date: datetime
    status: str
    notes: Optional[str]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class CollectionSafetyChecklist(BaseModel):
    title: str
    checklist: List[Dict[str, Any]]
    general_precautions: List[str]

# --- INCIDENT SCHEMAS ---
class IncidentCreate(BaseModel):
    type: str
    category: Optional[str] = None
    location: str
    description: str
    priority: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    resolution_notes: Optional[str] = None

class IncidentResponse(BaseModel):
    id: int
    user_id: Optional[int]
    user: Optional[UserResponse] = None
    type: str
    category: Optional[str]
    location: str
    description: str
    photo_path: Optional[str]
    priority: str
    status: str
    resolution_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- KNOWLEDGE BASE SCHEMAS ---
class KnowledgeBaseCreate(BaseModel):
    title: str
    category: str
    content: str
    language: str = "en"
    tags: List[str] = []

class KnowledgeBaseResponse(BaseModel):
    id: int
    title: str
    category: str
    content: str
    language: str
    tags: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- VOICE ASSISTANT SCHEMAS ---
class VoiceQueryRequest(BaseModel):
    query: str
    language: str = "en"

class VoiceQueryResponse(BaseModel):
    query: str
    response_text: str
    detected_category: Optional[str] = None
    recommended_bin: Optional[str] = None
    safety_summary: Optional[str] = None
    source: str = "Rule Engine & Verified Knowledge Base"

# --- NOTIFICATION SCHEMAS ---
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- ANALYTICS SCHEMAS ---
class OverviewStats(BaseModel):
    total_scans: int
    infectious_count: int
    sharps_count: int
    chemical_count: int
    high_risk_alerts: int
    pending_collections: int
    average_confidence: float
    demo_scans_count: int

class CategoryCount(BaseModel):
    category: str
    display_name: str
    count: int
    percentage: float

class BinCount(BaseModel):
    bin: str
    count: int
    percentage: float

class TrendItem(BaseModel):
    date: str
    scans: int
    high_risk: int
