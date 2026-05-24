export const HABIT_PET_DATA_UPDATED_EVENT = "habit-pet-data-updated";

export function notifyHabitPetDataUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(HABIT_PET_DATA_UPDATED_EVENT));
}
