"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Sparkles, Globe, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";

interface LanguageOption {
  id: number;
  name: string;
  nativeName: string;
  flagSrc?: string;
  flagEmoji?: string;
  isUnlocked: boolean;
  modulesCount?: number;
}

const LANGUAGES: LanguageOption[] = [
  {
    id: 1,
    name: "Basque",
    nativeName: "Euskara",
    flagSrc: "/ikurrina.svg",
    isUnlocked: true,
    modulesCount: 46,
  },
];

export default function SelectLanguagePage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (lang: LanguageOption) => {
    if (!lang.isUnlocked) {
      sound.playIncorrect();
      return;
    }
    sound.playClick();
    setSelectedId(lang.id);
  };

  const handleContinue = async () => {
    if (selectedId !== 1) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "select_course",
          courseId: 1,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to enroll in Basque course.");
      }

      sound.playVictory();
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 transition-colors duration-200 dark:bg-[#131f24] dark:text-[#f7f7f7]">
      {/* Background blur highlights */}
      <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-duo-green/5 blur-3xl dark:bg-duo-green/10 pointer-events-none" />
      <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-duo-blue/5 blur-3xl dark:bg-duo-blue/10 pointer-events-none" />

      {/* Main card container */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-duo-blue/10 text-duo-blue">
          <Globe className="h-7 w-7 animate-pulse" />
        </div>

        <h1 className="text-3xl font-black tracking-wide text-[#3c3c3c] dark:text-white md:text-4xl">
          What language do you want to learn?
        </h1>

        {error && (
          <div className="mt-6 rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-3 text-xs font-bold text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Language Cards Centered Container */}
        <div className="mt-12 flex justify-center w-full">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedId === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => handleSelect(lang)}
                className={cn(
                  "relative flex flex-row items-center gap-4 rounded-3xl border-2 p-4 transition-all duration-100 shadow-[0_6px_0_rgba(0,0,0,0.06)] dark:shadow-[0_6px_0_rgba(0,0,0,0.2)] w-64 h-20",
                  lang.isUnlocked
                    ? isSelected
                      ? "border-[#1cb0f6] bg-[#ddf4ff]/50 dark:border-[#1899d6] dark:bg-[#1899d6]/10 shadow-[0_4px_0_#1899d6] active:translate-y-[2px]"
                      : "border-duo-gray-border bg-white hover:border-[#84d8ff] hover:bg-[#f7fbff] active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.06)] dark:border-[#37464f] dark:bg-[#182c34] dark:hover:bg-[#203741] dark:hover:border-[#4b606c]"
                    : "border-duo-gray-border bg-gray-100/60 opacity-60 cursor-not-allowed dark:border-[#37464f] dark:bg-[#15232a]"
                )}
              >
                {/* Flag display */}
                <div className="relative flex h-12 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-50 p-1 shadow-sm border border-gray-100 dark:bg-[#131f24] dark:border-[#37464f]">
                  {lang.flagSrc ? (
                    <div className="relative h-8 w-12 overflow-hidden rounded shadow-sm">
                      <Image
                        src={lang.flagSrc}
                        alt={`${lang.name} flag`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <span className="text-2xl">{lang.flagEmoji}</span>
                  )}
                </div>

                {/* Text & Module Details */}
                <div className="text-left flex-1 min-w-0">
                  <h3 className="text-sm font-black text-[#3c3c3c] dark:text-white leading-tight truncate">
                    {lang.name}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block truncate">
                    {lang.nativeName}
                  </span>
                  <div className="mt-1">
                    {lang.isUnlocked ? (
                      <span className="rounded-full bg-duo-green-light px-2 py-0.2 text-[9px] font-black uppercase text-duo-green-dark dark:bg-duo-green/20 dark:text-duo-green">
                        {lang.modulesCount} Modules
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-200 px-2 py-0.2 text-[9px] font-black uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={selectedId !== 1 || submitting}
          className={cn(
            "mt-12 flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl py-4 font-black text-sm uppercase tracking-wider text-white shadow-md transition active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed",
            selectedId === 1
              ? "bg-duo-green shadow-3d-green hover:brightness-105 active:shadow-3d-green-pressed"
              : "bg-gray-300 shadow-[0_4px_0_#b5b5b5] dark:bg-gray-700 dark:shadow-[0_4px_0_#444] cursor-not-allowed"
          )}
        >
          {submitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>Get Started</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </>
          )}
        </button>
      </div>
    </main>
  );
}
