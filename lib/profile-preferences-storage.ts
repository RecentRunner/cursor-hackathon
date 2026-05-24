import { notifyHabitPetDataUpdated } from "@/lib/app-events";
import {
  normalizeReminderDeliveryMethod,
  type ReminderDeliveryMethod,
} from "@/lib/reminder-delivery";
import { createClient } from "@/lib/supabase/client";

export type ProfilePreferences = {
  focusTopic: string;
  avatarVibe: string;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  dailyReminderDelivery: ReminderDeliveryMethod;
};

type StoredProfilePreferences = {
  focusTopic?: string;
  avatarVibe?: string;
  dailyReminderEnabled?: boolean;
  dailyReminderTime?: string;
  dailyReminderDelivery?: string;
};

type ProfileRow = {
  focus_topics: string | string[] | null;
  onboarding_complete: boolean | null;
};

export const focusTopicOptions = [
  "Sleep",
  "Movement",
  "Hydration",
  "Mindfulness",
] as const;

export const avatarVibeOptions = ["Calm", "Energetic", "Curious", "Cozy"] as const;

export const defaultProfilePreferences: ProfilePreferences = {
  focusTopic: "Movement",
  avatarVibe: "Calm",
  dailyReminderEnabled: false,
  dailyReminderTime: "20:00",
  dailyReminderDelivery: "in_app",
};

function isFocusTopic(value: string) {
  return focusTopicOptions.includes(value as (typeof focusTopicOptions)[number]);
}

function isAvatarVibe(value: string) {
  return avatarVibeOptions.includes(value as (typeof avatarVibeOptions)[number]);
}

function normalizeFocusTopic(value: string | undefined) {
  if (value && isFocusTopic(value)) {
    return value;
  }

  return defaultProfilePreferences.focusTopic;
}

function normalizeAvatarVibe(value: string | undefined) {
  if (value && isAvatarVibe(value)) {
    return value;
  }

  return defaultProfilePreferences.avatarVibe;
}

function normalizePreferences(
  partial: Partial<ProfilePreferences>,
): ProfilePreferences {
  return {
    focusTopic: normalizeFocusTopic(partial.focusTopic),
    avatarVibe: normalizeAvatarVibe(partial.avatarVibe),
    dailyReminderEnabled:
      partial.dailyReminderEnabled ??
      defaultProfilePreferences.dailyReminderEnabled,
    dailyReminderTime:
      partial.dailyReminderTime ?? defaultProfilePreferences.dailyReminderTime,
    dailyReminderDelivery: normalizeReminderDeliveryMethod(
      partial.dailyReminderDelivery,
    ),
  };
}

function parseStoredPreferencesJson(raw: string): Partial<ProfilePreferences> {
  try {
    const parsed = JSON.parse(raw) as StoredProfilePreferences;

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Partial<ProfilePreferences>;
    }
  } catch {
    return { focusTopic: raw };
  }

  return { focusTopic: raw };
}

function parseFocusTopicsField(
  value: string | string[] | null | undefined,
): Partial<ProfilePreferences> {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return {};
    }

    return parseStoredPreferencesJson(value[0] ?? "");
  }

  if (!value?.trim()) {
    return {};
  }

  return parseStoredPreferencesJson(value);
}

function serializeFocusTopicsField(preferences: ProfilePreferences) {
  const payload: StoredProfilePreferences = {
    focusTopic: preferences.focusTopic,
    avatarVibe: preferences.avatarVibe,
    dailyReminderEnabled: preferences.dailyReminderEnabled,
    dailyReminderTime: preferences.dailyReminderTime,
    dailyReminderDelivery: preferences.dailyReminderDelivery,
  };

  return JSON.stringify(payload);
}

function isFocusTopicsTypeError(message: string) {
  return /array|malformed|invalid input syntax/i.test(message);
}

function mapRowToPreferences(row: ProfileRow): ProfilePreferences {
  return normalizePreferences(parseFocusTopicsField(row.focus_topics));
}

function hasStoredPreferences(row: ProfileRow) {
  if (Array.isArray(row.focus_topics)) {
    return row.focus_topics.some((value) => value.trim().length > 0);
  }

  return Boolean(row.focus_topics?.trim());
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

function getOnboardingAnswersFromMetadata(
  metadata: Record<string, unknown> | undefined,
) {
  const answers = metadata?.onboarding_answers;

  if (!answers || typeof answers !== "object") {
    return null;
  }

  const record = answers as Record<string, string>;

  return {
    focusTopic: record.focus,
    avatarVibe: record.avatarVibe ?? record["pet-name"],
  };
}

async function saveProfileRow(
  userId: string,
  preferences: ProfilePreferences,
  options?: { markOnboardingComplete?: boolean },
) {
  const supabase = createClient();
  const serialized = serializeFocusTopicsField(preferences);
  const focusTopicAttempts: Array<string | string[]> = [
    serialized,
    [serialized],
  ];
  const onboardingFields = options?.markOnboardingComplete
    ? { onboarding_complete: true }
    : {};

  let lastError: string | null = null;

  for (const focus_topics of focusTopicAttempts) {
    const { data: updatedRows, error: updateError } = await supabase
      .from("profiles")
      .update({
        focus_topics,
        ...onboardingFields,
      })
      .eq("id", userId)
      .select("focus_topics, onboarding_complete");

    if (!updateError && updatedRows && updatedRows.length > 0) {
      return updatedRows[0] as ProfileRow;
    }

    if (updateError) {
      lastError = updateError.message;

      if (!isFocusTopicsTypeError(updateError.message)) {
        throw new Error(updateError.message);
      }
    }
  }

  for (const focus_topics of focusTopicAttempts) {
    const { data: insertedRow, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        focus_topics,
        ...onboardingFields,
      })
      .select("focus_topics, onboarding_complete")
      .single();

    if (!insertError && insertedRow) {
      return insertedRow as ProfileRow;
    }

    if (insertError) {
      lastError = insertError.message;

      if (!isFocusTopicsTypeError(insertError.message)) {
        throw new Error(insertError.message);
      }
    }
  }

  throw new Error(lastError ?? "Could not save profile preferences.");
}

async function syncPreferencesFromMetadata(userId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const onboardingAnswers = getOnboardingAnswersFromMetadata(user?.user_metadata);

  if (!onboardingAnswers?.focusTopic && !onboardingAnswers?.avatarVibe) {
    return null;
  }

  const preferences = normalizePreferences(onboardingAnswers);
  const row = await saveProfileRow(userId, preferences, {
    markOnboardingComplete: true,
  });

  return mapRowToPreferences(row);
}

export async function getProfilePreferences(): Promise<ProfilePreferences> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return defaultProfilePreferences;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("focus_topics, onboarding_complete")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return defaultProfilePreferences;
  }

  const row = data as ProfileRow;

  if (!hasStoredPreferences(row)) {
    const synced = await syncPreferencesFromMetadata(userId);
    return synced ?? mapRowToPreferences(row);
  }

  return mapRowToPreferences(row);
}

export async function saveProfilePreferences(preferences: ProfilePreferences) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to save profile preferences.");
  }

  const normalizedPreferences = normalizePreferences(preferences);
  await saveProfileRow(userId, normalizedPreferences);
  notifyHabitPetDataUpdated();
  return normalizedPreferences;
}

export async function saveOnboardingPreferences(
  focusTopic: string,
  avatarVibe: string,
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to save onboarding preferences.");
  }

  const supabase = createClient();
  const preferences = normalizePreferences({ focusTopic, avatarVibe });

  await saveProfileRow(userId, preferences, { markOnboardingComplete: true });

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      onboarding_completed: true,
      onboarding_answers: {
        focus: preferences.focusTopic,
        avatarVibe: preferences.avatarVibe,
      },
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  notifyHabitPetDataUpdated();
  return preferences;
}
