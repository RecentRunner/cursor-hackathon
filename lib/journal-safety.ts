export const JOURNAL_MAX_LENGTH = 2000;
export const JOURNAL_AI_MAX_LENGTH = 1200;

const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const ZERO_WIDTH_CHAR_PATTERN = /[\u200B-\u200D\u2060\uFEFF]/g;
const EXCESSIVE_NEWLINES_PATTERN = /\n{4,}/g;
const COMBINING_MARK_PATTERN = /\p{M}/gu;

const SUSPICIOUS_LINE_PATTERNS = [
  /^(?:\s*(?:ignore|disregard|forget|override|bypass|skip)\b(?:\s+\w+){0,6}\s+(?:previous|prior|above|all|your|the|earlier|instructions?)\b)/i,
  /^(?:\s*(?:ignore|disregard|forget)\b(?:\s+\w+){0,4}\s+(?:rules?|guidelines?|restrictions?)\b)/i,
  /^(?:\s*(?:you are now|from now on|starting now|henceforth)\b)/i,
  /^(?:\s*(?:new instructions?|updated instructions?|revised instructions?)\b)/i,
  /^(?:\s*(?:act as|pretend to be|roleplay as|respond as|behave as)\b)/i,
  /^(?:\s*(?:do not follow|don't follow|stop following)\b)/i,
  /^(?:\s*(?:jailbreak|prompt injection|developer mode|dan mode)\b)/i,
  /^(?:\s*(?:what were|tell me|reveal|print|show|repeat|output|disclose|share)\b.{0,40}\b(?:initial|original|system|hidden|secret|prior)\b.{0,20}\b(?:instructions?|prompt|rules?|guidelines?)\b)/i,
  /^(?:\s*(?:what (?:is|are)|list|describe)\b.{0,30}\b(?:your|the)\b.{0,20}\b(?:instructions?|rules?|guidelines?|system prompt)\b)/i,
  /^(?:\s*(?:end of|beginning of)\b.{0,20}\b(?:instructions?|prompt|conversation|context)\b)/i,
  /^(?:\s*(?:system|assistant|user|developer|tool)\s*:)/i,
  /^(?:\s*<<SYS>>|\[INST\]|<\/?system>|<\/?assistant>|<\/?user>|<\/?developer>)/i,
  /^(?:\s*(?:sudo|admin|root)\b.{0,20}\b(?:mode|access|override)\b)/i,
];

const SUSPICIOUS_COLLAPSED_SUBSTRINGS = [
  "ignoreprevious",
  "ignoreabove",
  "disregardprevious",
  "bypassrestrictions",
  "bypasssafety",
  "systemprompt",
  "initialinstructions",
  "originalinstructions",
  "whatwereyourinitialinstructions",
  "whatwereyourinstructions",
  "revealprompt",
  "printinstructions",
  "showinstructions",
  "repeatprompt",
  "outputprompt",
  "discloseprompt",
  "actasanai",
  "actasassistant",
  "actaschatbot",
  "pretendtobe",
  "roleplayas",
  "jailbreak",
  "promptinjection",
  "developermode",
  "danmode",
  "newinstructions",
  "overrideinstructions",
];

export function normalizeJournalText(input: string) {
  return input
    .replace(/\0/g, "")
    .replace(CONTROL_CHAR_PATTERN, "")
    .replace(ZERO_WIDTH_CHAR_PATTERN, "")
    .replace(EXCESSIVE_NEWLINES_PATTERN, "\n\n\n")
    .trim();
}

export function normalizeUnicodeForInjectionScan(input: string) {
  return input
    .normalize("NFKD")
    .replace(COMBINING_MARK_PATTERN, "")
    .replace(CONTROL_CHAR_PATTERN, "")
    .replace(ZERO_WIDTH_CHAR_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function collapseObfuscatedText(input: string) {
  return normalizeUnicodeForInjectionScan(input).replace(/[^a-z0-9]/g, "");
}

export function containsSuspiciousInjection(text: string) {
  const normalized = normalizeUnicodeForInjectionScan(text);
  const collapsed = collapseObfuscatedText(text);

  if (SUSPICIOUS_LINE_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  return SUSPICIOUS_COLLAPSED_SUBSTRINGS.some((phrase) =>
    collapsed.includes(phrase),
  );
}

export function sanitizeJournalForStorage(input: string) {
  return normalizeJournalText(input).slice(0, JOURNAL_MAX_LENGTH);
}

function redactSuspiciousInstructionLines(text: string) {
  const lines = text.split("\n");
  const redactedLines = lines.map((line) =>
    containsSuspiciousInjection(line) ? "" : line,
  );

  const joined = redactedLines.join("\n").trim();

  if (joined && containsSuspiciousInjection(joined)) {
    return "";
  }

  return joined.replace(EXCESSIVE_NEWLINES_PATTERN, "\n\n\n").trim();
}

export function sanitizeJournalForAi(input: string | null | undefined) {
  if (!input?.trim()) {
    return null;
  }

  const normalized = normalizeJournalText(input).slice(0, JOURNAL_AI_MAX_LENGTH);

  return redactSuspiciousInstructionLines(normalized) || null;
}

export function wrapJournalForPrompt(journal: string) {
  return `<user_journal source="untrusted">\n${journal}\n</user_journal>`;
}

export function validateJournalEntry(input: string) {
  const sanitized = sanitizeJournalForStorage(input);

  if (sanitized.length === 0 && input.trim().length > 0) {
    throw new Error("Journal entry contains unsupported characters.");
  }

  return sanitized;
}
