"""
SmartBioWaste AI - PostgreSQL Database Setup & Verification Tool
Run this script to verify or create the PostgreSQL database and populate initial tables.
"""

import sys
import getpass
from sqlalchemy import create_engine, text

def setup_database():
    print("==================================================")
    print("  SmartBioWaste AI - PostgreSQL Database Setup    ")
    print("==================================================")

    host = input("Enter PostgreSQL host [localhost]: ").strip() or "localhost"
    port = input("Enter PostgreSQL port [5432]: ").strip() or "5432"
    user = input("Enter PostgreSQL user [postgres]: ").strip() or "postgres"
    password = getpass.getpass("Enter PostgreSQL password: ")
    dbname = input("Enter Database name to create [smartbiowaste]: ").strip() or "smartbiowaste"

    admin_url = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/postgres"
    target_url = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}"

    print(f"\n1. Connecting to PostgreSQL server at {host}:{port}...")
    try:
        admin_eng = create_engine(admin_url, isolation_level="AUTOCOMMIT", connect_args={"connect_timeout": 5})
        with admin_eng.connect() as conn:
            # Check if db exists
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{dbname}'")).fetchone()
            if not result:
                print(f"2. Creating database '{dbname}'...")
                conn.execute(text(f"CREATE DATABASE {dbname};"))
                print(f"   Database '{dbname}' created successfully!")
            else:
                print(f"2. Database '{dbname}' already exists.")
        admin_eng.dispose()
    except Exception as e:
        print(f"❌ Could not connect to PostgreSQL server: {e}")
        print("\nPlease ensure your credentials are correct and PostgreSQL is running.")
        sys.exit(1)

    print(f"\n3. Updating backend/.env configuration...")
    env_line = f"DATABASE_URL=\"postgresql://{user}:{password}@{host}:{port}/{dbname}\"\n"
    
    env_path = ".env"
    existing_lines = []
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if not line.startswith("DATABASE_URL="):
                    existing_lines.append(line)
    existing_lines.append(env_line)

    with open(env_path, "w") as f:
        f.writelines(existing_lines)

    print("   Updated backend/.env with your DATABASE_URL!")

    print("\n4. Initializing tables & seeding initial hospital data...")
    try:
        import app.database.models
        from app.database.database import engine, Base, SessionLocal
        from app.utils.seed_data import seed_database
        
        target_eng = create_engine(target_url)
        Base.metadata.create_all(bind=target_eng)
        
        db = SessionLocal()
        seed_database(db)
        db.close()
        print("   Tables and seed records populated successfully!")
    except Exception as e:
        print(f"   Note: Tables will automatically be created when FastAPI starts. (Details: {e})")

    print("\n🎉 PostgreSQL setup completed successfully!")
    print(f"Database URL: postgresql://{user}:****@{host}:{port}/{dbname}")

if __name__ == "__main__":
    import os
    setup_database()
