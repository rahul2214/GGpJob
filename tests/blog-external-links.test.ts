import { describe, it, expect } from 'vitest';
import { BLOG_POSTS } from '@/lib/blog';
import {
  isAllowedReferenceUrl,
  referenceProblem,
  ALLOWED_REFERENCE_DOMAINS,
  EXTERNAL_LINK_REL,
} from '@/lib/blog/external-links';

describe('reference URL rules', () => {
  it('accepts an https link to an allow-listed publisher', () => {
    expect(isAllowedReferenceUrl('https://developer.mozilla.org/en-US/docs/Web/HTTP')).toBe(true);
  });

  it('accepts a subdomain of an allow-listed publisher', () => {
    expect(isAllowedReferenceUrl('https://nvlpubs.nist.gov/nistpubs/ai/x.pdf')).toBe(true);
  });

  it('rejects a domain that merely ends with an allowed name', () => {
    // "notw3.org" must not pass because it ends with "w3.org" as a substring.
    expect(isAllowedReferenceUrl('https://notw3.org/spec')).toBe(false);
  });

  it('rejects plain http', () => {
    expect(isAllowedReferenceUrl('http://developer.mozilla.org/en-US/docs/Web/HTTP')).toBe(false);
  });

  it('rejects an unknown publisher', () => {
    expect(isAllowedReferenceUrl('https://some-content-farm.example/seo-guide')).toBe(false);
  });

  it('rejects a malformed url', () => {
    expect(isAllowedReferenceUrl('not a url')).toBe(false);
  });

  it('explains what is wrong with a bad reference', () => {
    expect(
      referenceProblem({ title: 'X', publisher: 'Y', url: 'https://example.com/a' })
    ).toContain('allow-listed');
    expect(
      referenceProblem({ title: '', publisher: 'Y', url: 'https://react.dev/learn' })
    ).toBe('title is empty');
  });

  it('opens external links without leaking the referrer or window handle', () => {
    expect(EXTERNAL_LINK_REL).toContain('noopener');
    expect(EXTERNAL_LINK_REL).toContain('noreferrer');
  });
});

describe('references across the real corpus', () => {
  const withRefs = BLOG_POSTS.filter(p => (p.references || []).length > 0);

  it('has references registered on posts', () => {
    expect(withRefs.length).toBeGreaterThan(0);
  });

  it('only cites allow-listed publishers over https', () => {
    const problems = BLOG_POSTS.flatMap(p =>
      (p.references || [])
        .map(ref => {
          const problem = referenceProblem(ref);
          return problem ? `${p.slug}: ${problem}` : null;
        })
        .filter((x): x is string => x !== null)
    );

    expect(problems).toEqual([]);
  });

  it('never repeats the same url within one post', () => {
    const duplicates = BLOG_POSTS.flatMap(p => {
      const seen = new Set<string>();
      return (p.references || [])
        .filter(ref => {
          if (seen.has(ref.url)) return true;
          seen.add(ref.url);
          return false;
        })
        .map(ref => `${p.slug}: ${ref.url}`);
    });

    expect(duplicates).toEqual([]);
  });

  it('keeps the reference list short enough to read as curated', () => {
    const tooMany = withRefs
      .filter(p => (p.references || []).length > 4)
      .map(p => `${p.slug}: ${p.references!.length}`);

    expect(tooMany).toEqual([]);
  });

  it('names a publisher consistent with the domain it links to', () => {
    const mismatches: string[] = [];

    for (const p of BLOG_POSTS) {
      for (const ref of p.references || []) {
        const host = new URL(ref.url).hostname.toLowerCase();
        const domain = Object.keys(ALLOWED_REFERENCE_DOMAINS).find(
          d => host === d || host.endsWith(`.${d}`)
        );
        if (!domain) continue;
        // The declared publisher should relate to the registered one rather
        // than being arbitrary text, so a reader is not misled about the source.
        const expected = ALLOWED_REFERENCE_DOMAINS[domain].toLowerCase();
        const actual = ref.publisher.toLowerCase();
        if (!actual.includes(expected) && !expected.includes(actual)) {
          mismatches.push(`${p.slug}: "${ref.publisher}" for ${host}`);
        }
      }
    }

    expect(mismatches).toEqual([]);
  });
});
