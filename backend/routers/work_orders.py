from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.work_order import WorkOrder
from pydantic import BaseModel
from typing import Optional
import asyncio
from services.email_service import send_alert_email
from services.whatsapp_service import send_whatsapp_alert

router = APIRouter(
    prefix="/work-orders",
    tags=["Work Orders"]
)

class WorkOrderRequest(BaseModel):
    machine_id: int
    description: Optional[str] = None
    plan_id: Optional[int] = None
    technician_id: Optional[int] = None

@router.get("/")
def get_work_orders(db: Session = Depends(get_db)):
    work_orders = db.query(WorkOrder).all()
    return work_orders

@router.get("/{work_order_id}")
def get_work_order(work_order_id: int, db: Session = Depends(get_db)):
    work_order = db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()
    if not work_order:
        raise HTTPException(status_code=404, detail="Ordem de serviço não encontrada")
    return work_order

@router.post("/")
def create_work_order(request: WorkOrderRequest, db: Session = Depends(get_db)):
    work_order = WorkOrder(
        machine_id=request.machine_id,
        description=request.description,
        plan_id=request.plan_id,
        technician_id=request.technician_id,
        status="pending"
    )
    db.add(work_order)
    db.commit()
    db.refresh(work_order)

    asyncio.run(send_alert_email(
        subject="🔧 Nova Ordem de Serviço criada - Operx",
        body=f"""
        <h2>Nova Ordem de Serviço</h2>
        <p><b>ID:</b> {work_order.id}</p>
        <p><b>Máquina ID:</b> {work_order.machine_id}</p>
        <p><b>Descrição:</b> {work_order.description or 'Sem descrição'}</p>
        <p><b>Status:</b> {work_order.status}</p>
        """
    ))

    asyncio.run(send_whatsapp_alert(
        f"🔧 Nova OS #{work_order.id}\nMáquina: {work_order.machine_id}\nDescrição: {work_order.description or 'Sem descrição'}"
    ))

    return work_order

@router.patch("/{work_order_id}/status")
def update_work_order_status(work_order_id: int, status: str, db: Session = Depends(get_db)):
    work_order = db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()
    if not work_order:
        raise HTTPException(status_code=404, detail="Ordem de serviço não encontrada")
    work_order.status = status
    db.commit()
    db.refresh(work_order)
    return work_order