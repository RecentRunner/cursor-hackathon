"use client";

import { useCallback, useEffect, useState } from "react";

import { PetHabitat } from "@/components/pet/pet-habitat";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import {
  getAvatarCustomization,
  type AvatarCustomization,
} from "@/lib/avatar-customization-storage";

export function AvatarPageContent() {
  const [customization, setCustomization] = useState<AvatarCustomization | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCustomization = useCallback(async () => {
    try {
      setLoadError(null);
      setCustomization(await getAvatarCustomization());
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not load your avatar.",
      );
    }
  }, []);

  useEffect(() => {
    void loadCustomization();

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, loadCustomization);
    return () => {
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, loadCustomization);
    };
  }, [loadCustomization]);

  if (loadError) {
    return <p className="text-xs text-red-500">{loadError}</p>;
  }

  if (!customization) {
    return (
      <p className="text-xs text-muted-foreground">Loading your pet...</p>
    );
  }

  return <PetHabitat customization={customization} />;
}
