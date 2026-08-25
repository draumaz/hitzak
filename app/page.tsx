"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { UnitSection } from "@/components/tree/UnitSection";
import { Compass, Map, Shield, Hammer, Trophy, Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";

const SECTION_ICONS: Record<string, any> = {
  compass: Compass,
  map: Map,
  shield: Shield,
  hammer: Hammer,
  trophy: Trophy,
};

export default function LearnPage() {
  const router = useRouter();
  const [sections, setSections] = useState<any[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<number>(1);
  const [units, setUnits] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSectionsAndProgress = useCallback(async () => {
    try {
      const [sectionsRes, progressRes] = await Promise.all([
        fetch("/api/sections"),
        fetch("/api/progress"),
      ]);

      if (sectionsRes.ok && progressRes.ok) {
        const sectionsData = await sectionsRes.json();
        const progressData = await progressRes.json();
        setSections(sectionsData);
        setUserProgress(progressData);
      }
    } catch (e) {
      console.error("Failed to load sections/progress:", e);
    }
  }, []);

  const fetchUnitsForSection = useCallback(async (sectionId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/units?sectionId=${sectionId}`);
      if (res.ok) {
        const unitsData = await res.json();
        setUnits(unitsData);
      }
    } catch (e) {
      console.error("Failed to load units:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSectionsAndProgress();
  }, [fetchSectionsAndProgress]);

  useEffect(() => {
    fetchUnitsForSection(activeSectionId);
  }, [activeSectionId, fetchUnitsForSection]);

  useEffect(() => {
    if (sections.length > 0) {
      const activeIdx = sections.findIndex((s) => s.id === activeSectionId);
      const isCurrentUnlocked = activeIdx === 0 || (activeIdx > 0 && sections[activeIdx - 1].progressPercent === 100);
      if (!isCurrentUnlocked) {
        let highestUnlockedSectionId = sections[0].id;
        for (let i = 1; i < sections.length; i++) {
          if (sections[i - 1].progressPercent === 100) {
            highestUnlockedSectionId = sections[i].id;
          } else {
            break;
          }
        }
        setActiveSectionId(highestUnlockedSectionId);
      }
    }
  }, [sections, activeSectionId]);

  const handleRefresh = () => {
    fetchSectionsAndProgress();
    fetchUnitsForSection(activeSectionId);
  };

  const getNewestLessonId = useCallback(() => {
    if (!units || units.length === 0) return null;

    let targetUnit = units.find((u) => u.isUnlocked && !u.isCompleted);
    if (!targetUnit) {
      const unlocked = units.filter((u) => u.isUnlocked);
      targetUnit = unlocked[unlocked.length - 1];
    }

    if (!targetUnit || !targetUnit.rings || targetUnit.rings.length === 0) return null;

    const standardRings = targetUnit.rings.filter((r: any) => !r.isUnitReview);
    const reviewRing = targetUnit.rings.find((r: any) => r.isUnitReview);

    const activeRing = standardRings.find((r: any) => !r.isMastered);
    if (activeRing) {
      return activeRing.nextLessonId;
    }

    if (reviewRing) {
      return reviewRing.nextLessonId;
    }

    return targetUnit.rings[0].nextLessonId;
  }, [units]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const activeEl = document.activeElement;
        if (activeEl) {
          const tagName = activeEl.tagName.toLowerCase();
          if (
            tagName === "input" ||
            tagName === "textarea" ||
            tagName === "button" ||
            tagName === "a" ||
            activeEl.getAttribute("contenteditable") === "true"
          ) {
            return;
          }
        }

        const isModalOpen = document.querySelector(".fixed.inset-0.z-50") !== null;
        if (isModalOpen) return;

        const newestLessonId = getNewestLessonId();
        if (newestLessonId) {
          const activeBtn = document.querySelector(
            `[data-active-lesson-id="${newestLessonId}"]`
          ) as HTMLButtonElement | null;
          if (activeBtn) {
            activeBtn.click();
            activeBtn.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [getNewestLessonId, router]);

  return (
    <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-[#131f24] dark:text-[#f7f7f7]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col md:pl-64">
        {/* Top Header */}
        <TopHeader
          hearts={userProgress?.hearts ?? 5}
          streak={userProgress?.streak ?? 0}
          points={userProgress?.points ?? 0}
          onRefresh={handleRefresh}
        />

        {/* Content Body */}
        <div className="flex justify-center px-4 py-8">
          <div className="flex w-full max-w-5xl justify-center gap-8">
            {/* Learning Tree Center Path */}
            <main className="w-full flex-1 max-w-xl">


              {/* Fast 1-Click Section Navigation Ribbon */}
              {sections.length > 0 && (
                <div className="mb-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black uppercase tracking-wider text-[#777777] dark:text-[#afafaf]">
                      Curriculum Sections (46 Modules Total • 3 Sections)
                    </span>
                  </div>

                  {/* Horizontal Section Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {sections.map((sec, idx) => {
                      const isCurrent = sec.id === activeSectionId;
                      const Icon = SECTION_ICONS[sec.icon] || Compass;
                      const unitStart = (sec.order - 1) * 25 + 1;
                      const unitEnd = sec.order * 25;
                      const isUnlocked = idx === 0 || sections[idx - 1].progressPercent === 100;

                      return (
                        <button
                          key={sec.id}
                          disabled={!isUnlocked}
                          onClick={() => {
                            if (!isUnlocked) return;
                            sound.playClick();
                            setActiveSectionId(sec.id);
                          }}
                          className={cn(
                            "flex shrink-0 items-center gap-2 rounded-2xl border-2 px-3 py-2 text-xs font-black transition shadow-sm",
                            isCurrent
                              ? "border-transparent text-white shadow-md"
                              : isUnlocked
                                ? "border-duo-gray-border bg-white text-[#4b4b4b] hover:bg-gray-50 dark:border-[#37464f] dark:bg-[#182c34] dark:text-[#f7f7f7] dark:hover:bg-[#203a45] active:scale-95"
                                : "border-duo-gray-border bg-gray-100 text-gray-400 dark:border-[#37464f] dark:bg-[#131f24] dark:text-gray-600 cursor-not-allowed opacity-60"
                          )}
                          style={{
                            backgroundColor: isCurrent ? sec.color : undefined,
                          }}
                        >
                          {isUnlocked ? (
                            <Icon className="h-4 w-4" />
                          ) : (
                            <Lock className="h-3.5 w-3.5" />
                          )}
                          <span>Sec {sec.order}</span>
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.2 text-[10px] font-extrabold",
                              isCurrent
                                ? "bg-white/20 text-white"
                                : isUnlocked
                                  ? "bg-gray-100 text-[#777777] dark:bg-[#131f24] dark:text-[#afafaf]"
                                  : "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                            )}
                          >
                            U{unitStart}–{unitEnd}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Units & Skill Rings */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="h-12 w-12 rounded-full border-4 border-duo-green border-t-transparent animate-spin" />
                  <p className="font-black text-sm text-[#777777] dark:text-[#afafaf]">
                    Loading Basque units & skill rings...
                  </p>
                </div>
              ) : units.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="font-black text-base text-[#777777] dark:text-[#afafaf]">
                    No units available for this section yet.
                  </p>
                </div>
              ) : (
                units.map((unit, idx) => (
                  <UnitSection key={unit.id} unit={unit} unitIndex={idx} />
                ))
              )}
            </main>

          </div>
        </div>
      </div>
    </div>
  );
}
