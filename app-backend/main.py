import sys
import os
import json
import webbrowser
import subprocess
import platform
import uuid
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from pydantic import BaseModel
from bson import ObjectId

from database import users_collection, profiles_collection
from models.users import User
from models.profiles import Profile, App

# --- Path Fix ---
# This creates a reliable path that works in both development and when packaged.
if getattr(sys, 'frozen', False):
    # If the application is run as a bundled/packaged executable
    base_path = os.path.dirname(sys.executable)
else:
    # If the application is run as a normal Python script
    base_path = os.path.dirname(os.path.abspath(__file__))

# Load environment variables from a .env file located next to the executable
dotenv_path = os.path.join(base_path, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
# --- End Path Fix ---

def convert_mongo_document(doc):
    if doc is None:
        return None
    doc_copy = doc.copy()
    if "_id" in doc_copy:
        doc_copy["_id"] = str(doc_copy["_id"])
    # Convert datetime objects to ISO format strings
    for key, value in doc_copy.items():
        if isinstance(value, datetime):
            doc_copy[key] = value.isoformat()
    return doc_copy

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "a-super-secret-key"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use the reliable base_path to locate the profiles.json file
PROFILES_JSON_PATH = os.path.join(base_path, "profiles.json")

# Initialize profiles.json if it doesn't exist or is empty
if not os.path.exists(PROFILES_JSON_PATH):
    with open(PROFILES_JSON_PATH, "w") as f:
        json.dump({"profiles": []}, f, indent=2)
else:
    try:
        with open(PROFILES_JSON_PATH, "r") as f:
            if not f.read().strip():
                with open(PROFILES_JSON_PATH, "w") as f:
                    json.dump({"profiles": []}, f, indent=2)
    except (json.JSONDecodeError, FileNotFoundError):
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
            content = f.read().strip()
            if not content:
                return {"profiles": []}
            return json.loads(content)
    except (FileNotFoundError, json.JSONDecodeError):
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
                        if isinstance(url, list):
                            for single_url in url:
                                if single_url and single_url.strip():
                                    webbrowser.open(single_url)
                        elif url and url.strip():
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
                        subprocess.Popen([app_name], shell=True)
                except Exception as e:
                    print(f"Error opening {app['app_name']}: {e}")
            update_last_used(profile_id)
            break

@app.get("/")
async def home():
    return {"message": "FastAPI Google Login Backend Running"}

@app.get("/profiles")
async def get_profiles_endpoint():
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
        return JSONResponse(content={"status": "error", "message": f"Profile '{profile_name}' not found."}, status_code=404)
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
        return JSONResponse(content={"status": "error", "message": f"Profile with ID '{profile_id}' not found."}, status_code=404)
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
        return JSONResponse(content={"status": "error", "message": f"Profile with ID '{profile_id}' not found."}, status_code=404)
    save_profiles(profiles_data)
    return JSONResponse(content={"status": "success", "message": f"Profile updated successfully."})

@app.get("/profilenames")
def get_profile_names():
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

class AuthCode(BaseModel):
    code: str

@app.post("/auth/google")
async def google_login_endpoint(auth_code: AuthCode, request: Request):
    try:
        token = await oauth.google.authorize_access_token(request, code=auth_code.code, redirect_uri='http://localhost:54321', state=None)
        user_info = await oauth.google.parse_id_token(request, token)
        
        email = user_info.get("email")
        name = user_info.get("name", "")
        picture = user_info.get("picture", "")
        google_id = user_info.get("sub", "")
        
        if not email:
            return JSONResponse(content={"error": "Email not found in token"}, status_code=400)
        
        current_time = datetime.utcnow()
        
        existing_user = await users_collection.find_one({"email": email})
        
        if existing_user:
            await users_collection.update_one(
                {"email": email},
                {"$set": {"last_login": current_time, "picture": picture, "name": name}}
            )
            user_data = convert_mongo_document(await users_collection.find_one({"email": email}))
        else:
            new_user = User(
                email=email,
                name=name,
                picture=picture,
                google_id=google_id,
                created_at=current_time,
                last_login=current_time
            )
            result = await users_collection.insert_one(new_user.dict())
            user_data = new_user.dict()
            user_data["_id"] = str(result.inserted_id)
            user_data = convert_mongo_document(user_data)
        
        return JSONResponse(content={"user": user_data})
    except Exception as e:
        print(f"Authentication error: {e}")
        return JSONResponse(content={"error": "Authentication failed", "details": str(e)}, status_code=500)

@app.get("/api/users")
async def get_users():
    users = []
    async for user in users_collection.find():
        users.append(convert_mongo_document(user))
    return JSONResponse(content={"users": users})

@app.get("/api/users/{email}")
async def get_user_by_email(email: str):
    user = await users_collection.find_one({"email": email})
    if not user:
        return JSONResponse(content={"error": "User not found"}, status_code=404)
    return JSONResponse(content={"user": convert_mongo_document(user)})

@app.post("/api/sync-profiles")
async def sync_profiles(request: Request):
    data = await request.json()
    user_email = data.get("user_email")
    profiles = data.get("profiles", [])
    
    if not user_email:
        return JSONResponse(content={"error": "User email is required"}, status_code=400)
    
    try:
        for profile_data in profiles:
            date_created_str = profile_data.get("date_created", datetime.utcnow().isoformat())
            last_used_str = profile_data.get("last_used", datetime.utcnow().isoformat())
            
            try:
                date_created = datetime.fromisoformat(date_created_str.replace('Z', '+00:00'))
            except ValueError:
                date_created = datetime.utcnow()
                
            try:
                last_used = datetime.fromisoformat(last_used_str.replace('Z', '+00:00'))
            except ValueError:
                last_used = datetime.utcnow()
            
            profile = Profile(
                id=profile_data.get("id"),
                user_email=user_email,
                name=profile_data["name"],
                color=profile_data.get("color", "#6a49ff"),
                emoji=profile_data.get("emoji", ""),
                date_created=date_created,
                last_used=last_used,
                apps=[App(app_name=app["app_name"], url=app.get("url", "")) for app in profile_data.get("apps", [])]
            )
            
            existing_profile = await profiles_collection.find_one({
                "user_email": user_email,
                "id": profile_data.get("id")
            })
            
            if existing_profile:
                await profiles_collection.update_one(
                    {"user_email": user_email, "id": profile_data.get("id")},
                    {"$set": profile.dict()}
                )
            else:
                await profiles_collection.insert_one(profile.dict())
        
        return JSONResponse(content={"status": "success", "message": f"Synced {len(profiles)} profiles"})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/api/profiles/{user_email}")
async def get_user_profiles(user_email: str):
    try:
        profiles = []
        async for profile in profiles_collection.find({"user_email": user_email}):
            profiles.append(convert_mongo_document(profile))
        return JSONResponse(content={"profiles": profiles})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn

    is_bundled = getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS')
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=not is_bundled
    )
