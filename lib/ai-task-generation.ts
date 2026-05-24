import type { AiTaskContext } from "@/lib/ai-task-context";

export const MAX_DAILY_AI_TASKS = 5;

export type AiTaskGenerationOptions = {
  excludeLabels?: string[];
  maxCount?: number;
};

export function getGenerationSlotCount(
  carryOverCount: number,
  maxCount = MAX_DAILY_AI_TASKS,
) {
  return Math.max(0, maxCount - carryOverCount);
}

export function buildGenerationUserPrompt(
  _context: AiTaskContext,
  options?: AiTaskGenerationOptions,
) {
  const maxCount = options?.maxCount ?? MAX_DAILY_AI_TASKS;
  const excludeLabels = options?.excludeLabels ?? [];

  const baseRequest =
    excludeLabels.length === 0
      ? `Generate today's personalized habit task labels as a JSON array of up to ${maxCount} strings.`
      : [
          `Generate exactly ${maxCount} NEW habit task labels as a JSON array of strings.`,
          "Do not repeat or rephrase any of these existing tasks the user already has:",
          ...excludeLabels.map((label) => `- ${label}`),
          "Use different wording only for genuinely different activities.",
        ].join("\n");

  return [
    baseRequest,
    "Output contract: respond with ONLY a JSON array of strings. Do not include explanations, markdown, or any other text.",
  ].join("\n\n");
}
