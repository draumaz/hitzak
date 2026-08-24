"use client";

import { useState, useEffect } from "react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

interface MatchOption {
  id: number;
  text: string;
  pairMatchingKey?: string;
}

interface MatchChallengeProps {
  question: string;
  options: MatchOption[];
  onAllMatched: () => void;
  status: "idle" | "correct" | "wrong";
}

export function MatchChallenge({
  question,
  options,
  onAllMatched,
  status,
}: MatchChallengeProps) {
  const [shuffledEnglishOptions, setShuffledEnglishOptions] = useState<MatchOption[]>([]);
  const [shuffledBasqueOptions, setShuffledBasqueOptions] = useState<MatchOption[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [mismatchIds, setMismatchIds] = useState<Set<number>>(new Set());

  // Split into English (left) and Basque (right), then shuffle each column independently
  useEffect(() => {
    const pairMap = new Map<string, MatchOption[]>();
    options.forEach((opt) => {
      const key = opt.pairMatchingKey || `default_${opt.id}`;
      if (!pairMap.has(key)) {
        pairMap.set(key, []);
      }
      pairMap.get(key)!.push(opt);
    });

    const basqueList: MatchOption[] = [];
    const englishList: MatchOption[] = [];

    pairMap.forEach((pair) => {
      if (pair.length >= 2) {
        // First item is Basque, second item is English in the seed data
        basqueList.push(pair[0]);
        englishList.push(pair[1]);
      } else if (pair.length === 1) {
        basqueList.push(pair[0]);
      }
    });

    setShuffledEnglishOptions([...englishList].sort(() => Math.random() - 0.5));
    setShuffledBasqueOptions([...basqueList].sort(() => Math.random() - 0.5));
    setMatchedIds(new Set());
    setSelectedId(null);
    setMismatchIds(new Set());
  }, [options]);

  const handleTileClick = (option: MatchOption) => {
    if (matchedIds.has(option.id) || mismatchIds.size > 0 || status !== "idle") return;

    sound.playClick();

    if (selectedId === null) {
      // First selection
      setSelectedId(option.id);
      return;
    }

    if (selectedId === option.id) {
      // Deselect
      setSelectedId(null);
      return;
    }

    // Second selection: check match
    const firstOption = options.find((o) => o.id === selectedId);
    if (!firstOption) return;

    if (
      firstOption.pairMatchingKey &&
      firstOption.pairMatchingKey === option.pairMatchingKey
    ) {
      // Match found!
      sound.playMatch();
      const nextMatched = new Set(matchedIds);
      nextMatched.add(firstOption.id);
      nextMatched.add(option.id);
      setMatchedIds(nextMatched);
      setSelectedId(null);

      // If all matched
      if (nextMatched.size >= options.length) {
        onAllMatched();
      }
    } else {
      // Mismatch
      sound.playIncorrect();
      setMismatchIds(new Set([firstOption.id, option.id]));
      setTimeout(() => {
        setMismatchIds(new Set());
        setSelectedId(null);
      }, 700);
    }
  };

  // Listen for keyboard shortcuts (1-4 for English, 5-8 for Basque)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== "idle" || mismatchIds.size > 0) return;

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
      if (keyNum >= 1 && keyNum <= 4) {
        // Left Column (English)
        const option = shuffledEnglishOptions[keyNum - 1];
        if (option && !matchedIds.has(option.id)) {
          handleTileClick(option);
        }
      } else if (keyNum >= 5 && keyNum <= 8) {
        // Right Column (Basque)
        const option = shuffledBasqueOptions[keyNum - 5];
        if (option && !matchedIds.has(option.id)) {
          handleTileClick(option);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shuffledEnglishOptions, shuffledBasqueOptions, matchedIds, mismatchIds, status]);

  const renderTile = (option: MatchOption, idx: number, isRight: boolean) => {
    const isMatched = matchedIds.has(option.id);
    const isSelected = selectedId === option.id;
    const isMismatch = mismatchIds.has(option.id);
    const badgeNum = isRight ? idx + 5 : idx + 1;

    return (
      <button
        key={option.id}
        onClick={() => handleTileClick(option)}
        disabled={isMatched || isMismatch}
        className={cn(
          "group relative flex min-h-[48px] w-full items-center justify-center rounded-2xl border-2 py-2.5 px-4 pl-10 text-center font-black text-sm md:text-base transition-all select-none",
          // Normal
          !isSelected &&
            !isMatched &&
            !isMismatch &&
            "border-duo-gray-border bg-white text-[#4b4b4b] shadow-3d-gray hover:bg-gray-50 active:translate-y-0.5 active:shadow-[0_1px_0_#afafaf] dark:border-[#37464f] dark:bg-[#182c34] dark:text-[#f7f7f7] dark:hover:bg-[#203a45]",
          // Selected
          isSelected &&
            !isMismatch &&
            "border-[#84d8ff] bg-[#ddf4ff] text-[#1899d6] shadow-3d-blue dark:border-[#1899d6] dark:bg-[#1899d6]/20 dark:text-[#1cb0f6]",
          // Mismatched
          isMismatch &&
            "border-duo-red bg-duo-red-light text-duo-red-dark shadow-3d-red animate-wiggle dark:border-red-500 dark:bg-red-950/60 dark:text-red-300",
          // Matched (Disabled)
          isMatched &&
            "border-transparent bg-gray-100/70 text-gray-400 shadow-none cursor-default dark:bg-[#182c34]/30 dark:text-gray-600"
        )}
      >
        <span className="text-center w-full">{option.text}</span>

        {/* Number key shortcut badge */}
        {!isMatched && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-[10px] font-bold text-gray-400 dark:border-[#37464f] dark:bg-[#131f24] dark:text-gray-400 animate-in fade-in zoom-in duration-100">
            {badgeNum}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex w-full max-w-lg flex-col items-center">
      <h2 className="text-2xl md:text-3xl font-black text-[#3c3c3c] text-center dark:text-white mb-4">
        Select the matching pairs
      </h2>

      {/* Grid of Match Tiles: English (Left) vs Basque (Right) */}
      <div className="mt-8 grid w-full grid-cols-2 gap-4">
        {/* Left Column: English Words */}
        <div className="flex flex-col gap-3">
          {shuffledEnglishOptions.map((opt, idx) => renderTile(opt, idx, false))}
        </div>

        {/* Right Column: Basque Words */}
        <div className="flex flex-col gap-3">
          {shuffledBasqueOptions.map((opt, idx) => renderTile(opt, idx, true))}
        </div>
      </div>
    </div>
  );
}
