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

export type CharacterLayerId = "skin" | "pants" | "torso" | "head" | "eyes";

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

export const COLOR_PRESETS: ColorPreset[] = [
  presetFromHsl("black", "Black", { h: 0, s: 0, l: 5 }),
  presetFromHsl("gray", "Gray", { h: 0, s: 0, l: 50 }),
  presetFromHsl("white", "White", { h: 0, s: 0, l: 100 }),
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

export const DEFAULT_SKIN_COLOR =
  COLOR_PRESETS.find((preset) => preset.id === "light")!;

export const PIECE_SLOT_COUNT = 8;

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
    variants: [],
  },
  {
    id: "torso",
    label: "Torso",
    allowVariants: true,
    variants: [
      { id: "torso-1", label: "Torso 1", src: "/character/torso/torso-1.png" },
      { id: "torso-2", label: "Torso 2", src: "/character/torso/torso-2.png" },
    ],
  },
  {
    id: "head",
    label: "Head",
    allowVariants: true,
    variants: [],
  },
  {
    id: "eyes",
    label: "Eyes",
    allowVariants: true,
    variants: [],
  },
];

export const LAYER_DEFAULT_COLORS: Record<CharacterLayerId, HSL> = {
  skin: DEFAULT_SKIN_COLOR.hsl,
  pants: COLOR_PRESETS.find((preset) => preset.id === "blue")!.hsl,
  torso: COLOR_PRESETS.find((preset) => preset.id === "red")!.hsl,
  head: COLOR_PRESETS.find((preset) => preset.id === "yellow")!.hsl,
  eyes: COLOR_PRESETS.find((preset) => preset.id === "indigo")!.hsl,
};

export function buildDefaultVariants(): LayerVariantState {
  return CHARACTER_LAYERS.reduce((state, layer) => {
    state[layer.id] = layer.variants[0]?.id ?? "";
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
  return getLayerById(layerId).variants.find(
    (variant) => variant.id === variantId,
  );
}

/** @deprecated Use DEFAULT_SKIN_COLOR */
export const DEFAULT_BASE_COLOR = DEFAULT_SKIN_COLOR;
