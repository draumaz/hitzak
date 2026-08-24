"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Heart, Sparkles, Keyboard } from "lucide-react";
import { SelectChallenge } from "./SelectChallenge";
import { TranslateChallenge } from "./TranslateChallenge";
import { MatchChallenge } from "./MatchChallenge";
import { ListenChallenge } from "./ListenChallenge";
import { ActionBanner } from "./ActionBanner";
import { LessonCompleteModal } from "./LessonCompleteModal";
import { sound } from "@/lib/sound";
import { calculateAccuracy } from "@/lib/utils";

interface ChallengeItem {
  id: number;
  lessonId: number;
  type: "SELECT" | "ASSIST" | "TRANSLATE" | "MATCH" | "LISTEN";
  question: string;
  prompt?: string;
  audioText?: string;
  grammarTip?: string;
  order: number;
  options: Array<{
    id: number;
    text: string;
    correct: boolean;
    imageSrc?: string;
    audioSrc?: string;
    order?: number;
    pairMatchingKey?: string;
  }>;
}

interface LessonPlayerProps {
  lesson: {
    id: number;
    title: string;
    xpReward: number;
    challenges: ChallengeItem[];
  };
  initialUserProgress: {
    hearts: number;
    hasActiveSubscription: boolean;
    streak: number;
  };
}

export function LessonPlayer({ lesson, initialUserProgress }: LessonPlayerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(initialUserProgress.hearts);
  const [hasActiveSubscription] = useState(initialUserProgress.hasActiveSubscription);
  const [streak, setStreak] = useState(initialUserProgress.streak);
  const [correctCount, setCorrectCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [isFinished, setIsFinished] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Exercise input states
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<any[]>([]);
  const [isKeyboardMode, setIsKeyboardMode] = useState(true);

  const currentChallenge = lesson.challenges[currentIndex];
  const totalChallenges = lesson.challenges.length;

  if (!currentChallenge && !isFinished) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="font-extrabold text-gray-500">Loading lesson exercises...</p>
      </div>
    );
  }

  // --- CHECK ANSWER LOGIC ---
  const handleCheckAnswer = async () => {
    if (!currentChallenge || status !== "idle") return;

    let isCorrect = false;

    if (currentChallenge.type === "SELECT" || currentChallenge.type === "LISTEN") {
      const selected = currentChallenge.options.find((o) => o.id === selectedOptionId);
      isCorrect = !!selected?.correct;
    } else if (currentChallenge.type === "TRANSLATE") {
      const correctOptions = currentChallenge.options
        .filter((o) => o.correct)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const constructedText = selectedTokens.map((t) => t.text).join(" ").trim();
      const expectedText = correctOptions.map((t) => t.text).join(" ").trim();

      isCorrect = constructedText.toLowerCase() === expectedText.toLowerCase();
    }

    if (isCorrect) {
      sound.playCorrect();
      setStatus("correct");
      setCorrectCount((prev) => prev + 1);
    } else {
      sound.playIncorrect();
      setStatus("wrong");

      // Deduct heart
      if (!hasActiveSubscription) {
        setHearts((prev) => Math.max(0, prev - 1));
        try {
          await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reduce_heart" }),
          });
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  // --- CONTINUE TO NEXT CHALLENGE ---
  const handleNextChallenge = async () => {
    if (currentIndex + 1 < totalChallenges) {
      setCurrentIndex((prev) => prev + 1);
      setStatus("idle");
      setSelectedOptionId(null);
      setSelectedTokens([]);
      setIsKeyboardMode(true);
    } else {
      // Completed full lesson!
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "complete_lesson",
            lessonId: lesson.id,
            xp: lesson.xpReward,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.streak) setStreak(data.streak);
        }
      } catch (e) {
        console.error(e);
      }
      setIsFinished(true);
    }
  };

  // Get correct answer text string for the error banner
  const getCorrectAnswerText = () => {
    if (!currentChallenge) return "";
    if (currentChallenge.type === "SELECT" || currentChallenge.type === "LISTEN") {
      const correctOpt = currentChallenge.options.find((o) => o.correct);
      return correctOpt?.text || "";
    }
    if (currentChallenge.type === "TRANSLATE") {
      return currentChallenge.options
        .filter((o) => o.correct)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((o) => o.text)
        .join(" ");
    }
    return "";
  };

  // Is check button enabled?
  const isCheckDisabled = () => {
    if (!currentChallenge) return true;
    if (currentChallenge.type === "SELECT" || currentChallenge.type === "LISTEN") {
      return selectedOptionId === null;
    }
    if (currentChallenge.type === "TRANSLATE") {
      return selectedTokens.length === 0;
    }
    return false;
  };

  // Keyboard shortcut: Enter to Check or Continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const activeEl = document.activeElement;
        
        if (
          activeEl &&
          (activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            (activeEl as HTMLElement).isContentEditable)
        ) {
          if (e.shiftKey) return; // Allow Shift+Enter for newline
          
          if (status === "idle") {
            if (!isCheckDisabled()) {
              e.preventDefault();
              handleCheckAnswer();
            }
          } else {
            e.preventDefault();
            handleNextChallenge();
          }
          return;
        }

        if (status === "idle") {
          if (!isCheckDisabled()) {
            e.preventDefault();
            handleCheckAnswer();
          }
        } else {
          e.preventDefault();
          handleNextChallenge();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, selectedOptionId, selectedTokens, currentChallenge]);

  const progressPercentage = ((currentIndex + (status === "correct" ? 1 : 0)) / totalChallenges) * 100;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white selection:bg-duo-green-light transition-colors duration-200 dark:bg-[#131f24] dark:text-[#f7f7f7]">
      {/* Top Bar: Quit Button, Progress Bar, Hearts */}
      <div className="mx-auto flex h-20 w-full max-w-5xl items-center justify-between gap-4 px-6 md:px-8">
        <button
          onClick={() => setIsExitModalOpen(true)}
          className="rounded-2xl p-2 text-gray-400 hover:bg-gray-100 transition dark:hover:bg-[#182c34]"
          title="Quit Lesson"
        >
          <X className="h-6 w-6 stroke-[3]" />
        </button>

        {/* Animated Progress Bar */}
        <div className="h-4 flex-1 rounded-full bg-gray-200 overflow-hidden dark:bg-[#182c34]">
          <div
            className="h-full bg-duo-green transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Hearts Indicator */}
        <div className="flex items-center gap-1.5 font-black text-sm text-duo-red">
          <Heart className="h-6 w-6 fill-duo-red" />
          <span>{hearts}</span>
        </div>
      </div>

      {/* Main Challenge Workspace */}
      <main className="flex flex-1 items-center justify-center px-4 pb-32 pt-6">
        {currentChallenge?.type === "SELECT" && (
          <SelectChallenge
            question={currentChallenge.question}
            prompt={currentChallenge.prompt}
            audioText={currentChallenge.audioText}
            grammarTip={currentChallenge.grammarTip}
            options={currentChallenge.options}
            selectedOptionId={selectedOptionId}
            onSelectOption={(id) => setSelectedOptionId(id)}
            status={status}
          />
        )}

        {currentChallenge?.type === "TRANSLATE" && (
          <TranslateChallenge
            question={currentChallenge.question}
            prompt={currentChallenge.prompt}
            audioText={currentChallenge.audioText}
            grammarTip={currentChallenge.grammarTip}
            options={currentChallenge.options}
            selectedTokens={selectedTokens}
            onSelectToken={(token) => setSelectedTokens((prev) => [...prev, token])}
            onRemoveToken={(token) =>
              setSelectedTokens((prev) => prev.filter((t) => t.id !== token.id))
            }
            setSelectedTokens={setSelectedTokens}
            isKeyboardMode={isKeyboardMode}
            status={status}
          />
        )}

        {currentChallenge?.type === "MATCH" && (
          <MatchChallenge
            question={currentChallenge.question}
            options={currentChallenge.options}
            onAllMatched={() => {
              sound.playCorrect();
              setStatus("correct");
              setCorrectCount((prev) => prev + 1);
            }}
            status={status}
          />
        )}

        {currentChallenge?.type === "LISTEN" && (
          <ListenChallenge
            question={currentChallenge.question}
            audioText={currentChallenge.audioText || "Kaixo"}
            grammarTip={currentChallenge.grammarTip}
            options={currentChallenge.options}
            selectedOptionId={selectedOptionId}
            onSelectOption={(id) => setSelectedOptionId(id)}
            status={status}
          />
        )}
      </main>

      {/* Bottom Action Feedback Banner */}
      <ActionBanner
        status={status}
        disabled={isCheckDisabled()}
        onCheck={handleCheckAnswer}
        onNext={handleNextChallenge}
        correctAnswerText={getCorrectAnswerText()}
        centerAction={
          status === "idle" && currentChallenge?.type === "TRANSLATE" ? (
            <button
              onClick={() => {
                sound.playClick();
                setIsKeyboardMode((prev) => !prev);
                setSelectedTokens([]);
              }}
              className="flex items-center gap-2 rounded-2xl px-5 py-2 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
              title={isKeyboardMode ? "Switch to Word Bank" : "Switch to Keyboard"}
            >
              {isKeyboardMode ? (
                <>
                  <Sparkles className="h-4 w-4 text-duo-blue" />
                  <span>Use Word Bank</span>
                </>
              ) : (
                <>
                  <Keyboard className="h-4 w-4 text-gray-400" />
                  <span>Use Keyboard</span>
                </>
              )}
            </button>
          ) : undefined
        }
      />

      {/* Exit Confirmation Modal */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border-2 border-duo-gray-border bg-white p-6 text-center shadow-2xl dark:border-[#37464f] dark:bg-[#182c34]">
            <h3 className="text-xl font-black text-[#3c3c3c] dark:text-white">Are you sure you want to quit?</h3>
            <p className="mt-2 text-sm text-[#777777] dark:text-[#afafaf]">
              All progress in this lesson will be lost.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => setIsExitModalOpen(false)}
                className="w-full rounded-2xl bg-duo-blue py-3 font-black text-sm uppercase tracking-wider text-white shadow-3d-blue active:translate-y-1"
              >
                Keep Learning
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full rounded-2xl border-2 border-duo-red bg-white py-3 font-black text-sm uppercase tracking-wider text-duo-red hover:bg-red-50 dark:bg-[#131f24] dark:hover:bg-red-950/20"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Complete Celebration Modal */}
      {isFinished && (
        <LessonCompleteModal
          xpEarned={lesson.xpReward}
          accuracy={calculateAccuracy(correctCount, totalChallenges)}
          streak={streak}
        />
      )}
    </div>
  );
}
