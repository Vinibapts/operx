from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Machine(Base):
    __tablename__ = "machines"

    id            = Column(Integer, primary_key=True, index=True)
    company_id    = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name          = Column(String(150), nullable=False)
    sector        = Column(String(100))
    brand         = Column(String(100))
    model         = Column(String(100))
    purchase_date = Column(Date)
    status        = Column(String(20), nullable=False, default="active")
    photo_url     = Column(String(255))
    created_at    = Column(DateTime, server_default=func.now())