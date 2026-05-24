export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export const LIGHTNESS_MIN = 5;

export function lightnessToDisplay(lightness: number): number {
  return Math.round(
    ((lightness - LIGHTNESS_MIN) / (100 - LIGHTNESS_MIN)) * 100,
  );
}

export function displayToLightness(display: number): number {
  return Math.round(
    LIGHTNESS_MIN + (display / 100) * (100 - LIGHTNESS_MIN),
  );
}

export function clampHsl(hsl: HSL): HSL {
  return {
    h: hsl.h,
    s: Math.max(0, Math.min(100, hsl.s)),
    l: Math.max(LIGHTNESS_MIN, Math.min(100, hsl.l)),
  };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lightness - chroma / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = chroma;
    g = x;
  } else if (h < 120) {
    r = x;
    g = chroma;
  } else if (h < 180) {
    g = chroma;
    b = x;
  } else if (h < 240) {
    g = x;
    b = chroma;
  } else if (h < 300) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const delta = max - min;
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case red:
        hue = ((green - blue) / delta + (green < blue ? 6 : 0)) * 60;
        break;
      case green:
        hue = ((blue - red) / delta + 2) * 60;
        break;
      default:
        hue = ((red - green) / delta + 4) * 60;
        break;
    }
  }

  return {
    h: Math.round(hue),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

export function hexToRgb(hex: string): RGB {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Tint a monochrome sprite by mapping pixel brightness to the target color. */
export function tintImageData(imageData: ImageData, color: RGB): void {
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha === 0) continue;

    applyMonochromeTint(data, i, color);
  }
}

function isWhitePixel(r: number, g: number, b: number): boolean {
  return r >= 240 && g >= 240 && b >= 240;
}

function isMagentaPixel(r: number, g: number, b: number): boolean {
  return r >= 200 && g <= 80 && b >= 200;
}

function applyMonochromeTint(
  data: Uint8ClampedArray,
  index: number,
  color: RGB,
  brightness?: number,
): void {
  const pixelBrightness =
    brightness ??
    Math.max(data[index], data[index + 1], data[index + 2]) / 255;

  data[index] = Math.round(color.r * pixelBrightness);
  data[index + 1] = Math.round(color.g * pixelBrightness);
  data[index + 2] = Math.round(color.b * pixelBrightness);
}

/** Darkest shadow in the skin template — magenta maps here, not bright red. */
const SKIN_TEMPLATE_SHADOW = hexToRgb("#330000");
const SKIN_SHADOW_BRIGHTNESS =
  Math.max(
    SKIN_TEMPLATE_SHADOW.r,
    SKIN_TEMPLATE_SHADOW.g,
    SKIN_TEMPLATE_SHADOW.b,
  ) / 255;

/** Eyes: white stays white, magenta uses skin color, other pixels use eye color. */
export function tintEyesImageData(
  imageData: ImageData,
  eyeColor: RGB,
  skinColor: RGB,
): void {
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha === 0) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (isWhitePixel(r, g, b)) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      continue;
    }

    if (isMagentaPixel(r, g, b)) {
      applyMonochromeTint(data, i, skinColor, SKIN_SHADOW_BRIGHTNESS);
      continue;
    }

    applyMonochromeTint(data, i, eyeColor);
  }
}

export type TintOptions = {
  mode?: "monochrome" | "eyes";
  skinColor?: RGB;
};

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

const imageCache = new Map<string, HTMLImageElement>();

export async function getCachedImage(src: string): Promise<HTMLImageElement> {
  if (!imageCache.has(src)) {
    imageCache.set(src, await loadImage(src));
  }
  return imageCache.get(src)!;
}

export function drawTintedSprite(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  color: RGB,
  options?: TintOptions,
): void {
  const width = image.width;
  const height = image.height;
  const offscreen = document.createElement("canvas");
  offscreen.width = width;
  offscreen.height = height;

  const offscreenCtx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!offscreenCtx) return;

  offscreenCtx.drawImage(image, 0, 0);
  const imageData = offscreenCtx.getImageData(0, 0, width, height);

  if (options?.mode === "eyes" && options.skinColor) {
    tintEyesImageData(imageData, color, options.skinColor);
  } else {
    tintImageData(imageData, color);
  }

  offscreenCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(offscreen, 0, 0);
}
