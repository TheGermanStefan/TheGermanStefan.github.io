/**
 * ═══════════════════════════════════════════════════════════════════
 *  TheGermanStefan Academy — Learning Profile
 *  tgs-profile.js — v1.0.0 | Sprint-003A
 *
 *  Permanent student identity: goals, preferences, placement history.
 *  Append-only placement history — never overwritten.
 *
 *  Storage key : tgs_profile_v1
 *  Depends on  : tgs-core.js (TGS) — used for migration only
 *  Exposes     : window.TGS_PROFILE
 *
 *  Events emitted (via TGS.utils.events):
 *    profile:ready        { level, onboarded }
 *    profile:levelChanged { from, to }
 * ═══════════════════════════════════════════════════════════════════
 */

(function (global) {
  'use strict';

  var STORAGE_KEY    = 'tgs_profile_v1';
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
    } catch (e) {}
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
      onboarded:        false,
      goal:             null,       /* 'travel'|'work'|'exam'|'culture'|'family' */
      preferences: {
        studyDuration:  30,         /* minutes: 15|30|45|60 */
        style:          null,       /* 'visual'|'reading'|'listening'|'mixed' */
        exercisePref:   [],         /* ['grammar','vocabulary','reading','speaking'] */
        studyTimes:     []          /* ['morning','afternoon','evening','weekend'] */
      },
      currentLevel:     null,       /* 'A0'|'A1'|'A2'|'B1'|'B2'|'C1'|'C2' */
      placementHistory: []          /* append-only: [{ date, level, score }] */
    };
  }

  function _migrate(store) {
    /* Import placement result from tgs-core.js (tgs_v1) on first run */
    try {
      if (typeof TGS === 'undefined' || !TGS.progress) return;
      var level = TGS.progress.getPlacementResult();
      if (!level) return;
      if (store.placementHistory.length === 0) {
        store.placementHistory.push({
          date:     Date.now(),
          level:    level,
          score:    null,
          migrated: true
        });
        store.currentLevel = store.currentLevel || level;
      }
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

  /* ═════════════════════════════════════════════════════════════════
     PUBLIC API
  ═════════════════════════════════════════════════════════════════ */

  var TGS_PROFILE = {

    version: SCHEMA_VERSION,

    /* ── Onboarding ─────────────────────────────────────────────── */

    /** @returns {boolean} */
    isOnboarded: function () { return !!(_ensureStore()).onboarded; },

    markOnboarded: function () {
      var store     = _ensureStore();
      store.onboarded = true;
      _save(store);
    },

    /* ── Goal ───────────────────────────────────────────────────── */

    /** @returns {'travel'|'work'|'exam'|'culture'|'family'|null} */
    getGoal: function () { return (_ensureStore()).goal; },

    /** @param {'travel'|'work'|'exam'|'culture'|'family'} goal */
    setGoal: function (goal) {
      var store = _ensureStore();
      store.goal = goal;
      _save(store);
    },

    /* ── Preferences ────────────────────────────────────────────── */

    /** @returns {{ studyDuration, style, exercisePref, studyTimes }} */
    getPreferences: function () {
      return (_ensureStore()).preferences;
    },

    /**
     * Partial update — only supplied keys are changed.
     * @param {{ studyDuration?, style?, exercisePref?, studyTimes? }} prefs
     */
    setPreferences: function (prefs) {
      var store = _ensureStore();
      var p     = store.preferences;
      if (typeof prefs.studyDuration !== 'undefined') p.studyDuration = prefs.studyDuration;
      if (typeof prefs.style        !== 'undefined') p.style         = prefs.style;
      if (typeof prefs.exercisePref !== 'undefined') p.exercisePref  = prefs.exercisePref;
      if (typeof prefs.studyTimes   !== 'undefined') p.studyTimes    = prefs.studyTimes;
      _save(store);
    },

    /* ── Placement History ──────────────────────────────────────── */

    /**
     * Append a new placement result. History is append-only — never overwritten.
     * Updates currentLevel to the most recent result.
     * @param {{ date?, level, score? }} result
     */
    appendPlacementResult: function (result) {
      var store = _ensureStore();
      var prev  = store.currentLevel;
      var entry = {
        date:  result.date  || Date.now(),
        level: result.level,
        score: (typeof result.score === 'number') ? result.score : null
      };

      store.placementHistory.push(entry);
      store.currentLevel = result.level;
      _save(store);

      if (prev !== result.level) {
        _emit('profile:levelChanged', { from: prev, to: result.level });
      }
    },

    /** @returns {Array<{ date, level, score }>} full history, oldest first */
    getPlacementHistory: function () {
      return (_ensureStore()).placementHistory.slice(); /* defensive copy */
    },

    /** @returns {{ date, level, score } | null} most recent placement */
    getLatestPlacement: function () {
      var h = (_ensureStore()).placementHistory;
      return h.length > 0 ? h[h.length - 1] : null;
    },

    /* ── Current Level ──────────────────────────────────────────── */

    /** @returns {'A0'|'A1'|'A2'|'B1'|'B2'|'C1'|'C2'|null} */
    getCurrentLevel: function () {
      return (_ensureStore()).currentLevel;
    },

    /** Set level explicitly (e.g. from a dashboard level-change control) */
    setCurrentLevel: function (level) {
      var store = _ensureStore();
      var prev  = store.currentLevel;
      store.currentLevel = level;
      _save(store);
      if (prev !== level) {
        _emit('profile:levelChanged', { from: prev, to: level });
      }
    },

    /* ── Summary & Export ───────────────────────────────────────── */

    summary: function () {
      var store = _ensureStore();
      return {
        schemaVersion:    store.version,
        created:          store.created,
        updated:          store.updated,
        onboarded:        store.onboarded,
        goal:             store.goal,
        preferences:      store.preferences,
        currentLevel:     store.currentLevel,
        placementHistory: store.placementHistory
      };
    },

    export: function () { return JSON.stringify(_ensureStore(), null, 2); }
  };

  /* ─────────────────────────────────────────────────────────────────
     BOOT — emit profile:ready so dependents (achievements, buddy)
     can initialise against current profile state
  ───────────────────────────────────────────────────────────────── */
  var _store = _ensureStore();
  _emit('profile:ready', {
    level:     _store.currentLevel,
    onboarded: _store.onboarded
  });

  global.TGS_PROFILE = TGS_PROFILE;

}(window));
