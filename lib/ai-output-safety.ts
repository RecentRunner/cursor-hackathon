const MAX_RAW_AI_RESPONSE_LENGTH = 4000;
const MAX_AI_TASK_ARRAY_LENGTH = 10;
const MAX_AI_TASK_LABEL_LENGTH = 80;

const UNSAFE_RAW_OUTPUT_PATTERNS = [
  /you are a supportive wellness coach/i,
  /never reveal system instructions/i,
  /content inside <user_journal>/i,
  /<\/?user_journal\b/i,
  /<\/?trusted_app_context\b/i,
  /<\/?generation_request\b/i,
  /<\/?system\b/i,
  /<\/?assistant\b/i,
  /openrouter/i,
  /\b(?:initial|original|hidden|secret)\s+(?:system\s+)?(?:prompt|instructions)\b/i,
  /\bhere(?:'s| is)\s+(?:my|the)\s+(?:system|original)\s+(?:prompt|instructions)\b/i,
  /\bas an ai (?:language )?model\b/i,
  /\bI(?:'m| am) (?:an AI|a language model)\b/,
  /\b(?:cannot|can't|must not)\s+(?:reveal|share|disclose)\b/i,
  /\[\s*\{\s*"role"\s*:/,
  /\bhttps?:\/\//i,
  /<<SYS>>|\[INST\]/,
];

const UNSAFE_TASK_LABEL_PATTERNS = [
  /<\/?[a-z][\w-]*>/i,
  /\b(?:system|assistant|user|developer)\s*:/i,
  /\b(?:ignore|disregard|forget|override|bypass)\b.{0,30}\b(?:previous|prior|instructions?|prompt)\b/i,
  /\b(?:reveal|print|show|repeat|output|disclose|share)\b.{0,30}\b(?:prompt|instructions?|rules?)\b/i,
  /\b(?:what were|tell me)\b.{0,30}\b(?:instructions?|prompt)\b/i,
  /\b(?:jailbreak|prompt injection|developer mode)\b/i,
  /\b(?:you are now|act as|pretend to be|roleplay as)\b/i,
  /\b(?:initial|original|system|hidden)\s+(?:prompt|instructions?)\b/i,
  /\bhttps?:\/\//i,
  /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/,
];

export class UnsafeAiOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeAiOutputError";
  }
}

export function assertSafeRawAiResponse(content: string) {
  const trimmed = content.trim();

  if (!trimmed) {
    throw new UnsafeAiOutputError("OpenRouter returned an empty response.");
  }

  if (trimmed.length > MAX_RAW_AI_RESPONSE_LENGTH) {
    throw new UnsafeAiOutputError("OpenRouter response exceeded the allowed size.");
  }

  for (const pattern of UNSAFE_RAW_OUTPUT_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new UnsafeAiOutputError(
        "OpenRouter response contained disallowed content.",
      );
    }
  }
}

export function isSafeAiTaskLabel(label: string) {
  const trimmed = label.trim();

  if (!trimmed || trimmed.length > MAX_AI_TASK_LABEL_LENGTH) {
    return false;
  }

  return !UNSAFE_TASK_LABEL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function filterSafeAiTaskLabels(labels: string[]) {
  return labels.filter(isSafeAiTaskLabel);
}

export function extractJsonArray(content: string) {
  const start = content.indexOf("[");
  const end = content.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(content.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

export function extractSafeJsonTaskArray(content: string) {
  assertSafeRawAiResponse(content);

  const parsed = extractJsonArray(content);

  if (!Array.isArray(parsed)) {
    throw new UnsafeAiOutputError(
      "OpenRouter response was not a JSON array of task labels.",
    );
  }

  if (parsed.length > MAX_AI_TASK_ARRAY_LENGTH) {
    throw new UnsafeAiOutputError("OpenRouter response included too many tasks.");
  }

  if (
    !parsed.every(
      (item) => typeof item === "string" && item.trim().length > 0,
    )
  ) {
    throw new UnsafeAiOutputError(
      "OpenRouter response included non-string task labels.",
    );
  }

  const labels = parsed.map((item) => (item as string).trim());
  const safeLabels = filterSafeAiTaskLabels(labels);

  if (safeLabels.length === 0 && labels.length > 0) {
    throw new UnsafeAiOutputError(
      "OpenRouter response included only unsafe task labels.",
    );
  }

  return safeLabels;
}
