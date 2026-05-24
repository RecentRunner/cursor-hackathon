export type EnsureAiDailyTasksResult = {
  generated: boolean;
  source?: "openrouter" | "fallback" | "cache";
  tasks?: string[];
  error?: string;
};

let inflightGeneration: Promise<EnsureAiDailyTasksResult> | null = null;

async function requestAiDailyTasks(): Promise<EnsureAiDailyTasksResult> {
  const response = await fetch("/api/generate-daily-tasks", {
    method: "POST",
  });

  const payload = (await response.json()) as EnsureAiDailyTasksResult & {
    error?: string;
  };

  if (!response.ok) {
    return {
      generated: false,
      error: payload.error ?? "Could not generate daily tasks.",
    };
  }

  return payload;
}

export async function ensureAiDailyTasks(): Promise<EnsureAiDailyTasksResult> {
  if (inflightGeneration) {
    return inflightGeneration;
  }

  inflightGeneration = requestAiDailyTasks().finally(() => {
    inflightGeneration = null;
  });

  return inflightGeneration;
}
