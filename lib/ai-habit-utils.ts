import {
  dedupeSimilarTaskLabels,
  filterExcludedSimilarTaskLabels,
  isPlausibleTaskLabel,
} from "@/lib/ai-task-guardrails";
import {
  MAX_DAILY_AI_TASKS,
  type AiTaskGenerationOptions,
} from "@/lib/ai-task-generation";

export const AI_HABIT_NAME_PREFIX = "ai::";

export function toStoredAiHabitName(label: string) {
  return `${AI_HABIT_NAME_PREFIX}${label.trim()}`;
}

export function isAiGeneratedHabitName(name: string) {
  return name.startsWith(AI_HABIT_NAME_PREFIX);
}

export function displayHabitName(name: string) {
  return isAiGeneratedHabitName(name)
    ? name.slice(AI_HABIT_NAME_PREFIX.length)
    : name;
}

export function normalizeAiTaskLabel(label: string) {
  return label.trim().replace(/\s+/g, " ").slice(0, 80);
}

export function sanitizeAiTaskLabels(
  labels: unknown,
  options?: { requirePlausible?: boolean },
): string[] {
  if (!Array.isArray(labels)) {
    return [];
  }

  const seen = new Set<string>();

  const filtered = labels
    .filter((label): label is string => typeof label === "string")
    .map(normalizeAiTaskLabel)
    .filter((label) => label.length > 0)
    .filter((label) => {
      if (options?.requirePlausible && !isPlausibleTaskLabel(label)) {
        return false;
      }

      const key = label.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });

  return dedupeSimilarTaskLabels(filtered).slice(0, 5);
}

export function sanitizePlausibleAiTaskLabels(labels: unknown) {
  return sanitizeAiTaskLabels(labels, { requirePlausible: true });
}

export function finalizeDailyAiTaskLabels(
  carryOverLabels: string[],
  newLabels: string[],
  maxCount = MAX_DAILY_AI_TASKS,
) {
  return dedupeSimilarTaskLabels(
    sanitizePlausibleAiTaskLabels([...carryOverLabels, ...newLabels]),
  ).slice(0, maxCount);
}

export function finalizeNewAiTaskLabels(
  newLabels: string[],
  options?: AiTaskGenerationOptions,
) {
  const maxCount = options?.maxCount ?? MAX_DAILY_AI_TASKS;
  const excludeLabels = options?.excludeLabels ?? [];

  return dedupeSimilarTaskLabels(
    filterExcludedSimilarTaskLabels(
      sanitizePlausibleAiTaskLabels(newLabels),
      excludeLabels,
    ),
  ).slice(0, maxCount);
}

export { MAX_DAILY_AI_TASKS };
