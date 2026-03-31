(function () {
  if (document.getElementById("rumHelpWrap")) return;

  const BRAND_1 = "#102542";
  const BRAND_2 = "#1f5b92";
  const NUDGE_DELAY_MS = 10000;
  const NUDGE_KEY = "rum_ai_widget_nudge_v1";

  function detectLang() {
    const raw = (document.documentElement.lang || "uz").toLowerCase();
    if (raw.startsWith("ru")) return "ru";
    if (raw.startsWith("en")) return "en";
    return "uz";
  }

  const LANG = detectLang();

  const CONFIG = {
    title: {
      uz: "Renaissance of Universal Mind — AI",
      ru: "Renaissance of Universal Mind — AI",
      en: "Renaissance of Universal Mind — AI"
    },
    webAi: {
      uz: "https://rum-journal.com/ai/rum_widget.html",
      ru: "https://rum-journal.com/ai/rum_widget.html",
      en: "https://rum-journal.com/ai/rum_widget.html"
    },
    tgBot: "https://t.me/rum_editorial_bot",
    tgBotLabel: "@rum_editorial_bot",
    adminUrl: "https://t.me/rum_journal",
    adminLabel: "@rum_journal",
    phoneRaw: "+998906736433",
    phoneLabel: "+998 90 673 64 33",
    logo: "https://rum-journal.com/public/logo.png"
  };

  const WEB_AI_URL = CONFIG.webAi[LANG] || CONFIG.webAi.uz;
  const TG_AI_BOT = CONFIG.tgBot;
  const TG_AI_LABEL = CONFIG.tgBotLabel;
  const TG_ADMIN_URL = CONFIG.adminUrl;
  const PHONE_HREF = "tel:" + CONFIG.phoneRaw;
  const PHONE_LABEL = CONFIG.phoneLabel;
  const LOGO_URL = CONFIG.logo;
  const HEADER_TITLE = CONFIG.title[LANG] || CONFIG.title.uz;

  const I18N = {
    uz: {
      help: "Yordam",
      webAiTitle: "AI yordamchi (saytda)",
      webAiSub: "Savollarga tezkor javob",
      tgAiTitle: "Telegram botga yozish",
      tgAiSub: TG_AI_LABEL,
      adminTitle: "Rasmiy Telegram sahifa",
      adminSub: CONFIG.adminLabel,
      phoneTitle: "Telefon orqali bog'lanish",
      phoneSub: PHONE_LABEL,
      headerTitle: HEADER_TITLE,
      closeLabel: "Yopish",
      nudge: "Sizga qanday yordam bera olamiz?"
    },
    ru: {
      help: "Помощь",
      webAiTitle: "AI помощник (на сайте)",
      webAiSub: "Быстрые ответы на вопросы",
      tgAiTitle: "Написать в Telegram бот",
      tgAiSub: TG_AI_LABEL,
      adminTitle: "Официальный Telegram",
      adminSub: CONFIG.adminLabel,
      phoneTitle: "Позвонить",
      phoneSub: PHONE_LABEL,
      headerTitle: HEADER_TITLE,
      closeLabel: "Закрыть",
      nudge: "Чем мы можем помочь?"
    },
    en: {
      help: "Help",
      webAiTitle: "AI assistant (on site)",
      webAiSub: "Quick answers to questions",
      tgAiTitle: "Message Telegram bot",
      tgAiSub: TG_AI_LABEL,
      adminTitle: "Official Telegram",
      adminSub: CONFIG.adminLabel,
      phoneTitle: "Call",
      phoneSub: PHONE_LABEL,
      headerTitle: HEADER_TITLE,
      closeLabel: "Close",
      nudge: "How can we help you?"
    }
  };

  const T = I18N[LANG] || I18N.uz;

  const ICON = {
    robot: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M10 3h4v2h3a3 3 0 0 1 3 3v8a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V8a3 3 0 0 1 3-3h3V3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 11h0M16 11h0" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M9 16h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    telegram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21.8 5.1 3.5 12.4c-1 .4-.9 1.8.2 2.1l4.7 1.5 1.7 5.3c.3 1.1 1.7 1.2 2.2.2l2.6-4.6 4.9 3.6c.9.7 2.2.2 2.4-1l2.2-13.2c.2-1.2-1-2.2-2.2-1.6Z" fill="currentColor"/></svg>',
    user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" stroke="currentColor" stroke-width="2"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    phone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6.5 3.5 9 3c.6-.1 1.2.2 1.4.8l1.2 3.2c.2.6 0 1.2-.5 1.6l-1.6 1.2c1.1 2.4 3 4.3 5.4 5.4l1.2-1.6c.4-.5 1-.7 1.6-.5l3.2 1.2c.6.2.9.8.8 1.4l-.5 2.5c-.1.7-.8 1.1-1.5 1.1C11.1 20.5 3.5 12.9 3.5 5c0-.7.4-1.4 1.1-1.5Z" fill="currentColor"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>'
  };

  const wrap = document.createElement("div");
  wrap.id = "rumHelpWrap";
  wrap.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:99999;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;";

  wrap.innerHTML = `
    <style>
      #rumHelpWrap * { box-sizing: border-box; }
      .rum-nudge {
        display: none;
        position: absolute;
        right: 0; bottom: 86px;
        max-width: 260px;
        background: #fff;
        border: 1px solid rgba(0,0,0,.12);
        border-radius: 14px;
        box-shadow: 0 14px 40px rgba(0,0,0,.18);
        padding: 10px 12px;
        cursor: pointer;
        animation: rumPop .45s ease-out;
      }
      .rum-nudge::after {
        content: "";
        position: absolute;
        right: 22px; bottom: -10px;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid #fff;
        filter: drop-shadow(0 2px 0 rgba(0,0,0,.08));
      }
      .rum-nudge-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }
      .rum-nudge-text { font-size: 13px; font-weight: 800; color: #0f172a; line-height: 1.2; }
      .rum-nudge-close {
        border: 0;
        background: rgba(0,0,0,.06);
        width: 28px; height: 28px;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .rum-nudge-close:hover { background: rgba(0,0,0,.10); }
      @keyframes rumPop {
        from { transform: translateY(8px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .rum-menu { display: none; margin-bottom: 10px; }
      .rum-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 320px;
        padding: 12px;
        border-radius: 14px;
        border: 1px solid rgba(0,0,0,.10);
        background: #fff;
        color: #111;
        text-decoration: none;
        cursor: pointer;
        box-shadow: 0 8px 20px rgba(0,0,0,.10);
        margin-bottom: 10px;
        text-align: left;
        transition: background .15s;
      }
      .rum-item:hover { background: #f0f6ff; }
      .rum-ico {
        width: 34px; height: 34px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(16,37,66,.10);
        color: ${BRAND_1};
        flex: 0 0 auto;
      }
      .rum-title { font-weight: 900; line-height: 1.1; font-size: 14px; }
      .rum-sub { font-size: 12px; opacity: .70; margin-top: 2px; }
      .rum-card {
        width: 360px; height: 520px;
        background: #fff;
        border: 1px solid rgba(0,0,0,.08);
        border-radius: 16px;
        box-shadow: 0 14px 40px rgba(0,0,0,.18);
        overflow: hidden;
      }
      .rum-box { display: none; margin-bottom: 10px; }
      .rum-head {
        background: linear-gradient(135deg, ${BRAND_1}, ${BRAND_2});
        color: #fff;
        padding: 10px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .rum-head-left {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 900;
        font-size: 14px;
      }
      .rum-logo {
        width: 28px; height: 28px;
        border-radius: 50%;
        background: #fff;
        padding: 2px;
        object-fit: contain;
      }
      .rum-close {
        border: 0;
        background: rgba(255,255,255,.18);
        color: #fff;
        width: 34px; height: 34px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .rum-main {
        border: 0;
        border-radius: 999px;
        padding: 12px 20px;
        font-weight: 900;
        font-size: 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #fff;
        background: linear-gradient(135deg, ${BRAND_1}, ${BRAND_2});
        box-shadow: 0 12px 34px rgba(0,0,0,.25);
        position: relative;
      }
      .rum-main img {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: #fff;
        padding: 3px;
        flex: 0 0 auto;
        object-fit: contain;
      }
      .rum-main.rum-attention { animation: rumPulse 1.4s ease-in-out infinite; }
      .rum-main.rum-attention img { animation: rumWiggle 2.8s ease-in-out infinite; }
      @keyframes rumPulse {
        0%,100% { transform: scale(1); box-shadow: 0 12px 34px rgba(0,0,0,.25); }
        50% { transform: scale(1.04); box-shadow: 0 16px 44px rgba(0,0,0,.32); }
      }
      @keyframes rumWiggle {
        0%,100% { transform: rotate(0deg); }
        95% { transform: rotate(-6deg); }
        98% { transform: rotate(6deg); }
      }
      @media (max-width: 420px) {
        .rum-item { width: 290px; }
        .rum-card { width: 320px; height: 500px; }
        .rum-nudge { bottom: 82px; max-width: 230px; }
      }
    </style>

    <div class="rum-nudge" id="rumNudge" role="dialog" aria-live="polite">
      <div class="rum-nudge-top">
        <div class="rum-nudge-text">${T.nudge}</div>
        <button class="rum-nudge-close" id="rumNudgeClose" aria-label="${T.closeLabel}">${ICON.close}</button>
      </div>
    </div>

    <div class="rum-menu" id="rumMenu">
      <button type="button" class="rum-item" id="rumOpenWebAI">
        <span class="rum-ico">${ICON.robot}</span>
        <span>
          <div class="rum-title">${T.webAiTitle}</div>
          <div class="rum-sub">${T.webAiSub}</div>
        </span>
      </button>

      <a class="rum-item" href="${TG_AI_BOT}" target="_blank" rel="noopener noreferrer">
        <span class="rum-ico">${ICON.telegram}</span>
        <span>
          <div class="rum-title">${T.tgAiTitle}</div>
          <div class="rum-sub">${T.tgAiSub}</div>
        </span>
      </a>

      <a class="rum-item" href="${TG_ADMIN_URL}" target="_blank" rel="noopener noreferrer">
        <span class="rum-ico">${ICON.user}</span>
        <span>
          <div class="rum-title">${T.adminTitle}</div>
          <div class="rum-sub">${T.adminSub}</div>
        </span>
      </a>

      <a class="rum-item" href="${PHONE_HREF}">
        <span class="rum-ico">${ICON.phone}</span>
        <span>
          <div class="rum-title">${T.phoneTitle}</div>
          <div class="rum-sub">${T.phoneSub}</div>
        </span>
      </a>
    </div>

    <div class="rum-card rum-box" id="rumBox">
      <div class="rum-head">
        <div class="rum-head-left">
          <img class="rum-logo" src="${LOGO_URL}" alt="RUM logo" />
          <span>${T.headerTitle}</span>
        </div>
        <button type="button" class="rum-close" id="rumClose" aria-label="${T.closeLabel}">${ICON.close}</button>
      </div>
      <iframe src="${WEB_AI_URL}" style="width:100%;height:calc(100% - 52px);border:0;background:#fff;" loading="lazy" title="${T.headerTitle}"></iframe>
    </div>

    <button type="button" class="rum-main rum-attention" id="rumMainBtn">
      <img src="${LOGO_URL}" alt="RUM logo" />
      ${T.help}
    </button>
  `;

  document.body.appendChild(wrap);

  const menu = document.getElementById("rumMenu");
  const box = document.getElementById("rumBox");
  const mainBtn = document.getElementById("rumMainBtn");
  const openWebAI = document.getElementById("rumOpenWebAI");
  const closeBtn = document.getElementById("rumClose");
  const nudge = document.getElementById("rumNudge");
  const nudgeClose = document.getElementById("rumNudgeClose");

  function hideNudge(markShown) {
    nudge.style.display = "none";
    if (markShown) {
      try { localStorage.setItem(NUDGE_KEY, "1"); } catch (e) {}
    }
  }

  function showNudgeOnce() {
    try { if (localStorage.getItem(NUDGE_KEY) === "1") return; } catch (e) {}
    setTimeout(function () {
      if (menu.style.display === "block" || box.style.display === "block") return;
      nudge.style.display = "block";
    }, NUDGE_DELAY_MS);
  }

  nudge.addEventListener("click", function (e) {
    if (e.target.closest("#rumNudgeClose")) return;
    hideNudge(true);
    menu.style.display = "block";
    box.style.display = "none";
    mainBtn.classList.remove("rum-attention");
  });

  nudgeClose.addEventListener("click", function (e) {
    e.stopPropagation();
    hideNudge(true);
  });

  mainBtn.addEventListener("click", function () {
    const opening = menu.style.display !== "block";
    menu.style.display = opening ? "block" : "none";
    if (opening) box.style.display = "none";
    hideNudge(true);
    mainBtn.classList.remove("rum-attention");
  });

  openWebAI.addEventListener("click", function () {
    menu.style.display = "none";
    box.style.display = "block";
  });

  closeBtn.addEventListener("click", function () {
    box.style.display = "none";
  });

  document.addEventListener("click", function (e) {
    if (!wrap.contains(e.target)) {
      menu.style.display = "none";
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      menu.style.display = "none";
      box.style.display = "none";
      nudge.style.display = "none";
    }
  });

  showNudgeOnce();
})();