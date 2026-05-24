"use client";

import { useState } from "react";

import { CharacterColorPresets } from "@/components/character/character-color-presets";
import { CharacterColorSliders } from "@/components/character/character-color-sliders";
import { CharacterLayerPreview } from "@/components/character/character-layer-preview";
import { CharacterLayerTabs } from "@/components/character/character-layer-tabs";
import { CharacterPieceSelector } from "@/components/character/character-piece-selector";
import { ParallaxRoomBackground } from "@/components/pet/parallax-room-background";
import { RoomStyleSelector } from "@/components/pet/room-style-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import { clampHsl } from "@/lib/character/color-utils";
import {
  COLOR_PRESETS,
  DEFAULT_GRAY_COLOR,
  LAYER_DEFAULT_COLORS,
  NONE_VARIANT_ID,
  buildDefaultVariants,
  getLayerById,
  type CharacterCreatorTabId,
  type ColorPreset,
} from "@/lib/character/presets";
import type { LayerColorState, LayerVariantState } from "@/lib/character/types";
import { isVariantUnlocked } from "@/lib/character/variant-access";
import {
  isRoomBackgroundUnlocked,
  normalizeRoomBackgroundId,
  type RoomBackgroundId,
} from "@/lib/room-backgrounds";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}

type CharacterCreatorProps = {
  initialCustomization?: AvatarCustomization;
  name?: string;
  onNameChange?: (name: string) => void;
  showNameField?: boolean;
  saveLabel?: string;
  isSaving?: boolean;
  ownedVariantIds?: string[];
  onSave?: (customization: AvatarCustomization) => Promise<void>;
};

export function CharacterCreator({
  initialCustomization,
  name: controlledName,
  onNameChange,
  ownedVariantIds = [],
  showNameField = false,
  saveLabel = "Save avatar",
  isSaving = false,
  onSave,
}: CharacterCreatorProps) {
  const [internalName, setInternalName] = useState(
    initialCustomization?.name ?? "Pixel Me",
  );
  const name = controlledName ?? internalName;

  const setName = (nextName: string) => {
    if (onNameChange) {
      onNameChange(nextName);
      return;
    }

    setInternalName(nextName);
  };
  const [colors, setColors] = useState<LayerColorState>(
    initialCustomization?.colors ?? { ...LAYER_DEFAULT_COLORS },
  );
  const [variants, setVariants] = useState<LayerVariantState>(
    initialCustomization?.variants ?? buildDefaultVariants(),
  );
  const [roomBackground, setRoomBackground] = useState<RoomBackgroundId>(
    normalizeRoomBackgroundId(initialCustomization?.roomBackground),
  );
  const [activePresetId, setActivePresetId] = useState<string>(
    DEFAULT_GRAY_COLOR.id,
  );
  const [activeTabId, setActiveTabId] = useState<CharacterCreatorTabId>("skin");
  const [saveError, setSaveError] = useState<string | null>(null);

  const isRoomTab = activeTabId === "room";
  const isSkinTab = activeTabId === "skin";
  const showStyleSection = !isSkinTab;
  const showColorAdjust = !isRoomTab;
  const activeLayerId = isRoomTab ? "skin" : activeTabId;
  const activeLayer = getLayerById(activeLayerId);
  const activeColor = colors[activeLayerId];
  const ownedSet = new Set(ownedVariantIds);
  const pieceVariants = activeLayer.allowVariants ? activeLayer.variants : [];
  const lockedVariantIds = new Set(
    pieceVariants
      .filter(
        (variant) =>
          variant.id !== NONE_VARIANT_ID &&
          !isVariantUnlocked(variant.id, ownedSet),
      )
      .map((variant) => variant.id),
  );

  const applyPreset = (preset: ColorPreset) => {
    setActivePresetId(preset.id);
    setColors((current) => ({
      ...current,
      [activeLayerId]: { ...preset.hsl },
    }));
  };

  const updateActiveColor = (nextColor: typeof activeColor) => {
    setActivePresetId("");
    setColors((current) => ({
      ...current,
      [activeLayerId]: clampHsl(nextColor),
    }));
  };

  const handleTabChange = (tabId: CharacterCreatorTabId) => {
    setActiveTabId(tabId);

    if (tabId === "room") {
      return;
    }

    const layerColor = colors[tabId];
    const matchingPreset = COLOR_PRESETS.find(
      (preset) =>
        preset.hsl.h === layerColor.h &&
        preset.hsl.s === layerColor.s &&
        preset.hsl.l === layerColor.l,
    );
    setActivePresetId(matchingPreset?.id ?? "");
  };

  const handleVariantChange = (variantId: string) => {
    if (!isVariantUnlocked(variantId, ownedSet)) {
      return;
    }

    setVariants((current) => ({
      ...current,
      [activeLayerId]: variantId,
    }));
  };

  const handleRoomChange = (roomId: RoomBackgroundId) => {
    if (!isRoomBackgroundUnlocked(roomId, ownedVariantIds)) {
      return;
    }

    setRoomBackground(roomId);
  };

  const buildCustomization = (): AvatarCustomization => ({
    name,
    colors,
    variants,
    customized: true,
    equippedItems: initialCustomization?.equippedItems ?? [],
    roomBackground,
  });

  const handleSave = async () => {
    if (!onSave) {
      return;
    }

    setSaveError(null);

    try {
      await onSave(buildCustomization());
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not save avatar.",
      );
    }
  };

  return (
    <div className="tamagotchi-shell overflow-hidden p-3 sm:p-4">
      {showNameField ? (
        <div className="mb-4 grid max-w-md gap-2 border-b-2 border-border/60 pb-4">
          <Label htmlFor="avatar-name">Pet name</Label>
          <Input
            id="avatar-name"
            value={name}
            maxLength={32}
            placeholder="Name your pet"
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      ) : null}

      <CharacterLayerTabs activeTabId={activeTabId} onTabChange={handleTabChange} />

      <div className="customize-body mt-4 grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-5">
        <div className="flex min-h-full min-w-0 flex-col">
          <div className="tamagotchi-lcd tamagotchi-lcd-pet-match relative">
            <ParallaxRoomBackground roomId={roomBackground} interactive={false} />
            <div className="relative z-10 flex h-full items-center justify-center">
              <CharacterLayerPreview
                colors={colors}
                variants={variants}
                scale={8}
                compact
                className="!h-auto max-h-none"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-8 bg-gradient-to-t from-black/35 to-transparent" />
          </div>
        </div>

        <div className="flex min-h-full min-w-0 flex-col gap-5 border-t-2 border-border/60 pt-4 lg:border-l-2 lg:border-t-0 lg:pl-5 lg:pt-0">
          {showStyleSection ? (
            <section className="grid shrink-0 gap-3">
              <SectionLabel>Style</SectionLabel>
              <div className="min-h-14">
                {isRoomTab ? (
                  <RoomStyleSelector
                    activeId={roomBackground}
                    ownedItemIds={ownedVariantIds}
                    onSelect={handleRoomChange}
                  />
                ) : (
                  <CharacterPieceSelector
                    variants={pieceVariants}
                    lockedVariantIds={lockedVariantIds}
                    activeId={variants[activeLayerId]}
                    color={activeColor}
                    skinColor={colors.skin}
                    onSelect={handleVariantChange}
                  />
                )}
              </div>
            </section>
          ) : null}

          {showColorAdjust ? (
            <>
              <section className="grid shrink-0 gap-3">
                <SectionLabel>Color</SectionLabel>
                <div className="min-h-[4.75rem]">
                  <CharacterColorPresets
                    presets={COLOR_PRESETS}
                    activeId={activePresetId}
                    onSelect={applyPreset}
                  />
                </div>
              </section>

              <section className="grid shrink-0 gap-4">
                <SectionLabel>Adjust</SectionLabel>
                <CharacterColorSliders
                  color={activeColor}
                  onChange={updateActiveColor}
                />
              </section>
            </>
          ) : null}

          {onSave ? (
            <div className="mt-auto grid gap-2 pt-1">
              <Button
                id="avatar-customization-save"
                type="button"
                disabled={isSaving}
                onClick={() => void handleSave()}
              >
                {isSaving ? "Saving..." : saveLabel}
              </Button>
              {saveError ? (
                <p className="text-sm text-red-500">{saveError}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
