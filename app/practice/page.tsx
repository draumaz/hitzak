"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { sound } from "@/lib/sound";
import { Sparkles, ShieldAlert, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function PracticePage() {
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProgress() {
    try {
      const res = await fetch("/api/progress");
      if (res.ok) {
        const data = await res.json();
        setUserProgress(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProgress();
  }, []);

  const mistakesCount = userProgress?.mistakesCount ?? 0;

  return (
    <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-[#131f24] dark:text-[#f7f7f7]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex flex-col md:pl-64">
        <TopHeader
          streak={userProgress?.streak ?? 0}
          points={userProgress?.points ?? 0}
          onRefresh={fetchProgress}
        />

        <main className="mx-auto w-full max-w-2xl px-4 py-12 md:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="h-10 w-10 rounded-full border-4 border-duo-green border-t-transparent animate-spin" />
              <p className="font-bold text-sm text-gray-500">Loading your practice hub...</p>
            </div>
          ) : mistakesCount > 0 ? (
            <div className="flex flex-col items-center text-center">
              {/* Animated Icon Badge */}
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                <ShieldAlert className="h-12 w-12 text-duo-red animate-pulse" />
              </div>

              <h2 className="text-3xl font-black text-[#3c3c3c] dark:text-white">Mistakes Inbox</h2>
              <p className="mt-2 text-sm text-[#777777] dark:text-[#afafaf] max-w-md">
                You have <span className="font-black text-duo-red">{mistakesCount} mistakes</span> to review. Practice them to master Basque and clear your inbox!
              </p>

              {/* Action Button */}
              <Link
                href="/lesson/practice"
                onClick={() => sound.playClick()}
                className="mt-8 flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-duo-green py-4 font-black text-sm uppercase tracking-wider text-white shadow-3d-green transition hover:brightness-105 active:translate-y-1 active:shadow-3d-green-pressed"
              >
                <GraduationCap className="h-5 w-5" />
                <span>Start Review (+20 XP)</span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              {/* Celebrating Mascot/Mascot Badge */}
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-950/40">
                <Sparkles className="h-12 w-12 text-duo-yellow-dark dark:text-yellow-400 animate-pulse" />
              </div>

              <h2 className="text-3xl font-black text-[#3c3c3c] dark:text-white">Inbox Clean!</h2>
              <p className="mt-2 text-sm text-[#777777] dark:text-[#afafaf] max-w-md font-medium">
                Excellent work! You have completed all mistake reviews and have 0 pending wrong answers. Keep learning to build your skills!
              </p>

              {/* Action Button to Return to Home */}
              <Link
                href="/"
                onClick={() => sound.playClick()}
                className="mt-8 flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-duo-blue py-4 font-black text-sm uppercase tracking-wider text-white shadow-3d-blue transition hover:brightness-105 active:translate-y-1 active:shadow-3d-blue-pressed"
              >
                <span>Back to Learn Tree</span>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
