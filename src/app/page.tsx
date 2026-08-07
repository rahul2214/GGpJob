import type { Metadata } from 'next';
import JobPortalHome from '@/components/home/JobPortalHome';
import HomeClientDashboard from '@/components/home/HomeClientDashboard';

export const metadata: Metadata = {
  title: 'JobsDart — Bypass ATS & Get Referred at Top MNCs in India',
  description: 'Skip the ATS black hole. JobsDart connects job seekers directly with verified employees and recruiters at Google, Microsoft, Amazon & 500+ MNCs for direct referrals and insider hiring.',
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
    description: 'Skip the ATS. Connect with verified employees at Google, Microsoft, Amazon & 500+ MNCs for direct referrals. India\'s referral-first job platform.',
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
    description: 'Skip the ATS. Direct referrals from verified employees at Google, Microsoft & 500+ MNCs.',
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
