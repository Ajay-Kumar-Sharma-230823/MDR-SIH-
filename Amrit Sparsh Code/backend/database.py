from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Always store the SQLite DB FILE INSIDE backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # backend folder path
DB_PATH = os.path.join(BASE_DIR, "amritsparsh.db")     # backend/amritsparsh.db

DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
