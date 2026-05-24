"use client";

import Link from "next/link";
import { useState } from "react";

import { HABIT_LOGO_SRC } from "@/lib/brand";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const logoSizeClass = {
  sm: "h-6 w-auto max-h-6",
  md: "h-8 w-auto max-h-8",
  /** Compact — leaves vertical padding inside the top bar */
  nav: "h-7 w-auto max-h-7 sm:h-8 sm:max-h-8",
  lg: "h-12 w-auto max-h-12 sm:h-14",
  hero: "h-16 w-auto max-h-16 sm:h-20 md:h-24",
} as const;

type HabitBrandProps = {
  className?: string;
  href?: string;
  size?: keyof typeof logoSizeClass;
  /** Show retro frame around the logo (top bar / site header). */
  framed?: boolean;
  "aria-current"?: "page" | undefined;
};

export function HabitBrand({
  className,
  href = routes.home,
  size = "sm",
  framed = true,
  "aria-current": ariaCurrent,
}: HabitBrandProps) {
  const [useText, setUseText] = useState(false);

  return (
    <Link
      href={href}
      aria-label="HaBit home"
      aria-current={ariaCurrent}
      className={cn(
        "group inline-flex shrink-0 items-center justify-center transition-transform hover:-translate-y-0.5",
        framed &&
          "border-2 border-border bg-card/80 px-3 py-1.5 shadow-[var(--retro-shadow-sm)] hover:border-primary/60",
        !framed && "rounded-sm hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {!useText ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={HABIT_LOGO_SRC}
          alt="HaBit"
          className={cn("image-pixelated object-contain", logoSizeClass[size])}
          onError={() => setUseText(true)}
        />
      ) : (
        <span
          className={cn(
            "font-pixel select-none uppercase tracking-widest text-primary",
            size === "hero" ? "text-base sm:text-lg" : "text-[10px]",
          )}
        >
          HaBit
        </span>
      )}
    </Link>
  );
}
