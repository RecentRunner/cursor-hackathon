"use client";

import Link from "next/link";
import { useState } from "react";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const HABIT_LOGO_SRC = "/habit-logo.png";

type HabitBrandProps = {
  className?: string;
  href?: string;
  "aria-current"?: "page" | undefined;
};

export function HabitBrand({
  className,
  href = routes.home,
  "aria-current": ariaCurrent,
}: HabitBrandProps) {
  const [useText, setUseText] = useState(false);

  return (
    <Link
      href={href}
      aria-label="Go to home"
      aria-current={ariaCurrent}
      className={cn(
        "group flex shrink-0 items-center justify-center border-2 border-border bg-card/80 px-3 py-1.5 shadow-[var(--retro-shadow-sm)] transition-transform hover:-translate-y-0.5 hover:border-primary/60",
        className,
      )}
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
          className="font-pixel select-none text-[10px] uppercase tracking-widest text-primary"
          aria-hidden="true"
        >
          HaBit
        </span>
      )}
    </Link>
  );
}
