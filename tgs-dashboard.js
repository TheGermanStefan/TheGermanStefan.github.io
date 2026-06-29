/**
 * TheGermanStefan Academy — Dashboard Framework Engine
 * tgs-dashboard.js — v1.0 | Sprint-002
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Renders level dashboards from a single framework.
 * Entry point: DashboardFramework.init(levelId)
 *
 * COMPONENT ARCHITECTURE
 * Each component is a pure function: Component.render(data) → HTML string.
 * To replace a component (e.g. AI-powered Recommendation): change one function.
 * Callers are unchanged.
 *
 * DEPENDENCY ORDER (level-dashboard.html must load in this order):
 *   1. tgs-core.js      → window.TGS
 *   2. tgs-levels.js    → window.TGS_LEVELS
 *   3. tgs-dashboard.js → window.DashboardFramework
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function (global) {
  'use strict';

  /* ── LEVEL ORDER (for journey rendering) ─────────────────────── */
  var LEVEL_ORDER = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  /* ── SAFE HTML ESCAPE ────────────────────────────────────────── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── PROGRESS BAR HTML ───────────────────────────────────────── */
  function progressBar(pct, color, small) {
    var h = small ? '6px' : '8px';
    return '<div class="pbar-wrap" style="height:' + h + '">'
      + '<div class="pbar-fill" style="width:' + pct + '%;background:' + esc(color) + '"></div>'
      + '</div>';
  }

  /* ════════════════════════════════════════════════════════════════
     COMPONENT 1 — HERO
  ════════════════════════════════════════════════════════════════ */
  var Hero = {
    /**
     * @param {Object} level  — level config from TGS_LEVELS.get()
     * @param {Object} prog   — progress from TGS_LEVELS.computeProgress()
     */
    render: function (level, prog) {
      var freeBadge = level.free
        ? '<span class="badge-free">Free</span>'
        : '<span class="badge-prem">Premium</span>';

      var examBadge = level.examName
        ? '<span class="badge-exam">🎓 ' + esc(level.examName) + '</span>'
        : '';

      var outcomes = (level.outcomes || []).map(function (o) {
        return '<li>' + esc(o) + '</li>';
      }).join('');

      var progressNote = prog.total > 0
        ? '<span class="hero-progress-note">' + prog.done + '/' + prog.total + ' lessons complete</span>'
        : '';

      return '<section class="component hero-component" style="--level-color:' + esc(level.color) + '">'
        + '<div class="hero-inner">'
          + '<div class="hero-left">'
            + '<div class="hero-emoji">' + esc(level.emoji) + '</div>'
            + '<div class="hero-level-chip">' + esc(level.id) + '</div>'
          + '</div>'
          + '<div class="hero-right">'
            + '<div class="hero-badges">' + freeBadge + examBadge + '</div>'
            + '<h1 class="hero-title">' + esc(level.name) + '</h1>'
            + '<p class="hero-desc">' + esc(level.description) + '</p>'
            + '<ul class="hero-outcomes">' + outcomes + '</ul>'
            + '<div class="hero-meta">'
              + '<span class="meta-chip">⏱ ' + esc(level.studyTime) + '</span>'
              + '<span class="meta-chip">📖 ' + prog.total + ' lessons</span>'
              + '<span class="meta-chip">📚 ' + (level.vocabTarget || 0).toLocaleString() + ' words</span>'
              + progressNote
            + '</div>'
          + '</div>'
        + '</div>'
      + '</section>';
    }
  };

  /* ════════════════════════════════════════════════════════════════
     COMPONENT 2 — OVERALL PROGRESS
  ════════════════════════════════════════════════════════════════ */
  var Progress = {
    /**
     * @param {Object} level  — level config
     * @param {Object} prog   — { total, done, pct }
     */
    render: function (level, prog) {
      var pct = prog.pct;
      var statusMsg = pct === 0
        ? 'Ready to start — jump in!'
        : pct === 100
          ? '🎉 Level complete! Move to ' + (level.nextLevel || 'Mastery') + '.'
          : prog.done + ' of ' + prog.total + ' lessons done';

      return '<section class="component progress-component">'
        + '<h2 class="comp-title">Your Progress</h2>'
        + '<div class="prog-pct-row">'
          + '<span class="prog-pct-num" style="color:' + esc(level.color) + '">' + pct + '%</span>'
          + '<span class="prog-status">' + esc(statusMsg) + '</span>'
        + '</div>'
        + progressBar(pct, level.color, false)
        + '<div class="prog-meta">'
          + '<span>' + prog.done + ' done</span>'
          + '<span>' + (prog.total - prog.done) + ' remaining</span>'
        + '</div>'
      + '</section>';
    }
  };

  /* ════════════════════════════════════════════════════════════════
     COMPONENT 3 — TODAY'S RECOMMENDATION
     AI HOOK: Replace the body of this function with an AI call.
     Signature stays the same; calling code is unchanged.
  ════════════════════════════════════════════════════════════════ */
  var Recommendation = {
    /**
     * AI_HOOK: Future implementation will call TGS.ai.adapt()
     * to personalise the recommended lesson based on performance data.
     *
     * @param {Object} level
     * @param {Object} prog   — includes prog.nextLesson
     */
    render: function (level, prog) {
      /* No next lesson → level complete */
      if (!prog.nextLesson) {
        var nxt = level.nextLevel;
        return '<section class="component rec-component rec-complete">'
          + '<div class="rec-badge">✅ Level Complete</div>'
          + '<h3 class="rec-lesson-title">You\'ve finished ' + esc(level.id) + '!</h3>'
          + (nxt
              ? '<p class="rec-module">Ready for <strong>' + esc(nxt) + '</strong> next?</p>'
                + '<a class="btn-rec" href="level-dashboard.html?level=' + esc(nxt) + '">Go to ' + esc(nxt) + ' →</a>'
              : '<p class="rec-module">You\'ve reached the pinnacle — C2 Mastery!</p>')
        + '</section>';
      }

      var n   = prog.nextLesson;
      var lsn = n.lesson;
      var mod = n.module;

      return '<section class="component rec-component">'
        + '<div class="rec-badge" style="background:' + esc(level.color) + '">▶ Up Next</div>'
        + '<h3 class="rec-lesson-title">' + esc(lsn.title) + '</h3>'
        + '<p class="rec-module">' + esc(mod.icon || '📚') + ' ' + esc(mod.label) + ' · ' + esc(level.id) + '</p>'
        + '<a class="btn-rec" href="' + esc(lsn.file) + '">Start Lesson →</a>'
        + '<p class="rec-ai-note"><!-- AI_HOOK: personalised recommendation replaces this section --></p>'
      + '</section>';
    }
  };

  /* ════════════════════════════════════════════════════════════════
     COMPONENT 4 — MODULE CARDS
  ════════════════════════════════════════════════════════════════ */
  var ModuleCards = {
    /**
     * @param {Object} level
     * @param {Object} modProg — from TGS_LEVELS.computeModuleProgress()
     */
    render: function (level, modProg) {
      var modules = level.modules;
      var keys    = Object.keys(modules);

      var cards = keys.map(function (key) {
        var mod     = modules[key];
        var mp      = modProg[key] || { total: 0, done: 0, pct: 0 };
        var lessons = mod.lessons || [];

        var lessonItems = lessons.map(function (lsn) {
          var isDone = (typeof TGS !== 'undefined') && TGS.progress.isComplete(lsn.id);
          var isSoon = lsn.status === 'coming-soon';

          if (isSoon) {
            return '<li class="lesson-item lesson-soon">'
              + '<span class="lesson-dot dot-soon">○</span>'
              + '<span class="lesson-title">' + esc(lsn.title) + '</span>'
              + '<span class="soon-chip">Soon</span>'
            + '</li>';
          }

          return '<li class="lesson-item' + (isDone ? ' lesson-done' : '') + '">'
            + '<span class="lesson-dot' + (isDone ? ' dot-done' : '') + '">'
              + (isDone ? '✓' : '○')
            + '</span>'
            + (isSoon
                ? '<span class="lesson-title">' + esc(lsn.title) + '</span>'
                : '<a class="lesson-link" href="' + esc(lsn.file) + '">' + esc(lsn.title) + '</a>')
          + '</li>';
        }).join('');

        var availCount = lessons.filter(function (l) { return l.status !== 'coming-soon'; }).length;
        var soonCount  = lessons.length - availCount;

        return '<div class="module-card">'
          + '<div class="mod-header">'
            + '<span class="mod-icon">' + esc(mod.icon || '📚') + '</span>'
            + '<div class="mod-meta">'
              + '<span class="mod-label">' + esc(mod.label) + '</span>'
              + '<span class="mod-count">'
                + mp.done + '/' + mp.total + ' done'
                + (soonCount > 0 ? ' · ' + soonCount + ' coming' : '')
              + '</span>'
            + '</div>'
            + '<span class="mod-pct" style="color:' + esc(level.color) + '">' + mp.pct + '%</span>'
          + '</div>'
          + progressBar(mp.pct, level.color, true)
          + '<ul class="lesson-list">' + lessonItems + '</ul>'
        + '</div>';
      }).join('');

      return '<section class="component module-cards-component">'
        + '<h2 class="comp-title">Learning Modules</h2>'
        + '<div class="module-grid">' + cards + '</div>'
      + '</section>';
    }
  };

  /* ════════════════════════════════════════════════════════════════
     COMPONENT 5 — VOCABULARY PROGRESS
  ════════════════════════════════════════════════════════════════ */
  var VocabProgress = {
    /**
     * VOCAB_HOOK: TGS.vocab.lookup() will supply real word counts
     * once the Vocabulary Universe backend is connected (future sprint).
     *
     * @param {Object} level
     */
    render: function (level) {
      var target = level.vocabTarget || 0;

      /* VOCAB_HOOK: replace 0 with TGS.vocab.getLearnedCount(level.id) */
      var learned = 0;
      var pct     = target > 0 ? Math.round((learned / target) * 100) : 0;

      return '<section class="component vocab-component">'
        + '<h2 class="comp-title">📚 Vocabulary Universe</h2>'
        + '<div class="vocab-counts">'
          + '<div class="vocab-num" style="color:' + esc(level.color) + '">' + learned.toLocaleString() + '</div>'
          + '<div class="vocab-of">of ' + target.toLocaleString() + ' ' + esc(level.id) + ' words</div>'
        + '</div>'
        + progressBar(pct, level.color, false)
        + '<p class="vocab-hook-note"><!-- VOCAB_HOOK: connect TGS.vocab to populate word count --></p>'
        + '<a class="vocab-link" href="vocabulary-universe.html">Go to Vocabulary Universe →</a>'
      + '</section>';
    }
  };

  /* ════════════════════════════════════════════════════════════════
     COMPONENT 6 — WEEKLY CHALLENGE (placeholder)
     CHALLENGE_ARENA_HOOK: replace inner content when Challenge Arena launches
  ════════════════════════════════════════════════════════════════ */
  var WeeklyChallenge = {
    render: function () {
      return '<section class="component challenge-component">'
        + '<h2 class="comp-title">🏆 Weekly Challenge</h2>'
        + '<div class="placeholder-box">'
          + '<div class="placeholder-icon">🏆</div>'
          + '<div class="placeholder-label">Challenge Arena</div>'
          + '<p class="placeholder-desc">Weekly cross-academy challenges, leaderboards and badges — coming soon.</p>'
          + '<!-- CHALLENGE_ARENA_HOOK: replace this with live challenge widget -->'
        + '</div>'
      + '</section>';
    }
  };

  /* ════════════════════════════════════════════════════════════════
     COMPONENT 7 — ACHIEVEMENTS (placeholder)
     ACHIEVEMENT_HOOK: replace when badge system launches
  ════════════════════════════════════════════════════════════════ */
  var Achievement = {
    render: function (level, prog) {
      var earned = [];

      /* Early achievement logic — expand with real system later */
      if (prog.done >= 1)            earned.push({ icon: '🌱', label: 'First Lesson' });
      if (prog.pct >= 50)            earned.push({ icon: '⚡', label: 'Halfway There' });
      if (prog.pct === 100)          earned.push({ icon: '🏅', label: level.id + ' Complete' });
      if (prog.total > 0 && prog.done === 0) earned = [];

      var badges = earned.length > 0
        ? earned.map(function (b) {
            return '<div class="badge-chip"><span>' + b.icon + '</span>' + esc(b.label) + '</div>';
          }).join('')
        : '<div class="placeholder-box"><div class="placeholder-icon">🥇</div>'
          + '<p class="placeholder-desc">Complete lessons to earn achievements.</p>'
          + '<!-- ACHIEVEMENT_HOOK: replace with full badge system --></div>';

      return '<section class="component achievement-component">'
        + '<h2 class="comp-title">Achievements</h2>'
        + '<div class="badge-row">' + badges + '</div>'
      + '</section>';
    }
  };

  /* ════════════════════════════════════════════════════════════════
     COMPONENT 8 — NEXT LEVEL
  ════════════════════════════════════════════════════════════════ */
  var NextLevel = {
    /**
     * @param {Object} level
     * @param {Object} prog
     */
    render: function (level, prog) {
      var next = TGS_LEVELS.getNext(level.id);

      if (!next) {
        return '<section class="component nextlevel-component">'
          + '<h2 class="comp-title">Level Journey</h2>'
          + '<div class="nextlevel-complete">'
            + '<span class="nextlevel-crown">👑</span>'
            + '<p>You\'ve reached <strong>C2 Mastery</strong> — the pinnacle of German learning.</p>'
          + '</div>'
        + '</section>';
      }

      var remaining = prog.total - prog.done;
      var lockHtml  = next.free
        ? '<a class="btn-nextlevel" href="level-dashboard.html?level=' + esc(next.id) + '">Go to ' + esc(next.id) + ' →</a>'
        : '<button class="btn-nextlevel btn-locked" onclick="TGS.premium.gate(\'level-dashboard.html?level=' + esc(next.id) + '\',\'language\',\'' + esc(next.id) + '\')">'
            + '🔒 Unlock ' + esc(next.id) + ' on Skool'
          + '</button>';

      return '<section class="component nextlevel-component">'
        + '<h2 class="comp-title">Next Level</h2>'
        + '<div class="nextlevel-row">'
          + '<div class="nl-current" style="border-color:' + esc(level.color) + '">'
            + '<div class="nl-emoji">' + esc(level.emoji) + '</div>'
            + '<div class="nl-id">' + esc(level.id) + '</div>'
          + '</div>'
          + '<div class="nl-arrow">→</div>'
          + '<div class="nl-next" style="border-color:' + esc(next.color) + '">'
            + '<div class="nl-emoji">' + esc(next.emoji) + '</div>'
            + '<div class="nl-id">' + esc(next.id) + '</div>'
          + '</div>'
        + '</div>'
        + (remaining > 0
            ? '<p class="nl-remaining">Complete <strong>' + remaining + '</strong> more lesson' + (remaining > 1 ? 's' : '') + ' to unlock ' + esc(next.name) + '</p>'
            : '<p class="nl-remaining">🎉 All done! You\'re ready for ' + esc(next.id) + '</p>')
        + progressBar(prog.pct, level.color, false)
        + '<div style="margin-top:14px">' + lockHtml + '</div>'
      + '</section>';
    }
  };

  /* ════════════════════════════════════════════════════════════════
     COMPONENT 9 — LEARNING JOURNEY
  ════════════════════════════════════════════════════════════════ */
  var LearningJourney = {
    /**
     * @param {string} currentId — e.g. 'A1'
     */
    render: function (currentId) {
      var nodes = LEVEL_ORDER.map(function (id) {
        var lvl      = TGS_LEVELS.get(id);
        var isCurrent = id === currentId;
        var prog     = TGS_LEVELS.computeProgress(id);
        var isDone   = prog.pct === 100;
        var isPast   = LEVEL_ORDER.indexOf(id) < LEVEL_ORDER.indexOf(currentId);

        var stateClass = isCurrent ? 'node-current' : isDone ? 'node-done' : isPast ? 'node-past' : 'node-future';
        var indicator  = isDone ? '✓' : esc(lvl.emoji);

        var onClick = '';
        if (id === currentId) {
          onClick = ''; /* already here */
        } else if (lvl.free) {
          onClick = 'onclick="window.location.href=\'level-dashboard.html?level=' + esc(id) + '\'"';
        } else {
          onClick = 'onclick="TGS.premium.gate(\'level-dashboard.html?level=' + esc(id) + '\',\'language\',\'' + esc(id) + '\')"';
        }

        return '<div class="journey-node ' + stateClass + '" '
          + (onClick ? onClick + ' style="cursor:pointer" title="' + esc(lvl.name) + '"' : 'title="' + esc(lvl.name) + '"')
          + ' style="--node-color:' + esc(lvl.color) + ';cursor:' + (onClick ? 'pointer' : 'default') + '">'
          + '<div class="node-dot">' + indicator + '</div>'
          + '<div class="node-label">' + esc(id) + '</div>'
        + '</div>';
      }).join('<div class="journey-connector"></div>');

      return '<section class="component journey-component">'
        + '<h2 class="comp-title">Learning Journey — A0 to C2</h2>'
        + '<div class="journey-track">' + nodes + '</div>'
        + '<p class="journey-sub">Click any level to go to its dashboard.</p>'
      + '</section>';
    }
  };

  /* ════════════════════════════════════════════════════════════════
     DASHBOARD FRAMEWORK — ENTRY POINT
  ════════════════════════════════════════════════════════════════ */

  var DashboardFramework = {

    version: '1.0.0',
    sprint:  'Sprint-002',

    components: {
      Hero:            Hero,
      Progress:        Progress,
      Recommendation:  Recommendation,
      ModuleCards:     ModuleCards,
      VocabProgress:   VocabProgress,
      WeeklyChallenge: WeeklyChallenge,
      Achievement:     Achievement,
      NextLevel:       NextLevel,
      LearningJourney: LearningJourney
    },

    /**
     * Main entry point. Called by level-dashboard.html on load.
     *
     * @param {string} levelId — from URL ?level=A1
     */
    init: function (levelId) {
      var level = TGS_LEVELS.get(levelId);

      if (!level) {
        DashboardFramework._renderError(levelId);
        return;
      }

      /* Update page title and accent colour */
      document.title = level.id + ' ' + level.name.replace(level.id + ' ', '') + ' · TheGermanStefan Academy';
      document.documentElement.style.setProperty('--level-color', level.color);

      /* Compute progress data */
      var prog    = TGS_LEVELS.computeProgress(levelId);
      var modProg = TGS_LEVELS.computeModuleProgress(levelId);

      /* Update topbar level chip */
      var chipEl = document.getElementById('topbar-level-chip');
      if (chipEl) {
        chipEl.textContent = level.id + ' — ' + level.name.replace(level.id + ' ', '');
        chipEl.style.color = level.color;
      }

      /* Update back link */
      var backEl = document.getElementById('back-to-academy');
      if (backEl) backEl.href = 'language-academy.html#' + levelId.toLowerCase();

      /* Render main column */
      var main = document.getElementById('dash-main');
      if (main) {
        main.innerHTML =
          Hero.render(level, prog)
          + ModuleCards.render(level, modProg)
          + LearningJourney.render(levelId);
      }

      /* Render sidebar */
      var sidebar = document.getElementById('dash-sidebar');
      if (sidebar) {
        sidebar.innerHTML =
          Progress.render(level, prog)
          + Recommendation.render(level, prog)
          + VocabProgress.render(level)
          + WeeklyChallenge.render()
          + Achievement.render(level, prog)
          + NextLevel.render(level, prog);
      }
    },

    _renderError: function (levelId) {
      var root = document.getElementById('dash-root');
      if (root) {
        root.innerHTML = '<div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,.7)">'
          + '<div style="font-size:48px;margin-bottom:20px">🔍</div>'
          + '<h2 style="color:#fff;margin-bottom:12px">Level not found: ' + esc(levelId || '?') + '</h2>'
          + '<p>Valid levels: A0, A1, A2, B1, B2, C1, C2</p>'
          + '<a href="language-academy.html" style="color:#f9a825;margin-top:20px;display:inline-block">← Back to Language Academy</a>'
          + '</div>';
      }
    }

  };

  global.DashboardFramework = DashboardFramework;

}(window));
