from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.company import Company
from models.user import User
from auth_middleware import get_current_user

router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)

@router.get("/")
def get_companies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    companies = db.query(Company).all()
    return companies

@router.get("/{company_id}")
def get_company(company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return company

@router.post("/")
def create_company(name: str, plan: str, email: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    company = Company(name=name, plan=plan, email=email)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company