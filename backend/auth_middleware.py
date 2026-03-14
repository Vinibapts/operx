from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
import jwt
import os

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        user = db.query(User).filter(User.id == payload["user_id"]).first()
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")