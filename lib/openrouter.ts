import {
  finalizeNewAiTaskLabels,
  sanitizePlausibleAiTaskLabels,
} from "@/lib/ai-habit-utils";
import {
  extractSafeJsonTaskArray,
  UnsafeAiOutputError,
} from "@/lib/ai-output-safety";
import {
  AI_TASK_SYSTEM_PROMPT,
  buildAiTaskUserPrompt,
} from "@/lib/ai-prompt-security";
import {
  formatAiTaskContextForPrompt,
  type AiTaskContext,
} from "@/lib/ai-task-context";
import {
  buildGenerationUserPrompt,
  MAX_DAILY_AI_TASKS,
  type AiTaskGenerationOptions,
} from "@/lib/ai-task-generation";
import { mergeJournalHintsIntoLabels } from "@/lib/ai-journal-hints";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const DEFAULT_OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ?? "google/gemma-2-9b-it:free";

export async function generateAiTaskLabels(
  context: AiTaskContext,
  options?: AiTaskGenerationOptions,
): Promise<string[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const maxCount = options?.maxCount ?? MAX_DAILY_AI_TASKS;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": siteUrl,
      "X-Title": "HaBit Pet",
    },
    body: JSON.stringify({
      model: DEFAULT_OPENROUTER_MODEL,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: AI_TASK_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: buildAiTaskUserPrompt(
            formatAiTaskContextForPrompt(context),
            buildGenerationUserPrompt(context, options),
          ),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenRouter request failed (${response.status}): ${errorBody.slice(0, 200)}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new UnsafeAiOutputError("OpenRouter returned an empty response.");
  }

  let parsedLabels: string[];

  try {
    parsedLabels = extractSafeJsonTaskArray(content);
  } catch (error) {
    if (error instanceof UnsafeAiOutputError) {
      throw error;
    }

    throw new UnsafeAiOutputError("OpenRouter response failed safety validation.");
  }

  const labels = mergeJournalHintsIntoLabels(
    sanitizePlausibleAiTaskLabels(parsedLabels),
    context,
    { fillInOnly: true, maxCount, excludeLabels: options?.excludeLabels },
  );

  const finalized = finalizeNewAiTaskLabels(labels, options);

  if (finalized.length === 0 && maxCount > 0) {
    throw new Error("OpenRouter response did not include valid task labels.");
  }

  return finalized;
}
