import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL, siteUrl } from '@/lib/site';
import { getLocationFacets, getRemoteJobs } from '@/lib/job-taxonomy';
import { JobList, LocationLinks, buildItemListSchema } from '@/components/seo/job-landing';

export const dynamic = 'force-dynamic';

const PAGE_URL = siteUrl('/jobs/remote');

export async function generateMetadata(): Promise<Metadata> {
  const jobs = await getRemoteJobs();
  const count = jobs.length;

  const title = `Remote Jobs — ${count} Work From Home Openings Hiring Now`;
  const description = `Browse ${count} live remote and work-from-home jobs on JobsDart. Fully remote software, design, marketing and support roles hiring now — apply directly to the team, no agency in between.`;

  return {
    title,
    description,
    keywords: [
      'remote jobs',
      'work from home jobs',
      'wfh jobs',
      'remote jobs india',
      'online jobs from home',
      'remote software developer jobs',
      'remote it jobs',
      'fully remote jobs',
      'telecommute jobs',
      'remote jobs for freshers',
      'part time work from home jobs',
      'jobsdart',
      'jobs dart',
    ],
    alternates: { canonical: PAGE_URL },
    robots:
      count > 0
        ? {
            index: true,
            follow: true,
            googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
          }
        : { index: false, follow: true },
    openGraph: {
      title: `${title} | JobsDart`,
      description,
      url: PAGE_URL,
      siteName: 'JobsDart',
      type: 'website',
      locale: 'en_IN',
      images: [{ url: siteUrl('/og-image.png'), width: 1200, height: 630, alt: 'Remote jobs on JobsDart' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteUrl('/og-image.png')],
    },
  };
}

export default async function RemoteJobsPage() {
  const [jobs, facets] = await Promise.all([getRemoteJobs(), getLocationFacets()]);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: siteUrl('/jobs') },
      { '@type': 'ListItem', position: 3, name: 'Remote Jobs', item: PAGE_URL },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListSchema(jobs, PAGE_URL, SITE_URL)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="container max-w-4xl px-4 sm:px-6 py-14">
        <nav aria-label="Breadcrumb" className="text-xs font-bold text-slate-400 mb-5">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/jobs" className="hover:text-indigo-600">Jobs</Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-600 dark:text-slate-300">Remote</span>
        </nav>

        <header className="mb-10 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Remote Jobs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {jobs.length} live work-from-home {jobs.length === 1 ? 'opening' : 'openings'} across engineering,
            design, marketing and support. Each role links straight to the hiring team, so you apply directly
            rather than through an agency.
          </p>
        </header>

        <JobList jobs={jobs} />

        <section className="mt-14 border-t border-slate-200/60 dark:border-slate-800/60 pt-10 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Applying for remote roles
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Remote openings draw far more applicants than on-site ones, so the automated screen is stricter.
            Check your CV against the job description with the{' '}
            <Link href="/ats-score" className="text-indigo-600 font-bold hover:underline">
              free ATS resume checker
            </Link>{' '}
            before applying, and use the{' '}
            <Link href="/resume-builder" className="text-indigo-600 font-bold hover:underline">
              AI resume builder
            </Link>{' '}
            to make sure the formatting parses cleanly.
          </p>
        </section>

        <LocationLinks facets={facets} />
      </div>
    </>
  );
}
