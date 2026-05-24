import type { CharacterLayerId } from "./presets";
import { CHARACTER_LAYERS, NONE_VARIANT_ID } from "./presets";
import type { LayerVariantState } from "./types";

const STYLE_FIELD_BY_LAYER: Record<
  Exclude<CharacterLayerId, "skin">,
  keyof LayerVariantState
> = {
  pants: "pants",
  shoes: "shoes",
  torso: "torso",
  eyes: "eyes",
  head: "head",
};

const VALID_VARIANT_IDS: Record<CharacterLayerId, readonly string[]> = {
  skin: ["skin-1"],
  pants: ["none", "pants-1", "pants-2", "pants-3"],
  shoes: ["none", "shoes-1", "shoes-2", "shoes-3"],
  torso: ["none", "torso-1", "torso-2", "torso-3", "torso-4"],
  eyes: ["none", "eyes-1", "eyes-2"],
  head: [
    "none",
    "head-1",
    "head-2",
    "head-3",
    "head-4",
    "head-5",
    "head-6",
    "head-7",
  ],
};

export function getValidVariantIds(layerId: CharacterLayerId): readonly string[] {
  return VALID_VARIANT_IDS[layerId];
}

export function isValidVariantId(layerId: CharacterLayerId, variantId: string) {
  return VALID_VARIANT_IDS[layerId].includes(variantId);
}

export function normalizeVariantId(
  layerId: CharacterLayerId,
  variantId: string | null | undefined,
): string {
  if (layerId === "skin") {
    return "skin-1";
  }

  const trimmed = variantId?.trim();

  if (trimmed && isValidVariantId(layerId, trimmed)) {
    return trimmed;
  }

  return NONE_VARIANT_ID;
}

export function normalizeVariants(
  variants: Partial<LayerVariantState> | null | undefined,
): LayerVariantState {
  return CHARACTER_LAYERS.reduce((state, layer) => {
    state[layer.id] = normalizeVariantId(
      layer.id,
      variants?.[layer.id as keyof LayerVariantState],
    );
    return state;
  }, {} as LayerVariantState);
}

export function assertValidVariants(variants: LayerVariantState) {
  for (const layer of CHARACTER_LAYERS) {
    if (!isValidVariantId(layer.id, variants[layer.id])) {
      throw new Error(`Invalid ${layer.label.toLowerCase()} style selected.`);
    }
  }
}

export { STYLE_FIELD_BY_LAYER, VALID_VARIANT_IDS };
