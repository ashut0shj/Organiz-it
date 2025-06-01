import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

PROFILE_FOLDER = "../app-backend/profiles"
LAST_PROFILE_PATH = "../app-backend/last_profile.txt"

# Ensure the profiles folder exists
os.makedirs(PROFILE_FOLDER, exist_ok=True)

@app.route('/save-url', methods=['POST'])
def save_url():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    # Check if last_profile.txt exists
    if not os.path.exists(LAST_PROFILE_PATH):
        return jsonify({"error": "No profile selected yet"}), 400

    # Read last profile name
    with open(LAST_PROFILE_PATH, "r") as f:
        profile_name = f.read().strip()

    if not profile_name:
        return jsonify({"error": "Invalid profile name in last_profile.txt"}), 400

    # Build path to the profile-specific file
    profile_file_path = os.path.join(PROFILE_FOLDER, f"{profile_name}.txt")

    # Save the URL in the profile file
    with open(profile_file_path, "a") as f:
        f.write(url + "\n")

    return jsonify({"message": f"URL saved to {profile_name}.txt!"}), 200

if __name__ == "__main__":
    app.run(port=5000)
