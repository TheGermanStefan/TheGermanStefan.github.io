/* TheGermanStefan — Content Page Navigation  (v1)
   ─────────────────────────────────────────────────────────────────────
   Add to any content page: <script src="content-nav.js"></script>

   Auto-detects the current level and module from the filename, then
   injects a sticky section navigation bar below the topbar showing:
     [A1 Hub]  /  Grammar  Reading Room  Vocab Sets  Sprechen
   Active section is highlighted. All links return to the hub.
   ─────────────────────────────────────────────────────────────────────
*/
(function () {

  var BASE = 'https://thegermanstefan.github.io/';

  var HUB_FILES = {
    A0: 'TheGermanStefan_A0_Beginner_Hub.html',
    A1: 'TheGermanStefan_A1_Hub.html',
    A2: 'TheGermanStefan_A2_Hub.html',
    B1: 'TheGermanStefan_B1_Hub.html',
    B2: 'TheGermanStefan_B2_Hub.html',
    C1: 'TheGermanStefan_C1_Hub.html',
    C2: 'TheGermanStefan_C2_Hub.html'
  };

  /* Sections in hub order — hub-section-nav.js assigns hub-s0…hub-s3 */
  var SECTIONS = [
    { key: 'grammar',  label: 'Grammar',      icon: '📚', hash: 'hub-s0' },
    { key: 'reading',  label: 'Reading Room',  icon: '📖', hash: 'hub-s1' },
    { key: 'vocab',    label: 'Vocab Sets',    icon: '🗂️', hash: 'hub-s2' },
    { key: 'sprechen', label: 'Sprechen',      icon: '🗣️', hash: 'hub-s3' }
  ];

  /* ── Detect level + module from filename ───────────────────────── */
  var filename = window.location.pathname.split('/').pop() ||
                 window.location.href.split('/').pop().split('?')[0];

  /* Pattern: A1_Grammar_01_... or B2_Vocab_03... */
  var m = filename.match(/^([ABC][012])_([A-Za-z]+)_/);
  if (!m) return;

  var level  = m[1].toUpperCase();          /* "A1" */
  var module = m[2].toLowerCase();          /* "grammar", "reading", "vocab", "sprechen" */

  var hubFile = HUB_FILES[level];
  if (!hubFile) return;

  /* ── CSS ──────────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '.tgs-content-nav{',
    '  background:#0d3a4a;display:flex;align-items:center;',
    '  gap:4px;padding:5px 14px;overflow-x:auto;scrollbar-width:none;',
    '  position:sticky;top:52px;z-index:195;',
    '  border-bottom:2px solid rgba(255,255,255,.1);',
    "  font-family:'Segoe UI',Arial,sans-serif;",
    '}',
    '.tgs-content-nav::-webkit-scrollbar{display:none;}',
    '.tgs-cn-home{',
    '  display:flex;align-items:center;gap:5px;',
    '  color:rgba(255,255,255,.5);font-size:11px;font-weight:700;',
    '  text-decoration:none;padding:4px 8px;border-radius:6px;',
    '  white-space:nowrap;transition:color .15s;flex-shrink:0;',
    '}',
    '.tgs-cn-home:hover{color:#fff;}',
    '.tgs-cn-sep{color:rgba(255,255,255,.22);font-size:14px;flex-shrink:0;padding:0 3px;}',
    '.tgs-cn-item{',
    '  display:flex;align-items:center;gap:5px;',
    '  color:rgba(255,255,255,.6);font-size:12px;font-weight:700;',
    '  text-decoration:none;padding:5px 11px;border-radius:7px;',
    '  white-space:nowrap;background:rgba(255,255,255,.06);',
    '  border:1px solid transparent;transition:.15s;',
    '}',
    '.tgs-cn-item:hover{background:rgba(255,255,255,.14);color:#fff;}',
    '.tgs-cn-item.active{',
    '  background:rgba(0,188,212,.2);',
    '  border-color:rgba(0,188,212,.5);',
    '  color:#00bcd4;',
    '}',
  ].join('');
  document.head.appendChild(style);

  /* ── Build nav ──────────────────────────────────────────────── */
  var nav = document.createElement('nav');
  nav.className = 'tgs-content-nav';
  nav.setAttribute('aria-label', 'Hub sections');

  /* Hub home link */
  var home = document.createElement('a');
  home.href = BASE + hubFile;
  home.className = 'tgs-cn-home';
  home.title = 'Back to ' + level + ' Hub';
  home.innerHTML = '🏠&nbsp;' + level + ' Hub';
  nav.appendChild(home);

  var sep = document.createElement('span');
  sep.className = 'tgs-cn-sep';
  sep.textContent = '/';
  nav.appendChild(sep);

  /* Section links */
  SECTIONS.forEach(function (sec) {
    var a = document.createElement('a');
    a.href = BASE + hubFile + '#' + sec.hash;
    a.className = 'tgs-cn-item' + (module === sec.key ? ' active' : '');
    a.innerHTML = sec.icon + '&nbsp;' + sec.label;
    nav.appendChild(a);
  });

  /* ── Insert immediately after .topbar ────────────────────────── */
  var topbar = document.querySelector('.topbar');
  if (topbar && topbar.nextSibling) {
    topbar.parentNode.insertBefore(nav, topbar.nextSibling);
  } else {
    document.body.insertBefore(nav, document.body.firstChild);
  }

  /* ── Also fix the in-page breadcrumb hub link ────────────────── */
  /* Breadcrumbs were built with wrong filenames like "A1_hub.html" */
  document.querySelectorAll('.bc a').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (/^[ABC][012]_hub\.html$/i.test(href)) {
      a.href = BASE + hubFile;
    }
    if (/^index\.html$/i.test(href)) {
      a.href = BASE;
    }
  });

})();
