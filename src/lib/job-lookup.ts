import { supabaseAdmin } from '@/lib/supabase-admin';
import type { JobLocation } from '@/lib/job-posting-schema';

export type JobLookup =
  | { status: 'ok'; job: any; locations: JobLocation[] }
  | { status: 'not-found' }
  | { status: 'error' };

/**
 * Loads the job with everything the JobPosting markup and metadata need.
 * Next.js dedupes fetch requests within a render pass.
 */
export async function getJobDetails(id: string): Promise<JobLookup> {
  const isNumericId = /^\d+$/.test(id);

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('*, job_types!job_type_pk(name), workplace_types!workplace_type_pk(name), currencies!currency_id(code)')
    .eq(isNumericId ? 'id' : 'uuid', id)
    .maybeSingle();

  if (error) {
    console.error('[JOB_LOOKUP] Failed to load job:', error.message);
    return { status: 'error' };
  }
  if (!data) return { status: 'not-found' };

  let locations: JobLocation[] = [];
  const { data: locRows, error: locError } = await supabaseAdmin
    .from('job_locations')
    .select('countries:country_id(name), states_provinces:state_province_id(name), cities:city_id(name)')
    .eq('job_id', data.id);

  if (locError) {
    console.error('[JOB_LOOKUP] Failed to load job locations:', locError.message);
  } else {
    locations = (locRows || []).map((row: any) => ({
      city: row.cities?.name ?? null,
      state: row.states_provinces?.name ?? null,
      country: row.countries?.name ?? null,
    }));
  }

  return { status: 'ok', job: data, locations };
}

/**
 * Fast lookup for title and uuid, used by redirectors.
 */
export async function getJobRedirectInfo(id: string): Promise<{ uuid: string; title: string } | null> {
  const isNumericId = /^\d+$/.test(id);

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('uuid, title')
    .eq(isNumericId ? 'id' : 'uuid', id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
