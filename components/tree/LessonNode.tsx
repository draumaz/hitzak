"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Star, Check, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";

interface LessonNodeProps {
  id: number;
  title: string;
  order: number;
  xpReward: number;
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
  color: string;
  offsetClass?: string; // For zig-zag snake path positioning
}

export function LessonNode({
  id,
  title,
  order,
  xpReward,
  isCompleted,
  isActive,
  isLocked,
  color,
  offsetClass = "translate-x-0",
}: LessonNodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    if (isLocked) {
      sound.playIncorrect();
    } else {
      sound.playClick();
      setShowTooltip(!showTooltip);
    }
  };

  return (
    <div className={cn("relative flex flex-col items-center", offsetClass)}>
      {/* 3D Circular Node Button */}
      <div className="relative">
        {/* Active Ring Animation */}
        {isActive && !isCompleted && (
          <div
            className="absolute -inset-3 rounded-full border-4 border-dashed border-duo-green animate-spin"
            style={{ animationDuration: "12s" }}
          />
        )}

        <button
          onClick={handleClick}
          disabled={isLocked}
          className={cn(
            "relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-100",
            isLocked && "bg-[#e5e5e5] text-[#afafaf] shadow-[0_6px_0_#cecece] cursor-not-allowed",
            isCompleted &&
              "bg-[#ffc800] text-white shadow-[0_6px_0_#e5a400] active:translate-y-1 active:shadow-[0_2px_0_#e5a400]",
            isActive &&
              !isCompleted &&
              "bg-duo-green text-white shadow-[0_6px_0_#46a302] animate-bounceShort active:translate-y-1 active:shadow-[0_2px_0_#46a302]"
          )}
          style={{
            backgroundColor: isCompleted ? "#ffc800" : isActive ? color : undefined,
          }}
        >
          {isCompleted ? (
            <Check className="h-9 w-9 stroke-[3.5]" />
          ) : isLocked ? (
            <Lock className="h-8 w-8 stroke-[2.5]" />
          ) : (
            <Crown className="h-9 w-9 fill-white stroke-[2.5]" />
          )}

          {/* Golden Crown badge if completed */}
          {isCompleted && (
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm border border-yellow-300">
              <Star className="h-3.5 w-3.5 fill-duo-yellow text-duo-yellow" />
            </div>
          )}
        </button>
      </div>

      {/* Tooltip / Popover for Starting the Lesson */}
      {showTooltip && !isLocked && (
        <div className="absolute bottom-24 z-30 flex w-64 flex-col items-center animate-in zoom-in-95 fade-in duration-150">
          <div className="relative w-full rounded-2xl border-2 border-duo-gray-border bg-white p-4 shadow-xl text-center">
            <h4 className="font-extrabold text-base text-[#3c3c3c]">{title}</h4>
            <p className="mt-1 text-xs font-bold text-[#777777]">
              {isCompleted ? "Practice & earn +5 XP" : `Lesson ${order} • +${xpReward} XP`}
            </p>

            <Link
              href={`/lesson/${id}`}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-duo-green py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-3d-green transition hover:brightness-105 active:translate-y-1 active:shadow-3d-green-pressed"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>{isCompleted ? "Practice" : "Start"}</span>
            </Link>

            {/* Downward triangle pointer */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 border-b-2 border-r-2 border-duo-gray-border bg-white" />
          </div>
        </div>
      )}
    </div>
  );
}
