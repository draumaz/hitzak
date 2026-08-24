"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Compass,
  BookOpen,
  Database,
  GraduationCap,
  Trophy,
  Zap,
  ShoppingBag,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { sound } from "@/lib/sound";

const NAV_ITEMS = [
  { href: "/", label: "Learn", icon: Compass },
  { href: "/guidebooks", label: "Guidebooks", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r-2 border-duo-gray-border bg-white px-4 py-6 md:flex z-30 transition-colors duration-200 dark:border-[#37464f] dark:bg-[#131f24]">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 px-3 py-2">
        <div className="relative h-10 w-10 shrink-0">
          <Image
            src="/mascot.svg"
            alt="Hitzak Mascot"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col">
          <span className="font-black tracking-wider text-[10px] text-duo-green-dark dark:text-duo-green">
            HITZAK
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#afafaf]">
            learn basque!
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="mt-6 flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/" && pathname.startsWith("/learn"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-wider transition-all",
                isActive
                  ? "border-2 border-[#84d8ff] bg-[#ddf4ff] text-[#1899d6] dark:border-[#1899d6] dark:bg-[#1899d6]/20 dark:text-[#1cb0f6]"
                  : "border-2 border-transparent text-[#777777] hover:bg-[#f7f7f7] hover:text-[#4b4b4b] dark:text-[#afafaf] dark:hover:bg-[#182c34] dark:hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-110",
                  isActive ? "text-[#1899d6] dark:text-[#1cb0f6]" : "text-[#afafaf]"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Controls: Quick Theme Toggle & Course Card */}
      <div className="mt-auto flex flex-col gap-2 pt-4">
        {/* Quick Dark/Light Mode Pill Button */}
        <button
          onClick={() => {
            sound.playClick();
            toggleTheme();
          }}
          className="flex items-center justify-between rounded-2xl border-2 border-duo-gray-border bg-gray-50 px-4 py-2.5 text-xs font-black text-[#4b4b4b] transition hover:bg-gray-100 dark:border-[#37464f] dark:bg-[#182c34] dark:text-[#f7f7f7] dark:hover:bg-[#203a45]"
        >
          <div className="flex items-center gap-2">
            {resolvedTheme === "dark" ? (
              <Moon className="h-4 w-4 text-duo-yellow" />
            ) : (
              <Sun className="h-4 w-4 text-duo-orange" />
            )}
            <span>{resolvedTheme === "dark" ? "Dark Mode" : "Light Mode"}</span>
          </div>
          <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-black uppercase dark:bg-black/20">
            {resolvedTheme === "dark" ? "ON" : "OFF"}
          </span>
        </button>
      </div>
    </aside>
  );
}
