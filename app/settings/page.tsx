"use client";

import { useState, useEffect } from "react";
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
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [userProgress, setUserProgress] = useState<any>(null);
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
                    Settings & Preferences
                  </h1>
                  <p className="text-xs font-bold text-[#777777] dark:text-[#afafaf]">
                    Personalize your learning environment, theme, audio, and daily goals.
                  </p>
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
              {/* 1. Theme & Appearance */}
              <section className="rounded-3xl border-2 border-duo-gray-border bg-white p-6 shadow-sm transition dark:border-[#37464f] dark:bg-[#182c34]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sun className="h-5 w-5 text-duo-yellow-dark" />
                    <h2 className="text-lg font-black text-[#3c3c3c] dark:text-white">
                      Appearance & Theme
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-[#777777] dark:text-[#afafaf] uppercase tracking-wider">
                    {resolvedTheme === "dark" ? "Dark Mode Active" : "Light Mode Active"}
                  </span>
                </div>
                <p className="mb-4 text-xs text-[#777777] dark:text-[#afafaf]">
                  Choose your preferred color theme. Dark mode provides a sleek, high-contrast palette tailored for evening study.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {/* Light Theme Button */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setTheme("light");
                      showSaveFeedback();
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-3.5 text-xs font-extrabold transition active:scale-95",
                      theme === "light"
                        ? "border-[#1cb0f6] bg-[#ddf4ff] text-[#1899d6] shadow-sm dark:bg-[#1899d6]/20"
                        : "border-duo-gray-border bg-gray-50 text-[#4b4b4b] hover:bg-gray-100 dark:border-[#37464f] dark:bg-[#131f24] dark:text-[#afafaf] dark:hover:bg-[#1c2e36]"
                    )}
                  >
                    <Sun className="h-5 w-5" />
                    <span>Light</span>
                    {theme === "light" && <Check className="h-4 w-4" />}
                  </button>

                  {/* Dark Theme Button */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setTheme("dark");
                      showSaveFeedback();
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-3.5 text-xs font-extrabold transition active:scale-95",
                      theme === "dark"
                        ? "border-[#58cc02] bg-[#d7ffb8]/30 text-duo-green-dark shadow-sm dark:border-duo-green dark:bg-duo-green/20 dark:text-duo-green"
                        : "border-duo-gray-border bg-gray-50 text-[#4b4b4b] hover:bg-gray-100 dark:border-[#37464f] dark:bg-[#131f24] dark:text-[#afafaf] dark:hover:bg-[#1c2e36]"
                    )}
                  >
                    <Moon className="h-5 w-5" />
                    <span>Dark</span>
                    {theme === "dark" && <Check className="h-4 w-4" />}
                  </button>

                  {/* System Theme Button */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setTheme("system");
                      showSaveFeedback();
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-3.5 text-xs font-extrabold transition active:scale-95",
                      theme === "system"
                        ? "border-[#ce82ff] bg-[#f5e8ff] text-[#b05ce6] shadow-sm dark:bg-[#b05ce6]/20"
                        : "border-duo-gray-border bg-gray-50 text-[#4b4b4b] hover:bg-gray-100 dark:border-[#37464f] dark:bg-[#131f24] dark:text-[#afafaf] dark:hover:bg-[#1c2e36]"
                    )}
                  >
                    <Laptop className="h-5 w-5" />
                    <span>Auto / System</span>
                    {theme === "system" && <Check className="h-4 w-4" />}
                  </button>
                </div>
              </section>

              {/* 2. Audio & Speech Settings */}
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
                        Sound Effects & Jingle Sounds
                      </h3>
                      <p className="text-xs text-[#777777] dark:text-[#afafaf]">
                        Plays audio feedback when selecting answers or completing lessons.
                      </p>
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

              {/* 3. Daily Learning Goal */}
              <section className="rounded-3xl border-2 border-duo-gray-border bg-white p-6 shadow-sm transition dark:border-[#37464f] dark:bg-[#182c34]">
                <div className="mb-4 flex items-center gap-2.5">
                  <Zap className="h-5 w-5 text-duo-orange" />
                  <h2 className="text-lg font-black text-[#3c3c3c] dark:text-white">
                    Daily XP Learning Goal
                  </h2>
                </div>
                <p className="mb-4 text-xs text-[#777777] dark:text-[#afafaf]">
                  Set a daily target to maintain your streak and pace your progression through the 46 modules.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DAILY_GOALS.map((goal) => {
                    const isSelected = selectedGoal === goal.id;
                    return (
                      <button
                        key={goal.id}
                        onClick={() => handleGoalChange(goal.id)}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border-2 p-4 text-left transition active:scale-[0.98]",
                          isSelected
                            ? "border-duo-orange bg-duo-orange-light text-duo-orange-dark shadow-sm dark:bg-duo-orange/20 dark:text-duo-orange"
                            : "border-duo-gray-border bg-gray-50/50 hover:bg-gray-100 dark:border-[#37464f] dark:bg-[#131f24] dark:hover:bg-[#1c2e36]"
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-[#3c3c3c] dark:text-white">
                              {goal.label}
                            </span>
                            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-black text-duo-orange-dark dark:bg-white/10 dark:text-duo-orange">
                              {goal.xp} XP / day
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-[#777777] dark:text-[#afafaf]">
                            {goal.desc}
                          </p>
                        </div>
                        {isSelected && <Check className="h-5 w-5 text-duo-orange shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 4. Danger Zone / Reset Progress */}
              <section className="rounded-3xl border-2 border-red-200 bg-red-50/40 p-6 shadow-sm transition dark:border-red-900/50 dark:bg-red-950/20">
                <div className="flex items-center gap-2.5 text-duo-red">
                  <ShieldAlert className="h-5 w-5" />
                  <h2 className="text-lg font-black">Data & Progress Management</h2>
                </div>
                <p className="mt-2 text-xs text-[#777777] dark:text-[#afafaf]">
                  If you want to restart your Basque learning journey from the beginning, you can reset all crown levels, streak, and XP to zero.
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsResetModalOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-2xl bg-duo-red px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-3d-red transition active:translate-y-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset Progress to Clean Slate</span>
                  </button>

                  {resetSuccess && (
                    <span className="text-xs font-bold text-duo-green-dark dark:text-duo-green animate-in fade-in">
                      Progress successfully reset!
                    </span>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Course Info & Curriculum Stats */}
            <div className="flex flex-col gap-6">
              {/* Course Card */}
              <div className="rounded-3xl border-2 border-duo-gray-border bg-white p-6 shadow-sm transition dark:border-[#37464f] dark:bg-[#182c34]">
                <div className="mt-5 flex flex-col gap-2">
                  <Link
                    href="/guidebooks"
                    className="flex items-center justify-between rounded-2xl border-2 border-duo-gray-border bg-gray-50 px-4 py-3 text-xs font-black text-[#4b4b4b] transition hover:border-[#84d8ff] hover:bg-[#ddf4ff] hover:text-[#1899d6] dark:border-[#37464f] dark:bg-[#131f24] dark:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Explore 46 Guidebooks</span>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                </div>
              </div>

              {/* Version & Credits */}
              <div className="rounded-3xl border-2 border-duo-gray-border bg-gray-50/70 p-5 text-center dark:border-[#37464f] dark:bg-[#131f24]">
                <p className="text-xs font-extrabold text-[#3c3c3c] dark:text-white">
                  Hitzak v2.5.0
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
