"use client";

import { Heart, X, Sparkles } from "lucide-react";
import { sound } from "@/lib/sound";

interface HeartRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  hearts: number;
  gems?: number;
  onRefill: () => void;
}

export function HeartRefillModal({
  isOpen,
  onClose,
  hearts,
  onRefill,
}: HeartRefillModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-duo-gray-border bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-duo-red-light">
            <Heart className="h-10 w-10 fill-duo-red text-duo-red animate-pulse" />
          </div>

          <h3 className="text-2xl font-extrabold text-[#3c3c3c]">
            {hearts >= 5 ? "Hearts are Full!" : "Refill Your Hearts"}
          </h3>

          <p className="mt-2 text-sm text-[#777777] leading-relaxed">
            You currently have <span className="font-extrabold text-duo-red">{hearts}/5 hearts</span>. Making mistakes is an essential part of learning Basque!
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {hearts < 5 ? (
              <button
                onClick={() => {
                  sound.playVictory();
                  onRefill();
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-duo-green px-5 py-4 font-extrabold text-sm uppercase tracking-wider text-white shadow-3d-green transition active:translate-y-1 hover:brightness-105"
              >
                <Sparkles className="h-5 w-5" />
                <span>Refill Hearts (5/5)</span>
              </button>
            ) : null}

            <button
              onClick={onClose}
              className="rounded-2xl border-2 border-duo-gray-border bg-white py-3 font-extrabold text-sm uppercase tracking-wider text-[#777777] hover:bg-gray-50 transition"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
