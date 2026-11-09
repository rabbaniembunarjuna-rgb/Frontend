# Deploy Frontend — Cloudflare Pages

## Isi folder ini
- `index.html` — website user (paket, login, pairing)
- `admin.html` — panel admin
- `config.js` — **API_BASE** → `https://api.secbot.web.id/api`
- `assets/` — gambar & QRIS
- `_redirects` — SPA routes untuk Cloudflare Pages

## 1. Push ke GitHub
```bash
cd frontend
git init
git add .
git commit -m "SEC BOT frontend"
git branch -M main
git remote add origin https://github.com/USERNAME/secbot-frontend.git
git push -u origin main
```

## 2. Cloudflare Pages
1. Dashboard Cloudflare → **Workers & Pages** → **Create** → **Pages** → Connect to Git
2. Pilih repo `secbot-frontend`
3. Build settings:
   - Framework preset: **None**
   - Build command: *(kosong)*
   - Build output directory: `/` (root)
4. Environment variables: tidak wajib (API_BASE sudah di `config.js`)
5. Deploy

## 3. Custom domain
1. Pages project → **Custom domains** → `secbot.web.id`
2. DNS (Cloudflare):
   - `secbot.web.id` → CNAME ke `xxx.pages.dev` (otomatis jika domain di CF)
   - SSL/TLS mode: **Full** atau **Full (strict)**

## 4. Ubah API endpoint (opsional)
Edit `config.js`:
```js
var DEFAULT_API_BASE = 'https://api.secbot.web.id/api';
```
Atau override runtime:
```html
<script>window.__SEC_API_BASE='https://api.secbot.web.id/api'</script>
<script src="/config.js"></script>
```

## 5. Cek
- Buka https://secbot.web.id
- Login / daftar harus mengenai https://api.secbot.web.id/api/auth/...
- DevTools → Network: request API status 200, CORS OK
- Cookie `secbot_token` dari domain API (cross-site, SameSite=None)

## Catatan
- Admin: https://secbot.web.id/admin
- UNO Flip **tidak** di Pages — tetap di backend: https://api.secbot.web.id/uno/...
