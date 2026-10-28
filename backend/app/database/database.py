import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("smartbiowaste.database")
logging.basicConfig(level=logging.INFO)

Base = declarative_base()

def get_engine_and_session():
    db_url = settings.DATABASE_URL
    is_postgres = db_url.startswith("postgresql")
    
    # In case user uses postgresql:// instead of postgresql+psycopg2://
    if db_url.startswith("postgresql://"):
        engine_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    else:
        engine_url = db_url

    try:
        if is_postgres:
            # First try connecting to the target database
            logger.info(f"Attempting connection to PostgreSQL: {engine_url.split('@')[-1] if '@' in engine_url else engine_url}")
            eng = create_engine(engine_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to PostgreSQL database!")
            return eng, sessionmaker(autocommit=False, autoflush=False, bind=eng)
    except Exception as e:
        logger.warning(f"Failed to connect to PostgreSQL with DATABASE_URL ({e}).")
        
        # If the database does not exist, try creating it via default 'postgres' database
        if is_postgres and "database \"smartbiowaste\" does not exist" in str(e):
            try:
                logger.info("Attempting to auto-create 'smartbiowaste' database...")
                admin_url = engine_url.rsplit('/', 1)[0] + '/postgres'
                admin_eng = create_engine(admin_url, isolation_level="AUTOCOMMIT", connect_args={"connect_timeout": 3})
                with admin_eng.connect() as conn:
                    conn.execute(text("CREATE DATABASE smartbiowaste;"))
                admin_eng.dispose()
                logger.info("Created 'smartbiowaste' database successfully!")
                
                eng = create_engine(engine_url, pool_pre_ping=True)
                return eng, sessionmaker(autocommit=False, autoflush=False, bind=eng)
            except Exception as admin_err:
                logger.warning(f"Could not auto-create database via admin user: {admin_err}")

        # Fallback to local SQLite so application can run reliably if PG credentials are not yet supplied
        fallback_url = "sqlite:///./smartbiowaste.db"
        logger.warning(
            "⚠️ FALLING BACK TO LOCAL SQLITE: "
            "Please configure valid PostgreSQL credentials in backend/.env to use PostgreSQL."
        )
        eng = create_engine(fallback_url, connect_args={"check_same_thread": False})
        return eng, sessionmaker(autocommit=False, autoflush=False, bind=eng)

    # If sqlite or other configured
    eng = create_engine(db_url, connect_args={"check_same_thread": False} if "sqlite" in db_url else {})
    return eng, sessionmaker(autocommit=False, autoflush=False, bind=eng)

engine, SessionLocal = get_engine_and_session()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
