import {
  DEFAULT_AVATAR_NAME,
  type AvatarCustomization,
} from "@/lib/avatar-customization-storage";
import {
  CHARACTER_LAYERS,
  COLOR_PRESETS,
  NONE_VARIANT_ID,
  type CharacterLayerId,
} from "@/lib/character/presets";
import { ROOM_BACKGROUNDS } from "@/lib/room-backgrounds";

const GUEST_PET_STORAGE_KEY = "habit-pet-guest-landing-pet";

const SKIN_TONE_IDS = [
  "porcelain",
  "fair",
  "light",
  "medium",
  "tan",
  "brown",
  "dark",
  "deep",
  "onyx",
] as const;

const OUTFIT_COLOR_IDS = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "black",
  "white",
] as const;

const EYE_COLOR_IDS = ["blue", "black", "green", "brown"] as const;

const HAIR_COLOR_IDS = ["brown", "black", "yellow", "red", "orange", "white"] as const;

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function presetHsl(id: string) {
  const preset = COLOR_PRESETS.find((entry) => entry.id === id);
  if (!preset) {
    throw new Error(`Missing color preset: ${id}`);
  }

  return { ...preset.hsl };
}

function pickRandomVariant(
  layerId: Exclude<CharacterLayerId, "skin">,
  allowNone = false,
): string {
  const layer = CHARACTER_LAYERS.find((entry) => entry.id === layerId);
  if (!layer) {
    throw new Error(`Missing character layer: ${layerId}`);
  }

  const options = layer.variants
    .map((variant) => variant.id)
    .filter((id) => allowNone || id !== NONE_VARIANT_ID);

  return pickRandom(options);
}

export function buildRandomLandingPetCustomization(): AvatarCustomization {
  const freeRooms = ROOM_BACKGROUNDS.filter((room) => room.free).map(
    (room) => room.id,
  );

  return {
    name: DEFAULT_AVATAR_NAME,
    colors: {
      skin: presetHsl(pickRandom(SKIN_TONE_IDS)),
      pants: presetHsl(pickRandom(OUTFIT_COLOR_IDS)),
      shoes: presetHsl(pickRandom(OUTFIT_COLOR_IDS)),
      torso: presetHsl(pickRandom(OUTFIT_COLOR_IDS)),
      eyes: presetHsl(pickRandom(EYE_COLOR_IDS)),
      head: presetHsl(pickRandom(HAIR_COLOR_IDS)),
    },
    variants: {
      skin: "skin-1",
      pants: pickRandomVariant("pants"),
      shoes: pickRandomVariant("shoes"),
      torso: pickRandomVariant("torso"),
      eyes: pickRandomVariant("eyes"),
      head: pickRandomVariant("head", Math.random() < 0.15),
    },
    customized: true,
    equippedItems: [],
    roomBackground: pickRandom(freeRooms),
  };
}

export function getGuestLandingPetCustomization(): AvatarCustomization {
  if (typeof window === "undefined") {
    return buildRandomLandingPetCustomization();
  }

  try {
    const cached = sessionStorage.getItem(GUEST_PET_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached) as AvatarCustomization;
    }

    const next = buildRandomLandingPetCustomization();
    sessionStorage.setItem(GUEST_PET_STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return buildRandomLandingPetCustomization();
  }
}
