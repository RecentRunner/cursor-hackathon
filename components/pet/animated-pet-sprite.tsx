"use client";

import { useEffect, useState } from "react";

import { CharacterLayerPreview } from "@/components/character/character-layer-preview";
import { PetEmotionBubble } from "@/components/pet/pet-emotion-bubble";
import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import type { AvatarMood } from "@/lib/avatar-state";
import {
  PET_WANDER_BOUNDS,
  PET_WANDER_START,
} from "@/lib/pet-wander-bounds";
import { cn } from "@/lib/utils";

type AnimatedPetSpriteProps = {
  customization: AvatarCustomization;
  className?: string;
  petScale?: number;
  interactive?: boolean;
  onInteract?: () => void;
  emotionVisible?: boolean;
  mood?: AvatarMood;
};

type WanderPosition = {
  x: number;
  y: number;
  facing: "left" | "right";
};

const { minX: MIN_X, maxX: MAX_X, minY: MIN_Y, maxY: MAX_Y } =
  PET_WANDER_BOUNDS;

function randomPosition(current?: WanderPosition): WanderPosition {
  let next: WanderPosition = {
    x: MIN_X + Math.random() * (MAX_X - MIN_X),
    y: MIN_Y + Math.random() * (MAX_Y - MIN_Y),
    facing: Math.random() > 0.5 ? "right" : "left",
  };

  if (current) {
    let attempts = 0;
    while (
      attempts < 6 &&
      Math.hypot(next.x - current.x, next.y - current.y) < 8
    ) {
      next = {
        x: MIN_X + Math.random() * (MAX_X - MIN_X),
        y: MIN_Y + Math.random() * (MAX_Y - MIN_Y),
        facing: next.x >= current.x ? "right" : "left",
      };
      attempts += 1;
    }
  }

  return next;
}

export function AnimatedPetSprite({
  customization,
  className,
  petScale = 7,
  interactive = false,
  onInteract,
  emotionVisible = false,
  mood = "neutral",
}: AnimatedPetSpriteProps) {
  const [position, setPosition] = useState<WanderPosition>({
    x: PET_WANDER_START.x,
    y: PET_WANDER_START.y,
    facing: "right",
  });

  useEffect(() => {
    let timeoutId: number | undefined;

    const scheduleWander = () => {
      const delay = 1800 + Math.random() * 3200;
      timeoutId = window.setTimeout(() => {
        setPosition((current) => randomPosition(current));
        scheduleWander();
      }, delay);
    };

    scheduleWander();
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleActivate = () => {
    if (!interactive) {
      return;
    }

    onInteract?.();
  };

  return (
    <div
      className={cn(
        "absolute z-10",
        interactive
          ? "pointer-events-auto cursor-pointer"
          : "pointer-events-none",
        className,
      )}
      style={{
        left: `${position.x}%`,
        bottom: `${position.y}%`,
        transform: "translateX(-50%)",
        transition: "left 1.8s steps(10), bottom 1.8s steps(10)",
      }}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? "Check how your bit is feeling" : undefined}
      onClick={(event) => {
        event.stopPropagation();
        handleActivate();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          handleActivate();
        }
      }}
    >
      <PetEmotionBubble mood={mood} visible={emotionVisible} />
      <div
        style={{
          transform: position.facing === "left" ? "scaleX(-1)" : undefined,
        }}
      >
        <div className="animate-pet-breathe origin-bottom">
          <CharacterLayerPreview
            colors={customization.colors}
            variants={customization.variants}
            equippedItems={customization.equippedItems}
            scale={petScale}
            compact
            className="!h-auto max-h-none"
          />
        </div>
      </div>
    </div>
  );
}
