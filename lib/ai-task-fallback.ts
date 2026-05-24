import type { AiTaskContext } from "@/lib/ai-task-context";
import { buildJournalAwareFallbackLabels } from "@/lib/ai-journal-hints";
import {
  habitCatalog,
  matchesFocusTopics,
  matchesQuizAnswers,
} from "@/lib/habit-catalog";
import { sanitizePlausibleAiTaskLabels } from "@/lib/ai-habit-utils";

export function buildFallbackAiTaskLabels(context: AiTaskContext): string[] {
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

  return sanitizePlausibleAiTaskLabels(Array.from(labels));
}
