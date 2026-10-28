import os
import logging
import torch
from app.config import settings
from app.ml.model import EfficientNetB0WasteClassifier, CLASS_NAMES

logger = logging.getLogger("smartbiowaste.ml")

_model = None
_is_demo_mode = True

def load_ml_model():
    """
    Loads EfficientNet-B0 waste classifier weights if present.
    If not available or DEMO_MODE is set, logs diagnostic message and enables Demo Mode.
    """
    global _model, _is_demo_mode
    model_path = settings.MODEL_PATH
    
    if os.path.exists(model_path) and not settings.DEMO_MODE:
        try:
            logger.info(f"Loading EfficientNet-B0 weights from {model_path}...")
            model = EfficientNetB0WasteClassifier(num_classes=len(CLASS_NAMES), pretrained=False)
            state_dict = torch.load(model_path, map_location=torch.device('cpu'))
            model.load_state_dict(state_dict)
            model.eval()
            _model = model
            _is_demo_mode = False
            logger.info("Successfully loaded production EfficientNet-B0 model!")
            return _model, False
        except Exception as e:
            logger.warning(f"Failed to load weights from {model_path}: {e}. Activating Demo Mode.")
            _is_demo_mode = True
            _model = None
            return None, True
    else:
        if settings.DEMO_MODE:
            logger.info("DEMO_MODE is set to True. Operating in Demo Mode.")
        else:
            logger.info(f"Model file not found at {model_path}. Operating in Demo Mode.")
        _is_demo_mode = True
        _model = None
        return None, True

def get_loaded_model():
    global _model, _is_demo_mode
    if _model is None and not _is_demo_mode:
        load_ml_model()
    return _model

def is_running_in_demo_mode() -> bool:
    global _is_demo_mode
    return _is_demo_mode
