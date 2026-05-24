"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { CharacterCreator } from "@/components/character/character-creator";
import { AvatarStatusCard } from "@/components/avatar/avatar-status-card";
import { DailyQuizLinkButton } from "@/components/daily-quiz/daily-quiz-link-button";
import { HabitTracker } from "@/components/habits/habit-tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import {
  getAvatarCustomization,
  saveAvatarCustomization,
  saveAvatarName,
  type AvatarCustomization,
} from "@/lib/avatar-customization-storage";
import { getOwnedItemIds } from "@/lib/shop-storage";
import { cn } from "@/lib/utils";

type AvatarTab = "home" | "customize";

export function AvatarPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AvatarTab>("home");
  const [customization, setCustomization] = useState<AvatarCustomization | null>(
    null,
  );
  const [avatarName, setAvatarName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [ownedVariantIds, setOwnedVariantIds] = useState<string[]>([]);

  useEffect(() => {
    if (searchParams.get("tab") === "customize") {
      setActiveTab("customize");
    }
  }, [searchParams]);

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

  const handleSaveName = async () => {
    setIsSavingName(true);

    try {
      const savedName = await saveAvatarName(avatarName);
      setAvatarName(savedName);
      toast("Pet name saved.", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not save name.",
        "error",
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveAvatar = async (nextCustomization: AvatarCustomization) => {
    setIsSavingAvatar(true);

    try {
      await saveAvatarCustomization({
        ...nextCustomization,
        name: avatarName.trim() || nextCustomization.name,
        equippedItems: customization?.equippedItems ?? [],
      });
      toast("Avatar updated.", "success");
      setActiveTab("home");
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
    return <p className="text-sm text-red-500">{loadError}</p>;
  }

  if (!customization) {
    return (
      <p className="text-sm text-muted-foreground">Loading your pet...</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-1">
        {(
          [
            { id: "home", label: "Overview" },
            { id: "customize", label: "Customize" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 rounded-lg border bg-card p-4">
        <Label htmlFor="avatar-name-shared">Pet name</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="avatar-name-shared"
            value={avatarName}
            maxLength={32}
            onChange={(event) => setAvatarName(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isSavingName}
            onClick={() => void handleSaveName()}
          >
            {isSavingName ? "Saving..." : "Save name"}
          </Button>
        </div>
      </div>

      {activeTab === "home" ? (
        <>
          <AvatarStatusCard customization={customization} />
          <HabitTracker />
          <DailyQuizLinkButton />
        </>
      ) : (
        <CharacterCreator
          key={`${customization.variants.head}-${customization.variants.torso}-${customization.colors.skin.l}-${avatarName}`}
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
      )}
    </div>
  );
}
