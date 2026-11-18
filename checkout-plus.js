/* SEC BOT — checkout-plus.js
   Tambahan untuk jendela pembayaran. Tidak mengubah logika order: hanya membaca DOM
   yang sudah ada dan menambah bantuan (langkah, total, hemat, validasi nomor, simpan QRIS). */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var modal = $('#payModal .modal'), pay = $('#paymentArea');
  if (!modal || !pay) return;
  var rp = function (n) { return 'Rp' + Number(n || 0).toLocaleString('id-ID'); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* 1. Langkah: Paket, Bayar, Konfirmasi */
  modal.querySelector('.modal-head').insertAdjacentHTML('afterend',
    '<ol class="co-steps" id="coSteps"><li>Pilih paket</li><li>Bayar</li><li>Konfirmasi admin</li></ol>');
  var steps = [].slice.call(document.querySelectorAll('#coSteps li'));
  var box = $('#orderStatusBox');
  function syncSteps() {
    var cur = 0;
    if (!pay.classList.contains('hidden')) cur = 1;
    if (box && !box.hidden) cur = 2;
    var done = box && box.classList.contains('is-confirmed');
    steps.forEach(function (li, i) {
      li.className = done || i < cur ? 'done' : (i === cur ? 'now' : '');
    });
  }
  var mo = new MutationObserver(syncSteps);
  mo.observe(pay, { attributes: true, attributeFilter: ['class'] });
  if (box) mo.observe(box, { attributes: true, attributeFilter: ['hidden', 'class'] });
  mo.observe($('#payModal'), { attributes: true, attributeFilter: ['class'] });
  syncSteps();

  /* 2. Total transfer + salin nominal */
  pay.insertAdjacentHTML('afterbegin',
    '<div class="co-total"><div><small>Total transfer</small><b id="coAmount">-</b><span id="coMeta"></span></div>' +
    '<button type="button" class="copyBtn" id="coCopy">Salin nominal</button></div>');
  var sub = $('#selectedPackage'), amount = 0;
  function syncTotal() {
    var m = /^Paket (.+?) · (.+?) — (.+)$/.exec(sub.textContent || '');
    if (!m) return;
    amount = Number(m[3].replace(/\D/g, '')) || 0;
    $('#coAmount').textContent = rp(amount);
    $('#coMeta').textContent = m[1] + ' · ' + m[2];
  }
  new MutationObserver(syncTotal).observe(sub, { childList: true, characterData: true, subtree: true });
  $('#coCopy').addEventListener('click', function () {
    var done = function () { var t = $('#toast'); if (t) { t.textContent = 'Nominal ' + rp(amount) + ' disalin. Transfer harus pas.'; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 2600); } };
    (navigator.clipboard ? navigator.clipboard.writeText(String(amount)) : Promise.reject()).then(done, done);
  });

  /* 3. Label hemat pada pilihan durasi */
  var dopt = $('#durationOptions');
  new MutationObserver(function () {
    var ds = window.__secDurations || [{ days: 1 }, { days: 7 }, { days: 30 }];
    var di = ds.findIndex(function (x) { return x.days === 1; }), btns = [].slice.call(dopt.children);
    var price = function (b) { var s = b && b.querySelector('span'); return s ? Number(s.textContent.replace(/\D/g, '')) || 0 : 0; };
    var day = di >= 0 ? price(btns[di]) : 0;
    btns.forEach(function (b, i) {
      if (b.dataset.plus) return;
      b.dataset.plus = 1;
      var d = ds[i], save = d && day ? day * d.days - price(b) : 0;
      if (d && d.days > 1 && save > 0) b.insertAdjacentHTML('beforeend', '<em class="co-save">Hemat ' + rp(save) + '</em>');
    });
  }).observe(dopt, { childList: true });

  /* 4. Nomor bot: rapikan otomatis, beri petunjuk langsung, ingat pilihan terakhir */
  var bot = $('#botNumberInput'), sender = $('#senderName');
  if (bot) {
    bot.insertAdjacentHTML('afterend', '<small class="co-hint" id="coBotHint" aria-live="polite"></small>');
    var hint = $('#coBotHint');
    var fix = function () {
      var v = bot.value.replace(/\D/g, '');
      if (v.indexOf('0') === 0) v = '62' + v.slice(1);
      bot.value = v;
      var ok = v.length >= 10 && v.indexOf('62') === 0;
      hint.className = 'co-hint ' + (!v ? '' : ok ? 'ok' : 'bad');
      hint.textContent = !v ? '' : ok ? 'Format nomor sudah benar.' : 'Awali dengan 62 dan isi lengkap, contoh 6285708600616.';
      if (ok) store.set('secbot-last-bot', v);
    };
    bot.addEventListener('input', fix);
    if (!bot.value) { bot.value = store.get('secbot-last-bot'); if (bot.value) fix(); }
  }
  if (sender) {
    if (!sender.value) sender.value = store.get('secbot-last-sender');
    sender.addEventListener('change', function () { store.set('secbot-last-sender', sender.value.trim()); });
  }

  /* 5. Simpan QRIS ke galeri (untuk scan lewat aplikasi bank/e-wallet) */
  var q = document.querySelector('#panel-qris .qris');
  if (q) q.insertAdjacentHTML('afterend',
    '<a class="btn btn-outline co-dl" href="assets/qris.jpg" download="qris-secbot.jpg"><i class="ph ph-download-simple" aria-hidden="true"></i>Simpan QRIS</a>');
})();
