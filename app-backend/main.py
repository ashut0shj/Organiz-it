from fastapi import FastAPI, Request, APIRouter # type: ignore
from fastapi.responses import RedirectResponse, JSONResponse # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from starlette.middleware.sessions import SessionMiddleware # type: ignore
from authlib.integrations.starlette_client import OAuth # type: ignore
from dotenv import load_dotenv
from pydantic import BaseModel # type: ignore
import subprocess
import os
import urllib.parse
import json
from datetime import datetime
import webbrowser
import requests # type: ignore
import platform
import uuid

load_dotenv()

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key="super-secret-session-key")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROFILES_JSON_PATH = os.getenv("PROFILES_JSON_PATH") 

if not os.path.exists(PROFILES_JSON_PATH):
    with open(PROFILES_JSON_PATH, "w") as f:
        json.dump({"profiles": []}, f, indent=2)

oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
)

class ProfileRequest(BaseModel):
    name: str

def load_profiles():
    try:
        with open(PROFILES_JSON_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"profiles": []}

def save_profiles(profiles_data):
    with open(PROFILES_JSON_PATH, "w") as f:
        json.dump(profiles_data, f, indent=2)

def update_last_used(profile_id):
    profiles_data = load_profiles()
    for profile in profiles_data["profiles"]:
        if profile["id"] == profile_id:
            profile["last_used"] = datetime.now().isoformat() + "Z"
            save_profiles(profiles_data)
            break

def open_profile_apps(profile_id):
    profiles_data = load_profiles()
    os_type = platform.system().lower()
    for profile in profiles_data["profiles"]:
        if profile["id"] == profile_id:
            for app in profile["apps"]:
                app_name = app["app_name"]
                url = app.get("url", "")
                try:
                    if app_name == "Browser":
                        if url.strip():
                            webbrowser.open(url)
                    elif app_name == "VS Code":
                        subprocess.Popen(f'code "{url}"', shell=True)
                    elif app_name == "Notepad":
                        if os_type == "windows":
                            subprocess.Popen(["notepad.exe"])
                        else:
                            subprocess.Popen(["gedit"])
                    elif app_name == "Spotify":
                        if os_type == "windows":
                            subprocess.Popen(["spotify.exe"])
                        else:
                            try:
                                subprocess.Popen(["spotify"])
                            except Exception:
                                webbrowser.open("https://open.spotify.com/")
                    elif app_name == "Anaconda":
                        if os_type == "windows":
                            subprocess.Popen(["anaconda-navigator.exe"])
                        else:
                            subprocess.Popen(["anaconda-navigator"])
                    elif app_name == "WhatsApp":
                        if os_type == "windows":
                            subprocess.Popen(["WhatsApp.exe"])
                        else:
                            webbrowser.open("https://web.whatsapp.com/")
                    else:
                        subprocess.Popen([app_name.lower(), url])
                except Exception as e:
                    print(f"Error opening {app['app_name']}: {e}")
            update_last_used(profile_id)
            break

@app.get("/")
async def home():
    return {"message": "FastAPI Google Login Backend Running"}

@app.get("/profiles")
async def get_profiles():
    profiles_data = load_profiles()
    return JSONResponse(content=profiles_data)

@app.post("/launch")
async def launch_profile(req: ProfileRequest):
    profile_name = req.name.lower().strip()
    profiles_data = load_profiles()
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
        open_profile_apps(profile_id)
        return JSONResponse(content={"status": "success", "message": f"Profile '{profile_name}' launched."})
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)})

@app.post("/profiles")
async def create_profile(profile_data: dict):
    profiles_data = load_profiles()
    new_id = str(uuid.uuid4())
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
    profiles_data = load_profiles()
    original_length = len(profiles_data["profiles"])
    profiles_data["profiles"] = [p for p in profiles_data["profiles"] if str(p["id"]) != str(profile_id)]
    if len(profiles_data["profiles"]) == original_length:
        return JSONResponse(
            content={"status": "error", "message": f"Profile with ID '{profile_id}' not found."},
            status_code=404
        )
    save_profiles(profiles_data)
    return JSONResponse(content={"status": "success", "message": f"Profile deleted successfully."})

@app.put("/profiles/{profile_id}")
async def update_profile(profile_id: str, profile_data: dict):
    profiles_data = load_profiles()
    profile_found = False
    for i, profile in enumerate(profiles_data["profiles"]):
        if profile["id"] == profile_id:
            profiles_data["profiles"][i] = {
                "id": profile_id,
                "name": profile_data["name"],
                "color": profile_data.get("color", profile.get("color", "#6a49ff")),
                "emoji": profile_data.get("emoji", profile.get("emoji", "")),
                "date_created": profile["date_created"],
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
            profile["apps"].append({
                "app_name": "Browser",
                "url": url
            })
            break
    with open(PROFILES_JSON_PATH, "w") as f:
        json.dump(profiles_data, f, indent=2)
    return {"status": "added"}

@app.post("/api/auth/google")
async def google_login(request: Request):
    data = await request.json()
    token = data.get("credential")
    if not token:
        return JSONResponse(content={"error": "Missing credential"}, status_code=400)
    google_resp = requests.get(
        f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
    )
    if google_resp.status_code != 200:
        return JSONResponse(content={"error": "Invalid token"}, status_code=401)
    user_info = google_resp.json()
    return JSONResponse(content={"user": user_info})


if __name__ == "__main__":
    import uvicorn # type: ignore
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)