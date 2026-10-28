import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.config import settings
from app.database.database import engine, Base, SessionLocal
from app.utils.seed_data import seed_database
from app.ml.model_loader import load_ml_model, is_running_in_demo_mode

# API Routers
from app.api.auth import router as auth_router
from app.api.prediction import router as prediction_router
from app.api.waste import router as waste_router
from app.api.safety import router as safety_router
from app.api.analytics import router as analytics_router
from app.api.collection import router as collection_router
from app.api.incidents import router as incidents_router
from app.api.knowledge import router as knowledge_router
from app.api.voice import router as voice_router
from app.api.admin import router as admin_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("smartbiowaste")

app = FastAPI(
    title="SmartBioWaste AI API",
    description="AI-Powered Biomedical Waste Classification, Segregation, Safe Handling and Collection Management System",
    version=settings.PROJECT_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Uploads and Grad-CAM Heatmaps
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(prediction_router, prefix=settings.API_V1_STR)
app.include_router(waste_router, prefix=settings.API_V1_STR)
app.include_router(safety_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(collection_router, prefix=settings.API_V1_STR)
app.include_router(incidents_router, prefix=settings.API_V1_STR)
app.include_router(knowledge_router, prefix=settings.API_V1_STR)
app.include_router(voice_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing SmartBioWaste AI Backend...")
    try:
        # Import models so SQLAlchemy Base registers all tables
        import app.database.models
        
        # 1. Create Tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified / created.")
        
        # 2. Seed Initial Admin & Hospital Data
        db = SessionLocal()
        try:
            seed_database(db)
            logger.info("Database seeded successfully with initial hospital accounts and data.")
        finally:
            db.close()
            
        # 3. Load ML Model
        load_ml_model()
        demo_status = is_running_in_demo_mode()
        if demo_status:
            logger.info("ℹ️ System initialized in DEMO MODE (EfficientNet weights pending or DEMO_MODE=true).")
        else:
            logger.info("🚀 System initialized with PRODUCTION EfficientNet-B0 weights!")
            
    except Exception as e:
        logger.error(f"Startup initialization error: {e}")

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "online",
        "demo_mode": is_running_in_demo_mode(),
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": str(engine.url).split("@")[-1] if "@" in str(engine.url) else "connected",
        "demo_mode": is_running_in_demo_mode()
    }
