import subprocess
import os

# Path to your saved_urls.txt
file_path = os.path.join(os.path.dirname(__file__), "saved_urls.txt")

if not os.path.exists(file_path):
    print("No saved_urls.txt file found.")
    exit()

with open(file_path, "r") as file:
    urls = [line.strip() for line in file if line.strip()]

if not urls:
    print("No URLs found in file.")
    exit()

# Path to Chrome executable
chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"  # Adjust if needed

# Build the command to open all URLs in a new window
command = [chrome_path, "--new-window"] + urls

# Open in new window
subprocess.Popen(command)
