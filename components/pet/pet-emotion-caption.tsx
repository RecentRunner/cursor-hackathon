"use client";

import type { AvatarMood } from "@/lib/avatar-state";
import { getPetEmotionMessage } from "@/lib/pet-status";
import { cn } from "@/lib/utils";

type PetEmotionCaptionProps = {
  mood: AvatarMood;
  visible: boolean;
  className?: string;
};

export function PetEmotionCaption({
  mood,
  visible,
  className,
}: PetEmotionCaptionProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-2 bottom-2 z-30 flex justify-center",
        "animate-emotion-pop",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <p className="lcd-readable-label max-w-full">{getPetEmotionMessage(mood)}</p>
    </div>
  );
}
