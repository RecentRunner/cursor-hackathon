"use client";

import { Heart, Zap } from "lucide-react";

import { WELLNESS_SCALE_MAX } from "@/lib/avatar-state";
import { cn } from "@/lib/utils";

type PixelGaugeProps = {
  type: "heart" | "energy";
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "overlay";
  /** Overlay icon size. Use "responsive" on the bit tab LCD. */
  overlaySize?: "md" | "lg" | "responsive";
};

export function PixelGauge({
  type,
  value,
  max = WELLNESS_SCALE_MAX,
  className,
  variant = "default",
  overlaySize = "md",
}: PixelGaugeProps) {
  const filled = Math.max(0, Math.min(max, Math.round(value)));
  const Icon = type === "heart" ? Heart : Zap;
  const label = type === "heart" ? "HP" : "NRG";
  const activeClass =
    type === "heart"
      ? "fill-rose-400 text-rose-400"
      : "fill-amber-300 text-amber-300";
  const emptyClass = "text-muted-foreground/35";
  const isOverlay = variant === "overlay";
  const overlayIconClass =
    overlaySize === "responsive"
      ? "h-[clamp(1.125rem,3.6vw,3rem)] w-[clamp(1.125rem,3.6vw,3rem)]"
      : overlaySize === "lg"
        ? "size-12"
        : "size-6";

  return (
    <div
      className={cn(
        "flex items-center",
        isOverlay ? "gap-1" : "gap-1.5",
        className,
      )}
      aria-label={`${label}: ${filled} of ${max}`}
    >
      {!isOverlay ? (
        <span className="w-7 shrink-0 text-[9px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      ) : null}
      <div
        className={cn(
          "flex items-center",
          isOverlay
            ? overlaySize === "responsive"
              ? "gap-0.5 sm:gap-1"
              : "gap-1"
            : "gap-0.5",
        )}
      >
        {Array.from({ length: max }, (_, index) => (
          <Icon
            key={`${type}-${index}`}
            className={cn(
              "shrink-0 stroke-[2.5]",
              isOverlay ? overlayIconClass : "size-4",
              index < filled ? activeClass : emptyClass,
            )}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
