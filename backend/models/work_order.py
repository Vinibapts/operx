from sqlalchemy import Column, Integer, String, DateTime, Text, DECIMAL, ForeignKey
from sqlalchemy.sql import func
from database import Base

class WorkOrder(Base):
    __tablename__ = "work_orders"

    id             = Column(Integer, primary_key=True, index=True)
    machine_id     = Column(Integer, ForeignKey("machines.id"), nullable=False)
    plan_id        = Column(Integer, ForeignKey("maintenance_plans.id"))
    technician_id  = Column(Integer, ForeignKey("users.id"))
    status         = Column(String(20), nullable=False, default="pending")
    description    = Column(Text)
    opened_at      = Column(DateTime, server_default=func.now())
    expected_at    = Column(DateTime)
    closed_at      = Column(DateTime)
    total_cost     = Column(DECIMAL(10, 2), default=0.00)
    created_at     = Column(DateTime, server_default=func.now())
