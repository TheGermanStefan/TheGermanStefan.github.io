/* TheGermanStefan — Level Navigation Bar
   Add to any hub page: <script src="level-nav.js"></script>
   Always-visible sticky nav — no top-bar needed on pages using this script.
*/
(function(){
  var BASE = 'https://thegermanstefan.github.io/';
  var pages = [
    { id:'a0',    emoji:'🎉️',  label:'A0',      badge:'FREE',    cls:'~ree',    file:'TheGermanStefan_A0_Beginner_Hub.html' },
    { id:'a1',    emoji:'🆬🇧', label:'A1',      badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_A1_Hub.html' },
    { id:'a2',    emoji:'🐗',  label:'A2',      badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_A2_Hub.html' },
    { id:'b1',    emoji:'🐘',  label:'B1',      badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_B1_Hub.html' },
    { id:'b2',    emoji:'🐕',  label:'B2',      badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_B2_Hub.html' },
    { id:'c1',    emoji:'🎆',  label:'C1',      badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_C1_Hub.html' },
    { id:'c2',    emoji:'🎓',  label:'C2',      badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_C2_Hub.html' },
    { id:'vocab', emoji:'🐜',  label:'Vocab',   badge:'FREE',    cls:'~ree',    file:'TheGermanStefan_Vocab_Hub.html' },
    { id:'skills',emoji:'🎣',  label:'Special', badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_Special_Skills_Hub.html' },
    { id:'exam',  emoji:'🎖️', label:'Exams',   badge:'PREMIUM', cls:'premium', file:'TheGermanStefan_Exam_Room.html' }
  ];

  var current = window.location.pathname.split('/').pop();

  var css = `
    .tgs-level-nav {
      background: #0a2240;
      display: flex;
      gap: 6px;
      padding: 8px 14px;
      overflow-x: auto;
      scrollbar-width: none;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 2px solid rgba(255,255,255,.12);
    }
    .tgs-level-nav::-webkit-scrollbar { display: none; }
    .tgs-ln-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 5px 11px;
      border-radius: 8px;
      text-decoration: none;
      color: rgba(255,255,255,.75);
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      background: rgba(255,255,255,.07);
      border: 1px solid transparent;
      transition: background .15s, color .15s;
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    .tgs-ln-item:hover {
      background: rgba(255,255,255,.16);
      color: #fff;
    }
    .tgs-ln-item.tgs-active {
      background: rgba(255,255,255,.22);
      border-color: rgba(255,255,255,.35);
      color: #fff;
    }
    .tgs-ln-emoji { font-size: 14px; line-height: 1; }
    .tgs-ln-label { font-size: 11px; font-weight: 800; letter-spacing: .3px; }
    .tgs-ln-badge {
      font-size: 8px;
      font-weight: 900;
      padding: 1px 5px;
      border-radius: 6px;
      letter-spacing: .4px;
      text-transform: uppercase;
    }
    .tgs-ln-badge.free    { background: #16a34a; color: #fff; }
    .tgs-ln-badge.premium { background: #f9a825; color: #000; }
  `;

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var nav = document.createElement('nav');
  nav.className = 'tgs-level-nav';

  pages.forEach(function(p){
    var a = document.createElement('a');
    a.href = BASE + p.file;
    a.className = 'tgs-ln-item' + (p.file === current ? ' tgs-active' : '');
    a.innerHTML =
      '<span class="tgs-ln-emoji">' + p.emoji + '</span>' +
      '<span class="tgs-ln-label">' + p.label + '</span>' +
      '<span class="tgs-ln-badge ' + p.cls + '">' + p.badge + '</span>';
    nav.appendChild(a);
  });

  // Always insert at the very top of body so sticky top:0 works correctly
  document.body.insertBefore(nav, document.body.firstChild);
})();
