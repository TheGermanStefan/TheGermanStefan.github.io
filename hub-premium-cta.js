/* TheGermanStefan — Premium CTA Replacement  (v1)
   ─────────────────────────────────────────────────────────────────────
   Loaded automatically by level-nav.js.
   Finds any .next-lvl-wrap element and replaces the squeezed image
   banner with a clean, image-free premium upgrade card.

   The card shows:
   • Left  — next level badge + title + subtitle (from existing markup)
   • Right — 🔒 PREMIUM marker + "unlock everything for only $19/month"
             + "Upgrade now" button → links to Skool community
   ─────────────────────────────────────────────────────────────────────
*/
(function () {

  var SKOOL = 'https://www.skool.com/thegermanstefan-9325';

  var wrap = document.querySelector('.next-lvl-wrap');
  if (!wrap) return;

  /* ── Extract content from existing markup ──────────────────────── */
  var link      = wrap.querySelector('.next-lvl-link');
  var badgeEl   = wrap.querySelector('.next-lvl-badge');
  var titleEl   = wrap.querySelector('.next-lvl-title');
  var subEl     = wrap.querySelector('.next-lvl-sub');

  var badge = badgeEl ? badgeEl.textContent.trim() : '';
  var title = titleEl ? titleEl.textContent.trim() : '';
  var sub   = subEl   ? subEl.textContent.trim()   : '';
  var nextHref = link ? link.getAttribute('href')  : '#';

  /* ── Inject CSS (once) ─────────────────────────────────────────── */
  if (!document.getElementById('tgs-cta-style')) {
    var style = document.createElement('style');
    style.id = 'tgs-cta-style';
    style.textContent = [
      '.tgs-premium-cta{',
      '  display:flex;align-items:stretch;',
      '  max-width:900px;margin:40px auto;padding:0 20px;',
      '}',
      '.tgs-cta-inner{',
      '  display:flex;align-items:stretch;width:100%;',
      '  border-radius:16px;overflow:hidden;',
      '  box-shadow:0 6px 28px rgba(0,0,0,.45);',
      '}',
      '.tgs-cta-left{',
      '  flex:1;',
      '  background:linear-gradient(135deg,#062a33 0%,#0d4a5a 100%);',
      '  padding:28px 30px;',
      '  display:flex;flex-direction:column;justify-content:center;gap:8px;',
      '  text-decoration:none;',
      '}',
      '.tgs-cta-left:hover{ filter:brightness(1.08); }',
      '.tgs-cta-badge{',
      '  display:inline-block;',
      '  background:rgba(0,188,212,.18);',
      '  border:1px solid rgba(0,188,212,.5);',
      '  color:#00bcd4;',
      '  font-size:.7rem;font-weight:800;letter-spacing:.12em;',
      '  text-transform:uppercase;padding:3px 12px;border-radius:20px;',
      '  width:fit-content;',
      '}',
      '.tgs-cta-title{',
      '  color:#fff;font-size:1.45rem;font-weight:900;margin:0;',
      '  text-shadow:0 1px 4px rgba(0,0,0,.5);',
      '}',
      '.tgs-cta-sub{',
      '  color:rgba(255,255,255,.65);font-size:.9rem;margin:0;',
      '}',
      '.tgs-cta-right{',
      '  background:#051e25;',
      '  border-left:1px solid rgba(0,188,212,.2);',
      '  padding:24px 28px;',
      '  display:flex;flex-direction:column;align-items:center;',
      '  justify-content:center;gap:10px;',
      '  min-width:210px;text-decoration:none;',
      '  transition:background .2s;',
      '}',
      '.tgs-cta-right:hover{ background:#072535; }',
      '.tgs-cta-lock{',
      '  display:flex;align-items:center;gap:6px;',
      '  color:#f9a825;font-size:.7rem;font-weight:900;',
      '  letter-spacing:.15em;text-transform:uppercase;',
      '}',
      '.tgs-cta-price{',
      '  color:rgba(255,255,255,.75);font-size:.82rem;',
      '  text-align:center;line-height:1.5;',
      '}',
      '.tgs-cta-price strong{',
      '  display:block;color:#00bcd4;font-size:1.1rem;',
      '  font-weight:900;margin-top:2px;',
      '}',
      '.tgs-cta-btn{',
      '  display:inline-block;',
      '  background:#00bcd4;color:#032028;',
      '  font-size:.75rem;font-weight:900;',
      '  padding:8px 20px;border-radius:20px;',
      '  text-decoration:none;letter-spacing:.04em;',
      '  transition:background .15s,transform .15s;',
      '}',
      '.tgs-cta-btn:hover{background:#00d4ec;transform:translateY(-1px);}',
      '@media(max-width:580px){',
      '  .tgs-cta-inner{flex-direction:column;}',
      '  .tgs-cta-right{min-width:0;padding:20px;}',
      '}',
    ].join('');
    document.head.appendChild(style);
  }

  /* ── Build replacement HTML ────────────────────────────────────── */
  var html = [
    '<div class="tgs-cta-inner">',
    '  <a class="tgs-cta-left" href="' + nextHref + '">',
    '    <span class="tgs-cta-badge">' + badge + '</span>',
    '    <h2 class="tgs-cta-title">' + title + '</h2>',
    '    <p class="tgs-cta-sub">' + sub + '</p>',
    '  </a>',
    '  <a class="tgs-cta-right" href="' + SKOOL + '" target="_blank" rel="noopener">',
    '    <span class="tgs-cta-lock">&#128274; Premium</span>',
    '    <span class="tgs-cta-price">unlock everything for only<strong>$19 / month</strong></span>',
    '    <span class="tgs-cta-btn">Upgrade now &rarr;</span>',
    '  </a>',
    '</div>',
  ].join('');

  /* ── Replace the old banner ────────────────────────────────────── */
  wrap.className = 'tgs-premium-cta';
  wrap.innerHTML = html;

})();
