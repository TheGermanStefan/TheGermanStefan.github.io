/* TheGermanStefan — Level Navigation Bar  (v2)
   ─────────────────────────────────────────────────────────────────────
   Add to any hub page: <script src="level-nav.js"></script>  before </body>

   v2 additions:
   • Automatically fixes C1/C2 topnav (makes it sticky so the bar anchors correctly)
   • Adjusts C1/C2 tab bar top offset so it sits below the level nav
   • Dynamically loads hub-section-nav.js for section jump-links on A1–B2 hubs
   ─────────────────────────────────────────────────────────────────────
*/
(function () {

  /* ── 0. Fix C1/C2 topnav: make sticky + add .topbar class ──────────
     C1/C2 use <nav class="topnav"> with no sticky positioning.
     level-nav looks for .topbar; adding the class lets it anchor correctly.
  ─────────────────────────────────────────────────────────────────── */
  var topnavEl = document.querySelector('.topnav:not(.topbar)');
  if (topnavEl) {
    topnavEl.classList.add('topbar');
    topnavEl.style.position = 'sticky';
    topnavEl.style.top      = '0';
    topnavEl.style.zIndex   = '200';
  }

  /* ── 1. Level navigation bar ──────────────────────────────────────── */
  var BASE  = 'https://thegermanstefan.github.io/';
  var pages = [
    { id:'a0',     emoji:'🌱', label:'A0',      badge:'FREE',    cls:'free',    file:'TheGermanStefan_A0_Beginner_Hub.html' },
    { id:'a1',     emoji:'🇩🇪', label:'A1',      badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_A1_Hub.html' },
    { id:'a2',     emoji:'📗',  label:'A2',      badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_A2_Hub.html' },
    { id:'b1',     emoji:'📘',  label:'B1',      badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_B1_Hub.html' },
    { id:'b2',     emoji:'📕',  label:'B2',      badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_B2_Hub.html' },
    { id:'c1',     emoji:'🏆',  label:'C1',      badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_C1_Hub.html' },
    { id:'c2',     emoji:'🎓',  label:'C2',      badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_C2_Hub.html' },
    { id:'vocab',  emoji:'📚',  label:'Vocab',   badge:'FREE',    cls:'free',    file:'TheGermanStefan_Vocab_Hub.html' },
    { id:'skills', emoji:'🎯',  label:'Special', badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_Special_Skills_Hub.html' },
    { id:'exam',   emoji:'🎖️', label:'Exams',   badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_Exam_Room.html' }
  ];

  var current = window.location.pathname.split('/').pop();

  var css = [
    '.tgs-level-nav{',
    '  background:#0a2240;display:flex;gap:6px;padding:8px 14px;',
    '  overflow-x:auto;scrollbar-width:none;',
    '  position:sticky;top:52px;z-index:198;',
    '  border-bottom:2px solid rgba(255,255,255,.12);',
    '}',
    '.tgs-level-nav::-webkit-scrollbar{display:none;}',
    '.tgs-ln-item{',
    '  display:flex;flex-direction:column;align-items:center;gap:3px;',
    '  padding:5px 11px;border-radius:8px;text-decoration:none;',
    '  color:rgba(255,255,255,.75);font-size:12px;font-weight:700;',
    '  white-space:nowrap;background:rgba(255,255,255,.07);',
    '  border:1px solid transparent;transition:background .15s,color .15s;',
    "  font-family:'Segoe UI',Arial,sans-serif;",
    '}',
    '.tgs-ln-item:hover{background:rgba(255,255,255,.16);color:#fff;}',
    '.tgs-ln-item.tgs-active{background:rgba(255,255,255,.22);border-color:rgba(255,255,255,.35);color:#fff;}',
    '.tgs-ln-emoji{font-size:14px;line-height:1;}',
    '.tgs-ln-label{font-size:11px;font-weight:800;letter-spacing:.3px;}',
    '.tgs-ln-badge{font-size:8px;font-weight:900;padding:1px 5px;border-radius:6px;letter-spacing:.4px;text-transform:uppercase;}',
    '.tgs-ln-badge.free{background:#16a34a;color:#fff;}',
    '.tgs-ln-badge.premium{background:#f9a825;color:#000;}',
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var nav = document.createElement('nav');
  nav.className = 'tgs-level-nav';

  pages.forEach(function (p) {
    var a = document.createElement('a');
    a.href = BASE + p.file;
    a.className = 'tgs-ln-item' + (p.file === current ? ' tgs-active' : '');
    a.innerHTML =
      '<span class="tgs-ln-emoji">' + p.emoji + '</span>' +
      '<span class="tgs-ln-label">' + p.label + '</span>' +
      '<span class="tgs-ln-badge ' + p.cls + '">' + p.badge + '</span>';
    nav.appendChild(a);
  });

  var topbar = document.querySelector('.topbar');
  if (topbar && topbar.nextSibling) {
    topbar.parentNode.insertBefore(nav, topbar.nextSibling);
  } else {
    document.body.insertBefore(nav, document.body.firstChild);
  }

  /* ── 2. Fix C1/C2 tab bar top offset ──────────────────────────────
     After inserting the level-nav, measure actual heights and push
     the .tabs bar below both the topnav and the level-nav.
  ─────────────────────────────────────────────────────────────────── */
  setTimeout(function () {
    var tabsEl = document.querySelector('.tabs');
    if (tabsEl) {
      var h = 0;
      ['.topbar', '.tgs-level-nav'].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) h += el.offsetHeight;
      });
      tabsEl.style.top = Math.max(h, 52) + 'px';
    }
  }, 0);

  /* ── 3. Load hub-section-nav.js ────────────────────────────────────
     Creates the section jump-links bar on A1, A2, B1, B2 hubs.
     Is a no-op on pages that don't have the expected section patterns.
  ─────────────────────────────────────────────────────────────────── */
  var s = document.createElement('script');
  s.src = 'hub-section-nav.js';
  document.body.appendChild(s);

})();
