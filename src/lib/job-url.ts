import { slugify } from '@/lib/job-taxonomy';

/**
 * Converts a job title to an SEO-friendly URL slug.
 * e.g. "Senior Full Stack Engineer (React / Node.js)" -> "senior-full-stack-engineer-react-node-js"
 */
export function jobTitleToSlug(title?: string | null): string {
  if (!title) return 'job';
  const slug = slugify(title);
  return slug || 'job';
}

/**
 * Returns the SEO-friendly URL for a job posting: /jobs/{job-title}/{job-uuid}
 */
export function getJobUrl(job: {
  uuid?: string | null;
  id?: string | number | null;
  title?: string | null;
}): string {
  const id = job.uuid || job.id;
  const slug = jobTitleToSlug(job.title);
  return `/jobs/${slug}/${id}`;
}
