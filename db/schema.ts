import { relations, sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/* ==========================================================================
   1. ENUMS
   ========================================================================== */

/**
 * Supported challenge / exercise types:
 * - SELECT: Multiple-choice question (choose correct word/translation among options)
 * - ASSIST: Fill-in-the-blank or contextual word assistance
 * - TRANSLATE: Sentence builder / interactive word bank tile assembly
 * - MATCH: Interactive matching pairs (pair Basque words with English translations)
 * - LISTEN: Audio listening comprehension & pronunciation transcription
 */
export const challengeTypeEnum = pgEnum("challenge_type", [
  "SELECT",
  "ASSIST",
  "TRANSLATE",
  "MATCH",
  "LISTEN",
]);

/* ==========================================================================
   2. LANGUAGES & COURSES
   ========================================================================== */

/**
 * Registry of available natural languages (e.g., Basque 'eu', English 'en', Spanish 'es')
 */
export const languages = pgTable("languages", {
  id: varchar("id", { length: 10 }).primaryKey(), // ISO 639-1 code ('eu', 'en', etc.)
  name: text("name").notNull(), // 'Basque'
  nativeName: text("native_name").notNull(), // 'Euskara'
  flagEmoji: text("flag_emoji").notNull(), // '🟢' or Ikurrina representation
  isSupported: boolean("is_supported").notNull().default(true),
});

/**
 * Courses link a source language (the learner's native/UI language)
 * to a target language (the language being learned, e.g. Basque).
 */
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(), // e.g., 'Basque for English Speakers'
  sourceLanguageId: varchar("source_language_id", { length: 10 })
    .notNull()
    .references(() => languages.id, { onDelete: "cascade" }),
  targetLanguageId: varchar("target_language_id", { length: 10 })
    .notNull()
    .references(() => languages.id, { onDelete: "cascade" }),
  imageSrc: text("image_src").notNull().default("/mascot.svg"),
  description: text("description").notNull().default("Learn Basque (Euskara) from scratch!"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ==========================================================================
   3. SECTIONS, UNITS, RINGS & LESSONS (THE LEARNING PATHWAY)
   ========================================================================== */

/**
 * Sections represent major milestone tiers (e.g., Section 1: Hasiberria, Section 2: Esploratzailea).
 */
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // e.g. 'Section 1: Hasiberria (Rookie)'
  description: text("description").notNull(), // e.g. 'Foundations, greetings, noun phrases & daily food'
  order: integer("order").notNull(), // 1, 2, 3, 4, 5
  color: text("color").notNull().default("#58cc02"), // Section theme color
  icon: text("icon").notNull().default("compass"),
});

/**
 * Units represent thematic grammatical chapters in a section.
 */
export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id")
    .references(() => sections.id, { onDelete: "cascade" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // e.g. 'Unit 1: Basics & Greetings'
  description: text("description").notNull(), // e.g. 'Learn essential greetings and everyday polite phrases in Basque'
  order: integer("order").notNull(), // 1, 2, 3...
  color: text("color").notNull().default("#58cc02"), // Theme color for unit banner
  guidebook: text("guidebook"), // Rich Markdown grammar tips & key vocabulary
});

/**
 * Rings (Skill Nodes) represent interactive skill circles on the learning path.
 * Each ring has multiple levels to master (e.g. Levels 1, 2, 3) culminating in Crown Mastery.
 */
export const rings = pgTable("rings", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // e.g. 'Greetings', 'Courtesy', 'Unit 1 Review'
  description: text("description"), // Educational focus description
  order: integer("order").notNull(), // 1, 2, 3...
  totalLevels: integer("total_levels").notNull().default(3), // Number of levels in the ring (e.g. 3)
  isUnitReview: boolean("is_unit_review").notNull().default(false), // Final milestone review ring
  icon: text("icon").notNull().default("star"),
});

/**
 * Lessons represent individual levels / exercise sessions inside a ring.
 * Completing lessons advances user progress, levels up rings, and awards XP.
 */
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  ringId: integer("ring_id")
    .references(() => rings.id, { onDelete: "cascade" }),
  level: integer("level").notNull().default(1), // Level 1, 2, 3
  title: text("title").notNull(), // e.g. 'Greetings - Level 1: Recognition'
  order: integer("order").notNull(), // 1, 2, 3...
  xpReward: integer("xp_reward").notNull().default(15), // Base XP awarded upon completion
  isUnitReview: boolean("is_unit_review").notNull().default(false),
});

/* ==========================================================================
   4. CHALLENGES & OPTIONS (THE EXERCISE ENGINE)
   ========================================================================== */

/**
 * Challenges represent individual exercises inside a lesson.
 * Supports multiple exercise types: SELECT, TRANSLATE, MATCH, LISTEN, ASSIST.
 */
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  type: challengeTypeEnum("type").notNull(),
  question: text("question").notNull(), // e.g. 'Which of these is "Good morning"?' or 'Translate this sentence'
  prompt: text("prompt"), // Context prompt (e.g. 'Egun on, nola zaude?' or 'Kaixo')
  order: integer("order").notNull(), // 1, 2, 3...
  audioSrc: text("audio_src"), // Optional static audio URL for pronunciation
  audioText: text("audio_text"), // Text string for Web Speech API synthesis fallback
  grammarTip: text("grammar_tip"), // Micro-grammar explanation capsule or Duolingo nonsense trick tip
});

/**
 * Challenge options serve multiple roles based on challenge type:
 * - SELECT / ASSIST: Multiple-choice answer options (one or more marked `correct = true`)
 * - TRANSLATE: Word bank tokens used to assemble the translated sentence
 * - MATCH: Pair items linked by `pairMatchingKey` (e.g. key 'pair_1' on 'Kaixo' matches 'pair_1' on 'Hello')
 * - LISTEN: Transcription choices or word bank tokens
 */
export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  text: text("text").notNull(), // Text displayed on the button / tile
  correct: boolean("correct").notNull().default(false), // Is this option the correct answer?
  imageSrc: text("image_src"), // Optional image illustration for visual vocabulary
  audioSrc: text("audio_src"), // Optional pronunciation audio
  order: integer("order").default(0), // Default display order in word banks
  pairMatchingKey: text("pair_matching_key"), // Used for MATCH exercises to link source & target pairs
});

/**
 * Tracks individual challenge completions per user.
 */
export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // User identifier (Clerk ID, UUID, or local user ID)
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ==========================================================================
   5. USER PROGRESS & GAMIFICATION (HEARTS, STREAKS, XP, SUBSCRIPTIONS)
   ========================================================================== */

/**
 * User progress entity tracks the user's active state across the app:
 * - Current active course
 * - Remaining hearts/lives (decremented on wrong answers, refilled via practice/gems)
 * - Total XP / Points earned
 * - Current consecutive streak (with daily timestamp checking)
 * - Gems / Lingots balance for shop purchases
 * - Super / Pro subscription status (unlimited hearts)
 */
export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(), // Clerk user ID or persistent local ID
  userName: text("user_name").notNull().default("Euskaldun"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "set null",
  }),
  hearts: integer("hearts").notNull().default(5), // 5 hearts max by default
  points: integer("points").notNull().default(0), // Total XP earned
  streak: integer("streak").notNull().default(0), // Days of active practice in a row
  lastActiveDate: timestamp("last_active_date", { withTimezone: true })
    .defaultNow()
    .notNull(),
  gems: integer("gems").notNull().default(100), // Currency for shop
  hasActiveSubscription: boolean("has_active_subscription").notNull().default(false),
});

/**
 * Tracks Stripe / payment subscription records for Super Hitzak status.
 */
export const userSubscription = pgTable("user_subscription", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(false),
});

/**
 * Daily streak logs for activity heatmaps and historical tracking.
 */
export const userStreakLog = pgTable("user_streak_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  activityDate: text("activity_date").notNull(), // 'YYYY-MM-DD'
  xpEarned: integer("xp_earned").notNull().default(0),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
});

/* ==========================================================================
   6. DRIZZLE ORM RELATIONS DEFINITIONS
   ========================================================================== */

export const languagesRelations = relations(languages, ({ many }) => ({
  sourceCourses: many(courses, { relationName: "sourceLanguage" }),
  targetCourses: many(courses, { relationName: "targetLanguage" }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  sourceLanguage: one(languages, {
    fields: [courses.sourceLanguageId],
    references: [languages.id],
    relationName: "sourceLanguage",
  }),
  targetLanguage: one(languages, {
    fields: [courses.targetLanguageId],
    references: [languages.id],
    relationName: "targetLanguage",
  }),
  sections: many(sections),
  units: many(units),
  userProgress: many(userProgress),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, {
    fields: [sections.courseId],
    references: [courses.id],
  }),
  units: many(units),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  section: one(sections, {
    fields: [units.sectionId],
    references: [sections.id],
  }),
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  rings: many(rings),
  lessons: many(lessons),
}));

export const ringsRelations = relations(rings, ({ one, many }) => ({
  unit: one(units, {
    fields: [rings.unitId],
    references: [units.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  ring: one(rings, {
    fields: [lessons.ringId],
    references: [rings.id],
  }),
  challenges: many(challenges),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

export const challengeOptionsRelations = relations(challengeOptions, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeOptions.challengeId],
    references: [challenges.id],
  }),
}));

export const challengeProgressRelations = relations(challengeProgress, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeProgress.challengeId],
    references: [challenges.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId],
    references: [courses.id],
  }),
}));

/* ==========================================================================
   7. INFERRED TYPESCRIPT TYPES
   ========================================================================== */

export type Language = InferSelectModel<typeof languages>;
export type NewLanguage = InferInsertModel<typeof languages>;

export type Course = InferSelectModel<typeof courses>;
export type NewCourse = InferInsertModel<typeof courses>;

export type Section = InferSelectModel<typeof sections>;
export type NewSection = InferInsertModel<typeof sections>;

export type Unit = InferSelectModel<typeof units>;
export type NewUnit = InferInsertModel<typeof units>;

export type Ring = InferSelectModel<typeof rings>;
export type NewRing = InferInsertModel<typeof rings>;

export type Lesson = InferSelectModel<typeof lessons>;
export type NewLesson = InferInsertModel<typeof lessons>;

export type Challenge = InferSelectModel<typeof challenges>;
export type NewChallenge = InferInsertModel<typeof challenges>;
export type ChallengeType = (typeof challengeTypeEnum.enumValues)[number];

export type ChallengeOption = InferSelectModel<typeof challengeOptions>;
export type NewChallengeOption = InferInsertModel<typeof challengeOptions>;

export type ChallengeProgress = InferSelectModel<typeof challengeProgress>;
export type NewChallengeProgress = InferInsertModel<typeof challengeProgress>;

export type UserProgress = InferSelectModel<typeof userProgress>;
export type NewUserProgress = InferInsertModel<typeof userProgress>;

export type UserSubscription = InferSelectModel<typeof userSubscription>;
export type NewUserSubscription = InferInsertModel<typeof userSubscription>;

export type UserStreakLog = InferSelectModel<typeof userStreakLog>;
export type NewUserStreakLog = InferInsertModel<typeof userStreakLog>;

