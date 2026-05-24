"use client";

import { useEffect, useRef, useState } from "react";

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
  scale?: number;
  className?: string;
};

export function CharacterLayerPreview({
  colors,
  variants,
  scale = 10,
  className,
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

      const activeLayers = CHARACTER_LAYERS.flatMap((layer) => {
        const selected = getSelectedVariant(layer.id, variants[layer.id]);
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
        drawTintedSprite(
          ctx,
          image,
          hslToRgb(layerColor.h, layerColor.s, layerColor.l),
        );
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [colors, variants, scale]);

  return (
    <div
      className={cn(
        "relative flex h-[320px] items-center justify-center",
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
