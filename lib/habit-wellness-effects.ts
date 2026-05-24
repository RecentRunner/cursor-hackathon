import {
  computeAvatarCondition,
  defaultDailyQuizAnswers,
  WELLNESS_SCALE_MAX,
  type AvatarCondition,
  type DailyQuizAnswers,
} from "@/lib/avatar-state";

export type HabitWellnessCategory =
  | "hydration"
  | "nutrition"
  | "sleep"
  | "relaxation"
  | "fun"
  | "movement"
  | "mindfulness"
  | "screen_balance";

type WellnessDelta = {
  feeling: number;
  stress: number;
  energy: number;
  sleepQuality: number;
  health: number;
};

const CATEGORY_DELTAS: Record<HabitWellnessCategory, WellnessDelta> = {
  hydration: { feeling: 0, stress: 0, energy: 1, sleepQuality: 0, health: 1 },
  nutrition: { feeling: 1, stress: 0, energy: 1, sleepQuality: 0, health: 1 },
  sleep: { feeling: 1, stress: -1, energy: 1, sleepQuality: 1, health: 1 },
  relaxation: { feeling: 1, stress: -1, energy: 1, sleepQuality: 0, health: 0 },
  fun: { feeling: 1, stress: -1, energy: 0, sleepQuality: 0, health: 0 },
  movement: { feeling: 1, stress: -1, energy: 1, sleepQuality: 0, health: 0 },
  mindfulness: { feeling: 1, stress: -1, energy: 0, sleepQuality: 0, health: 0 },
  screen_balance: { feeling: 0, stress: -1, energy: 1, sleepQuality: 0, health: 0 },
};

const LABEL_CATEGORY_PATTERNS: Array<{
  category: HabitWellnessCategory;
  pattern: RegExp;
}> = [
  {
    category: "hydration",
    pattern:
      /\b(water|hydrat|drink a (?:full )?glass|refill.*bottle|glass of water)\b/i,
  },
  {
    category: "nutrition",
    pattern:
      /\b(meal|cook|eat|ate|healthy food|proper meal|nutrit|breakfast|lunch|dinner)\b/i,
  },
  {
    category: "sleep",
    pattern:
      /\b(sleep|wind down|bedtime|before bed|avoid screens|screen.*before sleep)\b/i,
  },
  {
    category: "relaxation",
    pattern:
      /\b(meditat|breathe|breath|relax|calm|rest|nap|unwind|soothe)\b/i,
  },
  {
    category: "fun",
    pattern:
      /\b(swim|play|game|hobby|fun|music|dance|social|friend|call|laugh|enjoy)\b/i,
  },
  {
    category: "movement",
    pattern:
      /\b(walk|run|jog|workout|exercise|yoga|stretch|bike|hike|move|gym|cycle)\b/i,
  },
  {
    category: "mindfulness",
    pattern: /\b(mindful|journal|gratitud|reflect|presence|grounding)\b/i,
  },
  {
    category: "screen_balance",
    pattern:
      /\b(screen break|limit social|social media|scroll|doomscroll|phone break|digital detox)\b/i,
  },
];

const MAX_ANSWER_BOOST_PER_STAT = 2;
const MAX_DIRECT_HEALTH_BOOST = 3;

function clampStat(value: number) {
  return Math.min(WELLNESS_SCALE_MAX, Math.max(1, value));
}

export function classifyHabitWellnessCategories(
  label: string,
): HabitWellnessCategory[] {
  const categories = new Set<HabitWellnessCategory>();

  for (const { category, pattern } of LABEL_CATEGORY_PATTERNS) {
    if (pattern.test(label)) {
      categories.add(category);
    }
  }

  return Array.from(categories);
}

function aggregateWellnessTotals(completedLabels: string[]) {
  const answerTotals: WellnessDelta = {
    feeling: 0,
    stress: 0,
    energy: 0,
    sleepQuality: 0,
    health: 0,
  };

  for (const label of completedLabels) {
    for (const category of classifyHabitWellnessCategories(label)) {
      const delta = CATEGORY_DELTAS[category];

      answerTotals.feeling += delta.feeling;
      answerTotals.stress += delta.stress;
      answerTotals.energy += delta.energy;
      answerTotals.sleepQuality += delta.sleepQuality;
      answerTotals.health += delta.health;
    }
  }

  return answerTotals;
}

export function aggregateHabitWellnessDeltas(completedLabels: string[]) {
  const totals = aggregateWellnessTotals(completedLabels);

  return {
    feeling: Math.min(MAX_ANSWER_BOOST_PER_STAT, totals.feeling),
    stress: Math.max(-MAX_ANSWER_BOOST_PER_STAT, totals.stress),
    energy: Math.min(MAX_ANSWER_BOOST_PER_STAT, totals.energy),
    sleepQuality: Math.min(MAX_ANSWER_BOOST_PER_STAT, totals.sleepQuality),
    health: Math.min(MAX_DIRECT_HEALTH_BOOST, totals.health),
  };
}

export function applyHabitBoostsToAnswers(
  answers: DailyQuizAnswers,
  completedLabels: string[],
): DailyQuizAnswers {
  const delta = aggregateHabitWellnessDeltas(completedLabels);

  return {
    feeling: clampStat(answers.feeling + delta.feeling),
    stress: clampStat(answers.stress + delta.stress),
    energy: clampStat(answers.energy + delta.energy),
    sleepLength: answers.sleepLength,
    sleepQuality: clampStat(answers.sleepQuality + delta.sleepQuality),
  };
}

export function computeAvatarConditionWithHabitBoosts(
  answers: DailyQuizAnswers | null | undefined,
  completedLabels: string[],
): AvatarCondition {
  const baseAnswers = answers ?? defaultDailyQuizAnswers;
  const boostedAnswers = applyHabitBoostsToAnswers(baseAnswers, completedLabels);
  const delta = aggregateHabitWellnessDeltas(completedLabels);

  return computeAvatarCondition(boostedAnswers, {
    health: delta.health,
  });
}

export function describeHabitWellnessBoost(label: string) {
  const categories = classifyHabitWellnessCategories(label);

  if (categories.length === 0) {
    return null;
  }

  const messages = new Set<string>();

  for (const category of categories) {
    const delta = CATEGORY_DELTAS[category];

    if (delta.feeling > 0) {
      messages.add("mood");
    }

    if (delta.stress < 0) {
      messages.add("stress relief");
    }

    if (delta.energy > 0) {
      messages.add("energy");
    }

    if (delta.health > 0) {
      messages.add("health");
    }
  }

  if (messages.size === 0) {
    return null;
  }

  return `Boosts ${Array.from(messages).join(", ")}`;
}
