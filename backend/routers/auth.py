from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from pydantic import BaseModel
import hashlib
import jwt
import os

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")

    if user.password != hash_password(request.password):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")

    token = jwt.encode(
        {"user_id": user.id, "email": user.email},
        os.getenv("SECRET_KEY"),
        algorithm="HS256"
    )

    return {
        "token": token,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }