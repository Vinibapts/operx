from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class AlertSetting(Base):
    __tablename__ = "alert_settings"

    id            = Column(Integer, primary_key=True, index=True)
    company_id    = Column(Integer, ForeignKey("companies.id"), nullable=False)
    channel       = Column(String(20), nullable=False, default="email")
    advance_days  = Column(Integer, nullable=False, default=3)
    active        = Column(Boolean, nullable=False, default=True)
    created_at    = Column(DateTime, server_default=func.now())