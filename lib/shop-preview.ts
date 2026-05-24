import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import { parseVariantId, parseShopStyleItem, type ShopItemRecord } from "@/lib/shop-catalog";
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
