"use client";

import { useState } from "react";
import { Compass, Map, Shield, Hammer, Trophy, ChevronDown, CheckCircle2, Lock, X } from "lucide-react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

interface Section {
  id: number;
  title: string;
  description: string;
  order: number;
  color: string;
  icon: string;
  totalUnits: number;
  completedUnits: number;
  isUnlocked: boolean;
  progressPercentage: number;
}

interface SectionHeaderProps {
  sections: Section[];
  activeSectionId: number;
  onSelectSection: (sectionId: number) => void;
}

const SECTION_ICONS: Record<string, any> = {
  compass: Compass,
  map: Map,
  shield: Shield,
  hammer: Hammer,
  trophy: Trophy,
};

export function SectionHeader({
  sections,
  activeSectionId,
  onSelectSection,
}: SectionHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const IconComponent = activeSection ? SECTION_ICONS[activeSection.icon] || Compass : Compass;

  return (
    <>
      {/* Sticky Top Section Banner */}
      <div className="mb-6 w-full max-w-xl mx-auto">
        <button
          onClick={() => {
            sound.playClick();
            setIsDrawerOpen(true);
          }}
          className="group relative flex w-full items-center justify-between overflow-hidden rounded-3xl border-2 border-duo-gray-border bg-white p-4 shadow-sm transition hover:border-[#84d8ff] hover:bg-[#f7fbff] active:scale-[0.99] dark:border-[#37464f] dark:bg-[#182c34] dark:hover:border-[#1899d6] dark:hover:bg-[#1c3540]"
        >
          {/* Left: Icon & Section Info */}
          <div className="flex items-center gap-3.5 text-left">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform group-hover:scale-105"
              style={{ backgroundColor: activeSection?.color || "#58cc02" }}
            >
              <IconComponent className="h-6 w-6 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#777777] dark:text-[#afafaf]">
                  Section {activeSection?.order ?? 1} of {sections.length}
                </span>
                <span className="rounded-full bg-duo-green-light px-2 py-0.5 text-[10px] font-black text-duo-green-dark dark:bg-duo-green/20 dark:text-duo-green">
                  {activeSection?.completedUnits ?? 0}/{activeSection?.totalUnits ?? 25} Units
                </span>
              </div>
              <h3 className="text-base font-black text-[#3c3c3c] md:text-lg dark:text-white">
                {activeSection?.title || "Section 1: Hasiberria"}
              </h3>
            </div>
          </div>

          {/* Right: Switcher Trigger */}
          <div className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#1cb0f6] group-hover:underline">
            <span className="hidden sm:inline">Sections</span>
            <ChevronDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
          </div>
        </button>
      </div>

      {/* Sections Selector Modal / Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-duo-gray-border bg-white p-6 shadow-2xl dark:border-[#37464f] dark:bg-[#182c34]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-duo-gray-border dark:border-[#37464f]">
              <div>
                <h3 className="text-xl font-black text-[#3c3c3c] dark:text-white">Basque Learning Sections</h3>
                <p className="text-xs font-bold text-[#777777] dark:text-[#afafaf]">
                  Choose any section to jump to its units and skill nodes (25 units each)
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-2xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="h-6 w-6 stroke-[2.5]" />
              </button>
            </div>

            {/* List of Sections */}
            <div className="mt-4 space-y-3">
              {sections.map((section) => {
                const isSelected = section.id === activeSectionId;
                const SectionIcon = SECTION_ICONS[section.icon] || Compass;

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      sound.playClick();
                      onSelectSection(section.id);
                      setIsDrawerOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition active:scale-[0.99]",
                      isSelected
                        ? "border-[#84d8ff] bg-[#ddf4ff]/50 shadow-sm dark:border-[#1899d6] dark:bg-[#1899d6]/20"
                        : "border-duo-gray-border bg-white hover:bg-gray-50 dark:border-[#37464f] dark:bg-[#131f24] dark:hover:bg-[#182c34]"
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                        style={{ backgroundColor: section.color }}
                      >
                        <SectionIcon className="h-5 w-5 stroke-[2.5]" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#777777] dark:text-[#afafaf]">
                            Section {section.order} • Units {(section.order - 1) * 25 + 1}–{section.order * 25}
                          </span>
                          {isSelected && (
                            <span className="rounded-full bg-[#1cb0f6] px-2 py-0.5 text-[9px] font-black text-white">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-sm text-[#3c3c3c] dark:text-white">
                          {section.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-[#777777] dark:text-[#afafaf] line-clamp-1">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-black text-[#4b4b4b] dark:bg-[#182c34] dark:text-[#f7f7f7]">
                        {section.completedUnits}/{section.totalUnits} Units
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
