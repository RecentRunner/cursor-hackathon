"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import {
  getShopState,
  purchaseShopItem,
  type ShopItem,
} from "@/lib/shop-storage";

function formatItemType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function ShopContent() {
  const [coins, setCoins] = useState<number | null>(null);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  const refreshShop = useCallback(async () => {
    try {
      setError(null);
      const state = await getShopState();
      setCoins(state.coins);
      setItems(state.items);
      setOwnedItemIds(state.ownedItemIds);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Could not load the shop.",
      );
      setCoins(0);
      setItems([]);
      setOwnedItemIds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshShop();

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, refreshShop);
    return () => {
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, refreshShop);
    };
  }, [refreshShop]);

  const handlePurchase = async (item: ShopItem) => {
    if (pendingItemId) {
      return;
    }

    try {
      setPurchaseError(null);
      setPendingItemId(item.id);
      const remainingCoins = await purchaseShopItem(item.id);
      setCoins(remainingCoins);
      setOwnedItemIds((current) =>
        current.includes(item.id) ? current : [...current, item.id],
      );
    } catch (purchaseFailure) {
      setPurchaseError(
        purchaseFailure instanceof Error
          ? purchaseFailure.message
          : "Could not complete purchase.",
      );
    } finally {
      setPendingItemId(null);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <span className="text-sm text-muted-foreground">Your balance</span>
        <Badge variant="secondary">
          {coins === null ? "..." : `${coins} points`}
        </Badge>
      </div>

      {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}
      {purchaseError ? (
        <p className="mb-4 text-sm text-red-500">{purchaseError}</p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading shop items...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No items in the shop yet. Add rows to the shop_items table in
          Supabase.
        </p>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => {
            const isOwned = ownedItemIds.includes(item.id);
            const canAfford = coins !== null && coins >= item.price;
            const isPending = pendingItemId === item.id;

            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription>
                        {formatItemType(item.type)}
                      </CardDescription>
                    </div>
                    <Badge>{item.price} pts</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={isOwned ? "secondary" : "outline"}
                    disabled={
                      isOwned ||
                      coins === null ||
                      isPending ||
                      (!isOwned && !canAfford)
                    }
                    onClick={() => void handlePurchase(item)}
                  >
                    {isOwned
                      ? "Owned"
                      : isPending
                        ? "Purchasing..."
                        : canAfford
                          ? "Buy"
                          : "Not enough points"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
