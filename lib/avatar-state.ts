export type AvatarMood = "happy" | "neutral" | "tired";

export type DailyQuizAnswers = {
  feeling: number;
  stress: number;
  energy: number;
  sleepLength: number;
  sleepQuality: number;
  journal: string;
};

export type AvatarCondition = {
  mood: AvatarMood;
  energy: number;
  health: number;
};

export type DailyQuizSubmission = {
  date: string;
  answers: DailyQuizAnswers;
  condition: AvatarCondition;
};

export const WELLNESS_SCALE_MAX = 5;

export const defaultDailyQuizAnswers: DailyQuizAnswers = {
  feeling: 3,
  stress: 3,
  energy: 3,
  sleepLength: 3,
  sleepQuality: 3,
  journal: "",
};

export function computeAvatarCondition(
  answers: DailyQuizAnswers,
): AvatarCondition {
  const { feeling, stress, energy, sleepLength, sleepQuality } = answers;

  const wellnessAverage = (feeling + energy + (WELLNESS_SCALE_MAX + 1 - stress)) / 3;
  const sleepAverage = (sleepLength + sleepQuality) / 2;
  const health = Math.round((wellnessAverage + sleepAverage) / 2);
  const energyLevel = Math.round((energy + sleepQuality) / 2);

  let avatarMood: AvatarMood = "neutral";

  if (energyLevel >= 4 && feeling >= 4 && health >= 4) {
    avatarMood = "happy";
  } else if (energy <= 2 || sleepLength <= 2 || sleepQuality <= 2) {
    avatarMood = "tired";
  }

  return {
    mood: avatarMood,
    energy: clampStat(energyLevel),
    health: clampStat(health),
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

  return {
    feeling: scaleValue(answers.feeling ?? answers.mood, defaultDailyQuizAnswers.feeling),
    stress: scaleValue(answers.stress, defaultDailyQuizAnswers.stress),
    energy: scaleValue(answers.energy, defaultDailyQuizAnswers.energy),
    sleepLength: scaleValue(answers.sleepLength, defaultDailyQuizAnswers.sleepLength),
    sleepQuality: scaleValue(
      answers.sleepQuality,
      defaultDailyQuizAnswers.sleepQuality,
    ),
    journal: answers.journal ?? "",
  };
}
