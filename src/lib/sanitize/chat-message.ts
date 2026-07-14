/**
 * Client-side chat / note sanitization.
 * Server re-checks everything — this is an early gate for the admin UI.
 */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const ZERO_WIDTH_AND_BIDI = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;
const DANGEROUS_SCHEME = /(?:javascript|vbscript|data)\s*:/gi;
const HTML_TAG = /<\/?[a-zA-Z][^>]*>/g;
const EVENT_HANDLER_ATTR = /\bon[a-z]+\s*=/gi;

export const CHAT_MESSAGE_MAX_LENGTH = 4000;
export const CHAT_NOTE_MAX_LENGTH = 1000;

export function looksLikeHostileMessage(raw: string): boolean {
  const sample = String(raw ?? "");
  if (!sample.trim()) return false;
  if (/<\s*script\b/i.test(sample)) return true;
  if (/<\s*iframe\b/i.test(sample)) return true;
  if (/<\s*object\b/i.test(sample)) return true;
  if (/<\s*embed\b/i.test(sample)) return true;
  if (/<\s*link\b/i.test(sample)) return true;
  if (/<\s*meta\b/i.test(sample)) return true;
  if (/\bon[a-z]+\s*=/i.test(sample)) return true;
  if (/(?:javascript|vbscript)\s*:/i.test(sample)) return true;
  if (/data\s*:\s*text\/html/i.test(sample)) return true;
  if (sample.includes("\u0000")) return true;
  return false;
}

export function sanitizeChatMessage(
  body: string,
  options?: { maxLength?: number },
): string {
  const maxLength = options?.maxLength ?? CHAT_MESSAGE_MAX_LENGTH;
  let text = String(body ?? "").normalize("NFKC");

  text = text.replace(CONTROL_CHARS, "");
  text = text.replace(ZERO_WIDTH_AND_BIDI, "");
  text = text.replace(HTML_TAG, " ");
  text = text.replace(EVENT_HANDLER_ATTR, "");
  text = text.replace(DANGEROUS_SCHEME, "");
  text = text.replace(/[^\S\n\r]+/g, " ");
  text = text.replace(/\r\n?/g, "\n");
  text = text.replace(/\n{4,}/g, "\n\n\n");
  text = text.trim();

  if (text.length > maxLength) {
    text = text.slice(0, maxLength).trimEnd();
  }

  return text;
}

export type SafeChatMessageResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function validateChatMessageInput(
  raw: string,
  options?: { maxLength?: number },
): SafeChatMessageResult {
  const maxLength = options?.maxLength ?? CHAT_MESSAGE_MAX_LENGTH;
  const trimmed = String(raw ?? "").trim();

  if (!trimmed) {
    return { ok: false, error: "Message cannot be empty." };
  }
  if (trimmed.length > maxLength) {
    return { ok: false, error: `Message must be ${maxLength} characters or fewer.` };
  }
  if (looksLikeHostileMessage(trimmed)) {
    return { ok: false, error: "That message contains content that is not allowed." };
  }

  const cleaned = sanitizeChatMessage(trimmed, { maxLength });
  if (!cleaned) {
    return { ok: false, error: "Message is empty after removing unsafe characters." };
  }

  return { ok: true, value: cleaned };
}
