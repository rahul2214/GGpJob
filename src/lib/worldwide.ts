/**
 * "Open to all countries" for a remote listing.
 *
 * Such a job is stored as a single `job_locations` row with country_id = -1.
 * The -1 is a real row in `countries` (named "Worldwide", is_active = false,
 * seeded by migration_jobs_worldwide_country.sql) so the foreign key holds and
 * every `countries:country_id(name)` embed resolves without a special case,
 * while the row stays out of the country pickers, which only list active rows.
 */

export const WORLDWIDE_COUNTRY_ID = -1;
export const WORLDWIDE_COUNTRY_NAME = 'Worldwide';

/** The single location row that represents "open to all countries". */
export const WORLDWIDE_LOCATION = Object.freeze({
  countryId: WORLDWIDE_COUNTRY_ID,
  stateId: null as number | null,
  cityId: null as number | null,
  country: WORLDWIDE_COUNTRY_NAME,
  state: '',
  city: '',
});

export function isWorldwideCountryId(id: unknown): boolean {
  if (id === null || id === undefined || id === '') return false;
  const n = Number(id);
  return !Number.isNaN(n) && n === WORLDWIDE_COUNTRY_ID;
}

/**
 * True when a job is open to candidates in every country.
 *
 * Checks the mapped flag first, then the raw location rows, and finally the
 * resolved country name — the last one keeps client-side filters correct for
 * payloads that only carry names (job cards, saved jobs, cached responses).
 */
export function isOpenToAllCountries(job: any): boolean {
  if (!job) return false;

  if (job.openToAllCountries === true || job.open_to_all_countries === true) return true;

  const rawLocations = Array.isArray(job.jobLocations) ? job.jobLocations : [];
  if (rawLocations.some((l: any) => isWorldwideCountryId(l?.countryId ?? l?.country_id))) return true;

  if (isWorldwideCountryId(job.countryId ?? job.country_id)) return true;

  const named = [job.country, ...(Array.isArray(job.locations) ? job.locations : [])];
  return named.some(
    (n: any) => typeof n === 'string' && n.trim().toLowerCase() === WORLDWIDE_COUNTRY_NAME.toLowerCase()
  );
}

export interface NormalizedJobLocation {
  countryId: number;
  stateId: number | null;
  cityId: number | null;
}

export interface NormalizedLocations {
  locations: NormalizedJobLocation[];
  openToAllCountries: boolean;
  /** Set when the payload cannot be stored; callers answer with a 400. */
  error: string | null;
}

const toId = (v: any): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n !== 0 ? n : null;
};

/**
 * Turns whatever a client sent into the rows that go into `job_locations`.
 *
 * Accepts the `locations` array the job form posts as well as the older flat
 * countryId/stateId/cityId fields, and collapses "open to all countries" to the
 * single sentinel row. Worldwide is a superset of any specific country, so a
 * payload that carries both is collapsed to the sentinel rather than rejected.
 */
export function normalizeJobLocations(data: any): NormalizedLocations {
  const flagged = data?.openToAllCountries === true || data?.open_to_all_countries === true;

  const raw: any[] =
    Array.isArray(data?.locations) && data.locations.length > 0
      ? data.locations
      : [{ countryId: data?.countryId, stateId: data?.stateId, cityId: data?.cityId }];

  const hasSentinel = raw.some((l: any) => isWorldwideCountryId(l?.countryId ?? l?.country_id));

  if (flagged || hasSentinel) {
    return {
      locations: [{ countryId: WORLDWIDE_COUNTRY_ID, stateId: null, cityId: null }],
      openToAllCountries: true,
      error: null,
    };
  }

  const locations: NormalizedJobLocation[] = [];
  for (const entry of raw) {
    const countryId = toId(entry?.countryId ?? entry?.country_id);
    const stateId = toId(entry?.stateId ?? entry?.state_province_id);
    const cityId = toId(entry?.cityId ?? entry?.city_id);

    // A row the recruiter added but never filled in is dropped, not stored.
    if (countryId === null && stateId === null && cityId === null) continue;

    if (countryId === null) {
      return {
        locations: [],
        openToAllCountries: false,
        error: 'Every location needs a country. Select one, or mark the role open to all countries.',
      };
    }
    if (countryId < 0) {
      return {
        locations: [],
        openToAllCountries: false,
        error: 'Invalid country for a job location.',
      };
    }

    // Drop duplicates so a repeated country does not inflate the join table.
    const key = `${countryId}:${stateId ?? ''}:${cityId ?? ''}`;
    if (locations.some(l => `${l.countryId}:${l.stateId ?? ''}:${l.cityId ?? ''}` === key)) continue;

    locations.push({ countryId, stateId, cityId });
  }

  if (locations.length === 0) {
    return {
      locations: [],
      openToAllCountries: false,
      error: 'Location is required for posting a job',
    };
  }

  return { locations, openToAllCountries: false, error: null };
}

/** `job_locations` rows ready to insert for a job. */
export function toJobLocationRows(jobPk: number, locations: NormalizedJobLocation[]) {
  return locations.map((loc, idx) => ({
    job_id: jobPk,
    country_id: loc.countryId,
    state_province_id: loc.stateId,
    city_id: loc.cityId,
    is_primary: idx === 0,
  }));
}

/**
 * The workplace type the recruiter picked is authoritative; the older free-text
 * `remote_type` is only consulted when no workplace type is set. Otherwise a
 * client could send workplaceType "On-site" with remoteType "remote" and get a
 * worldwide on-site job past the check.
 */
export function isRemoteWorkplace(workplaceTypeName?: string | null, remoteType?: string | null): boolean {
  const authoritative = workplaceTypeName || remoteType || '';
  return String(authoritative).toLowerCase().includes('remote');
}

/** Keeps the `remote_type` column in step with the selected workplace type. */
export function resolveRemoteType(
  workplaceTypeName?: string | null,
  remoteType?: string | null
): 'remote' | 'hybrid' | 'onsite' {
  const authoritative = String(workplaceTypeName || remoteType || '').toLowerCase();
  if (authoritative.includes('remote')) return 'remote';
  if (authoritative.includes('hybrid')) return 'hybrid';
  return 'onsite';
}
