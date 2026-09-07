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

export function buildJobPostingSchema(job: any, canonicalUrl: string, locations?: JobLocation[]) {
  const remote = isRemote(job);
  const places = resolveLocations(job, locations);

  // Mirrors the API's own fallback so the markup matches the displayed salary.
  const salaryMin = job.salary_min ?? job.salary_min_usd_cents ?? null;
  const salaryMax = job.salary_max ?? job.salary_max_usd_cents ?? null;
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

  // Google requires jobLocation, or jobLocationType TELECOMMUTE for remote roles.
  if (places.length) {
    const asPlace = (l: JobLocation) => ({
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...(l.city ? { addressLocality: l.city } : {}),
        ...(l.state ? { addressRegion: l.state } : {}),
        ...(l.country ? { addressCountry: l.country } : {}),
      },
    });
    schema.jobLocation = places.length === 1 ? asPlace(places[0]) : places.map(asPlace);
  }

  if (remote) {
    schema.jobLocationType = 'TELECOMMUTE';
    // Required alongside TELECOMMUTE so Google knows who may apply.
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: places[0]?.country || job.country || 'Worldwide',
    };
  }

  if (typeof salaryMin === 'number' && salaryMin > 0) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: salaryMin,
        ...(typeof salaryMax === 'number' && salaryMax > 0 ? { maxValue: salaryMax } : {}),
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
