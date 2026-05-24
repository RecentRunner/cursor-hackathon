"use client";

import { useEffect, useState } from "react";

import { AnimatedPetSprite } from "@/components/pet/animated-pet-sprite";
import { ParallaxRoomBackground } from "@/components/pet/parallax-room-background";
import { PetStyleLink } from "@/components/pet/pet-style-link";
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
  fillViewport?: boolean;
  showStyleLink?: boolean;
};

const MOOD_LABELS = {
  happy: "HAPPY",
  neutral: "OKAY",
  tired: "SLEEPY",
} as const;

export function PetHabitat({
  customization,
  className,
  fillViewport = false,
  showStyleLink = true,
}: PetHabitatProps) {
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

  const shellClassName = cn(
    "tamagotchi-shell overflow-hidden p-3 sm:p-4",
    fillViewport && "tamagotchi-shell-fill",
    className,
  );

  const lcdClassName = cn(
    "tamagotchi-lcd relative",
    fillViewport ? "tamagotchi-lcd-pet-fill" : "tamagotchi-lcd-pet-match",
  );

  if (!isReady) {
    return (
      <div className={shellClassName}>
        <p className="text-center text-[10px] text-muted-foreground">
          Waking up pet...
        </p>
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      <div className="mb-3 shrink-0 border-b-2 border-border/60 pb-3">
        <p className="text-sm text-foreground">{customization.name}</p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-secondary">
          {MOOD_LABELS[condition.mood]}
        </p>
      </div>

      <div className={lcdClassName}>
        <ParallaxRoomBackground roomId={roomId as RoomBackgroundId} />
        <AnimatedPetSprite customization={customization} />
        <div className="pointer-events-none absolute left-2 top-2 z-20 grid gap-1.5">
          <PixelGauge type="heart" value={condition.health} variant="overlay" />
          <PixelGauge type="energy" value={condition.energy} variant="overlay" />
        </div>
        {showStyleLink ? (
          <div className="absolute right-2 top-2 z-20">
            <PetStyleLink />
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-8 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
    </div>
  );
}
