import os
import random
import torch
import torch.nn.functional as F
from PIL import Image
from typing import Dict, Any, Tuple
from app.config import settings
from app.ml.model import CLASS_NAMES
from app.ml.model_loader import get_loaded_model, is_running_in_demo_mode
from app.ml.preprocessing import preprocess_image_tensor
from app.ml.gradcam import GradCAM, generate_gradcam_overlay
from app.rules.waste_rules import get_waste_rule, get_confidence_level

# Demo simulation helper for realistic testing when weights are not yet uploaded
DEMO_ITEMS = [
    {"class": "sharps", "confidence": 0.968, "keywords": ["syringe", "needle", "scalpel", "lancet", "sharp"]},
    {"class": "infectious", "confidence": 0.932, "keywords": ["cotton", "gauze", "blood", "soiled", "bandage"]},
    {"class": "contaminated_recyclable", "confidence": 0.895, "keywords": ["bottle", "iv", "tube", "catheter", "plastic", "glove"]},
    {"class": "glassware", "confidence": 0.914, "keywords": ["ampoule", "vial", "slide", "beaker", "glass"]},
    {"class": "chemical", "confidence": 0.871, "keywords": ["disinfectant", "formalin", "reagent", "chemical", "solvent"]},
    {"class": "pharmaceutical", "confidence": 0.884, "keywords": ["pill", "medicine", "tablet", "capsule", "drug", "expiry"]},
    {"class": "anatomical", "confidence": 0.945, "keywords": ["tissue", "organ", "specimen", "pathology"]},
    {"class": "general", "confidence": 0.952, "keywords": ["wrapper", "paper", "packaging", "peel", "box", "general"]},
    {"class": "radiological_hazard", "confidence": 0.865, "keywords": ["radiation", "radioactive", "trefoil", "isotope"]}
]

def run_inference(image_path: str, original_filename: str = "") -> Dict[str, Any]:
    """
    Runs classification pipeline on input image.
    Uses real EfficientNet model if weights are available; otherwise runs demo mode inference.
    Integrates Rule Engine and Grad-CAM explainability.
    """
    pil_image = Image.open(image_path)
    model = get_loaded_model()
    is_demo = is_running_in_demo_mode() or (model is None)
    
    gradcam_overlay_url = None

    if not is_demo and model is not None:
        # Real PyTorch EfficientNet inference
        input_tensor = preprocess_image_tensor(pil_image)
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = F.softmax(outputs, dim=1)[0]
            confidence_val, pred_idx = torch.max(probabilities, dim=0)
            predicted_class = CLASS_NAMES[pred_idx.item()]
            confidence = round(float(confidence_val.item()), 3)

        # Real Grad-CAM
        try:
            target_layer = model.get_last_conv_layer()
            cam = GradCAM(model, target_layer)
            input_tensor.requires_grad = True
            heatmap = cam.generate(input_tensor, target_class=pred_idx.item())
            gradcam_overlay_url = generate_gradcam_overlay(image_path, heatmap)
        except Exception as cam_err:
            print(f"Grad-CAM generation error: {cam_err}")
            gradcam_overlay_url = generate_gradcam_overlay(image_path, None)
    else:
        # Demo Mode: intelligently inspect filename or provide realistic detection
        is_demo = True
        matched_item = None
        fname_lower = (original_filename or image_path).lower()
        
        for item in DEMO_ITEMS:
            for kw in item["keywords"]:
                if kw in fname_lower:
                    matched_item = item
                    break
            if matched_item:
                break
                
        if not matched_item:
            # Deterministic selection based on image size to be consistent for same file
            idx = (pil_image.width + pil_image.height) % len(DEMO_ITEMS)
            matched_item = DEMO_ITEMS[idx]

        predicted_class = matched_item["class"]
        confidence = matched_item["confidence"]
        
        # Synthetic saliency Grad-CAM heatmap
        gradcam_overlay_url = generate_gradcam_overlay(image_path, None)

    # 1. Evaluate Confidence Level
    confidence_level = get_confidence_level(confidence)
    
    # 2. Query Rule Engine
    rule = get_waste_rule(predicted_class)
    
    # Warning for low confidence or radiological hazards
    warning = None
    if confidence_level == "Low":
        warning = "AI prediction is uncertain (< 60% confidence). Please retake the image or verify with trained personnel."
    elif predicted_class == "radiological_hazard":
        warning = "CRITICAL ALERT: Suspected radioactive hazard. Do not touch or move. Follow Radiation Safety Procedure immediately."

    original_web_path = "/uploads/" + os.path.basename(image_path)

    return {
        "predicted_class": predicted_class,
        "display_name": rule.get("display_name", predicted_class.title()),
        "confidence": confidence,
        "confidence_level": confidence_level,
        "risk_level": rule.get("risk_level", "Moderate"),
        "recommended_bin": rule.get("recommended_bin", "YELLOW"),
        "segregation_method": rule.get("segregation_method", ""),
        "handling_method": rule.get("handling_method", ""),
        "disposal_method": rule.get("disposal_method", ""),
        "ppe": rule.get("ppe", []),
        "safety_precautions": rule.get("safety_precautions", []),
        "emergency_action": rule.get("emergency_action", ""),
        "gradcam_image": gradcam_overlay_url,
        "original_image": original_web_path,
        "is_demo": is_demo,
        "warning": warning
    }
