import sys
import os
import json
import shutil
import subprocess
import platform
import webbrowser
from datetime import datetime

def resource_path(relative_path):
    """ Get absolute path to resource (works for dev and PyInstaller) """
    try:
        base_path = sys._MEIPASS  # Temp folder when bundled
    except AttributeError:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# Path to default profiles inside the exe (read-only when bundled)
DEFAULT_PROFILE_PATH = resource_path(os.path.join("profiles", "profiles.json"))

# Path where we store the editable user version
USER_PROFILE_PATH = os.path.join(os.path.expanduser("~"), ".organizit_profiles.json")

# If user profile file doesn't exist, copy from default
if not os.path.exists(USER_PROFILE_PATH):
    try:
        shutil.copy(DEFAULT_PROFILE_PATH, USER_PROFILE_PATH)
    except Exception as e:
        print(f"Error copying default profiles: {e}")

# Now always read/write from the editable path
PROFILE_JSON_PATH = USER_PROFILE_PATH

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
