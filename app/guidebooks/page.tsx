"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import {
  BookOpen,
  Sparkles,
  Volume2,
  ChevronRight,
  Search,
} from "lucide-react";
import { sound } from "@/lib/sound";

export default function GuidebooksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/units?courseId=1")
      .then((res) => res.json())
      .then((data) => {
        setUnits(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch guidebooks:", err);
        setIsLoading(false);
      });
  }, []);

  const filteredUnits = units.filter((unit) => {
    const matchesSection = selectedSection === "all" || String(unit.sectionId) === selectedSection;
    const matchesSearch =
      unit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.guidebook || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSection && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-[#131f24] dark:text-[#f7f7f7]">
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col md:pl-64">
        {/* Top Header */}
        <TopHeader hearts={5} streak={0} points={0} />

        {/* Hero & Search Controls */}
        <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
          <div className="rounded-3xl border-2 border-duo-gray-border bg-white p-6 md:p-8 shadow-sm dark:border-[#37464f] dark:bg-[#182c34]">
            <div className="flex items-center gap-2 text-duo-blue font-black uppercase text-xs tracking-widest">
              <Sparkles className="h-4 w-4" />
              <span>Itziar Laka Grammar Reference Companion • 46 Modules Total</span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-[#2e2e2e] md:text-3xl dark:text-white">
              Basque Language Guidebooks & Tables
            </h2>
            <p className="mt-2 text-sm text-[#777777] dark:text-[#afafaf] font-medium leading-relaxed max-w-2xl">
              Explore authentic grammar explanations, case morphology rules, verbal inflection paradigms, postpositions, and pronunciation across all 46 modules.
            </p>

            {/* Search & Filter Bar */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search grammar rules, words (e.g. Ergative, Izan, Ukan, Galdegaia)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border-2 border-duo-gray-border py-3 pl-12 pr-4 text-sm font-bold text-[#3c3c3c] outline-none transition focus:border-duo-blue focus:ring-2 focus:ring-duo-blue/20 dark:border-[#37464f] dark:bg-[#131f24] dark:text-white"
                />
              </div>

              {/* Section Filter Dropdown */}
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="rounded-2xl border-2 border-duo-gray-border bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-[#4b4b4b] outline-none transition focus:border-duo-blue dark:border-[#37464f] dark:bg-[#131f24] dark:text-white"
              >
                <option value="all">All 3 Sections (46 Modules)</option>
                <option value="1">Section 1: Hasiberria (Modules 1-15)</option>
                <option value="2">Section 2: Esploratzailea (Modules 16-30)</option>
                <option value="3">Section 3: Txapelduna (Modules 31-46)</option>
              </select>
            </div>
          </div>

          {/* Guidebook Units List */}
          <div className="mt-8 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#777777] dark:text-[#afafaf]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-duo-blue border-t-transparent"></div>
                <p className="mt-4 font-bold text-sm">Loading guidebooks...</p>
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-duo-gray-border p-12 text-center text-sm font-bold text-[#777777] dark:border-[#37464f] dark:text-[#afafaf]">
                No guidebooks match your search criteria.
              </div>
            ) : (
              filteredUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="overflow-hidden rounded-3xl border-2 border-duo-gray-border bg-white shadow-sm transition hover:shadow-md dark:border-[#37464f] dark:bg-[#182c34]"
                >
                  {/* Unit Header */}
                  <div
                    className="flex items-center justify-between p-6 text-white"
                    style={{ backgroundColor: unit.color || "#58cc02" }}
                  >
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-white/80">
                        Section {unit.sectionId} • Module {unit.order}
                      </span>
                      <h3 className="mt-1 text-xl font-black md:text-2xl">{unit.title}</h3>
                      <p className="mt-1 text-xs text-white/90 font-semibold">{unit.description}</p>
                    </div>
                  </div>

                  {/* Unit Content Body */}
                  <div className="p-6 md:p-8 space-y-6">
                    {unit.guidebook ? (
                      <div className="prose prose-slate max-w-none dark:prose-invert">
                        {unit.guidebook.split("\n\n").map((paragraph: string, index: number) => {
                          if (paragraph.startsWith("# ")) {
                            return null; // Skip redundant H1 since it is in the unit header
                          }
                          if (paragraph.startsWith("## ")) {
                            return (
                              <h4 key={index} className="font-black text-base text-[#3c3c3c] border-b pb-1.5 flex items-center gap-2 dark:text-white dark:border-[#37464f] mt-4 mb-2">
                                <ChevronRight className="h-4 w-4 text-duo-blue" />
                                {paragraph.replace("## ", "")}
                              </h4>
                            );
                          }
                          if (paragraph.startsWith("- ")) {
                            const items = paragraph.split("\n");
                            // If items look like a vocabulary list (word: definition), display in a nice grid
                            const isVocab = items.every(item => item.includes(":"));
                            if (isVocab) {
                              return (
                                <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  {items.map((item, iIdx) => {
                                    const parts = item.replace("- ", "").split(":");
                                    const basque = parts[0].trim();
                                    const english = parts.slice(1).join(":").trim();
                                    return (
                                      <div
                                        key={iIdx}
                                        className="group flex items-center justify-between rounded-2xl border-2 border-duo-gray-border bg-gray-50/70 p-3.5 transition hover:border-[#84d8ff] hover:bg-[#f7fbff] dark:border-[#37464f] dark:bg-[#131f24] dark:hover:bg-[#1c2e36]"
                                      >
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-black text-sm text-[#2e2e2e] dark:text-white">
                                              {basque}
                                            </span>
                                            <button
                                              onClick={() => sound.speak(basque)}
                                              className="rounded-lg p-1 text-duo-blue transition hover:bg-blue-100 dark:hover:bg-blue-950/40"
                                              title="Listen pronunciation"
                                            >
                                              <Volume2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                          <p className="text-xs font-bold text-[#4b4b4b] mt-0.5 dark:text-[#afafaf]">
                                            {english}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }

                            return (
                              <ul key={index} className="list-disc pl-5 space-y-1.5 text-sm font-medium dark:text-[#cfcfcf]">
                                {items.map((item, i) => (
                                  <li
                                    key={i}
                                    dangerouslySetInnerHTML={{
                                      __html: item
                                        .replace("- ", "")
                                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                        .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                                    }}
                                  />
                                ))}
                              </ul>
                            );
                          }
                          return (
                            <p
                              key={index}
                              className="text-sm leading-relaxed text-[#555555] dark:text-[#cfcfcf]"
                              dangerouslySetInnerHTML={{
                                __html: paragraph
                                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                  .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                              }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-[#777777] dark:text-[#afafaf]">
                        No grammar reference material available for this module yet.
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
