"""SQLAlchemy ORM models mirroring server/src/main/resources/schema.sql.

"""
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    JSON, Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func,
)
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    major: Mapped[str | None] = mapped_column(String(100))
    anonymous: Mapped[bool] = mapped_column(Boolean, default=False)
    share_with_researchers: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    photo_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    stored_name: Mapped[str] = mapped_column(String(255), nullable=False)
    lat: Mapped[Decimal | None] = mapped_column(Numeric(10, 8))
    lng: Mapped[Decimal | None] = mapped_column(Numeric(11, 8))
    captured_at: Mapped[datetime | None] = mapped_column(DateTime)
    location_source: Mapped[str | None] = mapped_column(String(50))
    life_stage_claimed: Mapped[str | None] = mapped_column(String(50))
    life_stage_verified: Mapped[str | None] = mapped_column(String(50))
    detection_status: Mapped[str | None] = mapped_column(String(50))
    model_confidence: Mapped[Decimal | None] = mapped_column(Numeric(5, 4))
    bbox: Mapped[dict | list | None] = mapped_column(JSON)
    review_status: Mapped[str] = mapped_column(
        Enum("pending", "approved", "rejected"), default="pending"
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class PointEvent(Base):
    __tablename__ = "point_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    report_id: Mapped[int | None] = mapped_column(ForeignKey("reports.id", ondelete="SET NULL"))
    lesson_id: Mapped[int | None] = mapped_column(Integer)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    icon: Mapped[str | None] = mapped_column(String(50))


class UserBadge(Base):
    __tablename__ = "user_badges"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    badge_id: Mapped[int] = mapped_column(ForeignKey("badges.id", ondelete="CASCADE"), primary_key=True)
    earned_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class QuizPass(Base):
    __tablename__ = "quiz_passes"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    lesson_index: Mapped[int] = mapped_column(Integer, primary_key=True)
    passed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
