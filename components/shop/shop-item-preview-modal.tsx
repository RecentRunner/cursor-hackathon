"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { CharacterLayerPreview } from "@/components/character/character-layer-preview";
import { ParallaxRoomBackground } from "@/components/pet/parallax-room-background";
import { Button } from "@/components/ui/button";
import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import { buildShopItemPreviewCustomization } from "@/lib/shop-preview";
import type { ShopItemRecord } from "@/lib/shop-catalog";
import {
  normalizeRoomBackgroundId,
  type RoomBackgroundId,
} from "@/lib/room-backgrounds";

type ShopItemPreviewModalProps = {
  item: ShopItemRecord | null;
  baseCustomization: AvatarCustomization | null;
  onClose: () => void;
};

export function ShopItemPreviewModal({
  item,
  baseCustomization,
  onClose,
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

  if (!item || !baseCustomization) {
    return null;
  }

  const previewCustomization = buildShopItemPreviewCustomization(
    baseCustomization,
    item,
  );
  const roomId = normalizeRoomBackgroundId(
    previewCustomization.roomBackground,
  ) as RoomBackgroundId;

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
              Preview on your pet
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
            <ParallaxRoomBackground roomId={roomId} interactive={false} />
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
            This preview does not equip or purchase the item.
          </p>
        </div>
      </div>
    </div>
  );
}
