# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
import os

from routes.auth import router as auth_router
from routes.google_oauth import router as google_router
from routes.profile import router as profile_router
from routes.track import router as track_router

load_dotenv()

app = FastAPI()

# Middleware for sessions
app.add_middleware(SessionMiddleware, secret_key="super-secret-session-key")

# CORS setup for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth_router, prefix="/api/auth")
app.include_router(google_router)
app.include_router(profile_router)
app.include_router(track_router)

@app.get("/")
async def home():
    return {"message": "FastAPI Google Login Backend Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
