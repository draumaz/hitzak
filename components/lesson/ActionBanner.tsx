"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionBannerProps {
  status: "idle" | "correct" | "wrong";
  disabled?: boolean;
  onCheck: () => void;
  onNext: () => void;
  correctAnswerText?: string;
  centerAction?: React.ReactNode;
}

export function ActionBanner({
  status,
  disabled = false,
  onCheck,
  onNext,
  correctAnswerText,
  centerAction,
}: ActionBannerProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t-2 px-6 py-6 md:py-8 transition-colors duration-200",
        status === "idle" && "border-duo-gray-border bg-white dark:border-[#37464f] dark:bg-[#131f24]",
        status === "correct" && "border-duo-green bg-duo-green-light dark:border-emerald-700 dark:bg-emerald-950/70",
        status === "wrong" && "border-duo-red bg-duo-red-light dark:border-red-850 dark:bg-red-950/70"
      )}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        {/* Left spacing for centering centerAction */}
        {status === "idle" && <div className="flex-1 hidden sm:block" />}

        {/* Center Action (e.g. Mode Toggler) */}
        {status === "idle" && centerAction && (
          <div className="flex-1 flex justify-center">
            {centerAction}
          </div>
        )}
        {status === "idle" && !centerAction && <div className="flex-1 hidden sm:block" />}

        {status === "correct" && (
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-duo-green shadow-sm dark:bg-emerald-900 dark:text-emerald-300">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-duo-green-dark dark:text-emerald-300">Nicely done!</h3>
              <p className="text-sm font-bold text-duo-green-dark/80 dark:text-emerald-400">Correct answer</p>
            </div>
          </div>
        )}

        {status === "wrong" && (
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-duo-red shadow-sm dark:bg-red-900 dark:text-red-300">
              <XCircle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-duo-red-dark dark:text-red-300">Incorrect</h3>
              {correctAnswerText && (
                <p className="text-sm font-bold text-duo-red-dark dark:text-red-300">
                  Correct answer: <span className="underline">{correctAnswerText}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className={cn(
          "flex justify-end",
          status === "idle" && "flex-1 w-full sm:w-auto"
        )}>
          {status === "idle" ? (
            <button
              onClick={onCheck}
              disabled={disabled}
              className={cn(
                "w-full sm:w-auto min-w-[150px] rounded-2xl py-3.5 px-8 font-black text-sm uppercase tracking-wider transition-all",
                disabled
                  ? "bg-[#e5e5e5] text-[#afafaf] cursor-not-allowed shadow-none dark:bg-gray-800 dark:text-gray-600"
                  : "bg-duo-green text-white shadow-3d-green hover:brightness-105 active:translate-y-1 active:shadow-3d-green-pressed"
              )}
            >
              Check
            </button>
          ) : (
            <button
              onClick={onNext}
              className={cn(
                "w-full sm:w-auto min-w-[150px] rounded-2xl py-3.5 px-8 font-black text-sm uppercase tracking-wider text-white transition-all",
                status === "correct"
                  ? "bg-duo-green shadow-3d-green hover:brightness-105 active:translate-y-1 active:shadow-3d-green-pressed"
                  : "bg-duo-red shadow-3d-red hover:brightness-105 active:translate-y-1 active:shadow-3d-red-pressed"
              )}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
