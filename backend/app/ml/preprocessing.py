import io
import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Dict, Any, List
import torchvision.transforms as transforms
import torch

# Standard PyTorch normalization for ImageNet-trained models
transform_pipeline = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def check_image_quality(image_bytes: bytes) -> Dict[str, Any]:
    """
    Evaluates image blur, lighting, and resolution before ML inference.
    """
    try:
        # Load with OpenCV for image metrics
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {
                "valid": False,
                "quality_score": 0.0,
                "message": "Corrupted or invalid image file. Could not decode image.",
                "blur_score": 0.0,
                "brightness_score": 0.0,
                "resolution": [0, 0]
            }

        height, width = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 1. Blur Detection via Laplacian Variance
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        
        # 2. Brightness Check
        mean_brightness = float(np.mean(gray))
        
        # 3. Resolution Check
        min_dim = min(height, width)
        
        # Scoring logic
        # Blur score normalized: > 120 is very crisp (1.0), < 30 is very blurry (0.0)
        blur_factor = min(1.0, max(0.0, (laplacian_var - 30.0) / 120.0))
        
        # Brightness factor: ideal is around 120-150. Penalize < 40 or > 230
        if mean_brightness < 40:
            brightness_factor = max(0.1, mean_brightness / 40.0)
        elif mean_brightness > 230:
            brightness_factor = max(0.1, (255.0 - mean_brightness) / 25.0)
        else:
            brightness_factor = 1.0
            
        # Resolution factor: >= 224 is 1.0, < 100 is 0.2
        resolution_factor = min(1.0, max(0.2, min_dim / 224.0))
        
        # Combined quality score
        quality_score = round(0.5 * blur_factor + 0.3 * brightness_factor + 0.2 * resolution_factor, 2)
        
        # Validation thresholds
        valid = True
        reasons: List[str] = []
        
        if laplacian_var < 45.0:
            valid = False
            reasons.append("Image is too blurry. Please hold camera steady and retake.")
            
        if mean_brightness < 35.0:
            valid = False
            reasons.append("Image is too dark. Increase lighting or use camera flash.")
        elif mean_brightness > 240.0:
            valid = False
            reasons.append("Image is overexposed / washed out with glare.")
            
        if height < 120 or width < 120:
            valid = False
            reasons.append("Image resolution is too low. Upload an image of at least 224x224 pixels.")

        if valid:
            message = "Image quality is acceptable for AI analysis."
        else:
            message = " ".join(reasons)

        return {
            "valid": valid,
            "quality_score": quality_score,
            "message": message,
            "blur_score": round(laplacian_var, 2),
            "brightness_score": round(mean_brightness, 2),
            "resolution": [width, height]
        }
    except Exception as e:
        return {
            "valid": False,
            "quality_score": 0.0,
            "message": f"Quality inspection failed: {str(e)}",
            "blur_score": 0.0,
            "brightness_score": 0.0,
            "resolution": [0, 0]
        }

def preprocess_image_tensor(pil_image: Image.Image) -> torch.Tensor:
    """Preprocesses a PIL image for model inference."""
    if pil_image.mode != "RGB":
        pil_image = pil_image.convert("RGB")
    tensor = transform_pipeline(pil_image)
    return tensor.unsqueeze(0)  # Add batch dimension: [1, 3, 224, 224]
