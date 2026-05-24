import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import {
  CHARACTER_LAYERS,
  COLOR_PRESETS,
  NONE_VARIANT_ID,
  type CharacterLayerId,
} from "@/lib/character/presets";
import { clampHsl } from "@/lib/character/color-utils";
import {
  ROOM_BACKGROUNDS,
  type RoomBackgroundId,
} from "@/lib/room-backgrounds";

const GUEST_PET_STORAGE_KEY = "habit-pet-guest-landing-pet";

export const GUEST_LANDING_BIT_NAMES = [
  "Alex",
  "Jordan",
  "Sam",
  "Taylor",
  "Morgan",
] as const;

const SKIN_COLOR_PRESETS = COLOR_PRESETS.filter((preset) =>
  [
    "porcelain",
    "fair",
    "light",
    "medium",
    "tan",
    "brown",
    "dark",
    "deep",
    "onyx",
  ].includes(preset.id),
);

const STYLE_COLOR_PRESETS = COLOR_PRESETS.filter(
  (preset) => !SKIN_COLOR_PRESETS.some((skin) => skin.id === preset.id),
);

const ALL_ROOM_IDS = ROOM_BACKGROUNDS.map((room) => room.id);

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

function randomHsl(): { h: number; s: number; l: number } {
  return clampHsl({
    h: Math.floor(Math.random() * 360),
    s: 35 + Math.floor(Math.random() * 50),
    l: 28 + Math.floor(Math.random() * 45),
  });
}

function pickRandomLayerColor(layerId: CharacterLayerId) {
  if (layerId === "skin") {
    return presetHsl(pickRandom(SKIN_COLOR_PRESETS).id);
  }

  if (Math.random() < 0.35) {
    return randomHsl();
  }

  return presetHsl(pickRandom(STYLE_COLOR_PRESETS).id);
}

function pickRandomLayerVariant(layerId: CharacterLayerId): string {
  const layer = CHARACTER_LAYERS.find((entry) => entry.id === layerId);
  if (!layer) {
    throw new Error(`Missing character layer: ${layerId}`);
  }

  if (!layer.allowVariants) {
    return layer.variants[0]?.id ?? NONE_VARIANT_ID;
  }

  return pickRandom(layer.variants.map((variant) => variant.id));
}

export function buildRandomLandingPetCustomization(): AvatarCustomization {
  return {
    name: pickRandom(GUEST_LANDING_BIT_NAMES),
    colors: {
      skin: pickRandomLayerColor("skin"),
      pants: pickRandomLayerColor("pants"),
      shoes: pickRandomLayerColor("shoes"),
      torso: pickRandomLayerColor("torso"),
      eyes: pickRandomLayerColor("eyes"),
      head: pickRandomLayerColor("head"),
    },
    variants: {
      skin: pickRandomLayerVariant("skin"),
      pants: pickRandomLayerVariant("pants"),
      shoes: pickRandomLayerVariant("shoes"),
      torso: pickRandomLayerVariant("torso"),
      eyes: pickRandomLayerVariant("eyes"),
      head: pickRandomLayerVariant("head"),
    },
    customized: true,
    equippedItems: [],
    roomBackground: pickRandom(ALL_ROOM_IDS) as RoomBackgroundId,
  };
}

export function getGuestLandingPetCustomization(): AvatarCustomization {
  if (typeof window === "undefined") {
    return buildRandomLandingPetCustomization();
  }

  try {
    const cached = sessionStorage.getItem(GUEST_PET_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as AvatarCustomization;
      if (
        GUEST_LANDING_BIT_NAMES.includes(
          parsed.name as (typeof GUEST_LANDING_BIT_NAMES)[number],
        )
      ) {
        return parsed;
      }
    }

    const next = buildRandomLandingPetCustomization();
    sessionStorage.setItem(GUEST_PET_STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return buildRandomLandingPetCustomization();
  }
}
