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
  onLockedSelect?: (roomId: RoomBackgroundId) => void;
};

export function RoomStyleSelector({
  activeId,
  ownedItemIds,
  onSelect,
  onLockedSelect,
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
            title={
              locked ? `${room.name} — preview in shop` : room.name
            }
            aria-label={
              locked ? `${room.name}, locked — preview to unlock` : room.name
            }
            aria-pressed={activeId === room.id}
            onClick={() => {
              if (locked) {
                onLockedSelect?.(room.id);
                return;
              }

              onSelect(room.id);
            }}
            className={cn(
              "relative size-14 overflow-hidden rounded-lg border transition-colors",
              locked
                ? "border-border/40 hover:border-border"
                : activeId === room.id
                  ? "border-foreground shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.15)]"
                  : "border-border/60 hover:border-border",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={room.sceneImage}
              alt=""
              className="absolute inset-0 size-full object-cover image-pixelated"
            />
            {locked ? (
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="rounded bg-black/50 p-1">
                  <Lock className="size-4 text-white" strokeWidth={2.25} />
                </span>
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
