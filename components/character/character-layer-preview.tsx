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

const EMPTY_EQUIPPED_ITEMS: string[] = [];

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
  equippedItems,
  scale = 10,
  className,
  compact = false,
}: CharacterLayerPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const resolvedEquippedItems = equippedItems ?? EMPTY_EQUIPPED_ITEMS;
  const equippedKey = resolvedEquippedItems.join("\0");
  const equippedItemsRef = useRef(resolvedEquippedItems);
  equippedItemsRef.current = resolvedEquippedItems;

  useEffect(() => {
    let cancelled = false;
    const items = equippedItemsRef.current;

    async function render() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      try {
        const displayVariants = applyEquippedItemsToVariants(
          variants,
          items,
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

        const nextWidth = width * scale;
        const nextHeight = height * scale;
        setDisplaySize((current) =>
          current.width === nextWidth && current.height === nextHeight
            ? current
            : { width: nextWidth, height: nextHeight },
        );

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
      } catch {
        // Ignore missing or broken sprite assets so the UI stays responsive.
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [colors, variants, equippedKey, scale]);

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
