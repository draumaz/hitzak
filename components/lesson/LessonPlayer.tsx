"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Sparkles, Keyboard } from "lucide-react";
import { SelectChallenge } from "./SelectChallenge";
import { TranslateChallenge } from "./TranslateChallenge";
import { MatchChallenge } from "./MatchChallenge";
import { ActionBanner } from "./ActionBanner";
import { LessonCompleteModal } from "./LessonCompleteModal";
import { sound } from "@/lib/sound";
import { calculateAccuracy } from "@/lib/utils";

const VERB_TO_PRONOUN: Record<string, string[]> = {
  // naiz/nintzen verbs -> ni
  "naiz": ["ni"],
  "nintzen": ["ni"],
  "nago": ["ni"],
  "noa": ["ni"],
  "nator": ["ni"],
  
  // zara/zinen verbs -> zu
  "zara": ["zu"],
  "zinen": ["zu"],
  "zaude": ["zu"],
  "zoaz": ["zu"],
  "zator": ["zu"],
  
  // da/zen verbs -> hura
  "da": ["hura"],
  "zen": ["hura"],
  "dago": ["hura"],
  "doa": ["hura"],
  "dator": ["hura"],
  
  // gara/ginen verbs -> gu
  "gara": ["gu"],
  "ginen": ["gu"],
  "gaude": ["gu"],
  "goaz": ["gu"],
  "gatoz": ["gu"],
  
  // zarete/zineten verbs -> zuek
  "zarete": ["zuek"],
  "zineten": ["zuek"],
  "zaudete": ["zuek"],
  "zoazte": ["zuek"],
  "zatozte": ["zuek"],
  
  // dira/ziren verbs -> haiek
  "dira": ["haiek"],
  "ziren": ["haiek"],
  "daude": ["haiek"],
  "doaz": ["haiek"],
  "datoz": ["haiek"],

  // transitive (ukan/edun) verbs:
  // dut/nuen -> nik
  "dut": ["nik"],
  "nuen": ["nik"],
  "ditut": ["nik"],
  "nituen": ["nik"],
  // duzu/zenuen -> zuk
  "duzu": ["zuk"],
  "zenuen": ["zuk"],
  "dituzu": ["zuk"],
  "zenituen": ["zuk"],
  // du/zuen -> hark
  "du": ["hark"],
  "zuen": ["hark"],
  "ditu": ["hark"],
  "zituen": ["hark"],
  // dugu/genuen -> guk
  "dugu": ["guk"],
  "genuen": ["guk"],
  "ditugu": ["guk"],
  "genituen": ["guk"],
  // duzue/zenuten -> zuek
  "duzue": ["zuek"],
  "zenuten": ["zuek"],
  "dituzue": ["zuek"],
  "zenituzten": ["zuek"],
  // dute/zuten -> haiek
  "dute": ["haiek"],
  "zuten": ["haiek"],
  "dituzte": ["haiek"],
  "zituzten": ["haiek"]
};

const BASQUE_PRONOUNS = new Set([
  "ni", "zu", "hura", "gu", "zuek", "haiek",
  "nik", "guk", "zuk", "hark"
]);

function cleanWord(w: string): string {
  return w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase().trim();
}

function getProDropAlternativeText(expected: string, pronounToDrop: string): string {
  const words = expected.split(/\s+/);
  const index = words.findIndex(w => cleanWord(w) === pronounToDrop.toLowerCase());
  if (index === -1) return expected;

  const before = words.slice(0, index);
  const after = words.slice(index + 1);

  if (index === 0 && after.length > 0) {
    after[0] = after[0].charAt(0).toUpperCase() + after[0].slice(1);
  }

  return [...before, ...after].join(" ");
}

function areBasqueSentencesEquivalent(
  expected: string,
  user: string
): { isEquivalent: boolean; alsoAccepted?: string } {
  const normExpected = expected.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  const normUser = user.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

  const expectedWords = expected.split(/\s+/).map(cleanWord).filter(Boolean);
  const userWords = user.split(/\s+/).map(cleanWord).filter(Boolean);

  const expectedVerbs = expectedWords.filter(w => VERB_TO_PRONOUN[w]);
  
  const compatiblePronouns = new Set<string>();
  for (const v of expectedVerbs) {
    const prs = VERB_TO_PRONOUN[v];
    if (prs) {
      prs.forEach(p => compatiblePronouns.add(p));
    }
  }

  const pronounsInExpected = expectedWords.filter(w => BASQUE_PRONOUNS.has(w));
  pronounsInExpected.forEach(p => compatiblePronouns.add(p));

  if (compatiblePronouns.size === 0) {
    return { isEquivalent: normExpected === normUser };
  }

  const filteredExpected = expectedWords.filter(w => !compatiblePronouns.has(w));
  const filteredUser = userWords.filter(w => !compatiblePronouns.has(w));

  if (filteredExpected.join(" ") === filteredUser.join(" ")) {
    const usedInExpected = expectedWords.filter(w => compatiblePronouns.has(w));
    const usedInUser = userWords.filter(w => compatiblePronouns.has(w));

    if (normExpected === normUser) {
      if (usedInExpected.length > 0) {
        let alt = expected;
        for (const p of usedInExpected) {
          alt = getProDropAlternativeText(alt, p);
        }
        return { isEquivalent: true, alsoAccepted: alt };
      }
      return { isEquivalent: true };
    }

    if (usedInUser.length === 0 && usedInExpected.length > 0) {
      return { isEquivalent: true, alsoAccepted: expected };
    } else if (usedInUser.length > 0 && usedInExpected.length === 0) {
      return { isEquivalent: true, alsoAccepted: expected };
    }
  }

  return { isEquivalent: normExpected === normUser };
}

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
  const [hasActiveSubscription] = useState(initialUserProgress.hasActiveSubscription);
  const [streak, setStreak] = useState(initialUserProgress.streak);
  const [correctCount, setCorrectCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [alsoAcceptedText, setAlsoAcceptedText] = useState<string | undefined>(undefined);
  const [isFinished, setIsFinished] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const [challenges, setChallenges] = useState<ChallengeItem[]>(lesson.challenges);
  const [failedChallengeIds, setFailedChallengeIds] = useState<Set<number>>(new Set());
  const [initialTotalChallenges] = useState(lesson.challenges.length);

  // Exercise input states
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<any[]>([]);
  const [isKeyboardMode, setIsKeyboardMode] = useState(true);

  const currentChallenge = challenges[currentIndex];
  const totalChallenges = challenges.length;

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

      const isTargetBasque = currentChallenge.question.toLowerCase().includes("basque");

      if (isTargetBasque) {
        const proDropResult = areBasqueSentencesEquivalent(expectedText, constructedText);
        isCorrect = proDropResult.isEquivalent;
        if (isCorrect && proDropResult.alsoAccepted) {
          setAlsoAcceptedText(proDropResult.alsoAccepted);
        }
      } else {
        isCorrect = constructedText.toLowerCase() === expectedText.toLowerCase();
      }
    }

    if (isCorrect) {
      sound.playCorrect();
      setStatus("correct");
      if (!failedChallengeIds.has(currentChallenge.id)) {
        setCorrectCount((prev) => prev + 1);
      }
      try {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "remove_mistake",
            challengeId: currentChallenge.id,
          }),
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      sound.playIncorrect();
      setStatus("wrong");
      
      setFailedChallengeIds((prev) => {
        const next = new Set(prev);
        next.add(currentChallenge.id);
        return next;
      });

      setChallenges((prev) => {
        const next = [...prev];
        const insertIndex = Math.min(currentIndex + 3, next.length);
        next.splice(insertIndex, 0, currentChallenge);
        return next;
      });

      try {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "record_mistake",
            challengeId: currentChallenge.id,
          }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- CONTINUE TO NEXT CHALLENGE ---
  const handleNextChallenge = async () => {
    if (currentIndex + 1 < totalChallenges) {
      setCurrentIndex((prev) => prev + 1);
      setStatus("idle");
      setAlsoAcceptedText(undefined);
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
      if (isFinished) return;
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
  }, [status, selectedOptionId, selectedTokens, currentChallenge, isFinished]);

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

      </div>

      {/* Main Challenge Workspace */}
      <main className="flex flex-1 items-center justify-center px-4 pb-32 pt-6">
        {currentChallenge?.type === "SELECT" && (
          <SelectChallenge
            key={`${currentChallenge.id}-${currentIndex}`}
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
            key={`${currentChallenge.id}-${currentIndex}`}
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
            key={`${currentChallenge.id}-${currentIndex}`}
            question={currentChallenge.question}
            options={currentChallenge.options}
            onAllMatched={() => {
              sound.playCorrect();
              setStatus("correct");
              if (!failedChallengeIds.has(currentChallenge.id)) {
                setCorrectCount((prev) => prev + 1);
              }
            }}
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
        alsoAcceptedText={alsoAcceptedText}
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
          accuracy={calculateAccuracy(correctCount, initialTotalChallenges)}
          streak={streak}
        />
      )}
    </div>
  );
}
