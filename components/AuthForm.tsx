"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";

interface AuthFormProps {
  initialMode?: "login" | "signup";
}

export function AuthForm({ initialMode = "login" }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMode = () => {
    sound.playClick();
    setError(null);
    setMode(mode === "login" ? "signup" : "login");
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setError(null);

    if (!username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      // Success: redirect to dashboard
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border-2 border-duo-gray-border bg-white p-8 shadow-xl transition-colors duration-200 dark:border-[#37464f] dark:bg-[#182c34]">
      {/* Branding */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="relative mb-3 h-16 w-16 animate-bounce">
          <Image
            src="/mascot.svg"
            alt="Hitzak Mascot"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl font-black tracking-wide text-[#3c3c3c] dark:text-white">
          {mode === "login" ? "Welcome Back!" : "Start Learning!"}
        </h1>
        <p className="mt-1 text-xs font-bold text-[#777777] dark:text-[#afafaf] uppercase tracking-wider">
          {mode === "login"
            ? "Sign in to resume your Basque journey"
            : "Create an account to track your milestones"}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex rounded-2xl bg-gray-100 p-1 dark:bg-[#131f24]">
        <button
          type="button"
          onClick={() => {
            if (mode !== "login") toggleMode();
          }}
          className={cn(
            "flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all",
            mode === "login"
              ? "bg-white text-duo-blue shadow-sm dark:bg-[#182c34] dark:text-white"
              : "text-[#777777] hover:text-[#4b4b4b] dark:text-[#afafaf] dark:hover:text-white"
          )}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            if (mode !== "signup") toggleMode();
          }}
          className={cn(
            "flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all",
            mode === "signup"
              ? "bg-white text-duo-green-dark shadow-sm dark:bg-[#182c34] dark:text-white"
              : "text-[#777777] hover:text-[#4b4b4b] dark:text-[#afafaf] dark:hover:text-white"
          )}
        >
          Sign Up
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-2xl border-2 border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 animate-in fade-in slide-in-from-top-1">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-[#777777] dark:text-[#afafaf]">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-[#afafaf]" />
            <input
              type="text"
              placeholder="e.g. euskaldun_99"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border-2 border-duo-gray-border bg-gray-50/50 py-3 pl-11 pr-4 text-sm font-bold outline-none transition focus:border-duo-blue dark:border-[#37464f] dark:bg-[#131f24] dark:focus:border-duo-blue"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-[#777777] dark:text-[#afafaf]">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-[#afafaf]" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border-2 border-duo-gray-border bg-gray-50/50 py-3 pl-11 pr-12 text-sm font-bold outline-none transition focus:border-duo-blue dark:border-[#37464f] dark:bg-[#131f24] dark:focus:border-duo-blue"
            />
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowPassword(!showPassword);
              }}
              className="absolute right-4 top-3.5 text-[#afafaf] hover:text-[#777777] dark:hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "mt-4 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black uppercase tracking-wider text-white transition active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed",
            mode === "login"
              ? "duo-btn-blue text-white"
              : "duo-btn-green text-white"
          )}
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Mode Switch Footer Link */}
      <div className="mt-6 border-t border-duo-gray-border pt-4 text-center dark:border-[#37464f]">
        <button
          type="button"
          onClick={toggleMode}
          className="text-xs font-bold text-duo-blue hover:underline"
        >
          {mode === "login"
            ? "Don't have an account yet? Create one for free!"
            : "Already have an account? Sign in here!"}
        </button>
      </div>
    </div>
  );
}
