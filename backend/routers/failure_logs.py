from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.failure_log import FailureLog
import asyncio
from services.email_service import send_alert_email
from services.whatsapp_service import send_whatsapp_alert

router = APIRouter(
    prefix="/failure-logs",
    tags=["Failure Logs"]
)

@router.get("/")
def get_failure_logs(db: Session = Depends(get_db)):
    logs = db.query(FailureLog).all()
    return logs

@router.get("/{log_id}")
def get_failure_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(FailureLog).filter(FailureLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log não encontrado")
    return log

@router.get("/machine/{machine_id}")
def get_logs_by_machine(machine_id: int, db: Session = Depends(get_db)):
    logs = db.query(FailureLog).filter(FailureLog.machine_id == machine_id).all()
    return logs

@router.post("/")
def create_failure_log(
    machine_id: int,
    description: str = None,
    downtime_hours: float = None,
    estimated_cost: float = None,
    db: Session = Depends(get_db)
):
    log = FailureLog(
        machine_id=machine_id,
        description=description,
        downtime_hours=downtime_hours,
        estimated_cost=estimated_cost
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    asyncio.run(send_alert_email(
        subject="⚠️ Falha registrada em máquina - Operx",
        body=f"""
        <h2>⚠️ Falha Registrada</h2>
        <p><b>ID do Log:</b> {log.id}</p>
        <p><b>Máquina ID:</b> {log.machine_id}</p>
        <p><b>Descrição:</b> {log.description or 'Sem descrição'}</p>
        <p><b>Tempo parado:</b> {log.downtime_hours or 0} horas</p>
        <p><b>Custo estimado:</b> R$ {log.estimated_cost or 0:.2f}</p>
        """
    ))

    asyncio.run(send_whatsapp_alert(
        f"⚠️ Falha registrada!\nMáquina: {log.machine_id}\nDescrição: {log.description or 'Sem descrição'}\nTempo parado: {log.downtime_hours or 0}h\nCusto estimado: R$ {log.estimated_cost or 0:.2f}"
    ))

    return log