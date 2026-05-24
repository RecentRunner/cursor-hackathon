"use client";

import { Coins, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { CharacterLayerPreview } from "@/components/character/character-layer-preview";
import { ParallaxRoomBackground } from "@/components/pet/parallax-room-background";
import { Button } from "@/components/ui/button";
import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import {
  buildShopItemPreviewCustomization,
  getShopPreviewRoomId,
} from "@/lib/shop-preview";
import type { ShopItemRecord } from "@/lib/shop-catalog";
import { routes } from "@/lib/routes";

type ShopItemPreviewModalProps = {
  item: ShopItemRecord | null;
  baseCustomization: AvatarCustomization;
  coins: number | null;
  owned: boolean;
  equipped: boolean;
  canAfford: boolean;
  isPending: boolean;
  onClose: () => void;
  onPurchase: () => void;
  onEquipToggle: () => void;
  showCustomizeLink?: boolean;
};

export function ShopItemPreviewModal({
  item,
  baseCustomization,
  coins,
  owned,
  equipped,
  canAfford,
  isPending,
  onClose,
  onPurchase,
  onEquipToggle,
  showCustomizeLink = true,
}: ShopItemPreviewModalProps) {
  useEffect(() => {
    if (!item) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) {
    return null;
  }

  const previewCustomization = buildShopItemPreviewCustomization(
    baseCustomization,
    item,
  );
  const roomId = getShopPreviewRoomId(item, baseCustomization);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-preview-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border-2 border-border bg-card shadow-[var(--retro-shadow)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b-2 border-border px-4 py-3">
          <div className="min-w-0">
            <p
              id="shop-preview-title"
              className="text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Preview on your bit
            </p>
            <p className="mt-1 truncate text-sm">{item.name}</p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            aria-label="Close preview"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <div className="tamagotchi-lcd relative aspect-[4/3] w-full overflow-hidden">
            <ParallaxRoomBackground roomId={roomId} />
            <div className="relative z-10 flex h-full items-center justify-center">
              <CharacterLayerPreview
                colors={previewCustomization.colors}
                variants={previewCustomization.variants}
                equippedItems={previewCustomization.equippedItems}
                scale={8}
                compact
                className="!h-auto max-h-none"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-8 bg-gradient-to-t from-black/35 to-transparent" />
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            This is a preview only. Nothing is purchased or equipped until you confirm.
          </p>

          <div className="mt-4 grid gap-2 border-t-2 border-border pt-4">
            <div className="flex items-center justify-end gap-1.5 border-2 border-primary/30 bg-primary/5 px-3 py-2.5">
              <Coins aria-hidden="true" className="size-4 text-primary" />
              <span className="text-xl font-bold tabular-nums text-primary">
                {item.price}
              </span>
              <span className="text-sm text-muted-foreground">points</span>
            </div>

            {owned ? (
              <Button
                type="button"
                className="w-full"
                variant={equipped ? "default" : "outline"}
                disabled={
                  isPending || (item.type !== "room" && equipped)
                }
                onClick={onEquipToggle}
              >
                {isPending
                  ? "Updating..."
                  : equipped
                    ? "Equipped"
                    : "Equip"}
              </Button>
            ) : (
              <>
                {!canAfford && coins !== null ? (
                  <p className="text-center text-[10px] text-muted-foreground">
                    You need {item.price - coins} more points to buy this item.
                    Keep completing habits to earn more.
                  </p>
                ) : null}
                <Button
                  type="button"
                  className="w-full"
                  disabled={isPending || !canAfford}
                  onClick={onPurchase}
                >
                  {isPending
                    ? "Processing..."
                    : canAfford
                      ? `Buy for ${item.price} points`
                      : "Need more points"}
                </Button>
              </>
            )}

            {showCustomizeLink ? (
              <Button type="button" className="w-full" variant="outline" asChild>
                <Link href={routes.customize}>Open in Customize</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
