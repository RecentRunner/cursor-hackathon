"use client";

import { useEffect, useState } from "react";

import { AnimatedPetSprite } from "@/components/pet/animated-pet-sprite";
import { ParallaxRoomBackground } from "@/components/pet/parallax-room-background";
import { PixelGauge } from "@/components/pet/pixel-gauge";
import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import {
  defaultAvatarCondition,
  type AvatarCondition,
} from "@/lib/avatar-state";
import { getAvatarConditionForToday } from "@/lib/daily-quiz-storage";
import {
  normalizeRoomBackgroundId,
  type RoomBackgroundId,
} from "@/lib/room-backgrounds";
import { cn } from "@/lib/utils";

type PetHabitatProps = {
  customization: AvatarCustomization;
  className?: string;
};

const MOOD_LABELS = {
  happy: "HAPPY",
  neutral: "OKAY",
  tired: "SLEEPY",
} as const;

export function PetHabitat({ customization, className }: PetHabitatProps) {
  const [condition, setCondition] = useState<AvatarCondition>(
    defaultAvatarCondition,
  );
  const [isReady, setIsReady] = useState(false);
  const roomId = normalizeRoomBackgroundId(customization.roomBackground);

  useEffect(() => {
    async function loadStatus() {
      setCondition((await getAvatarConditionForToday()) ?? defaultAvatarCondition);
      setIsReady(true);
    }

    void loadStatus();
  }, []);

  if (!isReady) {
    return (
      <div className={cn("tamagotchi-shell p-4", className)}>
        <p className="text-center text-[10px] text-muted-foreground">
          Waking up pet...
        </p>
      </div>
    );
  }

  return (
    <div className={cn("tamagotchi-shell overflow-hidden p-3 sm:p-4", className)}>
      <div className="mb-3 border-b-2 border-border/60 pb-3">
        <p className="text-sm text-foreground">{customization.name}</p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-secondary">
          {MOOD_LABELS[condition.mood]}
        </p>
      </div>

      <div className="tamagotchi-lcd tamagotchi-lcd-pet-match relative">
        <ParallaxRoomBackground roomId={roomId as RoomBackgroundId} />
        <AnimatedPetSprite customization={customization} />
        <div className="pointer-events-none absolute left-2 top-2 z-20 grid gap-1.5">
          <PixelGauge type="heart" value={condition.health} variant="overlay" />
          <PixelGauge type="energy" value={condition.energy} variant="overlay" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-8 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
    </div>
  );
}
