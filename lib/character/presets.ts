import {
  clampHsl,
  hexToRgb,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
  type HSL,
} from "./color-utils";
import type { LayerVariantState } from "./types";

export type ColorPreset = {
  id: string;
  name: string;
  hex: string;
  hsl: HSL;
};

export type LayerVariant = {
  id: string;
  label: string;
  src: string;
};

export const NONE_VARIANT_ID = "none";

export const NONE_VARIANT: LayerVariant = {
  id: NONE_VARIANT_ID,
  label: "None",
  src: "",
};

export type CharacterLayerId =
  | "skin"
  | "pants"
  | "shoes"
  | "torso"
  | "eyes"
  | "head";

export type CharacterLayer = {
  id: CharacterLayerId;
  label: string;
  allowVariants: boolean;
  variants: LayerVariant[];
};

function presetFromHsl(id: string, name: string, hsl: HSL): ColorPreset {
  const clamped = clampHsl(hsl);
  return {
    id,
    name,
    hsl: clamped,
    hex: rgbToHex(hslToRgb(clamped.h, clamped.s, clamped.l)),
  };
}

function presetFromHex(id: string, name: string, hex: string): ColorPreset {
  const rgb = hexToRgb(hex);
  return presetFromHsl(id, name, rgbToHsl(rgb.r, rgb.g, rgb.b));
}

function layerVariants(
  layerId: Exclude<CharacterLayerId, "skin">,
  label: string,
  count: number,
): LayerVariant[] {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    return {
      id: `${layerId}-${number}`,
      label: `${label} ${number}`,
      src: `/character/${layerId}/${layerId}-${number}.png`,
    };
  });
}

function layerVariantsWithNone(
  layerId: Exclude<CharacterLayerId, "skin">,
  label: string,
  count: number,
): LayerVariant[] {
  return [NONE_VARIANT, ...layerVariants(layerId, label, count)];
}

export const COLOR_PRESETS: ColorPreset[] = [
  presetFromHsl("gray", "Gray", { h: 0, s: 0, l: 50 }),
  presetFromHsl("white", "White", { h: 0, s: 0, l: 100 }),
  presetFromHsl("black", "Black", { h: 0, s: 0, l: 5 }),
  presetFromHex("red", "Red", "#FF2020"),
  presetFromHex("orange", "Orange", "#FF8800"),
  presetFromHex("yellow", "Yellow", "#FFD700"),
  presetFromHex("green", "Green", "#22AA44"),
  presetFromHex("blue", "Blue", "#2266FF"),
  presetFromHex("indigo", "Indigo", "#4B0082"),
  presetFromHex("porcelain", "Porcelain", "#FFDFC4"),
  presetFromHex("fair", "Fair", "#F0C9A5"),
  presetFromHex("light", "Light", "#E0AC69"),
  presetFromHex("medium", "Medium", "#C68642"),
  presetFromHex("tan", "Tan", "#A87149"),
  presetFromHex("brown", "Brown", "#8D5524"),
  presetFromHex("dark", "Dark", "#5C3317"),
  presetFromHex("deep", "Deep", "#3B2212"),
  presetFromHex("onyx", "Onyx", "#140C08"),
];

export const DEFAULT_GRAY_COLOR =
  COLOR_PRESETS.find((preset) => preset.id === "gray")!;

export const DEFAULT_SKIN_COLOR = DEFAULT_GRAY_COLOR;

export const PIECE_SLOT_COUNT = 8;

/** Stack order: bottom → top */
export const CHARACTER_LAYERS: CharacterLayer[] = [
  {
    id: "skin",
    label: "Skin",
    allowVariants: false,
    variants: [
      { id: "skin-1", label: "Skin 1", src: "/character/skin/skin-1.png" },
    ],
  },
  {
    id: "pants",
    label: "Pants",
    allowVariants: true,
    variants: layerVariantsWithNone("pants", "Pants", 3),
  },
  {
    id: "shoes",
    label: "Shoes",
    allowVariants: true,
    variants: layerVariantsWithNone("shoes", "Shoes", 3),
  },
  {
    id: "torso",
    label: "Torso",
    allowVariants: true,
    variants: layerVariantsWithNone("torso", "Torso", 4),
  },
  {
    id: "eyes",
    label: "Eyes",
    allowVariants: true,
    variants: layerVariantsWithNone("eyes", "Eyes", 2),
  },
  {
    id: "head",
    label: "Head",
    allowVariants: true,
    variants: layerVariantsWithNone("head", "Head", 7),
  },
];

export const LAYER_DEFAULT_COLORS: Record<CharacterLayerId, HSL> = {
  skin: DEFAULT_GRAY_COLOR.hsl,
  pants: DEFAULT_GRAY_COLOR.hsl,
  shoes: DEFAULT_GRAY_COLOR.hsl,
  torso: DEFAULT_GRAY_COLOR.hsl,
  eyes: DEFAULT_GRAY_COLOR.hsl,
  head: DEFAULT_GRAY_COLOR.hsl,
};

export function buildDefaultVariants(): LayerVariantState {
  return CHARACTER_LAYERS.reduce((state, layer) => {
    state[layer.id] = layer.allowVariants
      ? NONE_VARIANT_ID
      : (layer.variants[0]?.id ?? "");
    return state;
  }, {} as LayerVariantState);
}

export function getLayerById(layerId: CharacterLayerId): CharacterLayer {
  return CHARACTER_LAYERS.find((layer) => layer.id === layerId)!;
}

export function getSelectedVariant(
  layerId: CharacterLayerId,
  variantId: string,
): LayerVariant | undefined {
  if (variantId === NONE_VARIANT_ID) return undefined;

  const variant = getLayerById(layerId).variants.find(
    (entry) => entry.id === variantId,
  );

  if (!variant?.src) return undefined;

  return variant;
}

/** @deprecated Use DEFAULT_SKIN_COLOR */
export const DEFAULT_BASE_COLOR = DEFAULT_SKIN_COLOR;
