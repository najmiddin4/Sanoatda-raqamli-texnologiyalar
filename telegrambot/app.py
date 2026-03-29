from flask import Flask, request
from telegram import Update
from telegram.ext import Application
import asyncio
import os

TOKEN = os.getenv("8773960266:AAFZK0rfvDZLBt0wxiJeGTC54ZLKb_TrIeI")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "rum_secret_2026")

app = Flask(__name__)
ptb_app = Application.builder().token(TOKEN).build()

@app.route("/")
def index():
    return "RUM bot is running."

@app.route(f"/webhook/{WEBHOOK_SECRET}", methods=["POST"])
def webhook():
    data = request.get_json(force=True)
    update = Update.de_json(data, ptb_app.bot)

    chat_info = "no chat"
    if update.effective_chat:
        chat_info = f"CHAT ID: {update.effective_chat.id}, TYPE: {update.effective_chat.type}"

    user_info = "no user"
    if update.effective_user:
        user_info = (
            f"USER ID: {update.effective_user.id}, USERNAME: @{update.effective_user.username}"
            if update.effective_user.username
            else f"USER ID: {update.effective_user.id}"
        )

    print(chat_info)
    print(user_info)

    return "ok", 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
