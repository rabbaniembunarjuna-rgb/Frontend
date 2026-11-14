/**
 * SEC BOT — Frontend config
 * Production: Cloudflare Pages (https://secbot.web.id)
 * API:        VPS            (https://api.secbot.web.id)
 *
 * Untuk local dev, ubah API_BASE ke http://localhost:2001/api
 * atau set window.__SEC_API_BASE sebelum script ini jalan.
 */
(function () {
  var DEFAULT_API_BASE = 'https://api.secbot.web.id/api';
  var host = (typeof location !== 'undefined' && location.hostname) || '';
  // Local / preview → API lokal bila frontend juga lokal
  if (host === 'localhost' || host === '127.0.0.1') {
    DEFAULT_API_BASE = 'http://localhost:2001/api';
  }
  window.API_BASE = window.__SEC_API_BASE || DEFAULT_API_BASE;
  // Helper: gabung path API (/auth/login → https://api.../api/auth/login)
  window.apiUrl = function (path) {
    var base = String(window.API_BASE || '').replace(/\/$/, '');
    var p = String(path || '');
    // Terima path lama "/api/..." maupun "/auth/..."
    if (p.indexOf('/api/') === 0) p = p.slice(4); // hapus prefix /api
    if (p.charAt(0) !== '/') p = '/' + p;
    return base + p;
  };

  // Google Sign-In Client ID diambil dari backend (.env: GOOGLE_CLIENT_ID).
  // Client Secret tidak pernah dikirim ke frontend.
  // Override lokal (opsional): window.__GOOGLE_CLIENT_ID sebelum script ini jalan.
  window.GOOGLE_CLIENT_ID = window.__GOOGLE_CLIENT_ID || '';
  window.TURNSTILE_SITE_KEY = '';
  // Captcha dirender setelah script Turnstile dan site key sama-sama siap
  window.renderTurnstile = function () {
    var el = document.getElementById('turnstileWidget');
    if (!el || !window.turnstile || !window.TURNSTILE_SITE_KEY || el.dataset.rendered) return;
    el.dataset.rendered = '1';
    window.turnstile.render(el, { sitekey: window.TURNSTILE_SITE_KEY });
  };
  window.onTurnstileLoad = function () { window.renderTurnstile(); };
  window.googleConfigReady = fetch(window.apiUrl('/config/public'))
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (d) {
      if (d && d.googleClientId) window.GOOGLE_CLIENT_ID = d.googleClientId;
      if (d && d.turnstileSiteKey) window.TURNSTILE_SITE_KEY = d.turnstileSiteKey;
      if (typeof window.initGoogleSignIn === 'function') window.initGoogleSignIn();
      window.renderTurnstile();
    })
    .catch(function () {
      console.warn('[SEC BOT] Gagal memuat konfigurasi publik dari backend');
    });
})();
