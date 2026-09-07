import type { Metadata } from 'next';
import { siteUrl } from '@/lib/site';

// The page itself is a client component, so its metadata lives here. Scoped to
// this route group / leaf so sibling routes never inherit the canonical.
export const metadata: Metadata = {
  title: 'Login to Your Job Seeker Account',
  description: 'Sign in to JobsDart to track job applications, save jobs, check your ATS score, build your resume and message recruiters directly.',
  keywords: ['jobsdart login', 'jobs dart login', 'job seeker login', 'job portal login', 'sign in jobsdart'],
  alternates: { canonical: siteUrl('/login') },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title: 'Login to JobsDart — Job Seeker Account',
    description: 'Sign in to JobsDart to track job applications, save jobs, check your ATS score, build your resume and message recruiters directly.',
    url: siteUrl('/login'),
    siteName: 'JobsDart',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: siteUrl('/og-image.png'), width: 1200, height: 630, alt: 'JobsDart' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login to JobsDart — Job Seeker Account',
    description: 'Sign in to JobsDart to track job applications, save jobs, check your ATS score, build your resume and message recruiters directly.',
    images: [siteUrl('/og-image.png')],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
