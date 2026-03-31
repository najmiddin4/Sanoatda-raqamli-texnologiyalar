(function () {
  if (document.getElementById("rumSubmitFloat")) return;

  function detectLang() {
    const raw = (document.documentElement.lang || "uz").toLowerCase();
    if (raw.startsWith("ru")) return "ru";
    if (raw.startsWith("en")) return "en";
    return "uz";
  }

  const LANG = detectLang();
  const SITE_URL = "https://rum-journal.com/index.php/RUM/submission";
  const TELEGRAM_URL = "https://t.me/rum_editorial_bot";

  const I18N = {
    uz: {
      submit: "Maqola yuborish",
      chooseTitle: "Yuborish usulini tanlang",
      chooseText: "RUM Journal maqolasini quyidagi ikki usuldan biri orqali yuborishingiz mumkin.",
      siteTitle: "Sayt orqali yuborish",
      siteText: "OJS platformada rasmiy submission jarayonini boshlash",
      tgTitle: "Telegram bot orqali yuborish",
      tgText: "@rum_editorial_bot orqali tezkor yuborish",
      close: "Yopish",
      open: "Ochish",
      chip: "RUM Editorial"
    },
    ru: {
      submit: "Отправить статью",
      chooseTitle: "Выберите способ отправки",
      chooseText: "Вы можете отправить статью в RUM Journal одним из двух способов ниже.",
      siteTitle: "Через сайт",
      siteText: "Запустить официальную submission-подачу в OJS",
      tgTitle: "Через Telegram бот",
      tgText: "Быстрая отправка через @rum_editorial_bot",
      close: "Закрыть",
      open: "Открыть",
      chip: "RUM Editorial"
    },
    en: {
      submit: "Submit Article",
      chooseTitle: "Choose a submission route",
      chooseText: "You can submit your RUM Journal manuscript using one of the two options below.",
      siteTitle: "Submit on the website",
      siteText: "Start the official OJS submission flow",
      tgTitle: "Submit via Telegram bot",
      tgText: "Quick submission through @rum_editorial_bot",
      close: "Close",
      open: "Open",
      chip: "RUM Editorial"
    }
  };

  const T = I18N[LANG] || I18N.uz;

  const wrap = document.createElement("div");
  wrap.id = "rumSubmitFloat";
  wrap.style.cssText = "position:fixed;right:20px;bottom:92px;z-index:99999;font-family:Inter,Segoe UI,Arial,sans-serif;";

  wrap.innerHTML = `
    <style>
      #rumSubmitFloat * { box-sizing: border-box; }
      #rumSubmitFloat a, #rumSubmitFloat button { font-family: inherit; }

      .rum-submit-trigger {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px 12px 12px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.35);
        background: linear-gradient(135deg, rgba(15,39,71,.96), rgba(36,95,151,.94));
        color: #fff;
        cursor: pointer;
        box-shadow: 0 18px 38px rgba(15,39,71,.28);
        backdrop-filter: blur(18px);
        transition: transform .18s ease, box-shadow .18s ease;
      }

      .rum-submit-trigger:hover {
        transform: translateY(-1px) scale(1.02);
        box-shadow: 0 22px 44px rgba(15,39,71,.32);
      }

      .rum-submit-mark {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,.15);
        font-size: 18px;
      }

      .rum-submit-label {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .rum-submit-chip {
        font-size: 10px;
        letter-spacing: .12em;
        text-transform: uppercase;
        opacity: .7;
        font-weight: 700;
      }

      .rum-submit-text {
        font-size: 14px;
        font-weight: 800;
      }

      .rum-submit-modal {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
        background: rgba(7, 15, 29, 0.44);
        backdrop-filter: blur(6px);
        z-index: 100000;
      }

      .rum-submit-modal.show { display: flex; }

      .rum-submit-card {
        width: min(100%, 620px);
        border-radius: 28px;
        overflow: hidden;
        background: rgba(255,255,255,.92);
        border: 1px solid rgba(255,255,255,.6);
        box-shadow: 0 28px 90px rgba(15,39,71,.22);
      }

      .rum-submit-head {
        padding: 24px 24px 18px;
        background:
          radial-gradient(circle at top right, rgba(255,255,255,.22), transparent 30%),
          linear-gradient(135deg, #102542, #245f97);
        color: #fff;
      }

      .rum-submit-title {
        margin: 0;
        font-size: 24px;
        line-height: 1.05;
        font-weight: 800;
      }

      .rum-submit-copy {
        margin: 10px 0 0;
        max-width: 480px;
        color: rgba(255,255,255,.82);
        font-size: 14px;
        line-height: 1.55;
      }

      .rum-submit-body {
        padding: 18px;
        display: grid;
        gap: 14px;
      }

      .rum-option {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 14px;
        align-items: center;
        padding: 18px;
        border-radius: 20px;
        border: 1px solid rgba(14,26,43,.10);
        background: linear-gradient(180deg, #ffffff, #f7fafd);
      }

      .rum-option-main {
        display: flex;
        gap: 14px;
        align-items: flex-start;
      }

      .rum-option-icon {
        width: 46px;
        height: 46px;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(36,95,151,.10);
        color: #1f5b92;
        font-size: 21px;
        flex: 0 0 auto;
      }

      .rum-option-title {
        margin: 0;
        color: #0e1a2b;
        font-size: 16px;
        font-weight: 800;
      }

      .rum-option-desc {
        margin: 6px 0 0;
        color: #607086;
        font-size: 13px;
        line-height: 1.5;
      }

      .rum-option-link {
        text-decoration: none;
        white-space: nowrap;
        padding: 12px 16px;
        border-radius: 14px;
        color: #fff;
        background: linear-gradient(135deg, #102542, #245f97);
        font-size: 13px;
        font-weight: 800;
        box-shadow: 0 12px 24px rgba(15,39,71,.16);
      }

      .rum-option-link:hover { opacity: .95; }

      .rum-submit-foot {
        padding: 0 18px 18px;
        display: flex;
        justify-content: flex-end;
      }

      .rum-submit-close {
        border: 0;
        border-radius: 14px;
        padding: 11px 14px;
        cursor: pointer;
        color: #102542;
        background: rgba(16,37,71,.08);
        font-size: 13px;
        font-weight: 800;
      }

      @media (max-width: 560px) {
        .rum-submit-trigger {
          padding-right: 14px;
        }

        .rum-submit-card {
          border-radius: 24px;
        }

        .rum-option {
          grid-template-columns: 1fr;
        }

        .rum-option-link {
          width: 100%;
          text-align: center;
        }
      }
    </style>

    <button type="button" class="rum-submit-trigger" id="rumSubmitBtn">
      <span class="rum-submit-mark">✦</span>
      <span class="rum-submit-label">
        <span class="rum-submit-chip">${T.chip}</span>
        <span class="rum-submit-text">${T.submit}</span>
      </span>
    </button>

    <div class="rum-submit-modal" id="rumSubmitModal">
      <div class="rum-submit-card">
        <div class="rum-submit-head">
          <h2 class="rum-submit-title">${T.chooseTitle}</h2>
          <p class="rum-submit-copy">${T.chooseText}</p>
        </div>
        <div class="rum-submit-body">
          <div class="rum-option">
            <div class="rum-option-main">
              <div class="rum-option-icon">⌘</div>
              <div>
                <p class="rum-option-title">${T.siteTitle}</p>
                <p class="rum-option-desc">${T.siteText}</p>
              </div>
            </div>
            <a class="rum-option-link" href="${SITE_URL}">${T.open}</a>
          </div>

          <div class="rum-option">
            <div class="rum-option-main">
              <div class="rum-option-icon">✈</div>
              <div>
                <p class="rum-option-title">${T.tgTitle}</p>
                <p class="rum-option-desc">${T.tgText}</p>
              </div>
            </div>
            <a class="rum-option-link" href="${TELEGRAM_URL}" target="_blank" rel="noopener">${T.open}</a>
          </div>
        </div>
        <div class="rum-submit-foot">
          <button type="button" class="rum-submit-close" id="rumSubmitClose">${T.close}</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(wrap);

  const btn = document.getElementById("rumSubmitBtn");
  const modal = document.getElementById("rumSubmitModal");
  const closeBtn = document.getElementById("rumSubmitClose");

  btn.addEventListener("click", function () {
    modal.classList.add("show");
  });

  closeBtn.addEventListener("click", function () {
    modal.classList.remove("show");
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  });
})();