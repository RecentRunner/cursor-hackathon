export type AvatarAmbientTrack = {
  filename: string;
  label: string;
};

export const AVATAR_AMBIENT_PLAYLIST: readonly AvatarAmbientTrack[] = [
  { filename: "Pixel Meadow.mp3", label: "Pixel Meadow" },
  { filename: "Pixel Meadow faster.mp3", label: "Pixel Meadow (fast)" },
] as const;

export function getAvatarAmbientTrackSrc(filename: string) {
  return `/audio/${encodeURIComponent(filename)}`;
}

const STORAGE_KEY = "habit-bit-avatar-audio";

export type AvatarAudioPreferences = {
  volume: number;
  muted: boolean;
};

const DEFAULT_PREFERENCES: AvatarAudioPreferences = {
  volume: 0.6,
  muted: false,
};

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function getAvatarAudioPreferences(): AvatarAudioPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<AvatarAudioPreferences>;

    return {
      volume:
        typeof parsed.volume === "number"
          ? clampVolume(parsed.volume)
          : DEFAULT_PREFERENCES.volume,
      muted:
        typeof parsed.muted === "boolean"
          ? parsed.muted
          : DEFAULT_PREFERENCES.muted,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function setAvatarAudioPreferences(
  preferences: AvatarAudioPreferences,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      volume: clampVolume(preferences.volume),
      muted: preferences.muted,
    }),
  );
}
