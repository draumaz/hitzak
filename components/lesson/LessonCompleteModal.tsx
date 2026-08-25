"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Zap, Target, Flame, Sparkles } from "lucide-react";
import { sound } from "@/lib/sound";

interface LessonCompleteModalProps {
  xpEarned: number;
  accuracy: number;
  streak: number;
}

export function LessonCompleteModal({
  xpEarned,
  accuracy,
  streak,
}: LessonCompleteModalProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        router.push("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  useEffect(() => {
    // Sound & Confetti trigger
    sound.playVictory();

    const end = Date.now() + 1.8 * 1000;
    const colors = ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative flex w-full max-w-lg flex-col items-center rounded-3xl border-2 border-duo-gray-border bg-white p-8 text-center shadow-2xl dark:border-[#37464f] dark:bg-[#182c34]">
        {/* Animated Mascot / Badge */}
        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-duo-yellow-light dark:bg-yellow-950/40">
          <Sparkles className="h-12 w-12 text-duo-yellow-dark dark:text-yellow-400 animate-pulseGlow" />
        </div>

        <h2 className="text-3xl font-black text-duo-yellow-dark dark:text-yellow-400">Lesson Complete!</h2>
        <p className="mt-1 text-sm font-black text-[#777777] dark:text-[#afafaf]">
          Zorionak! You are making great progress in Basque!
        </p>

        {/* Stats Grid */}
        <div className="mt-8 grid w-full grid-cols-3 gap-3">
          {/* XP Earned */}
          <div className="flex flex-col items-center rounded-2xl border-2 border-[#ffc800] bg-[#fff9db] p-3 text-[#996b00] dark:border-yellow-600/60 dark:bg-yellow-950/40 dark:text-yellow-300">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
              Total XP
            </span>
            <div className="mt-1 flex items-center gap-1">
              <Zap className="h-4 w-4 fill-duo-yellow text-duo-yellow" />
              <span className="text-lg font-black">+{xpEarned}</span>
            </div>
          </div>

          {/* Accuracy */}
          <div className="flex flex-col items-center rounded-2xl border-2 border-duo-green bg-duo-green-light p-3 text-duo-green-dark dark:border-emerald-600/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
              Accuracy
            </span>
            <div className="mt-1 flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span className="text-lg font-black">{accuracy}%</span>
            </div>
          </div>

          {/* Streak */}
          <div className="flex flex-col items-center rounded-2xl border-2 border-duo-orange bg-duo-orange-light p-3 text-duo-orange-dark dark:border-orange-600/60 dark:bg-orange-950/40 dark:text-orange-300">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
              Streak
            </span>
            <div className="mt-1 flex items-center gap-1">
              <Flame className="h-4 w-4 fill-duo-orange text-duo-orange" />
              <span className="text-lg font-black">{streak} Days</span>
            </div>
          </div>
        </div>

        {/* Continue to Learning Tree Button */}
        <Link
          href="/"
          className="mt-8 flex w-full items-center justify-center rounded-2xl bg-duo-green py-4 font-black text-sm uppercase tracking-wider text-white shadow-3d-green transition hover:brightness-105 active:translate-y-1 active:shadow-3d-green-pressed"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
