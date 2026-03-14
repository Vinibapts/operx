from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.maintenance_plan import MaintenancePlan
from pydantic import BaseModel
from typing import Optional

router = APIRouter(
    prefix="/maintenance-plans",
    tags=["Maintenance Plans"]
)

class MaintenancePlanRequest(BaseModel):
    machine_id: int
    type: str = "preventive"
    description: Optional[str] = None
    frequency_days: int
    responsible_id: Optional[int] = None

@router.get("/")
def get_maintenance_plans(db: Session = Depends(get_db)):
    plans = db.query(MaintenancePlan).all()
    return plans

@router.get("/{plan_id}")
def get_maintenance_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(MaintenancePlan).filter(MaintenancePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plano não encontrado")
    return plan

@router.post("/")
def create_maintenance_plan(request: MaintenancePlanRequest, db: Session = Depends(get_db)):
    plan = MaintenancePlan(
        machine_id=request.machine_id,
        type=request.type,
        description=request.description,
        frequency_days=request.frequency_days,
        responsible_id=request.responsible_id
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.patch("/{plan_id}/status")
def update_plan_status(plan_id: int, active: bool, db: Session = Depends(get_db)):
    plan = db.query(MaintenancePlan).filter(MaintenancePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plano não encontrado")
    plan.active = active
    db.commit()
    db.refresh(plan)
    return plan