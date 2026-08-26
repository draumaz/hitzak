"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, Gift } from "lucide-react";
import { SkillRingNode } from "./SkillRingNode";
import { UnitReviewNode } from "./UnitReviewNode";
import { GuidebookModal } from "./GuidebookModal";

interface RingData {
  id: number;
  unitId: number;
  title: string;
  description?: string;
  order: number;
  totalLevels: number;
  completedLevels: number;
  isMastered: boolean;
  isUnitReview: boolean;
  icon?: string;
  nextLessonId: number;
  nextLessonLevel: number;
  lessons: Array<{
    id: number;
    title: string;
    level: number;
    order: number;
    xpReward: number;
    isCompleted: boolean;
  }>;
}

interface UnitSectionProps {
  unit: {
    id: number;
    title: string;
    description: string;
    order: number;
    color: string;
    guidebook?: string;
    isCompleted?: boolean;
    isReviewUnlocked?: boolean;
    isUnlocked?: boolean;
    rings?: RingData[];
    lessons?: Array<{
      id: number;
      title: string;
      order: number;
      xpReward: number;
      isCompleted: boolean;
    }>;
  };
  unitIndex: number;
  focusedRingId?: string | number | null;
}

export function UnitSection({ unit, unitIndex, focusedRingId }: UnitSectionProps) {
  const [isGuidebookOpen, setIsGuidebookOpen] = useState(false);
  const cleanTitle = unit.title.replace(/^Unit\s+\d+\s*:\s*/i, "");

  const unitRings = unit.rings || [];
  const standardRings = unitRings.filter((r) => !r.isUnitReview);
  const reviewRing = unitRings.find((r) => r.isUnitReview);

  // Active ring determination
  const activeRingIndex = standardRings.findIndex((r) => !r.isMastered);
  const isUnitMastered = !!unit.isCompleted || (reviewRing ? reviewRing.isMastered : false);

  // Serpentine offset pattern for standard rings: Center -> Left -> Center -> Right -> Center
  const offsets = [
    "translate-x-0",
    "-translate-x-12 md:-translate-x-16",
    "-translate-x-6 md:-translate-x-8",
    "translate-x-6 md:translate-x-8",
    "translate-x-12 md:translate-x-16",
  ];

  return (
    <section className="mb-14 w-full max-w-xl mx-auto">
      {/* Unit Header Banner */}
      <div
        className="relative flex flex-col justify-between rounded-3xl p-6 text-white shadow-md transition-transform"
        style={{ backgroundColor: unit.color }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-white/80">
                Unit {unit.order}
              </span>
              {isUnitMastered && (
                <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  <CheckCircle2 className="h-3 w-3" /> Mastered
                </span>
              )}
            </div>
            <h2 className="mt-1 text-xl font-extrabold md:text-2xl">{cleanTitle}</h2>
          </div>

          {/* Guidebook Trigger */}
          {unit.guidebook && (
            <button
              onClick={() => setIsGuidebookOpen(true)}
              className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-white/40 bg-white/20 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-white/30 active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Guidebook</span>
            </button>
          )}
        </div>
      </div>

      {/* Sequential Skill Rings Learning Path */}
      <div className="mt-10 flex flex-col items-center gap-8 py-4">
        {standardRings.map((ring, idx) => {
          const isMastered = ring.isMastered;
          const isActive =
            (unit.isUnlocked ?? true) &&
            ((activeRingIndex !== -1 && idx === activeRingIndex) ||
              (activeRingIndex === -1 && idx === 0 && unitIndex === 0));

          // A ring is locked if previous rings haven't been completed, or if the unit is locked
          const isLocked =
            !(unit.isUnlocked ?? true) ||
            (idx > 0 && standardRings[idx - 1].completedLevels < standardRings[idx - 1].totalLevels);

          const offsetClass = offsets[idx % offsets.length];

          return (
            <SkillRingNode
              key={ring.id}
              id={ring.id}
              title={ring.title}
              description={ring.description}
              order={ring.order}
              totalLevels={ring.totalLevels}
              completedLevels={ring.completedLevels}
              isMastered={isMastered}
              isActive={isActive}
              isLocked={isLocked}
              color={unit.color}
              offsetClass={offsetClass}
              nextLessonId={ring.nextLessonId}
              nextLessonLevel={ring.nextLessonLevel}
              icon={ring.icon}
              isFocused={focusedRingId === ring.id || focusedRingId === String(ring.id)}
            />
          );
        })}

        {/* Unit Review Milestone Node */}
        {reviewRing && (
          <UnitReviewNode
            unitId={unit.id}
            unitOrder={unit.order}
            unitTitle={cleanTitle}
            isUnlocked={unit.isReviewUnlocked ?? true}
            isMastered={reviewRing.isMastered}
            lessonId={reviewRing.nextLessonId}
            xpReward={reviewRing.lessons[0]?.xpReward || 30}
            unitColor={unit.color}
            isFocused={
              focusedRingId === `review-${unit.id}` ||
              focusedRingId === String(reviewRing.nextLessonId)
            }
          />
        )}
      </div>

      {/* Guidebook Modal */}
      {unit.guidebook && (
        <GuidebookModal
          isOpen={isGuidebookOpen}
          onClose={() => setIsGuidebookOpen(false)}
          title={cleanTitle}
          guidebookText={unit.guidebook}
          unitColor={unit.color}
        />
      )}
    </section>
  );
}
