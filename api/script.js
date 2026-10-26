(function(){
  "use strict";

  var root = document.documentElement;

  /* ---------- Theme (light/dark) ---------- */
  var themeToggle = document.getElementById('themeToggle');
  var iconSun = document.getElementById('iconSun');
  var iconMoon = document.getElementById('iconMoon');

  function saveTheme(mode){ try{ localStorage.setItem('jiyyad-mode', mode); }catch(e){} }
  function loadTheme(){ try{ return localStorage.getItem('jiyyad-mode'); }catch(e){ return null; } }

  function applyMode(mode){
    root.setAttribute('data-theme', mode);
    iconSun.hidden = mode === 'dark';
    iconMoon.hidden = mode !== 'dark';
  }

  var savedMode = loadTheme();
  var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyMode(savedMode || (systemDark ? 'dark' : 'light'));

  themeToggle.addEventListener('click', function(){
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyMode(next);
    saveTheme(next);
  });

  /* ---------- Accent color switcher ---------- */
  var THEMES = [
    { id:'kuning', accent:'#eab308', accent2:'#f59e0b' },
    { id:'biru',   accent:'#3b82f6', accent2:'#0891b2' },
    { id:'merah',  accent:'#ef4444', accent2:'#f97316' },
    { id:'hijau',  accent:'#22c55e', accent2:'#059669' },
    { id:'ungu',   accent:'#a855f7', accent2:'#6366f1' },
    { id:'pink',   accent:'#ec4899', accent2:'#0891b2' }
  ];
  var LABELS = { kuning:'Kuning', biru:'Biru', merah:'Merah', hijau:'Hijau', ungu:'Ungu', pink:'Pink' };

  var swatchWrap = document.getElementById('swatches');

  function applyAccent(theme){
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-2', theme.accent2);
    swatchWrap.querySelectorAll('.swatch').forEach(function(b){
      b.setAttribute('aria-pressed', b.dataset.id === theme.id ? 'true' : 'false');
    });
  }
  function saveAccent(id){ try{ localStorage.setItem('jiyyad-accent', id); }catch(e){} }
  function loadAccent(){ try{ return localStorage.getItem('jiyyad-accent'); }catch(e){ return null; } }

  THEMES.forEach(function(theme){
    var b = document.createElement('button');
    b.className = 'swatch';
    b.type = 'button';
    b.style.background = theme.accent;
    b.dataset.id = theme.id;
    b.setAttribute('aria-pressed','false');
    b.setAttribute('aria-label','Warna aksen ' + LABELS[theme.id]);
    b.title = LABELS[theme.id];
    b.addEventListener('click', function(){
      applyAccent(theme);
      saveAccent(theme.id);
    });
    swatchWrap.appendChild(b);
  });

  var savedAccentId = loadAccent();
  var startAccent = THEMES.find(function(t){ return t.id === savedAccentId; }) || THEMES[5];
  applyAccent(startAccent);

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById('burgerBtn');
  var nav = document.getElementById('mainNav');
  burger.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ nav.classList.remove('open'); burger.setAttribute('aria-expanded','false'); });
  });

  /* ---------- Supported services ---------- */
  var SERVICES = [
    { name:'MyShortLink', desc:'Shortlink populer dengan beberapa tahap verifikasi.' },
    { name:'SFL (sfl.gl)', desc:'Shortlink ringkas yang sering dipakai untuk file dan tools.' },
    { name:'Linkvertise', desc:'Shortlink dengan halaman iklan berlapis.' },
    { name:'Lootlabs', desc:'Shortlink berbasis reward dengan beberapa redirect.' },
    { name:'Work.ink', desc:'Shortlink dengan sistem task/iklan sebelum link tujuan.' },
    { name:'Platoboost', desc:'Shortlink yang umum dipakai komunitas Discord.' },
    { name:'Lockr.so', desc:'Shortlink dengan halaman kunci sebelum redirect.' },
    { name:'Boost.ink', desc:'Shortlink ringan dengan proses redirect singkat.' },
    { name:'Key System', desc:'Gerbang key-system umum sebelum link tujuan terbuka.' }
  ];
  var grid = document.getElementById('servicesGrid');
  SERVICES.forEach(function(s){
    var card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML =
      '<div class="top"><h4>' + s.name + '</h4><span class="badge">Aktif</span></div>' +
      '<p>' + s.desc + '</p>';
    grid.appendChild(card);
  });

  /* ---------- FAQ ---------- */
  var FAQS = [
    { q:'Apakah Jiyyad Bypass menyimpan link yang saya masukkan?', a:'Tidak. Link kamu diproses langsung (real-time) ke server bypass dan tidak disimpan di database kami.' },
    { q:'Apakah tool ini gratis digunakan?', a:'Ya, Jiyyad Bypass bisa dipakai tanpa biaya dan tanpa perlu membuat akun.' },
    { q:'Kenapa hasil bypass kadang gagal?', a:'Beberapa layanan shortlink sering mengubah sistem mereka. Jika gagal, coba beberapa saat lagi atau pastikan link yang ditempel masih valid.' },
    { q:'Apakah aman digunakan?', a:'Tool ini hanya mengambil link tujuan dari shortlink yang kamu masukkan sendiri, tanpa meminta data pribadi apa pun.' }
  ];
  var faqList = document.getElementById('faqList');
  FAQS.forEach(function(f){
    var item = document.createElement('details');
    item.className = 'faq-item';
    item.innerHTML = '<summary>' + f.q + '</summary><div class="faq-body">' + f.a + '</div>';
    faqList.appendChild(item);
  });

  /* ---------- Bypass tool ---------- */
  var API_URL = 'https://api.zyvor.my.id/api/bypass/bypasslinkv3';
  var input = document.getElementById('urlInput');
  var goBtn = document.getElementById('goBtn');
  var result = document.getElementById('result');
  var resultLabel = document.getElementById('resultLabel');
  var resultText = document.getElementById('resultText');
  var copyBtn = document.getElementById('copyBtn');
  var openBtn = document.getElementById('openBtn');
  var statusDot = document.getElementById('statusDot');
  var statusText = document.getElementById('statusText');

  function setStatus(state, label){
    statusDot.className = 'status-dot' + (state ? ' ' + state : '');
    statusText.textContent = label;
  }

  function showResult(state, label, text, link){
    result.className = 'result show ' + state;
    resultLabel.textContent = label;
    resultText.textContent = text;
    copyBtn.hidden = state !== 'ok';
    if (state === 'ok' && link){
      openBtn.hidden = false;
      openBtn.href = link;
    } else {
      openBtn.hidden = true;
      openBtn.removeAttribute('href');
    }
  }

  function extractUrl(data){
    if (!data) return null;
    if (typeof data === 'string') return data;
    var candidates = [data.url, data.result, data.link, data.data, data.bypass, data.output];
    for (var i = 0; i < candidates.length; i++){
      var c = candidates[i];
      if (typeof c === 'string' && c.length) return c;
      if (c && typeof c === 'object'){
        var nested = c.url || c.link || c.result;
        if (typeof nested === 'string' && nested.length) return nested;
      }
    }
    return null;
  }

  async function doBypass(){
    var url = input.value.trim();
    if (!url){
      setStatus('err', 'Error');
      showResult('err', 'ERROR', 'Masukkan link terlebih dahulu.');
      return;
    }
    goBtn.disabled = true;
    goBtn.textContent = 'MEMPROSES...';
    setStatus('busy', 'Memproses');
    result.className = 'result';

    try{
      var res = await fetch(API_URL, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ url: url })
      });
      var data = null;
      try{ data = await res.json(); }catch(e){ data = null; }

      if (!res.ok){
        var msg = (data && (data.message || data.error)) || ('Server merespon status ' + res.status);
        setStatus('err', 'Gagal');
        showResult('err', 'GAGAL', msg);
        return;
      }

      var found = extractUrl(data);
      if (found){
        setStatus('', 'Bypass Berhasil!');
        showResult('ok', 'BERHASIL', found, found);
      } else {
        setStatus('err', 'Gagal');
        showResult('err', 'GAGAL', 'Link tidak dapat diproses. Pastikan link shortlink valid.');
      }
    }catch(err){
      setStatus('err', 'Gagal');
      showResult('err', 'GAGAL', 'Tidak dapat terhubung ke server. Coba lagi beberapa saat.');
    }finally{
      goBtn.disabled = false;
      goBtn.textContent = 'BYPASS SEKARANG';
    }
  }

  goBtn.addEventListener('click', doBypass);
  input.addEventListener('keydown', function(e){ if (e.key === 'Enter') doBypass(); });

  copyBtn.addEventListener('click', async function(){
    var text = resultText.textContent;
    try{
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Tersalin';
    }catch(e){
      var range = document.createRange();
      range.selectNode(resultText);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      copyBtn.textContent = 'Tersalin';
    }
    setTimeout(function(){ copyBtn.textContent = 'Salin'; }, 1500);
  });

  document.getElementById('exampleChips').addEventListener('click', function(e){
    var btn = e.target.closest('[data-example]');
    if (!btn) return;
    input.value = btn.dataset.example;
    input.focus();
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- WhatsApp popup ---------- */
  var overlay = document.getElementById('overlay');
  var closeX = document.getElementById('closeX');
  var laterBtn = document.getElementById('laterBtn');
  var joinBtn = document.getElementById('joinBtn');
  var boomLayer = document.getElementById('boomLayer');

  function openPopup(){ overlay.classList.add('show'); }
  function closePopup(){ overlay.classList.remove('show'); }

  var popupShown = false;
  try{ popupShown = sessionStorage.getItem('jiyyad-popup-shown') === '1'; }catch(e){}
  if (!popupShown){
    setTimeout(function(){
      openPopup();
      try{ sessionStorage.setItem('jiyyad-popup-shown','1'); }catch(e){}
    }, 1800);
  }

  closeX.addEventListener('click', closePopup);
  laterBtn.addEventListener('click', closePopup);

  function playBoomSound(){
    try{
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      var now = ctx.currentTime;
      var notes = [220, 330, 440, 660];
      notes.forEach(function(freq, i){
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.0001, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.18);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.2);
      });
      setTimeout(function(){ ctx.close && ctx.close(); }, 500);
    }catch(e){ /* audio unsupported, ignore */ }
  }

  function boomEffect(x, y){
    var colors = ['#eab308','#3b82f6','#ef4444','#22c55e','#a855f7','#ec4899'];
    for (var i = 0; i < 26; i++){
      var p = document.createElement('div');
      p.className = 'boom-p';
      var angle = Math.random() * Math.PI * 2;
      var dist = 60 + Math.random() * 90;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = colors[i % colors.length];
      p.style.boxShadow = '0 0 8px 2px ' + colors[i % colors.length];
      boomLayer.appendChild(p);
      (function(el){ setTimeout(function(){ el.remove(); }, 750); })(p);
    }
  }

  joinBtn.addEventListener('click', function(){
    var rect = joinBtn.getBoundingClientRect();
    boomEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
    playBoomSound();
    setTimeout(closePopup, 220);
  });
})();
