/* profile.js — interactions for kumuii.dev profile
   depends on ChipSynth (synth.js) loaded first. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  /* ---------- rain ---------- */
  (function rain() {
    const r = $('#rain'); if (!r) return;
    let html = '';
    for (let i = 0; i < 70; i++) {
      const left = Math.random() * 100, dur = 0.45 + Math.random() * 0.9,
        delay = Math.random() * 2, h = 40 + Math.random() * 70, op = 0.12 + Math.random() * 0.4;
      html += '<div class="drop" style="left:' + left + '%;height:' + h + 'px;opacity:' + op +
        ';animation-duration:' + dur + 's;animation-delay:-' + delay + 's"></div>';
    }
    r.innerHTML = html;
  })();

  /* ---------- clocks ---------- */
  (function () {
    const el = $('#lastactive');
    function t() {
      const d = new Date();
      if (el) el.textContent = [d.getHours(), d.getMinutes()].map(x => String(x).padStart(2, '0')).join(':') + ' · online';
    }
    t(); setInterval(t, 30000);
  })();

  /* ---------- visitor counter ---------- */
  (function () {
    const el = $('#counter'); if (!el) return;
    let n = parseInt(localStorage.getItem('kumuii_visits') || '40117', 10) + 1;
    localStorage.setItem('kumuii_visits', n);
    el.innerHTML = String(n).padStart(6, '0').split('').map(d => '<span>' + d + '</span>').join('');
  })();

  /* ---------- dosimeter (flavor HUD) ---------- */
  (function () {
    const el = $('#dose'); if (!el) return;
    function tick() {
      const base = 12 + Math.random() * 9;
      el.textContent = base.toFixed(2);
      setTimeout(tick, 600 + Math.random() * 900);
    }
    tick();
  })();

  /* ---------- discord copy ---------- */
  (function () {
    const d = $('#discordCopy'); if (!d) return;
    d.addEventListener('click', e => {
      e.preventDefault();
      const handle = d.dataset.handle || 'kumuii';
      navigator.clipboard && navigator.clipboard.writeText(handle);
      const old = d.querySelector('.lbl').textContent;
      d.querySelector('.lbl').textContent = 'copied: ' + handle + ' ✓';
      setTimeout(() => { d.querySelector('.lbl').textContent = old; }, 1600);
    });
  })();

  /* ---------- gallery lightbox ---------- */
  (function () {
    const box = $('#lightbox'); if (!box) return;
    const img = $('#lightbox img');
    $$('.gallery .cell').forEach(c => {
      c.addEventListener('click', () => {
        const src = c.dataset.full || c.querySelector('img,video') && (c.querySelector('img') ? c.querySelector('img').src : '');
        if (!src) return;
        img.src = src; box.classList.add('open');
      });
    });
    box.addEventListener('click', () => { box.classList.remove('open'); img.removeAttribute('src'); });
  })();

  /* ====================================================================
     MUSIC PLAYER  (draggable Win95 window, vinyl, synth + your tracks)
     To add YOUR tracks: drop audio in build/tracks/ and add entries:
        { name:'My Track', by:'kumuii', src:'build/tracks/mytrack.mp3', cover:'build/assets/pfp.png' }
     ==================================================================== */
  const PLAYLIST = [
    { name: 'Mr. Kill Myself', by: 'Sewerslvt', src: 'build/assets/sewerslvt-draining-love-story-08.mp3', cover: 'build/assets/album-cover.png' },
  ];
  const DEFAULT_COVER = 'build/assets/album-cover.png';
  let BG_VOLUME = 0.25;

  const synth = (typeof ChipSynth !== 'undefined') ? new ChipSynth() : null;
  if (synth) synth.setVolume(0.7);
  const audio = new Audio(); audio.preload = 'auto'; audio.volume = BG_VOLUME;
  audio.muted = false; // background music audible (starts on first interaction due to autoplay rules)
  let cur = 0, playing = false, userPaused = false, secs = 0, secTimer = null;

  // resume background track where it left off
  const POS_KEY = 'kumuii_track_pos';
  audio.addEventListener('loadedmetadata', () => {
    const saved = parseFloat(localStorage.getItem(POS_KEY) || '0');
    if (saved && isFinite(saved) && saved < audio.duration - 0.5) { try { audio.currentTime = saved; } catch (e) {} }
  });
  audio.addEventListener('timeupdate', () => { localStorage.setItem(POS_KEY, audio.currentTime); });

  const win = $('#ampWin'), launcher = $('#ampLauncher');
  const vinyl = $('#vinyl'), cover = $('#ampCover');
  const nm = $('#ampNm'), by = $('#ampBy'), tm = $('#ampTime'), sub = $('#ampSub');
  const playBtn = $('#ampPlay');
  const plEl = $('#ampPl');

  // build playlist UI
  PLAYLIST.forEach((t, i) => {
    const d = document.createElement('div'); d.className = 'pli';
    d.innerHTML = '<span class="n">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="ti">' + t.name + '</span><span class="tg">' + (t.src ? 'wav' : 'syn') + '</span>';
    d.onclick = () => { cur = i; start(); };
    plEl.appendChild(d);
  });
  const plItems = $$('.pli', plEl);

  // volume control (slider + - / +), persists in localStorage
  (function () {
    const vol = $('#ampVol'), pct = $('#ampVolPct'), vd = $('#ampVolDown'), vu = $('#ampVolUp');
    if (!vol) return;
    function apply(v) {
      v = Math.max(0, Math.min(100, Math.round(v)));
      BG_VOLUME = v / 100;
      audio.volume = v / 100;
      vol.value = v;
      if (pct) pct.textContent = v + '%';
      try { localStorage.setItem('kumuii_vol', v); } catch (e) {}
    }
    apply(25); // always start at 25%
    vol.addEventListener('input', () => apply(parseInt(vol.value, 10)));
    vd && vd.addEventListener('click', () => apply(parseInt(vol.value, 10) - 10));
    vu && vu.addEventListener('click', () => apply(parseInt(vol.value, 10) + 10));
  })();

  // viz
  const viz = $('#ampViz');
  for (let i = 0; i < 22; i++) viz.appendChild(document.createElement('i'));
  const bars = $$('i', viz);
  let vraf;
  function animViz(on) {
    clearTimeout(vraf);
    if (!on) { bars.forEach(b => b.style.height = '10%'); return; }
    (function loop() { bars.forEach(b => b.style.height = (10 + Math.random() * 90) + '%'); vraf = setTimeout(loop, 95); })();
  }

  function paint() { plItems.forEach((it, i) => it.classList.toggle('on', i === cur && playing)); }
  function setInfo() {
    const t = PLAYLIST[cur];
    nm.innerHTML = '<span class="s">' + t.name + '</span>';
    by.textContent = t.by || 'kumuii';
    cover.src = t.cover || DEFAULT_COVER;
    sub.textContent = playing ? (t.src ? 'playing · audio' : 'playing · synth') : 'stopped';
  }
  function uiPlaying() {
    playing = true;
    playBtn.textContent = '❚❚';
    vinyl.classList.add('spin'); cover.classList.add('spin');
    setInfo(); paint(); animViz(true);
    clearInterval(secTimer);
    secTimer = setInterval(() => { tm.textContent = Math.floor(audio.currentTime / 60) + ':' + String(Math.floor(audio.currentTime % 60)).padStart(2, '0'); }, 500);
  }
  function start() {
    stopAll(); userPaused = false;
    const t = PLAYLIST[cur];
    if (t.src) {
      if (audio.src.indexOf(t.src) === -1) audio.src = t.src;
      audio.loop = true; audio.volume = BG_VOLUME;
      const pr = audio.play();
      if (pr && pr.then) pr.then(uiPlaying).catch(() => { /* autoplay blocked — waits for interaction */ });
      else uiPlaying();
    } else if (synth) { synth.play(t.chip); uiPlaying(); }
  }
  function stopAll() { if (synth) synth.stop(); audio.pause(); }
  function stop() {
    playing = false; userPaused = true; stopAll(); playBtn.textContent = '▶';
    vinyl.classList.remove('spin'); cover.classList.remove('spin');
    setInfo(); paint(); animViz(false); clearInterval(secTimer);
  }
  playBtn.onclick = () => playing ? stop() : start();
  $('#ampNext').onclick = () => { cur = (cur + 1) % PLAYLIST.length; start(); };
  $('#ampPrev').onclick = () => { cur = (cur - 1 + PLAYLIST.length) % PLAYLIST.length; start(); };
  audio.addEventListener('ended', () => { cur = (cur + 1) % PLAYLIST.length; start(); });
  setInfo();

  // ---- background music: low-volume autostart, retry once on first interaction ----
  start();
  let bgKicked = false;
  function bgKick() {
    if (bgKicked) return; bgKicked = true;
    if (audio.paused && !userPaused) start();
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.removeEventListener(ev, bgKick));
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, bgKick));

  // open / minimize / close
  function openWin() { win.style.display = 'block'; launcher.style.display = 'none'; }
  function hideWin() { win.style.display = 'none'; launcher.style.display = 'flex'; }
  launcher.addEventListener('click', openWin);
  $('#ampMin').addEventListener('click', hideWin);
  $('#ampClose').addEventListener('click', () => { stop(); hideWin(); });

  // drag
  (function drag() {
    const bar = $('#ampDrag'); let sx, sy, ox, oy, on = false;
    bar.addEventListener('mousedown', e => {
      if (e.target.closest('button')) return;
      on = true; sx = e.clientX; sy = e.clientY;
      const r = win.getBoundingClientRect(); ox = r.left; oy = r.top;
      win.style.right = 'auto'; bar.style.cursor = 'grabbing'; e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!on) return;
      let nx = ox + (e.clientX - sx), ny = oy + (e.clientY - sy);
      nx = Math.max(0, Math.min(window.innerWidth - 120, nx));
      ny = Math.max(0, Math.min(window.innerHeight - 40, ny));
      win.style.left = nx + 'px'; win.style.top = ny + 'px';
    });
    window.addEventListener('mouseup', () => { on = false; bar.style.cursor = 'grab'; });
  })();

  /* ---------- comments (persist) ---------- */
  (function () {
    const list = $('#cmtList'); if (!list) return;
    const AV = ['build/assets/pfp.png', 'build/assets/moe.jpg', 'build/assets/puppy.jpg', 'build/assets/city2.jpg'];
    const esc = s => String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
    function add(m) {
      const d = document.createElement('div'); d.className = 'cmt';
      const av = AV[Math.floor(Math.random() * AV.length)];
      d.innerHTML = '<div class="av"><img src="' + av + '" alt=""></div><div class="bd"><span class="who">' +
        esc(m.who) + '</span><span class="when">just now</span><p>' + esc(m.msg) + '</p></div>';
      list.appendChild(d);
    }
    (JSON.parse(localStorage.getItem('kumuii_cmts') || '[]')).forEach(add);
    $('#cSend').onclick = () => {
      const who = ($('#cName').value.trim() || 'anon_node'), msg = $('#cMsg').value.trim();
      if (!msg) return; add({ who, msg });
      const s = JSON.parse(localStorage.getItem('kumuii_cmts') || '[]');
      s.push({ who, msg }); localStorage.setItem('kumuii_cmts', JSON.stringify(s));
      $('#cMsg').value = ''; $('#cName').value = '';
    };
  })();
})();
