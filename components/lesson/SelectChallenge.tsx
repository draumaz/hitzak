"use client";

import { useEffect } from "react";
import { Volume2 } from "lucide-react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { BASQUE_TO_ENGLISH, renderPromptWords } from "./TranslateChallenge";

interface SelectOption {
  id: number;
  text: string;
  correct: boolean;
  imageSrc?: string;
}

interface SelectChallengeProps {
  question: string;
  prompt?: string;
  audioText?: string;
  grammarTip?: string;
  options: SelectOption[];
  selectedOptionId: number | null;
  onSelectOption: (optionId: number) => void;
  status: "idle" | "correct" | "wrong";
}

export function SelectChallenge({
  question,
  prompt,
  audioText,
  grammarTip,
  options,
  selectedOptionId,
  onSelectOption,
  status,
}: SelectChallengeProps) {
  // Parse question to extract quoted prompt and clean the header question
  let displayQuestion = question;
  let displayPrompt = prompt;

  const quoteMatch = question.match(/(?:for|of)\s+["']([^"']+)["']/i);
  if (quoteMatch) {
    displayPrompt = quoteMatch[1];
    displayQuestion = question.replace(quoteMatch[0], "").replace(/:\s*$/, "").trim();
  }

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
      {/* Question Title */}
      <h2 className="text-2xl md:text-3xl font-black text-[#3c3c3c] text-center dark:text-white">
        {displayQuestion}
      </h2>

      {/* Optional Prompt with Audio & Mascot */}
      {(displayPrompt || audioText) && (
        <div className="mt-8 flex items-center gap-4 w-full justify-center max-w-lg">
          {/* Mascot (Little Euskara Bird) */}
          <div className="h-24 w-24 md:h-28 md:w-28 shrink-0 relative">
            <img
              src="/mascot.svg"
              alt="Hitzak Bird"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Speech Bubble */}
          <div className="relative flex-1 flex items-center gap-3 rounded-2xl border-2 border-duo-gray-border bg-white p-4 shadow-sm dark:border-[#37464f] dark:bg-[#182c34]">
            {/* Left triangle pointer for speech bubble */}
            <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-duo-gray-border dark:border-r-[#37464f]">
              <div className="absolute -top-[8px] left-[2px] w-0 h-0 border-y-[8px] border-y-transparent border-r-[8px] border-r-white dark:border-r-[#182c34]" />
            </div>


            {displayPrompt && (
              <span className="text-lg font-bold text-[#4b4b4b] dark:text-white leading-tight">
                {renderPromptWords(displayPrompt)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Options List Stack */}
      <div className="mt-8 flex flex-col gap-3 w-full max-w-xl">
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
              {/* Optional Emoji / Icon */}
              {option.imageSrc && (
                <span className="text-4xl mr-3 group-hover:scale-110 transition-transform">
                  {option.imageSrc}
                </span>
              )}

              <span className="text-lg">{option.text}</span>

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
