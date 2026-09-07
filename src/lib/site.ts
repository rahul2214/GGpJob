/**
 * The single canonical origin for every absolute URL the app emits: metadata
 * base, canonical tags, Open Graph URLs, JSON-LD @ids, the sitemap and robots.
 *
 * These were previously hard-coded as "https://jobsdart.in" across the app
 * while NEXT_PUBLIC_APP_URL (and the CORS default in next.config.mjs) pointed
 * at "https://www.jobsdart.in". Serving both hosts with canonicals naming a
 * third opinion splits ranking signals, so the value now comes from one place.
 *
 * To switch the canonical host, change NEXT_PUBLIC_APP_URL — and make sure the
 * other host 301-redirects to it at the DNS/CDN layer.
 */

const FALLBACK_ORIGIN = 'https://www.jobsdart.in';

function normalizeOrigin(raw?: string): string {
  const value = (raw || '').trim();
  if (!value) return FALLBACK_ORIGIN;

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    // Drops any path, query or trailing slash so callers can append freely.
    return new URL(withProtocol).origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

export const SITE_URL = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);

/** Builds an absolute URL for a site-relative path. */
export function siteUrl(path = ''): string {
  if (!path || path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
