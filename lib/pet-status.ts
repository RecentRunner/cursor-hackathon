import type { AvatarMood } from "@/lib/avatar-state";

export const PET_EMOTION_DISPLAY_MS = 3200;

export type PetStatusImageId = "status-1" | "status-2" | "status-3";

export const PET_STATUS_BY_MOOD: Record<AvatarMood, PetStatusImageId> = {
  happy: "status-1",
  neutral: "status-2",
  tired: "status-3",
};

export function getPetStatusImagePath(mood: AvatarMood): string {
  return `/status/${PET_STATUS_BY_MOOD[mood]}.png`;
}

export function getPetEmotionMessage(mood: AvatarMood): string {
  switch (mood) {
    case "happy":
      return "Your bit seems cheerful and in good spirits.";
    case "tired":
      return "Your bit seems worn out and could use some care.";
    default:
      return "Your bit seems steady and doing okay.";
  }
}
