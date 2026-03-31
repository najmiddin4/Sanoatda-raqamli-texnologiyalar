from flask import Flask, request, jsonify, make_response
import json
import os
import requests as req

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "rum_secret_2026")
ADMIN_GROUP_ID = os.getenv("ADMIN_GROUP_ID")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
API_URL = f"https://api.telegram.org/bot{TOKEN}" if TOKEN else None
PROMPT_DIR = os.path.join(os.path.dirname(__file__), "prompts")
ALLOWED_ORIGINS = {
    "https://archive.srt-journal.uz",
    "http://archive.srt-journal.uz",
    "https://rum-journal.com",
    "http://rum-journal.com",
}

app = Flask(__name__)
user_states = {}

TEXTS = {
    "uz": {
        "welcome": "👋 Assalomu alaykum! RUM Publishing botiga xush kelibsiz.\n\nIltimos, tilni tanlang:",
        "main_menu": "📋 Asosiy menyu:",
        "submit_article": "📝 Maqola yuborish",
        "rules": "📋 Qoidalar",
        "contact": "📞 Aloqa",
        "change_lang": "🌐 Tilni o'zgartirish",
        "ask_title": "📝 Maqola nomini kiriting:",
        "ask_authors": "👥 Mualliflar ismini kiriting (vergul bilan ajrating):",
        "ask_annotation": "📄 Annotatsiyani kiriting:",
        "ask_file": "📎 Maqola faylini yuboring (PDF yoki Word):",
        "ask_plagiat": "📊 Plagiat hisobotini yuboring yoki o'tkazib yuboring:",
        "skip": "⏭ O'tkazib yuborish",
        "cancel": "❌ Bekor qilish",
        "submitted": "✅ Maqolangiz muvaffaqiyatli yuborildi! Tez orada javob beramiz.",
        "rules_text": "📋 *Qoidalar*\n\n1. Maqola ilmiy bo'lishi kerak\n2. Plagiat 15% dan oshmasligi kerak\n3. Hajmi 5-15 sahifa\n4. Format: APA 7",
        "contact_text": "📞 *Aloqa*\n\nEmail: info@rum.uz\nTelegram: @rum_admin",
        "admin_header": "📨 *Yangi maqola yuborildi!*\n\n",
        "article_file_caption": "📎 *Maqola fayli*",
        "plagiat_caption": "📊 *Plagiat hisoboti*",
        "ai_unavailable": "AI xizmati hozircha sozlanmagan. Keyinroq urinib ko'ring.",
        "ai_connection_error": "Ulanishda muammo yuz berdi. Keyinroq qayta urinib ko'ring.",
        "ai_service_error": "AI xizmatidan javob olinmadi. Keyinroq qayta urinib ko'ring.",
        "ai_empty_error": "Javob olinmadi. Qayta urinib ko'ring.",
    },
    "ru": {
        "welcome": "👋 Добро пожаловать в бот RUM Publishing!\n\nПожалуйста, выберите язык:",
        "main_menu": "📋 Главное меню:",
        "submit_article": "📝 Отправить статью",
        "rules": "📋 Правила",
        "contact": "📞 Контакты",
        "change_lang": "🌐 Сменить язык",
        "ask_title": "📝 Введите название статьи:",
        "ask_authors": "👥 Введите имена авторов (через запятую):",
        "ask_annotation": "📄 Введите аннотацию:",
        "ask_file": "📎 Отправьте файл статьи (PDF или Word):",
        "ask_plagiat": "📊 Отправьте отчёт о плагиате или пропустите:",
        "skip": "⏭ Пропустить",
        "cancel": "❌ Отмена",
        "submitted": "✅ Ваша статья успешно отправлена! Ответим в ближайшее время.",
        "rules_text": "📋 *Правила*\n\n1. Статья должна быть научной\n2. Плагиат не более 15%\n3. Объём 5-15 страниц\n4. Формат: APA 7",
        "contact_text": "📞 *Контакты*\n\nEmail: info@rum.uz\nTelegram: @rum_admin",
        "admin_header": "📨 *Новая статья отправлена!*\n\n",
        "article_file_caption": "📎 *Файл статьи*",
        "plagiat_caption": "📊 *Отчёт о плагиате*",
        "ai_unavailable": "AI сервис пока не настроен. Попробуйте позже.",
        "ai_connection_error": "Проблема с подключением. Попробуйте позже.",
        "ai_service_error": "Ответ от AI сервиса не получен. Попробуйте позже.",
        "ai_empty_error": "Ответ не получен. Попробуйте ещё раз.",
    },
    "en": {
        "welcome": "👋 Welcome to RUM Publishing bot!\n\nPlease select your language:",
        "main_menu": "📋 Main menu:",
        "submit_article": "📝 Submit Article",
        "rules": "📋 Rules",
        "contact": "📞 Contact",
        "change_lang": "🌐 Change Language",
        "ask_title": "📝 Enter article title:",
        "ask_authors": "👥 Enter author names (comma separated):",
        "ask_annotation": "📄 Enter annotation:",
        "ask_file": "📎 Send article file (PDF or Word):",
        "ask_plagiat": "📊 Send plagiarism report or skip:",
        "skip": "⏭ Skip",
        "cancel": "❌ Cancel",
        "submitted": "✅ Your article has been submitted! We will respond shortly.",
        "rules_text": "📋 *Rules*\n\n1. Article must be scientific\n2. Plagiarism no more than 15%\n3. Length: 5-15 pages\n4. Format: APA 7",
        "contact_text": "📞 *Contact*\n\nEmail: info@rum.uz\nTelegram: @rum_admin",
        "admin_header": "📨 *New article submitted!*\n\n",
        "article_file_caption": "📎 *Article file*",
        "plagiat_caption": "📊 *Plagiarism report*",
        "ai_unavailable": "The AI service is not configured yet. Please try again later.",
        "ai_connection_error": "Connection problem. Please try again later.",
        "ai_service_error": "No response from the AI service. Please try again later.",
        "ai_empty_error": "No response received. Please try again.",
    },
}

STATE_SELECT_LANG = "select_lang"
STATE_MAIN_MENU = "main_menu"
STATE_ARTICLE_TITLE = "article_title"
STATE_ARTICLE_AUTHORS = "article_authors"
STATE_ARTICLE_ANNOTATION = "article_annotation"
STATE_ARTICLE_FILE = "article_file"
STATE_ARTICLE_PLAGIAT = "article_plagiat"


def normalize_lang(value):
    value = (value or "uz").strip().lower()
    return value if value in {"uz", "ru", "en"} else "uz"


def normalize_journal(value):
    value = (value or "DEFAULT").strip().upper()
    return value if value in {"ITJ", "ME", "IE", "RUM", "DEFAULT"} else "DEFAULT"


def get_prompt_candidates(journal, lang):
    journal = journal.lower()
    return [
        os.path.join(PROMPT_DIR, f"{journal}_{lang}.txt"),
        os.path.join(PROMPT_DIR, f"{journal}_uz.txt"),
        os.path.join(PROMPT_DIR, f"default_{lang}.txt"),
        os.path.join(PROMPT_DIR, "default_uz.txt"),
    ]


def load_prompt(journal, lang):
    for file_path in get_prompt_candidates(journal, lang):
        if os.path.isfile(file_path):
            with open(file_path, "r", encoding="utf-8") as handle:
                content = handle.read().strip()
            if content:
                return content
    return "You are an official AI assistant for a scientific journal. Answer clearly, briefly, and only within official journal information."


def make_ai_error(lang, key):
    return TEXTS[lang].get(key, TEXTS["uz"][key])


def ask_openai(message, prompt, lang):
    if not OPENAI_API_KEY:
        return False, make_ai_error(lang, "ai_unavailable")

    payload = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": message},
        ],
        "temperature": 0.3,
    }

    try:
        response = req.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENAI_API_KEY}",
            },
            json=payload,
            timeout=60,
        )
    except req.RequestException:
        return False, make_ai_error(lang, "ai_connection_error")

    if response.status_code >= 400:
        return False, make_ai_error(lang, "ai_service_error")

    data = response.json()
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
    if not content:
        return False, make_ai_error(lang, "ai_empty_error")

    return True, content


def api(method, **kwargs):
    if not API_URL:
        return None
    return req.post(
        f"{API_URL}/{method}",
        data={k: (json.dumps(v) if isinstance(v, dict) else v) for k, v in kwargs.items()},
        timeout=30,
    )


def send_msg(chat_id, text, keyboard=None):
    kwargs = {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}
    if keyboard:
        kwargs["reply_markup"] = keyboard
    api("sendMessage", **kwargs)


def send_doc(chat_id, file_id, caption=None):
    kwargs = {"chat_id": chat_id, "document": file_id}
    if caption:
        kwargs["caption"] = caption
        kwargs["parse_mode"] = "Markdown"
    api("sendDocument", **kwargs)


def lang_keyboard():
    return {"inline_keyboard": [[
        {"text": "🇺🇿 O'zbek", "callback_data": "lang_uz"},
        {"text": "🇷🇺 Русский", "callback_data": "lang_ru"},
        {"text": "🇬🇧 English", "callback_data": "lang_en"},
    ]]}


def main_menu_keyboard(lang):
    t = TEXTS[lang]
    return {"inline_keyboard": [
        [{"text": t["submit_article"], "callback_data": "submit_article"}],
        [{"text": t["rules"], "callback_data": "rules"}],
        [{"text": t["contact"], "callback_data": "contact"}],
        [{"text": t["change_lang"], "callback_data": "change_lang"}],
    ]}


def cancel_keyboard(lang):
    return {"inline_keyboard": [[{"text": TEXTS[lang]["cancel"], "callback_data": "cancel"}]]}


def skip_cancel_keyboard(lang):
    t = TEXTS[lang]
    return {"inline_keyboard": [[
        {"text": t["skip"], "callback_data": "skip"},
        {"text": t["cancel"], "callback_data": "cancel"},
    ]]}


def get_state(user_id):
    if user_id not in user_states:
        user_states[user_id] = {"lang": "uz", "state": STATE_SELECT_LANG, "data": {}}
    return user_states[user_id]


def show_main_menu(chat_id, user_id):
    lang = get_state(user_id)["lang"]
    user_states[user_id]["state"] = STATE_MAIN_MENU
    send_msg(chat_id, TEXTS[lang]["main_menu"], keyboard=main_menu_keyboard(lang))


def forward_to_admin(user_id, username, data, lang):
    t = TEXTS[lang]
    lang_names = {"uz": "O'zbek 🇺🇿", "ru": "Русский 🇷🇺", "en": "English 🇬🇧"}
    text = (
        t["admin_header"]
        + f"👤 *Muallif:* @{username or 'noname'}\n"
        + f"🆔 *ID:* `{user_id}`\n"
        + f"🌐 *Til:* {lang_names.get(lang, lang)}\n\n"
        + f"📝 *Maqola nomi:*\n{data.get('title', '-')}\n\n"
        + f"👥 *Mualliflar:*\n{data.get('authors', '-')}\n\n"
        + f"📄 *Annotatsiya:*\n{data.get('annotation', '-')}"
    )
    send_msg(ADMIN_GROUP_ID, text)
    if data.get("article_file"):
        send_doc(ADMIN_GROUP_ID, data["article_file"], caption=t["article_file_caption"])
    if data.get("plagiat_file"):
        send_doc(ADMIN_GROUP_ID, data["plagiat_file"], caption=t["plagiat_caption"])


def handle_callback(chat_id, user_id, username, cb_data, cb_id):
    api("answerCallbackQuery", callback_query_id=cb_id)
    state = get_state(user_id)
    lang = state["lang"]
    t = TEXTS[lang]

    if cb_data.startswith("lang_"):
        new_lang = cb_data.split("_")[1]
        user_states[user_id]["lang"] = new_lang
        user_states[user_id]["state"] = STATE_MAIN_MENU
        send_msg(chat_id, TEXTS[new_lang]["main_menu"], keyboard=main_menu_keyboard(new_lang))
    elif cb_data == "change_lang":
        user_states[user_id]["state"] = STATE_SELECT_LANG
        send_msg(chat_id, TEXTS["uz"]["welcome"], keyboard=lang_keyboard())
    elif cb_data == "submit_article":
        user_states[user_id]["data"] = {}
        user_states[user_id]["state"] = STATE_ARTICLE_TITLE
        send_msg(chat_id, f"*{t['submit_article']}* (1/5)\n\n{t['ask_title']}", keyboard=cancel_keyboard(lang))
    elif cb_data == "rules":
        send_msg(chat_id, t["rules_text"])
        show_main_menu(chat_id, user_id)
    elif cb_data == "contact":
        send_msg(chat_id, t["contact_text"])
        show_main_menu(chat_id, user_id)
    elif cb_data == "cancel":
        user_states[user_id]["data"] = {}
        show_main_menu(chat_id, user_id)
    elif cb_data == "skip" and state["state"] == STATE_ARTICLE_PLAGIAT:
        forward_to_admin(user_id, username, state["data"], lang)
        user_states[user_id]["data"] = {}
        user_states[user_id]["state"] = STATE_MAIN_MENU
        send_msg(chat_id, t["submitted"])
        show_main_menu(chat_id, user_id)


def handle_message(chat_id, user_id, username, text, document):
    state = get_state(user_id)
    current_state = state["state"]
    lang = state["lang"]
    t = TEXTS[lang]

    if current_state == STATE_ARTICLE_TITLE and text:
        user_states[user_id]["data"]["title"] = text
        user_states[user_id]["state"] = STATE_ARTICLE_AUTHORS
        send_msg(chat_id, f"*{t['submit_article']}* (2/5)\n\n{t['ask_authors']}", keyboard=cancel_keyboard(lang))
    elif current_state == STATE_ARTICLE_AUTHORS and text:
        user_states[user_id]["data"]["authors"] = text
        user_states[user_id]["state"] = STATE_ARTICLE_ANNOTATION
        send_msg(chat_id, f"*{t['submit_article']}* (3/5)\n\n{t['ask_annotation']}", keyboard=cancel_keyboard(lang))
    elif current_state == STATE_ARTICLE_ANNOTATION and text:
        user_states[user_id]["data"]["annotation"] = text
        user_states[user_id]["state"] = STATE_ARTICLE_FILE
        send_msg(chat_id, f"*{t['submit_article']}* (4/5)\n\n{t['ask_file']}", keyboard=cancel_keyboard(lang))
    elif current_state == STATE_ARTICLE_FILE and document:
        user_states[user_id]["data"]["article_file"] = document
        user_states[user_id]["state"] = STATE_ARTICLE_PLAGIAT
        send_msg(chat_id, f"*{t['submit_article']}* (5/5)\n\n{t['ask_plagiat']}", keyboard=skip_cancel_keyboard(lang))
    elif current_state == STATE_ARTICLE_PLAGIAT and document:
        user_states[user_id]["data"]["plagiat_file"] = document
        forward_to_admin(user_id, username, state["data"], lang)
        user_states[user_id]["data"] = {}
        user_states[user_id]["state"] = STATE_MAIN_MENU
        send_msg(chat_id, t["submitted"])
        show_main_menu(chat_id, user_id)
    else:
        show_main_menu(chat_id, user_id)


def build_cors_preflight_response():
    response = make_response("", 204)
    add_cors_headers(response)
    return response


def add_cors_headers(response):
    origin = request.headers.get("Origin", "")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/")
def index():
    return "RUM bot is running."


@app.route("/api/ai", methods=["POST", "OPTIONS"])
def ai_api():
    if request.method == "OPTIONS":
        return build_cors_preflight_response()

    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()
    journal = normalize_journal(data.get("journal"))
    lang = normalize_lang(data.get("lang"))

    if not message:
        response = jsonify({"error": "Empty message"})
        response.status_code = 400
        return add_cors_headers(response)

    prompt = load_prompt(journal, lang)
    ok, reply = ask_openai(message, prompt, lang)
    status = 200 if ok else 503
    response = jsonify({
        "reply": reply,
        "journal": journal,
        "lang": lang,
    })
    response.status_code = status
    return add_cors_headers(response)


@app.route(f"/webhook/{WEBHOOK_SECRET}", methods=["POST"])
def webhook():
    data = request.get_json(force=True)

    if "callback_query" in data:
        cq = data["callback_query"]
        handle_callback(
            chat_id=cq["message"]["chat"]["id"],
            user_id=cq["from"]["id"],
            username=cq["from"].get("username"),
            cb_data=cq["data"],
            cb_id=cq["id"],
        )
        return "ok", 200

    message = data.get("message", {})
    if not message:
        return "ok", 200

    chat = message.get("chat", {})
    if chat.get("type") != "private":
        return "ok", 200

    chat_id = chat.get("id")
    user = message.get("from", {})
    user_id = user.get("id")
    username = user.get("username")
    text = message.get("text", "")
    document = message.get("document", {}).get("file_id") if message.get("document") else None

    if not chat_id or not user_id:
        return "ok", 200

    if text == "/start":
        user_states[user_id] = {"lang": "uz", "state": STATE_SELECT_LANG, "data": {}}
        send_msg(chat_id, TEXTS["uz"]["welcome"], keyboard=lang_keyboard())
    else:
        handle_message(chat_id, user_id, username, text, document)

    return "ok", 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
