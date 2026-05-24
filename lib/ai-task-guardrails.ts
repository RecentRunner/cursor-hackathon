const ABSTRACT_FOCUS_TOPICS = new Set([
  "sleep",
  "movement",
  "hydration",
  "mindfulness",
]);

const NONSENSE_LABEL_PATTERNS = [
  /^spend \d+ minutes on (sleep|movement|hydration|mindfulness)$/i,
  /^(sleep|movement|hydration|mindfulness)$/i,
  /^on (sleep|movement|hydration|mindfulness)$/i,
  /^focus on (sleep|movement|hydration|mindfulness)$/i,
  /^work on (sleep|movement|hydration|mindfulness)$/i,
  /^be (sleep|movement|hydration|mindfulness)$/i,
  /^more (sleep|movement|hydration|mindfulness)$/i,
];

const VAGUE_GERUND_LABEL_PATTERNS = [
  /^(running|swimming|walking|jogging|reading|stretching|cooking|hiking|biking|cycling|meditating|exercising|studying|cleaning)$/i,
  /^go (running|swimming|walking|jogging|reading|stretching|cooking|hiking|biking|cycling|meditating|exercising)$/i,
  /^try (running|swimming|walking|jogging|reading|stretching|cooking|hiking|biking|cycling|meditating|exercising)$/i,
  /^do (running|swimming|walking|jogging|reading|stretching|cooking|hiking|biking|cycling|meditating|exercising)$/i,
];

const ACTIVITY_KEY_PATTERNS: Array<{ key: string; pattern: RegExp }> = [
  { key: "run", pattern: /\b(run|running|jog|jogging)\b/i },
  { key: "swim", pattern: /\b(swim|swimming|pool)\b/i },
  { key: "walk", pattern: /\b(walk|walking|hike|hiking)\b/i },
  { key: "yoga", pattern: /\byoga\b/i },
  { key: "workout", pattern: /\b(workout|gym|exercise|exercising)\b/i },
  { key: "bike", pattern: /\b(bike|biking|cycle|cycling)\b/i },
  { key: "meditate", pattern: /\b(meditat\w*)\b/i },
  { key: "read", pattern: /\b(read|reading)\b/i },
  { key: "stretch", pattern: /\b(stretch|stretching)\b/i },
  { key: "cook", pattern: /\b(cook|cooking|meal prep)\b/i },
  { key: "water", pattern: /\b(water|hydrate|hydration)\b/i },
  { key: "sleep", pattern: /\b(sleep|wind down|wind-down|bedtime)\b/i },
  { key: "screen", pattern: /\b(screen|social media|scroll|scrolling)\b/i },
  { key: "breathe", pattern: /\b(breathe|breathing|meditat\w*)\b/i },
];

const ACTION_VERB_PATTERN =
  /\b(drink|drank|go|went|take|took|limit|limited|skip|skipped|complete|completed|eat|ate|meditate|stretch|stretched|walk|walked|run|ran|swim|swam|read|cook|cooked|wind|avoid|avoided|try|tried|start|started|finish|finished|do|did|get|got|fill|filled|choose|chose|cut|breathe|breathed|hike|hiked|bike|biked|workout|exercise|exercised|journal|write|wrote|call|called|tidy|tidied|clean|cleaned|rest|rested|hydrate|hydrated|move|moved|practice|practiced|put|set|turn|leave|left|join|joined|attend|attended|prepare|prepared|pack|packed|plan|planned|track|tracked|check|checked|brush|brushed|floss|flossed|shower|showered|bathe|bathed|sleep|slept|refill|refilled)\b/i;

const FOCUS_TOPIC_DEFAULT_TASKS: Record<string, string[]> = {
  Sleep: ["Wind down before bed", "Avoid screens 30 minutes before sleep"],
  Movement: ["Go for a 10-minute walk", "Take a short movement break"],
  Hydration: ["Drink a full glass of water", "Refill your water bottle"],
  Mindfulness: ["Meditate for 5 minutes", "Take 5 deep breaths"],
};

export function getFocusTopicDefaultTasks(focusTopic: string) {
  return FOCUS_TOPIC_DEFAULT_TASKS[focusTopic] ?? [
    "Take a mindful break from screens",
    "Drink a full glass of water",
  ];
}

export function isPlausibleTaskLabel(label: string) {
  const normalized = normalizeForValidation(label);

  if (normalized.length < 6) {
    return false;
  }

  const words = normalized.split(/\s+/).filter(Boolean);

  if (words.length < 2) {
    return false;
  }

  if (ABSTRACT_FOCUS_TOPICS.has(normalized)) {
    return false;
  }

  if (NONSENSE_LABEL_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return false;
  }

  if (VAGUE_GERUND_LABEL_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return false;
  }

  if (words.length === 2 && ABSTRACT_FOCUS_TOPICS.has(words[1])) {
    return false;
  }

  if (!ACTION_VERB_PATTERN.test(normalized)) {
    return false;
  }

  return true;
}

function normalizeForValidation(label: string) {
  return label.trim().replace(/\s+/g, " ").toLowerCase();
}

export function filterPlausibleTaskLabels(labels: string[]) {
  return labels.filter(isPlausibleTaskLabel);
}

function getActivityKey(label: string) {
  for (const { key, pattern } of ACTIVITY_KEY_PATTERNS) {
    if (pattern.test(label)) {
      return key;
    }
  }

  return null;
}

function labelSpecificityScore(label: string) {
  let score = label.length;

  if (/^go for a\b/i.test(label)) {
    score += 25;
  }

  if (/\b\d+\b/.test(label)) {
    score += 8;
  }

  if (/\b(minute|minutes|hour|hours|glass|bottle)\b/i.test(label)) {
    score += 6;
  }

  if (VAGUE_GERUND_LABEL_PATTERNS.some((pattern) => pattern.test(label))) {
    score -= 40;
  }

  return score;
}

export function dedupeSimilarTaskLabels(labels: string[]) {
  const ungrouped: string[] = [];
  const grouped = new Map<string, string>();

  for (const label of labels) {
    const activityKey = getActivityKey(label);

    if (!activityKey) {
      ungrouped.push(label);
      continue;
    }

    const existing = grouped.get(activityKey);

    if (!existing) {
      grouped.set(activityKey, label);
      continue;
    }

    if (labelSpecificityScore(label) > labelSpecificityScore(existing)) {
      grouped.set(activityKey, label);
    }
  }

  const deduped = [...ungrouped, ...grouped.values()];

  const seen = new Set<string>();

  return deduped.filter((label) => {
    const key = label.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function filterExcludedSimilarTaskLabels(
  labels: string[],
  excludeLabels: string[],
) {
  if (excludeLabels.length === 0) {
    return labels;
  }

  const excludedExact = new Set(excludeLabels.map((label) => label.toLowerCase()));
  const excludedActivityKeys = new Set(
    excludeLabels
      .map((label) => getActivityKey(label))
      .filter((key): key is string => key !== null),
  );

  return labels.filter((label) => {
    if (excludedExact.has(label.toLowerCase())) {
      return false;
    }

    const activityKey = getActivityKey(label);

    return !activityKey || !excludedActivityKeys.has(activityKey);
  });
}
