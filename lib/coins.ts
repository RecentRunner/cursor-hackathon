export const DEFAULT_STARTING_COINS = 100;

/** Demo grant amount from Profile → Demo tools. */
export const DEMO_COINS_GRANT = 100;

export const COINS_PER_TASK_COMPLETE = 50;
export const COINS_PER_TASK_UNCHECK = -50;

export const STREAK_MILESTONE_COINS: Record<number, number> = {
  5: 50,
  7: 75,
  10: 100,
  20: 150,
  30: 200,
  50: 350,
  100: 750,
};

export const STREAK_MILESTONES = Object.keys(STREAK_MILESTONE_COINS)
  .map(Number)
  .sort((a, b) => a - b);

export function getStreakMilestoneBonus(streak: number) {
  return STREAK_MILESTONE_COINS[streak] ?? null;
}

export function formatCoinsDelta(delta: number) {
  if (delta === 0) {
    return "0 points";
  }

  return `${delta > 0 ? "+" : ""}${delta} points`;
}
