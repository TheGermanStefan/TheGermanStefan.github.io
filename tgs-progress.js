/**
 * ═══════════════════════════════════════════════════════════════════
 *  TheGermanStefan Academy — Progress System
 *  tgs-progress.js — v1.0.0 | Sprint-003A
 *
 *  Single source of truth for all student learning progress.
 *  Extends tgs-core.js §4 PROGRESS without replacing it.
 *  tgs-core.js remains the authority for lesson files to call.
 *
 *  Storage key : tgs_progress_v1
 *  Depends on  : tgs-core.js (TGS), tgs-levels.js (TGS_LEVELS)
 *  Exposes     : window.TGS_PROGRESS
 *
 *  Events emitted (via TGS.utils.events):
 *    progress:lessonComplete   { lessonId, levelId, moduleKey, score, timeSpent, xpGained }
 *    progress:moduleComplete   { levelId, moduleKey }
 *    progress:levelComplete    { levelId }
 *    progress:streakUpdate     { current, longest }
 *    progress:xpUpdate         { total, added }
 *
 *  Events consumed:
 *    tgs:lessonComplete        { lessonId, date }  — tgs-core.js §4 Sprint-003A hook
 * ═══════════════════════════════════════════════════════════════════
 */

(function (global) {
  'use strict';

  var STORAGE_KEY    = 'tgs_progress_v1';
  var LEGACY_KEY     = 'tgs_v1';
  var SCHEMA_VERSION = '1.0.0';

  /* ─────────────────────────────────────────────────────────────────
     STORAGE HELPERS
  ───────────────────────────────────────────────────────────────── */

  function _load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function _save(store) {
    try {
      store.updated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) { /* localStorage unavailable — fail silently */ }
  }

  function _emit(event, data) {
    try {
      if (typeof TGS !== 'undefined' && TGS.utils && TGS.utils.events) {
        TGS.utils.events.emit(event, data);
      }
    } catch (e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     SCHEMA INITIALISATION & MIGRATION
  ───────────────────────────────────────────────────────────────── */

  function _createFreshStore() {
    var now = Date.now();
    return {
      version:          SCHEMA_VERSION,
      created:          now,
      updated:          now,
      academyEntryDate: now,
      lessons:          {},   /* lessonId → { complete, date, score, timeSpent } */
      streak:           { current: 0, longest: 0, lastDate: null },
      xp:               0,
      totalStudyTime:   0     /* minutes */
    };
  }

  function _migrate(store) {
    /* Import completed lessons from tgs_v1 (tgs-core.js legacy store) */
    try {
      var raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return;
      var legacy    = JSON.parse(raw);
      var completed = legacy.completed || {};
      var lessonIds = Object.keys(completed);
      if (lessonIds.length === 0) return;

      lessonIds.forEach(function (id) {
        if (!store.lessons[id]) {
          store.lessons[id] = {
            complete:  true,
            date:      completed[id] || Date.now(),
            score:     null,
            timeSpent: null,
            migrated:  true
          };
        }
      });

      /* Approximate migrated XP: 20 XP per legacy lesson */
      store.xp = Math.max(store.xp || 0, lessonIds.length * 20);
    } catch (e) { /* migration is best-effort — never fatal */ }
  }

  function _ensureStore() {
    var store = _load();
    if (store) return store;

    store = _createFreshStore();
    _migrate(store);
    _save(store);
    return store;
  }

  /* ─────────────────────────────────────────────────────────────────
     STREAK LOGIC
  ───────────────────────────────────────────────────────────────── */

  function _todayStr() {
    return new Date().toISOString().slice(0, 10); /* 'YYYY-MM-DD' */
  }

  /**
   * Update streak based on today's date vs lastDate.
   * @returns {boolean} true if streak value changed (for event gating)
   */
  function _updateStreak(store) {
    var today = _todayStr();
    var last  = store.streak.lastDate;

    if (last === today) return false; /* already active today — no change */

    if (last) {
      var msPerDay = 24 * 60 * 60 * 1000;
      /* Use noon to avoid DST edge cases */
      var lastDate = new Date(last + 'T12:00:00');
      var diff     = Math.round((new Date() - lastDate) / msPerDay);
      store.streak.current = (diff === 1) ? store.streak.current + 1 : 1;
    } else {
      store.streak.current = 1;
    }

    if (store.streak.current > store.streak.longest) {
      store.streak.longest = store.streak.current;
    }
    store.streak.lastDate = today;
    return true;
  }

  /* ─────────────────────────────────────────────────────────────────
     MODULE / LEVEL COMPLETION CHECKS
  ───────────────────────────────────────────────────────────────── */

  function _availableLessons(lessons) {
    return lessons.filter(function (l) { return l.status === 'available'; });
  }

  function _allComplete(available, store) {
    if (available.length === 0) return false;
    return available.every(function (l) {
      return store.lessons[l.id] && store.lessons[l.id].complete;
    });
  }

  function _checkModuleComplete(store, levelId, moduleKey) {
    try {
      if (typeof TGS_LEVELS === 'undefined') return false;
      var level = TGS_LEVELS.get(levelId);
      if (!level || !level.modules[moduleKey]) return false;
      var avail = _availableLessons(level.modules[moduleKey].lessons || []);
      return _allComplete(avail, store);
    } catch (e) { return false; }
  }

  function _checkLevelComplete(store, levelId) {
    try {
      if (typeof TGS_LEVELS === 'undefined') return false;
      var level = TGS_LEVELS.get(levelId);
      if (!level) return false;
      var keys        = Object.keys(level.modules);
      var anyAvail    = false;
      for (var i = 0; i < keys.length; i++) {
        var lessons = level.modules[keys[i]].lessons || [];
        var avail   = _availableLessons(lessons);
        if (avail.length === 0) continue;
        anyAvail = true;
        if (!_allComplete(avail, store)) return false;
      }
      return anyAvail;
    } catch (e) { return false; }
  }

  /* ═════════════════════════════════════════════════════════════════
     PUBLIC API
  ═════════════════════════════════════════════════════════════════ */

  var TGS_PROGRESS = {

    version: SCHEMA_VERSION,

    /**
     * Mark a lesson as complete.
     * Idempotent — events fire once per lesson, not on repeat calls.
     *
     * @param {string} lessonId
     * @param {object} [opts]  { score, timeSpent, xp, levelId, moduleKey }
     */
    markComplete: function (lessonId, opts) {
      opts = opts || {};
      var store      = _ensureStore();
      var alreadyDone = store.lessons[lessonId] && store.lessons[lessonId].complete;

      store.lessons[lessonId] = {
        complete:  true,
        date:      Date.now(),
        score:     (typeof opts.score     === 'number') ? opts.score     : null,
        timeSpent: (typeof opts.timeSpent === 'number') ? opts.timeSpent : null
      };

      /* Idempotency gate — update timestamp but skip events if already done */
      if (alreadyDone) { _save(store); return; }

      var streakChanged = _updateStreak(store);
      var xpGained      = (typeof opts.xp === 'number') ? opts.xp : 20;
      store.xp          = (store.xp || 0) + xpGained;

      if (typeof opts.timeSpent === 'number') {
        store.totalStudyTime = (store.totalStudyTime || 0) + opts.timeSpent;
      }

      _save(store);

      var levelId   = opts.levelId   || null;
      var moduleKey = opts.moduleKey || null;

      _emit('progress:lessonComplete', {
        lessonId:  lessonId,
        levelId:   levelId,
        moduleKey: moduleKey,
        score:     opts.score     || null,
        timeSpent: opts.timeSpent || null,
        xpGained:  xpGained
      });

      if (streakChanged) {
        _emit('progress:streakUpdate', {
          current: store.streak.current,
          longest: store.streak.longest
        });
      }

      _emit('progress:xpUpdate', { total: store.xp, added: xpGained });

      if (levelId && moduleKey && _checkModuleComplete(store, levelId, moduleKey)) {
        _emit('progress:moduleComplete', { levelId: levelId, moduleKey: moduleKey });
      }

      if (levelId && _checkLevelComplete(store, levelId)) {
        _emit('progress:levelComplete', { levelId: levelId });
      }
    },

    /** @returns {boolean} */
    isComplete: function (lessonId) {
      var store = _load();
      return !!(store && store.lessons[lessonId] && store.lessons[lessonId].complete);
    },

    /** @returns {{ complete, date, score, timeSpent } | null} */
    getLesson: function (lessonId) {
      var store = _load();
      return (store && store.lessons[lessonId]) ? store.lessons[lessonId] : null;
    },

    /** @returns {{ total, done, pct, nextLesson }} */
    getLevelProgress: function (levelId) {
      var empty = { total: 0, done: 0, pct: 0, nextLesson: null };
      if (typeof TGS_LEVELS === 'undefined') return empty;

      var store = _ensureStore();
      var level = TGS_LEVELS.get(levelId);
      if (!level) return empty;

      var total      = 0;
      var done       = 0;
      var nextLesson = null;
      var keys       = Object.keys(level.modules);

      for (var m = 0; m < keys.length; m++) {
        var mk      = keys[m];
        var lessons = level.modules[mk].lessons || [];
        for (var l = 0; l < lessons.length; l++) {
          var lsn = lessons[l];
          if (lsn.status === 'coming-soon') continue;
          total++;
          if (store.lessons[lsn.id] && store.lessons[lsn.id].complete) {
            done++;
          } else if (!nextLesson) {
            nextLesson = { lesson: lsn, moduleKey: mk, module: level.modules[mk] };
          }
        }
      }

      return {
        total:      total,
        done:       done,
        pct:        total > 0 ? Math.round((done / total) * 100) : 0,
        nextLesson: nextLesson
      };
    },

    /** @returns {{ total, done, pct }} */
    getModuleProgress: function (levelId, moduleKey) {
      if (typeof TGS_LEVELS === 'undefined') return { total: 0, done: 0, pct: 0 };

      var store = _ensureStore();
      var level = TGS_LEVELS.get(levelId);
      if (!level || !level.modules[moduleKey]) return { total: 0, done: 0, pct: 0 };

      var lessons = level.modules[moduleKey].lessons || [];
      var total   = 0;
      var done    = 0;

      for (var i = 0; i < lessons.length; i++) {
        if (lessons[i].status === 'coming-soon') continue;
        total++;
        if (store.lessons[lessons[i].id] && store.lessons[lessons[i].id].complete) done++;
      }

      return { total: total, done: done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
    },

    /** @returns {{ current, longest, lastDate }} */
    getStreak: function () {
      var store = _ensureStore();
      return {
        current:  store.streak.current  || 0,
        longest:  store.streak.longest  || 0,
        lastDate: store.streak.lastDate || null
      };
    },

    /** @returns {number} total XP earned */
    getXP: function () { return (_ensureStore()).xp || 0; },

    /** Manually add XP (e.g. from bonus activities) */
    addXP: function (amount) {
      var store = _ensureStore();
      store.xp  = (store.xp || 0) + amount;
      _save(store);
      _emit('progress:xpUpdate', { total: store.xp, added: amount });
    },

    /** @returns {number} total minutes studied */
    getTotalStudyTime: function () { return (_ensureStore()).totalStudyTime || 0; },

    addStudyTime: function (minutes) {
      var store             = _ensureStore();
      store.totalStudyTime  = (store.totalStudyTime || 0) + minutes;
      _save(store);
    },

    /** Full summary for dashboards and widgets */
    summary: function () {
      var store    = _ensureStore();
      var lessons  = store.lessons || {};
      var doneList = Object.keys(lessons).filter(function (id) { return lessons[id].complete; });
      return {
        schemaVersion:    store.version,
        created:          store.created,
        updated:          store.updated,
        academyEntryDate: store.academyEntryDate || null,
        lessonsComplete:  doneList.length,
        streak:           store.streak,
        xp:               store.xp           || 0,
        totalStudyTime:   store.totalStudyTime || 0
      };
    },

    /** Full JSON export for backup / import */
    export: function () { return JSON.stringify(_ensureStore(), null, 2); },

    /** Subscribe to a progress event */
    on: function (event, callback) {
      try {
        if (typeof TGS !== 'undefined') TGS.utils.events.on(event, callback);
      } catch (e) {}
    }
  };

  /* ─────────────────────────────────────────────────────────────────
     BRIDGE: forward tgs-core.js completions into tgs-progress.js
     Listens for the hook added to tgs-core.js PROGRESS.complete()
     in Sprint-003A. markComplete() is idempotent so this is safe.
  ───────────────────────────────────────────────────────────────── */
  function _wireCoreBridge() {
    try {
      if (typeof TGS !== 'undefined' && TGS.utils && TGS.utils.events) {
        TGS.utils.events.on('tgs:lessonComplete', function (data) {
          TGS_PROGRESS.markComplete(data.lessonId);
        });
      }
    } catch (e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     BOOT
  ───────────────────────────────────────────────────────────────── */
  _ensureStore();
  _wireCoreBridge();

  global.TGS_PROGRESS = TGS_PROGRESS;

}(window));
