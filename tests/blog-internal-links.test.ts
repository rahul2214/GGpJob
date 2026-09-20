import { describe, it, expect } from 'vitest';
import { PostLinker, isUsableAnchor } from '@/lib/blog/internal-links';
import { BLOG_POSTS, getPostBySlug, getInboundPosts } from '@/lib/blog';
import type { BlogPost } from '@/lib/blog/types';

/** Minimal post factory — only the fields the linker reads. */
function post(slug: string, anchors: string[]): BlogPost {
  return {
    slug,
    title: slug,
    heading: `Heading for ${slug}`,
    description: '',
    keywords: [],
    publishedAt: '2026-01-01',
    updatedAt: '2026-01-01',
    author: 'Test',
    readingMinutes: 1,
    category: 'AI & Careers',
    excerpt: '',
    sections: [],
    anchors,
  };
}

const FIXTURES: BlogPost[] = [
  post('vector-databases', ['vector database']),
  post('vector-databases-for-job-matching', ['vector database for job matching']),
  post('prompt-injection', ['prompt injection']),
  post('browser-agents', ['browser automation']),
  post('self', ['self referential phrase']),
];

function textOf(segments: { text: string }[]): string {
  return segments.map(s => s.text).join('');
}

describe('PostLinker', () => {
  it('links a matching phrase to the post that claims it', () => {
    const linker = new PostLinker(FIXTURES, 'self');
    const segments = linker.linkify('Teams worry about prompt injection early on.');

    const link = segments.find(s => s.href);
    expect(link?.href).toBe('/blog/prompt-injection');
    expect(link?.text).toBe('prompt injection');
  });

  it('never rewrites the text it was given', () => {
    const original = 'A vector database helps, and so does browser automation.';
    const linker = new PostLinker(FIXTURES, 'self');
    expect(textOf(linker.linkify(original))).toBe(original);
  });

  it('prefers the longest matching phrase', () => {
    const linker = new PostLinker(FIXTURES, 'self');
    const segments = linker.linkify('We evaluated a vector database for job matching last year.');

    const link = segments.find(s => s.href);
    expect(link?.href).toBe('/blog/vector-databases-for-job-matching');
  });

  it('preserves the casing the author wrote', () => {
    const linker = new PostLinker(FIXTURES, 'self');
    const segments = linker.linkify('Prompt injection is the risk here.');

    expect(segments.find(s => s.href)?.text).toBe('Prompt injection');
  });

  it('never links a post to itself', () => {
    const linker = new PostLinker(FIXTURES, 'prompt-injection');
    const segments = linker.linkify('This article is about prompt injection.');

    expect(segments.some(s => s.href)).toBe(false);
  });

  it('links each destination at most once per article', () => {
    const linker = new PostLinker(FIXTURES, 'self');
    linker.linkify('First mention of prompt injection.');
    const second = linker.linkify('Second mention of prompt injection.');

    expect(second.some(s => s.href)).toBe(false);
    expect(linker.count).toBe(1);
  });

  it('places at most two links in one block', () => {
    const linker = new PostLinker(FIXTURES, 'self');
    const segments = linker.linkify(
      'A vector database, plus prompt injection, plus browser automation, all at once.'
    );

    expect(segments.filter(s => s.href)).toHaveLength(2);
  });

  it('only matches on word boundaries', () => {
    const linker = new PostLinker(FIXTURES, 'self');
    // "prompt injections" ends past the phrase, so the boundary must not match.
    const segments = linker.linkify('Nonprompt injectionish text should not match.');

    expect(segments.some(s => s.href)).toBe(false);
  });

  it('ignores phrases that are too short to be meaningful anchors', () => {
    const shortAnchor = [post('ai', ['AI'])];
    const linker = new PostLinker(shortAnchor, 'self');

    expect(linker.linkify('We use AI for this.').some(s => s.href)).toBe(false);
  });

  it('returns a single segment when nothing matches', () => {
    const linker = new PostLinker(FIXTURES, 'self');
    const segments = linker.linkify('Nothing in here is a registered phrase.');

    expect(segments).toHaveLength(1);
    expect(segments[0].href).toBeUndefined();
  });
});

describe('anchors across the real corpus', () => {
  const withAnchors = BLOG_POSTS.filter(p => (p.anchors || []).length > 0);

  it('has anchors registered on posts', () => {
    expect(withAnchors.length).toBeGreaterThan(0);
  });

  it('never registers the same phrase on two posts', () => {
    const owner = new Map<string, string>();
    const collisions: string[] = [];

    for (const p of BLOG_POSTS) {
      for (const anchor of p.anchors || []) {
        const key = anchor.trim().toLowerCase();
        const existing = owner.get(key);
        if (existing && existing !== p.slug) {
          collisions.push(`"${anchor}" claimed by both ${existing} and ${p.slug}`);
        } else {
          owner.set(key, p.slug);
        }
      }
    }

    expect(collisions).toEqual([]);
  });

  it('registers only anchors specific enough to link on', () => {
    const unusable = BLOG_POSTS.flatMap(p =>
      (p.anchors || []).filter(a => !isUsableAnchor(a)).map(a => `${p.slug}: "${a}"`)
    );

    expect(unusable).toEqual([]);
  });

  it('places contextual links in a real article body', () => {
    const target = getPostBySlug('how-applicant-tracking-systems-work');
    expect(target).toBeDefined();

    const linker = new PostLinker(BLOG_POSTS, target!.slug);
    for (const section of target!.sections) {
      for (const paragraph of section.paragraphs) linker.linkify(paragraph);
    }

    expect(linker.count).toBeGreaterThan(0);
  });
});

describe('getInboundPosts', () => {
  it('finds posts whose related list points here', () => {
    const target = getPostBySlug('how-applicant-tracking-systems-work')!;
    const inbound = getInboundPosts(target);

    for (const ref of inbound) {
      expect(ref.related).toContain(target.slug);
    }
  });

  it('excludes the post itself and anything already in its related list', () => {
    const target = getPostBySlug('how-applicant-tracking-systems-work')!;
    const inbound = getInboundPosts(target);
    const alreadyShown = new Set(target.related || []);

    for (const ref of inbound) {
      expect(ref.slug).not.toBe(target.slug);
      expect(alreadyShown.has(ref.slug)).toBe(false);
    }
  });
});
