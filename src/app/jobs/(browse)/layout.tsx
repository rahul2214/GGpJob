import type { Metadata } from 'next';
import { siteUrl } from '@/lib/site';
import { getLocationFacets } from '@/lib/job-taxonomy';
import { LocationLinks } from '@/components/seo/job-landing';

const PAGE_URL = siteUrl('/jobs');
const OG_IMAGE = siteUrl('/og-image.png');

// The listing page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: 'Latest Job Vacancies — Search Remote, IT & Fresher Jobs',
  description:
    'Search the latest job openings on JobsDart. Filter thousands of verified vacancies by role, city, salary and experience — remote, hybrid and on-site jobs for freshers and experienced professionals. Apply directly to recruiters.',
  keywords: [
    'jobs',
    'job vacancies',
    'latest jobs',
    'job openings',
    'job search',
    'apply for jobs online',
    'remote jobs',
    'work from home jobs',
    'IT jobs',
    'software developer jobs',
    'fresher jobs',
    'entry level jobs',
    'experienced jobs',
    'private jobs',
    'hiring now',
    'jobs near me',
    'full time jobs',
    'part time jobs',
    'internship jobs',
    'jobsdart',
    'jobs dart',
  ],
  alternates: { canonical: PAGE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Latest Job Vacancies — Search Remote, IT & Fresher Jobs | JobsDart',
    description:
      'Search thousands of verified job openings on JobsDart. Filter by role, city, salary and experience, then apply directly to the hiring team.',
    url: PAGE_URL,
    siteName: 'JobsDart',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'JobsDart job search' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest Job Vacancies — Search Remote, IT & Fresher Jobs',
    description: 'Search thousands of verified job openings and apply directly to the hiring team.',
    images: [OG_IMAGE],
  },
};

// The location facets come from a no-store Supabase query, so this segment
// cannot be prerendered — without this the links block renders empty.
export const dynamic = 'force-dynamic';

// Scoped to the (browse) route group so /jobs/post, /jobs/saved and
// /jobs/[id] never inherit this canonical.
export default async function JobsBrowseLayout({ children }: { children: React.ReactNode }) {
  // Job search itself is client-side and driven by query params, which crawlers
  // cannot traverse. These server-rendered links give them a path into every
  // location landing page, and from there into the individual listings.
  const facets = await getLocationFacets();

  return (
    <>
      {children}
      <div className="container max-w-6xl px-4 sm:px-6 pb-16">
        <LocationLinks facets={facets} />
      </div>
    </>
  );
}
