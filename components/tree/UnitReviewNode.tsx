"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Lock, Star, Play, Gift, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";

interface UnitReviewNodeProps {
  unitId: number;
  unitOrder: number;
  unitTitle: string;
  isUnlocked: boolean;
  isMastered: boolean;
  lessonId: number;
  xpReward?: number;
  unitColor: string;
}

export function UnitReviewNode({
  unitId,
  unitOrder,
  unitTitle,
  isUnlocked,
  isMastered,
  lessonId,
  xpReward = 30,
  unitColor,
}: UnitReviewNodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    if (!isUnlocked) {
      sound.playIncorrect();
    } else {
      sound.playClick();
      setShowTooltip(!showTooltip);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center mt-6"
      style={{ zIndex: showTooltip ? 150 : undefined }}
    >
      {/* 3D Trophy / Review Node Button */}
      <div className="relative">
        {/* Pulsing ring if unlocked and not yet mastered */}
        {isUnlocked && !isMastered && (
          <div
            className="absolute -inset-3 rounded-3xl border-4 border-dashed animate-spin opacity-70"
            style={{ borderColor: "#ffc800", animationDuration: "14s" }}
          />
        )}

        <button
          onClick={handleClick}
          disabled={!isUnlocked}
          data-active-lesson-id={lessonId}
          className={cn(
            "relative flex h-20 w-24 items-center justify-center rounded-3xl transition-all duration-100",
            !isUnlocked && "bg-[#e5e5e5] text-[#afafaf] shadow-[0_6px_0_#cecece] cursor-not-allowed",
            isUnlocked &&
              !isMastered &&
              "bg-gradient-to-b from-yellow-400 to-yellow-500 text-white shadow-[0_6px_0_#d99b00] active:translate-y-1 active:shadow-[0_2px_0_#d99b00]",
            isMastered &&
              "bg-gradient-to-b from-amber-400 to-yellow-500 text-white shadow-[0_6px_0_#b88200] active:translate-y-1 active:shadow-[0_2px_0_#b88200]"
          )}
        >
          {!isUnlocked ? (
            <Lock className="h-8 w-8 stroke-[2.5]" />
          ) : isMastered ? (
            <Trophy className="h-10 w-10 fill-white stroke-[2]" />
          ) : (
            <Trophy className="h-10 w-10 fill-white stroke-[2]" />
          )}

          {/* Mastered Star Check */}
          {isMastered && (
            <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md border-2 border-yellow-400">
              <CheckCircle2 className="h-4 w-4 text-yellow-600" />
            </div>
          )}
        </button>
      </div>

      {/* Label */}
      <span className="mt-2 text-xs font-black uppercase tracking-wider text-[#777777] dark:text-[#afafaf]">
        {isMastered ? `Unit ${unitOrder} Mastered` : `Unit ${unitOrder} Review`}
      </span>

      {/* Interactive Tooltip Popover */}
      {showTooltip && isUnlocked && (
        <div className="absolute bottom-28 z-30 flex w-72 flex-col items-center animate-in zoom-in-95 fade-in duration-150">
          <div className="relative w-full rounded-3xl border-2 border-duo-gray-border bg-white p-5 shadow-2xl text-center dark:border-[#37464f] dark:bg-[#182c34]">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-yellow-950">
                {isMastered ? "🏆 Unit Mastered" : "Unit Review Challenge"}
              </span>
            </div>

            <h4 className="font-black text-base text-[#3c3c3c] dark:text-white">
              {isMastered ? `Unit ${unitOrder} Review` : `Master Unit ${unitOrder}!`}
            </h4>
            <p className="mt-1 text-xs text-[#777777] dark:text-[#afafaf] font-medium leading-relaxed">
              {isMastered
                ? "Review all grammar concepts and vocabulary from this unit to sharpen your skills."
                : "Prove your knowledge across all rings in this unit to unlock the next unit!"}
            </p>

            <p className="mt-2 text-xs font-bold text-duo-yellow-dark dark:text-duo-yellow">
              {isMastered ? "Practice • +10 XP" : `Complete Review • +${xpReward} XP`}
            </p>

            <Link
              href={`/lesson/${lessonId}`}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 py-3 text-xs font-black uppercase tracking-wider text-yellow-950 shadow-[0_4px_0_#d99b00] transition hover:brightness-105 active:translate-y-1"
            >
              <Play className="h-4 w-4 fill-yellow-950" />
              <span>{isMastered ? "Review Practice" : "Start Unit Review"}</span>
            </Link>

            {/* Downward triangle pointer */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 border-b-2 border-r-2 border-duo-gray-border bg-white dark:border-[#37464f] dark:bg-[#182c34]" />
          </div>
        </div>
      )}
    </div>
  );
}
