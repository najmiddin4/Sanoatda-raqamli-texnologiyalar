from flask import Flask, request
from telegram import Update
from telegram.ext import Application
import os

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "rum_secret_2026")

app = Flask(__name__)

_ptb_app = None

def get_ptb_app():
    global _ptb_app
    if _ptb_app is None:
        if not TOKEN:
            raise RuntimeError("TELEGRAM_BOT_TOKEN muhit o'zgaruvchisi o'rnatilmagan")
        _ptb_app = Application.builder().token(TOKEN).build()
    return _ptb_app

@app.route("/")
def index():
    return "RUM bot is running."

@app.route(f"/webhook/{WEBHOOK_SECRET}", methods=["POST"])
def webhook():
    data = request.get_json(force=True)
    application = get_ptb_app()
    update = Update.de_json(data, application.bot)

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
