(function () {
  if (document.getElementById("rumSubmitFloat")) return;

  function detectLang() {
    const raw = (document.documentElement.lang || "uz").toLowerCase();
    if (raw.startsWith("ru")) return "ru";
    if (raw.startsWith("en")) return "en";
    return "uz";
  }

  const LANG = detectLang();

  const I18N = {
    uz: {
      submit: "Maqola yuborish",
      chooseTitle: "Maqola yuborish usulini tanlang",
      chooseText: "Quyidagi usullardan birini tanlang:",
      siteTitle: "Sayt orqali yuborish",
      siteText: "RUM Journal OJS tizimi orqali maqola yuborish",
      tgTitle: "Telegram bot orqali yuborish",
      tgText: "@rum_editorial_bot orqali tezkor yuborish",
      close: "Yopish",
      open: "Kirish"
    },
    ru: {
      submit: "Отправить статью",
      chooseTitle: "Выберите способ отправки статьи",
      chooseText: "Выберите один из следующих вариантов:",
      siteTitle: "Отправить через сайт",
      siteText: "Отправка статьи через систему OJS журнала RUM",
      tgTitle: "Отправить через Telegram бот",
      tgText: "Быстрая отправка через @rum_editorial_bot",
      close: "Закрыть",
      open: "Открыть"
    },
    en: {
      submit: "Submit article",
      chooseTitle: "Choose a submission method",
      chooseText: "Select one of the following options:",
      siteTitle: "Submit via website",
      siteText: "Submit your manuscript through the RUM Journal OJS system",
      tgTitle: "Submit via Telegram bot",
      tgText: "Quick submission via @rum_editorial_bot",
      close: "Close",
      open: "Open"
    }
  };

  const T = I18N[LANG] || I18N.uz;
  const SITE_URL = "https://rum-journal.com/index.php/RUM/submission";
  const TELEGRAM_URL = "https://t.me/rum_editorial_bot";

  const wrap = document.createElement("div");
  wrap.id = "rumSubmitFloat";
  wrap.style.cssText = "position:fixed;right:18px;bottom:90px;z-index:99999;font-family:system-ui,Segoe UI,Arial,sans-serif;";

  wrap.innerHTML = `
    <style>
      #rumSubmitFloat a,
      #rumSubmitFloat button {
        font-family: inherit;
      }

      #rumSubmitFloat .submit-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 18px;
        border-radius: 999px;
        background: linear-gradient(135deg, #102542, #1f5b92);
        color: #fff;
        font-weight: 800;
        text-decoration: none;
        border: 0;
        cursor: pointer;
        box-shadow: 0 12px 32px rgba(0,0,0,.25);
        animation: rumSubmitPulse 1.6s infinite;
      }

      #rumSubmitFloat .submit-btn:hover {
        transform: scale(1.05);
      }

      @keyframes rumSubmitPulse {
        50% { transform: scale(1.05); }
      }

      #rumSubmitModal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.45);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        padding: 20px;
      }

      #rumSubmitModal.show {
        display: flex;
      }

      .rum-submit-card {
        width: 100%;
        max-width: 560px;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 20px 50px rgba(0,0,0,.22);
        overflow: hidden;
      }

      .rum-submit-head {
        background: linear-gradient(135deg, #102542, #1f5b92);
        color: #fff;
        padding: 18px 20px;
        font-size: 20px;
        font-weight: 800;
      }

      .rum-submit-body {
        padding: 20px;
      }

      .rum-submit-text {
        margin: 0 0 16px;
        color: #334155;
        font-size: 15px;
      }

      .rum-submit-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .rum-submit-item {
        border: 1px solid #dbe3ea;
        border-radius: 14px;
        padding: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        background: #f8fafc;
      }

      .rum-submit-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .rum-submit-name {
        font-weight: 700;
        color: #0f172a;
        line-height: 1.35;
      }

      .rum-submit-desc {
        color: #475569;
        font-size: 14px;
        line-height: 1.4;
      }

      .rum-submit-link {
        white-space: nowrap;
        text-decoration: none;
        background: #1f5b92;
        color: #fff;
        padding: 10px 14px;
        border-radius: 10px;
        font-weight: 700;
      }

      .rum-submit-link:hover {
        opacity: .92;
      }

      .rum-submit-foot {
        padding: 0 20px 20px;
        display: flex;
        justify-content: flex-end;
      }

      .rum-submit-close {
        border: 0;
        background: #e5e7eb;
        color: #111827;
        padding: 10px 14px;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
      }

      @media (max-width: 520px) {
        .rum-submit-item {
          flex-direction: column;
          align-items: flex-start;
        }

        .rum-submit-link {
          width: 100%;
          text-align: center;
        }
      }
    </style>

    <button type="button" class="submit-btn" id="rumSubmitBtn">📄 ${T.submit}</button>

    <div id="rumSubmitModal">
      <div class="rum-submit-card">
        <div class="rum-submit-head">${T.chooseTitle}</div>
        <div class="rum-submit-body">
          <p class="rum-submit-text">${T.chooseText}</p>
          <div class="rum-submit-list">
            <div class="rum-submit-item">
              <div class="rum-submit-meta">
                <div class="rum-submit-name">${T.siteTitle}</div>
                <div class="rum-submit-desc">${T.siteText}</div>
              </div>
              <a class="rum-submit-link" href="${SITE_URL}">${T.open}</a>
            </div>

            <div class="rum-submit-item">
              <div class="rum-submit-meta">
                <div class="rum-submit-name">${T.tgTitle}</div>
                <div class="rum-submit-desc">${T.tgText}</div>
              </div>
              <a class="rum-submit-link" href="${TELEGRAM_URL}" target="_blank" rel="noopener">${T.open}</a>
            </div>
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