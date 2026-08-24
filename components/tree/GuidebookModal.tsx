"use client";

import { X, BookOpen } from "lucide-react";

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
            {guidebookText.split("\n\n").map((paragraph, index) => {
              if (paragraph.startsWith("# ")) {
                return (
                  <h1 key={index} className="text-2xl font-black text-[#2e2e2e] dark:text-white border-b pb-2 mb-4 dark:border-[#37464f]">
                    {paragraph.replace("# ", "")}
                  </h1>
                );
              }
              if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={index} className="text-lg font-black text-[#3c3c3c] dark:text-white mt-4 mb-2">
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("- ")) {
                const items = paragraph.split("\n");
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
