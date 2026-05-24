"use client";

import type { AvatarMood } from "@/lib/avatar-state";
import { getPetStatusImagePath } from "@/lib/pet-status";
import { cn } from "@/lib/utils";

type PetEmotionBubbleProps = {
  mood: AvatarMood;
  visible: boolean;
  className?: string;
};

export function PetEmotionBubble({
  mood,
  visible,
  className,
}: PetEmotionBubbleProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 w-[clamp(3.5rem,18vw,5.5rem)] -translate-x-1/2",
        className,
      )}
      aria-hidden
    >
      <div className="animate-emotion-pop">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getPetStatusImagePath(mood)}
          alt=""
          className="h-auto w-full object-contain image-pixelated"
        />
      </div>
    </div>
  );
}
