from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from database import Base

class MaintenancePlan(Base):
    __tablename__ = "maintenance_plans"

    id             = Column(Integer, primary_key=True, index=True)
    machine_id     = Column(Integer, ForeignKey("machines.id"), nullable=False)
    responsible_id = Column(Integer, ForeignKey("users.id"))
    type           = Column(String(20), nullable=False, default="preventive")
    description    = Column(Text)
    frequency_days = Column(Integer, nullable=False)
    active         = Column(Boolean, nullable=False, default=True)
    created_at     = Column(DateTime, server_default=func.now())