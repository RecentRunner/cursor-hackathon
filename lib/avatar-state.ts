export type AvatarMood = "happy" | "neutral" | "tired";

export type DailyQuizAnswers = {
  feeling: number;
  stress: number;
  energy: number;
  sleepLength: number;
  sleepQuality: number;
};

export type AvatarCondition = {
  mood: AvatarMood;
  energy: number;
  health: number;
};

export type DailyQuizSubmission = {
  date: string;
  answers: DailyQuizAnswers;
  journal: string;
  condition: AvatarCondition;
};

export const WELLNESS_SCALE_MAX = 5;

export const SLEEP_HOURS_MIN = 0.5;
export const SLEEP_HOURS_MAX = 12;
export const SLEEP_HOURS_STEP = 0.5;
export const DEFAULT_SLEEP_HOURS = 7.5;

export const defaultDailyQuizAnswers: DailyQuizAnswers = {
  feeling: 3,
  stress: 3,
  energy: 3,
  sleepLength: DEFAULT_SLEEP_HOURS,
  sleepQuality: 3,
};

export function clampSleepHours(hours: number) {
  const stepped = Math.round(hours / SLEEP_HOURS_STEP) * SLEEP_HOURS_STEP;
  return Math.min(SLEEP_HOURS_MAX, Math.max(SLEEP_HOURS_MIN, stepped));
}

export function formatSleepHours(hours: number) {
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

function sleepHoursToWellnessScore(hours: number) {
  const score =
    1 + ((clampSleepHours(hours) - SLEEP_HOURS_MIN) / (SLEEP_HOURS_MAX - SLEEP_HOURS_MIN)) * 4;

  return clampStat(Math.round(score));
}

export function computeAvatarCondition(
  answers: DailyQuizAnswers,
  taskBonuses: { health?: number; energy?: number } = {},
): AvatarCondition {
  const { feeling, stress, energy, sleepLength, sleepQuality } = answers;

  const wellnessAverage = (feeling + energy + (WELLNESS_SCALE_MAX + 1 - stress)) / 3;
  const sleepScore = sleepHoursToWellnessScore(sleepLength);
  const sleepAverage = (sleepScore + sleepQuality) / 2;
  const health = clampStat(
    Math.round((wellnessAverage + sleepAverage) / 2) + (taskBonuses.health ?? 0),
  );
  const energyLevel = clampStat(
    Math.round((energy + sleepQuality) / 2) + (taskBonuses.energy ?? 0),
  );

  let avatarMood: AvatarMood = "neutral";

  if (energyLevel >= 4 && feeling >= 4 && health >= 4) {
    avatarMood = "happy";
  } else if (energy <= 2 || sleepLength < 6 || sleepQuality <= 2) {
    avatarMood = "tired";
  }

  return {
    mood: avatarMood,
    energy: energyLevel,
    health,
  };
}

function clampStat(value: number) {
  return Math.min(WELLNESS_SCALE_MAX, Math.max(1, value));
}

export const defaultAvatarCondition: AvatarCondition = {
  mood: "neutral",
  energy: 3,
  health: 3,
};

// Backward compatibility for older saved submissions.
export function normalizeDailyQuizAnswers(
  answers: Partial<DailyQuizAnswers> & {
    mood?: number;
    journal?: string;
  },
): DailyQuizAnswers {
  const scaleValue = (value: number | undefined, fallback: number) => {
    if (value === undefined) {
      return fallback;
    }

    return value > WELLNESS_SCALE_MAX
      ? Math.max(1, Math.round(value / 2))
      : value;
  };

  const normalizeSleepLength = (value: number | undefined) => {
    if (value === undefined) {
      return defaultDailyQuizAnswers.sleepLength;
    }

    return clampSleepHours(value);
  };

  return {
    feeling: scaleValue(answers.feeling ?? answers.mood, defaultDailyQuizAnswers.feeling),
    stress: scaleValue(answers.stress, defaultDailyQuizAnswers.stress),
    energy: scaleValue(answers.energy, defaultDailyQuizAnswers.energy),
    sleepLength: normalizeSleepLength(answers.sleepLength),
    sleepQuality: scaleValue(
      answers.sleepQuality,
      defaultDailyQuizAnswers.sleepQuality,
    ),
  };
}
