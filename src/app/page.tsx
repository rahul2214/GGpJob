import type { Metadata } from 'next';
import JobPortalHome from '@/components/home/JobPortalHome';
import HomeClientDashboard from '@/components/home/HomeClientDashboard';

export const metadata: Metadata = {
  title: 'JobsDart — Bypass ATS & Get Referred at Top MNCs in India',
  description: 'Find jobs faster with JobsDart, an AI-powered job portal for job seekers. Discover global jobs, build your resume, check ATS scores, and get hired.',
  keywords: [
    'employee referral jobs India',
    'bypass ATS India',
    'insider referral platform',
    'MNC jobs Bengaluru',
    'job referral Google Microsoft',
    'direct hiring India',
    'referral jobs 2025',
    'get referred MNC India',
    'job portal India referral',
    'ATS bypass jobs'
  ],
  metadataBase: new URL('https://jobsdart.in'),
  alternates: {
    canonical: 'https://jobsdart.in',
  },
  openGraph: {
    title: 'JobsDart — Bypass ATS & Get Referred at Top MNCs in India',
    description: 'Find jobs faster with JobsDart, an AI-powered job portal for job seekers. Discover global jobs, build your resume, check ATS scores, and get hired.',
    url: 'https://jobsdart.in',
    siteName: 'JobsDart',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JobsDart — Get Referred by Insiders at Top MNCs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobsDart — Bypass ATS & Get Referred at Top MNCs in India',
    description: 'Find jobs faster with JobsDart, an AI-powered job portal for job seekers. Discover global jobs, build your resume, check ATS scores, and get hired.',
    images: ['/og-image.png'],
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-[hsl(220_65%_6%)]">
      <HomeClientDashboard fallback={<JobPortalHome />} />
    </main>
  );
}
