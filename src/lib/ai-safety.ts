/**
 * Defences for text that reaches a model's prompt but was written by someone
 * else — job descriptions, candidate summaries, profile fields, chat history.
 *
 * These reduce the chance of an indirect prompt injection landing. They are not
 * a security boundary: a model can always be talked into something, so anything
 * that actually matters must be enforced in code, not asked for in a prompt.
 * The real control in this codebase is that privileged data (candidate records,
 * admin statistics) is gated server-side by role and never enters the prompt of
 * a user who is not entitled to it.
 */

/**
 * Chat-template and role markers. A model reads these as structure rather than
 * content, so leaving them in untrusted text lets that text pretend to be a new
 * turn — or a new system message.
 */
const ROLE_MARKERS =
  /(^|\n)\s*(system|assistant|user|developer|tool|function)\s*:/gi;

/** Special tokens used by common chat templates to delimit turns. */
const TEMPLATE_TOKENS =
  /<\|[a-z_]*\|>|<\/?(?:s|im_start|im_end|endoftext|eot_id|start_header_id|end_header_id)>/gi;

/**
 * Phrases whose only purpose in a job description is to retarget the model.
 * Matching is deliberately loose — the aim is to break the instruction, not to
 * catalogue every phrasing.
 */
const INSTRUCTION_PATTERNS: RegExp[] = [
  /ignore\s+(?:all\s+|any\s+)?(?:the\s+)?(?:previous|prior|above|earlier|preceding)\s+\w*\s*(?:instructions?|prompts?|rules?|directions?)/gi,
  /disregard\s+(?:all\s+|any\s+)?(?:the\s+)?(?:previous|prior|above|earlier)\s+\w*\s*(?:instructions?|prompts?|rules?)/gi,
  /forget\s+(?:everything|all)\s+(?:above|before|previously)/gi,
  /you\s+are\s+now\s+(?:a|an|in)\b/gi,
  /(?:enter|activate|switch\s+to)\s+(?:developer|debug|admin|god|jailbreak)\s+mode/gi,
  /(?:reveal|print|repeat|output|show)\s+(?:me\s+)?(?:your\s+|the\s+)?(?:system\s+prompt|instructions|prompt\s+above|context\s+section)/gi,
  /(?:new|updated|revised)\s+(?:system\s+)?(?:instructions?|rules?)\s*:/gi,
  /respond\s+(?:only\s+)?with\s+exactly/gi,
  /do\s+not\s+follow\s+(?:the\s+)?(?:previous|above|system)/gi,
];

const REDACTED = "[removed]";

/**
 * Strips markup and neutralises anything that reads as an instruction or a
 * turn boundary, then clamps the result to a token budget.
 *
 * Order matters: markup comes out first so that a payload hidden inside a tag
 * cannot survive as text and be matched only afterwards.
 */
export function neutraliseUntrustedText(
  input: string | null | undefined,
  maxChars: number
): string {
  if (!input) return "";

  let text = String(input)
    // Markup out first.
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  text = text
    .replace(TEMPLATE_TOKENS, " ")
    .replace(ROLE_MARKERS, "$1 ")
    // Fences let untrusted text close a block the prompt opened around it.
    .replace(/```+/g, " ")
    // Zero-width and directional marks can hide payloads from a human reviewer
    // while remaining visible to the model.
    .replace(/[​-‏‪-‮⁠-⁤﻿]/g, "");

  for (const pattern of INSTRUCTION_PATTERNS) {
    text = text.replace(pattern, REDACTED);
  }

  text = text.replace(/\s+/g, " ").trim();

  if (text.length > maxChars) {
    text = text.slice(0, maxChars - 1).trimEnd() + "…";
  }
  return text;
}

/**
 * A recruiter-supplied link, returned only when it is safe to put in front of
 * the model and render as a markdown link.
 *
 * Anything that is not plain http(s) is dropped rather than passed through:
 * `javascript:` and `data:` URLs have no business in a job posting, and the
 * assistant's output is rendered as HTML.
 */
export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 500) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    // Whitespace and quotes would let the link break out of the markdown.
    if (/[\s<>"'`\\]/.test(trimmed)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Quick-reply chips that offer to apply through the platform.
 *
 * "View Details", "Apply on Company Website" and similar are left alone — this
 * only catches the ones that promise an application JobsDart cannot submit.
 */
const IN_PLATFORM_APPLY_CHIP =
  /\b(?:direct\s*apply|apply\s*(?:now|here|for|to|via|through)?)\b/i;

const EXTERNAL_APPLY_CHIP = /\b(?:company|employer|external|their)\b.*\bsite|website\b/i;

/**
 * Removes apply chips for a job that only accepts applications elsewhere.
 *
 * The model is told which jobs are external, but a prompt is guidance rather
 * than a guarantee — an assistant turn forged in history already showed that
 * instructions can be talked around. This runs on the way out, so the chip
 * cannot appear regardless of what the model decided to emit.
 */
export function stripInPlatformApplySuggestions(suggestions: unknown): string[] {
  if (!Array.isArray(suggestions)) return [];
  return suggestions
    .filter((s): s is string => typeof s === "string")
    .filter(s => {
      if (EXTERNAL_APPLY_CHIP.test(s)) return true; // "Apply on Company Website"
      return !IN_PLATFORM_APPLY_CHIP.test(s);
    });
}

/** Clamps a caller-supplied value to a budget, tolerating non-strings. */
export function clampInput(value: unknown, maxChars: number): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length <= maxChars ? trimmed : trimmed.slice(0, maxChars);
}
