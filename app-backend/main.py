from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from pydantic import BaseModel
import subprocess
import os
import urllib.parse
import json
from datetime import datetime, timedelta
import webbrowser
import jwt

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
PROFILES_JSON_PATH = os.path.join(PROFILE_FOLDER, "profiles.json")
LAST_PROFILE_PATH = os.path.join(os.path.dirname(__file__), "last_profile.txt")

os.makedirs(PROFILE_FOLDER, exist_ok=True)

# Initialize profiles.json if it doesn't exist
if not os.path.exists(PROFILES_JSON_PATH):
    with open(PROFILES_JSON_PATH, "w") as f:
        json.dump({"profiles": []}, f, indent=2)

# JWT Configuration
JWT_SECRET = "your-super-secret-jwt-key-change-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 24  # hours

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

def create_jwt_token(user_data: dict):
    """Create a JWT token with user data"""
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION)
    payload = {
        "email": user_data.get("email"),
        "name": user_data.get("name"),
        "picture": user_data.get("picture"),
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(request: Request):
    """Dependency to get current user from JWT token"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = auth_header.split(" ")[1]
    user_data = verify_jwt_token(token)
    return user_data

def load_profiles():
    """Load profiles from JSON file"""
    try:
        with open(PROFILES_JSON_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"profiles": []}

def save_profiles(profiles_data):
    """Save profiles to JSON file"""
    with open(PROFILES_JSON_PATH, "w") as f:
        json.dump(profiles_data, f, indent=2)

def update_last_used(profile_id):
    """Update the last_used timestamp for a profile"""
    profiles_data = load_profiles()
    for profile in profiles_data["profiles"]:
        if profile["id"] == profile_id:
            profile["last_used"] = datetime.now().isoformat() + "Z"
            save_profiles(profiles_data)
            break

def open_profile_apps(profile_id):
    """Open all apps for a given profile"""
    profiles_data = load_profiles()
    
    for profile in profiles_data["profiles"]:
        if profile["id"] == profile_id:
            for app in profile["apps"]:
                open_command = app["open_command"]
                path_or_url = app["path_or_url"]
                
                try:
                    if open_command == "browser":
                        # Open URL in browser
                        webbrowser.open(path_or_url)
                    elif open_command == "code":
                        # Open VS Code with path
                        subprocess.Popen(["code", path_or_url])
                    else:
                        # Try to open with the specified command
                        subprocess.Popen([open_command, path_or_url])
                except Exception as e:
                    print(f"Error opening {app['app_name']}: {e}")
            
            # Update last_used timestamp
            update_last_used(profile_id)
            break

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
        
        if not user:
            raise Exception("No user info from Google.")

        # Create JWT token
        jwt_token = create_jwt_token(user)
        
        # Redirect back to Electron app with token
        redirect_url = f"http://localhost:5173/oauth-callback?token={jwt_token}"
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        error_url = f"http://localhost:5173/error?msg={urllib.parse.quote(str(e))}"
        return RedirectResponse(url=error_url)

@app.get("/verify-token")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify JWT token and return user info"""
    return {"valid": True, "user": current_user}

@app.get("/profiles")
async def get_profiles(current_user: dict = Depends(get_current_user)):
    """Get all profiles for authenticated user"""
    profiles_data = load_profiles()
    return JSONResponse(content=profiles_data)

@app.post("/launch")
async def launch_profile(req: ProfileRequest, current_user: dict = Depends(get_current_user)):
    profile_name = req.name.lower().strip()
    
    profiles_data = load_profiles()
    
    # Find profile by name (case-insensitive)
    profile_id = None
    for profile in profiles_data["profiles"]:
        if profile["name"].lower() == profile_name:
            profile_id = profile["id"]
            break
    
    if not profile_id:
        return JSONResponse(
            content={"status": "error", "message": f"Profile '{profile_name}' not found."},
            status_code=404
        )

    # Save the last profile name
    with open(LAST_PROFILE_PATH, "w") as f:
        f.write(profile_name)

    try:
        # Open all apps for the profile
        open_profile_apps(profile_id)
        return JSONResponse(content={"status": "success", "message": f"Profile '{profile_name}' launched."})
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)})

@app.post("/profiles")
async def create_profile(profile_data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new profile for authenticated user"""
    profiles_data = load_profiles()
    
    # Generate new ID
    new_id = str(len(profiles_data["profiles"]) + 1)
    
    new_profile = {
        "id": new_id,
        "name": profile_data["name"],
        "date_created": datetime.now().isoformat() + "Z",
        "last_used": datetime.now().isoformat() + "Z",
        "apps": profile_data.get("apps", [])
    }
    
    profiles_data["profiles"].append(new_profile)
    save_profiles(profiles_data)
    
    return JSONResponse(content={"status": "success", "profile": new_profile})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
