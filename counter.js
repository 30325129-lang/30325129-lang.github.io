// counter.js
// ✅ 只要在這裡貼上你的 Apps Script Web App URL（部署完成後那個 /exec 連結）
// 例：https://script.google.com/macros/s/XXXXXXX/exec
const COUNTER_URL = "https://script.google.com/macros/s/AKfycbwL6S__yGbYsyH6lAtsWzGtADbYuJWnOD3uy--eQmBOZQntQlwfkEOWkagZIyKk10-kOQ/exec";

// ✅ 所有頁面共用同一個總計（你也可以改成不同 key：例如 index_visits / rank_visits）
const COUNTER_NAMESPACE = "30325129-lang.github.io";
const COUNTER_KEY = "total_visits";

(function () {
  const els = Array.from(document.querySelectorAll("[data-visit-count]"));
  const setText = (t) => els.forEach((el) => (el.textContent = t));

  if (!els.length) return;

  if (!COUNTER_URL || COUNTER_URL.includes("PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL")) {
    setText("（尚未設定）");
    return;
  }

  // JSONP callback（避免 CORS / fetch 被擋）
  const cbName = "__visitCountCallback_" + Math.random().toString(16).slice(2);
  window[cbName] = function (data) {
    try {
      const v = data && (data.value ?? data.count ?? data.total);
      const n = Number(v);
      setText(Number.isFinite(n) ? n.toLocaleString("zh-TW") : "-");
    } finally {
      // cleanup
      try { delete window[cbName]; } catch (_) { window[cbName] = undefined; }
    }
  };

  try {
    const u = new URL(COUNTER_URL);
    // 你 Apps Script 的 doGet 需要支援 callback 參數回傳 JSONP
    u.searchParams.set("callback", cbName);
    u.searchParams.set("ns", COUNTER_NAMESPACE);
    u.searchParams.set("key", COUNTER_KEY);
    u.searchParams.set("t", String(Date.now())); // bust cache

    const s = document.createElement("script");
    s.src = u.toString();
    s.async = true;
    s.onerror = function () {
      setText("（載入失敗）");
      try { delete window[cbName]; } catch (_) { window[cbName] = undefined; }
    };
    document.body.appendChild(s);
  } catch (e) {
    setText("（載入失敗）");
    try { delete window[cbName]; } catch (_) { window[cbName] = undefined; }
  }
})();