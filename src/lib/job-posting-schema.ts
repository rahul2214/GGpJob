/**
 * Builds schema.org JobPosting structured data from a raw `jobs` row.
 *
 * This is what makes a listing eligible for the Google Jobs experience (the
 * boxed job results above the organic links). Google validates these fields
 * strictly, so anything it cannot verify is omitted rather than guessed.
 *
 * Field names mirror `mapJobToFrontend` in src/app/api/jobs/route.ts so the
 * markup always describes what the page actually renders.
 */

export { SITE_URL } from './site';
import { SITE_URL } from './site';
import { WORLDWIDE_COUNTRY_NAME } from './worldwide';

/** schema.org employmentType is an enum; the DB stores free text. */
const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  'full time': 'FULL_TIME',
  'full-time': 'FULL_TIME',
  'fulltime': 'FULL_TIME',
  'part time': 'PART_TIME',
  'part-time': 'PART_TIME',
  'parttime': 'PART_TIME',
  'contract': 'CONTRACTOR',
  'contractor': 'CONTRACTOR',
  'freelance': 'CONTRACTOR',
  'temporary': 'TEMPORARY',
  'internship': 'INTERN',
  'intern': 'INTERN',
  'volunteer': 'VOLUNTEER',
  'per diem': 'PER_DIEM',
  'other': 'OTHER',
};

export function toEmploymentType(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  return EMPLOYMENT_TYPE_MAP[raw.trim().toLowerCase()];
}

function isRemote(job: any): boolean {
  const workplace = String(job.workplace_types?.name || job.remote_type || '').toLowerCase();
  return workplace.includes('remote');
}

export interface JobLocation {
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

/**
 * Locations live in the `job_locations` join table, not on `jobs` itself, so
 * they are passed in resolved. The flat city/state/country columns are only a
 * fallback for rows that carry them.
 */
export function resolveLocations(job: any, joined?: JobLocation[]): JobLocation[] {
  const rows = (joined || []).filter(l => l.city || l.state || l.country);
  if (rows.length) return rows;
  if (job.city || job.state || job.country) {
    return [{ city: job.city, state: job.state, country: job.country }];
  }
  return [];
}

/** Human-readable location used in titles and descriptions. */
export function jobLocationLabel(job: any, locations?: JobLocation[]): string {
  const resolved = resolveLocations(job, locations);
  if (resolved.length) {
    const first = resolved[0];
    const label = [first.city, first.state, first.country].filter(Boolean).join(', ');
    if (label) return resolved.length > 1 ? `${label} +${resolved.length - 1} more` : label;
  }
  if (isRemote(job)) return 'Remote';
  return '';
}

/** Strips HTML so a description can be reused as a meta description. */
export function toPlainText(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

function toAmount(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const normalize = (s?: string | null) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Pulls streetAddress / postalCode out of the job's free-text `address` for
 * Google's recommended fields. Nothing is invented: a postal code is only
 * emitted when one is written in the address (6-digit Indian PIN or US ZIP),
 * and the street part only when it says more than the city/state/country.
 */
export function addressDetails(
  raw: string | null | undefined,
  place: JobLocation
): { streetAddress?: string; postalCode?: string } {
  const text = (raw || '').replace(/\s+/g, ' ').trim();
  if (!text) return {};

  const out: { streetAddress?: string; postalCode?: string } = {};

  const postal = text.match(/\b\d{3}\s?\d{3}\b/) || text.match(/\b\d{5}(?:-\d{4})?\b/);
  if (postal) out.postalCode = postal[0].replace(/\s/g, '');

  // Drop the postal code and any segment that only repeats the locality.
  const known = new Set([place.city, place.state, place.country].map(normalize).filter(Boolean));
  const street = text
    .replace(postal?.[0] || '\u0000', '')
    .split(',')
    .map(part => part.trim())
    // Also skip bare region codes such as "CA" or "KA".
    .filter(part => part && !known.has(normalize(part)) && !/^[A-Z]{2,3}$/.test(part))
    .join(', ')
    .replace(/[\s,-]+$/, '');

  if (street && /[a-z]/i.test(street)) out.streetAddress = street;
  return out;
}

export function buildJobPostingSchema(job: any, canonicalUrl: string, locations?: JobLocation[]) {
  const remote = isRemote(job);
  const places = resolveLocations(job, locations);

  // Mirrors the API's own fallback so the markup matches the displayed salary.
  // Stored in whole currency units despite the column name. Numeric columns can
  // arrive as strings, which previously dropped baseSalary silently.
  const salaryMin = toAmount(job.salary_min ?? job.salary_min_usd_cents);
  const salaryMax = toAmount(job.salary_max ?? job.salary_max_usd_cents);
  const currency = job.currencies?.code || job.salary_currency || 'USD';

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    '@id': `${canonicalUrl}#jobposting`,
    title: job.title,
    // Google expects the full description, HTML included.
    description: job.description || `Apply for the ${job.title} role at ${job.company_name} on JobsDart.`,
    datePosted: job.posted_at,
    url: canonicalUrl,
    // The apply flow lives on JobsDart itself rather than an offsite form.
    directApply: true,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_name || 'Confidential',
      ...(job.company_website ? { sameAs: job.company_website } : {}),
      ...(job.company_logo ? { logo: job.company_logo } : {}),
    },
    identifier: {
      '@type': 'PropertyValue',
      name: job.company_name || 'JobsDart',
      value: String(job.job_id || job.uuid || job.id),
    },
  };

  if (job.expires_at) schema.validThrough = job.expires_at;

  const employmentType = toEmploymentType(job.job_types?.name || job.employment_type);
  if (employmentType) schema.employmentType = employmentType;

  if (job.industry) schema.industry = job.industry;
  if (job.job_function) schema.occupationalCategory = job.job_function;

  // "Worldwide" is the sentinel country, not a place anyone can be addressed at,
  // so such a role carries only jobLocationType/applicantLocationRequirements.
  const worldwide = places.some(
    l => (l.country || '').trim().toLowerCase() === WORLDWIDE_COUNTRY_NAME.toLowerCase()
  );

  // Google requires jobLocation, or jobLocationType TELECOMMUTE for remote roles.
  if (places.length && !worldwide) {
    // The recruiter's free-text address is only trusted for a single-location
    // role; with several places it cannot be tied to any one of them.
    const extra = places.length === 1 ? addressDetails(job.address, places[0]) : {};
    const asPlace = (l: JobLocation) => ({
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...extra,
        ...(l.city ? { addressLocality: l.city } : {}),
        ...(l.state ? { addressRegion: l.state } : {}),
        ...(l.country ? { addressCountry: l.country } : {}),
      },
    });
    schema.jobLocation = places.length === 1 ? asPlace(places[0]) : places.map(asPlace);
  }

  if (remote || worldwide) {
    schema.jobLocationType = 'TELECOMMUTE';
    // Required alongside TELECOMMUTE so Google knows who may apply.
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: worldwide ? WORLDWIDE_COUNTRY_NAME : (places[0]?.country || job.country || WORLDWIDE_COUNTRY_NAME),
    };
  }

  if (salaryMin !== null) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: salaryMin,
        ...(salaryMax !== null && salaryMax >= salaryMin ? { maxValue: salaryMax } : {}),
        unitText: 'YEAR',
      },
    };
  }

  if (typeof job.experience_min === 'number' && job.experience_min > 0) {
    schema.experienceRequirements = {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: job.experience_min * 12,
    };
  }

  const skills: string[] = job.skill_names || [];
  if (skills.length) schema.skills = skills.join(', ');

  return schema;
}

/**
 * Google rejects a JobPosting that has neither a jobLocation nor TELECOMMUTE,
 * so only emit markup we know it can accept.
 */
export function isEligibleForJobPosting(job: any, locations?: JobLocation[]): boolean {
  return resolveLocations(job, locations).length > 0 || isRemote(job);
}
