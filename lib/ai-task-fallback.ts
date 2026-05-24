import type { AiTaskContext } from "@/lib/ai-task-context";
import { buildJournalAwareFallbackLabels } from "@/lib/ai-journal-hints";
import {
  habitCatalog,
  matchesFocusTopics,
  matchesQuizAnswers,
} from "@/lib/habit-catalog";
import { finalizeNewAiTaskLabels } from "@/lib/ai-habit-utils";
import {
  MAX_DAILY_AI_TASKS,
  type AiTaskGenerationOptions,
} from "@/lib/ai-task-generation";

export function buildFallbackAiTaskLabels(
  context: AiTaskContext,
  options?: AiTaskGenerationOptions,
): string[] {
  const labels = new Set<string>(buildJournalAwareFallbackLabels(context));

  for (const entry of habitCatalog) {
    const fromFocus = matchesFocusTopics(entry, context.preferences);
    const fromQuiz = context.dailyQuiz
      ? matchesQuizAnswers(entry, context.dailyQuiz)
      : false;

    if (fromFocus || fromQuiz) {
      labels.add(entry.label);
    }
  }

  return finalizeNewAiTaskLabels(Array.from(labels), {
    excludeLabels: options?.excludeLabels,
    maxCount: options?.maxCount ?? MAX_DAILY_AI_TASKS,
  });
}
