import type { Metadata } from 'next';
import { siteUrl } from '@/lib/site';

// The signup page is a client component, so its metadata lives here. Without
// this the page was indexable but served the generic site-wide title.
export const metadata: Metadata = {
  title: 'Recruiter Sign Up — Post Jobs and Hire',
  description:
    'Create a free recruiter account on JobsDart to post jobs, review verified candidate profiles and manage applications from one dashboard.',
  keywords: [
    'recruiter sign up',
    'post a job free',
    'employer registration',
    'hire candidates online',
    'recruitment account',
    'post jobs india',
    'jobsdart recruiter',
  ],
  alternates: { canonical: siteUrl('/company/signup') },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title: 'Recruiter Sign Up — Post Jobs and Hire | JobsDart',
    description:
      'Create a free recruiter account to post jobs, review verified candidates and manage applications.',
    url: siteUrl('/company/signup'),
    siteName: 'JobsDart',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: siteUrl('/og-image.png'), width: 1200, height: 630, alt: 'JobsDart for recruiters' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recruiter Sign Up — Post Jobs and Hire',
    description: 'Create a free recruiter account to post jobs and review verified candidates.',
    images: [siteUrl('/og-image.png')],
  },
};

export default function CompanySignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
