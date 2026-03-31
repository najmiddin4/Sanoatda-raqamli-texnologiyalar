(function () {
  if (document.getElementById("rumHelpWrap")) return;

  const BRAND_1 = "#102542";
  const BRAND_2 = "#245f97";
  const NUDGE_DELAY_MS = 9000;
  const NUDGE_KEY = "rum_ai_widget_nudge_v2";
  const STATIC_BASE = "https://archive.srt-journal.uz/telegrambot/widgets/rum_widget.html";

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
      uz: STATIC_BASE + "?lang=uz",
      ru: STATIC_BASE + "?lang=ru",
      en: STATIC_BASE + "?lang=en"
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
  const TG_ADMIN_URL = CONFIG.adminUrl;
  const PHONE_HREF = "tel:" + CONFIG.phoneRaw;
  const LOGO_URL = CONFIG.logo;
  const HEADER_TITLE = CONFIG.title[LANG] || CONFIG.title.uz;

  const I18N = {
    uz: {
      help: "Yordam",
      webAiTitle: "AI yordamchi",
      webAiSub: "Saytda tezkor javoblar",
      tgAiTitle: "Telegram bot",
      tgAiSub: CONFIG.tgBotLabel,
      adminTitle: "Rasmiy kanal",
      adminSub: CONFIG.adminLabel,
      phoneTitle: "Telefon",
      phoneSub: CONFIG.phoneLabel,
      closeLabel: "Yopish",
      nudge: "Savolingiz bormi? RUM yordamchisidan foydalaning.",
      chip: "RUM"
    },
    ru: {
      help: "Помощь",
      webAiTitle: "AI помощник",
      webAiSub: "Быстрые ответы на сайте",
      tgAiTitle: "Telegram бот",
      tgAiSub: CONFIG.tgBotLabel,
      adminTitle: "Официальный канал",
      adminSub: CONFIG.adminLabel,
      phoneTitle: "Телефон",
      phoneSub: CONFIG.phoneLabel,
      closeLabel: "Закрыть",
      nudge: "Есть вопрос? Откройте помощник RUM.",
      chip: "RUM"
    },
    en: {
      help: "Help",
      webAiTitle: "AI assistant",
      webAiSub: "Quick on-site answers",
      tgAiTitle: "Telegram bot",
      tgAiSub: CONFIG.tgBotLabel,
      adminTitle: "Official channel",
      adminSub: CONFIG.adminLabel,
      phoneTitle: "Phone",
      phoneSub: CONFIG.phoneLabel,
      closeLabel: "Close",
      nudge: "Need guidance? Open the RUM assistant.",
      chip: "RUM"
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
  wrap.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:99999;font-family:Inter,Segoe UI,Arial,sans-serif;";

  wrap.innerHTML = `
    <style>
      #rumHelpWrap * { box-sizing: border-box; }
      .rum-nudge {
        display: none;
        position: absolute;
        right: 4px;
        bottom: 92px;
        width: 250px;
        padding: 14px 14px 12px;
        border-radius: 20px;
        color: #0e1a2b;
        background: rgba(255,255,255,.92);
        border: 1px solid rgba(14,26,43,.08);
        box-shadow: 0 24px 60px rgba(15,39,71,.16);
        backdrop-filter: blur(18px);
        animation: rumFloatIn .3s ease;
      }
      .rum-nudge::after {
        content: "";
        position: absolute;
        right: 26px;
        bottom: -10px;
        width: 18px;
        height: 18px;
        background: rgba(255,255,255,.92);
        border-right: 1px solid rgba(14,26,43,.08);
        border-bottom: 1px solid rgba(14,26,43,.08);
        transform: rotate(45deg);
      }
      .rum-nudge-top { display: flex; align-items: flex-start; gap: 10px; }
      .rum-nudge-copy { flex: 1 1 auto; }
      .rum-nudge-chip {
        display: inline-flex;
        margin-bottom: 6px;
        padding: 5px 8px;
        border-radius: 999px;
        background: rgba(36,95,151,.10);
        color: #245f97;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .14em;
        text-transform: uppercase;
      }
      .rum-nudge-text { font-size: 13px; line-height: 1.45; font-weight: 700; }
      .rum-nudge-close {
        width: 30px;
        height: 30px;
        border: 0;
        border-radius: 10px;
        background: rgba(16,37,71,.08);
        color: #102542;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }
      .rum-menu {
        display: none;
        margin-bottom: 12px;
        width: 320px;
        padding: 10px;
        border-radius: 24px;
        background: rgba(255,255,255,.84);
        border: 1px solid rgba(255,255,255,.55);
        box-shadow: 0 22px 60px rgba(15,39,71,.16);
        backdrop-filter: blur(20px);
      }
      .rum-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 10px;
        padding: 13px;
        border: 1px solid rgba(14,26,43,.08);
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(247,250,253,.94));
        color: #0e1a2b;
        text-decoration: none;
        cursor: pointer;
        transition: transform .18s ease, background .18s ease;
      }
      .rum-item:last-child { margin-bottom: 0; }
      .rum-item:hover { transform: translateY(-1px); background: #f7fbff; }
      .rum-ico {
        width: 38px;
        height: 38px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(36,95,151,.10);
        color: #245f97;
        flex: 0 0 auto;
      }
      .rum-title { font-size: 14px; font-weight: 800; line-height: 1.1; }
      .rum-sub { margin-top: 4px; font-size: 12px; color: #66768b; }
      .rum-box {
        display: none;
        margin-bottom: 12px;
        width: 360px;
        height: 540px;
        border-radius: 24px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.55);
        background: rgba(255,255,255,.86);
        box-shadow: 0 26px 70px rgba(15,39,71,.2);
        backdrop-filter: blur(20px);
      }
      .rum-head {
        padding: 12px 14px;
        color: #fff;
        background: linear-gradient(135deg, ${BRAND_1}, ${BRAND_2});
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .rum-head-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .rum-logo {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(255,255,255,.95);
        padding: 3px;
        object-fit: contain;
        flex: 0 0 auto;
      }
      .rum-head-title {
        font-size: 13px;
        font-weight: 800;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .rum-close {
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 12px;
        color: #fff;
        background: rgba(255,255,255,.15);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .rum-main {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px 12px 12px;
        border: 1px solid rgba(255,255,255,.35);
        border-radius: 999px;
        color: #fff;
        background: linear-gradient(135deg, rgba(16,37,71,.98), rgba(36,95,151,.95));
        box-shadow: 0 20px 42px rgba(15,39,71,.28);
        cursor: pointer;
      }
      .rum-main img {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255,255,255,.95);
        padding: 4px;
        object-fit: contain;
      }
      .rum-main-copy { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
      .rum-main-chip {
        font-size: 10px;
        letter-spacing: .14em;
        text-transform: uppercase;
        opacity: .68;
        font-weight: 800;
      }
      .rum-main-label { font-size: 14px; font-weight: 800; }
      .rum-main.rum-attention { animation: rumPulse 1.7s ease-in-out infinite; }
      @keyframes rumPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
      @keyframes rumFloatIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @media (max-width: 420px) {
        .rum-menu { width: 292px; }
        .rum-box { width: 320px; height: 510px; }
        .rum-nudge { width: 220px; }
      }
    </style>

    <div class="rum-nudge" id="rumNudge" role="dialog" aria-live="polite">
      <div class="rum-nudge-top">
        <div class="rum-nudge-copy">
          <span class="rum-nudge-chip">${T.chip}</span>
          <div class="rum-nudge-text">${T.nudge}</div>
        </div>
        <button class="rum-nudge-close" id="rumNudgeClose" aria-label="${T.closeLabel}">${ICON.close}</button>
      </div>
    </div>

    <div class="rum-menu" id="rumMenu">
      <button type="button" class="rum-item" id="rumOpenWebAI">
        <span class="rum-ico">${ICON.robot}</span>
        <span><div class="rum-title">${T.webAiTitle}</div><div class="rum-sub">${T.webAiSub}</div></span>
      </button>

      <a class="rum-item" href="${TG_AI_BOT}" target="_blank" rel="noopener noreferrer">
        <span class="rum-ico">${ICON.telegram}</span>
        <span><div class="rum-title">${T.tgAiTitle}</div><div class="rum-sub">${T.tgAiSub}</div></span>
      </a>

      <a class="rum-item" href="${TG_ADMIN_URL}" target="_blank" rel="noopener noreferrer">
        <span class="rum-ico">${ICON.user}</span>
        <span><div class="rum-title">${T.adminTitle}</div><div class="rum-sub">${T.adminSub}</div></span>
      </a>

      <a class="rum-item" href="${PHONE_HREF}">
        <span class="rum-ico">${ICON.phone}</span>
        <span><div class="rum-title">${T.phoneTitle}</div><div class="rum-sub">${T.phoneSub}</div></span>
      </a>
    </div>

    <div class="rum-box" id="rumBox">
      <div class="rum-head">
        <div class="rum-head-left">
          <img class="rum-logo" src="${LOGO_URL}" alt="RUM logo" />
          <span class="rum-head-title">${HEADER_TITLE}</span>
        </div>
        <button type="button" class="rum-close" id="rumClose" aria-label="${T.closeLabel}">${ICON.close}</button>
      </div>
      <iframe src="${WEB_AI_URL}" style="width:100%;height:calc(100% - 54px);border:0;background:#fff;" loading="lazy" title="${HEADER_TITLE}"></iframe>
    </div>

    <button type="button" class="rum-main rum-attention" id="rumMainBtn">
      <img src="${LOGO_URL}" alt="RUM logo" />
      <span class="rum-main-copy"><span class="rum-main-chip">${T.chip}</span><span class="rum-main-label">${T.help}</span></span>
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
