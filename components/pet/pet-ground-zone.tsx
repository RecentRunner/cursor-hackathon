"use client";

import { PET_GROUND_ZONE_HEIGHT_RATIO } from "@/lib/pet-wander-bounds";
import { cn } from "@/lib/utils";

type PetGroundZoneProps = {
  children: React.ReactNode;
  className?: string;
};

export function PetGroundZone({ children, className }: PetGroundZoneProps) {
  return (
    <div
      className={cn("absolute inset-x-0 bottom-0 z-10", className)}
      style={{ height: `${PET_GROUND_ZONE_HEIGHT_RATIO * 100}%` }}
    >
      {children}
    </div>
  );
}
