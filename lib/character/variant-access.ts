import { NONE_VARIANT_ID } from "@/lib/character/presets";

/** First N numbered styles per layer are free; higher numbers are shop-only. */
export const FREE_STYLE_COUNT = 2;

export function getVariantStyleNumber(variantId: string): number | null {
  if (variantId === NONE_VARIANT_ID) {
    return null;
  }

  const match = variantId.match(/-(\d+)$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function isFreeStyleVariant(variantId: string): boolean {
  const styleNumber = getVariantStyleNumber(variantId);
  return styleNumber !== null && styleNumber <= FREE_STYLE_COUNT;
}

export function isShopOnlyStyleVariant(variantId: string): boolean {
  const styleNumber = getVariantStyleNumber(variantId);
  return styleNumber !== null && styleNumber > FREE_STYLE_COUNT;
}

export function isVariantUnlocked(
  variantId: string,
  ownedVariantIds: ReadonlySet<string> | readonly string[],
): boolean {
  if (variantId === NONE_VARIANT_ID || isFreeStyleVariant(variantId)) {
    return true;
  }

  const owned =
    ownedVariantIds instanceof Set
      ? ownedVariantIds
      : new Set(ownedVariantIds);

  return owned.has(variantId);
}
