import { notifyHabitPetDataUpdated } from "@/lib/app-events";

export type ProfilePreferences = {
  focusTopics: string[];
  avatarVibe: string;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
};

const STORAGE_KEY = "habit-pet-profile-preferences";

export const focusTopicOptions = [
  "Sleep",
  "Movement",
  "Hydration",
  "Mindfulness",
] as const;

export const avatarVibeOptions = ["Calm", "Energetic", "Curious", "Cozy"] as const;

export const defaultProfilePreferences: ProfilePreferences = {
  focusTopics: ["Movement"],
  avatarVibe: "Calm",
  dailyReminderEnabled: false,
  dailyReminderTime: "20:00",
};

export function getProfilePreferences(): ProfilePreferences {
  if (typeof window === "undefined") {
    return defaultProfilePreferences;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultProfilePreferences;
  }

  try {
    return {
      ...defaultProfilePreferences,
      ...(JSON.parse(raw) as Partial<ProfilePreferences>),
    };
  } catch {
    return defaultProfilePreferences;
  }
}

export function saveProfilePreferences(preferences: ProfilePreferences) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  notifyHabitPetDataUpdated();
}
