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
import { normalizeRoomBackgroundId } from "@/lib/room-backgrounds";
import type { ShopItemRecord } from "@/lib/shop-catalog";
import { getShopInventory } from "@/lib/shop-storage";

export function CustomizePageContent() {
  const { toast } = useToast();
  const [customization, setCustomization] = useState<AvatarCustomization | null>(
    null,
  );
  const [avatarName, setAvatarName] = useState("");
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [ownedVariantIds, setOwnedVariantIds] = useState<string[]>([]);
  const [equippedItems, setEquippedItems] = useState<string[]>([]);
  const [shopItems, setShopItems] = useState<ShopItemRecord[]>([]);
  const [coins, setCoins] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  const loadCustomization = useCallback(async () => {
    try {
      setLoadError(null);
      const [next, inventory] = await Promise.all([
        getAvatarCustomization(),
        getShopInventory(),
      ]);
      setCustomization({
        ...next,
        equippedItems: inventory.equippedItems,
        roomBackground: normalizeRoomBackgroundId(
          inventory.equippedRoomBackground,
        ),
      });
      setAvatarName(next.name);
      setOwnedVariantIds(inventory.ownedItemIds);
      setEquippedItems(inventory.equippedItems);
      setShopItems(inventory.items);
      setCoins(inventory.coins);
      setEditorKey((current) => current + 1);
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
      key={editorKey}
      initialCustomization={{
        ...customization,
        name: avatarName,
      }}
      name={avatarName}
      onNameChange={setAvatarName}
      ownedVariantIds={ownedVariantIds}
      shopItems={shopItems}
      coins={coins}
      equippedItems={equippedItems}
      onShopDataChange={loadCustomization}
      showNameField
      saveLabel={isSavingAvatar ? "Saving..." : "Save changes"}
      isSaving={isSavingAvatar}
      onSave={handleSaveAvatar}
    />
  );
}
