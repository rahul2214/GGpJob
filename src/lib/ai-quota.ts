/**
 * Per-identity quota for inference endpoints.
 *
 * The middleware limiter runs before any token is validated, so it can only
 * check that a credential is *present*. That is enough to sort traffic into
 * buckets, but `Authorization: Bearer anything` is enough to land in the
 * generous one. This runs inside the route, after the token has been verified,
 * so the bucket is chosen by who the caller actually is.
 *
 * Inference bills against one org-wide token budget, which makes these the only
 * endpoints where a single caller can deny service to everybody else rather
 * than only to themselves.
 *
 * Caveat: in-memory, so each server instance counts separately — the effective
 * limit is per instance, as it already is for the middleware limiter. Moving
 * both to a shared store is the fix when this runs on more than one instance.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
const WINDOW_MS = 60_000;

/** Bound the map so a flood of distinct keys cannot grow it without limit. */
const MAX_KEYS = 20_000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < WINDOW_MS && windows.size < MAX_KEYS) return;
  for (const [key, w] of windows.entries()) {
    if (now > w.resetAt) windows.delete(key);
  }
  if (windows.size > MAX_KEYS) {
    let drop = windows.size - MAX_KEYS;
    for (const key of windows.keys()) {
      windows.delete(key);
      if (--drop <= 0) break;
    }
  }
  lastSweep = now;
}

export interface QuotaResult {
  allowed: boolean;
  /** Seconds until the window resets; only meaningful when not allowed. */
  retryAfter: number;
}

export function consumeAiQuota(identity: string, limit: number): QuotaResult {
  const now = Date.now();
  sweep(now);

  const existing = windows.get(identity);
  if (!existing || now > existing.resetAt) {
    windows.set(identity, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfter: 0 };
}

/**
 * Client address for quota purposes, using the same trusted-hop rule as the
 * middleware: the left-most X-Forwarded-For entry is caller-supplied and would
 * let anyone mint a fresh bucket per request.
 */
export function quotaClientIp(request: Request): string {
  const hops = Number(process.env.TRUSTED_PROXY_HOPS || 1);
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map(p => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      return parts[Math.max(0, parts.length - Math.max(1, hops))];
    }
  }
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "127.0.0.1"
  );
}

/** Signed-in callers get a working allowance; anonymous ones get a taste. */
export const AI_LIMIT_AUTHENTICATED = 15;
export const AI_LIMIT_ANONYMOUS = 4;
