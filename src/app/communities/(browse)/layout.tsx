import type { Metadata } from 'next';
import { siteUrl } from '@/lib/site';

// The page itself is a client component, so its metadata lives here. Scoped to
// this route group / leaf so sibling routes never inherit the canonical.
export const metadata: Metadata = {
  title: 'Career Communities — Connect With Recruiters & Job Seekers',
  description: 'Join free career communities on JobsDart. Share referrals, get resume feedback, follow direct hiring posts from recruiters, and discuss interviews with professionals in your field.',
  keywords: ['career communities', 'job referral community', 'tech community india', 'recruiter community', 'job seeker forum', 'referral jobs', 'interview discussion', 'resume feedback community', 'hiring updates', 'jobsdart communities', 'jobs dart'],
  alternates: { canonical: siteUrl('/communities') },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title: 'Career Communities on JobsDart — Connect With Recruiters & Job Seekers',
    description: 'Join free career communities on JobsDart. Share referrals, get resume feedback, follow direct hiring posts from recruiters, and discuss interviews with professionals in your field.',
    url: siteUrl('/communities'),
    siteName: 'JobsDart',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: siteUrl('/og-image.png'), width: 1200, height: 630, alt: 'JobsDart' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Career Communities on JobsDart — Connect With Recruiters & Job Seekers',
    description: 'Join free career communities on JobsDart. Share referrals, get resume feedback, follow direct hiring posts from recruiters, and discuss interviews with professionals in your field.',
    images: [siteUrl('/og-image.png')],
  },
};

export default function CommunitiesBrowseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
