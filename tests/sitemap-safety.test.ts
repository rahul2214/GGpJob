import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

describe('sitemap privacy and security safety', () => {
  it('does not include private or authentication pages in the sitemap', async () => {
    const entries = await sitemap();
    const urls = entries.map(e => e.url);

    const privateRoutes = [
      '/login',
      '/signup',
      '/company/login',
      '/company/signup',
      '/admin/login',
    ];

    for (const route of privateRoutes) {
      const match = urls.some(url => url.endsWith(route) || url.includes(`${route}/`));
      expect(match, `Private route ${route} must not be present in sitemap`).toBe(false);
    }
  });

  it('does not include any robots-disallowed paths in the sitemap', async () => {
    const entries = await sitemap();
    const urls = entries.map(e => e.url);
    const robotsRules = robots();
    const rulesList = Array.isArray(robotsRules.rules) ? robotsRules.rules : [robotsRules.rules];
    const primaryRule = rulesList.find(r => r?.userAgent === '*');
    const rawDisallow = primaryRule?.disallow;
    const disallowList: string[] = Array.isArray(rawDisallow)
      ? rawDisallow
      : typeof rawDisallow === 'string'
      ? [rawDisallow]
      : [];

    for (const disallowed of disallowList) {
      // Disallow prefix check (e.g. /admin/, /profile/, /dashboard/)
      const trimmed = disallowed.replace(/\/$/, '');
      const match = urls.some(url => {
        const path = new URL(url).pathname;
        return path.startsWith(disallowed) || path === trimmed;
      });
      expect(match, `Disallowed path ${disallowed} must not be in sitemap`).toBe(false);
    }
  });

  it('only includes public canonical URLs with valid priorities', async () => {
    const entries = await sitemap();
    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      expect(entry.url).toMatch(/^https?:\/\//);
      if (entry.priority !== undefined) {
        expect(entry.priority).toBeGreaterThanOrEqual(0);
        expect(entry.priority).toBeLessThanOrEqual(1);
      }
    }
  });
});
