"use client";

import { useState } from "react";
import {
  Database,
  Code,
  Layers,
  Check,
  Copy,
  Table,
  Sparkles,
  Compass,
  Award,
} from "lucide-react";

export function SchemaExplorer() {
  const [activeTab, setActiveTab] = useState<"loop" | "code" | "erd" | "sql">("loop");
  const [copied, setCopied] = useState(false);

  const schemaCode = `import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
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

/* 1. ENUMS */
export const challengeTypeEnum = pgEnum("challenge_type", [
  "SELECT",
  "ASSIST",
  "TRANSLATE",
  "MATCH",
  "LISTEN",
]);

/* 2. LANGUAGES & COURSES */
export const languages = pgTable("languages", {
  id: varchar("id", { length: 10 }).primaryKey(), // 'eu', 'en', 'es'
  name: text("name").notNull(),
  nativeName: text("native_name").notNull(),
  flagEmoji: text("flag_emoji").notNull(),
  isSupported: boolean("is_supported").notNull().default(true),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  sourceLanguageId: varchar("source_language_id", { length: 10 })
    .notNull()
    .references(() => languages.id, { onDelete: "cascade" }),
  targetLanguageId: varchar("target_language_id", { length: 10 })
    .notNull()
    .references(() => languages.id, { onDelete: "cascade" }),
  imageSrc: text("image_src").notNull().default("/mascot.svg"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* 3. SECTIONS, UNITS, RINGS & LESSONS (DUOLINGO PROGRESSION) */
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // 'Section 1: Hasiberria (Rookie)'
  description: text("description").notNull(),
  order: integer("order").notNull(),
  color: text("color").notNull().default("#58cc02"),
  icon: text("icon").notNull().default("compass"),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id")
    .references(() => sections.id, { onDelete: "cascade" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  color: text("color").notNull().default("#58cc02"),
  guidebook: text("guidebook"),
});

export const rings = pgTable("rings", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  totalLevels: integer("total_levels").notNull().default(3),
  isUnitReview: boolean("is_unit_review").notNull().default(false),
  icon: text("icon").notNull().default("star"),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  ringId: integer("ring_id")
    .references(() => rings.id, { onDelete: "cascade" }),
  level: integer("level").notNull().default(1),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  xpReward: integer("xp_reward").notNull().default(15),
  isUnitReview: boolean("is_unit_review").notNull().default(false),
});

/* 4. CHALLENGES & OPTIONS */
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  type: challengeTypeEnum("type").notNull(),
  question: text("question").notNull(),
  prompt: text("prompt"),
  order: integer("order").notNull(),
  audioSrc: text("audio_src"),
  audioText: text("audio_text"),
});

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  correct: boolean("correct").notNull().default(false),
  imageSrc: text("image_src"),
  audioSrc: text("audio_src"),
  order: integer("order").default(0),
  pairMatchingKey: text("pair_matching_key"),
});

/* 5. USER PROGRESS & GAMIFICATION */
export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("Euskaldun"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "set null",
  }),
  hearts: integer("hearts").notNull().default(5),
  points: integer("points").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastActiveDate: timestamp("last_active_date", { withTimezone: true }).defaultNow().notNull(),
  gems: integer("gems").notNull().default(100),
  hasActiveSubscription: boolean("has_active_subscription").notNull().default(false),
});`;

  const copyCode = () => {
    navigator.clipboard.writeText(schemaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Overview */}
      <div className="rounded-3xl border-2 border-duo-gray-border bg-white p-6 md:p-8 shadow-sm transition-colors duration-200 dark:border-[#37464f] dark:bg-[#182c34]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-duo-green text-white shadow-3d-green">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#3c3c3c] dark:text-white">
              Hitzak Database Schema
            </h1>
            <p className="text-sm font-bold text-[#777777] dark:text-[#afafaf]">
              Complete Drizzle ORM PostgreSQL schema supporting 5 Sections, 125 Units, Multi-Level Rings, Challenges, and Gamification
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-b-2 border-duo-gray-border pb-4 dark:border-[#37464f]">
          <button
            onClick={() => setActiveTab("loop")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 font-black text-sm transition-all ${
              activeTab === "loop"
                ? "bg-[#ddf4ff] text-[#1899d6] border-2 border-[#84d8ff] dark:bg-[#1899d6]/20 dark:border-[#1899d6] dark:text-[#1cb0f6]"
                : "text-[#777777] hover:bg-gray-100 dark:hover:bg-[#131f24] dark:text-[#afafaf] border-2 border-transparent"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Duolingo Architecture Loop</span>
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 font-black text-sm transition-all ${
              activeTab === "code"
                ? "bg-[#ddf4ff] text-[#1899d6] border-2 border-[#84d8ff] dark:bg-[#1899d6]/20 dark:border-[#1899d6] dark:text-[#1cb0f6]"
                : "text-[#777777] hover:bg-gray-100 dark:hover:bg-[#131f24] dark:text-[#afafaf] border-2 border-transparent"
            }`}
          >
            <Code className="h-4 w-4" />
            <span>Drizzle Schema (TypeScript)</span>
          </button>

          <button
            onClick={() => setActiveTab("erd")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 font-black text-sm transition-all ${
              activeTab === "erd"
                ? "bg-[#ddf4ff] text-[#1899d6] border-2 border-[#84d8ff] dark:bg-[#1899d6]/20 dark:border-[#1899d6] dark:text-[#1cb0f6]"
                : "text-[#777777] hover:bg-gray-100 dark:hover:bg-[#131f24] dark:text-[#afafaf] border-2 border-transparent"
            }`}
          >
            <Table className="h-4 w-4" />
            <span>Entity Relationship Cards</span>
          </button>

          <button
            onClick={() => setActiveTab("sql")}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 font-black text-sm transition-all ${
              activeTab === "sql"
                ? "bg-[#ddf4ff] text-[#1899d6] border-2 border-[#84d8ff] dark:bg-[#1899d6]/20 dark:border-[#1899d6] dark:text-[#1cb0f6]"
                : "text-[#777777] hover:bg-gray-100 dark:hover:bg-[#131f24] dark:text-[#afafaf] border-2 border-transparent"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>PostgreSQL DDL</span>
          </button>
        </div>

        {/* Tab 1: Duolingo Architecture Loop Walkthrough */}
        {activeTab === "loop" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border-2 border-duo-green/30 bg-duo-green-light/40 p-5 dark:border-duo-green/30 dark:bg-duo-green/10">
              <h3 className="font-black text-lg text-duo-green-dark dark:text-duo-green">
                How Hierarchical Foreign Keys Drive the Basque Learning Loop
              </h3>
              <p className="mt-1 text-sm text-[#4b4b4b] dark:text-[#afafaf] leading-relaxed">
                The schema structures Basque learning into 5 Sections $\rightarrow$ 125 Units (25 per section) $\rightarrow$ Multi-level Skill Rings $\rightarrow$ Lessons / Challenges $\rightarrow$ Unit Reviews & Progression.
              </p>
            </div>

            {/* Loop Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border-2 border-duo-gray-border p-5 bg-white shadow-sm space-y-2 dark:border-[#37464f] dark:bg-[#131f24]">
                <div className="flex items-center gap-2 text-duo-blue font-black text-sm uppercase">
                  <Compass className="h-4 w-4" />
                  <span>1. Sections & Units Hierarchy</span>
                </div>
                <div className="font-mono text-xs text-gray-700 bg-gray-100 p-2.5 rounded-xl border border-gray-200 dark:bg-[#182c34] dark:text-gray-300 dark:border-[#37464f]">
                  courses(id) $\leftarrow$ sections(course_id) $\leftarrow$ units(section_id)
                </div>
                <p className="text-xs text-gray-600 dark:text-[#afafaf] leading-relaxed">
                  Courses define the target language (Euskara). Sections group 25 related thematic units each (Hasiberria, Esploratzailea, Bidea Eginez, Eraikitzailea, Txapelduna) with unlock rules.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-duo-gray-border p-5 bg-white shadow-sm space-y-2 dark:border-[#37464f] dark:bg-[#131f24]">
                <div className="flex items-center gap-2 text-duo-green-dark dark:text-duo-green font-black text-sm uppercase">
                  <Layers className="h-4 w-4" />
                  <span>2. Multi-Level Rings & Lessons</span>
                </div>
                <div className="font-mono text-xs text-gray-700 bg-gray-100 p-2.5 rounded-xl border border-gray-200 dark:bg-[#182c34] dark:text-gray-300 dark:border-[#37464f]">
                  units(id) $\leftarrow$ rings(unit_id) $\leftarrow$ lessons(ring_id, level)
                </div>
                <p className="text-xs text-gray-600 dark:text-[#afafaf] leading-relaxed">
                  Each unit contains interactive skill rings. Completing a lesson increments the ring&apos;s level (0/5 $\rightarrow$ 5/5 Crown Mastered) and unlocks the next ring.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-duo-gray-border p-5 bg-white shadow-sm space-y-2 dark:border-[#37464f] dark:bg-[#131f24]">
                <div className="flex items-center gap-2 text-duo-orange font-black text-sm uppercase">
                  <Award className="h-4 w-4" />
                  <span>3. Unit Review Trophy Checkpoint</span>
                </div>
                <div className="font-mono text-xs text-gray-700 bg-gray-100 p-2.5 rounded-xl border border-gray-200 dark:bg-[#182c34] dark:text-gray-300 dark:border-[#37464f]">
                  rings(is_unit_review = true) $\rightarrow$ unlocks unit.isCompleted
                </div>
                <p className="text-xs text-gray-600 dark:text-[#afafaf] leading-relaxed">
                  Once all rings in a unit are started, the final Unit Review Trophy unlocks. Completing this review awards the Unit Mastery Trophy and unlocks the next unit!
                </p>
              </div>

              <div className="rounded-2xl border-2 border-duo-gray-border p-5 bg-white shadow-sm space-y-2 dark:border-[#37464f] dark:bg-[#131f24]">
                <div className="flex items-center gap-2 text-duo-purple font-black text-sm uppercase">
                  <Sparkles className="h-4 w-4" />
                  <span>4. Exercise Engine & Gamification</span>
                </div>
                <div className="font-mono text-xs text-gray-700 bg-gray-100 p-2.5 rounded-xl border border-gray-200 dark:bg-[#182c34] dark:text-gray-300 dark:border-[#37464f]">
                  challenges(type) $\rightarrow$ challenge_options $\rightarrow$ user_progress
                </div>
                <p className="text-xs text-gray-600 dark:text-[#afafaf] leading-relaxed">
                  Exercises support SELECT, TRANSLATE, MATCH, LISTEN, and ASSIST with Web Speech audio. Correct answers award XP and maintain daily streaks; mistakes deduct hearts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Drizzle ORM Schema TypeScript Code */}
        {activeTab === "code" && (
          <div className="mt-6 relative">
            <div className="flex justify-between items-center bg-[#1e293b] text-gray-300 px-4 py-2.5 rounded-t-2xl text-xs font-mono">
              <span>db/schema.ts</span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs hover:bg-white/20 transition text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-duo-green" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>
            <pre className="max-h-[600px] overflow-auto rounded-b-2xl bg-[#0f172a] p-5 font-mono text-xs text-emerald-300 leading-relaxed">
              <code>{schemaCode}</code>
            </pre>
          </div>
        )}

        {/* Tab 3: Entity Relationship Cards */}
        {activeTab === "erd" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sections */}
            <div className="rounded-2xl border-2 border-duo-gray-border p-4 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-black text-sm text-emerald-600">sections</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">TABLE</span>
              </div>
              <ul className="text-xs space-y-1 font-mono text-gray-600">
                <li><strong className="text-amber-600">id</strong>: serial (PK)</li>
                <li><strong className="text-blue-600">courseId</strong>: integer (FK $\rightarrow$ courses)</li>
                <li><strong>title</strong>: text</li>
                <li><strong>description</strong>: text</li>
                <li><strong>order</strong>: integer</li>
                <li><strong>color</strong>: text</li>
                <li><strong>icon</strong>: text</li>
              </ul>
            </div>

            {/* Units */}
            <div className="rounded-2xl border-2 border-duo-gray-border p-4 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-black text-sm text-duo-green-dark">units</span>
                <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">TABLE</span>
              </div>
              <ul className="text-xs space-y-1 font-mono text-gray-600">
                <li><strong className="text-amber-600">id</strong>: serial (PK)</li>
                <li><strong className="text-blue-600">sectionId</strong>: integer (FK $\rightarrow$ sections)</li>
                <li><strong className="text-blue-600">courseId</strong>: integer (FK $\rightarrow$ courses)</li>
                <li><strong>title</strong>: text</li>
                <li><strong>description</strong>: text</li>
                <li><strong>order</strong>: integer</li>
                <li><strong>color</strong>: text</li>
                <li><strong>guidebook</strong>: text</li>
              </ul>
            </div>

            {/* Rings */}
            <div className="rounded-2xl border-2 border-duo-gray-border p-4 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-black text-sm text-duo-blue">rings</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">TABLE</span>
              </div>
              <ul className="text-xs space-y-1 font-mono text-gray-600">
                <li><strong className="text-amber-600">id</strong>: serial (PK)</li>
                <li><strong className="text-blue-600">unitId</strong>: integer (FK $\rightarrow$ units)</li>
                <li><strong>title</strong>: text</li>
                <li><strong>description</strong>: text</li>
                <li><strong>order</strong>: integer</li>
                <li><strong>totalLevels</strong>: integer (3)</li>
                <li><strong>isUnitReview</strong>: boolean</li>
                <li><strong>icon</strong>: text</li>
              </ul>
            </div>

            {/* Lessons */}
            <div className="rounded-2xl border-2 border-duo-gray-border p-4 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-black text-sm text-duo-yellow-dark">lessons</span>
                <span className="text-[10px] bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded">TABLE</span>
              </div>
              <ul className="text-xs space-y-1 font-mono text-gray-600">
                <li><strong className="text-amber-600">id</strong>: serial (PK)</li>
                <li><strong className="text-blue-600">unitId</strong>: integer (FK $\rightarrow$ units)</li>
                <li><strong className="text-blue-600">ringId</strong>: integer (FK $\rightarrow$ rings)</li>
                <li><strong>level</strong>: integer (1, 2, 3)</li>
                <li><strong>title</strong>: text</li>
                <li><strong>order</strong>: integer</li>
                <li><strong>xpReward</strong>: integer</li>
                <li><strong>isUnitReview</strong>: boolean</li>
              </ul>
            </div>

            {/* Challenges */}
            <div className="rounded-2xl border-2 border-duo-gray-border p-4 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-black text-sm text-duo-purple">challenges</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">TABLE</span>
              </div>
              <ul className="text-xs space-y-1 font-mono text-gray-600">
                <li><strong className="text-amber-600">id</strong>: serial (PK)</li>
                <li><strong className="text-blue-600">lessonId</strong>: integer (FK $\rightarrow$ lessons)</li>
                <li><strong>type</strong>: challenge_type enum</li>
                <li><strong>question</strong>: text</li>
                <li><strong>prompt</strong>: text</li>
                <li><strong>order</strong>: integer</li>
                <li><strong>audioSrc</strong>: text</li>
                <li><strong>audioText</strong>: text</li>
              </ul>
            </div>

            {/* User Progress */}
            <div className="rounded-2xl border-2 border-duo-gray-border p-4 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-black text-sm text-teal-600">user_progress</span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">TABLE</span>
              </div>
              <ul className="text-xs space-y-1 font-mono text-gray-600">
                <li><strong className="text-amber-600">userId</strong>: text (PK)</li>
                <li><strong>userName</strong>: text</li>
                <li><strong className="text-blue-600">activeCourseId</strong>: integer (FK $\rightarrow$ courses)</li>
                <li><strong>hearts</strong>: integer (5)</li>
                <li><strong>points</strong>: integer (XP)</li>
                <li><strong>streak</strong>: integer</li>
                <li><strong>gems</strong>: integer</li>
                <li><strong>hasActiveSubscription</strong>: boolean</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: PostgreSQL DDL */}
        {activeTab === "sql" && (
          <div className="mt-6">
            <pre className="max-h-[500px] overflow-auto rounded-2xl bg-[#0f172a] p-5 font-mono text-xs text-sky-300 leading-relaxed">
              <code>{`-- 1. Create Challenge Type Enum
CREATE TYPE "challenge_type" AS ENUM ('SELECT', 'ASSIST', 'TRANSLATE', 'MATCH', 'LISTEN');

-- 2. Languages & Courses
CREATE TABLE "languages" (
  "id" varchar(10) PRIMARY KEY,
  "name" text NOT NULL,
  "native_name" text NOT NULL,
  "flag_emoji" text NOT NULL,
  "is_supported" boolean DEFAULT true NOT NULL
);

CREATE TABLE "courses" (
  "id" serial PRIMARY KEY,
  "title" varchar(100) NOT NULL,
  "source_language_id" varchar(10) NOT NULL REFERENCES "languages"("id") ON DELETE CASCADE,
  "target_language_id" varchar(10) NOT NULL REFERENCES "languages"("id") ON DELETE CASCADE,
  "image_src" text DEFAULT '/mascot.svg' NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Sections, Units, Rings & Lessons
CREATE TABLE "sections" (
  "id" serial PRIMARY KEY,
  "course_id" integer NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "order" integer NOT NULL,
  "color" text DEFAULT '#58cc02' NOT NULL,
  "icon" text DEFAULT 'compass' NOT NULL
);

CREATE TABLE "units" (
  "id" serial PRIMARY KEY,
  "section_id" integer REFERENCES "sections"("id") ON DELETE CASCADE,
  "course_id" integer NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "order" integer NOT NULL,
  "color" text DEFAULT '#58cc02' NOT NULL,
  "guidebook" text
);

CREATE TABLE "rings" (
  "id" serial PRIMARY KEY,
  "unit_id" integer NOT NULL REFERENCES "units"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text,
  "order" integer NOT NULL,
  "total_levels" integer DEFAULT 3 NOT NULL,
  "is_unit_review" boolean DEFAULT false NOT NULL,
  "icon" text DEFAULT 'star' NOT NULL
);

CREATE TABLE "lessons" (
  "id" serial PRIMARY KEY,
  "unit_id" integer NOT NULL REFERENCES "units"("id") ON DELETE CASCADE,
  "ring_id" integer REFERENCES "rings"("id") ON DELETE CASCADE,
  "level" integer DEFAULT 1 NOT NULL,
  "title" text NOT NULL,
  "order" integer NOT NULL,
  "xp_reward" integer DEFAULT 15 NOT NULL,
  "is_unit_review" boolean DEFAULT false NOT NULL
);

-- 4. Challenges & Options
CREATE TABLE "challenges" (
  "id" serial PRIMARY KEY,
  "lesson_id" integer NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
  "type" "challenge_type" NOT NULL,
  "question" text NOT NULL,
  "prompt" text,
  "order" integer NOT NULL,
  "audio_src" text,
  "audio_text" text
);

CREATE TABLE "challenge_options" (
  "id" serial PRIMARY KEY,
  "challenge_id" integer NOT NULL REFERENCES "challenges"("id") ON DELETE CASCADE,
  "text" text NOT NULL,
  "correct" boolean DEFAULT false NOT NULL,
  "image_src" text,
  "audio_src" text,
  "order" integer DEFAULT 0,
  "pair_matching_key" text
);

-- 5. User Progress & Gamification
CREATE TABLE "user_progress" (
  "user_id" text PRIMARY KEY,
  "user_name" text DEFAULT 'Euskaldun' NOT NULL,
  "user_image_src" text DEFAULT '/mascot.svg' NOT NULL,
  "active_course_id" integer REFERENCES "courses"("id") ON DELETE SET NULL,
  "hearts" integer DEFAULT 5 NOT NULL,
  "points" integer DEFAULT 0 NOT NULL,
  "streak" integer DEFAULT 0 NOT NULL,
  "last_active_date" timestamp with time zone DEFAULT now() NOT NULL,
  "gems" integer DEFAULT 100 NOT NULL,
  "has_active_subscription" boolean DEFAULT false NOT NULL
);`}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
