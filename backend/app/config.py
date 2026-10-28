import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "SmartBioWaste AI"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartbiowaste-ai-production-super-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Database URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/smartbiowaste"
    )
    
    # ML & Inference
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "t")
    MODEL_PATH: str = os.getenv(
        "MODEL_PATH",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ml/models/efficientnet_b0_waste.pth"))
    )
    
    # Upload Directories
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    GRADCAM_DIR: str = os.path.join(UPLOAD_DIR, "gradcam")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.GRADCAM_DIR, exist_ok=True)
