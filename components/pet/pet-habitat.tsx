"use client";

import { useEffect, useState } from "react";

import { AnimatedPetSprite } from "@/components/pet/animated-pet-sprite";
import { ParallaxRoomBackground } from "@/components/pet/parallax-room-background";
import { PetNameHeader } from "@/components/pet/pet-name-header";
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
  nameEditable?: boolean;
  onNameChange?: (name: string) => void;
  petScale?: number;
  lcdClassName?: string;
  lcdRef?: React.Ref<HTMLDivElement>;
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
  nameEditable = true,
  onNameChange,
  petScale,
  lcdClassName: lcdClassNameOverride,
  lcdRef,
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
    fillViewport
      ? "tamagotchi-lcd-pet-fill"
      : (lcdClassNameOverride ?? "tamagotchi-lcd-pet-match"),
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
      <PetNameHeader
        name={customization.name}
        moodLabel={MOOD_LABELS[condition.mood]}
        editable={nameEditable}
        onNameChange={onNameChange}
      />

      <div ref={lcdRef} className={lcdClassName}>
        <ParallaxRoomBackground roomId={roomId as RoomBackgroundId} />
        <AnimatedPetSprite customization={customization} petScale={petScale} />
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
