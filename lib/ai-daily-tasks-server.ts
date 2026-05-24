import {
  AI_HABIT_NAME_PREFIX,
  displayHabitName,
  finalizeDailyAiTaskLabels,
  isAiGeneratedHabitName,
  toStoredAiHabitName,
} from "@/lib/ai-habit-utils";
import {
  buildAiTaskContext,
  buildAiTaskInputHash,
  type AiTaskContext,
  type OnboardingAnswers,
} from "@/lib/ai-task-context";
import {
  getAiTaskGenerationMetadata,
  mergeAiTaskGenerationMetadata,
} from "@/lib/ai-task-metadata";
import { buildFallbackAiTaskLabels } from "@/lib/ai-task-fallback";
import { isCatalogLabel } from "@/lib/habit-catalog";
import { generateAiTaskLabels } from "@/lib/openrouter";
import {
  getGenerationSlotCount,
} from "@/lib/ai-task-generation";
import {
  defaultProfilePreferences,
  type ProfilePreferences,
} from "@/lib/profile-preferences-storage";
import { getTodayDateKey } from "@/lib/daily-quiz-storage";
import type { SupabaseClient } from "@supabase/supabase-js";

type DailyEntryRow = {
  mood: number;
  stress: number;
  energy: number;
  sleep_hours: number;
  sleep_quality: number;
  journal: string | null;
};

type AiHabitRow = {
  id: string;
  name: string;
  streak: number;
  last_completed_on: string | null;
  active: boolean;
};

function getDayDiff(fromDate: string, toDate: string) {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);

  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function shouldResetStreakForMissedDay(
  lastCompletedOn: string | null,
  today: string,
) {
  if (!lastCompletedOn) {
    return false;
  }

  return getDayDiff(lastCompletedOn, today) > 1;
}

async function getStreakCarryOverLabels(
  supabase: SupabaseClient,
  userId: string,
  today: string,
) {
  const { data, error } = await supabase
    .from("habits")
    .select("id, name, streak, last_completed_on, active")
    .eq("user_id", userId)
    .like("name", `${AI_HABIT_NAME_PREFIX}%`)
    .gt("streak", 0);

  if (error) {
    throw new Error(error.message);
  }

  const carryOverLabels: string[] = [];

  for (const habit of (data ?? []) as AiHabitRow[]) {
    if (shouldResetStreakForMissedDay(habit.last_completed_on, today)) {
      const { error: resetError } = await supabase
        .from("habits")
        .update({ streak: 0, claimed_streak_milestones: [] })
        .eq("id", habit.id);

      if (resetError) {
        throw new Error(resetError.message);
      }

      continue;
    }

    carryOverLabels.push(displayHabitName(habit.name));
  }

  return carryOverLabels;
}

function parseProfilePreferences(
  focusTopics: string | string[] | null | undefined,
): ProfilePreferences {
  const raw = Array.isArray(focusTopics) ? (focusTopics[0] ?? "") : (focusTopics ?? "");

  if (!raw.trim()) {
    return defaultProfilePreferences;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ProfilePreferences>;

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return {
        focusTopic: parsed.focusTopic ?? defaultProfilePreferences.focusTopic,
        avatarVibe: parsed.avatarVibe ?? defaultProfilePreferences.avatarVibe,
        dailyReminderEnabled:
          parsed.dailyReminderEnabled ??
          defaultProfilePreferences.dailyReminderEnabled,
        dailyReminderTime:
          parsed.dailyReminderTime ??
          defaultProfilePreferences.dailyReminderTime,
        dailyReminderDelivery:
          parsed.dailyReminderDelivery ??
          defaultProfilePreferences.dailyReminderDelivery,
      };
    }
  } catch {
    return {
      ...defaultProfilePreferences,
      focusTopic: raw,
    };
  }

  return defaultProfilePreferences;
}

function getOnboardingAnswersFromMetadata(
  metadata: Record<string, unknown> | undefined,
): OnboardingAnswers {
  const answers = metadata?.onboarding_answers;

  if (!answers || typeof answers !== "object") {
    return {
      focusTopic: null,
      avatarVibe: null,
    };
  }

  const record = answers as Record<string, string>;

  return {
    focusTopic: record.focus ?? null,
    avatarVibe: record.avatarVibe ?? record["pet-name"] ?? null,
  };
}

async function loadAiTaskContext(
  supabase: SupabaseClient,
  userId: string,
  userMetadata: Record<string, unknown> | undefined,
): Promise<AiTaskContext> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("focus_topics")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const preferences = parseProfilePreferences(profile?.focus_topics);
  const onboarding = getOnboardingAnswersFromMetadata(userMetadata);
  const entryDate = getTodayDateKey();

  const { data: dailyEntries, error: dailyError } = await supabase
    .from("daily_entries")
    .select("mood, stress, energy, sleep_hours, sleep_quality, journal")
    .eq("user_id", userId)
    .eq("entry_date", entryDate)
    .order("created_at", { ascending: false })
    .limit(1);

  if (dailyError) {
    throw new Error(dailyError.message);
  }

  const dailyEntry = dailyEntries?.[0] as DailyEntryRow | undefined;

  return buildAiTaskContext({
    preferences,
    onboarding,
    dailyQuiz: dailyEntry
      ? {
          feeling: dailyEntry.mood,
          stress: dailyEntry.stress,
          energy: dailyEntry.energy,
          sleepLength: Number(dailyEntry.sleep_hours),
          sleepQuality: dailyEntry.sleep_quality,
        }
      : null,
    journal: dailyEntry?.journal ?? null,
  });
}

async function deactivateLegacyCatalogHabits(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("habits")
    .select("id, name")
    .eq("user_id", userId)
    .eq("active", true);

  if (error) {
    throw new Error(error.message);
  }

  const legacyIds = (data ?? [])
    .filter(
      (habit) =>
        !isAiGeneratedHabitName(habit.name) && isCatalogLabel(habit.name),
    )
    .map((habit) => habit.id);

  if (legacyIds.length === 0) {
    return;
  }

  const { error: updateError } = await supabase
    .from("habits")
    .update({ active: false })
    .in("id", legacyIds);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

async function syncAiDailyTasks(
  supabase: SupabaseClient,
  userId: string,
  taskLabels: string[],
) {
  const storedNames = taskLabels.map(toStoredAiHabitName);

  const { data: existingAiHabits, error: existingError } = await supabase
    .from("habits")
    .select("id, name, active")
    .eq("user_id", userId)
    .like("name", `${AI_HABIT_NAME_PREFIX}%`);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingByName = new Map(
    (existingAiHabits ?? []).map((habit) => [habit.name, habit]),
  );

  for (const habit of existingAiHabits ?? []) {
    if (storedNames.includes(habit.name)) {
      if (!habit.active) {
        const { error } = await supabase
          .from("habits")
          .update({ active: true })
          .eq("id", habit.id);

        if (error) {
          throw new Error(error.message);
        }
      }

      continue;
    }

    if (habit.active) {
      const { error } = await supabase
        .from("habits")
        .update({ active: false })
        .eq("id", habit.id);

      if (error) {
        throw new Error(error.message);
      }
    }
  }

  for (const storedName of storedNames) {
    const existing = existingByName.get(storedName);

    if (existing) {
      if (!existing.active) {
        const { error } = await supabase
          .from("habits")
          .update({ active: true })
          .eq("id", existing.id);

        if (error) {
          throw new Error(error.message);
        }
      }

      continue;
    }

    const { error: insertError } = await supabase.from("habits").insert({
      user_id: userId,
      name: storedName,
      active: true,
      streak: 0,
    });

    if (!insertError) {
      continue;
    }

    const { data: racedHabit, error: racedError } = await supabase
      .from("habits")
      .select("id, active")
      .eq("user_id", userId)
      .eq("name", storedName)
      .maybeSingle();

    if (racedError) {
      throw new Error(racedError.message);
    }

    if (!racedHabit) {
      throw new Error(insertError.message);
    }

    if (!racedHabit.active) {
      const { error } = await supabase
        .from("habits")
        .update({ active: true })
        .eq("id", racedHabit.id);

      if (error) {
        throw new Error(error.message);
      }
    }
  }
}

async function saveGenerationMetadata(
  supabase: SupabaseClient,
  userId: string,
  preferences: ProfilePreferences,
  focusTopics: string | string[] | null | undefined,
  generatedOn: string,
  inputHash: string,
) {
  const serialized = mergeAiTaskGenerationMetadata(preferences, {
    aiTasksGeneratedOn: generatedOn,
    aiTasksInputHash: inputHash,
  });
  const attempts: Array<string | string[]> = [serialized, [serialized]];

  for (const focus_topics of attempts) {
    const { error } = await supabase
      .from("profiles")
      .update({ focus_topics })
      .eq("id", userId);

    if (!error) {
      return;
    }

    if (!/array|malformed|invalid input syntax/i.test(error.message)) {
      throw new Error(error.message);
    }
  }
}

export type GenerateDailyTasksResult = {
  generated: boolean;
  tasks: string[];
  source: "openrouter" | "fallback" | "cache";
};

export async function generateAndSyncDailyTasks(
  supabase: SupabaseClient,
  userId: string,
  userMetadata: Record<string, unknown> | undefined,
): Promise<GenerateDailyTasksResult> {
  const context = await loadAiTaskContext(supabase, userId, userMetadata);
  const inputHash = buildAiTaskInputHash(context);
  const carryOverLabels = await getStreakCarryOverLabels(
    supabase,
    userId,
    context.date,
  );

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("focus_topics")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const preferences = parseProfilePreferences(profile?.focus_topics);
  const metadata = getAiTaskGenerationMetadata(profile?.focus_topics);

  if (
    metadata.aiTasksGeneratedOn === context.date &&
    metadata.aiTasksInputHash === inputHash
  ) {
    const { data: activeAiHabits, error: activeError } = await supabase
      .from("habits")
      .select("name")
      .eq("user_id", userId)
      .eq("active", true)
      .like("name", `${AI_HABIT_NAME_PREFIX}%`);

    if (activeError) {
      throw new Error(activeError.message);
    }

    return {
      generated: false,
      source: "cache",
      tasks: finalizeDailyAiTaskLabels(
        carryOverLabels,
        (activeAiHabits ?? [])
          .map((habit) => displayHabitName(habit.name))
          .filter(
            (label) =>
              !carryOverLabels.some(
                (carryOver) => carryOver.toLowerCase() === label.toLowerCase(),
              ),
          ),
      ),
    };
  }

  const slotsNeeded = getGenerationSlotCount(carryOverLabels.length);
  let newLabels: string[] = [];
  let source: GenerateDailyTasksResult["source"] = "fallback";

  if (slotsNeeded > 0) {
    const generationOptions = {
      excludeLabels: carryOverLabels,
      maxCount: slotsNeeded,
    };

    try {
      newLabels = await generateAiTaskLabels(context, generationOptions);
      source = "openrouter";
    } catch {
      newLabels = buildFallbackAiTaskLabels(context, generationOptions);
      source = "fallback";
    }
  }

  const taskLabels = finalizeDailyAiTaskLabels(carryOverLabels, newLabels);

  try {
    await deactivateLegacyCatalogHabits(supabase, userId);
    await syncAiDailyTasks(supabase, userId, taskLabels);
    await saveGenerationMetadata(
      supabase,
      userId,
      preferences,
      profile?.focus_topics,
      context.date,
      inputHash,
    );
  } catch (syncError) {
    const fallbackLabels = finalizeDailyAiTaskLabels(
      carryOverLabels,
      slotsNeeded > 0
        ? buildFallbackAiTaskLabels(context, {
            excludeLabels: carryOverLabels,
            maxCount: slotsNeeded,
          })
        : [],
    );
    source = "fallback";

    await deactivateLegacyCatalogHabits(supabase, userId);
    await syncAiDailyTasks(supabase, userId, fallbackLabels);
    await saveGenerationMetadata(
      supabase,
      userId,
      preferences,
      profile?.focus_topics,
      context.date,
      inputHash,
    );

    if (syncError instanceof Error) {
      console.error("AI task sync recovered with fallback:", syncError.message);
    }

    return {
      generated: true,
      source,
      tasks: fallbackLabels,
    };
  }

  return {
    generated: true,
    source,
    tasks: taskLabels,
  };
}
