/* TheGermanStefan — Level Navigation Bar  (v3)
   ─────────────────────────────────────────────────────────────────────
   Add to any hub page: <script src="level-nav.js"></script>  before </body>

   v3 additions over v2:
   • Loads hub-premium-cta.js  — replaces squeezed image banners with a
     clean premium upgrade card ($19/month, no images)
   • Loads hub-hero.js         — places banner image as a full-width hero
     at the top of the hub's main content area
   ─────────────────────────────────────────────────────────────────────
*/
(function () {

  /* ── 0. Fix C1/C2 topnav ─────────────────────────────────────────── */
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

  /* ── 2. Fix C1/C2 tab bar top offset ─────────────────────────────── */
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

  /* ── 3. Load additional enhancement scripts ───────────────────────── */
  ['hub-section-nav.js', 'hub-premium-cta.js', 'hub-hero.js'].forEach(function (src) {
    var s = document.createElement('script');
    s.src = src;
    document.body.appendChild(s);
  });

})();
