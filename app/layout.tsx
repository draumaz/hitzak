import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Hitzak",
  description: "A 46-module Duolingo-style Basque learning platform with interactive morphology lessons, grammar coaching, audio exercises, and A1-C1 curriculum.",
  icons: {
    icon: "/mascot.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-[#3c3c3c] antialiased transition-colors duration-200 selection:bg-duo-green-light selection:text-duo-green-dark dark:bg-[#131f24] dark:text-[#f7f7f7]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
