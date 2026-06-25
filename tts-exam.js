/**
 * tts-exam.js — TheGermanStefan Exam TTS Player
 * Adds per-block audio play buttons to Goethe exam files.
 * Targets: .sbox (Lesen reading passages) and .dial (Hören dialogues).
 * Shared voice/speed settings across all blocks on the page.
 * Uses browser Web Speech API — no server, no API key.
 */
(function () {
  var synth = window.speechSynthesis;
  if (!synth) return;

  /* ── Shared state ────────────────────────────────────────── */
  var selGender   = 'female';
  var selRate     = 1.0;
  var activeId    = null;   // which block is currently playing
  var activeIdx   = 0;      // sentence index within active block
  var isPaused    = false;
  var sentences   = [];

  /* ── CSS ─────────────────────────────────────────────────── */
  var css = [
    /* Settings bar (shown once per page) */
    '.exam-tts-bar{',
      'background:linear-gradient(135deg,#e8f5e9,#c8e6c9);',
      'border:2px solid #a5d6a7;',
      'border-radius:12px;',
      'padding:10px 16px;',
      'margin:0 0 18px 0;',
      'display:flex;',
      'flex-wrap:wrap;',
      'align-items:center;',
      'gap:10px;',
      'font-family:inherit;',
    '}',
    '.exam-tts-label{font-size:13px;font-weight:700;color:#1b5e20;min-width:140px;}',
    '.exam-tts-group{display:flex;align-items:center;gap:6px;}',
    '.exam-tts-gl{font-size:12px;font-weight:700;color:#555;min-width:40px;}',
    '.exam-tvbtn,.exam-tsbtn{',
      'padding:4px 11px;',
      'border:2px solid #a5d6a7;',
      'background:#fff;',
      'border-radius:20px;',
      'cursor:pointer;',
      'font-size:12px;',
      'font-weight:600;',
      'color:#2e7d32;',
    '}',
    '.exam-tvbtn.active,.exam-tsbtn.active{background:#2e7d32;color:#fff;border-color:#2e7d32;}',
    /* Mini block player */
    '.tts-block-bar{',
      'display:flex;',
      'align-items:center;',
      'gap:8px;',
      'margin-bottom:8px;',
      'padding:6px 10px;',
      'background:#f9fbe7;',
      'border:1.5px solid #c5e1a5;',
      'border-radius:8px;',
      'font-family:inherit;',
      'flex-wrap:wrap;',
    '}',
    '.tts-block-label{font-size:12px;color:#558b2f;font-weight:700;margin-right:4px;}',
    '.tts-bbtn{',
      'border:none;',
      'border-radius:6px;',
      'padding:5px 12px;',
      'cursor:pointer;',
      'font-size:12px;',
      'font-weight:700;',
      'color:#fff;',
    '}',
    '.tts-bbtn:disabled{opacity:.4;cursor:default;}',
    '.tts-bplay{background:#2e7d32;}',
    '.tts-bpause{background:#e65100;}',
    '.tts-bstop{background:#b71c1c;}',
    '.tts-bstatus{font-size:12px;color:#1b5e20;font-weight:600;margin-left:4px;}',
    '@media(max-width:480px){',
      '.exam-tts-bar{padding:8px 10px;}',
      '.exam-tvbtn,.exam-tsbtn{padding:3px 8px;font-size:11px;}',
      '.tts-bbtn{padding:4px 9px;font-size:11px;}',
    '}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── Voice helpers ──────────────────────────────────────── */
  function getDeVoices() {
    return synth.getVoices().filter(function (v) {
      return v.lang && v.lang.toLowerCase().startsWith('de');
    });
  }

  function pickVoice(gender) {
    var voices = getDeVoices();
    if (!voices.length) {
      var all = synth.getVoices();
      return all.length ? all[0] : null;
    }
    var femKeys = ['anna', 'yannick', 'hedda', 'helene', 'vicki', 'female', 'frau'];
    var malKeys = ['markus', 'stefan', 'male', 'männlich', 'hans'];
    var keys = gender === 'female' ? femKeys : malKeys;
    for (var i = 0; i < voices.length; i++) {
      var n = voices[i].name.toLowerCase();
      for (var k = 0; k < keys.length; k++) {
        if (n.indexOf(keys[k]) !== -1) return voices[i];
      }
    }
    return gender === 'female' ? voices[0] : voices[voices.length - 1];
  }

  /* ── Text extraction ────────────────────────────────────── */
  function getBlockText(el) {
    // Clone to avoid mutating DOM, remove button bars
    var clone = el.cloneNode(true);
    clone.querySelectorAll('.tts-block-bar, .dlabel').forEach(function (n) {
      n.remove();
    });
    return (clone.innerText || clone.textContent || '').trim();
  }

  function splitChunks(text) {
    var parts = text.split(/(?<=[.!?;:])\s+(?=[A-ZÄÖÜ„"«"'])/);
    var chunks = [];
    parts.forEach(function (p) {
      p = p.trim();
      if (!p) return;
      if (p.length <= 220) {
        chunks.push(p);
      } else {
        var sub = p.split(/,\s+/);
        var buf = '';
        sub.forEach(function (s) {
          if ((buf + s).length > 200 && buf) {
            chunks.push(buf.trim());
            buf = s + ', ';
          } else {
            buf += s + ', ';
          }
        });
        if (buf.trim()) chunks.push(buf.trim());
      }
    });
    return chunks.length ? chunks : [text];
  }

  /* ── Playback ───────────────────────────────────────────── */
  function speakAt(blockId, idx) {
    if (idx >= sentences.length) {
      activeId  = null;
      isPaused  = false;
      activeIdx = 0;
      updateBlockUI(blockId);
      return;
    }
    activeIdx = idx;
    var u = new SpeechSynthesisUtterance(sentences[idx]);
    u.lang = 'de-DE';
    u.rate = selRate;
    var v = pickVoice(selGender);
    if (v) u.voice = v;
    u.onend = function () {
      if (!isPaused) speakAt(blockId, activeIdx + 1);
    };
    u.onerror = function (e) {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        activeId = null;
        updateBlockUI(blockId);
      }
    };
    synth.speak(u);
  }

  function blockPlay(blockId) {
    var el = document.getElementById(blockId);
    if (!el) return;
    if (isPaused && activeId === blockId) {
      // Resume
      isPaused = false;
      updateBlockUI(blockId);
      speakAt(blockId, activeIdx);
      return;
    }
    // Stop any current playback
    synth.cancel();
    activeId  = blockId;
    isPaused  = false;
    sentences = splitChunks(getBlockText(el));
    activeIdx = 0;
    updateBlockUI(blockId);
    setTimeout(function () { speakAt(blockId, 0); }, 80);
  }

  function blockPause(blockId) {
    if (activeId !== blockId) return;
    if (!isPaused) {
      synth.cancel();
      isPaused = true;
      updateBlockUI(blockId);
    } else {
      blockPlay(blockId); // resume
    }
  }

  function blockStop(blockId) {
    if (activeId === blockId) {
      synth.cancel();
      activeId  = null;
      isPaused  = false;
      activeIdx = 0;
    }
    updateBlockUI(blockId);
  }

  /* ── UI ─────────────────────────────────────────────────── */
  function updateBlockUI(blockId) {
    var bar = document.getElementById('bar-' + blockId);
    if (!bar) return;
    var playBtn  = bar.querySelector('.tts-bplay');
    var pauseBtn = bar.querySelector('.tts-bpause');
    var status   = bar.querySelector('.tts-bstatus');

    var isThisPlaying = (activeId === blockId && !isPaused);
    var isThisPaused  = (activeId === blockId && isPaused);

    if (playBtn)  playBtn.disabled  = isThisPlaying;
    if (pauseBtn) pauseBtn.textContent = isThisPaused ? '▶ Resume' : '⏸ Pause';
    if (status)   status.textContent =
      isThisPlaying ? '🔊 Playing…' :
      isThisPaused  ? '⏸ Paused'   : '';
  }

  /* ── Global settings bar ────────────────────────────────── */
  function injectSettingsBar() {
    if (document.querySelector('.exam-tts-bar')) return;
    var wrap = document.querySelector('.wrap') || document.querySelector('.mod');
    if (!wrap) return;
    var bar = document.createElement('div');
    bar.className = 'exam-tts-bar';
    bar.innerHTML =
      '<div class="exam-tts-label">🎧 Audio-Einstellungen</div>' +
      '<div class="exam-tts-group">' +
        '<span class="exam-tts-gl">Voice</span>' +
        '<button class="exam-tvbtn active" data-gender="female" onclick="examTtsSetVoice(\'female\')">♀ Female</button>' +
        '<button class="exam-tvbtn" data-gender="male" onclick="examTtsSetVoice(\'male\')">♂ Male</button>' +
      '</div>' +
      '<div class="exam-tts-group">' +
        '<span class="exam-tts-gl">Speed</span>' +
        '<button class="exam-tsbtn" data-rate="0.75" onclick="examTtsSetSpeed(0.75)">0.75×</button>' +
        '<button class="exam-tsbtn active" data-rate="1" onclick="examTtsSetSpeed(1)">1×</button>' +
        '<button class="exam-tsbtn" data-rate="1.25" onclick="examTtsSetSpeed(1.25)">1.25×</button>' +
        '<button class="exam-tsbtn" data-rate="1.5" onclick="examTtsSetSpeed(1.5)">1.5×</button>' +
      '</div>';
    wrap.parentNode.insertBefore(bar, wrap);
  }

  /* ── Inject per-block bars ──────────────────────────────── */
  var blockCounter = 0;

  function injectBlockBar(el) {
    if (el.querySelector('.tts-block-bar')) return; // already done
    blockCounter++;
    var id = 'tts-block-' + blockCounter;
    el.id = id;

    var bar = document.createElement('div');
    bar.className = 'tts-block-bar';
    bar.id = 'bar-' + id;
    bar.innerHTML =
      '<span class="tts-block-label">🎧</span>' +
      '<button class="tts-bbtn tts-bplay" onclick="examBlockPlay(\'' + id + '\')">▶ Play</button>' +
      '<button class="tts-bbtn tts-bpause" onclick="examBlockPause(\'' + id + '\')">⏸ Pause</button>' +
      '<button class="tts-bbtn tts-bstop" onclick="examBlockStop(\'' + id + '\')">⏹ Stop</button>' +
      '<span class="tts-bstatus"></span>';

    el.insertBefore(bar, el.firstChild);
  }

  /* ── Global helpers for onclick attributes ──────────────── */
  window.examBlockPlay  = blockPlay;
  window.examBlockPause = blockPause;
  window.examBlockStop  = blockStop;

  window.examTtsSetVoice = function (gender) {
    selGender = gender;
    document.querySelectorAll('.exam-tvbtn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.gender === gender);
    });
    // restart if playing
    if (activeId) { var id = activeId; blockStop(id); blockPlay(id); }
  };

  window.examTtsSetSpeed = function (rate) {
    selRate = parseFloat(rate);
    document.querySelectorAll('.exam-tsbtn').forEach(function (b) {
      b.classList.toggle('active', parseFloat(b.dataset.rate) === selRate);
    });
    if (activeId) { var id = activeId; var ci = activeIdx; blockStop(id); sentences = splitChunks(getBlockText(document.getElementById(id))); activeIdx = ci; blockPlay(id); }
  };

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = function () {};
    }
    function run() {
      injectSettingsBar();
      // Inject play buttons on all reading passages and dialogue blocks
      document.querySelectorAll('.sbox, .dial').forEach(injectBlockBar);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  }

  init();
})();
