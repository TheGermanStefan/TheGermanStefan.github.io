/**
 * ═══════════════════════════════════════════════════════════════════
 *  TheGermanStefan Academy — Journey Stamps & Achievements
 *  tgs-achievements.js — v1.0.0 | Sprint-003A
 *
 *  Journey Stamps, German Passport pages, Recognised Certifications,
 *  Journey Timeline, and the Celebration Queue (Enhancement 3).
 *
 *  Storage key : tgs_achievements_v1
 *  Depends on  : tgs-core.js (TGS), tgs-progress.js (TGS_PROGRESS),
 *                tgs-content-registry.js (TGS_CONTENT)
 *  Exposes     : window.TGS_ACHIEVEMENTS
 *
 *  Events consumed (via TGS.utils.events):
 *    profile:ready          → awards placement stamp + academy entry stamp
 *    progress:lessonComplete → checks lesson-count milestones
 *    progress:moduleComplete → awards module stamp
 *    progress:levelComplete  → awards level-complete stamp
 *    progress:streakUpdate   → checks streak milestones
 *
 *  Events emitted:
 *    achievement:stampEarned        { stampId, stamp }
 *    achievement:celebrationQueued  { stampId, stamp, message, buddyMessage,
 *                                     animationType, priority, passportPage, timestamp }
 *    achievement:certAdded          { cert }
 *
 *  NOTE: GermanPro Certification should never be presented as an
 *  officially recognised external qualification unless such recognition
 *  is formally obtained. All cert language uses neutral Academy terminology.
 * ═══════════════════════════════════════════════════════════════════
 */

(function (global) {
  'use strict';

  var STORAGE_KEY    = 'tgs_achievements_v1';
  var SCHEMA_VERSION = '1.0.0';

  /* ─────────────────────────────────────────────────────────────────
     MILESTONE STAMP DEFINITIONS
     Cross-level stamps that appear on the Journey Timeline and the
     cross-level Passport section.
  ───────────────────────────────────────────────────────────────── */
  var MILESTONE_STAMPS = {
    'cross_academyEntry': {
      title:    'Academy Entry',
      category: 'milestone',
      levelPage:'cross',
      xp:       10,
      anim:     'entry',
      priority: 'high',
      buddy:    'Welcome to TheGermanStefan Academy. Your German journey starts today.'
    },
    'milestone_lessons_1': {
      title:    'First Lesson',
      category: 'milestone',
      levelPage:'cross',
      xp:       10,
      anim:     'stamp',
      priority: 'high',
      buddy:    'You have completed your first lesson. Every great journey begins with a single step.'
    },
    'milestone_lessons_10': {
      title:    '10 Lessons Complete',
      category: 'milestone',
      levelPage:'cross',
      xp:       25,
      anim:     'stamp',
      priority: 'normal',
      buddy:    '10 lessons complete. You are building real momentum in your German learning.'
    },
    'milestone_lessons_25': {
      title:    '25 Lessons Complete',
      category: 'milestone',
      levelPage:'cross',
      xp:       50,
      anim:     'stamp',
      priority: 'normal',
      buddy:    '25 lessons complete. Your commitment to learning German is showing.'
    },
    'milestone_lessons_50': {
      title:    '50 Lessons Complete',
      category: 'milestone',
      levelPage:'cross',
      xp:       100,
      anim:     'stamp',
      priority: 'high',
      buddy:    '50 lessons complete. You are a dedicated German learner.'
    },
    'milestone_lessons_100': {
      title:    '100 Lessons Complete',
      category: 'milestone',
      levelPage:'cross',
      xp:       200,
      anim:     'milestone',
      priority: 'high',
      buddy:    '100 lessons complete. This is a remarkable achievement. You have committed seriously to German.'
    },
    'milestone_streak_3': {
      title:    '3-Day Streak',
      category: 'consistency',
      levelPage:'cross',
      xp:       15,
      anim:     'streak',
      priority: 'normal',
      buddy:    '3 days in a row. You are building a German study habit.'
    },
    'milestone_streak_7': {
      title:    '7-Day Streak',
      category: 'consistency',
      levelPage:'cross',
      xp:       30,
      anim:     'streak',
      priority: 'high',
      buddy:    '7-day streak. A full week of German learning every single day. Well done.'
    },
    'milestone_streak_30': {
      title:    '30-Day Streak',
      category: 'consistency',
      levelPage:'cross',
      xp:       100,
      anim:     'streak',
      priority: 'high',
      buddy:    '30-day streak. One month of daily German practice. That is extraordinary dedication.'
    },
    'milestone_streak_100': {
      title:    '100-Day Streak',
      category: 'consistency',
      levelPage:'cross',
      xp:       300,
      anim:     'milestone',
      priority: 'high',
      buddy:    '100-day streak. You have made German a genuine part of your daily life.'
    },
    'milestone_streak_365': {
      title:    '365-Day Streak',
      category: 'consistency',
      levelPage:'cross',
      xp:       1000,
      anim:     'milestone',
      priority: 'high',
      buddy:    '365-day streak. One full year of daily German. You are in a category of your own.'
    }
  };

  /* ─────────────────────────────────────────────────────────────────
     DYNAMIC STAMP DEFINITIONS  (generated at runtime)
  ───────────────────────────────────────────────────────────────── */

  function _placementStampDef(levelId) {
    return {
      title:    'Placement Test — ' + levelId,
      category: 'placement',
      levelPage: levelId,
      xp:       20,
      anim:     'stamp',
      priority: 'high',
      buddy:    'Your Placement Test result has been recorded in your German Passport. Your learning journey begins at ' + levelId + '.'
    };
  }

  function _moduleStampDef(levelId, moduleKey, moduleLabel) {
    var label = moduleLabel || (moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1));
    return {
      title:    levelId + ' ' + label + ' Complete',
      category: 'module',
      levelPage: levelId,
      xp:       30,
      anim:     'stamp',
      priority: 'normal',
      buddy:    'Your ' + levelId + ' ' + label + ' Journey Stamp has been added to your German Passport.'
    };
  }

  function _levelCompleteStampDef(levelId) {
    return {
      title:    levelId + ' Complete',
      category: 'levelComplete',
      levelPage: levelId,
      xp:       150,
      anim:     'level',
      priority: 'high',
      buddy:    'Congratulations! Your ' + levelId + ' Level Completion Journey Stamp has been added to your German Passport. On to the next chapter.'
    };
  }

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

  function _createFreshStore() {
    var now = Date.now();
    return {
      version:       SCHEMA_VERSION,
      created:       now,
      updated:       now,
      stamps:        [],   /* [{ id, title, category, levelPage, xp, date }] */
      officialCerts: [],   /* [{ type, level, date, selfReported, verificationId }] */
      timeline:      []    /* append-only: [{ date, eventType, description, stampId }] */
    };
  }

  function _ensureStore() {
    var store = _load();
    if (store) return store;
    store = _createFreshStore();
    _save(store);
    return store;
  }

  /* ─────────────────────────────────────────────────────────────────
     CORE STAMP AWARD LOGIC
  ───────────────────────────────────────────────────────────────── */

  function _hasStamp(store, stampId) {
    for (var i = 0; i < store.stamps.length; i++) {
      if (store.stamps[i].id === stampId) return true;
    }
    return false;
  }

  function _awardStamp(stampId, stampDef) {
    var store = _ensureStore();

    /* Idempotency — never award the same stamp twice */
    if (_hasStamp(store, stampId)) return;

    var now   = Date.now();
    var stamp = {
      id:        stampId,
      title:     stampDef.title,
      category:  stampDef.category,
      levelPage: stampDef.levelPage,
      xp:        stampDef.xp || 0,
      date:      now
    };

    store.stamps.push(stamp);

    /* Journey Timeline — append-only record */
    store.timeline.push({
      date:        now,
      eventType:   'stampEarned',
      description: stamp.title,
      stampId:     stampId
    });

    _save(store);

    /* Emit: stamp earned */
    _emit('achievement:stampEarned', { stampId: stampId, stamp: stamp });

    /* ── ENHANCEMENT 3: achievement:celebrationQueued ──────────── */
    /* Decoupled celebration bus. Any future system (German Buddy,
       animations, push notifications, Passport page) can subscribe
       to this event without coupling into tgs-achievements.js.    */
    _emit('achievement:celebrationQueued', {
      stampId:      stampId,
      stamp:        stamp,
      message:      stamp.title + ' Journey Stamp earned',
      buddyMessage: stampDef.buddy || ('Your ' + stamp.title + ' Journey Stamp has been added to your German Passport.'),
      animationType: stampDef.anim  || 'stamp',
      priority:     stampDef.priority || 'normal',
      passportPage: stamp.levelPage,
      timestamp:    now
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     TRIGGER CHECKERS
  ───────────────────────────────────────────────────────────────── */

  function _checkLessonMilestones(totalComplete) {
    var thresholds = [1, 10, 25, 50, 100];
    for (var i = 0; i < thresholds.length; i++) {
      if (totalComplete >= thresholds[i]) {
        var id  = thresholds[i] === 1 ? 'milestone_lessons_1' : 'milestone_lessons_' + thresholds[i];
        var def = MILESTONE_STAMPS[id];
        if (def) _awardStamp(id, def);
      }
    }
  }

  function _checkStreakMilestones(current) {
    var thresholds = [3, 7, 30, 100, 365];
    for (var i = 0; i < thresholds.length; i++) {
      if (current >= thresholds[i]) {
        var id  = 'milestone_streak_' + thresholds[i];
        var def = MILESTONE_STAMPS[id];
        if (def) _awardStamp(id, def);
      }
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     EVENT LISTENERS
  ───────────────────────────────────────────────────────────────── */

  function _wireEventListeners() {
    try {
      if (typeof TGS === 'undefined' || !TGS.utils || !TGS.utils.events) return;
      var events = TGS.utils.events;

      /* Lesson complete → check lesson-count milestones */
      events.on('progress:lessonComplete', function () {
        var total = 0;
        try {
          if (typeof TGS_PROGRESS !== 'undefined') {
            total = TGS_PROGRESS.summary().lessonsComplete;
          }
        } catch (e) {}
        _checkLessonMilestones(total);
      });

      /* Module complete → award module stamp */
      events.on('progress:moduleComplete', function (data) {
        if (!data || !data.levelId || !data.moduleKey) return;

        var stampId    = data.levelId + '_module_' + data.moduleKey;
        var moduleLabel = null;

        /* Get human-readable module label from content registry if available */
        try {
          if (typeof TGS_CONTENT !== 'undefined') {
            var level = TGS_CONTENT.getLevel(data.levelId);
            if (level && level.modules[data.moduleKey]) {
              moduleLabel = level.modules[data.moduleKey].label || null;
            }
          }
        } catch (e) {}

        _awardStamp(stampId, _moduleStampDef(data.levelId, data.moduleKey, moduleLabel));
      });

      /* Level complete → award level-complete stamp */
      events.on('progress:levelComplete', function (data) {
        if (!data || !data.levelId) return;
        var stampId = data.levelId + '_levelComplete';
        _awardStamp(stampId, _levelCompleteStampDef(data.levelId));
      });

      /* Streak update → check streak milestones */
      events.on('progress:streakUpdate', function (data) {
        if (data && typeof data.current === 'number') {
          _checkStreakMilestones(data.current);
        }
      });

      /* Profile ready → award placement stamp + academy entry stamp */
      events.on('profile:ready', function (data) {
        /* Academy entry stamp — awarded on first profile:ready */
        _awardStamp('cross_academyEntry', MILESTONE_STAMPS['cross_academyEntry']);

        /* Placement stamp — awarded when a level is on record */
        if (data && data.level) {
          var stampId = data.level + '_placement';
          _awardStamp(stampId, _placementStampDef(data.level));
        }
      });

    } catch (e) {}
  }

  /* ═════════════════════════════════════════════════════════════════
     PUBLIC API
  ═════════════════════════════════════════════════════════════════ */

  var TGS_ACHIEVEMENTS = {

    version: SCHEMA_VERSION,

    /** @returns {boolean} */
    hasEarned: function (stampId) {
      var store = _load();
      if (!store) return false;
      return _hasStamp(store, stampId);
    },

    /** @returns {Array<{ id, title, category, levelPage, xp, date }>} */
    getEarned: function () {
      return (_ensureStore()).stamps.slice(); /* defensive copy */
    },

    /**
     * German Passport page data for a CEFR level.
     * Returns all stamp slots, marking which are earned vs. empty.
     * @param {string} levelId  'A0'|'A1'|...|'C2'
     * @returns {{ levelId, stamps, trialExams, totalSlots, earnedCount, pct, complete }}
     */
    getPassportPage: function (levelId) {
      var store  = _ensureStore();
      var earned = store.stamps;

      /* Get stamp slot definitions from content registry */
      var slots = [];
      try {
        if (typeof TGS_CONTENT !== 'undefined') {
          slots = TGS_CONTENT.getStampSlots(levelId);
        }
      } catch (e) {}

      /* Map slots to earned/empty state */
      var stampsOnPage = [];
      for (var s = 0; s < slots.length; s++) {
        var slot       = slots[s];
        var earnedStamp = null;
        for (var e = 0; e < earned.length; e++) {
          if (earned[e].id === slot.id) { earnedStamp = earned[e]; break; }
        }
        stampsOnPage.push({
          id:       slot.id,
          title:    slot.title,
          category: slot.category,
          earned:   !!earnedStamp,
          date:     earnedStamp ? earnedStamp.date : null,
          xp:       earnedStamp ? earnedStamp.xp   : 0
        });
      }

      /* Trial exams with earned state overlaid */
      var trialExams = [];
      try {
        if (typeof TGS_CONTENT !== 'undefined') {
          var rawExams = TGS_CONTENT.getTrialExams(levelId);
          for (var t = 0; t < rawExams.length; t++) {
            var te         = rawExams[t];
            var earnedTE   = null;
            for (var ee = 0; ee < earned.length; ee++) {
              if (earned[ee].id === te.stampId) { earnedTE = earned[ee]; break; }
            }
            trialExams.push({
              number:    te.number,
              id:        te.id,
              title:     te.title,
              available: te.available,
              stampId:   te.stampId,
              earned:    !!earnedTE,
              date:      earnedTE ? earnedTE.date : null
            });
          }
        }
      } catch (e) {}

      var earnedCount = 0;
      for (var sp = 0; sp < stampsOnPage.length; sp++) {
        if (stampsOnPage[sp].earned) earnedCount++;
      }
      var total = stampsOnPage.length;

      return {
        levelId:     levelId,
        stamps:      stampsOnPage,
        trialExams:  trialExams,
        totalSlots:  total,
        earnedCount: earnedCount,
        pct:         total > 0 ? Math.round((earnedCount / total) * 100) : 0,
        complete:    total > 0 && earnedCount === total
      };
    },

    /** @returns {Array} full Journey Timeline, oldest first */
    getTimeline: function () {
      return (_ensureStore()).timeline.slice();
    },

    /**
     * Record a recognised external certification (self-reported).
     * Uses neutral language — no brand emphasis.
     * verificationId reserved for future document upload.
     * @param {{ type, level?, date? }} cert
     */
    addOfficialCert: function (cert) {
      var store = _ensureStore();
      var now   = Date.now();
      var entry = {
        type:           cert.type,
        level:          cert.level          || null,
        date:           cert.date           || now,
        selfReported:   true,
        verificationId: null  /* future: populated on document upload */
      };

      store.officialCerts.push(entry);

      /* Journey Timeline entry */
      store.timeline.push({
        date:        entry.date,
        eventType:   'certAdded',
        description: entry.type + (entry.level ? ' ' + entry.level : ''),
        stampId:     null
      });

      _save(store);

      _emit('achievement:certAdded', { cert: entry });

      /* Celebration queue — neutral buddy message, no brand name emphasis */
      _emit('achievement:celebrationQueued', {
        stampId:      null,
        stamp:        null,
        message:      'Recognised external certification added',
        buddyMessage: 'Congratulations. Your recognised external German language certification has been recorded in your German Passport.',
        animationType:'cert',
        priority:     'high',
        passportPage: 'recognised-certifications',
        timestamp:    now
      });
    },

    /** @returns {Array<{ type, level, date, selfReported, verificationId }>} */
    getOfficialCerts: function () {
      return (_ensureStore()).officialCerts.slice();
    },

    /** Total XP from all earned stamps */
    getXPTotal: function () {
      var stamps = (_ensureStore()).stamps;
      var total  = 0;
      for (var i = 0; i < stamps.length; i++) { total += stamps[i].xp || 0; }
      return total;
    },

    summary: function () {
      var store = _ensureStore();
      return {
        schemaVersion:   store.version,
        created:         store.created,
        updated:         store.updated,
        stampsEarned:    store.stamps.length,
        officialCerts:   store.officialCerts.length,
        timelineEntries: store.timeline.length,
        totalXP:         TGS_ACHIEVEMENTS.getXPTotal()
      };
    },

    export: function () { return JSON.stringify(_ensureStore(), null, 2); }
  };

  /* ─────────────────────────────────────────────────────────────────
     BOOT
  ───────────────────────────────────────────────────────────────── */
  _ensureStore();
  _wireEventListeners();

  global.TGS_ACHIEVEMENTS = TGS_ACHIEVEMENTS;

}(window));
