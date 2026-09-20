/**
 * Shared types and presentation tables for the blog.
 *
 * Split out from the post content so a post file can import `BlogPost` without
 * pulling in every other post. The content itself lives one file per post in
 * src/content/blog/, collected by src/lib/blog/index.ts.
 */

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  /**
   * Optional comparison table. Kept as plain data rather than markdown so the
   * renderer can emit a real <table> — which is what a crawler needs to read
   * the comparison, and what a screen reader needs to navigate it.
   */
  table?: BlogTable;
  /**
   * Optional worked example. Rendered as a visually distinct callout so a
   * reader scanning for the concrete case can find it without reading the prose.
   */
  example?: BlogExample;
}

export interface BlogTable {
  /** Describes the table for assistive tech; also rendered as a caption. */
  caption: string;
  columns: string[];
  /** Each row must have the same length as `columns`. */
  rows: string[][];
}

export interface BlogExample {
  title: string;
  paragraphs: string[];
}

/**
 * An outbound link to a primary source.
 *
 * These exist to point a reader at the authoritative document rather than at
 * our summary of it, which is both the honest thing to do and the thing search
 * engines read as a quality signal. They are curated per post rather than
 * matched automatically: a wrong internal link is a dead end a crawler
 * forgives, whereas a wrong outbound link sends a reader somewhere we did not
 * intend and cannot correct.
 *
 * Only official documentation, standards bodies and primary sources belong
 * here — never a competitor's blog post summarising the same thing. The
 * allow-list in external-links.ts enforces that.
 */
export interface BlogReference {
  /** The document's own title, not a description of it. */
  title: string;
  /** Absolute https URL. Prefer a stable section root over a deep link. */
  url: string;
  /** Who publishes it, shown so the reader can judge before clicking. */
  publisher: string;
  /** One line on why this source is worth opening. */
  note?: string;
}

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  /** SEO <title>; the root layout appends " | JobsDart". */
  title: string;
  /** On-page H1, usually shorter and more human than the SEO title. */
  heading: string;
  description: string;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  author: string;
  readingMinutes: number;
  category: string;
  /**
   * Soft background wash for the article hero. Purely decorative variety so
   * consecutive guides do not look identical; falls back to 'slate'.
   */
  tint?: HeroTint;
  excerpt: string;
  /**
   * Three to five one-line conclusions, rendered above the article body.
   *
   * These exist for the reader who will not finish the page, and for the
   * snippet: a short, self-contained, declarative list is what gets lifted into
   * search results. Each line must stand alone without the surrounding prose.
   */
  keyTakeaways?: string[];
  sections: BlogSection[];
  faqs?: BlogFaq[];
  /** Slugs of related posts, rendered as internal links. */
  related?: string[];
  /**
   * Outbound links to primary sources, rendered as a "Further reading" block.
   *
   * Two to four is the useful range. A long list reads as padding and dilutes
   * the signal that each one was chosen deliberately.
   */
  references?: BlogReference[];
  /**
   * Phrases that should link *to this post* when they appear in another post's
   * body — the anchor text side of the internal link graph.
   *
   * Written from the perspective of the linking page, so they are the words an
   * author would naturally use mid-sentence ('vector database', 'prompt
   * injection'), not the post's own title. Matching is case-insensitive and on
   * word boundaries, so keep them specific: a phrase as broad as 'resume' would
   * hijack every mention across two hundred articles.
   */
  anchors?: string[];
}

/**
 * Muted, low-saturation hero washes — full class strings rather than
 * constructed names, because Tailwind only keeps classes it can see literally.
 */
export type HeroTint = 'slate' | 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose' | 'violet';

export const HERO_TINTS: Record<HeroTint, string> = {
  slate: 'bg-slate-50 dark:bg-slate-900/40',
  indigo: 'bg-indigo-50/70 dark:bg-indigo-950/25',
  emerald: 'bg-emerald-50/70 dark:bg-emerald-950/25',
  amber: 'bg-amber-50/70 dark:bg-amber-950/20',
  sky: 'bg-sky-50/70 dark:bg-sky-950/25',
  rose: 'bg-rose-50/60 dark:bg-rose-950/20',
  violet: 'bg-violet-50/70 dark:bg-violet-950/25',
};

export function heroTint(tint?: HeroTint): string {
  return HERO_TINTS[tint ?? 'slate'];
}

export interface CategoryStyle {
  /** Pill background + text, light and dark. */
  pill: string;
  /** Accent text colour for links and markers. */
  text: string;
  /** Gradient used for the card top rule and hero glow. */
  gradient: string;
  /** Ring colour applied on card hover. */
  ring: string;
}

/**
 * Per-category colour so the index reads as a set of distinct topics rather
 * than a uniform wall of cards. Indigo stays the primary brand accent.
 */
export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'AI & Careers': {
    pill: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
    text: 'text-indigo-600 dark:text-indigo-400',
    gradient: 'from-indigo-500 to-violet-500',
    ring: 'hover:border-indigo-300 dark:hover:border-indigo-700',
  },
  'Resumes & ATS': {
    pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500 to-teal-500',
    ring: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  Interviews: {
    pill: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500 to-orange-500',
    ring: 'hover:border-amber-300 dark:hover:border-amber-700',
  },
  'AI Skills': {
    pill: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    text: 'text-sky-600 dark:text-sky-400',
    gradient: 'from-sky-500 to-cyan-500',
    ring: 'hover:border-sky-300 dark:hover:border-sky-700',
  },
  'AGI & Future': {
    pill: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
    text: 'text-violet-600 dark:text-violet-400',
    gradient: 'from-violet-500 to-fuchsia-500',
    ring: 'hover:border-violet-300 dark:hover:border-violet-700',
  },
  'AI & Hiring': {
    pill: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    text: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500 to-pink-500',
    ring: 'hover:border-rose-300 dark:hover:border-rose-700',
  },
  'AI Engineering': {
    pill: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
    text: 'text-cyan-600 dark:text-cyan-400',
    gradient: 'from-cyan-500 to-blue-500',
    ring: 'hover:border-cyan-300 dark:hover:border-cyan-700',
  },
  'AI Security': {
    pill: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    text: 'text-red-600 dark:text-red-400',
    gradient: 'from-red-500 to-rose-500',
    ring: 'hover:border-red-300 dark:hover:border-red-700',
  },
  'Career Roadmaps': {
    pill: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
    text: 'text-teal-600 dark:text-teal-400',
    gradient: 'from-teal-500 to-emerald-500',
    ring: 'hover:border-teal-300 dark:hover:border-teal-700',
  },
  'Developer Tech': {
    pill: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-indigo-500',
    ring: 'hover:border-blue-300 dark:hover:border-blue-700',
  },
  'Global Careers': {
    pill: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
    text: 'text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500 to-amber-500',
    ring: 'hover:border-orange-300 dark:hover:border-orange-700',
  },
  'Job Search Safety': {
    pill: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300',
    text: 'text-fuchsia-600 dark:text-fuchsia-400',
    gradient: 'from-fuchsia-500 to-pink-500',
    ring: 'hover:border-fuchsia-300 dark:hover:border-fuchsia-700',
  },
};

export function categoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES['AI & Careers'];
}
