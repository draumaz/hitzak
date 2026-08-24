const fs = require('fs');

const cleanDbContent = `import * as schema from "./schema";
import {
  SEED_DATA,
  type SeedData,
  type SeedLesson,
  type SeedChallenge,
  type SeedUnit,
  type SeedRing,
} from "./seed-data";

/**
 * Universal Database & State Provider for Hitzak
 */
class StateManager {
  private data: SeedData;
  private challengeProgressMap: Map<string, boolean> = new Map();
  private completedLessonIds: Set<number> = new Set();

  constructor() {
    this.data = JSON.parse(JSON.stringify(SEED_DATA));
  }

  // --- COURSES ---
  getCourses() {
    return this.data.courses.map((course) => {
      const source = this.data.languages.find((l) => l.id === course.sourceLanguageId);
      const target = this.data.languages.find((l) => l.id === course.targetLanguageId);
      return {
        ...course,
        sourceLanguage: source,
        targetLanguage: target,
      };
    });
  }

  getCourseById(courseId: number) {
    const course = this.data.courses.find((c) => c.id === courseId);
    if (!course) return null;
    const source = this.data.languages.find((l) => l.id === course.sourceLanguageId);
    const target = this.data.languages.find((l) => l.id === course.targetLanguageId);
    return {
      ...course,
      sourceLanguage: source,
      targetLanguage: target,
    };
  }

  // --- SECTIONS ---
  getSections(courseId = 1, userId = this.data.initialUser.userId) {
    const activeCourse = this.data.courses.find((c) => c.id === courseId);
    if (!activeCourse) return [];

    return this.data.sections
      .filter((s) => s.courseId === courseId)
      .sort((a, b) => a.order - b.order)
      .map((section) => {
        const sectionUnits = this.data.units.filter((u) => u.sectionId === section.id);
        const totalUnits = sectionUnits.length;

        // Compute total standard rings and completed levels inside section
        const unitIds = sectionUnits.map((u) => u.id);
        const sectionRings = this.data.rings.filter(
          (r) => unitIds.includes(r.unitId) && !r.isUnitReview
        );

        let totalCompletedLevels = 0;
        let totalLevels = 0;

        sectionRings.forEach((ring) => {
          const ringLessons = this.data.lessons.filter((l) => l.ringId === ring.id);
          const completedCount = ringLessons.filter((l) =>
            this.completedLessonIds.has(l.id)
          ).length;

          totalCompletedLevels += completedCount;
          totalLevels += ring.totalLevels || ringLessons.length || 5;
        });

        const progressPercent =
          totalLevels > 0 ? Math.round((totalCompletedLevels / totalLevels) * 100) : 0;

        return {
          ...section,
          totalUnits,
          progressPercent,
        };
      });
  }

  // --- UNITS & RINGS ---
  getUnitsWithRings(sectionId?: number, courseId = 1, userId = this.data.initialUser.userId) {
    let courseUnits = this.data.units.filter((u) => u.courseId === courseId);
    if (sectionId) {
      courseUnits = courseUnits.filter((u) => u.sectionId === sectionId);
    }

    return courseUnits
      .sort((a, b) => a.order - b.order)
      .map((unit, unitIdx) => {
        const unitRings = this.data.rings
          .filter((r) => r.unitId === unit.id)
          .sort((a, b) => a.order - b.order);

        const ringsWithState = unitRings.map((ring) => {
          const ringLessons = this.data.lessons
            .filter((l) => l.ringId === ring.id)
            .sort((a, b) => a.level - b.level);

          const completedLevels = ringLessons.filter((l) =>
            this.completedLessonIds.has(l.id)
          ).length;

          const totalLevels = ring.totalLevels || ringLessons.length || 1;
          const isMastered = completedLevels >= totalLevels;

          const nextLesson =
            ringLessons.find((l) => !this.completedLessonIds.has(l.id)) || ringLessons[0];

          return {
            ...ring,
            totalLevels,
            completedLevels,
            isMastered,
            lessons: ringLessons.map((l) => ({
              ...l,
              isCompleted: this.completedLessonIds.has(l.id),
            })),
            nextLessonId: nextLesson?.id || 1,
            nextLessonLevel: nextLesson?.level || 1,
          };
        });

        const nonReviewRings = ringsWithState.filter((r) => !r.isUnitReview);
        const allPreRingsStarted =
          nonReviewRings.length === 0 ||
          nonReviewRings.every((r) => r.completedLevels >= 1);

        const reviewRing = ringsWithState.find((r) => r.isUnitReview);
        const isUnitCompleted = reviewRing ? reviewRing.isMastered : false;

        return {
          ...unit,
          isCompleted: isUnitCompleted,
          isReviewUnlocked: allPreRingsStarted,
          rings: ringsWithState,
          lessons: this.data.lessons
            .filter((l) => l.unitId === unit.id)
            .map((l) => ({
              ...l,
              isCompleted: this.completedLessonIds.has(l.id),
            })),
        };
      });
  }

  getUnitsWithLessons(courseId = 1, userId = this.data.initialUser.userId) {
    return this.getUnitsWithRings(undefined, courseId, userId);
  }

  // --- LESSON DETAILS & CHALLENGES ---
  getLessonWithChallenges(lessonId: number, userId = this.data.initialUser.userId) {
    const lesson = this.data.lessons.find((l) => l.id === lessonId);
    if (!lesson) return null;

    const unit = this.data.units.find((u) => u.id === lesson.unitId);
    const ring = this.data.rings.find((r) => r.id === lesson.ringId);

    let rawChallenges = this.data.challenges
      .filter((c) => c.lessonId === lessonId)
      .sort((a, b) => a.order - b.order);

    if (rawChallenges.length === 0) {
      rawChallenges = this.generateFallbackChallenges(lesson, unit, ring);
    }

    const challengesWithState = rawChallenges.map((c) => ({
      ...c,
      completed: !!this.challengeProgressMap.get(userId + ":" + c.id),
      options: c.options.map((opt) => ({ ...opt })),
    }));

    return {
      ...lesson,
      unit,
      ring,
      challenges: challengesWithState,
    };
  }

  /**
   * Safe fallback challenge generator
   */
  private generateFallbackChallenges(
    lesson: SeedLesson,
    unit?: SeedUnit,
    ring?: SeedRing
  ): SeedChallenge[] {
    const baseId = lesson.id * 100;
    return [
      {
        id: baseId + 1,
        lessonId: lesson.id,
        type: "SELECT",
        question: "Select the correct translation for \\"Kaixo\\":",
        prompt: "Kaixo",
        order: 1,
        options: [
          { id: baseId + 11, text: "Hello", correct: true },
          { id: baseId + 12, text: "Goodbye", correct: false },
          { id: baseId + 13, text: "Thank you", correct: false }
        ]
      }
    ];
  }

  // --- USER PROGRESS & GAMIFICATION ---
  getUserProgress(userId = this.data.initialUser.userId) {
    return { ...this.data.initialUser };
  }

  reduceHeart(userId = this.data.initialUser.userId) {
    if (this.data.initialUser.hasActiveSubscription) {
      return { hearts: 5, unlimited: true };
    }
    if (this.data.initialUser.hearts > 0) {
      this.data.initialUser.hearts -= 1;
    }
    return { hearts: this.data.initialUser.hearts, unlimited: false };
  }

  refillHearts(userId = this.data.initialUser.userId) {
    this.data.initialUser.hearts = 5;
    return { success: true, hearts: 5 };
  }

  toggleSuperSubscription(userId = this.data.initialUser.userId) {
    this.data.initialUser.hasActiveSubscription = !this.data.initialUser.hasActiveSubscription;
    if (this.data.initialUser.hasActiveSubscription) {
      this.data.initialUser.hearts = 5;
    }
    return { hasActiveSubscription: this.data.initialUser.hasActiveSubscription };
  }

  completeLesson(lessonId: number, xp = 15, userId = this.data.initialUser.userId) {
    this.completedLessonIds.add(lessonId);
    this.data.initialUser.points += xp;
    this.data.initialUser.gems += 15;
    this.data.initialUser.streak = Math.max(this.data.initialUser.streak, 1);

    const lessonChallenges = this.data.challenges.filter((c) => c.lessonId === lessonId);
    lessonChallenges.forEach((c) => {
      this.challengeProgressMap.set(userId + ":" + c.id, true);
    });

    return {
      points: this.data.initialUser.points,
      gems: this.data.initialUser.gems,
      streak: this.data.initialUser.streak,
    };
  }

  resetProgress(userId = this.data.initialUser.userId) {
    this.completedLessonIds.clear();
    this.challengeProgressMap.clear();
    this.data.initialUser.hearts = 5;
    this.data.initialUser.points = 0;
    this.data.initialUser.streak = 0;
    this.data.initialUser.gems = 100;
    this.data.initialUser.hasActiveSubscription = false;

    return {
      success: true,
      userProgress: { ...this.data.initialUser },
    };
  }

  getSchemaOverview() {
    return {
      tables: [
        {
          name: "languages",
          description: "Registry of available source & target languages (code, name, nativeName, flagEmoji)",
          columns: ["id (PK, varchar)", "name (text)", "native_name (text)", "flag_emoji (text)", "is_supported (bool)"],
        },
        {
          name: "courses",
          description: "Courses linking source language to target language (e.g. Basque via English)",
          columns: ["id (PK, serial)", "title (varchar)", "source_language_id (FK)", "target_language_id (FK)", "image_src (text)", "description (text)", "created_at (timestamp)"],
        },
        {
          name: "sections",
          description: "Major learning tiers grouping units (Hasiberria, Esploratzailea, Bidea Eginez, Eraikitzailea, Txapelduna)",
          columns: ["id (PK, serial)", "course_id (FK -> courses)", "title (text)", "description (text)", "order (int)", "color (text)", "icon (text)"],
        },
        {
          name: "units",
          description: "Thematic grammatical units along the learning path",
          columns: ["id (PK, serial)", "section_id (FK -> sections)", "course_id (FK -> courses)", "title (text)", "description (text)", "order (int)", "color (text)", "guidebook (text)"],
        },
        {
          name: "rings",
          description: "Skill ring nodes in each unit featuring multi-level progression (0/5 to 5/5 Mastered)",
          columns: ["id (PK, serial)", "unit_id (FK -> units)", "title (text)", "description (text)", "order (int)", "total_levels (int)", "is_unit_review (bool)", "icon (text)"],
        },
        {
          name: "lessons",
          description: "Granular level sessions inside each ring awarding XP and advancing mastery crowns",
          columns: ["id (PK, serial)", "unit_id (FK -> units)", "ring_id (FK -> rings)", "level (int)", "title (text)", "order (int)", "xp_reward (int)", "is_unit_review (bool)"],
        },
        {
          name: "challenges",
          description: "Interactive exercises supporting SELECT, TRANSLATE, MATCH, LISTEN, and ASSIST",
          columns: ["id (PK, serial)", "lesson_id (FK -> lessons)", "type (enum)", "question (text)", "prompt (text)", "order (int)", "audio_src (text)", "audio_text (text)"],
        },
        {
          name: "challenge_options",
          description: "Answer options, word bank tokens, and linked pair matching keys",
          columns: ["id (PK, serial)", "challenge_id (FK -> challenges)", "text (text)", "correct (bool)", "image_src (text)", "audio_src (text)", "order (int)", "pair_matching_key (text)"],
        },
        {
          name: "challenge_progress",
          description: "User challenge completion log",
          columns: ["id (PK, serial)", "user_id (text)", "challenge_id (FK -> challenges)", "completed (bool)", "created_at (timestamp)"],
        },
        {
          name: "user_progress",
          description: "Gamification state: active course, hearts/lives, streak, XP, and gems",
          columns: ["user_id (PK, text)", "user_name (text)", "user_image_src (text)", "active_course_id (FK)", "hearts (int)", "points (int)", "streak (int)", "last_active_date (timestamp)", "gems (int)", "has_active_subscription (bool)"],
        },
      ],
    };
  }
}

export const dbManager = new StateManager();
`;

fs.writeFileSync('/home/emma/remote-repos/euskarolingo/db/db.ts', cleanDbContent, 'utf8');
console.log("db/db.ts cleaned up successfully.");
