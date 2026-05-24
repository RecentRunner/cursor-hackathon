export type RoomBackgroundId =
  | "room-1"
  | "room-2"
  | "room-3"
  | "room-4";

export type RoomBackground = {
  id: RoomBackgroundId;
  name: string;
  free: boolean;
  sceneImage: string;
};

export const DEFAULT_ROOM_BACKGROUND: RoomBackgroundId = "room-1";

export const ROOM_SCENE_IMAGE_PATH = (id: RoomBackgroundId) =>
  `/room/${id}.png`;

export const ROOM_BACKGROUNDS: RoomBackground[] = [
  {
    id: "room-1",
    name: "Sunny Field",
    free: true,
    sceneImage: ROOM_SCENE_IMAGE_PATH("room-1"),
  },
  {
    id: "room-2",
    name: "Golden Dusk",
    free: true,
    sceneImage: ROOM_SCENE_IMAGE_PATH("room-2"),
  },
  {
    id: "room-3",
    name: "Starlit Night",
    free: false,
    sceneImage: ROOM_SCENE_IMAGE_PATH("room-3"),
  },
  {
    id: "room-4",
    name: "Mystic Forest",
    free: false,
    sceneImage: ROOM_SCENE_IMAGE_PATH("room-4"),
  },
];

const ROOM_MAP = new Map(ROOM_BACKGROUNDS.map((room) => [room.id, room]));

const LEGACY_ROOM_ID_MAP: Record<string, RoomBackgroundId> = {
  "room-day": "room-1",
  "room-dusk": "room-2",
  "room-night": "room-3",
  "room-forest": "room-4",
  "room-space": "room-1",
  "room-neon": "room-1",
};

export function getRoomBackground(id: string | null | undefined): RoomBackground {
  const normalized = normalizeRoomBackgroundId(id);
  return ROOM_MAP.get(normalized) ?? ROOM_MAP.get(DEFAULT_ROOM_BACKGROUND)!;
}

export function isValidRoomBackgroundId(id: string): id is RoomBackgroundId {
  return ROOM_MAP.has(id as RoomBackgroundId);
}

export function normalizeRoomBackgroundId(
  id: string | null | undefined,
): RoomBackgroundId {
  if (!id) {
    return DEFAULT_ROOM_BACKGROUND;
  }

  if (isValidRoomBackgroundId(id)) {
    return id;
  }

  return LEGACY_ROOM_ID_MAP[id] ?? DEFAULT_ROOM_BACKGROUND;
}

export function isRoomBackgroundUnlocked(
  roomId: RoomBackgroundId,
  ownedItemIds: readonly string[],
): boolean {
  const room = getRoomBackground(roomId);
  if (room.free) {
    return true;
  }

  return ownedItemIds.some(
    (ownedId) => normalizeRoomBackgroundId(ownedId) === roomId,
  );
}

export function getShopRoomBackgrounds() {
  return ROOM_BACKGROUNDS.filter((room) => !room.free).map((room) => ({
    id: room.id,
    name: room.name,
    type: "room" as const,
    price: room.id === "room-3" ? 40 : 50,
    image_path: room.sceneImage,
  }));
}
