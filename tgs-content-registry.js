/**
 * ═══════════════════════════════════════════════════════════════════
 *  TheGermanStefan Academy — Content Registry
 *  tgs-content-registry.js — v1.0.0 | Sprint-003A
 *
 *  Enriched content map. Wraps tgs-levels.js (read-only) with
 *  AI-ready lesson metadata and Academy OS v2.2 level enrichment.
 *  tgs-levels.js is never modified — it remains the single source
 *  of truth for lesson files, IDs, titles, and availability status.
 *
 *  Depends on  : tgs-levels.js (TGS_LEVELS) — must load first
 *  Exposes     : window.TGS_CONTENT
 *
 *  Lesson enrichment added (all derived):
 *    difficulty        — 'beginner'|'elementary'|'intermediate'|'upper-intermediate'|'advanced'|'mastery'
 *    estimatedXP       — XP awarded on completion
 *    estimatedMinutes  — expected study time
 *    dnaTag            — 'grammar'|'vocabulary'|'reading'|'speaking'|...
 *    cefrLevel         — inherited from level
 *    moduleKey         — inherited from module
 *    examRelevance     — boolean
 *    prerequisites     — [lessonId] of previous lesson in same module
 *    recommendedNext   — lessonId of next lesson in same module, or null
 *    keywords          — searchable keyword array
 *
 *  Level enrichment added:
 *    difficulty             — CEFR difficulty label
 *    certificationReadiness — CEFR-neutral readiness statement (replaces examName display)
 *    trialExams             — 5 Trial Exam slots per level (reserved)
 *    stampSlots             — Journey Stamp definitions for German Passport page
 * ═══════════════════════════════════════════════════════════════════
 */

(function (global) {
  'use strict';

  var SCHEMA_VERSION = '1.0.0';

  /* ─────────────────────────────────────────────────────────────────
     DIFFICULTY MAP
  ───────────────────────────────────────────────────────────────── */
  var DIFFICULTY_MAP = {
    A0: 'beginner',
    A1: 'beginner',
    A2: 'elementary',
    B1: 'intermediate',
    B2: 'upper-intermediate',
    C1: 'advanced',
    C2: 'mastery'
  };

  /* ─────────────────────────────────────────────────────────────────
     BASE XP TABLE  (difficulty → module type → XP)
  ───────────────────────────────────────────────────────────────── */
  var XP_TABLE = {
    'beginner':           { grammar: 20, vocabulary: 15, reading: 18, speaking: 18, listening: 18, writing: 18, 'default': 15 },
    'elementary':         { grammar: 25, vocabulary: 20, reading: 22, speaking: 22, listening: 22, writing: 22, 'default': 20 },
    'intermediate':       { grammar: 35, vocabulary: 28, reading: 30, speaking: 30, listening: 30, writing: 30, 'default': 28 },
    'upper-intermediate': { grammar: 45, vocabulary: 38, reading: 40, speaking: 40, listening: 40, writing: 40, 'default': 38 },
    'advanced':           { grammar: 55, vocabulary: 48, reading: 50, speaking: 50, listening: 50, writing: 50, 'default': 48 },
    'mastery':            { grammar: 65, vocabulary: 58, reading: 60, speaking: 60, listening: 60, writing: 60, 'default': 58 }
  };

  /* ─────────────────────────────────────────────────────────────────
     ESTIMATED DURATION MAP  (module type → minutes)
  ───────────────────────────────────────────────────────────────── */
  var DURATION_MAP = {
    grammar: 20, vocabulary: 15, reading: 25,
    speaking: 20, listening: 20, writing: 25, 'default': 20
  };

  /* ─────────────────────────────────────────────────────────────────
     DNA TAG MAP
  ───────────────────────────────────────────────────────────────── */
  var DNA_TAG_MAP = {
    grammar: 'grammar', vocabulary: 'vocabulary', reading: 'reading',
    speaking: 'speaking', listening: 'listening', writing: 'writing'
  };

  /* ─────────────────────────────────────────────────────────────────
     CERTIFICATION READINESS  (CEFR-neutral language, v2.2)
  ───────────────────────────────────────────────────────────────── */
  var CERT_READINESS = {
    A0: 'CEFR A0 — Foundation readiness for the absolute beginner',
    A1: 'CEFR A1 — Readiness for recognised international German language certification at elementary level',
    A2: 'CEFR A2 — Readiness for recognised international German language certification at pre-intermediate level',
    B1: 'CEFR B1 — Readiness for recognised international German language certification at intermediate level',
    B2: 'CEFR B2 — Readiness for recognised international German language certification at upper-intermediate level',
    C1: 'CEFR C1 — Readiness for recognised international German language certification at advanced level',
    C2: 'CEFR C2 — Readiness for recognised international German language certification at mastery level'
  };

  /* ─────────────────────────────────────────────────────────────────
     KEYWORD DERIVATION
  ───────────────────────────────────────────────────────────────── */
  function _keywords(title, levelId, moduleKey) {
    var raw   = (title || '').toLowerCase().replace(/[()–\-\/]/g, ' ');
    var words = raw.split(/\s+/).filter(function (w) { return w.length > 2; });
    words.push(levelId.toLowerCase());
    words.push(moduleKey.toLowerCase());
    words.push('german');
    words.push('cefr');

    /* Deduplicate while preserving order */
    var seen   = {};
    var result = [];
    for (var i = 0; i < words.length; i++) {
      if (!seen[words[i]]) {
        seen[words[i]] = true;
        result.push(words[i]);
      }
    }
    return result;
  }

  /* ─────────────────────────────────────────────────────────────────
     LESSON ENRICHMENT
  ───────────────────────────────────────────────────────────────── */
  function _enrichLesson(lesson, levelId, moduleKey, lessonIndex, allLessons) {
    var difficulty  = DIFFICULTY_MAP[levelId] || 'beginner';
    var xpRow       = XP_TABLE[difficulty] || XP_TABLE['beginner'];
    var xp          = lesson.status === 'coming-soon' ? 0 : (xpRow[moduleKey] || xpRow['default']);
    var duration    = lesson.status === 'coming-soon' ? null : (DURATION_MAP[moduleKey] || DURATION_MAP['default']);

    /* Prerequisites: previous lesson in same module, or [] if first */
    var prerequisites = lessonIndex > 0 ? [allLessons[lessonIndex - 1].id] : [];

    /* Recommended next: next lesson in same module, or null if last */
    var recommendedNext = lessonIndex < allLessons.length - 1
      ? allLessons[lessonIndex + 1].id
      : null;

    return {
      /* Original tgs-levels.js fields */
      id:     lesson.id,
      title:  lesson.title,
      file:   lesson.file,
      status: lesson.status,

      /* Context */
      cefrLevel: levelId,
      moduleKey: moduleKey,

      /* Enrichment (Sprint-003A) */
      difficulty:       difficulty,
      estimatedXP:      xp,
      estimatedMinutes: duration,
      dnaTag:           DNA_TAG_MAP[moduleKey] || moduleKey,
      examRelevance:    (moduleKey === 'grammar' || moduleKey === 'reading' || moduleKey === 'vocabulary'),

      /* AI-ready fields (Enhancement 2) */
      prerequisites:  prerequisites,
      recommendedNext: recommendedNext,
      keywords:       _keywords(lesson.title, levelId, moduleKey)
    };
  }

  /* ─────────────────────────────────────────────────────────────────
     TRIAL EXAM SLOTS  (5 per level, reserved for Exam sprint)
  ───────────────────────────────────────────────────────────────── */
  function _trialExamSlots(levelId) {
    var slots = [];
    for (var i = 1; i <= 5; i++) {
      slots.push({
        number:    i,
        id:        levelId + '_trialExam_' + i,
        title:     levelId + ' Trial Exam ' + i,
        available: false,   /* will be set true in future Exam sprint */
        stampId:   levelId + '_trialExam_' + i
      });
    }
    return slots;
  }

  /* ─────────────────────────────────────────────────────────────────
     STAMP SLOT DEFINITIONS  (German Passport page layout)
  ───────────────────────────────────────────────────────────────── */
  function _stampSlots(levelId, moduleKeys) {
    var slots = [];

    /* Placement test stamp */
    slots.push({ id: levelId + '_placement', title: 'Placement — ' + levelId, category: 'placement' });

    /* Module completion stamps */
    for (var m = 0; m < moduleKeys.length; m++) {
      var mk = moduleKeys[m];
      slots.push({
        id:       levelId + '_module_' + mk,
        title:    levelId + ' ' + mk.charAt(0).toUpperCase() + mk.slice(1) + ' Complete',
        category: 'module'
      });
    }

    /* Trial Exam stamps (5 per level) */
    for (var i = 1; i <= 5; i++) {
      slots.push({
        id:       levelId + '_trialExam_' + i,
        title:    levelId + ' Trial Exam ' + i,
        category: 'trialExam'
      });
    }

    /* Level complete stamp */
    slots.push({
      id:       levelId + '_levelComplete',
      title:    levelId + ' Complete',
      category: 'levelComplete'
    });

    return slots;
  }

  /* ─────────────────────────────────────────────────────────────────
     ENRICHMENT CACHE
     Built once on first access, then served from memory.
  ───────────────────────────────────────────────────────────────── */
  var _cache = null;

  function _build() {
    if (typeof TGS_LEVELS === 'undefined') {
      if (typeof console !== 'undefined') {
        console.warn('[TGS_CONTENT] tgs-levels.js not loaded — content registry unavailable.');
      }
      return null;
    }

    var result    = {};
    var allLevels = TGS_LEVELS.getAll();

    for (var v = 0; v < allLevels.length; v++) {
      var level      = allLevels[v];
      var levelId    = level.id;
      var moduleKeys = Object.keys(level.modules);

      var enrichedModules = {};
      var lessonIndex     = {}; /* flat map: lessonId → enrichedLesson */

      for (var m = 0; m < moduleKeys.length; m++) {
        var mk         = moduleKeys[m];
        var rawLessons = level.modules[mk].lessons || [];
        var enriched   = [];

        for (var l = 0; l < rawLessons.length; l++) {
          var el = _enrichLesson(rawLessons[l], levelId, mk, l, rawLessons);
          enriched.push(el);
          lessonIndex[el.id] = el;
        }

        enrichedModules[mk] = {
          label:   level.modules[mk].label,
          icon:    level.modules[mk].icon,
          lessons: enriched
        };
      }

      result[levelId] = {
        /* Original tgs-levels.js fields */
        id:          level.id,
        name:        level.name,
        emoji:       level.emoji,
        color:       level.color,
        colorLight:  level.colorLight,
        description: level.description,
        outcomes:    level.outcomes,
        studyTime:   level.studyTime,
        vocabTarget: level.vocabTarget,
        free:        level.free,
        nextLevel:   level.nextLevel,
        prevLevel:   level.prevLevel,
        legacyHub:   level.legacyHub || null,

        /* Level enrichment (Sprint-003A) */
        difficulty:             DIFFICULTY_MAP[levelId] || 'beginner',
        certificationReadiness: CERT_READINESS[levelId] || null,
        trialExams:             _trialExamSlots(levelId),
        stampSlots:             _stampSlots(levelId, moduleKeys),

        /* Enriched modules */
        modules: enrichedModules,

        /* Internal fast lookup — private, prefixed with _ */
        _lessonIndex: lessonIndex
      };
    }

    return result;
  }

  function _getCache() {
    if (!_cache) _cache = _build();
    return _cache;
  }

  /* ═════════════════════════════════════════════════════════════════
     PUBLIC API
  ═════════════════════════════════════════════════════════════════ */

  var TGS_CONTENT = {

    version: SCHEMA_VERSION,

    /** @returns {object|null} enriched level */
    getLevel: function (levelId) {
      var c = _getCache();
      return c ? (c[levelId] || null) : null;
    },

    /** @returns {Array} all 7 levels in CEFR order, enriched */
    getAllLevels: function () {
      var c = _getCache();
      if (!c || typeof TGS_LEVELS === 'undefined') return [];
      var order  = TGS_LEVELS.getAll();
      var result = [];
      for (var i = 0; i < order.length; i++) {
        var entry = c[order[i].id];
        if (entry) result.push(entry);
      }
      return result;
    },

    /** @returns {object|null} single enriched lesson by ID */
    getLesson: function (lessonId) {
      var c = _getCache();
      if (!c) return null;
      var levelIds = Object.keys(c);
      for (var i = 0; i < levelIds.length; i++) {
        var lesson = c[levelIds[i]]._lessonIndex[lessonId];
        if (lesson) return lesson;
      }
      return null;
    },

    /** @returns {Array} enriched lessons for a specific level + module */
    getLessons: function (levelId, moduleKey) {
      var level = TGS_CONTENT.getLevel(levelId);
      if (!level || !level.modules[moduleKey]) return [];
      return level.modules[moduleKey].lessons;
    },

    /**
     * Get the next enriched lesson after the given lesson ID.
     * Follows recommendedNext within the module.
     * @returns {object|null}
     */
    getNextLesson: function (lessonId) {
      var lesson = TGS_CONTENT.getLesson(lessonId);
      if (!lesson || !lesson.recommendedNext) return null;
      return TGS_CONTENT.getLesson(lesson.recommendedNext);
    },

    /** @returns {{ total, available, comingSoon }} */
    countAvailable: function (levelId) {
      var level = TGS_CONTENT.getLevel(levelId);
      if (!level) return { total: 0, available: 0, comingSoon: 0 };

      var total = 0, available = 0, comingSoon = 0;
      var moduleKeys = Object.keys(level.modules);
      for (var m = 0; m < moduleKeys.length; m++) {
        var lessons = level.modules[moduleKeys[m]].lessons || [];
        for (var l = 0; l < lessons.length; l++) {
          total++;
          if (lessons[l].status === 'available') { available++; } else { comingSoon++; }
        }
      }
      return { total: total, available: available, comingSoon: comingSoon };
    },

    /** @returns {Array} 5 Trial Exam slot objects for a level */
    getTrialExams: function (levelId) {
      var level = TGS_CONTENT.getLevel(levelId);
      return level ? level.trialExams : [];
    },

    /** @returns {Array} Journey Stamp slot definitions for a level's Passport page */
    getStampSlots: function (levelId) {
      var level = TGS_CONTENT.getLevel(levelId);
      return level ? level.stampSlots : [];
    },

    /** @returns {Array<string>} ['A0','A1','A2','B1','B2','C1','C2'] */
    getLevelOrder: function () {
      if (typeof TGS_LEVELS === 'undefined') return [];
      return TGS_LEVELS.getAll().map(function (l) { return l.id; });
    },

    /**
     * Full-text search across lesson keywords.
     * Stub in Sprint-003A — implemented in Phase 5 Widget Sprint.
     * @returns {Array}
     */
    search: function (query) {
      /* Stub — returns [] until Phase 5 implementation */
      if (typeof console !== 'undefined') {
        console.log('[TGS_CONTENT] search() called with:', query, '— stub, returns []');
      }
      return [];
    }
  };

  global.TGS_CONTENT = TGS_CONTENT;

}(window));
