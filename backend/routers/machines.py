from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.machine import Machine
from models.user import User
from pydantic import BaseModel
from typing import Optional
from auth_middleware import get_current_user

router = APIRouter(
    prefix="/machines",
    tags=["Machines"]
)

class MachineRequest(BaseModel):
    company_id: int
    name: str
    sector: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    status: str = "active"

@router.get("/")
def get_machines(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    machines = db.query(Machine).all()
    return machines

@router.get("/{machine_id}")
def get_machine(machine_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    return machine

@router.post("/")
def create_machine(request: MachineRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    machine = Machine(
        company_id=request.company_id,
        name=request.name,
        sector=request.sector,
        brand=request.brand,
        model=request.model,
        status=request.status
    )
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return machine

@router.patch("/{machine_id}/status")
def update_machine_status(machine_id: int, status: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    machine.status = status
    db.commit()
    db.refresh(machine)
    return machine