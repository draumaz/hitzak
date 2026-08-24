import fs from "fs";
import path from "path";
import crypto from "crypto";
import * as schema from "./schema";
import {
  SEED_DATA,
  type SeedData,
  type SeedLesson,
  type SeedChallenge,
  type SeedUnit,
  type SeedRing,
} from "./seed-data";

const STORE_PATH = path.join(process.cwd(), "db", "users_store.json");

interface UserState {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  progress: {
    userId: string;
    userName: string;
    userImageSrc: string;
    activeCourseId: number;
    hearts: number;
    points: number;
    streak: number;
    gems: number;
    hasActiveSubscription: boolean;
  };
  challengeProgressMap: Record<string, boolean>; // challengeId -> boolean
  completedLessonIds: number[];
}

interface StoreData {
  users: Record<string, UserState>; // key is lowercase username
}

/**
 * Universal Database & State Provider for Hitzak (Multi-user Persistent JSON file database)
 */
class StateManager {
  private data: SeedData;
  private store: StoreData = { users: {} };

  constructor() {
    this.data = JSON.parse(JSON.stringify(SEED_DATA));
    this.loadStore();
  }

  private loadStore() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const fileContent = fs.readFileSync(STORE_PATH, "utf-8");
        this.store = JSON.parse(fileContent);
      } else {
        const dir = path.dirname(STORE_PATH);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        this.store = { users: {} };
        this.saveStore();
      }
    } catch (e) {
      console.error("Failed to load users store:", e);
      this.store = { users: {} };
    }
  }

  private saveStore() {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.store, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save users store:", e);
    }
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  }

  private generateSalt(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  // --- USER AUTHENTICATION & MANAGEMENT ---
  
  createUser(username: string, password: string): UserState | null {
    const normalized = username.trim().toLowerCase();
    if (!normalized || password.length < 4) return null;
    if (this.store.users[normalized]) return null;

    const salt = this.generateSalt();
    const passwordHash = this.hashPassword(password, salt);
    const userId = crypto.randomUUID();

    const newUserState: UserState = {
      id: userId,
      username: username.trim(),
      passwordHash,
      salt,
      progress: {
        userId: userId,
        userName: username.trim(),
        userImageSrc: "/mascot.svg",
        activeCourseId: 1,
        hearts: 5,
        points: 0,
        streak: 0,
        gems: 100,
        hasActiveSubscription: false,
      },
      challengeProgressMap: {},
      completedLessonIds: [],
    };

    this.store.users[normalized] = newUserState;
    this.saveStore();
    return newUserState;
  }

  verifyUser(username: string, password: string): UserState | null {
    const normalized = username.trim().toLowerCase();
    const userState = this.store.users[normalized];
    if (!userState) return null;

    const computedHash = this.hashPassword(password, userState.salt);
    if (computedHash === userState.passwordHash) {
      return userState;
    }
    return null;
  }

  private getOrCreateUserState(userId: string): UserState {
    const user = Object.values(this.store.users).find((u) => u.id === userId);
    if (user) return user;

    // Fallback template for user_euskaldun or debug sessions
    const defaultUser: UserState = {
      id: userId,
      username: userId === "user_euskaldun" ? "Euskaldun Learner" : userId,
      passwordHash: "",
      salt: "",
      progress: {
        userId: userId,
        userName: userId === "user_euskaldun" ? "Euskaldun Learner" : userId,
        userImageSrc: "/mascot.svg",
        activeCourseId: 1,
        hearts: 5,
        points: 0,
        streak: 0,
        gems: 100,
        hasActiveSubscription: false,
      },
      challengeProgressMap: {},
      completedLessonIds: [],
    };

    if (userId === "user_euskaldun") {
      this.store.users["user_euskaldun"] = defaultUser;
      this.saveStore();
    }
    return defaultUser;
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
  getSections(courseId = 1, userId = "user_euskaldun") {
    const activeCourse = this.data.courses.find((c) => c.id === courseId);
    if (!activeCourse) return [];

    const userState = this.getOrCreateUserState(userId);
    const completedSet = new Set(userState.completedLessonIds);

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
            completedSet.has(l.id)
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
  getUnitsWithRings(sectionId?: number, courseId = 1, userId = "user_euskaldun") {
    let courseUnits = this.data.units.filter((u) => u.courseId === courseId);
    if (sectionId) {
      courseUnits = courseUnits.filter((u) => u.sectionId === sectionId);
    }

    const userState = this.getOrCreateUserState(userId);
    const completedSet = new Set(userState.completedLessonIds);

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
            completedSet.has(l.id)
          ).length;

          const totalLevels = ring.totalLevels || ringLessons.length || 1;
          const isMastered = completedLevels >= totalLevels;

          const nextLesson =
            ringLessons.find((l) => !completedSet.has(l.id)) || ringLessons[0];

          return {
            ...ring,
            totalLevels,
            completedLevels,
            isMastered,
            lessons: ringLessons.map((l) => ({
              ...l,
              isCompleted: completedSet.has(l.id),
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
              isCompleted: completedSet.has(l.id),
            })),
        };
      });
  }

  getUnitsWithLessons(courseId = 1, userId = "user_euskaldun") {
    return this.getUnitsWithRings(undefined, courseId, userId);
  }

  // --- LESSON DETAILS & CHALLENGES ---
  getLessonWithChallenges(lessonId: number, userId = "user_euskaldun") {
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

    const userState = this.getOrCreateUserState(userId);

    const challengesWithState = rawChallenges.map((c) => ({
      ...c,
      completed: !!userState.challengeProgressMap[c.id],
      options: c.options.map((opt) => ({ ...opt })),
    }));

    return {
      ...lesson,
      unit,
      ring,
      challenges: challengesWithState,
    };
  }

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
        question: "Select the correct translation for \"Kaixo\":",
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
  getUserProgress(userId = "user_euskaldun") {
    const userState = this.getOrCreateUserState(userId);
    return { ...userState.progress };
  }

  reduceHeart(userId = "user_euskaldun") {
    const userState = this.getOrCreateUserState(userId);
    if (userState.progress.hasActiveSubscription) {
      return { hearts: 5, unlimited: true };
    }
    if (userState.progress.hearts > 0) {
      userState.progress.hearts -= 1;
      this.saveStore();
    }
    return { hearts: userState.progress.hearts, unlimited: false };
  }

  refillHearts(userId = "user_euskaldun") {
    const userState = this.getOrCreateUserState(userId);
    userState.progress.hearts = 5;
    this.saveStore();
    return { success: true, hearts: 5 };
  }

  toggleSuperSubscription(userId = "user_euskaldun") {
    const userState = this.getOrCreateUserState(userId);
    userState.progress.hasActiveSubscription = !userState.progress.hasActiveSubscription;
    if (userState.progress.hasActiveSubscription) {
      userState.progress.hearts = 5;
    }
    this.saveStore();
    return { hasActiveSubscription: userState.progress.hasActiveSubscription };
  }

  completeLesson(lessonId: number, xp = 15, userId = "user_euskaldun") {
    const userState = this.getOrCreateUserState(userId);
    
    if (!userState.completedLessonIds.includes(lessonId)) {
      userState.completedLessonIds.push(lessonId);
    }
    
    userState.progress.points += xp;
    userState.progress.gems += 15;
    userState.progress.streak = Math.max(userState.progress.streak, 1);

    const lessonChallenges = this.data.challenges.filter((c) => c.lessonId === lessonId);
    lessonChallenges.forEach((c) => {
      userState.challengeProgressMap[c.id] = true;
    });

    this.saveStore();

    return {
      points: userState.progress.points,
      gems: userState.progress.gems,
      streak: userState.progress.streak,
    };
  }

  resetProgress(userId = "user_euskaldun") {
    const userState = this.getOrCreateUserState(userId);
    userState.completedLessonIds = [];
    userState.challengeProgressMap = {};
    userState.progress.hearts = 5;
    userState.progress.points = 0;
    userState.progress.streak = 0;
    userState.progress.gems = 100;
    userState.progress.hasActiveSubscription = false;

    this.saveStore();

    return {
      success: true,
      userProgress: { ...userState.progress },
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
