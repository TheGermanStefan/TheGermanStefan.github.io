/**
 * ═══════════════════════════════════════════════════════════════════
 *  TheGermanStefan Academy Engine
 *  tgs-core.js — v1.0 | Sprint-001
 *
 *  Sections:
 *   §1  CONFIG          — Global settings & constants
 *   §2  NAVIGATION      — Route resolution, hub & page mapping
 *   §3  BREADCRUMBS     — Contextual location display
 *   §4  PROGRESS        — Course & lesson progress tracking
 *   §5  PREMIUM ACCESS  — Free/premium gate logic
 *   §6  ACADEMY MGMT    — Multi-academy registry
 *   §7  VOCABULARY      — Cross-academy vocabulary engine (stub)
 *   §8  AI HOOKS        — Future AI assistant integration (stub)
 *   §9  UTILS           — Shared helper functions
 *   §10 INIT            — Auto-initialisation
 *
 *  Usage:  <script src="tgs-core.js"></script>
 *  Global: window.TGS
 * ═══════════════════════════════════════════════════════════════════
 */

(function (global) {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // §1  CONFIG
  // ═══════════════════════════════════════════════════════════════
  var CONFIG = {
    version:    '1.0.0',
    sprint:     'Sprint-001',
    baseUrl:    'https://thegermanstefan.github.io/',
    skoolUrl:   'https://www.skool.com/thegermanstefan-9325',
    upgradeUrl: 'https://www.skool.com/thegermanstefan-9325',   // update to /upgrade when live
    lockedPage: 'locked.html',
    storageKey: 'tgs_v1',
    debug:      false
  };


  // ═══════════════════════════════════════════════════════════════
  // §2  NAVIGATION
  // ═══════════════════════════════════════════════════════════════
  var NAV = {

    /** Top-level pages */
    pages: {
      home:            'index.html',
      languageAcademy: 'language-academy.html',
      placementTest:   'placement-test.html',
      locked:          'locked.html'
    },

    /**
     * Level hub files.
     * These are redirect stubs in Sprint-001.
     * Future sprints will replace them with full hub pages.
     */
    levelHubs: {
      A0: 'TheGermanStefan_A0_Beginner_Hub.html',
      A1: 'TheGermanStefan_A1_Hub.html',
      A2: 'TheGermanStefan_A2_Hub.html',
      B1: 'TheGermanStefan_B1_Hub.html',
      B2: 'TheGermanStefan_B2_Hub.html',
      C1: 'TheGermanStefan_C1_Hub.html',
      C2: 'TheGermanStefan_C2_Hub.html'
    },

    /**
     * Build the URL for the universal lock screen.
     * @param {string} academy   - e.g. 'language'
     * @param {string} course    - e.g. 'A1'
     * @param {string} [ret]     - page to return to on back
     */
    premiumGateUrl: function (academy, course, ret) {
      var url = CONFIG.lockedPage
        + '?academy=' + encodeURIComponent(academy)
        + '&course='  + encodeURIComponent(course);
      if (ret) {
        url += '&return=' + encodeURIComponent(ret);
      }
      return url;
    },

    /** Navigate to a named page */
    go: function (name) {
      var page = NAV.pages[name];
      if (page) window.location.href = page;
    },

    /** Detect current level from filename (e.g. A1_Grammar_01_...) */
    detectLevel: function () {
      var file = window.location.pathname.split('/').pop();
      var m = file.match(/^([ABC][012])_/i);
      return m ? m[1].toUpperCase() : null;
    },

    /** Detect current module from filename */
    detectModule: function () {
      var file = window.location.pathname.split('/').pop();
      var m = file.match(/^[ABC][012]_([A-Za-z]+)_/i);
      return m ? m[1].toLowerCase() : null;
    }
  };


  // ═══════════════════════════════════════════════════════════════
  // §3  BREADCRUMBS
  // ═══════════════════════════════════════════════════════════════
  var BREADCRUMBS = {

    /**
     * Build breadcrumb data for the current page context.
     * @param {object} ctx — { academy?, level?, module?, lesson? }
     * @returns {Array}    — [{ label, url }, ...]
     */
    build: function (ctx) {
      var crumbs = [{ label: 'Academy', url: NAV.pages.home }];
      if (ctx.academy) {
        crumbs.push({ label: ctx.academy, url: NAV.pages.languageAcademy });
      }
      if (ctx.level) {
        crumbs.push({
          label: ctx.level,
          url:   NAV.levelHubs[ctx.level] || NAV.pages.languageAcademy
        });
      }
      if (ctx.module) {
        crumbs.push({ label: UTILS.capitalize(ctx.module), url: null });
      }
      if (ctx.lesson) {
        crumbs.push({ label: ctx.lesson, url: null });
      }
      return crumbs;
    },

    /** Render breadcrumbs into a DOM container */
    render: function (crumbs, container) {
      if (!container) return;
      container.innerHTML = crumbs.map(function (c, i) {
        var isLast = i === crumbs.length - 1;
        var part = (isLast || !c.url)
          ? '<span>' + c.label + '</span>'
          : '<a href="' + c.url + '">' + c.label + '</a>';
        return i > 0 ? '<span aria-hidden="true">›</span>' + part : part;
      }).join('');
    }
  };


  // ═══════════════════════════════════════════════════════════════
  // §4  PROGRESS
  // ═══════════════════════════════════════════════════════════════
  var PROGRESS = {

    _store: function () {
      try {
        var raw = localStorage.getItem(CONFIG.storageKey);
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    },

    _save: function (data) {
      try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(data)); }
      catch (e) { /* storage unavailable — fail silently */ }
    },

    /** Mark a lesson as completed by its lesson ID */
    complete: function (lessonId) {
      var data = PROGRESS._store();
      data.completed = data.completed || {};
      data.completed[lessonId] = Date.now();
      PROGRESS._save(data);
    },

    /** Check whether a lesson has been completed */
    isComplete: function (lessonId) {
      var data = PROGRESS._store();
      return !!(data.completed && data.completed[lessonId]);
    },

    /** Save placement test result */
    savePlacementResult: function (level) {
      var data = PROGRESS._store();
      data.placementLevel = level;
      data.placementDate  = Date.now();
      PROGRESS._save(data);
    },

    /** Get saved placement test result */
    getPlacementResult: function () {
      return (PROGRESS._store()).placementLevel || null;
    },

    /** Return a summary object for dashboards / AI hooks */
    summary: function () {
      var data = PROGRESS._store();
      return {
        completedLessons: Object.keys(data.completed || {}).length,
        placementLevel:   data.placementLevel  || null,
        placementDate:    data.placementDate   || null
      };
    }
  };


  // ═══════════════════════════════════════════════════════════════
  // §5  PREMIUM ACCESS
  // ═══════════════════════════════════════════════════════════════
  var PREMIUM = {

    /**
     * Check premium access status.
     * ─────────────────────────────────────────────────────────────
     * STUB — Sprint-001: always returns false (navigation-level lock).
     * Future sprint: validate JWT / session token from Skool SSO.
     * Replace this function body only — all callers remain unchanged.
     * ─────────────────────────────────────────────────────────────
     * @returns {boolean}
     */
    isUnlocked: function () {
      // TODO: replace with real Skool SSO token validation
      return false;
    },

    /**
     * Gate a premium resource.
     * If unlocked → navigate to target URL.
     * If locked   → redirect to universal lock screen.
     *
     * @param {string} targetUrl  — destination if premium
     * @param {string} academy    — academy ID (e.g. 'language')
     * @param {string} course     — course label (e.g. 'A1')
     */
    gate: function (targetUrl, academy, course) {
      if (PREMIUM.isUnlocked()) {
        window.location.href = targetUrl;
      } else {
        window.location.href = NAV.premiumGateUrl(
          academy || 'language',
          course  || 'Premium',
          window.location.href
        );
      }
    },

    /** Open Skool upgrade page in a new tab */
    upgrade: function () {
      window.open(CONFIG.upgradeUrl, '_blank', 'noopener,noreferrer');
    }
  };


  // ═══════════════════════════════════════════════════════════════
  // §6  ACADEMY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  var ACADEMIES = {

    /**
     * Central registry of all academies.
     * ─────────────────────────────────────────────────────────────
     * To add a new academy: append an entry here.
     * Pages that render academy cards read this registry —
     * no HTML changes needed in most cases.
     * ─────────────────────────────────────────────────────────────
     */
    registry: [
      {
        id:       'language',
        name:     'German Language Academy',
        tagline:  'A0 to C2 — Master German from the ground up',
        icon:     '🇩🇪',
        accent:   '#1464b4',
        status:   'active',       // 'active' | 'coming-soon' | 'beta'
        url:      'language-academy.html',
        free:     true
      },
      {
        id:       'knowledge',
        name:     'Germany Knowledge Academy',
        tagline:  'History, geography, politics & culture',
        icon:     '🏛️',
        accent:   '#5c3d11',
        status:   'coming-soon',
        url:      null,
        free:     false
      },
      {
        id:       'culinary',
        name:     'German Culinary Academy',
        tagline:  'Food, beer, wine & German traditions',
        icon:     '🍺',
        accent:   '#c62828',
        status:   'coming-soon',
        url:      null,
        free:     false
      },
      {
        id:       'living',
        name:     'Living in Germany Academy',
        tagline:  'Bureaucracy, life, work & integration',
        icon:     '🏠',
        accent:   '#2e7d32',
        status:   'coming-soon',
        url:      null,
        free:     false
      },
      {
        id:       'quiz',
        name:     'Quiz Center',
        tagline:  'Challenge yourself across all academies',
        icon:     '🎯',
        accent:   '#6a1b9a',
        status:   'coming-soon',
        url:      null,
        free:     false
      }
    ],

    /** Get one academy by ID */
    get: function (id) {
      for (var i = 0; i < ACADEMIES.registry.length; i++) {
        if (ACADEMIES.registry[i].id === id) return ACADEMIES.registry[i];
      }
      return null;
    },

    /** Get all academies with status === 'active' */
    getActive: function () {
      return ACADEMIES.registry.filter(function (a) { return a.status === 'active'; });
    },

    /** Get all academies with status === 'coming-soon' */
    getComingSoon: function () {
      return ACADEMIES.registry.filter(function (a) { return a.status === 'coming-soon'; });
    }
  };


  // ═══════════════════════════════════════════════════════════════
  // §7  VOCABULARY  (stub — Sprint-002+)
  // ═══════════════════════════════════════════════════════════════
  var VOCAB = {

    /**
     * Look up a vocabulary entry across all academies.
     * Future: queries the central Vocabulary Universe database.
     *
     * @param {string} term       — German word or phrase
     * @param {string} [lang]     — target language code ('en', 'fr' …)
     * @param {string} [academy]  — originating academy ID
     * @returns {object|null}
     */
    lookup: function (term, lang, academy) {
      // TODO Sprint-002: connect to Vocabulary Universe
      if (CONFIG.debug) {
        console.log('[TGS:VOCAB] lookup stub — term:', term, '| lang:', lang, '| academy:', academy);
      }
      return null;
    },

    /**
     * Register vocabulary entries from a lesson.
     * Future: feeds the central vocabulary database without duplication.
     *
     * @param {Array}  entries  — [{ de, en, level, academy, tags }, …]
     */
    register: function (entries) {
      // TODO Sprint-002: persist to Vocabulary Universe
      if (CONFIG.debug) {
        console.log('[TGS:VOCAB] register stub — entries:', entries.length);
      }
    }
  };


  // ═══════════════════════════════════════════════════════════════
  // §8  AI HOOKS  (stub — future sprint)
  // ═══════════════════════════════════════════════════════════════
  var AI = {

    /**
     * Request a contextual hint for the current exercise.
     * Future: calls the AI Learning Assistant API.
     *
     * @param {object} context  — { question, level, module, userAnswer }
     * @returns {Promise<string|null>}
     */
    hint: function (context) {
      if (CONFIG.debug) console.log('[TGS:AI] hint stub — context:', context);
      return Promise.resolve(null);
    },

    /**
     * Submit a learner response for AI-powered feedback.
     * Future: personalised explanations based on error patterns.
     *
     * @param {string} response   — what the user answered
     * @param {string} expected   — correct answer
     * @param {string} level      — CEFR level ('A1', 'B2' …)
     * @returns {Promise<string|null>}
     */
    feedback: function (response, expected, level) {
      if (CONFIG.debug) console.log('[TGS:AI] feedback stub');
      return Promise.resolve(null);
    },

    /**
     * Personalise the learning path based on progress data.
     * Future: ML-based adaptive path recommendation.
     *
     * @param {object} progressData  — from PROGRESS.summary()
     * @returns {object|null}        — recommended next steps
     */
    adapt: function (progressData) {
      if (CONFIG.debug) console.log('[TGS:AI] adapt stub');
      return null;
    },

    /**
     * Log a learning event for future analytics / AI training.
     * Future: feeds anonymised data to improvement pipeline.
     *
     * @param {string} event   — event type ('lesson_complete', 'quiz_score' …)
     * @param {object} data    — event payload
     */
    track: function (event, data) {
      if (CONFIG.debug) console.log('[TGS:AI] track stub — event:', event, '| data:', data);
    }
  };


  // ═══════════════════════════════════════════════════════════════
  // §9  UTILS
  // ═══════════════════════════════════════════════════════════════
  var UTILS = {

    /** Capitalise first character of a string */
    capitalize: function (str) {
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    },

    /** Parse current URL query parameters into an object */
    getParams: function () {
      var params = {};
      window.location.search.replace(/[?&]([^=&]+)=([^&]*)/g, function (_, k, v) {
        params[decodeURIComponent(k)] = decodeURIComponent(v);
      });
      return params;
    },

    /** Minimal event bus for cross-module communication */
    events: (function () {
      var listeners = {};
      return {
        on: function (ev, fn) {
          (listeners[ev] = listeners[ev] || []).push(fn);
        },
        off: function (ev, fn) {
          listeners[ev] = (listeners[ev] || []).filter(function (f) { return f !== fn; });
        },
        emit: function (ev, data) {
          (listeners[ev] || []).forEach(function (fn) { fn(data); });
        }
      };
    })()
  };


  // ═══════════════════════════════════════════════════════════════
  // §10 INIT
  // ═══════════════════════════════════════════════════════════════
  function init () {
    if (CONFIG.debug) {
      console.log(
        '%c TheGermanStefan Academy Engine v' + CONFIG.version + ' (' + CONFIG.sprint + ') ',
        'background:#0b2545;color:#f9a825;font-weight:bold;padding:4px 10px;border-radius:4px'
      );
    }
    UTILS.events.emit('tgs:ready', { version: CONFIG.version, sprint: CONFIG.sprint });
  }


  // ═══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════
  var TGS = {
    version:     CONFIG.version,
    config:      CONFIG,
    nav:         NAV,
    breadcrumbs: BREADCRUMBS,
    progress:    PROGRESS,
    premium:     PREMIUM,
    academies:   ACADEMIES,
    vocab:       VOCAB,
    ai:          AI,
    utils:       UTILS
  };

  global.TGS = TGS;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}(window));
