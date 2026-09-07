import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE_URL, siteUrl } from '@/lib/site';
import { getJobsForLocationSlug, getLocationFacets } from '@/lib/job-taxonomy';
import { JobList, LocationLinks, buildItemListSchema } from '@/components/seo/job-landing';

type Props = { params: { slug: string } };

// Listings change through the day; render per request rather than caching a
// stale job count into the title.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getJobsForLocationSlug(params.slug);

  // notFound() must be raised here rather than in the component: this segment
  // is force-dynamic, so by the time the page body runs the 200 status has
  // already been committed and notFound() would render a soft 404.
  if (result.status === 'not-found') notFound();

  if (result.status === 'error') {
    return { title: 'Jobs', robots: { index: false, follow: true } };
  }

  const { facet, jobs } = result;
  const canonical = siteUrl(`/jobs/in/${facet.slug}`);
  const count = jobs.length;
  const title = `Jobs in ${facet.name} — ${count} Openings Hiring Now`;
  const description = `Browse ${count} live job vacancies in ${facet.name}. Filter full-time, part-time, remote and internship roles by salary and experience, then apply directly to the hiring team on JobsDart.`;

  return {
    title,
    description,
    keywords: [
      `jobs in ${facet.name}`,
      `${facet.name} jobs`,
      `job vacancies in ${facet.name}`,
      `hiring in ${facet.name}`,
      `IT jobs in ${facet.name}`,
      `software jobs in ${facet.name}`,
      `fresher jobs in ${facet.name}`,
      `part time jobs in ${facet.name}`,
      `work from home jobs in ${facet.name}`,
      `latest job openings ${facet.name}`,
      'jobsdart',
      'jobs dart',
    ],
    alternates: { canonical },
    // An empty location page is thin content; keep it out of the index.
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
      url: canonical,
      siteName: 'JobsDart',
      type: 'website',
      locale: 'en_IN',
      images: [{ url: siteUrl('/og-image.png'), width: 1200, height: 630, alt: `Jobs in ${facet.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteUrl('/og-image.png')],
    },
  };
}

export default async function LocationJobsPage({ params }: Props) {
  const result = await getJobsForLocationSlug(params.slug);
  if (result.status !== 'ok') notFound();

  const { facet, jobs } = result;
  const facets = await getLocationFacets();
  const pageUrl = siteUrl(`/jobs/in/${facet.slug}`);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: siteUrl('/jobs') },
      { '@type': 'ListItem', position: 3, name: `Jobs in ${facet.name}`, item: pageUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListSchema(jobs, pageUrl, SITE_URL)) }}
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
          <span className="text-slate-600 dark:text-slate-300">{facet.name}</span>
        </nav>

        <header className="mb-10 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Jobs in {facet.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {jobs.length} live {jobs.length === 1 ? 'opening' : 'openings'} in {facet.name} across full-time,
            part-time, contract, internship and remote roles. Every listing links straight to the hiring team —
            apply directly, no third-party redirects.
          </p>
        </header>

        <JobList jobs={jobs} />

        <section className="mt-14 border-t border-slate-200/60 dark:border-slate-800/60 pt-10 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Finding a job in {facet.name}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Most employers in {facet.name} screen applications with an applicant tracking system before a
            recruiter sees them. Run your CV through the{' '}
            <Link href="/ats-score" className="text-indigo-600 font-bold hover:underline">
              free ATS resume checker
            </Link>{' '}
            against the job description you are targeting, or start from scratch with the{' '}
            <Link href="/resume-builder" className="text-indigo-600 font-bold hover:underline">
              AI resume builder
            </Link>{' '}
            to get a parse-safe, keyword-matched resume before you apply.
          </p>
        </section>

        <LocationLinks facets={facets} currentSlug={facet.slug} />
      </div>
    </>
  );
}
