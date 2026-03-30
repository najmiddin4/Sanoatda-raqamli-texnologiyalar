from flask import Flask, request
import os

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "rum_secret_2026")

app = Flask(__name__)

@app.route("/")
def index():
    return "RUM bot is running."

@app.route(f"/webhook/{WEBHOOK_SECRET}", methods=["POST"])
def webhook():
    data = request.get_json(force=True)

    chat = data.get("message", {}).get("chat", {})
    user = data.get("message", {}).get("from", {})

    if chat:
        print(f"CHAT ID: {chat.get('id')}, TYPE: {chat.get('type')}")

    if user:
        username = user.get('username')
        if username:
            print(f"USER ID: {user.get('id')}, USERNAME: @{username}")
        else:
            print(f"USER ID: {user.get('id')}")

    return "ok", 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
