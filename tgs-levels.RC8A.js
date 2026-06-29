/*
 * TheGermanStefan Academy
 * Release:   RC8A
 * Generated: 2026-06-29 17:42
 * Status:    RELEASE CANDIDATE
 * File:      tgs-levels.js
 *
 * RC CHANGELOG:
 *   RC4 — A2 Vocab/Reading/Speaking → soon() (files not yet on GitHub)
 *   RC5 — A0 all 21 lessons → soon() (individual files not yet built)
 *   RC6-1 — A0 legacyHub property added
 *   RC8A — Release artifact regenerated with verification marker
 */

var TGS_RELEASE = "RC8A-LEVELS";

/**
 * TheGermanStefan Academy — Level Configuration Database
 * tgs-levels.js — v1.0 | Sprint-002
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Single source of truth for all Academy level content.
 *
 * ADDING A NEW LEVEL:  Add one entry to the levels object below.
 * ADDING A NEW MODULE: Add one key to a level's modules object.
 * EDITING LESSON DATA: Change it here — the Dashboard Framework reads this.
 *
 * Lesson status values:
 *   'available'    — file exists in repo, link is live
 *   'coming-soon'  — planned but not yet built
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function (global) {
  'use strict';

  /* ── HELPERS ─────────────────────────────────────────────────────── */

  /** Build a lesson entry. Defaults status to 'available'. */
  function lesson(id, title, file, status) {
    return { id: id, title: title, file: file || null, status: status || 'available' };
  }

  /** Build a coming-soon placeholder lesson. */
  function soon(id, title) {
    return { id: id, title: title, file: null, status: 'coming-soon' };
  }

  /* ══════════════════════════════════════════════════════════════════
     LEVEL DATABASE
  ══════════════════════════════════════════════════════════════════ */

  var LEVELS = {

    /* ── A0 — Absolute Beginner ─────────────────────────────────── */
    A0: {
      id:          'A0',
      name:        'A0 Absolute Beginner',
      emoji:       '🌱',
      color:       '#00838f',       /* teal */
      colorLight:  '#e0f7fa',
      description: 'Your very first steps in German. Learn the alphabet, numbers, colours, essential greetings and simple phrases to introduce yourself and navigate everyday situations.',
      outcomes: [
        'Greet people and introduce yourself in German',
        'Count to 100 and use basic numbers in context',
        'Understand and use the German alphabet and pronunciation rules'
      ],
      studyTime:   '30–40 hours',
      examName:    null,
      vocabTarget: 300,
      free:        true,
      nextLevel:   'A1',
      prevLevel:   null,
      /* RC6: A0 individual lesson files not yet built — content lives in the legacy hub */
      legacyHub: {
        url:   'TheGermanStefan_A0_Beginner_Hub.html',
        label: 'Open A0 Starter Course',
        desc:  'Full A0 course — grammar, vocabulary, reading and speaking exercises. Available now in the interactive A0 Hub.'
      },
      modules: {
        grammar: {
          label:   'Grammar',
          icon:    '📚',
          lessons: [
            /* RC5: individual A0 lesson files not yet uploaded — all coming soon */
            soon('A0_Grammar_01', 'Das Alphabet'),
            soon('A0_Grammar_02', 'Zahlen 1–100'),
            soon('A0_Grammar_03', 'Ich bin / Du bist'),
            soon('A0_Grammar_04', 'Artikel: der, die, das'),
            soon('A0_Grammar_05', 'Farben & Formen'),
            soon('A0_Grammar_06', 'Fragewörter'),
            soon('A0_Grammar_07', 'Ja / Nein / Nicht'),
            soon('A0_Grammar_08', 'Possessivpronomen')
          ]
        },
        vocabulary: {
          label:   'Vocabulary',
          icon:    '🗂️',
          lessons: [
            /* RC5: files not yet on GitHub */
            soon('A0_Vocab_01', 'Begrüßungen'),
            soon('A0_Vocab_02', 'Familie'),
            soon('A0_Vocab_03', 'Essen & Trinken'),
            soon('A0_Vocab_04', 'Tage & Monate'),
            soon('A0_Vocab_05', 'Länder & Sprachen')
          ]
        },
        reading: {
          label:   'Reading',
          icon:    '📖',
          lessons: [
            /* RC5: files not yet on GitHub */
            soon('A0_Reading_01', 'Hallo! Ich heiße Stefan.'),
            soon('A0_Reading_02', 'Meine Familie'),
            soon('A0_Reading_03', 'Im Café')
          ]
        },
        speaking: {
          label:   'Speaking',
          icon:    '🗣️',
          lessons: [
            /* RC5: files not yet on GitHub */
            soon('A0_Sprechen_01', 'Sich vorstellen'),
            soon('A0_Sprechen_02', 'Über die Familie sprechen'),
            soon('A0_Sprechen_03', 'Bestellen im Café'),
            soon('A0_Sprechen_04', 'Zahlen im Alltag'),
            soon('A0_Sprechen_05', 'Auf Wiedersehen!')
          ]
        }
      }
    },

    /* ── A1 — Elementary ────────────────────────────────────────── */
    A1: {
      id:          'A1',
      name:        'A1 Elementary',
      emoji:       '⭐',
      color:       '#1464b4',       /* brand blue */
      colorLight:  '#e3f2fd',
      description: 'Build your German foundation. Master present tense, basic cases, separable verbs and the vocabulary you need for everyday life — family, food, work, shopping and getting around.',
      outcomes: [
        'Form correct sentences in the present tense using regular and irregular verbs',
        'Use the nominative and accusative cases with the correct articles',
        'Hold simple conversations about yourself, your family and daily routines'
      ],
      studyTime:   '60–80 hours',
      examName:    'Goethe A1 / Start Deutsch 1',
      vocabTarget: 800,
      free:        false,
      nextLevel:   'A2',
      prevLevel:   'A0',
      modules: {
        grammar: {
          label:   'Grammar',
          icon:    '📚',
          lessons: [
            lesson('A1_Grammar_01', 'Personal Pronouns',         'A1_Grammar_01_Personalpronomen.html'),
            lesson('A1_Grammar_02', 'sein & haben',              'A1_Grammar_02_Sein_Haben.html'),
            lesson('A1_Grammar_03', 'Present Tense',             'A1_Grammar_03_Praesens.html'),
            lesson('A1_Grammar_04', 'Articles: der / die / das', 'A1_Grammar_04_Artikel.html'),
            lesson('A1_Grammar_05', 'Negation: nicht & kein',    'A1_Grammar_05_Negation.html'),
            lesson('A1_Grammar_06', 'Numbers',                   'A1_Grammar_06_Zahlen.html'),
            lesson('A1_Grammar_07', 'Word Order (Wortstellung)', 'A1_Grammar_07_Wortstellung.html'),
            lesson('A1_Grammar_08', 'Separable Verbs',           'A1_Grammar_08_Trennbare_Verben.html'),
            lesson('A1_Grammar_09', 'Adjectives (intro)',        'A1_Grammar_09_Adjektive.html'),
            lesson('A1_Grammar_10', 'Accusative Case',           'A1_Grammar_10_Akkusativ.html'),
            lesson('A1_Grammar_SZ', 'Sentence Structure Deep-Dive', 'A1_Grammar_Satzstellung.html')
          ]
        },
        vocabulary: {
          label:   'Vocabulary',
          icon:    '🗂️',
          lessons: [
            lesson('A1_Vocab_01', 'Home & Living (Wohnen)',       'A1_Vocab_01_Wohnen.html'),
            lesson('A1_Vocab_02', 'Food & Drink (Essen)',         'A1_Vocab_02_Essen.html'),
            lesson('A1_Vocab_03', 'Clothing (Kleidung)',          'A1_Vocab_03_Kleidung.html'),
            lesson('A1_Vocab_04', 'City & Navigation (Stadt)',    'A1_Vocab_04_Stadt.html'),
            lesson('A1_Vocab_05', 'Work & Professions (Arbeit)',  'A1_Vocab_05_Arbeit.html')
          ]
        },
        reading: {
          label:   'Reading',
          icon:    '📖',
          lessons: [
            lesson('A1_Reading_01', 'My Home (Mein Zuhause)',        'A1_Reading_01_Mein_Zuhause.html'),
            lesson('A1_Reading_02', 'At the Supermarket',            'A1_Reading_02_Im_Supermarkt.html'),
            lesson('A1_Reading_03', 'A Journey (Eine Reise)',         'A1_Reading_03_Eine_Reise.html'),
            lesson('A1_Reading_04', 'At the Doctor (Beim Arzt)',      'A1_Reading_04_Beim_Arzt.html'),
            lesson('A1_Reading_05', 'My Daily Routine (Mein Alltag)', 'A1_Reading_05_Mein_Alltag.html')
          ]
        },
        speaking: {
          label:   'Speaking',
          icon:    '🗣️',
          lessons: [
            lesson('A1_Sprechen_01', 'Introducing Yourself',       'A1_Sprechen_01_Vorstellen.html'),
            lesson('A1_Sprechen_02', 'Talking about Family',       'A1_Sprechen_02_Familie.html'),
            lesson('A1_Sprechen_03', 'Where You Live',             'A1_Sprechen_03_Wohnen.html'),
            lesson('A1_Sprechen_04', 'Shopping',                   'A1_Sprechen_04_Einkaufen.html'),
            lesson('A1_Sprechen_05', 'Daily Routine',              'A1_Sprechen_05_Tagesablauf.html'),
            lesson('A1_Sprechen_06', 'Hobbies & Free Time',        'A1_Sprechen_06_Hobbys.html'),
            lesson('A1_Sprechen_07', 'At the Restaurant',          'A1_Sprechen_07_Restaurant.html'),
            lesson('A1_Sprechen_08', 'Giving Directions',          'A1_Sprechen_08_Weg.html'),
            lesson('A1_Sprechen_09', 'Making Appointments',        'A1_Sprechen_09_Termine.html'),
            lesson('A1_Sprechen_10', 'Travel & Transport',         'A1_Sprechen_10_Reisen.html')
          ]
        }
      }
    },

    /* ── A2 — Pre-Intermediate ──────────────────────────────────── */
    A2: {
      id:          'A2',
      name:        'A2 Pre-Intermediate',
      emoji:       '🌟',
      color:       '#2e7d32',       /* green */
      colorLight:  '#e8f5e9',
      description: 'Expand your German fluency. Master the Perfekt, dative case, modal verbs and subordinate clauses. Communicate more naturally in everyday situations.',
      outcomes: [
        'Use the Perfekt and Präteritum to talk about past events',
        'Apply the dative case and two-way prepositions correctly',
        'Form subordinate clauses with dass, weil, ob and wenn'
      ],
      studyTime:   '80–100 hours',
      examName:    'Goethe A2 / Start Deutsch 2',
      vocabTarget: 1500,
      free:        false,
      nextLevel:   'B1',
      prevLevel:   'A1',
      modules: {
        grammar: {
          label:   'Grammar',
          icon:    '📚',
          lessons: [
            lesson('A2_Grammar_01', 'Perfekt (Conversational Past)',     'A2_Grammar_01_Perfekt.html'),
            lesson('A2_Grammar_02', 'Modal Verbs',                       'A2_Grammar_02_Modalverben.html'),
            lesson('A2_Grammar_03', 'Dative Case',                       'A2_Grammar_03_Dativ.html'),
            lesson('A2_Grammar_04', 'Two-Way Prepositions',              'A2_Grammar_04_Wechselpraepositionen.html'),
            lesson('A2_Grammar_05', 'Comparative & Superlative',         'A2_Grammar_05_Komparativ.html'),
            lesson('A2_Grammar_06', 'Präteritum (Written Past)',         'A2_Grammar_06_Praeteritum.html'),
            lesson('A2_Grammar_07', 'Subordinate Clauses',               'A2_Grammar_07_Nebensaetze.html'),
            lesson('A2_Grammar_08', 'Relative Clauses (intro)',           'A2_Grammar_08_Relativsaetze.html'),
            lesson('A2_Grammar_09', 'Future Tense: Futur I',             'A2_Grammar_09_Futur1.html'),
            lesson('A2_Grammar_10', 'Konjunktiv II (intro)',             'A2_Grammar_10_Konjunktiv2.html'),
            lesson('A2_Grammar_SZ', 'Sentence Structure: Advanced',      'A2_Grammar_Satzstellung.html')
          ]
        },
        vocabulary: {
          label:   'Vocabulary',
          icon:    '🗂️',
          lessons: [
            /* RC4: files not yet on GitHub — marked coming-soon until uploaded */
            soon('A2_Vocab_01', 'Health & Body (Gesundheit)'),
            soon('A2_Vocab_02', 'Travel & Transport (Reisen)'),
            soon('A2_Vocab_03', 'Weather & Seasons (Wetter)'),
            soon('A2_Vocab_04', 'Technology & Media (Medien)'),
            soon('A2_Vocab_05', 'School & Education (Schule)')
          ]
        },
        reading: {
          label:   'Reading',
          icon:    '📖',
          lessons: [
            /* RC4: files not yet on GitHub — marked coming-soon until uploaded */
            soon('A2_Reading_01', 'A Day in Berlin'),
            soon('A2_Reading_02', 'At the Hotel'),
            soon('A2_Reading_03', 'German School Life'),
            soon('A2_Reading_04', 'Planning a Holiday'),
            soon('A2_Reading_05', 'Health & the Doctor')
          ]
        },
        speaking: {
          label:   'Speaking',
          icon:    '🗣️',
          lessons: [
            /* RC4: files not yet on GitHub — marked coming-soon until uploaded */
            soon('A2_Sprechen_01', 'Talking about the Past'),
            soon('A2_Sprechen_02', 'Describing Your Home'),
            soon('A2_Sprechen_03', 'At the Doctor'),
            soon('A2_Sprechen_04', 'Planning a Trip'),
            soon('A2_Sprechen_05', 'Expressing Preferences'),
            soon('A2_Sprechen_06', 'Asking for Help'),
            soon('A2_Sprechen_07', 'On the Phone'),
            soon('A2_Sprechen_08', 'Describing People'),
            soon('A2_Sprechen_09', 'Talking about Future Plans'),
            soon('A2_Sprechen_10', 'Talking about Weather')
          ]
        }
      }
    },

    /* ── B1 — Intermediate ──────────────────────────────────────── */
    B1: {
      id:          'B1',
      name:        'B1 Intermediate',
      emoji:       '🔥',
      color:       '#e65100',       /* deep orange */
      colorLight:  '#fff3e0',
      description: 'Achieve true intermediate fluency. Master the passive voice, Konjunktiv II, relative clauses and complex sentence structures. Express opinions, discuss problems and write formal texts.',
      outcomes: [
        'Use the passive voice (Aktiv vs. Passiv) in written and spoken German',
        'Express hypothetical situations and politeness using Konjunktiv II',
        'Write structured texts: formal letters, emails and short essays'
      ],
      studyTime:   '120–150 hours',
      examName:    'Goethe B1 / ÖSD B1 / Telc B1',
      vocabTarget: 2500,
      free:        false,
      nextLevel:   'B2',
      prevLevel:   'A2',
      modules: {
        grammar: {
          label:   'Grammar',
          icon:    '📚',
          lessons: [
            lesson('B1_Grammar_01', 'Passive Voice (Vorgangspassiv)',    'B1_Grammar_01_Passiv.html'),
            lesson('B1_Grammar_02', 'Konjunktiv II: würde, wäre, hätte', 'B1_Grammar_02_Konjunktiv2.html'),
            lesson('B1_Grammar_03', 'Infinitive Constructions',          'B1_Grammar_03_Infinitivkonstruktionen.html'),
            lesson('B1_Grammar_04', 'Genitive Case',                     'B1_Grammar_04_Genitiv.html'),
            lesson('B1_Grammar_05', 'Temporal Clauses',                  'B1_Grammar_05_Temporale_Nebensaetze.html'),
            lesson('B1_Grammar_06', 'Connectors & Conjunctions',         'B1_Grammar_06_Konnektoren.html'),
            lesson('B1_Grammar_07', 'Participles as Adjectives',         'B1_Grammar_07_Partizip.html'),
            lesson('B1_Grammar_08', 'Indirect Speech (Indirekte Rede)',  'B1_Grammar_08_Indirekte_Rede.html'),
            lesson('B1_Grammar_09', 'Passive + Modal Verbs',             'B1_Grammar_09_Passiv_Modal.html'),
            lesson('B1_Grammar_10', 'Relative Clauses + Prepositions',   'B1_Grammar_10_Relativsaetze_Praep.html'),
            lesson('B1_Grammar_SZ', 'Complex Sentence Structure',        'B1_Grammar_Satzstellung.html')
          ]
        },
        vocabulary: {
          label:   'Vocabulary',
          icon:    '🗂️',
          lessons: [
            lesson('B1_Vocab_01', 'Environment (Umwelt)',                'B1_Vocab_01_Umwelt.html'),
            lesson('B1_Vocab_02', 'Health & Body (Gesundheit)',          'B1_Vocab_02_Gesundheit.html'),
            lesson('B1_Vocab_03', 'Career & Work (Karriere)',            'B1_Vocab_03_Karriere.html'),
            lesson('B1_Vocab_04', 'Media & Technology (Medien)',         'B1_Vocab_04_Medien.html'),
            lesson('B1_Vocab_05', 'Society & Politics (Gesellschaft)',   'B1_Vocab_05_Gesellschaft.html')
          ]
        },
        reading: {
          label:   'Reading',
          icon:    '📖',
          lessons: [
            lesson('B1_Reading_01', 'Environment & Climate',             'B1_Reading_01_Umweltschutz.html'),
            lesson('B1_Reading_02', 'The Working World',                 'B1_Reading_02_Arbeitswelt.html'),
            lesson('B1_Reading_03', 'Health & Wellbeing',                'B1_Reading_03_Gesundheit.html'),
            lesson('B1_Reading_04', 'Travel & Culture',                  'B1_Reading_04_Reisen.html'),
            lesson('B1_Reading_05', 'Technology & Society',              'B1_Reading_05_Technologie.html')
          ]
        },
        speaking: {
          label:   'Speaking',
          icon:    '🗣️',
          lessons: [
            lesson('B1_Sprechen_01', 'Expressing Opinions',              'B1_Sprechen_01_Meinung.html'),
            lesson('B1_Sprechen_02', 'Pros & Cons (Vor- und Nachteile)', 'B1_Sprechen_02_VorNachteile.html'),
            lesson('B1_Sprechen_03', 'Describing Problems',              'B1_Sprechen_03_Probleme.html'),
            lesson('B1_Sprechen_04', 'Giving Advice',                    'B1_Sprechen_04_Rat.html'),
            lesson('B1_Sprechen_05', 'Talking about the Past',           'B1_Sprechen_05_Vergangenheit.html'),
            lesson('B1_Sprechen_06', 'Future Plans',                     'B1_Sprechen_06_Zukunft.html'),
            lesson('B1_Sprechen_07', 'Hypothetical Situations',          'B1_Sprechen_07_Hypothetisch.html'),
            lesson('B1_Sprechen_08', 'Complaints & Requests',            'B1_Sprechen_08_Reklamation.html'),
            lesson('B1_Sprechen_09', 'Joining a Discussion',             'B1_Sprechen_09_Diskussion.html'),
            lesson('B1_Sprechen_10', 'Short Presentations',              'B1_Sprechen_10_Praesentation.html')
          ]
        }
      }
    },

    /* ── B2 — Upper-Intermediate ────────────────────────────────── */
    B2: {
      id:          'B2',
      name:        'B2 Upper-Intermediate',
      emoji:       '💎',
      color:       '#6a1b9a',       /* purple */
      colorLight:  '#f3e5f5',
      description: 'Refine your German to near-native fluency. Master the statal passive, Konjunktiv I for reported speech, participial phrases and nuanced connectors.',
      outcomes: [
        'Distinguish and use both the Vorgangspassiv and Zustandspassiv correctly',
        'Report speech accurately using Konjunktiv I',
        'Write sophisticated analytical texts with complex clause structures'
      ],
      studyTime:   '150–200 hours',
      examName:    'Goethe B2 / telc Deutsch B2',
      vocabTarget: 4000,
      free:        false,
      nextLevel:   'C1',
      prevLevel:   'B1',
      modules: {
        grammar: {
          label:   'Grammar',
          icon:    '📚',
          lessons: [
            lesson('B2_Grammar_01', 'Statal Passive (Zustandspassiv)',   'B2_Grammar_01_Zustandspassiv.html'),
            lesson('B2_Grammar_02', 'Konjunktiv I: Reported Speech',     'B2_Grammar_02_Konjunktiv1.html'),
            lesson('B2_Grammar_03', 'Participial Phrases',               'B2_Grammar_03_Partizipialkonstruktionen.html'),
            lesson('B2_Grammar_04', 'Concessive Clauses (obwohl/trotz)', 'B2_Grammar_04_Konzessiv.html'),
            lesson('B2_Grammar_05', 'Causal & Consecutive Clauses',      'B2_Grammar_05_Kausal_Konsekutiv.html'),
            /* RC4: 06 and 07 confirmed live on GitHub */
            lesson('B2_Grammar_06', 'Nominalisierung',                   'B2_Grammar_06_Nominalisierung.html'),
            lesson('B2_Grammar_07', 'Modalpartikeln',                    'B2_Grammar_07_Modalpartikeln.html'),
            soon('B2_Grammar_08',   'Irrealis & Conditional Sentences'),
            soon('B2_Grammar_09',   'Register: Formal vs. Colloquial'),
            soon('B2_Grammar_10',   'Advanced Word Formation')
          ]
        },
        vocabulary: {
          label:   'Vocabulary',
          icon:    '🗂️',
          lessons: [
            soon('B2_Vocab_01', 'Economy & Finance'),
            soon('B2_Vocab_02', 'Law & Justice'),
            soon('B2_Vocab_03', 'Science & Research'),
            soon('B2_Vocab_04', 'Philosophy & Ethics'),
            soon('B2_Vocab_05', 'Literature & Linguistics')
          ]
        },
        reading: {
          label:   'Reading',
          icon:    '📖',
          lessons: [
            soon('B2_Reading_01', 'Feuilleton — Cultural Commentary'),
            soon('B2_Reading_02', 'Economic Analysis'),
            soon('B2_Reading_03', 'Scientific Journalism'),
            soon('B2_Reading_04', 'Political Debate'),
            soon('B2_Reading_05', 'Literary Excerpt: German Classic')
          ]
        },
        speaking: {
          label:   'Speaking',
          icon:    '🗣️',
          lessons: [
            soon('B2_Sprechen_01', 'Argumentation & Rhetoric'),
            soon('B2_Sprechen_02', 'Formal Presentations'),
            soon('B2_Sprechen_03', 'Debate & Counter-Arguments'),
            soon('B2_Sprechen_04', 'Job Interview German'),
            soon('B2_Sprechen_05', 'Nuanced Opinion & Critique')
          ]
        }
      }
    },

    /* ── C1 — Advanced ──────────────────────────────────────────── */
    C1: {
      id:          'C1',
      name:        'C1 Advanced',
      emoji:       '🏆',
      color:       '#c62828',       /* red */
      colorLight:  '#ffebee',
      description: 'Achieve C1 proficiency — the level of a highly educated German speaker. Complex grammar, idiomatic language, academic writing and near-native comprehension.',
      outcomes: [
        'Understand complex written and spoken German across all registers',
        'Use idiomatic expressions, collocations and nuanced vocabulary naturally',
        'Produce well-structured academic and professional texts in German'
      ],
      studyTime:   '200–250 hours',
      examName:    'Goethe C1 / telc C1 / DSH',
      vocabTarget: 6000,
      free:        false,
      nextLevel:   'C2',
      prevLevel:   'B2',
      modules: {
        grammar: {
          label:   'Grammar',
          icon:    '📚',
          lessons: [
            soon('C1_Grammar_01', 'Advanced Konjunktiv II Usage'),
            soon('C1_Grammar_02', 'Nominalisierung (Noun Phrases)'),
            soon('C1_Grammar_03', 'Extended Participle Constructions'),
            soon('C1_Grammar_04', 'Academic Sentence Patterns'),
            soon('C1_Grammar_05', 'Collocations & Fixed Phrases')
          ]
        },
        vocabulary: {
          label:   'Vocabulary',
          icon:    '🗂️',
          lessons: [
            soon('C1_Vocab_01', 'Idioms & Fixed Expressions'),
            soon('C1_Vocab_02', 'Academic & Technical Vocabulary'),
            soon('C1_Vocab_03', 'Literary & Formal Register'),
            soon('C1_Vocab_04', 'Colloquialisms & Regional Dialects'),
            soon('C1_Vocab_05', 'False Friends & Pitfalls')
          ]
        },
        reading: {
          label:   'Reading',
          icon:    '📖',
          lessons: [
            soon('C1_Reading_01', 'Contemporary German Literature'),
            soon('C1_Reading_02', 'Political Philosophy'),
            soon('C1_Reading_03', 'Scientific Papers'),
            soon('C1_Reading_04', 'Legal & Official Documents'),
            soon('C1_Reading_05', 'Satirical & Humorous Texts')
          ]
        },
        speaking: {
          label:   'Speaking',
          icon:    '🗣️',
          lessons: [
            soon('C1_Sprechen_01', 'Academic Discussion'),
            soon('C1_Sprechen_02', 'Nuanced Argumentation'),
            soon('C1_Sprechen_03', 'Negotiation & Mediation'),
            soon('C1_Sprechen_04', 'Storytelling & Narrative'),
            soon('C1_Sprechen_05', 'C1 Exam Preparation')
          ]
        }
      }
    },

    /* ── C2 — Mastery ───────────────────────────────────────────── */
    C2: {
      id:          'C2',
      name:        'C2 Mastery',
      emoji:       '👑',
      color:       '#f9a825',       /* amber */
      colorLight:  '#fff8e1',
      description: 'German mastery — the pinnacle of language learning. Perfect your style, voice and cultural fluency. Understand every register, dialect and nuance of the German language.',
      outcomes: [
        'Communicate spontaneously and fluently without effort in any situation',
        'Understand virtually everything heard or read with ease',
        'Express yourself precisely in complex situations with full cultural competence'
      ],
      studyTime:   '200+ hours',
      examName:    'Goethe C2: Großes Deutsches Sprachdiplom',
      vocabTarget: 8000,
      free:        false,
      nextLevel:   null,
      prevLevel:   'C1',
      modules: {
        grammar: {
          label:   'Grammar & Style',
          icon:    '📚',
          lessons: [
            soon('C2_Grammar_01', 'Perfecting Style & Register'),
            soon('C2_Grammar_02', 'Rhetorical Devices in German'),
            soon('C2_Grammar_03', 'Advanced Ellipsis & Cohesion'),
            soon('C2_Grammar_04', 'Dialect Awareness'),
            soon('C2_Grammar_05', 'Error-Free Advanced Writing')
          ]
        },
        vocabulary: {
          label:   'Vocabulary',
          icon:    '🗂️',
          lessons: [
            soon('C2_Vocab_01', 'German Proverbs & Sayings'),
            soon('C2_Vocab_02', 'Regional Expressions'),
            soon('C2_Vocab_03', 'Historical & Archaic Language'),
            soon('C2_Vocab_04', 'Modern German Slang & Youth Language'),
            soon('C2_Vocab_05', 'Cross-Cultural Communication')
          ]
        },
        reading: {
          label:   'Reading',
          icon:    '📖',
          lessons: [
            soon('C2_Reading_01', 'Goethe — Faust (Excerpts)'),
            soon('C2_Reading_02', 'Kafka — Die Verwandlung'),
            soon('C2_Reading_03', 'Brecht — Mutter Courage'),
            soon('C2_Reading_04', 'Contemporary German Literature'),
            soon('C2_Reading_05', 'Film, Theatre & Art Criticism')
          ]
        },
        speaking: {
          label:   'Speaking',
          icon:    '🗣️',
          lessons: [
            soon('C2_Sprechen_01', 'Spontaneous Discussion'),
            soon('C2_Sprechen_02', 'Mastery of Irony & Humour'),
            soon('C2_Sprechen_03', 'Public Speaking'),
            soon('C2_Sprechen_04', 'Intercultural Competence'),
            soon('C2_Sprechen_05', 'C2 Diploma Preparation')
          ]
        }
      }
    }

  }; /* end LEVELS */

  /* ══════════════════════════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════════════════════════ */

  var LEVEL_ORDER = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  var TGS_LEVELS = {

    version: '1.0.0',
    sprint:  'Sprint-002',

    /** Return a level object by ID, or null. */
    get: function (id) {
      return LEVELS[id] || null;
    },

    /** Return ordered array of all levels. */
    getAll: function () {
      return LEVEL_ORDER.map(function (id) { return LEVELS[id]; });
    },

    /** Return the next level object, or null. */
    getNext: function (id) {
      var i = LEVEL_ORDER.indexOf(id);
      return (i >= 0 && i < LEVEL_ORDER.length - 1) ? LEVELS[LEVEL_ORDER[i + 1]] : null;
    },

    /** Return the previous level object, or null. */
    getPrev: function (id) {
      var i = LEVEL_ORDER.indexOf(id);
      return (i > 0) ? LEVELS[LEVEL_ORDER[i - 1]] : null;
    },

    /**
     * Return progress summary for a given level.
     * Requires TGS (tgs-core.js) to be loaded.
     *
     * @param {string} id — level ID e.g. 'A1'
     * @returns {{ total, done, pct, nextLesson: {lesson, moduleKey, module} | null }}
     */
    computeProgress: function (id) {
      var level = LEVELS[id];
      if (!level) return { total: 0, done: 0, pct: 0, nextLesson: null };

      var total = 0;
      var done  = 0;
      var nextLesson = null;

      var moduleKeys = Object.keys(level.modules);
      for (var m = 0; m < moduleKeys.length; m++) {
        var key    = moduleKeys[m];
        var mod    = level.modules[key];
        var lessons = mod.lessons || [];

        for (var l = 0; l < lessons.length; l++) {
          var lsn = lessons[l];
          if (lsn.status === 'coming-soon') continue;
          total++;
          var isComplete = (typeof TGS !== 'undefined')
            ? TGS.progress.isComplete(lsn.id)
            : false;
          if (isComplete) {
            done++;
          } else if (!nextLesson) {
            nextLesson = { lesson: lsn, moduleKey: key, module: mod };
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

    /**
     * Return per-module progress for a level.
     * @returns {Object} keyed by moduleKey: { total, done, pct }
     */
    computeModuleProgress: function (id) {
      var level = LEVELS[id];
      if (!level) return {};

      var result = {};
      var moduleKeys = Object.keys(level.modules);

      for (var m = 0; m < moduleKeys.length; m++) {
        var key     = moduleKeys[m];
        var lessons = level.modules[key].lessons || [];
        var t = 0, d = 0;

        for (var l = 0; l < lessons.length; l++) {
          var lsn = lessons[l];
          if (lsn.status === 'coming-soon') continue;
          t++;
          if (typeof TGS !== 'undefined' && TGS.progress.isComplete(lsn.id)) d++;
        }

        result[key] = { total: t, done: d, pct: t > 0 ? Math.round((d / t) * 100) : 0 };
      }

      return result;
    }

  };

  global.TGS_LEVELS = TGS_LEVELS;

}(window));
