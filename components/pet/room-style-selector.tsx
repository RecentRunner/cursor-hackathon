"use client";

import { Lock } from "lucide-react";

import { PIECE_SLOT_COUNT } from "@/lib/character/presets";
import {
  ROOM_BACKGROUNDS,
  isRoomBackgroundUnlocked,
  type RoomBackgroundId,
} from "@/lib/room-backgrounds";
import { cn } from "@/lib/utils";

type RoomStyleSelectorProps = {
  activeId: RoomBackgroundId;
  ownedItemIds: readonly string[];
  onSelect: (roomId: RoomBackgroundId) => void;
};

export function RoomStyleSelector({
  activeId,
  ownedItemIds,
  onSelect,
}: RoomStyleSelectorProps) {
  const slots = Array.from({ length: PIECE_SLOT_COUNT }, (_, index) =>
    ROOM_BACKGROUNDS[index] ?? null,
  );

  return (
    <div className="grid grid-cols-8 gap-2">
      {slots.map((room, index) => {
        if (!room) {
          return (
            <div
              key={`empty-${index}`}
              aria-hidden
              className="size-14 rounded-lg border border-dashed border-border/50 bg-muted/15"
            />
          );
        }

        const locked = !isRoomBackgroundUnlocked(room.id, ownedItemIds);

        return (
          <button
            key={room.id}
            type="button"
            disabled={locked}
            aria-disabled={locked}
            title={
              locked ? `${room.name} — unlock in the shop` : room.name
            }
            aria-label={
              locked ? `${room.name}, locked — unlock in the shop` : room.name
            }
            aria-pressed={activeId === room.id}
            onClick={() => onSelect(room.id)}
            className={cn(
              "relative size-14 overflow-hidden rounded-lg border transition-colors",
              locked
                ? "cursor-not-allowed border-border/40 opacity-80"
                : activeId === room.id
                  ? "border-foreground shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.15)]"
                  : "border-border/60 hover:border-border",
            )}
          >
            <div className={cn("absolute inset-0", room.previewClassName)} />
            {locked ? (
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center bg-background/75"
              >
                <Lock className="size-4 text-muted-foreground" strokeWidth={2.25} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
