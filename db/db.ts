import fs from "fs";
import path from "path";
import crypto from "crypto";
import * as schema from "./schema";
import {
  type SeedData,
  type SeedLesson,
  type SeedChallenge,
  type SeedUnit,
  type SeedRing,
} from "./types";

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
  mistakeChallengeIds?: number[];
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
    this.data = this.loadSeedData();
    this.loadStore();
  }

  private getStorePath(): string {
    if (process.env.USERS_STORE_PATH) {
      return process.env.USERS_STORE_PATH;
    }
    if (process.env.DB_DIR) {
      return path.join(process.env.DB_DIR, "users_store.json");
    }

    const candidate1 = path.join(process.cwd(), "db", "users_store.json");
    if (fs.existsSync(candidate1)) {
      return candidate1;
    }

    const candidate2 = path.join(process.cwd(), "db", "db", "users_store.json");
    if (fs.existsSync(candidate2)) {
      return candidate2;
    }

    const candidate3 = path.join(process.cwd(), "users_store.json");
    if (fs.existsSync(candidate3)) {
      return candidate3;
    }

    // Default fallback if no file exists yet
    if (fs.existsSync(path.join(process.cwd(), "db", "db"))) {
      return candidate2;
    }
    return candidate1;
  }

  private loadSeedData(): SeedData {
    const dataDir = path.join(process.cwd(), "data");
    const languagesPath = path.join(dataDir, "languages.json");
    
    let languages: SeedData["languages"] = [];
    if (fs.existsSync(languagesPath)) {
      languages = JSON.parse(fs.readFileSync(languagesPath, "utf-8"));
    }

    const coursesDir = path.join(dataDir, "courses");
    const courses: SeedData["courses"] = [];
    const sections: SeedData["sections"] = [];
    const units: SeedData["units"] = [];
    const rings: SeedData["rings"] = [];
    const lessons: SeedData["lessons"] = [];
    const challenges: SeedData["challenges"] = [];

    if (fs.existsSync(coursesDir)) {
      const courseDirs = fs.readdirSync(coursesDir);
      for (const dirName of courseDirs) {
        const coursePath = path.join(coursesDir, dirName);
        if (fs.statSync(coursePath).isDirectory()) {
          const courseJsonPath = path.join(coursePath, "course.json");
          if (fs.existsSync(courseJsonPath)) {
            const courseData = JSON.parse(fs.readFileSync(courseJsonPath, "utf-8"));
            courses.push(courseData);

            const sectionsJsonPath = path.join(coursePath, "sections.json");
            if (fs.existsSync(sectionsJsonPath)) {
              sections.push(...JSON.parse(fs.readFileSync(sectionsJsonPath, "utf-8")));
            }

            const unitsJsonPath = path.join(coursePath, "units.json");
            if (fs.existsSync(unitsJsonPath)) {
              units.push(...JSON.parse(fs.readFileSync(unitsJsonPath, "utf-8")));
            }

            const ringsJsonPath = path.join(coursePath, "rings.json");
            if (fs.existsSync(ringsJsonPath)) {
              rings.push(...JSON.parse(fs.readFileSync(ringsJsonPath, "utf-8")));
            }

            const lessonsJsonPath = path.join(coursePath, "lessons.json");
            if (fs.existsSync(lessonsJsonPath)) {
              lessons.push(...JSON.parse(fs.readFileSync(lessonsJsonPath, "utf-8")));
            }

            const challengesJsonPath = path.join(coursePath, "challenges.json");
            if (fs.existsSync(challengesJsonPath)) {
              const loadedChallenges: SeedChallenge[] = JSON.parse(
                fs.readFileSync(challengesJsonPath, "utf-8")
              );
              
              const filteredAndConverted = loadedChallenges
                .filter((c) => c.type !== "LISTEN")
                .map((c) => {
                  if (c.type === "SELECT") {
                    let displayPrompt = c.prompt || "";
                    let displayQuestion = c.question || "";
                    const quoteMatch = c.question.match(/(?:for|of)\s+["']([^"']+)["']/i);
                    if (quoteMatch) {
                      displayPrompt = quoteMatch[1];
                      displayQuestion = c.question.replace(quoteMatch[0], "").replace(/:\s*$/, "").trim();
                    }

                    const correctOpt = c.options.find((o) => o.correct);
                    const correctText = correctOpt ? correctOpt.text : "";

                    const words = correctText.split(/\s+/).filter(Boolean);
                    const newOptions = words.map((word, idx) => ({
                      id: (correctOpt?.id || 0) * 1000 + idx,
                      text: word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim(),
                      correct: true,
                      order: idx + 1,
                    }));

                    return {
                      ...c,
                      type: "TRANSLATE" as const,
                      prompt: displayPrompt,
                      question: "Write this in English",
                      options: newOptions,
                    };
                  }
                  return c;
                });

              challenges.push(...filteredAndConverted);
            }
          }
        }
      }
    }

    return {
      languages,
      courses,
      sections,
      units,
      rings,
      lessons,
      challenges,
      initialUser: {
        userId: "user_euskaldun",
        userName: "Euskaldun Learner",
        userImageSrc: "/mascot.svg",
        activeCourseId: 1,
        hearts: 5,
        points: 0,
        streak: 0,
        gems: 100,
        hasActiveSubscription: false,
      },
    };
  }

  private loadStore() {
    try {
      const storePath = this.getStorePath();
      if (fs.existsSync(storePath)) {
        const fileContent = fs.readFileSync(storePath, "utf-8");
        this.store = JSON.parse(fileContent);
      } else {
        const dir = path.dirname(storePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        this.store = { users: {} };
        this.saveStore();
      }
    } catch (e) {
      console.error("Failed to load users store:", e);
      if (!this.store || !this.store.users) {
        this.store = { users: {} };
      }
    }
  }

  private saveStore() {
    try {
      const storePath = this.getStorePath();
      const dir = path.dirname(storePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(storePath, JSON.stringify(this.store, null, 2), "utf-8");
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
    this.loadStore();
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
    this.loadStore();
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
    this.loadStore();
    const user = Object.values(this.store.users).find((u) => u.id === userId);
    if (user) {
      if (!user.mistakeChallengeIds) {
        user.mistakeChallengeIds = [];
      }
      return user;
    }

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
      mistakeChallengeIds: [],
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

    let previousUnitCompleted = true;

    return courseUnits
      .sort((a, b) => a.order - b.order)
      .map((unit) => {
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
        const allPreRingsCompleted =
          nonReviewRings.length === 0 ||
          nonReviewRings.every((r) => r.completedLevels >= r.totalLevels);

        const reviewRing = ringsWithState.find((r) => r.isUnitReview);
        const isUnitCompleted = reviewRing ? reviewRing.isMastered : false;

        const currentUnitUnlocked = previousUnitCompleted;
        previousUnitCompleted = isUnitCompleted;

        return {
          ...unit,
          isCompleted: isUnitCompleted,
          isUnlocked: currentUnitUnlocked,
          isReviewUnlocked: allPreRingsCompleted && currentUnitUnlocked,
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
        type: "TRANSLATE",
        question: "Write this in English",
        prompt: "Kaixo",
        order: 1,
        options: [
          { id: baseId + 11, text: "Hello", correct: true, order: 1 }
        ]
      }
    ];
  }

  // --- USER PROGRESS & GAMIFICATION ---
  getUserProgress(userId = "user_euskaldun") {
    const userState = this.getOrCreateUserState(userId);
    const mistakesCount = userState.mistakeChallengeIds ? userState.mistakeChallengeIds.length : 0;
    return { ...userState.progress, mistakesCount };
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

  selectCourse(courseId: number, userId = "user_euskaldun") {
    const userState = this.getOrCreateUserState(userId);
    userState.progress.activeCourseId = courseId;
    this.saveStore();
    return { success: true, activeCourseId: courseId };
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

  recordMistake(challengeId: number, userId = "user_euskaldun") {
    const userState = this.getOrCreateUserState(userId);
    if (!userState.mistakeChallengeIds) {
      userState.mistakeChallengeIds = [];
    }
    if (!userState.mistakeChallengeIds.includes(challengeId)) {
      userState.mistakeChallengeIds.push(challengeId);
      this.saveStore();
    }
    return { success: true, count: userState.mistakeChallengeIds.length };
  }

  removeMistake(challengeId: number, userId = "user_euskaldun") {
    const userState = this.getOrCreateUserState(userId);
    if (userState.mistakeChallengeIds && userState.mistakeChallengeIds.includes(challengeId)) {
      userState.mistakeChallengeIds = userState.mistakeChallengeIds.filter((id) => id !== challengeId);
      this.saveStore();
    }
    const count = userState.mistakeChallengeIds ? userState.mistakeChallengeIds.length : 0;
    return { success: true, count };
  }

  getMistakePracticeLesson(userId = "user_euskaldun") {
    const userState = this.getOrCreateUserState(userId);
    const ids = userState.mistakeChallengeIds || [];
    const challenges = this.data.challenges.filter((c) => ids.includes(c.id));
    return {
      id: -1,
      title: "Mistakes Review",
      xpReward: 20,
      challenges: challenges.map((c) => ({
        ...c,
        completed: false,
        options: c.options.map((opt) => ({ ...opt })),
      })),
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
