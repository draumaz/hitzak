"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Crown,
  Star,
  Check,
  Lock,
  Play,
  Sparkles,
  Zap,
  BookOpen,
  HelpCircle,
  Hash,
  Shield,
  Layers,
  ShoppingBag,
  Award,
  Crosshair,
  Key,
  Heart,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";

interface SkillRingNodeProps {
  id: number;
  title: string;
  description?: string;
  order: number;
  totalLevels: number;
  completedLevels: number;
  isMastered: boolean;
  isActive: boolean;
  isLocked: boolean;
  color: string;
  offsetClass?: string;
  nextLessonId: number;
  nextLessonLevel: number;
  icon?: string;
}

const ICON_MAP: Record<string, any> = {
  sparkles: Sparkles,
  star: Star,
  crown: Crown,
  zap: Zap,
  book: BookOpen,
  hash: Hash,
  shield: Shield,
  layers: Layers,
  "shopping-bag": ShoppingBag,
  award: Award,
  crosshair: Crosshair,
  key: Key,
  heart: Heart,
  smile: Smile,
};

export function SkillRingNode({
  id,
  title,
  description,
  order,
  totalLevels = 5,
  completedLevels = 0,
  isMastered = false,
  isActive = false,
  isLocked = false,
  color,
  offsetClass = "translate-x-0",
  nextLessonId,
  nextLessonLevel = 1,
  icon = "star",
}: SkillRingNodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    if (isLocked) {
      sound.playIncorrect();
    } else {
      sound.playClick();
      setShowTooltip(!showTooltip);
    }
  };

  const IconComp = isMastered
    ? Crown
    : ICON_MAP[icon] || Star;

  // Circular progress calculations for the SVG ring
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, completedLevels / totalLevels);
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className={cn("relative flex flex-col items-center", offsetClass)}>
      {/* 3D Circular Skill Ring Container */}
      <div className="relative flex items-center justify-center">
        {/* SVG Progress Ring */}
        {!isLocked && (
          <svg className="absolute -inset-2.5 h-[92px] w-[92px] -rotate-90 pointer-events-none z-10">
            {/* Background Track */}
            <circle
              cx="46"
              cy="46"
              r={radius}
              stroke="#e5e5e5"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="46"
              cy="46"
              r={radius}
              stroke={isMastered ? "#ffc800" : color}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>
        )}

        {/* Active Ring Animation */}
        {isActive && !isMastered && (
          <div
            className="absolute -inset-4 rounded-full border-2 border-dashed animate-spin pointer-events-none opacity-60"
            style={{ borderColor: color, animationDuration: "12s" }}
          />
        )}

        {/* Main 3D Skill Button */}
        <button
          onClick={handleClick}
          disabled={isLocked}
          className={cn(
            "relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-100",
            isLocked && "bg-[#e5e5e5] text-[#afafaf] shadow-[0_6px_0_#cecece] cursor-not-allowed",
            isMastered &&
              "bg-[#ffc800] text-white shadow-[0_6px_0_#e5a400] active:translate-y-1 active:shadow-[0_2px_0_#e5a400]",
            !isLocked &&
              !isMastered &&
              "text-white shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.2)]"
          )}
          style={{
            backgroundColor: isLocked ? undefined : isMastered ? "#ffc800" : color,
          }}
        >
          {isLocked ? (
            <Lock className="h-8 w-8 stroke-[2.5]" />
          ) : isMastered ? (
            <Crown className="h-9 w-9 fill-white stroke-[2.5]" />
          ) : (
            <IconComp className="h-8 w-8 fill-white stroke-[2.5]" />
          )}

          {/* Level Crown Badge (e.g. "3/5" or Gold Star) */}
          {!isLocked && (
            <div
              className={cn(
                "absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black shadow-sm border",
                isMastered
                  ? "bg-white text-yellow-600 border-yellow-300 dark:bg-[#182c34] dark:text-yellow-400 dark:border-yellow-600"
                  : "bg-white text-[#4b4b4b] border-gray-200 dark:bg-[#182c34] dark:text-white dark:border-[#37464f]"
              )}
            >
              {isMastered ? (
                <Star className="h-3.5 w-3.5 fill-duo-yellow text-duo-yellow" />
              ) : (
                `${completedLevels}/${totalLevels}`
              )}
            </div>
          )}
        </button>
      </div>

      {/* Interactive Tooltip Popover */}
      {showTooltip && !isLocked && (
        <div className="absolute bottom-24 z-30 flex w-72 flex-col items-center animate-in zoom-in-95 fade-in duration-150">
          <div className="relative w-full rounded-3xl border-2 border-duo-gray-border bg-white p-5 shadow-2xl text-center dark:border-[#37464f] dark:bg-[#182c34]">
            {/* Crown / Level Status */}
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white"
                style={{ backgroundColor: isMastered ? "#ffc800" : color }}
              >
                {isMastered ? "👑 5/5 Crown Mastered" : `Step ${nextLessonLevel} of ${totalLevels}`}
              </span>
            </div>

            <h4 className="font-black text-base text-[#3c3c3c] dark:text-white">{title}</h4>
            {description && (
              <p className="mt-1 text-xs text-[#777777] dark:text-[#afafaf] font-medium leading-relaxed">
                {description}
              </p>
            )}

            {/* 5-Step Segment Progress Bar */}
            <div className="my-2.5 flex items-center justify-center gap-1.5">
              {Array.from({ length: totalLevels }).map((_, stepIdx) => (
                <div
                  key={stepIdx}
                  className={cn(
                    "h-2 w-5 rounded-full transition-all duration-300",
                    stepIdx < completedLevels
                      ? "bg-duo-green"
                      : stepIdx === completedLevels && !isMastered
                      ? "bg-duo-yellow ring-2 ring-duo-yellow/40"
                      : "bg-gray-200 dark:bg-[#37464f]"
                  )}
                  title={`Step ${stepIdx + 1}`}
                />
              ))}
            </div>

            <p className="mt-1 text-xs font-bold text-duo-yellow-dark dark:text-duo-yellow">
              {isMastered ? "Practice & earn +5 XP" : `Complete Step ${nextLessonLevel} • +${15 + (nextLessonLevel - 1) * 2} XP`}
            </p>

            <Link
              href={`/lesson/${nextLessonId}`}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:brightness-105 active:translate-y-1"
              style={{
                backgroundColor: isMastered ? "#ffc800" : color,
                boxShadow: isMastered ? "0 4px 0 #e5a400" : undefined,
              }}
            >
              <Play className="h-4 w-4 fill-white" />
              <span>{isMastered ? "Practice Crown" : `Start Step ${nextLessonLevel}`}</span>
            </Link>

            {/* Downward triangle pointer */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 border-b-2 border-r-2 border-duo-gray-border bg-white dark:border-[#37464f] dark:bg-[#182c34]" />
          </div>
        </div>
      )}
    </div>
  );
}
