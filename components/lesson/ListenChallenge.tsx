"use client";

import { useEffect } from "react";
import { Volume2, Snail } from "lucide-react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

interface OptionItem {
  id: number;
  text: string;
  correct: boolean;
  order?: number;
}

interface ListenChallengeProps {
  question: string;
  audioText: string;
  grammarTip?: string;
  options: OptionItem[];
  selectedOptionId: number | null;
  onSelectOption: (id: number) => void;
  status: "idle" | "correct" | "wrong";
}

export function ListenChallenge({
  question,
  audioText,
  grammarTip,
  options,
  selectedOptionId,
  onSelectOption,
  status,
}: ListenChallengeProps) {
  // Auto-play audio on mount
  useEffect(() => {
    if (audioText) {
      sound.speak(audioText);
    }
  }, [audioText]);

  // Listen for keyboard shortcuts (1, 2, 3, 4 and first-letter typing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== "idle") return;

      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= options.length) {
        sound.playClick();
        onSelectOption(options[keyNum - 1].id);
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const char = e.key.toLowerCase();
        const match = options.find((opt) =>
          opt.text.toLowerCase().trim().startsWith(char)
        );
        if (match) {
          sound.playClick();
          onSelectOption(match.id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options, onSelectOption, status]);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center">
      <h2 className="text-2xl md:text-3xl font-black text-[#3c3c3c] text-center dark:text-white">
        {question}
      </h2>

      {/* Mascot and Audio Bubble */}
      <div className="mt-8 flex items-center gap-4 w-full justify-center max-w-lg">
        {/* Mascot (Little Euskara Bird) */}
        <div className="h-24 w-24 md:h-28 md:w-28 shrink-0 relative">
          <img
            src="/mascot.svg"
            alt="Hitzak Bird"
            className="h-full w-full object-contain"
          />
        </div>

        {/* Speech Bubble containing audio controls */}
        <div className="relative flex-1 flex items-center justify-center gap-4 rounded-2xl border-2 border-duo-gray-border bg-white p-5 shadow-sm dark:border-[#37464f] dark:bg-[#182c34]">
          {/* Left triangle pointer for speech bubble */}
          <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-duo-gray-border dark:border-r-[#37464f]">
            <div className="absolute -top-[8px] left-[2px] w-0 h-0 border-y-[8px] border-y-transparent border-r-[8px] border-r-white dark:border-r-[#182c34]" />
          </div>

          {/* Normal Speed Speaker */}
          <button
            onClick={() => sound.speak(audioText, false)}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-duo-blue text-white shadow-3d-blue transition-transform hover:scale-105 active:translate-y-0.5 active:shadow-[0_1px_0_#1899d6]"
            title="Play normal speed"
          >
            <Volume2 className="h-8 w-8" />
          </button>

          {/* Slow Speed Turtle/Snail */}
          <button
            onClick={() => sound.speak(audioText, true)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#84d8ff] text-white shadow-[0_3px_0_#58b5e6] transition-transform hover:scale-105 active:translate-y-0.5 active:shadow-[0_1px_0_#58b5e6]"
            title="Play slow speed"
          >
            <Snail className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Options List Stack */}
      <div className="mt-10 flex flex-col gap-3 w-full max-w-xl">
        {options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = isSelected && status === "correct";
          const isWrong = isSelected && status === "wrong";

          return (
            <button
              key={option.id}
              onClick={() => {
                if (status === "idle") {
                  sound.playClick();
                  onSelectOption(option.id);
                }
              }}
              disabled={status !== "idle"}
              className={cn(
                "group relative flex flex-row items-center justify-center rounded-2xl border-2 py-2.5 px-4 min-h-[48px] font-black text-sm md:text-base transition-all",
                !isSelected && "border-duo-gray-border bg-white text-[#4b4b4b] shadow-3d-gray hover:bg-gray-50 active:translate-y-0.5 active:shadow-[0_1px_0_#afafaf] dark:border-[#37464f] dark:bg-[#182c34] dark:text-[#f7f7f7] dark:hover:bg-[#203a45]",
                isSelected && status === "idle" && "border-[#84d8ff] bg-[#ddf4ff] text-[#1899d6] shadow-3d-blue dark:border-[#1899d6] dark:bg-[#1899d6]/20 dark:text-[#1cb0f6]",
                isCorrect && "border-duo-green bg-duo-green-light text-duo-green-dark shadow-3d-green dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300",
                isWrong && "border-duo-red bg-duo-red-light text-duo-red-dark shadow-3d-red dark:border-red-500 dark:bg-red-950/60 dark:text-red-300"
              )}
            >
              <span>{option.text}</span>

              {/* Number key shortcut badge */}
              <span className="absolute left-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs font-bold text-gray-400 dark:border-[#37464f] dark:bg-[#131f24] dark:text-gray-400">
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
