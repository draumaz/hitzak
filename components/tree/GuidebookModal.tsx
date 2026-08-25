"use client";

import { X, BookOpen, ChevronRight } from "lucide-react";
import { sound } from "@/lib/sound";

interface GuidebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  guidebookText: string;
  unitColor: string;
}

export function GuidebookModal({
  isOpen,
  onClose,
  title,
  guidebookText,
  unitColor,
}: GuidebookModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border-2 border-duo-gray-border bg-white shadow-2xl overflow-hidden dark:border-[#37464f] dark:bg-[#182c34]">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 text-white"
          style={{ backgroundColor: unitColor }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-white/80">
                Guidebook & Grammar Notes
              </span>
              <h3 className="text-xl font-black">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-white/80 hover:bg-white/20 transition"
          >
            <X className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-[#3c3c3c] dark:text-[#f7f7f7]">
          <div className="prose prose-slate max-w-none dark:prose-invert">
            {guidebookText.split("\n\n").map((paragraphBlock, index) => {
              const paragraph = paragraphBlock.trim();
              if (paragraph.startsWith("# ")) {
                return (
                  <h3 key={index} className="text-2xl font-black text-[#2e2e2e] dark:text-white border-b pb-2 mb-4 dark:border-[#37464f]">
                    {paragraph.replace("# ", "").trim()}
                  </h3>
                );
              }
              if (paragraph.startsWith("## ")) {
                return (
                  <h4 key={index} className="font-black text-base text-[#3c3c3c] border-b pb-1.5 flex items-center gap-2 dark:text-white dark:border-[#37464f] mt-4 mb-2">
                    <ChevronRight className="h-4 w-4 text-duo-blue" />
                    {paragraph.replace("## ", "").trim()}
                  </h4>
                );
              }
              if (paragraph.startsWith("### ")) {
                return (
                  <h5 key={index} className="font-black text-sm text-[#4b4b4b] dark:text-[#f7f7f7] mt-3 mb-1">
                    {paragraph.replace("### ", "").trim()}
                  </h5>
                );
              }
              if (paragraph.startsWith("#### ")) {
                return (
                  <h6 key={index} className="font-bold text-xs text-[#777777] dark:text-[#afafaf] mt-2 mb-1 italic">
                    {paragraph.replace("#### ", "").trim()}
                  </h6>
                );
              }
              
              const firstChar = paragraph.charAt(0);
              if (firstChar === "-" || firstChar === "*" || firstChar === "+") {
                const items = paragraphBlock.split("\n");
                const validItems = items.filter(item => item.trim() !== "");
                
                // If items look like a vocabulary list (word: definition), display in a nice grid
                const isVocab = validItems.every(item => item.includes(":"));
                if (isVocab) {
                  return (
                    <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {validItems.map((item, iIdx) => {
                        const cleanItem = item.replace(/^\s*[\-\*\+]\s*/, "");
                        const colonIdx = cleanItem.indexOf(":");
                        if (colonIdx === -1) return null;
                        const basque = cleanItem.substring(0, colonIdx).trim();
                        const english = cleanItem.substring(colonIdx + 1).trim();
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
                    {validItems.map((item, i) => {
                      const isNested = /^\s{2,}/.test(item);
                      const cleanItem = item.replace(/^\s*[\-\*\+]\s*/, "");
                      return (
                        <li
                          key={i}
                          className={isNested ? "ml-6 list-[circle]" : ""}
                          dangerouslySetInnerHTML={{
                            __html: cleanItem
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                          }}
                        />
                      );
                    })}
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
        </div>

        {/* Footer */}
        <div className="border-t-2 border-duo-gray-border p-4 bg-gray-50 dark:border-[#37464f] dark:bg-[#131f24] flex justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl px-6 py-3 font-black text-sm uppercase tracking-wider text-white shadow-3d-green transition active:translate-y-1"
            style={{ backgroundColor: unitColor }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
