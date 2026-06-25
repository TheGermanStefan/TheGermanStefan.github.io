/* TheGermanStefan — Hub Section Navigation Bar
   Auto-detects sections on any level hub and adds a sticky scroll-nav.
   Usage: <script src="hub-section-nav.js"></script>  (after level-nav.js)
*/
(function () {
  function init() {
    var sections = [];

    /* ── Pattern A: A1 / A2 style ────────────────────────────────
       <div class="section">
         <div class="sec-hdr">
           <div class="sec-icon">📖</div>
           <div>
             <div class="sec-title" data-t="…">Grammar</div>
    ──────────────────────────────────────────────────────────── */
    document.querySelectorAll('.section').forEach(function (sec, i) {
      var titleEl = sec.querySelector('.sec-title');
      var iconEl  = sec.querySelector('.sec-icon');
      if (titleEl) {
        if (!sec.id) sec.id = 'hub-s' + i;
        sections.push({ id: sec.id, icon: iconEl ? iconEl.textContent.trim() : '', label: titleEl.textContent.trim() });
      }
    });

    /* ── Pattern B: B1 / B2 style ────────────────────────────────
       <div class="section-hdr">
         <span class="section-icon">📐</span>
         <span class="section-title">Grammar</span>
    ──────────────────────────────────────────────────────────── */
    if (sections.length === 0) {
      document.querySelectorAll('.section-hdr').forEach(function (hdr, i) {
        var titleEl = hdr.querySelector('.section-title');
        var iconEl  = hdr.querySelector('.section-icon');
        if (titleEl) {
          if (!hdr.id) hdr.id = 'hub-s' + i;
          sections.push({ id: hdr.id, icon: iconEl ? iconEl.textContent.trim() : '', label: titleEl.textContent.trim() });
        }
      });
    }

    if (sections.length < 2) return; // nothing to navigate

    /* ── Calculate sticky offset ─────────────────────────────── */
    var topOffset = 0;
    ['.topbar', '.tgs-level-nav', '.pgstrip'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) topOffset += el.offsetHeight;
    });
    topOffset = Math.max(topOffset, 52);

    /* ── CSS ─────────────────────────────────────────────────── */
    var css = [
      '.tgs-sec-nav{',
        'background:#fff;',
        'display:flex;',
        'align-items:stretch;',
        'padding:0 10px;',
        'overflow-x:auto;',
        'scrollbar-width:none;',
        'position:sticky;',
        'top:' + topOffset + 'px;',
        'z-index:195;',
        'border-bottom:2px solid #e0e6f0;',
        'box-shadow:0 2px 8px rgba(0,0,0,.07);',
      '}',
      '.tgs-sec-nav::-webkit-scrollbar{display:none;}',
      '.tgs-sn-btn{',
        'display:inline-flex;',
        'align-items:center;',
        'gap:6px;',
        'padding:10px 16px;',
        'border:none;',
        'border-bottom:3px solid transparent;',
        'background:transparent;',
        'color:#555;',
        'font-size:13px;',
        'font-weight:700;',
        'cursor:pointer;',
        'white-space:nowrap;',
        'transition:color .15s,background .15s,border-color .15s;',
        'font-family:\'Segoe UI\',Arial,sans-serif;',
        'line-height:1.3;',
      '}',
      '.tgs-sn-btn:hover{color:#0b2545;background:#f5f7fa;}',
      '.tgs-sn-btn.on{color:var(--lc,#1464b4);border-bottom-color:var(--lc,#1464b4);background:#f0f6ff;}',
      '.tgs-sn-icon{font-size:15px;line-height:1;}',
    ].join('');

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    /* ── Build nav ───────────────────────────────────────────── */
    var nav = document.createElement('nav');
    nav.className = 'tgs-sec-nav';
    nav.setAttribute('aria-label', 'Section navigation');

    sections.forEach(function (sec, idx) {
      var btn = document.createElement('button');
      btn.className = 'tgs-sn-btn' + (idx === 0 ? ' on' : '');
      btn.innerHTML =
        (sec.icon ? '<span class="tgs-sn-icon">' + sec.icon + '</span>' : '') +
        '<span>' + sec.label + '</span>';
      btn.addEventListener('click', function () {
        var el = document.getElementById(sec.id);
        if (!el) return;
        var scrollTo = el.getBoundingClientRect().top + window.scrollY - topOffset - nav.offsetHeight - 12;
        window.scrollTo({ top: Math.max(0, scrollTo), behavior: 'smooth' });
        nav.querySelectorAll('.tgs-sn-btn').forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
      });
      nav.appendChild(btn);
    });

    /* ── Inject: after level-nav, then pgstrip, then topbar ─── */
    var anchor =
      document.querySelector('.tgs-level-nav') ||
      document.querySelector('.pgstrip') ||
      document.querySelector('.topbar');

    if (anchor) {
      anchor.parentNode.insertBefore(nav, anchor.nextSibling);
    } else {
      document.body.insertBefore(nav, document.body.firstChild);
    }

    /* ── Update sticky top if offset changed after insert ────── */
    nav.style.top = topOffset + 'px';

    /* ── Scroll-spy ─────────────────────────────────────────── */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var idx = sections.findIndex(function (s) { return s.id === e.target.id; });
            if (idx >= 0) {
              nav.querySelectorAll('.tgs-sn-btn').forEach(function (b, j) {
                b.classList.toggle('on', j === idx);
              });
            }
          }
        });
      }, { rootMargin: '-10% 0px -70% 0px' });

      sections.forEach(function (s) {
        var el = document.getElementById(s.id);
        if (el) io.observe(el);
      });
    }
  }

  /* Run after DOM + language system are ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // already parsed — defer slightly so applyLang() runs first
    setTimeout(init, 0);
  }
})();
