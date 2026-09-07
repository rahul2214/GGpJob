import type { Metadata } from 'next';
import { siteUrl } from '@/lib/site';

// The page itself is a client component, so its metadata lives here. Scoped to
// this route group / leaf so sibling routes never inherit the canonical.
export const metadata: Metadata = {
  title: 'Recruiter Login & Hiring Plans — Post Jobs Online',
  description: 'Sign in as a recruiter to post jobs on JobsDart, review verified candidate profiles and manage applications. Compare one-time hiring plans with job posting limits and application access.',
  keywords: ['recruiter login', 'post a job', 'post jobs online', 'hiring plans', 'job posting site', 'recruitment portal india', 'employer login', 'hire candidates', 'jobsdart recruiter', 'jobs dart'],
  alternates: { canonical: siteUrl('/company/login') },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title: 'Recruiter Login & Hiring Plans on JobsDart — Post Jobs Online',
    description: 'Sign in as a recruiter to post jobs on JobsDart, review verified candidate profiles and manage applications. Compare one-time hiring plans with job posting limits and application access.',
    url: siteUrl('/company/login'),
    siteName: 'JobsDart',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: siteUrl('/og-image.png'), width: 1200, height: 630, alt: 'JobsDart' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recruiter Login & Hiring Plans on JobsDart — Post Jobs Online',
    description: 'Sign in as a recruiter to post jobs on JobsDart, review verified candidate profiles and manage applications. Compare one-time hiring plans with job posting limits and application access.',
    images: [siteUrl('/og-image.png')],
  },
};

export default function CompanyLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
