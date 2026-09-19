import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  BLOG_POSTS,
  POSTS_PER_PAGE,
  getAllPosts,
  getPagePosts,
  getPageSummaries,
  getPostBySlug,
  getPostSummaries,
  getRelatedPosts,
  getTotalPages,
  isValidPage,
} from '@/lib/blog';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog');

const fileSlugs = fs
  .readdirSync(CONTENT_DIR)
  .filter(f => f.endsWith('.ts'))
  .map(f => f.replace(/\.ts$/, ''))
  .sort();

describe('blog content registration', () => {
  /**
   * The failure this guards: post content lives one file per post, but
   * src/lib/blog/index.ts is what generateStaticParams and the sitemap read
   * from. A file added without its import line builds cleanly and is simply
   * absent — and because the route sets dynamicParams = false, its URL is a
   * hard 404 rather than a render. Nothing else would catch that.
   */
  it('registers every post file in the index', () => {
    const registered = BLOG_POSTS.map(p => p.slug).sort();
    const unregistered = fileSlugs.filter(s => !registered.includes(s));

    expect(unregistered, 'post files missing an import in src/lib/blog/index.ts').toEqual([]);
  });

  it('has a file backing every registered post', () => {
    const registered = BLOG_POSTS.map(p => p.slug).sort();
    const orphaned = registered.filter(s => !fileSlugs.includes(s));

    expect(orphaned, 'posts registered with no file in src/content/blog/').toEqual([]);
  });

  it('names each file after the slug it exports', () => {
    // The slug is the public URL. Keeping the filename equal to it makes an
    // accidental slug change visible in review instead of silent.
    const mismatched = BLOG_POSTS
      .filter(p => !fileSlugs.includes(p.slug))
      .map(p => p.slug);

    expect(mismatched).toEqual([]);
    expect(BLOG_POSTS).toHaveLength(fileSlugs.length);
  });
});

describe('blog post integrity', () => {
  it('has no duplicate slugs', () => {
    const slugs = BLOG_POSTS.map(p => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('gives every post the fields the pages and metadata read', () => {
    for (const post of BLOG_POSTS) {
      expect(post.slug, 'slug').toBeTruthy();
      expect(post.title, `${post.slug}: title`).toBeTruthy();
      expect(post.heading, `${post.slug}: heading`).toBeTruthy();
      expect(post.description, `${post.slug}: description`).toBeTruthy();
      expect(post.excerpt, `${post.slug}: excerpt`).toBeTruthy();
      expect(post.publishedAt, `${post.slug}: publishedAt`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.updatedAt, `${post.slug}: updatedAt`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.sections.length, `${post.slug}: sections`).toBeGreaterThan(0);
    }
  });

  it('resolves every related-post slug to a real post', () => {
    // A stale slug in `related` renders no link rather than erroring, so a
    // broken internal link would otherwise pass unnoticed.
    const broken: string[] = [];
    for (const post of BLOG_POSTS) {
      for (const slug of post.related || []) {
        if (!getPostBySlug(slug)) broken.push(`${post.slug} -> ${slug}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('keeps getRelatedPosts consistent with the related slugs', () => {
    for (const post of BLOG_POSTS) {
      expect(getRelatedPosts(post)).toHaveLength((post.related || []).length);
    }
  });
});

describe('getAllPosts', () => {
  it('returns every post, newest first', () => {
    const all = getAllPosts();
    expect(all).toHaveLength(BLOG_POSTS.length);

    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].publishedAt >= all[i].publishedAt).toBe(true);
    }
  });

  it('does not mutate the source array', () => {
    const before = BLOG_POSTS.map(p => p.slug);
    getAllPosts();
    expect(BLOG_POSTS.map(p => p.slug)).toEqual(before);
  });
});

describe('blog index pagination', () => {
  it('splits every post across the pages with none lost or repeated', () => {
    const seen: string[] = [];
    for (let page = 1; page <= getTotalPages(); page++) {
      seen.push(...getPageSummaries(page).map(p => p.slug));
    }
    // Same set, same order, no duplicates, nothing dropped off the last page.
    expect(seen).toEqual(getPostSummaries().map(p => p.slug));
    expect(new Set(seen).size).toBe(seen.length);
  });

  it('never puts more than POSTS_PER_PAGE on a page', () => {
    for (let page = 1; page <= getTotalPages(); page++) {
      expect(getPageSummaries(page).length).toBeLessThanOrEqual(POSTS_PER_PAGE);
    }
  });

  it('gives every page at least one post', () => {
    // An empty trailing page would be a real URL rendering nothing.
    for (let page = 1; page <= getTotalPages(); page++) {
      expect(getPageSummaries(page).length, `page ${page}`).toBeGreaterThan(0);
    }
  });

  it('keeps getPagePosts aligned with getPageSummaries', () => {
    for (let page = 1; page <= getTotalPages(); page++) {
      expect(getPagePosts(page).map(p => p.slug)).toEqual(
        getPageSummaries(page).map(p => p.slug)
      );
    }
  });

  it('accepts only page numbers that exist', () => {
    expect(isValidPage(1)).toBe(true);
    expect(isValidPage(getTotalPages())).toBe(true);
    expect(isValidPage(getTotalPages() + 1)).toBe(false);
    expect(isValidPage(0)).toBe(false);
    expect(isValidPage(-1)).toBe(false);
    expect(isValidPage(1.5)).toBe(false);
  });

  it('reports at least one page even though that means /blog alone', () => {
    expect(getTotalPages()).toBeGreaterThanOrEqual(1);
  });
});
