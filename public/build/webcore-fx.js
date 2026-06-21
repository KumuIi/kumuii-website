/* webcore-fx.js — authentic Y2K raster effects, hand-built so they actually
   animate (real pixels on canvas, not smooth CSS gradients):
   · pixel-sprite engine (flames, stars, hearts, skull, envelope)
   · scrolling "under construction" caution bar
   · sparkle cursor trail
   · falling stars overlay
   No external assets. oneko cat + chiptune live in their own files. */
(function (global) {
  'use strict';

  // ---- shared palette ----
  const P = {
    '.': null,
    k: '#0c0014', w: '#ffffff', K: '#1a0726',
    r: '#ff1e3c', R: '#b3001b', o: '#ff7a00', y: '#ffe11a', Y: '#fff7a8',
    p: '#ff5fcb', P: '#ff1493', m: '#9d4bff', c: '#34f5ff', C: '#0bd1e0',
    g: '#aaff2a', G: '#5fbf00', b: '#1a0426', s: '#c9a6e6',
  };

  function drawSprite(ctx, frame, scale, pal) {
    const rows = frame;
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const col = pal[row[x]];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  // mount an animated pixel sprite into a canvas element
  function mountSprite(canvas, frames, opts) {
    opts = opts || {};
    const scale = opts.scale || 4;
    const fps = opts.fps || 6;
    const pal = opts.pal || P;
    const cols = frames[0][0].length, rowN = frames[0].length;
    canvas.width = cols * scale; canvas.height = rowN * scale;
    canvas.style.imageRendering = 'pixelated';
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    let f = 0, last = 0;
    function loop(t) {
      if (!canvas.isConnected) return;
      if (t - last > 1000 / fps) {
        last = t;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSprite(ctx, frames[f % frames.length], scale, pal);
        f++;
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // ---------- SPRITE DATA ----------
  // flame (8 wide x 12 tall), 4 flicker frames
  const FLAME = [
    ['...y....','..yoy...','..oro...','.yorry..','.orrro..','yorrroy.','orRRrro.','orRRRro.','yorRrroy','.orrro..','..ooo...','...o....'],
    ['....y...','...yoy..','...oro..','..yorry.','..orrro.','.yorrroy','.orRRrro','yorRRRro','orRrroy.','.orrroy.','..ooo...','...oo...'],
    ['...y....','..yoy...','...ro...','..rrry..','.yorro..','.orrroy.','orRRrro.','orRRRro.','yorRrro.','..orro..','...oo...','...o....'],
    ['....y...','...yo...','..yoro..','..orro..','.yorroy.','.orrrro.','yorRRro.','.orRRro.','.orRroy.','..orro..','..ooo...','...o....'],
  ];

  // star (9x9), 4 rotation frames (sparkle)
  const STAR = [
    ['....y....','....y....','....y....','.y..y..y.','..yyYyy..','.y..y..y.','....y....','....y....','....y....'],
    ['.........','...y.y...','....y....','.y.yYy.y.','..yYwYy..','.y.yYy.y.','....y....','...y.y...','.........'],
    ['....y....','....Y....','..y.Y.y..','...yYy...','yYYYwYYYy','...yYy...','..y.Y.y..','....Y....','....y....'],
    ['.........','...y.y...','....y....','.y.yYy.y.','..yYwYy..','.y.yYy.y.','....y....','...y.y...','.........'],
  ];

  // heart (9x8), 2 beat frames
  const HEART = [
    ['.PP...PP.','PppP.PppP','PpppPpppP','PppprpppP','.PpppppP.','..PpppP..','...PpP...','....P....'],
    ['.pp...pp.','ppPp.pPpp','pPPPpPPPp','pPPPrPPPp','.pPPPPPp.','..pPPPp..','...ppp...','....p....'],
  ];

  // skull (8x8), 2 frames (blink)
  const SKULL = [
    ['.wwwww..','wwwwwww.','wkwkwww.','wwwwwww.','wwkwkww.','.wwwww..','.w.w.w..','.w.w.w..'],
    ['.wwwww..','wwwwwww.','wwkwkww.','wwwwwww.','wkwwwkw.','.wwwww..','.w.w.w..','.w.w.w..'],
  ];

  // envelope (12x8), 2 frames (flap / @)
  const MAIL = [
    ['cccccccccccc','cwwwwwwwwwwc','cwCwwwwwwCwc','cwwCwwwwCwwc','cwwwCwwCwwwc','cwwwwCCwwwwc','cwwwwwwwwwwc','cccccccccccc'],
    ['cccccccccccc','cwwwwwwwwwwc','cwwwwwwwwwwc','cwwwggwwwwc.','cwwgwwgwwwwc','cwwgwggwwwwc','cwwwggwwwwwc','cccccccccccc'],
  ];

  // ---------- caution bar ----------
  function mountCaution(canvas, text, opts) {
    opts = opts || {};
    const h = opts.height || 28;
    const w = opts.width || 240;
    canvas.width = w; canvas.height = h;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    let off = 0;
    function loop() {
      if (!canvas.isConnected) return;
      // diagonal hazard stripes
      ctx.clearRect(0, 0, w, h);
      const sw = 16;
      for (let x = -h; x < w + h; x += sw) {
        ctx.fillStyle = (Math.floor((x + off) / sw) % 2 === 0) ? '#ffd400' : '#15151a';
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + h, 0); ctx.lineTo(x, h); ctx.lineTo(x - sw, h); ctx.lineTo(x - sw + h, 0);
        ctx.closePath(); ctx.fill();
      }
      // text plate
      ctx.font = 'bold 13px "Pixelify Sans", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(text).width + 18;
      ctx.fillStyle = '#15151a'; ctx.fillRect(w / 2 - tw / 2, 4, tw, h - 8);
      ctx.fillStyle = '#ffd400'; ctx.fillText(text, w / 2, h / 2 + 1);
      off = (off + 0.6) % 32;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // ---------- sparkle cursor trail ----------
  function cursorSparkles(opts) {
    opts = opts || {};
    const colors = opts.colors || ['#ff5fcb', '#34f5ff', '#aaff2a', '#ffffff', '#9d4bff'];
    const layer = document.createElement('div');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99998;overflow:hidden';
    document.body.appendChild(layer);
    let last = 0;
    document.addEventListener('mousemove', e => {
      const now = performance.now();
      if (now - last < 28) return;
      last = now;
      const s = document.createElement('div');
      const size = 4 + Math.random() * 6;
      const col = colors[(Math.random() * colors.length) | 0];
      s.style.cssText =
        `position:absolute;left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px;` +
        `background:${col};box-shadow:0 0 6px ${col};transform:translate(-50%,-50%) rotate(45deg);` +
        `transition:all .7s ease-out;opacity:1;image-rendering:pixelated`;
      layer.appendChild(s);
      requestAnimationFrame(() => {
        s.style.top = (e.clientY + 18 + Math.random() * 16) + 'px';
        s.style.left = (e.clientX + (Math.random() * 24 - 12)) + 'px';
        s.style.opacity = '0';
        s.style.transform = 'translate(-50%,-50%) rotate(225deg) scale(.2)';
      });
      setTimeout(() => s.remove(), 720);
    });
  }

  // ---------- falling stars ----------
  function fallingStars(container, opts) {
    opts = opts || {};
    const n = opts.count || 22;
    const glyphs = opts.glyphs || ['✦', '✧', '★', '☆', '♥', '✿'];
    const colors = opts.colors || ['#ff5fcb', '#34f5ff', '#aaff2a', '#ffe11a'];
    const layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1';
    container.appendChild(layer);
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      const dur = 6 + Math.random() * 8;
      el.textContent = glyphs[(Math.random() * glyphs.length) | 0];
      el.style.cssText =
        `position:absolute;left:${Math.random() * 100}%;top:-30px;` +
        `color:${colors[(Math.random() * colors.length) | 0]};` +
        `font-size:${10 + Math.random() * 14}px;opacity:.0;` +
        `animation:fxfall ${dur}s linear ${Math.random() * dur}s infinite`;
      layer.appendChild(el);
    }
    if (!document.getElementById('fxfall-kf')) {
      const st = document.createElement('style'); st.id = 'fxfall-kf';
      st.textContent = '@keyframes fxfall{0%{transform:translateY(0) rotate(0);opacity:0}' +
        '10%{opacity:.9}90%{opacity:.9}100%{transform:translateY(900px) rotate(360deg);opacity:0}}';
      document.head.appendChild(st);
    }
  }

  global.WebcoreFX = {
    mountSprite, mountCaution, cursorSparkles, fallingStars, P,
    sprites: { FLAME, STAR, HEART, SKULL, MAIL },
  };
})(window);
