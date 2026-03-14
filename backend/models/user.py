from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name       = Column(String(150), nullable=False)
    email      = Column(String(150), nullable=False, unique=True)
    password   = Column(String(255), nullable=False)
    role       = Column(String(20), nullable=False, default="technician")
    active     = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now())