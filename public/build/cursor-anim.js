/* cursor-anim.js — animated cursors via CSS sprite sheets.
   Browsers can't animate a .cur, so a pointer-following div shows the
   .ani frames as a horizontal sprite strip driven by a steps() keyframe. */
(function () {
  'use strict';
  var DIR = 'build/assets/cursors/sheets/';
  // type: [selector, sheet steps, duration ms, hotspotX, hotspotY]
  var TYPES = [
    { k: 'text', sel: 'input, textarea', n: 2, ms: 334, hx: 16, hy: 16 },
    { k: 'link', sel: 'a, button, .navb, .topnav a, .contact a, .cmtform button, .amp-ctrls button, .amp-pl .pli, .amp-launcher, .w95 .tbar button, .webring a, #discordCopy, .gallery .cell', n: 8, ms: 400, hx: 0, hy: 0 },
    { k: 'busy', sel: '.amp-inner, .disc, .amp-viz, .amp-meta, .dose', n: 8, ms: 536, hx: 21, hy: 21 },
    { k: 'wib', sel: '.crt, .pfp-frame', n: 8, ms: 400, hx: 0, hy: 0 }
  ];

  // inject styles
  var css = '.kcur{position:fixed;left:-99px;top:-99px;width:32px;height:32px;pointer-events:none;z-index:99999;display:none;background-repeat:no-repeat;image-rendering:pixelated;}'
          + '.kcur.on{display:block;}';
  TYPES.forEach(function (t) {
    css += '.kcur.t-' + t.k + '{background-image:url(' + DIR + t.k + '.png);animation:kc-' + t.k + ' ' + t.ms + 'ms steps(' + t.n + ') infinite;}';
    css += '@keyframes kc-' + t.k + '{to{background-position-x:-' + (t.n * 32) + 'px;}}';
  });
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var el = document.createElement('div'); el.className = 'kcur';
  function mount() { if (document.body && !el.parentNode) document.body.appendChild(el); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  var cur = null;
  document.addEventListener('pointermove', function (e) {
    var match = null;
    if (e.target && e.target.closest) {
      for (var i = 0; i < TYPES.length; i++) { if (e.target.closest(TYPES[i].sel)) { match = TYPES[i]; break; } }
    }
    if (match) {
      mount();
      el.style.left = (e.clientX - match.hx) + 'px';
      el.style.top = (e.clientY - match.hy) + 'px';
      if (cur !== match.k) { cur = match.k; el.className = 'kcur on t-' + match.k; }
    } else if (cur) { cur = null; el.className = 'kcur'; }
  }, { passive: true });

  window.addEventListener('blur', function () { cur = null; el.className = 'kcur'; });
})();
