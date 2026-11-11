"""SQLAlchemy engine/session setup for the VT-Lanternfly MySQL database.

Set DATABASE_URL in backend/.env
"""
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv(Path(__file__).resolve().parent / ".env")

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "mysql+pymysql://root@localhost:3306/vtlanternfly_db"
)

# upload/map endpoints still work if MySQL is down.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """one session per request, always closed afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
