import { DEFAULT_STARTING_COINS } from "@/lib/coins";
import { notifyHabitPetDataUpdated } from "@/lib/app-events";
import {
  hexToHsl,
  hslToHex,
  type HSL,
} from "@/lib/character/color-utils";
import {
  assertValidVariants,
  normalizeVariantId,
  normalizeVariants,
} from "@/lib/character/variant-validation";
import {
  buildDefaultVariants,
  DEFAULT_GRAY_COLOR,
  LAYER_DEFAULT_COLORS,
  NONE_VARIANT_ID,
} from "@/lib/character/presets";
import type { LayerColorState, LayerVariantState } from "@/lib/character/types";
import {
  DEFAULT_ROOM_BACKGROUND,
  normalizeRoomBackgroundId,
  type RoomBackgroundId,
} from "@/lib/room-backgrounds";
import { createClient } from "@/lib/supabase/client";

export type AvatarCustomization = {
  name: string;
  colors: LayerColorState;
  variants: LayerVariantState;
  customized: boolean;
  equippedItems: string[];
  roomBackground: RoomBackgroundId;
};

type AvatarStateRow = {
  avatar_name: string | null;
  skin_color: string | null;
  pants_style: string | null;
  pants_color: string | null;
  shoe_style: string | null;
  shoe_color: string | null;
  torso_style: string | null;
  torso_color: string | null;
  eye_type: string | null;
  eye_color: string | null;
  head_style: string | null;
  head_color: string | null;
  avatar_customized: boolean | null;
  equipped_items: string[] | null;
  room_background: string | null;
};

export const DEFAULT_AVATAR_NAME = "Pixel Me";
const DEFAULT_HEX = DEFAULT_GRAY_COLOR.hex;
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export const defaultAvatarCustomization: AvatarCustomization = {
  name: DEFAULT_AVATAR_NAME,
  colors: { ...LAYER_DEFAULT_COLORS },
  variants: buildDefaultVariants(),
  customized: false,
  equippedItems: [],
  roomBackground: DEFAULT_ROOM_BACKGROUND,
};

const avatarSelectFields =
  "avatar_name, skin_color, pants_style, pants_color, shoe_style, shoe_color, torso_style, torso_color, eye_type, eye_color, head_style, head_color, avatar_customized, equipped_items, room_background";

const avatarSelectFieldsLegacy =
  "avatar_name, skin_color, pants_style, pants_color, shoe_style, shoe_color, torso_style, torso_color, eye_type, eye_color, head_style, head_color, avatar_customized, equipped_items";

function isMissingRoomBackgroundColumn(message: string) {
  return /room_background/i.test(message);
}

function colorFromHex(hex: string | null | undefined, fallback: HSL): HSL {
  if (!hex?.trim() || !HEX_COLOR_PATTERN.test(hex)) {
    return { ...fallback };
  }

  try {
    return hexToHsl(hex);
  } catch {
    return { ...fallback };
  }
}

function normalizeHexColor(color: HSL, fallback: HSL) {
  const hex = hslToHex(color);

  if (!HEX_COLOR_PATTERN.test(hex)) {
    return hslToHex(fallback);
  }

  return hex.toLowerCase();
}

export function mapRowToAvatarCustomization(
  row: AvatarStateRow | null | undefined,
): AvatarCustomization {
  if (!row) {
    return { ...defaultAvatarCustomization };
  }

  const defaults = defaultAvatarCustomization;

  return {
    name: row.avatar_name?.trim() || DEFAULT_AVATAR_NAME,
    colors: {
      skin: colorFromHex(row.skin_color, defaults.colors.skin),
      pants: colorFromHex(row.pants_color, defaults.colors.pants),
      shoes: colorFromHex(row.shoe_color, defaults.colors.shoes),
      torso: colorFromHex(row.torso_color, defaults.colors.torso),
      eyes: colorFromHex(row.eye_color, defaults.colors.eyes),
      head: colorFromHex(row.head_color, defaults.colors.head),
    },
    variants: {
      skin: "skin-1",
      pants: normalizeVariantId("pants", row.pants_style),
      shoes: normalizeVariantId("shoes", row.shoe_style),
      torso: normalizeVariantId("torso", row.torso_style),
      eyes: normalizeVariantId("eyes", row.eye_type),
      head: normalizeVariantId("head", row.head_style),
    },
    customized: row.avatar_customized === true,
    equippedItems: row.equipped_items ?? [],
    roomBackground: normalizeRoomBackgroundId(row.room_background),
  };
}

export function mapAvatarCustomizationToRow(customization: AvatarCustomization) {
  const normalizedVariants = normalizeVariants(customization.variants);
  assertValidVariants(normalizedVariants);

  const { colors, name } = customization;
  const defaults = defaultAvatarCustomization.colors;

  return {
    avatar_name: name.trim() || DEFAULT_AVATAR_NAME,
    skin_color: normalizeHexColor(colors.skin, defaults.skin),
    pants_style: normalizedVariants.pants,
    pants_color: normalizeHexColor(colors.pants, defaults.pants),
    shoe_style: normalizedVariants.shoes,
    shoe_color: normalizeHexColor(colors.shoes, defaults.shoes),
    torso_style: normalizedVariants.torso,
    torso_color: normalizeHexColor(colors.torso, defaults.torso),
    eye_type: normalizedVariants.eyes,
    eye_color: normalizeHexColor(colors.eyes, defaults.eyes),
    head_style: normalizedVariants.head,
    head_color: normalizeHexColor(colors.head, defaults.head),
    room_background: normalizeRoomBackgroundId(customization.roomBackground),
    avatar_customized: true,
    updated_at: new Date().toISOString(),
  };
}

async function getAuthenticatedUserId() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

export async function getAvatarCustomization(): Promise<AvatarCustomization> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { ...defaultAvatarCustomization };
  }

  const supabase = createClient();
  let { data, error } = await supabase
    .from("avatar_state")
    .select(avatarSelectFields)
    .eq("user_id", userId)
    .maybeSingle();

  if (error && isMissingRoomBackgroundColumn(error.message)) {
    const legacy = await supabase
      .from("avatar_state")
      .select(avatarSelectFieldsLegacy)
      .eq("user_id", userId)
      .maybeSingle();

    if (legacy.error) {
      throw new Error(legacy.error.message);
    }

    data = legacy.data
      ? ({ ...legacy.data, room_background: null } as AvatarStateRow)
      : null;
    error = null;
  } else if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const { error: insertError } = await supabase.from("avatar_state").insert({
      user_id: userId,
      coins: DEFAULT_STARTING_COINS,
      avatar_name: DEFAULT_AVATAR_NAME,
      skin_color: DEFAULT_HEX,
      pants_style: NONE_VARIANT_ID,
      pants_color: DEFAULT_HEX,
      shoe_style: NONE_VARIANT_ID,
      shoe_color: DEFAULT_HEX,
      torso_style: NONE_VARIANT_ID,
      torso_color: DEFAULT_HEX,
      eye_type: NONE_VARIANT_ID,
      eye_color: DEFAULT_HEX,
      head_style: NONE_VARIANT_ID,
      head_color: DEFAULT_HEX,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return { ...defaultAvatarCustomization };
  }

  return mapRowToAvatarCustomization(data as AvatarStateRow);
}

export async function saveAvatarCustomization(
  customization: AvatarCustomization,
  options?: { completeOnboarding?: boolean },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to save your avatar.");
  }

  const supabase = createClient();
  const payload = mapAvatarCustomizationToRow(customization);

  let { error } = await supabase
    .from("avatar_state")
    .update(payload)
    .eq("user_id", userId);

  if (error && isMissingRoomBackgroundColumn(error.message)) {
    const { room_background, ...legacyPayload } = payload;
    void room_background;
    const retry = await supabase
      .from("avatar_state")
      .update(legacyPayload)
      .eq("user_id", userId);

    error = retry.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  if (options?.completeOnboarding) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ onboarding_complete: true })
      .eq("id", userId);

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        onboarding_quiz_completed: true,
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }
  }

  notifyHabitPetDataUpdated();
  return customization;
}

export async function saveAvatarName(name: string) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to rename your avatar.");
  }

  const trimmed = name.trim() || DEFAULT_AVATAR_NAME;
  const supabase = createClient();
  const { error } = await supabase
    .from("avatar_state")
    .update({
      avatar_name: trimmed,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  notifyHabitPetDataUpdated();
  return trimmed;
}
