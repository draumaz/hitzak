"use client";

import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { SchemaExplorer } from "@/components/schema/SchemaExplorer";

export default function SchemaPage() {
  return (
    <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-[#131f24] dark:text-[#f7f7f7]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex flex-col md:pl-64">
        <TopHeader hearts={5} streak={0} points={0} />

        <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
          <SchemaExplorer />
        </main>
      </div>
    </div>
  );
}
