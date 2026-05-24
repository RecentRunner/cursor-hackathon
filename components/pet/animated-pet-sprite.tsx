"use client";

import { useEffect, useState } from "react";

import { CharacterLayerPreview } from "@/components/character/character-layer-preview";
import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import {
  PET_WANDER_BOUNDS,
  PET_WANDER_START,
} from "@/lib/pet-wander-bounds";
import { cn } from "@/lib/utils";

type AnimatedPetSpriteProps = {
  customization: AvatarCustomization;
  className?: string;
  petScale?: number;
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

  return (
    <div
      className={cn("pointer-events-none absolute z-10", className)}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -100%)",
        transition: "left 1.8s steps(10), top 1.8s steps(10)",
      }}
    >
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
