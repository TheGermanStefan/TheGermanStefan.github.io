/* TheGermanStefan — Hub Hero Banner  (v1)
   ─────────────────────────────────────────────────────────────────────
   Loaded automatically by level-nav.js.
   Inserts a full-width hero section at the top of each hub's content
   area, using the existing banner image as a cinematic background.

   If the banner image doesn't exist (onerror), the hero gracefully
   falls back to the platform's dark teal gradient — no broken layout.
   ─────────────────────────────────────────────────────────────────────
*/
(function () {

  /* ── Hub config ────────────────────────────────────────────────── */
  var HUBS = {
    'TheGermanStefan_A1_Hub.html': {
      banner: 'banner_a1.jpg',
      emoji:  '🇩🇪',
      title:  'A1 German',
      sub:    'First Steps in German',
      cefr:   'A1 — Beginner'
    },
    'TheGermanStefan_A2_Hub.html': {
      banner: 'banner_a2.jpg',
      emoji:  '📗',
      title:  'A2 German — Elementary',
      sub:    'Build Real Conversations',
      cefr:   'A2 — Elementary'
    },
    'TheGermanStefan_B1_Hub.html': {
      banner: 'banner_b1.jpg',
      emoji:  '📘',
      title:  'B1 German — Intermediate',
      sub:    'Speak Naturally & Confidently',
      cefr:   'B1 — Intermediate'
    },
    'TheGermanStefan_B2_Hub.html': {
      banner: 'banner_b2.jpg',
      emoji:  '📕',
      title:  'B2 German — Upper Intermediate',
      sub:    'Master Complex Topics',
      cefr:   'B2 — Upper Intermediate'
    },
    'TheGermanStefan_C1_Hub.html': {
      banner: 'banner_c1.jpg',
      emoji:  '🏆',
      title:  'C1 German — Advanced',
      sub:    'Express Yourself Fluently',
      cefr:   'C1 — Advanced'
    },
    'TheGermanStefan_C2_Hub.html': {
      banner: 'banner_c2.jpg',
      emoji:  '🎓',
      title:  'C2 German — Mastery',
      sub:    'Native-Level Precision',
      cefr:   'C2 — Mastery'
    }
  };

  var current = window.location.pathname.split('/').pop() ||
                window.location.href.split('/').pop().split('?')[0];
  var cfg = HUBS[current];
  if (!cfg) return;   /* not a level hub — no-op */

  /* ── CSS ─────────────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '.tgs-hero{',
    '  position:relative;width:100%;height:260px;overflow:hidden;',
    '  background:linear-gradient(135deg,#062a33 0%,#0d4a5a 60%,#062a33 100%);',
    '}',
    '@media(max-width:600px){.tgs-hero{height:180px;}}',
    '.tgs-hero-img{',
    '  position:absolute;inset:0;width:100%;height:100%;',
    '  object-fit:cover;object-position:center;',
    '  opacity:.55;transition:opacity .4s;',
    '}',
    '.tgs-hero-overlay{',
    '  position:absolute;inset:0;',
    '  background:linear-gradient(',
    '    to right,',
    '    rgba(4,20,28,.85) 0%,',
    '    rgba(4,20,28,.5)  50%,',
    '    rgba(4,20,28,.7)  100%',
    '  );',
    '}',
    '.tgs-hero-content{',
    '  position:absolute;inset:0;',
    '  display:flex;flex-direction:column;justify-content:center;',
    '  padding:0 40px;gap:8px;',
    '}',
    '@media(max-width:600px){.tgs-hero-content{padding:0 20px;gap:5px;}}',
    '.tgs-hero-cefr{',
    '  display:inline-flex;align-items:center;gap:6px;width:fit-content;',
    '  background:rgba(0,188,212,.18);border:1px solid rgba(0,188,212,.45);',
    '  color:#00bcd4;font-size:.68rem;font-weight:800;',
    '  letter-spacing:.14em;text-transform:uppercase;',
    '  padding:3px 12px;border-radius:20px;',
    '}',
    '.tgs-hero-title{',
    '  color:#fff;font-size:2rem;font-weight:900;margin:0;',
    '  text-shadow:0 2px 12px rgba(0,0,0,.7);line-height:1.1;',
    '}',
    '@media(max-width:600px){.tgs-hero-title{font-size:1.35rem;}}',
    '.tgs-hero-sub{',
    '  color:rgba(255,255,255,.75);font-size:1rem;margin:0;',
    '  text-shadow:0 1px 6px rgba(0,0,0,.6);',
    '}',
    '@media(max-width:600px){.tgs-hero-sub{font-size:.85rem;}}',
    '.tgs-hero-scroll{',
    '  position:absolute;bottom:14px;left:50%;transform:translateX(-50%);',
    '  color:rgba(255,255,255,.4);font-size:1.2rem;',
    '  animation:tgs-bounce .8s ease-in-out infinite alternate;',
    '}',
    '@keyframes tgs-bounce{from{transform:translateX(-50%) translateY(0);}to{transform:translateX(-50%) translateY(5px);}}',
  ].join('');
  document.head.appendChild(style);

  /* ── Build hero element ──────────────────────────────────────────── */
  var hero = document.createElement('div');
  hero.className = 'tgs-hero';
  hero.innerHTML =
    '<img class="tgs-hero-img" src="' + cfg.banner + '" alt=""' +
    ' onerror="this.style.display=\'none\'">' +
    '<div class="tgs-hero-overlay"></div>' +
    '<div class="tgs-hero-content">' +
    '  <span class="tgs-hero-cefr">' + cfg.emoji + '&nbsp;&nbsp;' + cfg.cefr + '</span>' +
    '  <h1 class="tgs-hero-title">' + cfg.title + '</h1>' +
    '  <p class="tgs-hero-sub">' + cfg.sub + '</p>' +
    '</div>' +
    '<div class="tgs-hero-scroll">&#8964;</div>';

  /* ── Insert: after all sticky nav bars, before first content ─────── */
  /* Try to find the first section-like element below the nav */
  var insertBefore =
    document.querySelector('.section') ||
    document.querySelector('.section-hdr') ||
    document.querySelector('main') ||
    document.querySelector('.tab-panel');

  if (insertBefore) {
    insertBefore.parentNode.insertBefore(hero, insertBefore);
  } else {
    /* Fallback: append after level-nav bar */
    var levelNav = document.querySelector('.tgs-level-nav');
    if (levelNav && levelNav.nextSibling) {
      levelNav.parentNode.insertBefore(hero, levelNav.nextSibling);
    } else {
      document.body.appendChild(hero);
    }
  }

})();
