from pydantic import BaseModel, EmailStr, Field #type: ignore
from typing import Optional
from datetime import datetime

# class UserRegister(BaseModel):
#     name: str
#     username: str
#     email: EmailStr
#     password: str

# class UserLogin(BaseModel):
#     email: EmailStr
#     password: str

# class UserOut(BaseModel):
#     id: str
#     name: str
#     username: str
#     email: EmailStr
#     date: Optional[datetime]

class User(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: datetime = Field(default_factory=datetime.utcnow)
    google_id: Optional[str] = None
