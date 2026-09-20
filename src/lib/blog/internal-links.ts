/**
 * Contextual internal linking for article bodies.
 *
 * Every post declares `anchors` — the phrases that should point *at* it when
 * another post happens to use them. This module turns that into real in-body
 * links at render time, so a mention of "prompt injection" inside an unrelated
 * guide becomes a link to the guide about it.
 *
 * Why generate them instead of writing <a> into the content: with 205 posts the
 * link graph is n-squared work to maintain by hand, and it silently rots every
 * time a slug changes. Deriving it from the post set means the graph is always
 * consistent with what actually exists, and a renamed post cannot leave a dead
 * anchor behind.
 *
 * The rules below exist to keep this from reading as keyword spam. Search
 * engines and readers both punish a page where every other noun is a link, so
 * the budget is deliberately tight and each target is linked at most once.
 */

import type { BlogPost } from './types';

/** A resolved chunk of a paragraph: plain text, or text that links somewhere. */
export type LinkedSegment = { text: string; href?: string; title?: string };

interface AnchorTarget {
  phrase: string;
  slug: string;
  /** Used as the link title attribute, so hovering explains the destination. */
  heading: string;
}

/** Most links we will place in a single article. */
const MAX_LINKS_PER_POST = 10;

/** Most links we will place in one paragraph or bullet, to keep prose readable. */
const MAX_LINKS_PER_BLOCK = 2;

/**
 * Below this length a phrase matches too much to be meaningful as anchor text.
 * 'AI' or 'CV' would fire on nearly every article in the set.
 */
const MIN_PHRASE_LENGTH = 8;

/**
 * Shorter phrases are allowed when they are distinctive technical terms rather
 * than ordinary words — 'MLOps' and 'LLMOps' are unambiguous wherever they
 * appear, while 'resume' or 'AI job' of the same length are not.
 *
 * The test is an internal capital in a single word, which is what acronyms and
 * product names have and what common nouns do not.
 */
const MIN_DISTINCTIVE_LENGTH = 5;

function isDistinctiveTerm(phrase: string): boolean {
  return !/\s/.test(phrase) && /[A-Z]/.test(phrase.slice(1));
}

/** True when a phrase is specific enough to be worth linking on. */
export function isUsableAnchor(phrase: string): boolean {
  const trimmed = phrase.trim();
  if (trimmed.length >= MIN_PHRASE_LENGTH) return true;
  return trimmed.length >= MIN_DISTINCTIVE_LENGTH && isDistinctiveTerm(trimmed);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds the phrase lookup once per process.
 *
 * Sorted longest first so that JavaScript's leftmost-alternation picks the most
 * specific target at any given position: with both 'vector database' and
 * 'database' registered, the longer one has to be tried first or the specific
 * guide never wins.
 */
function buildIndex(posts: BlogPost[]): { pattern: RegExp | null; targets: Map<string, AnchorTarget> } {
  const targets = new Map<string, AnchorTarget>();

  for (const post of posts) {
    for (const phrase of post.anchors ?? []) {
      const trimmed = phrase.trim();
      if (!isUsableAnchor(trimmed)) continue;

      const key = trimmed.toLowerCase();
      // First post to claim a phrase keeps it. Declaration order in the index
      // is deliberate, so this is stable across builds rather than arbitrary.
      if (targets.has(key)) continue;

      targets.set(key, { phrase: trimmed, slug: post.slug, heading: post.heading });
    }
  }

  if (targets.size === 0) return { pattern: null, targets };

  const alternation = [...targets.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|');

  return { pattern: new RegExp(`\\b(${alternation})\\b`, 'gi'), targets };
}

/**
 * Places links across one article, keeping count as it goes.
 *
 * Stateful by design: the budget and the "link each destination once" rule are
 * both properties of the whole page, not of an individual paragraph, so the
 * caller creates one of these per article and feeds every block through it.
 */
export class PostLinker {
  private readonly pattern: RegExp | null;
  private readonly targets: Map<string, AnchorTarget>;
  private readonly currentSlug: string;
  private readonly linked = new Set<string>();
  private placed = 0;

  constructor(posts: BlogPost[], currentSlug: string) {
    const index = buildIndex(posts);
    this.pattern = index.pattern;
    this.targets = index.targets;
    this.currentSlug = currentSlug;
  }

  /** How many contextual links ended up on the page. Used by tests. */
  get count(): number {
    return this.placed;
  }

  /**
   * Splits one block of text into linked and unlinked segments.
   *
   * Always returns at least one segment, so a caller can render the result
   * without special-casing text that had no matches.
   */
  linkify(text: string): LinkedSegment[] {
    if (!this.pattern || this.placed >= MAX_LINKS_PER_POST) {
      return [{ text }];
    }

    const segments: LinkedSegment[] = [];
    let cursor = 0;
    let inBlock = 0;

    // A global regex carries lastIndex between calls, so reset before each use.
    this.pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = this.pattern.exec(text)) !== null) {
      if (inBlock >= MAX_LINKS_PER_BLOCK || this.placed >= MAX_LINKS_PER_POST) break;

      const target = this.targets.get(match[0].toLowerCase());
      if (!target) continue;
      if (target.slug === this.currentSlug) continue;
      if (this.linked.has(target.slug)) continue;

      if (match.index > cursor) {
        segments.push({ text: text.slice(cursor, match.index) });
      }

      // Keep the casing the author wrote, not the casing of the registered
      // phrase — anchor text at the start of a sentence must stay capitalised.
      segments.push({
        text: match[0],
        href: `/blog/${target.slug}`,
        title: target.heading,
      });

      this.linked.add(target.slug);
      this.placed += 1;
      inBlock += 1;
      cursor = match.index + match[0].length;
    }

    if (cursor < text.length) {
      segments.push({ text: text.slice(cursor) });
    }

    return segments.length > 0 ? segments : [{ text }];
  }
}
