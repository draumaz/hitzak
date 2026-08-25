"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { useTheme } from "@/components/ThemeProvider";
import { sound } from "@/lib/sound";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  Check,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  BookOpen,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Database,
  ArrowRight,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DAILY_GOALS = [
  { id: "casual", label: "Casual", xp: 15, desc: "1 lesson per day" },
  { id: "regular", label: "Regular", xp: 30, desc: "2 lessons per day" },
  { id: "serious", label: "Serious", xp: 50, desc: "3-4 lessons per day" },
  { id: "intense", label: "Intense", xp: 100, desc: "5+ lessons per day" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [userProgress, setUserProgress] = useState<any>(null);

  const handleLogout = async () => {
    try {
      sound.playClick();
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };
  const [selectedGoal, setSelectedGoal] = useState("regular");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechSpeed, setSpeechSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => setUserProgress(data))
      .catch(console.error);

    const savedGoal = localStorage.getItem("hitzak_daily_goal") || localStorage.getItem("euskarolingo_daily_goal") || "regular";
    setSelectedGoal(savedGoal);

    const savedSound = localStorage.getItem("hitzak_sound_enabled") !== null
      ? localStorage.getItem("hitzak_sound_enabled")
      : localStorage.getItem("euskarolingo_sound_enabled");
    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true");
    }

    const savedSpeed = (localStorage.getItem("hitzak_speech_speed") || localStorage.getItem("euskarolingo_speech_speed") as any) || "normal";
    setSpeechSpeed(savedSpeed);
  }, []);

  const handleGoalChange = (goalId: string) => {
    sound.playClick();
    setSelectedGoal(goalId);
    localStorage.setItem("hitzak_daily_goal", goalId);
    showSaveFeedback();
  };

  const handleSoundToggle = (enabled: boolean) => {
    sound.playClick();
    setSoundEnabled(enabled);
    localStorage.setItem("hitzak_sound_enabled", String(enabled));
    showSaveFeedback();
  };

  const handleSpeedChange = (speed: "slow" | "normal" | "fast") => {
    sound.playClick();
    setSpeechSpeed(speed);
    localStorage.setItem("hitzak_speech_speed", speed);
    showSaveFeedback();
  };

  const showSaveFeedback = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleResetProgress = async () => {
    try {
      sound.playClick();
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_progress" }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserProgress(data.userProgress);
        setIsResetModalOpen(false);
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-[#131f24] dark:text-[#f7f7f7]">
      <Sidebar />

      <div className="flex flex-col md:pl-64">
        <TopHeader
          hearts={userProgress?.hearts ?? 5}
          streak={userProgress?.streak ?? 0}
          points={userProgress?.points ?? 0}
          onRefresh={() => {
            fetch("/api/progress")
              .then((res) => res.json())
              .then((data) => setUserProgress(data));
          }}
        />

        <main className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 md:px-8">
          {/* Header Title Banner */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-duo-gray-border pb-6 dark:border-[#37464f]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-duo-blue text-white shadow-md">
                  <SettingsIcon className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#3c3c3c] dark:text-white md:text-3xl">
                    Settings
                  </h1>
                </div>
              </div>
            </div>

            {savedNotice && (
              <div className="flex items-center gap-2 rounded-2xl bg-duo-green-light px-3 py-1.5 text-xs font-extrabold text-duo-green-dark animate-in fade-in">
                <CheckCircle2 className="h-4 w-4" />
                <span>Preferences Saved!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Left 2 Columns: Settings Options */}
            <div className="flex flex-col gap-8 md:col-span-2">
              {/* 1. Audio & Speech Settings */}
              <section className="rounded-3xl border-2 border-duo-gray-border bg-white p-6 shadow-sm transition dark:border-[#37464f] dark:bg-[#182c34]">
                <div className="mb-4 flex items-center gap-2.5">
                  <Volume2 className="h-5 w-5 text-duo-blue" />
                  <h2 className="text-lg font-black text-[#3c3c3c] dark:text-white">
                    Sound & Audio
                  </h2>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Sound Effects Toggle */}
                  <div className="flex items-center justify-between rounded-2xl border-2 border-duo-gray-border bg-gray-50/70 p-4 dark:border-[#37464f] dark:bg-[#131f24]">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#3c3c3c] dark:text-white">
                        Sound Effects
                      </h3>
                    </div>
                    <button
                      onClick={() => handleSoundToggle(!soundEnabled)}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black uppercase transition",
                        soundEnabled
                          ? "bg-duo-green text-white shadow-3d-green"
                          : "bg-gray-200 text-[#777777] dark:bg-gray-700 dark:text-gray-300"
                      )}
                    >
                      {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      <span>{soundEnabled ? "Enabled" : "Muted"}</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* 2. Account Session */}
              <section className="rounded-3xl border-2 border-duo-gray-border bg-white p-6 shadow-sm transition dark:border-[#37464f] dark:bg-[#182c34]">
                <div className="mb-4 flex items-center gap-2.5">
                  <LogOut className="h-5 w-5 text-duo-gray dark:text-gray-400" />
                  <h2 className="text-lg font-black text-[#3c3c3c] dark:text-white">
                    Account Session
                  </h2>
                </div>
                <p className="mb-4 text-xs text-[#777777] dark:text-[#afafaf]">
                  You are currently logged in as <span className="font-extrabold text-duo-blue">{userProgress?.userName || "User"}</span>.
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-2xl border-2 border-duo-gray-border bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-50 hover:border-red-200 transition active:scale-95 dark:border-[#37464f] dark:bg-[#131f24] dark:hover:bg-red-950/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </section>

              {/* 3. Danger Zone / Reset Progress */}
              <section className="rounded-3xl border-2 border-red-200 bg-red-50/40 p-6 shadow-sm transition dark:border-red-900/50 dark:bg-red-950/20">
                <div className="flex items-center gap-2.5 text-duo-red">
                  <ShieldAlert className="h-5 w-5" />
                  <h2 className="text-lg font-black">Data & Progress Management</h2>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsResetModalOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-2xl bg-duo-red px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-3d-red transition active:translate-y-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset Progress</span>
                  </button>

                  {resetSuccess && (
                    <span className="text-xs font-bold text-duo-green-dark dark:text-duo-green animate-in fade-in">
                      Progress successfully reset!
                    </span>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Course Info */}
            <div className="flex flex-col gap-6">
              {/* Version & Credits */}
              <div className="rounded-3xl border-2 border-duo-gray-border bg-gray-50/70 p-5 text-center dark:border-[#37464f] dark:bg-[#131f24]">
                <p className="text-xs font-extrabold text-[#3c3c3c] dark:text-white">
                  Hitzak 1.0.0
                </p>
                <p className="text-xs font-extrabold text-[#3c3c3c] dark:text-white">
                  2026 | draumaz
                </p>
                <p className="mt-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 leading-relaxed">
                  Seed data sources:{" "}
                  <a
                    href="https://www.ehu.eus/en/web/eins/basque-grammar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-duo-blue hover:underline"
                  >
                    EHU Basque Grammar
                  </a>{" "}
                  &{" "}
                  <a
                    href="https://github.com/LibreLingo/LibreLingo-EU-from-EN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-duo-blue hover:underline"
                  >
                    LibreLingo
                  </a>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-duo-gray-border bg-white p-6 shadow-2xl dark:border-[#37464f] dark:bg-[#182c34]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-duo-red dark:bg-red-950/40">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <h3 className="text-center text-xl font-black text-[#3c3c3c] dark:text-white">
              Reset All Progress?
            </h3>
            <p className="mt-2 text-center text-xs font-medium text-[#777777] dark:text-[#afafaf] leading-relaxed">
              This will reset your completed lessons, crown masteries, points, and streak back to 0. This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 rounded-2xl border-2 border-duo-gray-border bg-white py-3 text-xs font-extrabold uppercase tracking-wider text-[#4b4b4b] hover:bg-gray-100 dark:border-[#37464f] dark:bg-[#131f24] dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleResetProgress}
                className="flex-1 rounded-2xl bg-duo-red py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-3d-red active:translate-y-1"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
