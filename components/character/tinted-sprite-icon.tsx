"use client";

import { useEffect, useRef } from "react";

import {
  drawTintedSprite,
  getCachedImage,
  hslToRgb,
  type HSL,
} from "@/lib/character/color-utils";
import { cn } from "@/lib/utils";

type TintedSpriteIconProps = {
  src: string;
  color: HSL;
  skinColor?: HSL;
  size?: number;
  className?: string;
};

export function TintedSpriteIcon({
  src,
  color,
  skinColor,
  size = 40,
  className,
}: TintedSpriteIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      try {
        const image = await getCachedImage(src);
        if (cancelled) return;

        canvas.width = image.width;
        canvas.height = image.height;
        ctx.clearRect(0, 0, image.width, image.height);

        const rgb = hslToRgb(color.h, color.s, color.l);
        const isEyesLayer = src.includes("/character/eyes/");

        drawTintedSprite(
          ctx,
          image,
          rgb,
          isEyesLayer && skinColor
            ? {
                mode: "eyes",
                skinColor: hslToRgb(skinColor.h, skinColor.s, skinColor.l),
              }
            : undefined,
        );
      } catch {
        // Ignore missing or broken sprite assets so the UI stays responsive.
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [src, color.h, color.s, color.l, skinColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("block max-h-full max-w-full", className)}
      style={{
        imageRendering: "pixelated",
        width: size,
        height: size,
      }}
    />
  );
}
