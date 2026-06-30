/**
 * ═══════════════════════════════════════════════════════════════════
 *  TheGermanStefan Academy Engine
 *  tgs-core.js — v1.0 | Sprint-001
 *
 *  Sprint-003A change: one line added to PROGRESS.complete() — line tagged
 *  with "Sprint-003A hook". All other code is identical to Sprint-002-RC1.
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
    version:          '1.2.0',
    sprint:           'Sprint-002-RC1',
    baseUrl:          'https://thegermanstefan.github.io/',
    skoolUrl:         'https://www.skool.com/thegermanstefan-9325',
    upgradeUrl:       'https://www.skool.com/thegermanstefan-9325',
    lockedPage:       'locked.html',
    storageKey:       'tgs_v1',
    /* TEMP_BRIDGE */ premiumStorageKey: 'tgs_premium_v1',
    /* TEMP_BRIDGE */ premiumKey:        'tgs-s2025-premium',
    debug:            false
  };


  // ═══════════════════════════════════════════════════════════════
  // §2  NAVIGATION
  // ═══════════════════════════════════════════════════════════════
  var NAV = {

    pages: {
      home:               'index.html',
      languageAcademy:    'language-academy.html',
      placementTest:      'placement-test.html',
      vocabularyUniverse: 'vocabulary-universe.html',
      levelDashboard:     'level-dashboard.html',
      specialSkillsHub:   'special-skills-hub.html',
      examCenter:         'exam-center.html',
      locked:             'locked.html'
    },

    levelHubs: {
      A0: 'TheGermanStefan_A0_Beginner_Hub.html',
      A1: 'TheGermanStefan_A1_Hub.html',
      A2: 'TheGermanStefan_A2_Hub.html',
      B1: 'TheGermanStefan_B1_Hub.html',
      B2: 'TheGermanStefan_B2_Hub.html',
      C1: 'TheGermanStefan_C1_Hub.html',
      C2: 'TheGermanStefan_C2_Hub.html'
    },

    premiumGateUrl: function (academy, course, ret) {
      var url = CONFIG.lockedPage
        + '?academy=' + encodeURIComponent(academy)
        + '&course='  + encodeURIComponent(course);
      if (ret) {
        url += '&return=' + encodeURIComponent(ret);
      }
      return url;
    },

    go: function (name) {
      var page = NAV.pages[name];
      if (page) window.location.href = page;
    },

    detectLevel: function () {
      var file = window.location.pathname.split('/').pop();
      var m = file.match(/^([ABC][012])_/i);
      return m ? m[1].toUpperCase() : null;
    },

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
      UTILS.events.emit('tgs:lessonComplete', { lessonId: lessonId, date: Date.now() }); /* Sprint-003A hook */
    },

    isComplete: function (lessonId) {
      var data = PROGRESS._store();
      return !!(data.completed && data.completed[lessonId]);
    },

    savePlacementResult: function (level) {
      var data = PROGRESS._store();
      data.placementLevel = level;
      data.placementDate  = Date.now();
      PROGRESS._save(data);
    },

    getPlacementResult: function () {
      return (PROGRESS._store()).placementLevel || null;
    },

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

    isUnlocked: function () {
      /* TEMP_BRIDGE: replace this single line with real auth validation */
      return PREMIUM._checkLocalStorage();
    },

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

    upgrade: function () {
      window.open(CONFIG.upgradeUrl, '_blank', 'noopener,noreferrer');
    },

    /** @private TEMP_BRIDGE */
    _checkLocalStorage: function () {
      try {
        var raw = localStorage.getItem(CONFIG.premiumStorageKey);
        if (!raw) return false;
        var data = JSON.parse(raw);
        if (!data || !data.expires) return false;
        if (Date.now() > data.expires) {
          localStorage.removeItem(CONFIG.premiumStorageKey);
          return false;
        }
        return true;
      } catch (e) {
        return false;
      }
    },

    /** @private TEMP_BRIDGE */
    _checkUrlActivation: function () {
      try {
        var params = UTILS.getParams();
        if (!params.tgs_access) return;
        var success = PREMIUM.activate(params.tgs_access);
        if (success) {
          if (CONFIG.debug) console.log('[TGS:PREMIUM] ✓ Activated via URL. 🎓');
          var clean = window.location.href
            .replace(/[?&]tgs_access=[^&]*/g, '')
            .replace(/[?&]$/, '');
          if (clean !== window.location.href) history.replaceState(null, '', clean || './');
        } else {
          if (CONFIG.debug) console.warn('[TGS:PREMIUM] URL activation failed — invalid key.');
        }
      } catch (e) {}
    },

    /** TEMP_BRIDGE */
    activate: function (key) {
      if (key !== CONFIG.premiumKey) return false;
      try {
        var TTL_MS = 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem(CONFIG.premiumStorageKey, JSON.stringify({
          activated: Date.now(),
          expires:   Date.now() + TTL_MS,
          source:    'tgs-activation-v1'
        }));
        return true;
      } catch (e) { return false; }
    },

    /** TEMP_BRIDGE */
    deactivate: function () {
      try { localStorage.removeItem(CONFIG.premiumStorageKey); }
      catch (e) {}
    },

    /** TEMP_BRIDGE */
    status: function () {
      try {
        var raw = localStorage.getItem(CONFIG.premiumStorageKey);
        if (!raw) return { unlocked: false, expiresAt: null, daysLeft: null };
        var data     = JSON.parse(raw);
        var msLeft   = data.expires - Date.now();
        var daysLeft = Math.max(0, Math.round(msLeft / (24 * 60 * 60 * 1000)));
        return {
          unlocked:  msLeft > 0,
          expiresAt: new Date(data.expires).toLocaleDateString(),
          daysLeft:  daysLeft
        };
      } catch (e) {
        return { unlocked: false, expiresAt: null, daysLeft: null };
      }
    }
  };


  // ═══════════════════════════════════════════════════════════════
  // §6  ACADEMY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  var ACADEMIES = {

    registry: [
      {
        id: 'language', name: 'German Language Academy',
        tagline: 'A0 to C2 — Master German from the ground up',
        icon: '🇩🇪', accent: '#1464b4', status: 'active',
        url: 'language-academy.html', free: true
      },
      {
        id: 'knowledge', name: 'Germany Knowledge Academy',
        tagline: 'History, geography, politics & culture',
        icon: '🏛️', accent: '#5c3d11', status: 'coming-soon',
        url: null, free: false
      },
      {
        id: 'culinary', name: 'German Culinary Academy',
        tagline: 'Food, beer, wine & German traditions',
        icon: '🍺', accent: '#c62828', status: 'coming-soon',
        url: null, free: false
      },
      {
        id: 'living', name: 'Living in Germany Academy',
        tagline: 'Bureaucracy, life, work & integration',
        icon: '🏠', accent: '#2e7d32', status: 'coming-soon',
        url: null, free: false
      },
      {
        id: 'challenge-arena', name: 'Challenge Arena',
        tagline: 'Cross-academy challenges, quizzes and competitions',
        icon: '🏆', accent: '#6a1b9a', status: 'coming-soon',
        url: null, free: false
      }
    ],

    get: function (id) {
      for (var i = 0; i < ACADEMIES.registry.length; i++) {
        if (ACADEMIES.registry[i].id === id) return ACADEMIES.registry[i];
      }
      return null;
    },

    getActive: function () {
      return ACADEMIES.registry.filter(function (a) { return a.status === 'active'; });
    },

    getComingSoon: function () {
      return ACADEMIES.registry.filter(function (a) { return a.status === 'coming-soon'; });
    }
  };


  // ═══════════════════════════════════════════════════════════════
  // §7  VOCABULARY UNIVERSE  (stub — Sprint-002+)
  // ═══════════════════════════════════════════════════════════════
  var VOCAB = {

    lookup: function (term, lang, academy) {
      if (CONFIG.debug) {
        console.log('[TGS:VOCAB] lookup stub — term:', term, '| lang:', lang, '| academy:', academy);
      }
      return null;
    },

    register: function (entries) {
      if (CONFIG.debug) {
        console.log('[TGS:VOCAB] register stub — entries:', entries.length);
      }
    }
  };


  // ═══════════════════════════════════════════════════════════════
  // §8  AI HOOKS  (stub — future sprint)
  // ═══════════════════════════════════════════════════════════════
  var AI = {

    hint: function (context) {
      if (CONFIG.debug) console.log('[TGS:AI] hint stub — context:', context);
      return Promise.resolve(null);
    },

    feedback: function (response, expected, level) {
      if (CONFIG.debug) console.log('[TGS:AI] feedback stub');
      return Promise.resolve(null);
    },

    adapt: function (progressData) {
      if (CONFIG.debug) console.log('[TGS:AI] adapt stub');
      return null;
    },

    track: function (event, data) {
      if (CONFIG.debug) console.log('[TGS:AI] track stub — event:', event, '| data:', data);
    }
  };


  // ═══════════════════════════════════════════════════════════════
  // §9  UTILS
  // ═══════════════════════════════════════════════════════════════
  var UTILS = {

    capitalize: function (str) {
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    },

    getParams: function () {
      var params = {};
      window.location.search.replace(/[?&]([^=&]+)=([^&]*)/g, function (_, k, v) {
        params[decodeURIComponent(k)] = decodeURIComponent(v);
      });
      return params;
    },

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
    /* TEMP_BRIDGE: remove this call when the auth layer replaces isUnlocked() */
    PREMIUM._checkUrlActivation();

    if (CONFIG.debug) {
      console.log(
        '%c TheGermanStefan Academy Engine v' + CONFIG.version + ' (' + CONFIG.sprint + ') ',
        'background:#0b2545;color:#f9a825;font-weight:bold;padding:4px 10px;border-radius:4px'
      );
      console.log('[TGS:PREMIUM] status:', PREMIUM.status());
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
