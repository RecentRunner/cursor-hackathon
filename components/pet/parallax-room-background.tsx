"use client";

import {
  getRoomBackground,
  type RoomBackgroundId,
} from "@/lib/room-backgrounds";
import { cn } from "@/lib/utils";

type ParallaxRoomBackgroundProps = {
  roomId: RoomBackgroundId;
  className?: string;
};

export function ParallaxRoomBackground({
  roomId,
  className,
}: ParallaxRoomBackgroundProps) {
  const room = getRoomBackground(roomId);

  return (
    <div
      className={cn("absolute inset-0 z-0 overflow-hidden bg-lcd-bg", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={room.sceneImage}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover image-pixelated"
      />
    </div>
  );
}
