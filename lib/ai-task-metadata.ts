import type { ProfilePreferences } from "@/lib/profile-preferences-storage";

export type AiTaskGenerationMetadata = {
  aiTasksGeneratedOn: string | null;
  aiTasksInputHash: string | null;
};

type StoredProfilePreferences = ProfilePreferences & {
  aiTasksGeneratedOn?: string;
  aiTasksInputHash?: string;
};

export function getAiTaskGenerationMetadata(
  focusTopics: string | string[] | null | undefined,
): AiTaskGenerationMetadata {
  const parsed = parseStoredPreferences(focusTopics);

  return {
    aiTasksGeneratedOn: parsed.aiTasksGeneratedOn ?? null,
    aiTasksInputHash: parsed.aiTasksInputHash ?? null,
  };
}

export function mergeAiTaskGenerationMetadata(
  preferences: ProfilePreferences,
  metadata: AiTaskGenerationMetadata,
): string {
  const payload: StoredProfilePreferences = {
    ...preferences,
    aiTasksGeneratedOn: metadata.aiTasksGeneratedOn ?? undefined,
    aiTasksInputHash: metadata.aiTasksInputHash ?? undefined,
  };

  return JSON.stringify(payload);
}

function parseStoredPreferences(
  value: string | string[] | null | undefined,
): StoredProfilePreferences {
  const raw = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

  if (!raw.trim()) {
    return {
      focusTopic: "Movement",
      avatarVibe: "Calm",
      dailyReminderEnabled: false,
      dailyReminderTime: "20:00",
      dailyReminderDelivery: "in_app",
    };
  }

  try {
    const parsed = JSON.parse(raw) as StoredProfilePreferences;

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    return {
      focusTopic: raw,
      avatarVibe: "Calm",
      dailyReminderEnabled: false,
      dailyReminderTime: "20:00",
      dailyReminderDelivery: "in_app",
    };
  }

  return {
    focusTopic: "Movement",
    avatarVibe: "Calm",
    dailyReminderEnabled: false,
    dailyReminderTime: "20:00",
    dailyReminderDelivery: "in_app",
  };
}
