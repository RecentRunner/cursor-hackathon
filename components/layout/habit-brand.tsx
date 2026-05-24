"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const HABIT_LOGO_SRC = "/habit-logo.png";

type HabitBrandProps = {
  className?: string;
};

export function HabitBrand({ className }: HabitBrandProps) {
  const [useText, setUseText] = useState(false);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border-2 border-border bg-card/80 px-3 py-1.5 shadow-[var(--retro-shadow-sm)]",
        className,
      )}
      aria-label="HaBit"
    >
      {!useText ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={HABIT_LOGO_SRC}
          alt=""
          className="size-6 image-pixelated"
          onError={() => setUseText(true)}
        />
      ) : (
        <span
          className="select-none text-[10px] uppercase tracking-widest text-primary"
          aria-hidden="true"
        >
          HaBit
        </span>
      )}
    </div>
  );
}
