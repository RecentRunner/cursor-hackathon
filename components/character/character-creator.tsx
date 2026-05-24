"use client";

import { useState } from "react";

import { CharacterColorPresets } from "@/components/character/character-color-presets";
import { CharacterColorSliders } from "@/components/character/character-color-sliders";
import { CharacterLayerPreview } from "@/components/character/character-layer-preview";
import { CharacterLayerTabs } from "@/components/character/character-layer-tabs";
import { CharacterPieceSelector } from "@/components/character/character-piece-selector";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { clampHsl } from "@/lib/character/color-utils";
import {
  CHARACTER_LAYERS,
  COLOR_PRESETS,
  DEFAULT_GRAY_COLOR,
  LAYER_DEFAULT_COLORS,
  buildDefaultVariants,
  getLayerById,
  type ColorPreset,
} from "@/lib/character/presets";
import type { LayerColorState, LayerVariantState } from "@/lib/character/types";

function buildInitialColors(): LayerColorState {
  return { ...LAYER_DEFAULT_COLORS };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}

export function CharacterCreator() {
  const [colors, setColors] = useState<LayerColorState>(buildInitialColors);
  const [variants, setVariants] = useState<LayerVariantState>(
    buildDefaultVariants,
  );
  const [activePresetId, setActivePresetId] = useState<string>(
    DEFAULT_GRAY_COLOR.id,
  );
  const [activeLayerId, setActiveLayerId] = useState<
    (typeof CHARACTER_LAYERS)[number]["id"]
  >("skin");

  const activeLayer = getLayerById(activeLayerId);
  const activeColor = colors[activeLayerId];
  const pieceVariants = activeLayer.allowVariants ? activeLayer.variants : [];

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
    setVariants((current) => ({
      ...current,
      [activeLayerId]: variantId,
    }));
  };

  return (
    <div className="grid gap-5">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
