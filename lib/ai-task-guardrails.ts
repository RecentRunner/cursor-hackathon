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
