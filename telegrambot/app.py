from flask import Flask, jsonify, make_response, request
import html
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

STATE_SELECT_LANG = "select_lang"
STATE_MAIN_MENU = "main_menu"
STATE_ARTICLE_TITLE = "article_title"
STATE_ARTICLE_AUTHORS = "article_authors"
STATE_ARTICLE_ANNOTATION = "article_annotation"
STATE_ARTICLE_FILE = "article_file"
STATE_ARTICLE_PLAGIAT = "article_plagiat"
STATE_CONTACT_MESSAGE = "contact_message"

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
        "contact_prompt": (
            "📞 <b>Aloqa</b>\n\n"
            "🌐 Sayt: https://rum-journal.com\n"
            "📧 Email: info@rum-journal.com\n"
            "📞 Telefon: +998 90 673 64 33\n"
            "📣 Telegram: @rum_journal\n\n"
            "Admin guruhga yuborish uchun xabaringizni yozing."
        ),
        "contact_sent": "✅ Xabaringiz admin guruhga yuborildi.",
        "rules_text": (
            "📋 <b>Qoidalar</b>\n\n"
            "• Maqola jurnal yo'nalishiga mos bo'lishi kerak\n"
            "• Yuborish sayt yoki bot orqali amalga oshiriladi\n"
            "• Barcha maqolalar double-blind peer review asosida ko'rib chiqiladi\n"
            "• Batafsil talablar: https://rum-journal.com/index.php/RUM/en/about/submissions"
        ),
        "skip": "⏭ O'tkazib yuborish",
        "cancel": "❌ Bekor qilish",
        "submitted": "✅ Maqolangiz muvaffaqiyatli yuborildi! Tez orada javob beramiz.",
        "admin_header": "📨 <b>Yangi murojaat / maqola</b>",
        "article_file_caption": "📎 <b>Maqola fayli</b>",
        "plagiat_caption": "📊 <b>Plagiat hisoboti</b>",
        "contact_message_caption": "📩 <b>Foydalanuvchi murojaati</b>",
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
        "contact_prompt": (
            "📞 <b>Контакты</b>\n\n"
            "🌐 Сайт: https://rum-journal.com\n"
            "📧 Email: info@rum-journal.com\n"
            "📞 Телефон: +998 90 673 64 33\n"
            "📣 Telegram: @rum_journal\n\n"
            "Напишите сообщение, и оно будет отправлено в группу администраторов."
        ),
        "contact_sent": "✅ Ваше сообщение отправлено в группу администраторов.",
        "rules_text": (
            "📋 <b>Правила</b>\n\n"
            "• Статья должна соответствовать тематике журнала\n"
            "• Подача выполняется через сайт или бот\n"
            "• Все статьи проходят double-blind peer review\n"
            "• Подробные требования: https://rum-journal.com/index.php/RUM/en/about/submissions"
        ),
        "skip": "⏭ Пропустить",
        "cancel": "❌ Отмена",
        "submitted": "✅ Ваша статья успешно отправлена! Мы свяжемся с вами в ближайшее время.",
        "admin_header": "📨 <b>Новая заявка / статья</b>",
        "article_file_caption": "📎 <b>Файл статьи</b>",
        "plagiat_caption": "📊 <b>Отчёт о плагиате</b>",
        "contact_message_caption": "📩 <b>Сообщение пользователя</b>",
        "ai_unavailable": "AI сервис пока не настроен. Попробуйте позже.",
        "ai_connection_error": "Проблема с подключением. Попробуйте позже.",
        "ai_service_error": "Ответ от AI сервиса не получен. Попробуйте позже.",
        "ai_empty_error": "Ответ не получен. Попробуйте ещё раз.",
    },
    "en": {
        "welcome": "👋 Welcome to the RUM Publishing bot!\n\nPlease select your language:",
        "main_menu": "📋 Main menu:",
        "submit_article": "📝 Submit Article",
        "rules": "📋 Rules",
        "contact": "📞 Contact",
        "change_lang": "🌐 Change Language",
        "ask_title": "📝 Enter the article title:",
        "ask_authors": "👥 Enter author names (comma separated):",
        "ask_annotation": "📄 Enter the abstract:",
        "ask_file": "📎 Send the article file (PDF or Word):",
        "ask_plagiat": "📊 Send a plagiarism report or skip this step:",
        "contact_prompt": (
            "📞 <b>Contact</b>\n\n"
            "🌐 Website: https://rum-journal.com\n"
            "📧 Email: info@rum-journal.com\n"
            "📞 Phone: +998 90 673 64 33\n"
            "📣 Telegram: @rum_journal\n\n"
            "Write your message and it will be forwarded to the admin group."
        ),
        "contact_sent": "✅ Your message has been sent to the admin group.",
        "rules_text": (
            "📋 <b>Rules</b>\n\n"
            "• The article should match the journal scope\n"
            "• Submission is available via the website or the bot\n"
            "• All articles are reviewed through double-blind peer review\n"
            "• Detailed requirements: https://rum-journal.com/index.php/RUM/en/about/submissions"
        ),
        "skip": "⏭ Skip",
        "cancel": "❌ Cancel",
        "submitted": "✅ Your article has been submitted successfully. We will contact you soon.",
        "admin_header": "📨 <b>New request / article</b>",
        "article_file_caption": "📎 <b>Article file</b>",
        "plagiat_caption": "📊 <b>Plagiarism report</b>",
        "contact_message_caption": "📩 <b>User message</b>",
        "ai_unavailable": "The AI service is not configured yet. Please try again later.",
        "ai_connection_error": "Connection problem. Please try again later.",
        "ai_service_error": "No response from the AI service. Please try again later.",
        "ai_empty_error": "No response received. Please try again.",
    },
}


def normalize_lang(value):
    value = (value or "uz").strip().lower()
    return value if value in {"uz", "ru", "en"} else "uz"


def normalize_journal(value):
    value = (value or "DEFAULT").strip().upper()
    return value if value in {"ITJ", "ME", "IE", "RUM", "DEFAULT"} else "DEFAULT"


def escape_text(value):
    return html.escape(str(value or "-"), quote=False)


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
    kwargs = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    if keyboard:
        kwargs["reply_markup"] = keyboard
    api("sendMessage", **kwargs)


def send_doc(chat_id, file_id, caption=None):
    kwargs = {"chat_id": chat_id, "document": file_id}
    if caption:
        kwargs["caption"] = caption
        kwargs["parse_mode"] = "HTML"
    api("sendDocument", **kwargs)


def lang_keyboard():
    return {
        "inline_keyboard": [[
            {"text": "🇺🇿 O'zbek", "callback_data": "lang_uz"},
            {"text": "🇷🇺 Русский", "callback_data": "lang_ru"},
            {"text": "🇬🇧 English", "callback_data": "lang_en"},
        ]]
    }


def menu_keyboard(lang):
    t = TEXTS[lang]
    return {
        "keyboard": [
            [{"text": t["submit_article"]}],
            [{"text": t["rules"]}, {"text": t["contact"]}],
            [{"text": t["change_lang"]}],
        ],
        "resize_keyboard": True,
        "persistent": True,
    }


def cancel_keyboard(lang, include_skip=False):
    row = []
    if include_skip:
        row.append({"text": TEXTS[lang]["skip"]})
    row.append({"text": TEXTS[lang]["cancel"]})
    return {
        "keyboard": [row],
        "resize_keyboard": True,
        "persistent": True,
    }


def get_state(user_id):
    if user_id not in user_states:
        user_states[user_id] = {"lang": "uz", "state": STATE_SELECT_LANG, "data": {}}
    return user_states[user_id]


def set_main_menu(chat_id, user_id):
    lang = get_state(user_id)["lang"]
    user_states[user_id]["state"] = STATE_MAIN_MENU
    send_msg(chat_id, TEXTS[lang]["main_menu"], keyboard=menu_keyboard(lang))


def build_admin_submission(user_id, username, data, lang):
    lang_names = {"uz": "O'zbek 🇺🇿", "ru": "Русский 🇷🇺", "en": "English 🇬🇧"}
    username_text = f"@{username}" if username else "—"
    return (
        f"{TEXTS[lang]['admin_header']}\n\n"
        f"👤 <b>Muallif:</b> {escape_text(username_text)}\n"
        f"🆔 <b>ID:</b> <code>{user_id}</code>\n"
        f"🌐 <b>Til:</b> {escape_text(lang_names.get(lang, lang))}\n\n"
        f"📝 <b>Maqola nomi:</b>\n{escape_text(data.get('title'))}\n\n"
        f"👥 <b>Mualliflar:</b>\n{escape_text(data.get('authors'))}\n\n"
        f"📄 <b>Annotatsiya:</b>\n{escape_text(data.get('annotation'))}"
    )


def build_file_caption(prefix, data):
    return (
        f"{prefix}\n\n"
        f"<b>Maqola:</b> {escape_text(data.get('title'))}\n"
        f"<b>Mualliflar:</b> {escape_text(data.get('authors'))}"
    )


def build_contact_forward(user_id, username, message, lang):
    lang_names = {"uz": "O'zbek 🇺🇿", "ru": "Русский 🇷🇺", "en": "English 🇬🇧"}
    username_text = f"@{username}" if username else "—"
    return (
        f"{TEXTS[lang]['contact_message_caption']}\n\n"
        f"👤 <b>Foydalanuvchi:</b> {escape_text(username_text)}\n"
        f"🆔 <b>ID:</b> <code>{user_id}</code>\n"
        f"🌐 <b>Til:</b> {escape_text(lang_names.get(lang, lang))}\n\n"
        f"💬 <b>Xabar:</b>\n{escape_text(message)}"
    )


def forward_submission_to_admin(user_id, username, data, lang):
    if not ADMIN_GROUP_ID:
        return
    send_msg(ADMIN_GROUP_ID, build_admin_submission(user_id, username, data, lang))
    if data.get("article_file"):
        send_doc(ADMIN_GROUP_ID, data["article_file"], caption=build_file_caption(TEXTS[lang]["article_file_caption"], data))
    if data.get("plagiat_file"):
        send_doc(ADMIN_GROUP_ID, data["plagiat_file"], caption=build_file_caption(TEXTS[lang]["plagiat_caption"], data))


def forward_contact_to_admin(user_id, username, message, lang):
    if not ADMIN_GROUP_ID:
        return
    send_msg(ADMIN_GROUP_ID, build_contact_forward(user_id, username, message, lang))


def handle_callback(chat_id, user_id, cb_data):
    if cb_data.startswith("lang_"):
        new_lang = cb_data.split("_", 1)[1]
        user_states[user_id] = {"lang": new_lang, "state": STATE_MAIN_MENU, "data": {}}
        send_msg(chat_id, TEXTS[new_lang]["main_menu"], keyboard=menu_keyboard(new_lang))


def handle_text_message(chat_id, user_id, username, text):
    state = get_state(user_id)
    lang = state["lang"]
    t = TEXTS[lang]

    if text == t["change_lang"]:
        user_states[user_id]["state"] = STATE_SELECT_LANG
        send_msg(chat_id, TEXTS["uz"]["welcome"], keyboard=lang_keyboard())
        return

    if text == t["cancel"]:
        user_states[user_id]["data"] = {}
        set_main_menu(chat_id, user_id)
        return

    if state["state"] == STATE_MAIN_MENU:
        if text == t["submit_article"]:
            user_states[user_id]["data"] = {}
            user_states[user_id]["state"] = STATE_ARTICLE_TITLE
            send_msg(chat_id, t["ask_title"], keyboard=cancel_keyboard(lang))
            return
        if text == t["rules"]:
            send_msg(chat_id, t["rules_text"], keyboard=menu_keyboard(lang))
            return
        if text == t["contact"]:
            user_states[user_id]["state"] = STATE_CONTACT_MESSAGE
            send_msg(chat_id, t["contact_prompt"], keyboard=cancel_keyboard(lang))
            return

        prompt = load_prompt("RUM", lang)
        _, reply = ask_openai(text, prompt, lang)
        send_msg(chat_id, reply, keyboard=menu_keyboard(lang))
        return

    if state["state"] == STATE_CONTACT_MESSAGE:
        forward_contact_to_admin(user_id, username, text, lang)
        send_msg(chat_id, t["contact_sent"], keyboard=menu_keyboard(lang))
        user_states[user_id]["state"] = STATE_MAIN_MENU
        return

    if state["state"] == STATE_ARTICLE_TITLE:
        user_states[user_id]["data"]["title"] = text
        user_states[user_id]["state"] = STATE_ARTICLE_AUTHORS
        send_msg(chat_id, t["ask_authors"], keyboard=cancel_keyboard(lang))
        return

    if state["state"] == STATE_ARTICLE_AUTHORS:
        user_states[user_id]["data"]["authors"] = text
        user_states[user_id]["state"] = STATE_ARTICLE_ANNOTATION
        send_msg(chat_id, t["ask_annotation"], keyboard=cancel_keyboard(lang))
        return

    if state["state"] == STATE_ARTICLE_ANNOTATION:
        user_states[user_id]["data"]["annotation"] = text
        user_states[user_id]["state"] = STATE_ARTICLE_FILE
        send_msg(chat_id, t["ask_file"], keyboard=cancel_keyboard(lang))
        return

    if state["state"] == STATE_ARTICLE_PLAGIAT and text == t["skip"]:
        forward_submission_to_admin(user_id, username, state["data"], lang)
        user_states[user_id] = {"lang": lang, "state": STATE_MAIN_MENU, "data": {}}
        send_msg(chat_id, t["submitted"], keyboard=menu_keyboard(lang))
        return

    set_main_menu(chat_id, user_id)


def handle_document_message(chat_id, user_id, username, file_id):
    state = get_state(user_id)
    lang = state["lang"]
    t = TEXTS[lang]

    if state["state"] == STATE_ARTICLE_FILE:
        user_states[user_id]["data"]["article_file"] = file_id
        user_states[user_id]["state"] = STATE_ARTICLE_PLAGIAT
        send_msg(chat_id, t["ask_plagiat"], keyboard=cancel_keyboard(lang, include_skip=True))
        return

    if state["state"] == STATE_ARTICLE_PLAGIAT:
        user_states[user_id]["data"]["plagiat_file"] = file_id
        forward_submission_to_admin(user_id, username, state["data"], lang)
        user_states[user_id] = {"lang": lang, "state": STATE_MAIN_MENU, "data": {}}
        send_msg(chat_id, t["submitted"], keyboard=menu_keyboard(lang))
        return

    set_main_menu(chat_id, user_id)


def build_cors_preflight_response():
    response = make_response("", 204)
    return add_cors_headers(response)


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
    response = jsonify({"reply": reply, "journal": journal, "lang": lang})
    response.status_code = 200 if ok else 503
    return add_cors_headers(response)


@app.route(f"/webhook/{WEBHOOK_SECRET}", methods=["POST"])
def webhook():
    data = request.get_json(force=True)

    if "callback_query" in data:
        cq = data["callback_query"]
        api("answerCallbackQuery", callback_query_id=cq["id"])
        handle_callback(
            chat_id=cq["message"]["chat"]["id"],
            user_id=cq["from"]["id"],
            cb_data=cq["data"],
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
    text = (message.get("text") or "").strip()
    document = message.get("document", {}).get("file_id") if message.get("document") else None

    if not chat_id or not user_id:
        return "ok", 200

    if text == "/start":
        user_states[user_id] = {"lang": "uz", "state": STATE_SELECT_LANG, "data": {}}
        send_msg(chat_id, TEXTS["uz"]["welcome"], keyboard=lang_keyboard())
        return "ok", 200

    if document:
        handle_document_message(chat_id, user_id, username, document)
        return "ok", 200

    if text:
        handle_text_message(chat_id, user_id, username, text)
        return "ok", 200

    set_main_menu(chat_id, user_id)
    return "ok", 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
