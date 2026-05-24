import {
  finalizeNewAiTaskLabels,
  sanitizePlausibleAiTaskLabels,
} from "@/lib/ai-habit-utils";
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

function extractJsonArray(content: string) {
  const start = content.indexOf("[");
  const end = content.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(content.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

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
      "X-Title": "Habit Pet",
    },
    body: JSON.stringify({
      model: DEFAULT_OPENROUTER_MODEL,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a supportive wellness coach for a habit-tracking pet app. Suggest practical, specific daily habits tailored to the user's data. Each task must be a concrete action the user can check off (e.g. 'Drink a full glass of water', 'Go for a swim'). Never suggest vague tasks like 'spend time on hydration', single-word activities like 'Running', or duplicate tasks for the same activity. Never use abstract focus topics (sleep, movement, hydration, mindfulness) as task names. The journal entry reflects what the user wants to do today — if they mention an activity (e.g. swimming, running, yoga), include a closely related check-off task when appropriate. Return ONLY a JSON array of strings. Each string must be a short habit label under 8 words.",
        },
        {
          role: "user",
          content: `${formatAiTaskContextForPrompt(context)}

${buildGenerationUserPrompt(context, options)}`,
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
    throw new Error("OpenRouter returned an empty response.");
  }

  const labels = mergeJournalHintsIntoLabels(
    sanitizePlausibleAiTaskLabels(extractJsonArray(content) ?? []),
    context,
    { fillInOnly: true, maxCount, excludeLabels: options?.excludeLabels },
  );

  const finalized = finalizeNewAiTaskLabels(labels, options);

  if (finalized.length === 0 && maxCount > 0) {
    throw new Error("OpenRouter response did not include valid task labels.");
  }

  return finalized;
}
