"use client";

import { useEffect, useRef, useState } from "react";

import { applyEquippedItemsToVariants } from "@/lib/avatar-display";
import {
  drawTintedSprite,
  getCachedImage,
  hslToRgb,
} from "@/lib/character/color-utils";
import {
  CHARACTER_LAYERS,
  getSelectedVariant,
} from "@/lib/character/presets";
import type { LayerColorState, LayerVariantState } from "@/lib/character/types";
import { cn } from "@/lib/utils";

type CharacterLayerPreviewProps = {
  colors: LayerColorState;
  variants: LayerVariantState;
  equippedItems?: string[];
  scale?: number;
  className?: string;
  compact?: boolean;
};

export function CharacterLayerPreview({
  colors,
  variants,
  equippedItems = [],
  scale = 10,
  className,
  compact = false,
}: CharacterLayerPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const displayVariants = applyEquippedItemsToVariants(
        variants,
        equippedItems,
      );

      const activeLayers = CHARACTER_LAYERS.flatMap((layer) => {
        const selected = getSelectedVariant(layer.id, displayVariants[layer.id]);
        if (!selected) return [];
        return [{ layer, variant: selected }];
      });

      const images = await Promise.all(
        activeLayers.map(async ({ layer, variant }) => ({
          layer,
          image: await getCachedImage(variant.src),
        })),
      );

      if (cancelled || images.length === 0) return;

      const width = images[0]?.image.width ?? 0;
      const height = images[0]?.image.height ?? 0;

      canvas.width = width;
      canvas.height = height;
      setDisplaySize({ width: width * scale, height: height * scale });
      ctx.clearRect(0, 0, width, height);

      for (const { layer, image } of images) {
        const layerColor = colors[layer.id];
        const rgb = hslToRgb(layerColor.h, layerColor.s, layerColor.l);

        drawTintedSprite(
          ctx,
          image,
          rgb,
          layer.id === "eyes"
            ? {
                mode: "eyes",
                skinColor: hslToRgb(
                  colors.skin.h,
                  colors.skin.s,
                  colors.skin.l,
                ),
              }
            : undefined,
        );
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [colors, variants, equippedItems, scale]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        compact ? "h-[180px]" : "h-[320px]",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{
          imageRendering: "pixelated",
          width: displaySize.width || undefined,
          height: displaySize.height || undefined,
        }}
      />
    </div>
  );
}
