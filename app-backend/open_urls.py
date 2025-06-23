import sys
import os
import json
import subprocess
import platform
import webbrowser
from datetime import datetime

PROFILE_JSON_PATH = os.path.join(os.path.dirname(__file__), "profiles", "profiles.json")

def detect_os():
    if os.name == 'nt' or platform.system().lower() == 'windows':
        return 'windows'
    else:
        return 'linux'

def open_apps(apps):
    os_type = detect_os()
    for app in apps:
        open_command = app.get("open_command")
        path_or_url = app.get("path_or_url")
        try:
            if open_command == "browser":
                webbrowser.open(path_or_url)
            elif open_command == "code":
                if os_type == 'windows':
                    subprocess.Popen(["code.cmd", path_or_url])
                else:
                    subprocess.Popen(["code", path_or_url])
            else:
                if os_type == 'windows':
                    subprocess.Popen([open_command + ".exe", path_or_url])
                else:
                    subprocess.Popen([open_command, path_or_url])
        except Exception as e:
            print(f"Error opening {app.get('app_name', open_command)}: {e}")

def open_profile(profile_name):
    try:
        with open(PROFILE_JSON_PATH, "r") as f:
            profiles_data = json.load(f)
    except Exception as e:
        print(f"Error loading profiles.json: {e}")
        return

    profile = None
    for p in profiles_data.get("profiles", []):
        if p["name"].lower() == profile_name.lower():
            profile = p
            break

    if not profile:
        print(f"Profile '{profile_name}' not found.")
        return

    open_apps(profile.get("apps", []))

    profile["last_used"] = datetime.now().isoformat() + "Z"
    try:
        with open(PROFILE_JSON_PATH, "w") as f:
            json.dump(profiles_data, f, indent=2)
    except Exception as e:
        print(f"Error updating last_used: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python open_urls.py <profile_name>")
    else:
        open_profile(sys.argv[1])
