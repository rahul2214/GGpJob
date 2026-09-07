/**
 * Server-rendered listing UI for the job landing pages.
 *
 * Deliberately a server component with plain <a> links and no client JS: the
 * whole point of these pages is that a crawler can read the listings and follow
 * them to every job without executing JavaScript.
 */

import Link from 'next/link';
import { MapPin, Briefcase, Building2, Wallet } from 'lucide-react';
import type { JobSummary, LocationFacet } from '@/lib/job-taxonomy';

function formatSalary(job: JobSummary): string | null {
  if (!job.salaryMin || job.salaryMin <= 0) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: job.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  if (job.salaryMax && job.salaryMax > job.salaryMin) {
    return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
  }
  return `From ${fmt(job.salaryMin)}`;
}

export function JobList({ jobs }: { jobs: JobSummary[] }) {
  if (!jobs.length) {
    return (
      <p className="text-slate-500 text-sm py-10 text-center">
        No live openings here right now.{' '}
        <Link href="/jobs" className="text-indigo-600 font-bold hover:underline">
          Browse all jobs
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="grid gap-4 list-none p-0">
      {jobs.map(job => {
        const salary = formatSalary(job);
        return (
          <li key={job.uuid}>
            <Link
              href={`/jobs/${job.uuid}`}
              className="block p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                {job.title}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {job.companyName && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {job.companyName}
                  </span>
                )}
                {job.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                )}
                {job.employmentType && (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    {job.employmentType}
                    {job.workplaceType ? ` · ${job.workplaceType}` : ''}
                  </span>
                )}
                {salary && (
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    {salary}
                  </span>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Crawlable links between every landing page. Without these the pages would be
 * orphans reachable only from the sitemap, which carries far less weight.
 */
export function LocationLinks({
  facets,
  currentSlug,
  heading = 'Browse jobs by location',
}: {
  facets: LocationFacet[];
  currentSlug?: string;
  heading?: string;
}) {
  const visible = facets.filter(f => f.slug !== currentSlug);
  if (!visible.length) return null;

  return (
    <nav aria-label={heading} className="mt-16 border-t border-slate-200/60 dark:border-slate-800/60 pt-10">
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-5">{heading}</h2>
      <ul className="flex flex-wrap gap-2.5 list-none p-0">
        <li>
          <Link
            href="/jobs/remote"
            className="inline-block px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            Remote jobs
          </Link>
        </li>
        {visible.map(facet => (
          <li key={facet.slug}>
            <Link
              href={`/jobs/in/${facet.slug}`}
              className="inline-block px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Jobs in {facet.name}
              <span className="ml-1.5 text-slate-400 font-semibold">{facet.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** ItemList markup so Google understands the page as a real listing index. */
export function buildItemListSchema(jobs: JobSummary[], pageUrl: string, siteOrigin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${pageUrl}#joblist`,
    numberOfItems: jobs.length,
    itemListElement: jobs.slice(0, 50).map((job, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${siteOrigin}/jobs/${job.uuid}`,
      name: job.companyName ? `${job.title} at ${job.companyName}` : job.title,
    })),
  };
}
