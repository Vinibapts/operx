from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.alert_setting import AlertSetting
from models.user import User
from pydantic import BaseModel
from auth_middleware import get_current_user

router = APIRouter(
    prefix="/alert-settings",
    tags=["Alert Settings"]
)

class AlertSettingRequest(BaseModel):
    company_id: int
    channel: str = "email"
    advance_days: int = 3
    active: bool = True

@router.get("/")
def get_alert_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(AlertSetting).all()
    return settings

@router.get("/{setting_id}")
def get_alert_setting(setting_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    setting = db.query(AlertSetting).filter(AlertSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Configuração não encontrada")
    return setting

@router.post("/")
def create_alert_setting(request: AlertSettingRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    setting = AlertSetting(
        company_id=request.company_id,
        channel=request.channel,
        advance_days=request.advance_days,
        active=request.active
    )
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting

@router.put("/{setting_id}")
def update_alert_setting(setting_id: int, request: AlertSettingRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    setting = db.query(AlertSetting).filter(AlertSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Configuração não encontrada")
    setting.channel = request.channel
    setting.advance_days = request.advance_days
    setting.active = request.active
    db.commit()
    db.refresh(setting)
    return setting