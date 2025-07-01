from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from routes.auth import router as auth_router
from pydantic import BaseModel
import subprocess
import os
import urllib.parse
import json
from datetime import datetime
import webbrowser

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

# Save profiles.json directly in the project directory (where main.py is)
PROFILES_JSON_PATH = os.getenv("PROFILES_JSON_PATH") 

# Initialize profiles.json if it doesn't exist
if not os.path.exists(PROFILES_JSON_PATH):
    with open(PROFILES_JSON_PATH, "w") as f:
        json.dump({"profiles": []}, f, indent=2)

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
                        # Handle multiple URLs for browser apps
                        if isinstance(path_or_url, list):
                            # If path_or_url is a list, open each URL
                            for url in path_or_url:
                                if url.strip():  # Only open non-empty URLs
                                    webbrowser.open(url)
                        else:
                            # If path_or_url is a single string, open it
                            webbrowser.open(path_or_url)
                    elif open_command == "code":
                        # Open VS Code with path
                        subprocess.Popen(f'code "{path_or_url}"', shell=True)
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

        params = urllib.parse.urlencode({
            "email": user.get("email", ""),
            "name": user.get("name", ""),
            "picture": user.get("picture", "")
        })
        redirect_url = f"http://localhost:5173/profile?{params}"
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        error_url = f"http://localhost:5173/error?msg={urllib.parse.quote(str(e))}"
        return RedirectResponse(url=error_url)

@app.get("/profiles")
async def get_profiles():
    """Get all profiles"""
    profiles_data = load_profiles()
    return JSONResponse(content=profiles_data)

@app.post("/launch")
async def launch_profile(req: ProfileRequest):
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

    try:
        # Open all apps for the profile
        open_profile_apps(profile_id)
        return JSONResponse(content={"status": "success", "message": f"Profile '{profile_name}' launched."})
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)})

@app.post("/profiles")
async def create_profile(profile_data: dict):
    """Create a new profile"""
    profiles_data = load_profiles()
    # Generate new ID
    new_id = str(len(profiles_data["profiles"]) + 1)
    new_profile = {
        "id": new_id,
        "name": profile_data["name"],
        "color": profile_data.get("color", "#6a49ff"),
        "emoji": profile_data.get("emoji", ""),
        "date_created": datetime.now().isoformat() + "Z",
        "last_used": datetime.now().isoformat() + "Z",
        "apps": profile_data.get("apps", [])
    }
    profiles_data["profiles"].append(new_profile)
    save_profiles(profiles_data)
    return JSONResponse(content={"status": "success", "profile": new_profile})

@app.delete("/profiles/{profile_id}")
async def delete_profile(profile_id: str):
    """Delete a profile by ID"""
    profiles_data = load_profiles()
    
    # Find and remove the profile
    original_length = len(profiles_data["profiles"])
    profiles_data["profiles"] = [p for p in profiles_data["profiles"] if p["id"] != profile_id]
    
    if len(profiles_data["profiles"]) == original_length:
        return JSONResponse(
            content={"status": "error", "message": f"Profile with ID '{profile_id}' not found."},
            status_code=404
        )
    
    save_profiles(profiles_data)
    return JSONResponse(content={"status": "success", "message": f"Profile deleted successfully."})

@app.put("/profiles/{profile_id}")
async def update_profile(profile_id: str, profile_data: dict):
    """Update a profile by ID"""
    profiles_data = load_profiles()
    # Find the profile to update
    profile_found = False
    for i, profile in enumerate(profiles_data["profiles"]):
        if profile["id"] == profile_id:
            # Update the profile data
            profiles_data["profiles"][i] = {
                "id": profile_id,
                "name": profile_data["name"],
                "color": profile_data.get("color", profile.get("color", "#6a49ff")),
                "emoji": profile_data.get("emoji", profile.get("emoji", "")),
                "date_created": profile["date_created"],  # Keep original creation date
                "last_used": datetime.now().isoformat() + "Z",
                "apps": profile_data.get("apps", [])
            }
            profile_found = True
            break
    if not profile_found:
        return JSONResponse(
            content={"status": "error", "message": f"Profile with ID '{profile_id}' not found."},
            status_code=404
        )
    save_profiles(profiles_data)
    return JSONResponse(content={"status": "success", "message": f"Profile updated successfully."})

@app.get("/profilenames")
def get_profiles():
    with open(PROFILES_JSON_PATH, "r") as f:
        return json.load(f)

@app.post("/track")
async def track(request: Request):
    data = await request.json()
    profile_name = data["profile"]
    url = data["url"]
        
    with open(PROFILES_JSON_PATH, "r") as f:
        profiles_data = json.load(f)

    for profile in profiles_data["profiles"]:
        if profile["name"] == profile_name:
            # Append the URL as a new browser app
            profile["apps"].append({
                "app_name": "Browser",
                "open_command": "browser",
                "path_or_url": url
            })
            break

    with open(PROFILES_JSON_PATH, "w") as f:
        json.dump(profiles_data, f, indent=2)

    return {"status": "added"}

app.include_router(auth_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)