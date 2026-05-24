"use client";

import { useEffect, useRef, useState } from "react";

import {
  getRoomBackground,
  type RoomBackgroundId,
} from "@/lib/room-backgrounds";
import { cn } from "@/lib/utils";

type ParallaxRoomBackgroundProps = {
  roomId: RoomBackgroundId;
  className?: string;
  interactive?: boolean;
};

export function ParallaxRoomBackground({
  roomId,
  className,
  interactive = true,
}: ParallaxRoomBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const room = getRoomBackground(roomId);
  const usesSceneImage = Boolean(room.sceneImage);

  useEffect(() => {
    if (!interactive || usesSceneImage) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      setOffset({ x, y });
    };

    container.addEventListener("pointermove", handlePointerMove);
    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
    };
  }, [interactive, usesSceneImage]);

  if (room.sceneImage) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "absolute inset-0 z-0 overflow-hidden",
          room.previewClassName,
          className,
        )}
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

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 z-0 overflow-hidden", className)}
    >
      {room.layers.map((layer, index) => (
        <div
          key={layer.id}
          aria-hidden
          className={cn(
            "absolute inset-[-12%]",
            layer.className,
            index % 2 === 0 ? "animate-parallax-drift" : "animate-star-twinkle",
          )}
          style={{
            transform: `translate3d(${offset.x * layer.speed * 10}px, ${offset.y * layer.speed * 8}px, 0)`,
            transition: "transform 0.15s steps(4)",
          }}
        />
      ))}
    </div>
  );
}
