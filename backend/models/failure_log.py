from sqlalchemy import Column, Integer, DateTime, Text, DECIMAL, ForeignKey
from sqlalchemy.sql import func
from database import Base

class FailureLog(Base):
    __tablename__ = "failure_log"

    id             = Column(Integer, primary_key=True, index=True)
    machine_id     = Column(Integer, ForeignKey("machines.id"), nullable=False)
    failed_at      = Column(DateTime, server_default=func.now())
    description    = Column(Text)
    downtime_hours = Column(DECIMAL(6, 2))
    estimated_cost = Column(DECIMAL(10, 2))
    created_at     = Column(DateTime, server_default=func.now())