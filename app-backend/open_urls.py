import sys
import os
import webbrowser
import subprocess

def open_profile(profile_name):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    folder = os.path.join(base_dir, "profiles")
    os.makedirs(folder, exist_ok=True)

    file_path = os.path.join(folder, f"{profile_name}.txt")

    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            pass

    with open(file_path, "r") as f:
        urls = [line.strip() for line in f if line.strip()]

    if not urls:
        return

    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    if not os.path.exists(chrome_path):
        return

    try:
        webbrowser.register('chrome', None, webbrowser.BackgroundBrowser(chrome_path))
        for i, url in enumerate(urls):
            if i == 0:
                webbrowser.get('chrome').open_new(url)
            else:
                webbrowser.get('chrome').open_new_tab(url)
    except Exception:
        try:
            subprocess.Popen([chrome_path] + urls)
        except Exception:
            pass

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python open_profile.py <profile_name>")
    else:
        open_profile(sys.argv[1])
