from fastapi import APIRouter, HTTPException, Depends
from models.users import UserRegister, UserLogin, UserOut
from database import db
from utils import hash_password, verify_password, create_jwt, decode_jwt
from bson import ObjectId
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime

router = APIRouter()
security = HTTPBearer()

@router.post("/register")
async def register(user: UserRegister):
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hash_password(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    user_dict["date"] = datetime.utcnow()

    result = await db.users.insert_one(user_dict)
    token = create_jwt({"id": str(result.inserted_id)})
    return {"authtoken": token}

@router.get("/login")
async def login(user: UserLogin):
    found = await db.users.find_one({"email": user.email})
    if not found or not verify_password(user.password, found["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_jwt({"id": str(found["_id"])})
    return {"authtoken": token, "username": found["username"]}

@router.post("/getuser", response_model=UserOut)
async def get_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_jwt(credentials.credentials)
    user = await db.users.find_one({"_id": ObjectId(payload["id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "username": user["username"],
        "email": user["email"],
        "date": user.get("date")
    }
