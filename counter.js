// counter.js - GitHub Pages 瀏覽人數統計（JSONP）
// ✅ 支援與檢舉系統共用同一支 Apps Script /exec：
//    - 若頁面有設定 window.RANK_REPORT_API_URL，就優先使用它
//    - 否則使用下方 COUNTER_ENDPOINT（只要改這裡一次，全站所有頁面都會套用）
//
// 回傳格式相容：callback({value:n}) / callback({count:n}) / callback(n)

(function () {
  // ✅ 預設端點（你只要改這行）
  var COUNTER_ENDPOINT = "https://script.google.com/macros/s/AKfycbwL6S__yGbYsyH6lAtsWzGtADbYuJWnOD3uy--eQmBOZQntQlwfkEOWkagZIyKk10-kOQ/exec";

  function pickEndpoint() {
    try {
      var u = (window && window.RANK_REPORT_API_URL) ? String(window.RANK_REPORT_API_URL).trim() : "";
      if (u) return u;
    } catch (e) {}
    return COUNTER_ENDPOINT;
  }

  function setAll(text) {
    try {
      document.querySelectorAll("[data-visit-count]").forEach(function (el) {
        el.textContent = text;
      });
    } catch (e) {}
  }

  function run() {
    // 若頁面沒有放 data-visit-count，就不做任何事（但仍允許你用同一支 counter.js 全站共用）
    if (!document.querySelector("[data-visit-count]")) return;

    setAll("（載入中…）");

    var endpoint = pickEndpoint();
    var CALLBACK_NAME = "visitCounterCallback_" + Math.random().toString(36).slice(2);

    function cleanup(scriptEl) {
      try { if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl); } catch (e) {}
      try { delete window[CALLBACK_NAME]; } catch (e) {}
    }

    var script = null;
    var timeout = setTimeout(function () {
      setAll("（載入失敗）");
      cleanup(script);
    }, 8000);

    window[CALLBACK_NAME] = function (data) {
      clearTimeout(timeout);
      try {
        var n = null;
        if (typeof data === "number") n = data;
        if (data && typeof data === "object") {
          if (typeof data.count === "number") n = data.count;
          else if (typeof data.value === "number") n = data.value;
          else if (typeof data.total === "number") n = data.total;
          else if (typeof data.visits === "number") n = data.visits;
        }
        if (n === null || !isFinite(n)) {
          setAll("（載入失敗）");
        } else {
          setAll(String(Math.floor(n)));
        }
      } catch (e) {
        setAll("（載入失敗）");
      }
      cleanup(script);
    };

    // JSONP：?action=visits&callback=xxx
    var url = endpoint;
    url += (url.indexOf("?") >= 0 ? "&" : "?") + "action=visits";
    url += "&callback=" + encodeURIComponent(CALLBACK_NAME);

    script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onerror = function () {
      clearTimeout(timeout);
      setAll("（載入失敗）");
      cleanup(script);
    };
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
