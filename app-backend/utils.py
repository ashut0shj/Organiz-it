import bcrypt# type: ignore
from jose import jwt # type: ignore
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt(data: dict, expires_in_minutes=60):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_jwt(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
