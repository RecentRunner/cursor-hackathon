export type RoomBackgroundId =

  | "room-day"

  | "room-dusk"

  | "room-night"

  | "room-forest";



export type RoomBackgroundLayer = {

  id: string;

  className: string;

  speed: number;

};



export type RoomBackground = {

  id: RoomBackgroundId;

  name: string;

  free: boolean;

  previewClassName: string;

  /** Full-scene SVG used for shop thumbnail and in-app preview parity. */
  sceneImage?: string;

  layers: RoomBackgroundLayer[];

};



export const DEFAULT_ROOM_BACKGROUND: RoomBackgroundId = "room-day";



export const ROOM_BACKGROUNDS: RoomBackground[] = [

  {

    id: "room-day",

    name: "Sunny Field",

    free: true,

    previewClassName: "bg-gradient-to-b from-sky-400 via-sky-300 to-lime-400",

    layers: [

      { id: "sky", className: "bg-gradient-to-b from-sky-500 via-sky-300 to-sky-200", speed: 0.15 },

      { id: "clouds", className: "bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.85)_0%,transparent_35%),radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.7)_0%,transparent_30%)]", speed: 0.35 },

      { id: "hills", className: "bg-[linear-gradient(to_top,#3d8b37_0%,#3d8b37_40%,transparent_40%),radial-gradient(ellipse_120%_80%_at_50%_100%,#2f6f2c_0%,transparent_70%)]", speed: 0.55 },

      { id: "grass", className: "bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.06)_0_2px,transparent_2px_6px)] opacity-40", speed: 0.75 },

    ],

  },

  {

    id: "room-dusk",

    name: "Golden Dusk",

    free: true,

    previewClassName: "bg-gradient-to-b from-orange-400 via-pink-400 to-indigo-700",

    layers: [

      { id: "sky", className: "bg-gradient-to-b from-orange-500 via-rose-400 to-indigo-800", speed: 0.12 },

      { id: "sun", className: "bg-[radial-gradient(circle_at_50%_85%,rgba(255,220,120,0.95)_0%,rgba(255,160,80,0.35)_18%,transparent_45%)]", speed: 0.25 },

      { id: "hills", className: "bg-[radial-gradient(ellipse_130%_70%_at_50%_100%,#1f2937_0%,transparent_72%)]", speed: 0.5 },

      { id: "stars", className: "bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.8)_1px,transparent_1px),radial-gradient(circle_at_25%_42%,rgba(255,255,255,0.7)_1px,transparent_1px),radial-gradient(circle_at_38%_12%,rgba(255,255,255,0.9)_1px,transparent_1px),radial-gradient(circle_at_52%_35%,rgba(255,255,255,0.65)_1px,transparent_1px),radial-gradient(circle_at_68%_22%,rgba(255,255,255,0.75)_1px,transparent_1px),radial-gradient(circle_at_82%_48%,rgba(255,255,255,0.7)_1px,transparent_1px),radial-gradient(circle_at_18%_65%,rgba(255,255,255,0.85)_1px,transparent_1px),radial-gradient(circle_at_45%_58%,rgba(255,255,255,0.6)_1px,transparent_1px),radial-gradient(circle_at_72%_72%,rgba(255,255,255,0.7)_1px,transparent_1px),radial-gradient(circle_at_90%_15%,rgba(255,255,255,0.8)_1px,transparent_1px),radial-gradient(circle_at_8%_82%,rgba(255,255,255,0.65)_1px,transparent_1px),radial-gradient(circle_at_58%_88%,rgba(255,255,255,0.75)_1px,transparent_1px)] opacity-20", speed: 0.65 },

    ],

  },

  {

    id: "room-night",

    name: "Starlit Night",

    free: false,

    previewClassName: "bg-gradient-to-b from-[#1e1b4b] via-[#4c1d95] to-[#0f172a]",

    sceneImage: "/shop/room-night.svg",

    layers: [],

  },

  {

    id: "room-forest",

    name: "Mystic Forest",

    free: false,

    previewClassName: "bg-gradient-to-b from-[#064e3b] via-[#14532d] to-[#052e16]",

    sceneImage: "/shop/room-forest.svg",

    layers: [],

  },

];



const ROOM_MAP = new Map(ROOM_BACKGROUNDS.map((room) => [room.id, room]));



const LEGACY_ROOM_IDS = new Set(["room-space", "room-neon"]);



export function getRoomBackground(id: string | null | undefined): RoomBackground {

  if (id && LEGACY_ROOM_IDS.has(id)) {

    return ROOM_MAP.get(DEFAULT_ROOM_BACKGROUND)!;

  }



  return ROOM_MAP.get((id as RoomBackgroundId) ?? DEFAULT_ROOM_BACKGROUND) ?? ROOM_MAP.get(DEFAULT_ROOM_BACKGROUND)!;

}



export function isValidRoomBackgroundId(id: string): id is RoomBackgroundId {

  return ROOM_MAP.has(id as RoomBackgroundId);

}



export function normalizeRoomBackgroundId(id: string | null | undefined): RoomBackgroundId {

  if (id && LEGACY_ROOM_IDS.has(id)) {

    return DEFAULT_ROOM_BACKGROUND;

  }



  if (id && isValidRoomBackgroundId(id)) {

    return id;

  }



  return DEFAULT_ROOM_BACKGROUND;

}



export function isRoomBackgroundUnlocked(

  roomId: RoomBackgroundId,

  ownedItemIds: readonly string[],

): boolean {

  const room = getRoomBackground(roomId);

  if (room.free) {

    return true;

  }



  return ownedItemIds.includes(roomId);

}



export function getShopRoomBackgrounds() {

  return ROOM_BACKGROUNDS.filter((room) => !room.free).map((room) => ({

    id: room.id,

    name: room.name,

    type: "room" as const,

    price: room.id === "room-night" ? 40 : 50,

    image_path: room.sceneImage ?? "",

  }));

}


