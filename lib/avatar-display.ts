import type { LayerVariantState } from "@/lib/character/types";
import { parseShopStyleItem, parseVariantId } from "@/lib/shop-catalog";

/** Apply equipped shop styles (variant ids like head-1) onto saved customization. */
export function applyEquippedItemsToVariants(
  variants: LayerVariantState,
  equippedItems: string[],
): LayerVariantState {
  const next = { ...variants };

  for (const itemId of equippedItems) {
    const style = parseVariantId(itemId);

    if (style) {
      next[style.layerId] = style.variantId;
    }
  }

  return next;
}

export function applyEquippedShopRecordsToVariants(
  variants: LayerVariantState,
  equippedItems: Array<{ id: string; type: string }>,
): LayerVariantState {
  const next = { ...variants };

  for (const item of equippedItems) {
    const style = parseShopStyleItem(item.id, item.type);

    if (style) {
      next[style.layerId] = style.variantId;
    }
  }

  return next;
}
