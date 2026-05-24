import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import type { HSL } from "@/lib/character/color-utils";
import type { LayerColorState } from "@/lib/character/types";
import {
  isShopLayerId,
  parseVariantId,
  parseShopStyleItem,
  type ShopItemRecord,
} from "@/lib/shop-catalog";
import {
  normalizeRoomBackgroundId,
  type RoomBackgroundId,
} from "@/lib/room-backgrounds";

/** Room id shown behind the pet in shop preview (shop item id, not image_path). */
export function getShopPreviewRoomId(
  item: ShopItemRecord,
  base: AvatarCustomization,
): RoomBackgroundId {
  if (item.type === "room") {
    return normalizeRoomBackgroundId(item.id);
  }

  return normalizeRoomBackgroundId(base.roomBackground);
}

/** Tint colors for shop grid thumbnails — match the user's current layer colors. */
export function getShopItemThumbnailColors(
  item: ShopItemRecord,
  colors: LayerColorState,
): { color: HSL; skinColor?: HSL } {
  if (!isShopLayerId(item.type)) {
    return { color: colors.torso };
  }

  return {
    color: colors[item.type],
    skinColor: item.type === "eyes" ? colors.skin : undefined,
  };
}

/** Build a non-persisted avatar state showing how a shop item would look. */
export function buildShopItemPreviewCustomization(
  base: AvatarCustomization,
  item: ShopItemRecord,
): AvatarCustomization {
  if (item.type === "room") {
    return {
      ...base,
      roomBackground: normalizeRoomBackgroundId(item.id),
    };
  }

  const style = parseShopStyleItem(item.id, item.type);
  if (!style) {
    return base;
  }

  const nextEquipped = [
    ...base.equippedItems.filter((equippedId) => {
      const equippedStyle = parseVariantId(equippedId);
      return equippedStyle?.layerId !== style.layerId;
    }),
    item.id,
  ];

  return {
    ...base,
    equippedItems: nextEquipped,
  };
}
