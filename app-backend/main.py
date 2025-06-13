from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from pydantic import BaseModel
import subprocess
import os
import urllib.parse

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

PROFILE_FOLDER = os.path.join(os.path.dirname(__file__), "profiles")
LAST_PROFILE_PATH = os.path.join(os.path.dirname(__file__), "last_profile.txt")

os.makedirs(PROFILE_FOLDER, exist_ok=True)

# Google OAuth setup
oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
)

# Pydantic model to parse incoming JSON for /launch endpoint
class ProfileRequest(BaseModel):
    name: str

@app.get("/")
async def home():
    return {"message": "FastAPI Google Login Backend Running"}

@app.get("/login")
async def login(request: Request):
    redirect_uri = "http://localhost:8000/auth/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/callback")
async def auth_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user = token.get("userinfo")

        params = urllib.parse.urlencode({
            "email": user.get("email", ""),
            "name": user.get("name", ""),
            "picture": user.get("picture", "")
        })
        redirect_url = f"http://localhost:5173/dashboard?{params}"
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        error_url = f"http://localhost:5173/error?msg={urllib.parse.quote(str(e))}"
        return RedirectResponse(url=error_url)

@app.post("/launch")
async def launch_profile(req: ProfileRequest):
    profile_name = req.name.lower().strip()

    # Save the last profile name
    with open(LAST_PROFILE_PATH, "w") as f:
        f.write(profile_name)

    # Launch the script
    script_path = os.path.join(os.path.dirname(__file__), "open_urls.py")
    try:
        subprocess.Popen(["python", script_path, profile_name])
        return JSONResponse(content={"status": "success", "message": f"Profile '{profile_name}' launched."})
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
