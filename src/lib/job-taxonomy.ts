/**
 * Server-side queries backing the crawlable job landing pages.
 *
 * Job search on /jobs is entirely client-side and driven by query params, which
 * search engines cannot traverse. These helpers power static, server-rendered
 * pages (e.g. /jobs/in/bengaluru) that give crawlers a real path to every
 * listing and let the site rank for "<role> jobs in <city>" style queries.
 */

import { supabaseAdmin } from '@/lib/supabase-admin';

export interface LocationFacet {
  kind: 'city' | 'country';
  name: string;
  slug: string;
  count: number;
}

export interface JobSummary {
  uuid: string;
  title: string;
  companyName: string | null;
  companyLogo: string | null;
  location: string;
  employmentType: string | null;
  workplaceType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  postedAt: string | null;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function activeJobFilter(query: any) {
  return query.eq('status', 'active').gt('expires_at', new Date().toISOString());
}

function toJobSummary(job: any, locationLabel: string): JobSummary {
  return {
    uuid: job.uuid,
    title: job.title,
    companyName: job.company_name ?? null,
    companyLogo: job.company_logo ?? null,
    location: locationLabel,
    employmentType: job.job_types?.name ?? job.employment_type ?? null,
    workplaceType: job.workplace_types?.name ?? null,
    // Mirrors the fallback used by the jobs API and the JobPosting markup.
    salaryMin: job.salary_min ?? job.salary_min_usd_cents ?? null,
    salaryMax: job.salary_max ?? job.salary_max_usd_cents ?? null,
    currency: job.currencies?.code ?? job.salary_currency ?? 'USD',
    postedAt: job.posted_at ?? null,
  };
}

const JOB_SELECT =
  '*, job_types!job_type_pk(name), workplace_types!workplace_type_pk(name), currencies!currency_id(code)';

/** Maps job ids to a readable "City, State, Country" label. */
async function getLocationLabels(jobIds: number[]): Promise<Map<number, string>> {
  const labels = new Map<number, string>();
  if (!jobIds.length) return labels;

  const { data, error } = await supabaseAdmin
    .from('job_locations')
    .select('job_id, countries:country_id(name), states_provinces:state_province_id(name), cities:city_id(name)')
    .in('job_id', jobIds);

  if (error) {
    console.error('[JOB_TAXONOMY] Failed to load location labels:', error.message);
    return labels;
  }

  for (const row of (data || []) as any[]) {
    if (labels.has(row.job_id)) continue;
    const label = [row.cities?.name, row.states_provinces?.name, row.countries?.name]
      .filter(Boolean)
      .join(', ');
    if (label) labels.set(row.job_id, label);
  }
  return labels;
}

async function loadFacets(): Promise<{ facets: LocationFacet[]; ok: boolean }> {
  try {
    const { data: jobs, error } = await activeJobFilter(supabaseAdmin.from('jobs').select('id'));
    if (error) {
      console.error('[JOB_TAXONOMY] Failed to load active jobs:', error.message);
      return { facets: [], ok: false };
    }

    const jobIds = (jobs || []).map((j: any) => j.id);
    if (!jobIds.length) return { facets: [], ok: true };

    const { data: locations, error: locError } = await supabaseAdmin
      .from('job_locations')
      .select('job_id, countries:country_id(name), cities:city_id(name)')
      .in('job_id', jobIds);

    if (locError) {
      console.error('[JOB_TAXONOMY] Failed to load locations:', locError.message);
      return { facets: [], ok: false };
    }

    // A job may sit in several locations; count each job once per facet.
    const cities = new Map<string, Set<number>>();
    const countries = new Map<string, Set<number>>();

    for (const row of (locations || []) as any[]) {
      const city = row.cities?.name;
      const country = row.countries?.name;
      if (city) {
        if (!cities.has(city)) cities.set(city, new Set());
        cities.get(city)!.add(row.job_id);
      }
      if (country) {
        if (!countries.has(country)) countries.set(country, new Set());
        countries.get(country)!.add(row.job_id);
      }
    }

    const facets: LocationFacet[] = [
      ...Array.from(cities, ([name, ids]) => ({
        kind: 'city' as const,
        name,
        slug: slugify(name),
        count: ids.size,
      })),
      ...Array.from(countries, ([name, ids]) => ({
        kind: 'country' as const,
        name,
        slug: slugify(name),
        count: ids.size,
      })),
    ];

    // A city slug wins over a country slug on collision, matching lookup order.
    const seen = new Set<string>();
    const deduped = facets
      .sort((a, b) => (a.kind === b.kind ? b.count - a.count : a.kind === 'city' ? -1 : 1))
      .filter(f => (seen.has(f.slug) ? false : (seen.add(f.slug), true)))
      .sort((a, b) => b.count - a.count);

    return { facets: deduped, ok: true };
  } catch (err) {
    console.error('[JOB_TAXONOMY] Unexpected error loading facets:', err);
    return { facets: [], ok: false };
  }
}

/**
 * Every city and country that currently has at least one live listing, used to
 * build the landing pages, their internal links and the sitemap entries.
 */
export async function getLocationFacets(): Promise<LocationFacet[]> {
  const { facets } = await loadFacets();
  return facets;
}

export type LocationLookup =
  | { status: 'ok'; facet: LocationFacet; jobs: JobSummary[] }
  | { status: 'not-found' }
  | { status: 'error' };

/**
 * Resolves a landing-page slug to its location and that location's live jobs.
 * Returns 'not-found' only when the facet list loaded and genuinely has no such
 * slug — a failed query yields 'error' so callers do not serve a 404 for a page
 * that really exists.
 */
export async function getJobsForLocationSlug(slug: string, limit = 100): Promise<LocationLookup> {
  try {
    const { facets, ok } = await loadFacets();
    if (!ok) return { status: 'error' };

    const facet = facets.find(f => f.slug === slug);
    if (!facet) return { status: 'not-found' };

    const table = facet.kind === 'city' ? 'cities' : 'countries';
    const { data: rows } = await supabaseAdmin.from(table).select('id').eq('name', facet.name);
    const ids = (rows || []).map((r: any) => r.id);
    if (!ids.length) return { status: 'ok', facet, jobs: [] };

    const column = facet.kind === 'city' ? 'city_id' : 'country_id';
    const { data: locRows, error: locError } = await supabaseAdmin
      .from('job_locations')
      .select('job_id')
      .in(column, ids);

    if (locError) {
      console.error('[JOB_TAXONOMY] Failed to load jobs for location:', locError.message);
      return { status: 'ok', facet, jobs: [] };
    }

    const jobIds = Array.from(new Set((locRows || []).map((r: any) => r.job_id)));
    if (!jobIds.length) return { status: 'ok', facet, jobs: [] };

    const { data: jobs, error } = await activeJobFilter(
      supabaseAdmin.from('jobs').select(JOB_SELECT).in('id', jobIds)
    )
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[JOB_TAXONOMY] Failed to load location jobs:', error.message);
      return { status: 'ok', facet, jobs: [] };
    }

    const labels = await getLocationLabels((jobs || []).map((j: any) => j.id));
    return {
      status: 'ok',
      facet,
      jobs: (jobs || []).map((j: any) => toJobSummary(j, labels.get(j.id) || facet.name)),
    };
  } catch (err) {
    console.error('[JOB_TAXONOMY] Unexpected error loading location jobs:', err);
    return { status: 'error' };
  }
}

/** Live remote listings, for the /jobs/remote landing page. */
export async function getRemoteJobs(limit = 100): Promise<JobSummary[]> {
  try {
    const { data: remoteTypes } = await supabaseAdmin
      .from('workplace_types')
      .select('id, name')
      .ilike('name', '%remote%');

    const typeIds = (remoteTypes || []).map((t: any) => t.id);
    if (!typeIds.length) return [];

    const { data: jobs, error } = await activeJobFilter(
      supabaseAdmin.from('jobs').select(JOB_SELECT).in('workplace_type_pk', typeIds)
    )
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[JOB_TAXONOMY] Failed to load remote jobs:', error.message);
      return [];
    }

    const labels = await getLocationLabels((jobs || []).map((j: any) => j.id));
    return (jobs || []).map((j: any) => toJobSummary(j, labels.get(j.id) || 'Remote'));
  } catch (err) {
    console.error('[JOB_TAXONOMY] Unexpected error loading remote jobs:', err);
    return [];
  }
}
