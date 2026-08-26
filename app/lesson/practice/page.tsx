"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";

export default function PracticeLessonPageRoute() {
  const [lesson, setLesson] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [lessonRes, progressRes] = await Promise.all([
          fetch("/api/practice"),
          fetch("/api/progress"),
        ]);

        if (!lessonRes.ok) {
          setError("Failed to load practice session");
          return;
        }

        const lessonData = await lessonRes.json();
        const progressData = await progressRes.json();

        setLesson(lessonData);
        setUserProgress(progressData);
      } catch (err) {
        setError("Failed to load practice exercises");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white">
        <div className="h-12 w-12 rounded-full border-4 border-duo-green border-t-transparent animate-spin" />
        <p className="font-extrabold text-sm text-[#777777]">Loading mistake review...</p>
      </div>
    );
  }

  if (error || !lesson || !lesson.challenges || lesson.challenges.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white p-6 text-center">
        <h2 className="text-2xl font-extrabold text-duo-red">No Mistakes to Review</h2>
        <p className="text-sm font-bold text-[#777777]">Your mistakes inbox is completely clear!</p>
        <Link
          href="/"
          className="rounded-2xl bg-duo-green px-6 py-3 font-extrabold uppercase tracking-wider text-white shadow-3d-green"
        >
          Return to Tree
        </Link>
      </div>
    );
  }

  return (
    <LessonPlayer
      lesson={lesson}
      initialUserProgress={{
        hearts: userProgress?.hearts ?? 5,
        hasActiveSubscription: userProgress?.hasActiveSubscription ?? false,
        streak: userProgress?.streak ?? 0,
        encounteredWords: userProgress?.encounteredWords ?? [],
      }}
    />
  );
}
