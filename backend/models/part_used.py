from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, ForeignKey
from sqlalchemy.sql import func
from database import Base

class PartUsed(Base):
    __tablename__ = "parts_used"

    id            = Column(Integer, primary_key=True, index=True)
    work_order_id = Column(Integer, ForeignKey("work_orders.id"), nullable=False)
    name          = Column(String(150), nullable=False)
    quantity      = Column(Integer, nullable=False, default=1)
    unit_cost     = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    total_cost    = Column(DECIMAL(10, 2))
    created_at    = Column(DateTime, server_default=func.now())