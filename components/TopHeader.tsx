"use client";

import Image from "next/image";
import { Flame, Zap } from "lucide-react";
import { sound } from "@/lib/sound";

interface TopHeaderProps {
  hearts?: number;
  streak: number;
  points: number;
  gems?: number;
  onRefresh?: () => void;
}

export function TopHeader({
  streak,
  points,
}: TopHeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b-2 border-duo-gray-border bg-white px-4 md:px-8 transition-colors duration-200 dark:border-[#37464f] dark:bg-[#131f24]">
        {/* Left: Active Course */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border-2 border-duo-gray-border px-3 py-1.5 hover:bg-gray-50 transition cursor-pointer dark:border-[#37464f] dark:hover:bg-[#182c34]">
            <div className="relative h-6 w-8 overflow-hidden rounded shadow-sm">
              <Image
                src="/ikurrina.svg"
                alt="Basque Flag (Ikurriña)"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right: Educational Stats */}
        <div className="flex items-center gap-3 md:gap-5 font-black text-sm">
          {/* Streak Flame */}
          <div
            onClick={() => sound.playClick()}
            className="flex items-center gap-1.5 text-duo-orange hover:bg-orange-50 dark:hover:bg-orange-950/30 px-2 py-1 rounded-xl transition cursor-pointer"
            title={`${streak} day streak!`}
          >
            <Flame className="h-5 w-5 fill-duo-orange text-duo-orange" />
            <span>{streak}</span>
          </div>

          {/* Total XP */}
          <div
            onClick={() => sound.playClick()}
            className="flex items-center gap-1.5 text-duo-yellow-dark dark:text-duo-yellow hover:bg-yellow-50 dark:hover:bg-yellow-950/30 px-2 py-1 rounded-xl transition cursor-pointer"
            title={`${points} Total XP`}
          >
            <Zap className="h-5 w-5 fill-duo-yellow text-duo-yellow" />
            <span>{points} XP</span>
          </div>
        </div>
      </header>
    </>
  );
}
