import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JobDetailsClient from '../job-details-client';
import {
  SITE_URL,
  buildJobPostingSchema,
  isEligibleForJobPosting,
  jobLocationLabel,
  toPlainText,
  truncate,
} from '@/lib/job-posting-schema';
import { getJobDetails } from '@/lib/job-lookup';
import { jobTitleToSlug } from '@/lib/job-url';

type Props = {
  params: { id: string; jobId: string };
};

const OG_IMAGE = `${SITE_URL}/og-image.png`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getJobDetails(params.jobId);

  if (result.status === 'not-found') notFound();

  if (result.status === 'error' || !result.job) {
    return { title: 'Job Details', robots: { index: false, follow: true } };
  }

  const { job, locations } = result;
  const canonicalSlug = jobTitleToSlug(job.title);
  const requestSlug = decodeURIComponent(params.id || '').toLowerCase();
  if (requestSlug !== canonicalSlug.toLowerCase()) {
    notFound();
  }

  const targetId = job.uuid || params.jobId;
  const canonical = `${SITE_URL}/jobs/${canonicalSlug}/${targetId}`;

  const location = jobLocationLabel(job, locations);
  const title = location
    ? `${job.title} at ${job.company_name} — ${location}`
    : `${job.title} at ${job.company_name}`;

  const plain = toPlainText(job.description);
  const description = plain
    ? truncate(`${job.title} job at ${job.company_name}${location ? ` in ${location}` : ''}. ${plain}`, 158)
    : `Apply for the ${job.title} role at ${job.company_name}${location ? ` in ${location}` : ''} on JobsDart. See the full job description, salary and requirements, then apply directly.`;

  // An expired or closed listing stays reachable but must drop out of the index.
  const isOpen =
    job.status === 'active' && (!job.expires_at || new Date(job.expires_at) > new Date());

  return {
    title,
    description,
    keywords: [
      job.title,
      `${job.title} jobs`,
      `${job.title} at ${job.company_name}`,
      `${job.company_name} careers`,
      ...(location ? [`${job.title} jobs in ${location}`, `jobs in ${location}`] : []),
      ...(job.job_types?.name ? [`${job.job_types.name} ${job.title}`] : []),
      ...(job.skill_names || []).slice(0, 6).map((s: string) => `${s} jobs`),
      'jobsdart',
    ].filter(Boolean),
    alternates: { canonical },
    robots: isOpen
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'JobsDart',
      type: 'website',
      locale: 'en_IN',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${job.title} at ${job.company_name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default async function JobDetailsPage({ params }: Props) {
  const result = await getJobDetails(params.jobId);
  if (result.status === 'not-found') notFound();
  if (result.status === 'error' || !result.job) notFound();

  const { job, locations } = result;
  const canonicalSlug = jobTitleToSlug(job.title);
  const requestSlug = decodeURIComponent(params.id || '').toLowerCase();
  const targetId = job.uuid || params.jobId;

  // Strict SEO URL enforcement: ONLY the exact canonical title slug (/jobs/{job-title}/{job-uuid}) is allowed.
  // Any invalid or placeholder slug (such as "...", dots, or arbitrary text) returns 404 Not Found.
  if (requestSlug !== canonicalSlug.toLowerCase()) {
    notFound();
  }

  const canonical = `${SITE_URL}/jobs/${canonicalSlug}/${targetId}`;

  // Only advertise live listings to Google Jobs — markup for an expired role is
  // a structured data violation — and only when Google can actually place them.
  const isOpen =
    job && job.status === 'active' && (!job.expires_at || new Date(job.expires_at) > new Date());
  const showJobPosting = Boolean(isOpen) && isEligibleForJobPosting(job, locations);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: `${SITE_URL}/jobs` },
      ...(job
        ? [{ '@type': 'ListItem', position: 3, name: `${job.title} at ${job.company_name}`, item: canonical }]
        : []),
    ],
  };

  return (
    <>
      {showJobPosting && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildJobPostingSchema(job, canonical, locations)),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <JobDetailsClient jobId={targetId} />
    </>
  );
}
