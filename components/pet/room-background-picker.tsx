"use client";

import { Lock } from "lucide-react";

import {
  ROOM_BACKGROUNDS,
  isRoomBackgroundUnlocked,
  type RoomBackgroundId,
} from "@/lib/room-backgrounds";
import { cn } from "@/lib/utils";

type RoomBackgroundPickerProps = {
  value: RoomBackgroundId;
  ownedItemIds: string[];
  onChange: (roomId: RoomBackgroundId) => void;
  onLockedSelect?: (roomId: RoomBackgroundId) => void;
  compact?: boolean;
};

export function RoomBackgroundPicker({
  value,
  ownedItemIds,
  onChange,
  onLockedSelect,
  compact = false,
}: RoomBackgroundPickerProps) {
  return (
    <section className="grid gap-3">
      {!compact ? (
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Room background
          </h3>
          <p className="mt-1 text-[9px] text-muted-foreground">
            Pick the scene behind your pet. Premium rooms unlock in the shop.
          </p>
        </div>
      ) : (
        <p className="text-[9px] text-muted-foreground">
          Premium rooms unlock in the shop.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {ROOM_BACKGROUNDS.map((room) => {
          const unlocked = isRoomBackgroundUnlocked(room.id, ownedItemIds);
          const selected = value === room.id;

          return (
            <button
              key={room.id}
              type="button"
              aria-pressed={selected}
              title={
                unlocked
                  ? room.name
                  : `${room.name} — preview in shop`
              }
              onClick={() => {
                if (!unlocked) {
                  onLockedSelect?.(room.id);
                  return;
                }

                onChange(room.id);
              }}
              className={cn(
                "relative aspect-[4/3] overflow-hidden border-2 transition-transform",
                selected
                  ? "border-secondary shadow-[0_0_0_2px_hsl(var(--secondary)/0.35)]"
                  : "border-border/70",
                "hover:-translate-y-0.5",
              )}
            >
              {room.sceneImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={room.sceneImage}
                  alt=""
                  className="absolute inset-0 size-full object-cover image-pixelated"
                />
              ) : (
                <div className={cn("absolute inset-0", room.previewClassName)} />
              )}
              <p className="absolute inset-x-0 bottom-0 bg-black/55 px-1.5 py-1 text-left text-[8px] uppercase tracking-wider text-foreground">
                {room.name}
              </p>
              {!unlocked ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded bg-black/50 p-1">
                    <Lock className="size-4 text-white" strokeWidth={2.25} />
                  </span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
