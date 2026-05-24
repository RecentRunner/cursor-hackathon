"use client";

import { useCallback, useEffect, useState } from "react";

import { TintedSpriteIcon } from "@/components/character/tinted-sprite-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import { getAvatarCustomization } from "@/lib/avatar-customization-storage";
import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import { DEFAULT_GRAY_COLOR } from "@/lib/character/presets";
import { getRoomBackground, normalizeRoomBackgroundId } from "@/lib/room-backgrounds";
import {
  equipShopItem,
  getShopInventory,
  purchaseShopItem,
  unequipShopItem,
} from "@/lib/shop-storage";
import {
  getLayerLabel,
  type ShopItemRecord,
  type ShopLayerId,
} from "@/lib/shop-catalog";
import { cn } from "@/lib/utils";

import { ShopItemPreviewModal } from "@/components/shop/shop-item-preview-modal";

const SHOP_LAYER_ORDER: ShopLayerId[] = [
  "head",
  "torso",
  "pants",
  "shoes",
  "eyes",
];

function ShopItemCard({
  item,
  owned,
  equipped,
  canAfford,
  isPending,
  onPurchase,
  onEquipToggle,
  onPreview,
}: {
  item: ShopItemRecord;
  owned: boolean;
  equipped: boolean;
  canAfford: boolean;
  isPending: boolean;
  onPurchase: () => void;
  onEquipToggle: () => void;
  onPreview: () => void;
}) {
  const room = item.type === "room" ? getRoomBackground(item.id) : null;

  const actionLabel = (() => {
    if (isPending) {
      return owned ? "Updating..." : "Processing...";
    }

    if (owned) {
      return equipped ? "Equipped" : "Equip";
    }

    if (!canAfford) {
      return "Need more points";
    }

    return "Buy";
  })();

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardContent className="flex h-full flex-col gap-3 p-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden border-2 border-border bg-zinc-950/80 p-1">
            {room ? (
              item.image_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_path}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className={cn("size-full", room.previewClassName)} />
              )
            ) : (
              <TintedSpriteIcon
                src={item.image_path}
                color={DEFAULT_GRAY_COLOR.hsl}
                size={32}
              />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 flex-1 text-xs leading-snug">{item.name}</p>
              <Badge className="shrink-0 px-1.5 py-0.5 text-[8px]">
                {item.price} pts
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button
            type="button"
            className="h-auto min-h-9 whitespace-normal px-2 py-2 text-[10px] leading-snug"
            variant="outline"
            disabled={isPending}
            onClick={onPreview}
          >
            Preview
          </Button>
          <Button
            className="h-auto min-h-9 whitespace-normal px-2 py-2 text-[10px] leading-snug"
            variant={owned && equipped ? "default" : "outline"}
            disabled={
              isPending ||
              (!owned && !canAfford) ||
              (owned && item.type === "room" && equipped)
            }
            onClick={owned ? onEquipToggle : onPurchase}
          >
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ShopContent() {
  const { toast } = useToast();
  const [items, setItems] = useState<ShopItemRecord[]>([]);
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>([]);
  const [equippedItems, setEquippedItems] = useState<string[]>([]);
  const [equippedRoomBackground, setEquippedRoomBackground] = useState("room-day");
  const [coins, setCoins] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [baseCustomization, setBaseCustomization] =
    useState<AvatarCustomization | null>(null);
  const [previewItem, setPreviewItem] = useState<ShopItemRecord | null>(null);

  const refreshShop = useCallback(async () => {
    try {
      setError(null);
      const [inventory, customization] = await Promise.all([
        getShopInventory(),
        getAvatarCustomization(),
      ]);
      setItems(inventory.items);
      setOwnedItemIds(inventory.ownedItemIds);
      setEquippedItems(inventory.equippedItems);
      setEquippedRoomBackground(inventory.equippedRoomBackground);
      setCoins(inventory.coins);
      setBaseCustomization({
        ...customization,
        equippedItems: inventory.equippedItems,
        roomBackground: normalizeRoomBackgroundId(inventory.equippedRoomBackground),
      });
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Could not load the shop.",
      );
      setCoins(0);
    }
  }, []);

  useEffect(() => {
    void refreshShop();

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, refreshShop);
    return () => {
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, refreshShop);
    };
  }, [refreshShop]);

  const handlePurchase = async (itemId: string) => {
    setPendingItemId(itemId);

    try {
      const item = await purchaseShopItem(itemId);
      await equipShopItem(itemId);
      toast(`Purchased and equipped ${item.name}.`, "success");
      await refreshShop();
    } catch (purchaseError) {
      toast(
        purchaseError instanceof Error
          ? purchaseError.message
          : "Purchase failed.",
        "error",
      );
    } finally {
      setPendingItemId(null);
    }
  };

  const handleEquipToggle = async (item: ShopItemRecord) => {
    setPendingItemId(item.id);

    try {
      const isEquipped =
        item.type === "room"
          ? equippedRoomBackground === item.id
          : equippedItems.includes(item.id);

      if (item.type !== "room" && isEquipped) {
        await unequipShopItem(item.id);
        toast(`Unequipped ${item.name}.`, "default");
      } else if (!isEquipped) {
        await equipShopItem(item.id);
        toast(`Equipped ${item.name}.`, "success");
      }

      await refreshShop();
    } catch (equipError) {
      toast(
        equipError instanceof Error ? equipError.message : "Could not equip item.",
        "error",
      );
    } finally {
      setPendingItemId(null);
    }
  };

  const styleGroups = SHOP_LAYER_ORDER.map((layerId) => ({
    layerId,
    label: getLayerLabel(layerId),
    items: items.filter((item) => item.type === layerId),
  })).filter((group) => group.items.length > 0);

  const roomItems = items.filter((item) => item.type === "room");

  const itemGridClassName = "grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3";

  return (
    <>
      <ShopItemPreviewModal
        item={previewItem}
        baseCustomization={baseCustomization}
        onClose={() => setPreviewItem(null)}
      />

      <div className="mb-5 flex items-center justify-between gap-3 border-2 border-border bg-muted/40 px-4 py-3 shadow-[var(--retro-shadow-sm)]">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Your balance
        </span>
        <Badge variant="secondary" className="shrink-0">
          {coins === null ? "..." : `${coins} points`}
        </Badge>
      </div>

      {error ? <p className="mb-4 text-xs text-red-500">{error}</p> : null}

      {!error && coins !== null && items.length === 0 ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Nothing in the shop right now. Keep completing habits and daily
              check-ins to earn points for when new styles arrive.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-8">
        {roomItems.length > 0 ? (
          <section className="grid gap-3">
            <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Room backgrounds
            </h3>
            <div className={itemGridClassName}>
              {roomItems.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  owned={ownedItemIds.includes(item.id)}
                  equipped={equippedRoomBackground === item.id}
                  canAfford={coins !== null && coins >= item.price}
                  isPending={pendingItemId === item.id}
                  onPurchase={() => void handlePurchase(item.id)}
                  onEquipToggle={() => void handleEquipToggle(item)}
                  onPreview={() => setPreviewItem(item)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {styleGroups.map((group) => (
          <section key={group.layerId} className="grid gap-3">
            <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h3>
            <div className={itemGridClassName}>
              {group.items.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  owned={ownedItemIds.includes(item.id)}
                  equipped={equippedItems.includes(item.id)}
                  canAfford={coins !== null && coins >= item.price}
                  isPending={pendingItemId === item.id}
                  onPurchase={() => void handlePurchase(item.id)}
                  onEquipToggle={() => void handleEquipToggle(item)}
                  onPreview={() => setPreviewItem(item)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
