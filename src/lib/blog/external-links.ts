/**
 * Rules for outbound links in article bodies.
 *
 * Linking out to primary sources is a quality signal and an honesty one: a
 * reader deserves the actual specification rather than our paraphrase of it.
 * The risk is that outbound links rot, or that a plausible-looking URL was
 * never correct in the first place, and a reader cannot tell the difference
 * between the two.
 *
 * The allow-list below is the control. A domain earns a place only if it
 * publishes the primary material — a standards body, an official documentation
 * site, a regulator, a maintainer. Secondary commentary is deliberately
 * excluded, however good it is, because sending readers to someone else's
 * summary adds a hop without adding authority.
 */

import type { BlogReference } from './types';

/**
 * Domains we are willing to link out to, with who they are.
 *
 * Matching is on the exact host or any subdomain of it, so adding a domain
 * here is a deliberate decision about a publisher rather than about one page.
 */
export const ALLOWED_REFERENCE_DOMAINS: Record<string, string> = {
  'developer.mozilla.org': 'MDN Web Docs',
  'w3.org': 'W3C',
  'owasp.org': 'OWASP',
  'nist.gov': 'NIST',
  'postgresql.org': 'PostgreSQL',
  'docs.python.org': 'Python',
  'kubernetes.io': 'Kubernetes',
  'react.dev': 'React',
  'nextjs.org': 'Next.js',
  'learn.microsoft.com': 'Microsoft Learn',
  'playwright.dev': 'Playwright',
  'modelcontextprotocol.io': 'Model Context Protocol',
  'schema.org': 'Schema.org',
  'developers.google.com': 'Google for Developers',
  'web.dev': 'web.dev',
  'github.com': 'GitHub',
  'arxiv.org': 'arXiv',
  'gov.uk': 'GOV.UK',
  'uscis.gov': 'USCIS',
};

/*
 * Publishers deliberately left out, so nobody re-adds them without knowing why:
 *
 *   bls.gov, consumer.ftc.gov, ico.org.uk — all serve 403 or nothing to an
 *   automated request, so their URLs cannot be checked before shipping. They
 *   are reputable; we simply cannot confirm a given page exists, and an
 *   unverifiable outbound link is worse than none.
 *
 *   eur-lex.europa.eu — returns a 2xx with an empty body, so a dead link and a
 *   live one are indistinguishable from here.
 */

/** True when a URL is an absolute https link to an allow-listed publisher. */
export function isAllowedReferenceUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') return false;

  const host = parsed.hostname.toLowerCase();
  return Object.keys(ALLOWED_REFERENCE_DOMAINS).some(
    domain => host === domain || host.endsWith(`.${domain}`)
  );
}

/**
 * Why a reference is not acceptable, or null when it is fine.
 *
 * Returns a message rather than a boolean so the test that runs this over the
 * whole corpus can say which post and which field to fix.
 */
export function referenceProblem(reference: BlogReference): string | null {
  if (!reference.title.trim()) return 'title is empty';
  if (!reference.publisher.trim()) return 'publisher is empty';
  if (!isAllowedReferenceUrl(reference.url)) {
    return `url is not an https link to an allow-listed publisher: ${reference.url}`;
  }
  return null;
}

/**
 * Attributes every outbound link gets.
 *
 * `noopener` because a new tab must not get a handle on ours, and `noreferrer`
 * so a reader's path through the site is not disclosed to the destination.
 * Deliberately not `nofollow`: these are sources we are citing on purpose, and
 * withholding the link equity from a standards body would be a strange thing
 * to do.
 */
export const EXTERNAL_LINK_REL = 'noopener noreferrer';
