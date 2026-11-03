/* SEC BOT Hybrid Hosting Configuration.
 * Ganti API_BASE_URL dengan alamat API backend VPS, contoh https://api.domainkamu.com
 * Jangan masukkan Supabase service-role key di file frontend ini.
 */
(() => {
  const API_BASE_URL = 'http://159.223.65.115:2001';
  window.SECBOT_API_BASE_URL = API_BASE_URL.replace(/\/$/, '');
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const raw = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
    let parsed;
    try { parsed = new URL(raw, window.location.href); } catch { return originalFetch(input, init); }
    if (!parsed.pathname.startsWith('/api/')) return originalFetch(input, init);
    const target = window.SECBOT_API_BASE_URL
      ? window.SECBOT_API_BASE_URL + parsed.pathname + parsed.search + parsed.hash
      : parsed.href;
    return originalFetch(target, { ...init, credentials: 'include' });
  };
})();
