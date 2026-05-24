"use client";

import { useCallback, useEffect, useState } from "react";

import { CharacterCreator } from "@/components/character/character-creator";
import { useToast } from "@/components/ui/toast-provider";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import {
  getAvatarCustomization,
  saveAvatarCustomization,
  type AvatarCustomization,
} from "@/lib/avatar-customization-storage";
import { getOwnedItemIds } from "@/lib/shop-storage";

export function CustomizePageContent() {
  const { toast } = useToast();
  const [customization, setCustomization] = useState<AvatarCustomization | null>(
    null,
  );
  const [avatarName, setAvatarName] = useState("");
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [ownedVariantIds, setOwnedVariantIds] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCustomization = useCallback(async () => {
    try {
      setLoadError(null);
      const [next, owned] = await Promise.all([
        getAvatarCustomization(),
        getOwnedItemIds(),
      ]);
      setCustomization(next);
      setAvatarName(next.name);
      setOwnedVariantIds(owned);
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

  const handleSaveAvatar = async (nextCustomization: AvatarCustomization) => {
    setIsSavingAvatar(true);

    try {
      await saveAvatarCustomization({
        ...nextCustomization,
        name: avatarName.trim() || nextCustomization.name,
        equippedItems: customization?.equippedItems ?? [],
      });
      toast("Avatar updated.", "success");
      await loadCustomization();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not save avatar.",
        "error",
      );
      throw error;
    } finally {
      setIsSavingAvatar(false);
    }
  };

  if (loadError) {
    return <p className="text-xs text-red-500">{loadError}</p>;
  }

  if (!customization) {
    return <p className="text-xs text-muted-foreground">Loading customization...</p>;
  }

  return (
    <CharacterCreator
      key={`${customization.variants.head}-${customization.variants.torso}-${customization.colors.skin.l}-${customization.roomBackground}-${avatarName}`}
      initialCustomization={{
        ...customization,
        name: avatarName,
      }}
      name={avatarName}
      onNameChange={setAvatarName}
      ownedVariantIds={ownedVariantIds}
      showNameField
      saveLabel={isSavingAvatar ? "Saving..." : "Save changes"}
      isSaving={isSavingAvatar}
      onSave={handleSaveAvatar}
    />
  );
}
