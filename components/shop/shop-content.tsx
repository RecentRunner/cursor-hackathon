"use client";

import { useCallback, useEffect, useState } from "react";

import { TintedSpriteIcon } from "@/components/character/tinted-sprite-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import { DEFAULT_GRAY_COLOR } from "@/lib/character/presets";
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

const SHOP_LAYER_ORDER: ShopLayerId[] = [
  "head",
  "torso",
  "pants",
  "shoes",
  "eyes",
];

export function ShopContent() {
  const { toast } = useToast();
  const [items, setItems] = useState<ShopItemRecord[]>([]);
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>([]);
  const [equippedItems, setEquippedItems] = useState<string[]>([]);
  const [coins, setCoins] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  const refreshShop = useCallback(async () => {
    try {
      setError(null);
      const inventory = await getShopInventory();
      setItems(inventory.items);
      setOwnedItemIds(inventory.ownedItemIds);
      setEquippedItems(inventory.equippedItems);
      setCoins(inventory.coins);
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
      toast(`Purchased ${item.name}.`, "success");
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
      const isEquipped = equippedItems.includes(item.id);

      if (isEquipped) {
        await unequipShopItem(item.id);
        toast(`Unequipped ${item.name}.`, "default");
      } else {
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

  const groupedItems = SHOP_LAYER_ORDER.map((layerId) => ({
    layerId,
    label: getLayerLabel(layerId),
    items: items.filter((item) => item.type === layerId),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <span className="text-sm text-muted-foreground">Your balance</span>
        <Badge variant="secondary">
          {coins === null ? "..." : `${coins} points`}
        </Badge>
      </div>

      {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}

      <div className="grid gap-6">
        {groupedItems.map((group) => (
          <section key={group.layerId} className="grid gap-3">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.items.map((item) => {
                const owned = ownedItemIds.includes(item.id);
                const equipped = equippedItems.includes(item.id);
                const canAfford = coins !== null && coins >= item.price;
                const isPending = pendingItemId === item.id;

                return (
                  <Card key={item.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-14 items-center justify-center rounded-lg border bg-zinc-950/80 p-1.5">
                            <TintedSpriteIcon
                              src={item.image_path}
                              color={DEFAULT_GRAY_COLOR.hsl}
                              size={36}
                            />
                          </div>
                          <div>
                            <CardTitle className="text-base">{item.name}</CardTitle>
                            <CardDescription>{item.id}</CardDescription>
                          </div>
                        </div>
                        <Badge>{item.price} pts</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                      {!owned ? (
                        <Button
                          className="w-full"
                          variant="outline"
                          disabled={coins === null || !canAfford || isPending}
                          onClick={() => void handlePurchase(item.id)}
                        >
                          {isPending
                            ? "Processing..."
                            : canAfford
                              ? "Buy"
                              : "Not enough points"}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant={equipped ? "default" : "outline"}
                          disabled={isPending}
                          onClick={() => void handleEquipToggle(item)}
                        >
                          {isPending
                            ? "Updating..."
                            : equipped
                              ? "Equipped"
                              : "Equip"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
