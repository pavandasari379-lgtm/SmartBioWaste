import os
import uuid
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.config import settings
from app.database.database import get_db
from app.database.models import User, WasteScan, Notification
from app.schemas.schemas import ImageQualityResponse, PredictionResponse, WastePredictionRequest, WastePredictionResponse
from app.auth.security import get_current_user_optional
from app.ml.preprocessing import check_image_quality
from app.ml.prediction import run_inference
from app.services.analytics_service import predict_waste_generation

router = APIRouter(prefix="", tags=["AI Waste Detection & Prediction"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def validate_image_file(file: UploadFile):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: JPG, JPEG, PNG, WEBP."
        )

@router.post("/image-quality", response_model=ImageQualityResponse)
async def evaluate_image_quality(file: UploadFile = File(...)):
    validate_image_file(file)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit (10MB)."
        )
    result = check_image_quality(contents)
    return result

@router.post("/predict", response_model=PredictionResponse)
async def predict_waste(
    file: UploadFile = File(...),
    skip_quality_check: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    validate_image_file(file)
    contents = await file.read()

    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 15MB."
        )

    # 1. Quality Check
    quality = check_image_quality(contents)
    if not quality["valid"] and not skip_quality_check:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "POOR_IMAGE_QUALITY",
                "message": quality["message"],
                "quality_score": quality["quality_score"],
                "blur_score": quality["blur_score"],
                "brightness_score": quality["brightness_score"]
            }
        )

    # 2. Save Uploaded Image Safely
    ext = os.path.splitext(file.filename)[1].lower()
    unique_name = f"scan_{uuid.uuid4().hex[:12]}{ext}"
    save_path = os.path.join(settings.UPLOAD_DIR, unique_name)
    with open(save_path, "wb") as f:
        f.write(contents)

    # 3. Run Inference & Grad-CAM
    inference_result = run_inference(save_path, original_filename=file.filename)

    # 4. Persist Scan to PostgreSQL Database
    scan = WasteScan(
        user_id=current_user.id if current_user else None,
        image_path=inference_result["original_image"],
        predicted_class=inference_result["predicted_class"],
        display_name=inference_result["display_name"],
        confidence=inference_result["confidence"],
        confidence_level=inference_result["confidence_level"],
        risk_level=inference_result["risk_level"],
        recommended_bin=inference_result["recommended_bin"],
        segregation_method=inference_result["segregation_method"],
        handling_method=inference_result["handling_method"],
        disposal_method=inference_result["disposal_method"],
        ppe_used=inference_result["ppe"],
        safety_precautions=inference_result["safety_precautions"],
        emergency_action=inference_result["emergency_action"],
        gradcam_path=inference_result["gradcam_image"],
        is_demo=inference_result["is_demo"]
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    # 5. Create System Notification for High-Risk Detections
    if inference_result["risk_level"] in ("High", "Critical"):
        notif = Notification(
            user_id=current_user.id if current_user else None,
            title=f"High-Risk Waste Detected: {inference_result['display_name']}",
            message=f"A scan classified as {inference_result['risk_level']} risk ({inference_result['display_name']}) was logged. Target bin: {inference_result['recommended_bin']}.",
            type="ALERT",
            link="/history"
        )
        db.add(notif)
        db.commit()

    inference_result["scan_id"] = scan.id
    return inference_result

@router.post("/waste-prediction", response_model=WastePredictionResponse)
def get_waste_prediction(req: WastePredictionRequest, db: Session = Depends(get_db)):
    """Predicts future hospital waste generation based on regression modeling of historical trends."""
    return predict_waste_generation(db, horizon=req.horizon)
