import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import JobDetailsClient from './job-details-client';
import {
  SITE_URL,
  buildJobPostingSchema,
  isEligibleForJobPosting,
  jobLocationLabel,
  toPlainText,
  truncate,
  type JobLocation,
} from '@/lib/job-posting-schema';

type Props = {
  params: { id: string };
};

const OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Loads the job with everything the JobPosting markup and metadata need.
 * `generateMetadata` and the page body both call this; Next dedupes the
 * request within a render pass, so the row is fetched once.
 */
type JobLookup =
  | { status: 'ok'; job: any; locations: JobLocation[] }
  | { status: 'not-found' }
  | { status: 'error' };

async function getJob(id: string): Promise<JobLookup> {
  const isNumericId = /^\d+$/.test(id);

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('*, job_types!job_type_pk(name), workplace_types!workplace_type_pk(name), currencies!currency_id(code)')
    .eq(isNumericId ? 'id' : 'uuid', id)
    .maybeSingle();

  if (error) {
    console.error('[JOB_PAGE] Failed to load job:', error.message);
    return { status: 'error' };
  }
  if (!data) return { status: 'not-found' };

  // Locations live in the job_locations join table, mirroring the jobs API.
  let locations: JobLocation[] = [];
  const { data: locRows, error: locError } = await supabaseAdmin
    .from('job_locations')
    .select('countries:country_id(name), states_provinces:state_province_id(name), cities:city_id(name)')
    .eq('job_id', data.id);

  if (locError) {
    console.error('[JOB_PAGE] Failed to load job locations:', locError.message);
  } else {
    locations = (locRows || []).map((row: any) => ({
      city: row.cities?.name ?? null,
      state: row.states_provinces?.name ?? null,
      country: row.countries?.name ?? null,
    }));
  }

  return { status: 'ok', job: data, locations };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getJob(params.id);
  const canonical = `${SITE_URL}/jobs/${params.id}`;

  // Raised here rather than in the component so the response carries a real 404
  // status instead of a soft 404, which Google penalises.
  if (result.status === 'not-found') notFound();

  if (result.status === 'error') {
    return { title: 'Job Details', robots: { index: false, follow: true } };
  }

  const { job, locations } = result;
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
  const result = await getJob(params.id);
  if (result.status === 'not-found') notFound();

  const job = result.status === 'ok' ? result.job : null;
  const locations = result.status === 'ok' ? result.locations : [];
  const canonical = `${SITE_URL}/jobs/${params.id}`;

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
      <JobDetailsClient />
    </>
  );
}
