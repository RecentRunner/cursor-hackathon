"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AnimatedPetSprite } from "@/components/pet/animated-pet-sprite";
import { PetEmotionCaption } from "@/components/pet/pet-emotion-caption";
import { ParallaxRoomBackground } from "@/components/pet/parallax-room-background";
import { PixelGauge } from "@/components/pet/pixel-gauge";
import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import {
  defaultAvatarCondition,
  type AvatarCondition,
} from "@/lib/avatar-state";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import { getAvatarConditionForToday } from "@/lib/daily-quiz-storage";
import { PET_EMOTION_DISPLAY_MS } from "@/lib/pet-status";
import {
  normalizeRoomBackgroundId,
  type RoomBackgroundId,
} from "@/lib/room-backgrounds";
import { cn } from "@/lib/utils";

type PetHabitatProps = {
  customization: AvatarCustomization;
  className?: string;
  fillViewport?: boolean;
  /** Bit name in the LCD top-right (landing preview). */
  nameInLcd?: boolean;
  petScale?: number;
  lcdClassName?: string;
  lcdRef?: React.Ref<HTMLDivElement>;
};

export function PetHabitat({
  customization,
  className,
  fillViewport = false,
  nameInLcd = false,
  petScale,
  lcdClassName: lcdClassNameOverride,
  lcdRef,
}: PetHabitatProps) {
  const [condition, setCondition] = useState<AvatarCondition>(
    defaultAvatarCondition,
  );
  const [isReady, setIsReady] = useState(false);
  const [emotionVisible, setEmotionVisible] = useState(false);
  const emotionTimeoutRef = useRef<number | null>(null);
  const roomId = normalizeRoomBackgroundId(customization.roomBackground);
  const interactive = fillViewport;

  const clearEmotionTimeout = useCallback(() => {
    if (emotionTimeoutRef.current !== null) {
      window.clearTimeout(emotionTimeoutRef.current);
      emotionTimeoutRef.current = null;
    }
  }, []);

  const showEmotionBriefly = useCallback(() => {
    clearEmotionTimeout();
    setEmotionVisible(true);
    emotionTimeoutRef.current = window.setTimeout(() => {
      setEmotionVisible(false);
      emotionTimeoutRef.current = null;
    }, PET_EMOTION_DISPLAY_MS);
  }, [clearEmotionTimeout]);

  const loadStatus = useCallback(async () => {
    setCondition((await getAvatarConditionForToday()) ?? defaultAvatarCondition);
    setIsReady(true);
  }, []);

  useEffect(() => {
    void loadStatus();

    return () => {
      clearEmotionTimeout();
    };
  }, [loadStatus, clearEmotionTimeout]);

  useEffect(() => {
    const handleDataUpdated = () => {
      void loadStatus();
    };

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, handleDataUpdated);

    return () => {
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, handleDataUpdated);
    };
  }, [loadStatus]);

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

  const gaugeOverlaySize = fillViewport ? "responsive" : "md";
  const showNameAboveShell = !fillViewport && !nameInLcd;
  const showNameInLcdOverlay = fillViewport || nameInLcd;

  if (!isReady) {
    return (
      <div className={shellClassName}>
        <p className="text-center text-[10px] text-muted-foreground">
          Waking up your bit...
        </p>
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      {showNameAboveShell ? (
        <div className="mb-3 shrink-0 border-b-2 border-border/60 pb-3">
          <p className="text-sm text-foreground">{customization.name}</p>
        </div>
      ) : null}

      <div ref={lcdRef} className={lcdClassName}>
        <ParallaxRoomBackground roomId={roomId as RoomBackgroundId} />
        <AnimatedPetSprite
          customization={customization}
          petScale={petScale}
          interactive={interactive}
          emotionVisible={emotionVisible}
          mood={condition.mood}
          onInteract={showEmotionBriefly}
        />
        <PetEmotionCaption mood={condition.mood} visible={emotionVisible} />
        <div className="pointer-events-none absolute left-2 top-2 z-20 grid gap-1 sm:gap-1.5">
          <PixelGauge
            type="heart"
            value={condition.health}
            variant="overlay"
            overlaySize={gaugeOverlaySize}
          />
          <PixelGauge
            type="energy"
            value={condition.energy}
            variant="overlay"
            overlaySize={gaugeOverlaySize}
          />
        </div>
        {showNameInLcdOverlay ? (
          <p
            className={cn(
              "pointer-events-none absolute right-2 top-2 z-20 max-w-[52%] truncate text-right lcd-readable-name",
              fillViewport
                ? "text-sm sm:text-base md:text-lg"
                : "lcd-readable-name-landing",
            )}
          >
            {customization.name}
          </p>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-8 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
    </div>
  );
}
