from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/save-url', methods=['POST'])
def save_url():
    data = request.get_json()
    url = data.get("url")
    if url:
        with open("saved_urls.txt", "a") as f:
            f.write(url + "\n")
        return jsonify({"message": "URL saved!"}), 200
    return jsonify({"error": "No URL provided"}), 400

if __name__ == "__main__":
    app.run(port=5000)
