from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
import os
import urllib.parse

load_dotenv()

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key="super-secret-session-key")

oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
)


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

    