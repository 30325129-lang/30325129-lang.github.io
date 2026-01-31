// counter.js - GitHub Pages 瀏覽人數統計（JSONP）
// 使用者提供的 Apps Script：https://script.google.com/macros/s/AKfycbwL6S__yGbYsyH6lAtsWzGtADbYuJWnOD3uy--eQmBOZQntQlwfkEOWkagZIyKk10-kOQ/exec
// 需求：不需要每頁貼 URL，只要引入這支 counter.js

(function () {
  var COUNTER_ENDPOINT = "https://script.google.com/macros/s/AKfycbwL6S__yGbYsyH6lAtsWzGtADbYuJWnOD3uy--eQmBOZQntQlwfkEOWkagZIyKk10-kOQ/exec";
  var CALLBACK_NAME = "visitCounterCallback_" + Math.random().toString(36).slice(2);

  function setAll(text) {
    try {
      document.querySelectorAll("[data-visit-count]").forEach(function (el) {
        el.textContent = text;
      });
    } catch (e) {}
  }

  function cleanup(scriptEl) {
    try { if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl); } catch (e) {}
    try { delete window[CALLBACK_NAME]; } catch (e) {}
  }

  // 預設顯示
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (!document.querySelector("[data-visit-count]")) return;
      setAll("（載入中…）");
    });
  } else {
    if (document.querySelector("[data-visit-count]")) setAll("（載入中…）");
  }

  // 若頁面沒有放 data-visit-count，就不做任何事
  if (!document.querySelector("[data-visit-count]")) return;

  var timeout = setTimeout(function () {
    setAll("（載入失敗）");
    cleanup(script);
  }, 8000);

  window[CALLBACK_NAME] = function (data) {
    clearTimeout(timeout);
    try {
      // 兼容多種回傳格式：{count:123} / {value:123} / {total:123} / number
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

  // JSONP：?callback=xxx
  var url = COUNTER_ENDPOINT;
  url += (url.indexOf("?") >= 0 ? "&" : "?") + "callback=" + encodeURIComponent(CALLBACK_NAME);
  // 你若 Apps Script 需要指定站點/頁面，可在此加參數，例如 page=...
  // url += "&page=" + encodeURIComponent(location.pathname);

  var script = document.createElement("script");
  script.src = url;
  script.async = true;
  script.onerror = function () {
    clearTimeout(timeout);
    setAll("（載入失敗）");
    cleanup(script);
  };
  document.head.appendChild(script);
})();
