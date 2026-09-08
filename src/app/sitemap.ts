import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SITE_URL } from '@/lib/site';
import { getLocationFacets } from '@/lib/job-taxonomy';
import { getAllPosts } from '@/lib/blog-posts';

// Shared with metadataBase and every canonical tag, so the sitemap can never
// advertise a different host than the pages themselves claim.
const baseUrl = SITE_URL;

// A sitemap file may hold at most 50,000 URLs; stay well under it.
const MAX_JOB_URLS = 20000;

// The Supabase admin client fetches with no-store, so this route cannot be
// prerendered; render it per request instead of failing the build-time attempt.
export const dynamic = 'force-dynamic';

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${baseUrl}/`, changeFrequency: 'daily', priority: 1.0 },
  { url: `${baseUrl}/jobs`, changeFrequency: 'hourly', priority: 0.9 },
  { url: `${baseUrl}/jobs/remote`, changeFrequency: 'daily', priority: 0.9 },
  { url: `${baseUrl}/ats-score`, changeFrequency: 'weekly', priority: 0.9 },
  { url: `${baseUrl}/resume-builder`, changeFrequency: 'weekly', priority: 0.9 },
  { url: `${baseUrl}/blog`, changeFrequency: 'weekly', priority: 0.8 },
  { url: `${baseUrl}/communities`, changeFrequency: 'daily', priority: 0.7 },
  { url: `${baseUrl}/company/login`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${baseUrl}/login`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${baseUrl}/signup`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${baseUrl}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  { url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  { url: `${baseUrl}/refund`, changeFrequency: 'yearly', priority: 0.3 },
];

/**
 * Live job listings are the long-tail of a job board's organic traffic, and
 * they are only reachable through paginated client-side search — so without
 * them in the sitemap most listings never get crawled. Expired and closed
 * roles are excluded: their pages are noindex.
 */
async function getJobEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    // `jobs` has no updated_at column; posted_at is the only timestamp available.
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('uuid, posted_at')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('posted_at', { ascending: false })
      .limit(MAX_JOB_URLS);

    if (error) {
      console.error('[SITEMAP] Failed to load jobs:', error.message);
      return [];
    }

    const rows = (data || []) as Array<{ uuid: string | null; posted_at: string | null }>;

    return rows
      .filter(job => Boolean(job.uuid))
      .map(job => ({
        url: `${baseUrl}/jobs/${job.uuid}`,
        lastModified: new Date(job.posted_at || Date.now()),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
  } catch (err) {
    // A sitemap that 500s gets dropped in Search Console; degrade to the
    // static routes instead.
    console.error('[SITEMAP] Unexpected error building job entries:', err);
    return [];
  }
}

/** One indexable landing page per location that currently has live jobs. */
async function getLocationEntries(lastModified: Date): Promise<MetadataRoute.Sitemap> {
  const facets = await getLocationFacets();
  return facets
    .filter(facet => facet.count > 0)
    .map(facet => ({
      url: `${baseUrl}/jobs/in/${facet.slug}`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }));
}

/** Blog posts are static content, so their real update dates are used. */
function getBlogEntries(): MetadataRoute.Sitemap {
  return getAllPosts().map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [locations, jobs] = await Promise.all([getLocationEntries(lastModified), getJobEntries()]);

  return [
    ...staticRoutes.map(route => ({ ...route, lastModified })),
    ...getBlogEntries(),
    ...locations,
    ...jobs,
  ];
}
