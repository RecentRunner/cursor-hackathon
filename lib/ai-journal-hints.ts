import type { AiTaskContext } from "@/lib/ai-task-context";
import {
  normalizeAiTaskLabel,
  sanitizePlausibleAiTaskLabels,
} from "@/lib/ai-habit-utils";
import {
  getFocusTopicDefaultTasks,
  isPlausibleTaskLabel,
} from "@/lib/ai-task-guardrails";
const ACTIVITY_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bswim(ming)?\b|\bpool\b/i, label: "Go for a swim" },
  { pattern: /\brun(ning)?\b|\bjog(ging)?\b/i, label: "Go for a short run" },
  { pattern: /\bwalk(ing)?\b|\bhike|hiking\b/i, label: "Go for a walk" },
  { pattern: /\byoga\b/i, label: "Do a yoga session" },
  { pattern: /\bgym\b|\bworkout\b|\bexercise\b/i, label: "Get a workout in" },
  { pattern: /\bbike|biking|cycle|cycling\b/i, label: "Go for a bike ride" },
  { pattern: /\bmeditat(e|ion)\b/i, label: "Meditate for 10 minutes" },
  { pattern: /\bread(ing)?\b/i, label: "Read for 20 minutes" },
  { pattern: /\bstretch(ing)?\b/i, label: "Stretch for 10 minutes" },
  { pattern: /\bcook(ing)?\b|\bmeal prep\b/i, label: "Cook a healthy meal" },
];

const BAD_ACTIVITY_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  {
    pattern:
      /\b(scrolling|scroll|doomscroll(?:ing)?|social media|instagram|tiktok|twitter|facebook|snapchat|reddit)\b/i,
    label: "Limit social media for 30 minutes",
  },
  {
    pattern:
      /\b(junk food|fast food|sweets|candy|sugar(?:y)?|snack(?:ing)?|chips|soda|pop)\b/i,
    label: "Skip sugary snacks today",
  },
  {
    pattern: /\b(alcohol|drunk|drinking|beer|wine|liquor|hangover)\b/i,
    label: "Skip extra drinks today",
  },
  {
    pattern: /\b(stay(?:ing)? up late|late night|all night|up too late)\b/i,
    label: "Start wind-down routine early",
  },
  {
    pattern: /\b(smok(e|ing)|vap(e|ing)|cigarette|cigarettes|nicotine)\b/i,
    label: "Skip smoking today",
  },
  {
    pattern: /\b(procrastinat\w*|put(?:ting)? off|avoid(?:ing)? work)\b/i,
    label: "Complete one task you've been avoiding",
  },
  {
    pattern: /\b(binge(?:ing)?\s+(?:watch|netflix|shows|tv|youtube|videos))\b/i,
    label: "Take a screen break",
  },
  {
    pattern: /\b(overslept|slept in too long|skipped breakfast|skip(?:ped)? meals?)\b/i,
    label: "Eat a proper meal",
  },
  {
    pattern: /\b(stress eat(?:ing)?|emotional eat(?:ing)?|comfort food)\b/i,
    label: "Choose a balanced meal instead",
  },
  {
    pattern: /\b(too much caffeine|energy drinks?|coffee all day)\b/i,
    label: "Cut off caffeine after noon",
  },
];

const POSITIVE_INTENT_PATTERN =
  /\b(?:want to|would like to|like to|love to|enjoy(?:ed|ing)?|prefer to|hope to|plan to|goal is to|trying to|need to|wish to|looking forward to)\s+([^.!?\n]{3,80})/gi;

const ENJOY_ACTIVITY_PATTERN =
  /\benjoy(?:s|ed|ing)?\s+([^.!?\n]{3,60})/gi;

const DISLIKE_OR_STRUGGLE_PATTERN =
  /\b(?:don't like|do not like|hate|tired of|sick of|struggling with|trying to stop|trying to quit|want to stop|want to quit|need to stop|need to quit|cut down on|reduce|avoid)\s+([^.!?\n]{3,80})/gi;

const NEGATIVE_GOAL_PREFIX =
  /^(?:stop|quit|avoid|reduce|cut down on|less|no more|not)\s+/i;

const BAD_PHRASE_COUNTERS: Array<{ pattern: RegExp; label: string }> = [
  {
    pattern:
      /\b(scrolling|scroll|social media|instagram|tiktok|twitter|facebook|phone|screens?)\b/i,
    label: "Limit social media for 30 minutes",
  },
  {
    pattern: /\b(junk food|fast food|sweets|sugar|snack(?:ing)?|soda)\b/i,
    label: "Skip sugary snacks today",
  },
  {
    pattern: /\b(alcohol|drink(?:ing)?|beer|wine)\b/i,
    label: "Skip extra drinks today",
  },
  {
    pattern: /\b(smok(?:e|ing)|vap(?:e|ing)|cigarettes?)\b/i,
    label: "Skip smoking today",
  },
  {
    pattern: /\b(stay(?:ing)? up late|late nights?|all nighters?)\b/i,
    label: "Start wind-down routine early",
  },
  {
    pattern: /\b(procrastinat\w*|putting things off)\b/i,
    label: "Complete one task you've been avoiding",
  },
  {
    pattern: /\b(binge(?:ing)?|netflix|youtube|tv)\b/i,
    label: "Take a screen break",
  },
];

function titleCasePhrase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function counterTaskForNegativePhrase(phrase: string) {
  for (const { pattern, label } of BAD_PHRASE_COUNTERS) {
    if (pattern.test(phrase)) {
      return label;
    }
  }

  const fallback = `Limit ${phrase.trim().toLowerCase()} today`;

  return isPlausibleTaskLabel(fallback) ? fallback : null;
}

function phraseToTaskLabel(phrase: string) {
  const cleaned = phrase.trim().replace(/\s+/g, " ");

  if (!cleaned || cleaned.length < 3) {
    return null;
  }

  if (NEGATIVE_GOAL_PREFIX.test(cleaned)) {
    return counterTaskForNegativePhrase(
      cleaned.replace(NEGATIVE_GOAL_PREFIX, "").trim(),
    );
  }

  for (const { pattern, label } of BAD_ACTIVITY_PATTERNS) {
    if (pattern.test(cleaned)) {
      return label;
    }
  }

  for (const { pattern, label } of ACTIVITY_PATTERNS) {
    if (pattern.test(cleaned)) {
      return label;
    }
  }

  const titled = titleCasePhrase(cleaned);

  return isPlausibleTaskLabel(titled) ? titled : null;
}

function addPhraseMatches(
  journal: string,
  pattern: RegExp,
  labels: Set<string>,
) {
  for (const match of journal.matchAll(pattern)) {
    const label = phraseToTaskLabel(match[1]);

    if (label) {
      labels.add(label);
    }
  }
}

export function extractJournalTaskHints(journal: string | null | undefined) {
  if (!journal?.trim()) {
    return [];
  }

  const labels = new Set<string>();

  for (const { pattern, label } of ACTIVITY_PATTERNS) {
    if (pattern.test(journal)) {
      labels.add(label);
    }
  }

  for (const { pattern, label } of BAD_ACTIVITY_PATTERNS) {
    if (pattern.test(journal)) {
      labels.add(label);
    }
  }

  addPhraseMatches(journal, POSITIVE_INTENT_PATTERN, labels);
  addPhraseMatches(journal, ENJOY_ACTIVITY_PATTERN, labels);
  addPhraseMatches(journal, DISLIKE_OR_STRUGGLE_PATTERN, labels);

  return sanitizePlausibleAiTaskLabels(Array.from(labels));
}

function ensureMinimumFallbackTasks(
  labels: Set<string>,
  context: AiTaskContext,
) {
  const plausible = sanitizePlausibleAiTaskLabels(Array.from(labels));

  if (plausible.length >= 2) {
    return plausible;
  }

  const next = new Set<string>(plausible);

  for (const task of getFocusTopicDefaultTasks(context.preferences.focusTopic)) {
    next.add(task);
  }

  if (next.size < 3) {
    next.add("Take a mindful break from screens");
  }

  return sanitizePlausibleAiTaskLabels(Array.from(next));
}

export function buildJournalAwareFallbackLabels(context: AiTaskContext): string[] {
  const labels = new Set<string>(extractJournalTaskHints(context.journal));

  if (context.dailyQuiz && context.dailyQuiz.stress >= 4) {
    labels.add("Take a calming 10-minute walk");
    labels.add("Try 5 minutes of deep breathing");
  }

  if (context.dailyQuiz && context.dailyQuiz.energy <= 2) {
    labels.add("Drink a full glass of water");
    labels.add("Take a short movement break");
  }

  return ensureMinimumFallbackTasks(labels, context);
}

export function mergeJournalHintsIntoLabels(
  labels: string[],
  context: AiTaskContext,
): string[] {
  const journalHints = extractJournalTaskHints(context.journal);
  const merged = sanitizePlausibleAiTaskLabels([
    ...journalHints,
    ...labels.map(normalizeAiTaskLabel),
  ]);

  return ensureMinimumFallbackTasks(new Set(merged), context);
}
