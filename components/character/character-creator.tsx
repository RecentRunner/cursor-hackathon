"use client";

import { useState } from "react";

import { CharacterColorPresets } from "@/components/character/character-color-presets";
import { CharacterColorSliders } from "@/components/character/character-color-sliders";
import { CharacterLayerPreview } from "@/components/character/character-layer-preview";
import { CharacterLayerTabs } from "@/components/character/character-layer-tabs";
import { CharacterPieceSelector } from "@/components/character/character-piece-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import { clampHsl } from "@/lib/character/color-utils";
import {
  CHARACTER_LAYERS,
  COLOR_PRESETS,
  DEFAULT_GRAY_COLOR,
  LAYER_DEFAULT_COLORS,
  NONE_VARIANT_ID,
  buildDefaultVariants,
  getLayerById,
  type ColorPreset,
} from "@/lib/character/presets";
import type { LayerColorState, LayerVariantState } from "@/lib/character/types";
import { isVariantUnlocked } from "@/lib/character/variant-access";

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
  const [activePresetId, setActivePresetId] = useState<string>(
    DEFAULT_GRAY_COLOR.id,
  );
  const [activeLayerId, setActiveLayerId] = useState<
    (typeof CHARACTER_LAYERS)[number]["id"]
  >("skin");
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const handleLayerChange = (layerId: (typeof CHARACTER_LAYERS)[number]["id"]) => {
    setActiveLayerId(layerId);
    const layerColor = colors[layerId];
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

  const buildCustomization = (): AvatarCustomization => ({
    name,
    colors,
    variants,
    customized: true,
    equippedItems: initialCustomization?.equippedItems ?? [],
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
    <div className="grid gap-5">
      {showNameField ? (
        <div className="grid max-w-md gap-2">
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

      <CharacterLayerTabs
        activeLayerId={activeLayerId}
        onLayerChange={handleLayerChange}
      />

      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Card className="flex flex-col overflow-hidden border-border/60 shadow-sm">
          <CardContent className="flex flex-1 items-center justify-center p-6">
            <CharacterLayerPreview
              colors={colors}
              variants={variants}
              scale={10}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col border-border/60 shadow-sm">
          <CardContent className="flex flex-1 flex-col gap-5 p-6">
            <section className="grid h-[5.75rem] shrink-0 gap-3">
              <SectionLabel>Style</SectionLabel>
              <div className="min-h-14">
                <CharacterPieceSelector
                  variants={pieceVariants}
                  lockedVariantIds={lockedVariantIds}
                  activeId={variants[activeLayerId]}
                  color={activeColor}
                  skinColor={colors.skin}
                  onSelect={handleVariantChange}
                />
              </div>
            </section>

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

            {onSave ? (
              <div className="grid gap-2 pt-1">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
