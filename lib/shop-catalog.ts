import type { CharacterLayerId } from "@/lib/character/presets";
import { CHARACTER_LAYERS, NONE_VARIANT_ID } from "@/lib/character/presets";

export type ShopLayerId = Exclude<CharacterLayerId, "skin">;

export type ShopItemRecord = {
  id: string;
  name: string;
  type: ShopLayerId;
  price: number;
  image_path: string;
};

export type ShopStyleItem = {
  layerId: ShopLayerId;
  variantId: string;
};

const SHOP_LAYER_IDS = new Set<ShopLayerId>([
  "pants",
  "shoes",
  "torso",
  "eyes",
  "head",
]);

export function isShopLayerId(value: string): value is ShopLayerId {
  return SHOP_LAYER_IDS.has(value as ShopLayerId);
}

/** Parse a character variant id (e.g. head-1) into layer + variant. */
export function parseVariantId(variantId: string): ShopStyleItem | null {
  for (const layerId of SHOP_LAYER_IDS) {
    if (variantId.startsWith(`${layerId}-`)) {
      return { layerId, variantId };
    }
  }

  return null;
}

export function parseShopStyleItem(
  itemId: string,
  itemType: string,
): ShopStyleItem | null {
  if (!isShopLayerId(itemType) || !itemId.startsWith(`${itemType}-`)) {
    return null;
  }

  return { layerId: itemType, variantId: itemId };
}

export function getShopCatalogFromPresets(): ShopItemRecord[] {
  return CHARACTER_LAYERS.flatMap((layer) => {
    if (layer.id === "skin") {
      return [];
    }

    return layer.variants
      .filter((variant) => variant.id !== NONE_VARIANT_ID)
      .map((variant) => ({
        id: variant.id,
        name: variant.label,
        type: layer.id as ShopLayerId,
        price: getDefaultPriceForLayer(layer.id as ShopLayerId, variant.id),
        image_path: variant.src,
      }));
  });
}

function getDefaultPriceForLayer(layerId: ShopLayerId, variantId: string) {
  const number = Number.parseInt(variantId.split("-").pop() ?? "1", 10);

  const baseByLayer: Record<ShopLayerId, number> = {
    pants: 20,
    shoes: 20,
    torso: 25,
    eyes: 15,
    head: 30,
  };

  return baseByLayer[layerId] + (number - 1) * 5;
}

export function getLayerLabel(layerId: ShopLayerId) {
  return CHARACTER_LAYERS.find((layer) => layer.id === layerId)?.label ?? layerId;
}
