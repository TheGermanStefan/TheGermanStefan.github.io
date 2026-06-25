/**
 * tts-player.js — TheGermanStefan Text-to-Speech Player
 * Injects a listen-to-text audio bar into all reading pages.
 * Uses the browser Web Speech API — no server, no API key, free.
 * Handles: .reading-text (A1-B2) and .reading-box (C1-C2)
 */
(function () {
  var synth = window.speechSynthesis;
  if (!synth) return; // browser doesn't support it

  /* ── State ─────────────────────────────────────────────── */
  var sentences   = [];
  var currentIdx  = 0;
  var isPlaying   = false;
  var isPaused    = false;
  var selGender   = 'female';
  var selRate     = 1.0;

  /* ── CSS ────────────────────────────────────────────────── */
  var css = [
    '.tts-player{',
      'background:linear-gradient(135deg,#e3f2fd,#bbdefb);',
      'border:2px solid #90caf9;',
      'border-radius:14px;',
      'padding:14px 18px;',
      'margin-bottom:14px;',
      'font-family:inherit;',
    '}',
    '.tts-header{',
      'font-weight:700;',
      'font-size:15px;',
      'color:#0d47a1;',
      'margin-bottom:11px;',
      'letter-spacing:.3px;',
    '}',
    '.tts-row{',
      'display:flex;',
      'flex-wrap:wrap;',
      'align-items:center;',
      'gap:10px;',
      'margin-bottom:9px;',
    '}',
    '.tts-row:last-child{margin-bottom:0;}',
    '.tts-group{display:flex;align-items:center;gap:6px;}',
    '.tts-gl{font-size:12px;font-weight:700;color:#555;min-width:38px;}',
    /* voice / speed toggle buttons */
    '.tts-vbtn,.tts-sbtn{',
      'padding:5px 13px;',
      'border:2px solid #90caf9;',
      'background:#fff;',
      'border-radius:20px;',
      'cursor:pointer;',
      'font-size:13px;',
      'font-weight:600;',
      'color:#1565c0;',
      'transition:all .15s;',
    '}',
    '.tts-vbtn:hover,.tts-sbtn:hover{border-color:#1565c0;}',
    '.tts-vbtn.active,.tts-sbtn.active{',
      'background:#1565c0;',
      'color:#fff;',
      'border-color:#1565c0;',
    '}',
    /* play / pause / stop */
    '.tts-pbtn{',
      'border:none;',
      'border-radius:8px;',
      'padding:8px 18px;',
      'cursor:pointer;',
      'font-size:14px;',
      'font-weight:700;',
      'transition:opacity .15s;',
    '}',
    '.tts-pbtn:disabled{opacity:.4;cursor:default;}',
    '.tts-play-btn{background:#2e7d32;color:#fff;}',
    '.tts-pause-btn{background:#e65100;color:#fff;}',
    '.tts-stop-btn{background:#b71c1c;color:#fff;}',
    '.tts-status{',
      'font-size:13px;',
      'color:#1565c0;',
      'font-weight:600;',
      'margin-left:4px;',
    '}',
    '.tts-note{',
      'font-size:12px;',
      'color:#bf360c;',
      'margin-top:6px;',
    '}',
    /* responsive */
    '@media(max-width:480px){',
      '.tts-player{padding:11px 12px;}',
      '.tts-vbtn,.tts-sbtn{padding:4px 9px;font-size:12px;}',
      '.tts-pbtn{padding:7px 13px;font-size:13px;}',
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
      // Fallback: any voice
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
    // Fallback: first = female, last = male (typically)
    return gender === 'female' ? voices[0] : voices[voices.length - 1];
  }

  /* ── Text extraction ────────────────────────────────────── */
  function getRawText() {
    var el = document.querySelector('.reading-text') ||
             document.querySelector('.reading-box');
    if (!el) return '';
    // Use innerText to respect line breaks and strip HTML
    return (el.innerText || el.textContent || '').trim();
  }

  function splitIntoChunks(text) {
    // Split on sentence boundaries to avoid Chrome's 15-second cutoff bug
    var parts = text.split(/(?<=[.!?;:])\s+(?=[A-ZÄÖÜ„"«])/);
    // Keep chunks under ~200 chars to be safe
    var chunks = [];
    parts.forEach(function (p) {
      p = p.trim();
      if (!p) return;
      if (p.length <= 220) {
        chunks.push(p);
      } else {
        // Split long chunk on comma or semicolon
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
  function speakChunk(idx) {
    if (idx >= sentences.length) {
      isPlaying = false;
      isPaused  = false;
      currentIdx = 0;
      renderUI();
      return;
    }
    currentIdx = idx;
    var u = new SpeechSynthesisUtterance(sentences[idx]);
    u.lang  = 'de-DE';
    u.rate  = selRate;
    var v = pickVoice(selGender);
    if (v) u.voice = v;

    u.onend = function () {
      if (!isPaused) speakChunk(currentIdx + 1);
    };
    u.onerror = function (e) {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('TTS error:', e.error);
        isPlaying = false;
        renderUI();
      }
    };
    synth.speak(u);
  }

  function ttsPlay() {
    if (isPaused) {
      // Resume from where we paused
      isPaused  = false;
      isPlaying = true;
      renderUI();
      speakChunk(currentIdx);
      return;
    }
    // Fresh start
    synth.cancel();
    sentences  = splitIntoChunks(getRawText());
    currentIdx = 0;
    isPaused   = false;
    isPlaying  = true;
    renderUI();
    // Small delay so cancel() settles before speak()
    setTimeout(function () { speakChunk(0); }, 80);
  }

  function ttsPause() {
    if (isPlaying && !isPaused) {
      synth.cancel(); // pause() is unreliable on iOS — cancel and remember position
      isPaused  = true;
      isPlaying = false;
      renderUI();
    } else if (isPaused) {
      ttsPlay(); // acts as Resume
    }
  }

  function ttsStop() {
    synth.cancel();
    isPlaying  = false;
    isPaused   = false;
    currentIdx = 0;
    renderUI();
  }

  /* ── Settings ───────────────────────────────────────────── */
  function ttsSetVoice(gender) {
    selGender = gender;
    document.querySelectorAll('.tts-vbtn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.gender === gender);
    });
    if (isPlaying) { ttsStop(); ttsPlay(); }
  }

  function ttsSetSpeed(rate) {
    selRate = parseFloat(rate);
    document.querySelectorAll('.tts-sbtn').forEach(function (b) {
      b.classList.toggle('active', parseFloat(b.dataset.rate) === selRate);
    });
    if (isPlaying) { var ci = currentIdx; ttsStop(); currentIdx = ci; ttsPlay(); }
  }

  /* ── UI ─────────────────────────────────────────────────── */
  function renderUI() {
    var playBtn  = document.getElementById('tts-play');
    var pauseBtn = document.getElementById('tts-pause');
    var status   = document.getElementById('tts-status');
    if (!playBtn) return;

    if (isPlaying) {
      playBtn.disabled       = true;
      pauseBtn.textContent   = '⏸ Pause';
      pauseBtn.disabled      = false;
      if (status) status.textContent = '🔊 Playing…';
    } else if (isPaused) {
      playBtn.disabled       = false;
      pauseBtn.textContent   = '▶ Resume';
      pauseBtn.disabled      = false;
      if (status) status.textContent = '⏸ Paused';
    } else {
      playBtn.disabled       = false;
      pauseBtn.textContent   = '⏸ Pause';
      pauseBtn.disabled      = false;
      if (status) status.textContent = '';
    }
  }

  function injectPlayer() {
    var el = document.querySelector('.reading-text') ||
             document.querySelector('.reading-box');
    if (!el) return;
    if (document.querySelector('.tts-player')) return; // already injected

    var deVoices = getDeVoices();
    var note = deVoices.length === 0
      ? '<div class="tts-note">⚠️ No German voice detected on this device — using default voice. For best results use Chrome on desktop.</div>'
      : '';

    var d = document.createElement('div');
    d.className = 'tts-player';
    d.innerHTML =
      '<div class="tts-header">🎧 Listen to this text</div>' +
      '<div class="tts-row">' +
        '<div class="tts-group">' +
          '<span class="tts-gl">Voice</span>' +
          '<button class="tts-vbtn active" data-gender="female" onclick="ttsSetVoice(\'female\')">♀ Female</button>' +
          '<button class="tts-vbtn" data-gender="male" onclick="ttsSetVoice(\'male\')">♂ Male</button>' +
        '</div>' +
        '<div class="tts-group">' +
          '<span class="tts-gl">Speed</span>' +
          '<button class="tts-sbtn" data-rate="0.75" onclick="ttsSetSpeed(0.75)">0.75×</button>' +
          '<button class="tts-sbtn active" data-rate="1" onclick="ttsSetSpeed(1)">1×</button>' +
          '<button class="tts-sbtn" data-rate="1.25" onclick="ttsSetSpeed(1.25)">1.25×</button>' +
          '<button class="tts-sbtn" data-rate="1.5" onclick="ttsSetSpeed(1.5)">1.5×</button>' +
        '</div>' +
      '</div>' +
      '<div class="tts-row">' +
        '<button class="tts-pbtn tts-play-btn" id="tts-play" onclick="ttsPlay()">▶ Play</button>' +
        '<button class="tts-pbtn tts-pause-btn" id="tts-pause" onclick="ttsPause()">⏸ Pause</button>' +
        '<button class="tts-pbtn tts-stop-btn" id="tts-stop" onclick="ttsStop()">⏹ Stop</button>' +
        '<span class="tts-status" id="tts-status"></span>' +
      '</div>' +
      note;

    el.parentNode.insertBefore(d, el);
  }

  /* ── Expose globals ─────────────────────────────────────── */
  window.ttsPlay     = ttsPlay;
  window.ttsPause    = ttsPause;
  window.ttsStop     = ttsStop;
  window.ttsSetVoice = ttsSetVoice;
  window.ttsSetSpeed = ttsSetSpeed;

  /* ── Init (wait for voices to load) ────────────────────── */
  function init() {
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = function () { /* voices now available */ };
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectPlayer);
    } else {
      injectPlayer();
    }
  }

  init();
})();
