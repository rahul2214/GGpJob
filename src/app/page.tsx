import type { Metadata } from 'next';
import JobPortalHome from '@/components/home/JobPortalHome';
import HomeClientDashboard from '@/components/home/HomeClientDashboard';

export const metadata: Metadata = {
  metadataBase: new URL('https://jobsdart.in'),

  title: {
    default: 'JobsDart — Find Jobs, Build Your Resume & Grow Your Career',
    template: '%s | JobsDart',
  },

  description:
    'JobsDart is an AI-powered global job portal to discover jobs, find remote and international opportunities, build ATS-friendly resumes, check ATS scores, and get personalized career recommendations.',

  keywords: [
    'job portal',
    'job search',
    'find jobs',
    'latest jobs',
    'job vacancies',
    'career opportunities',
    'international jobs',
    'global jobs',
    'jobs abroad',
    'remote jobs',
    'work from home jobs',
    'MNC jobs',
    'IT jobs',
    'software jobs',
    'engineering jobs',
    'developer jobs',
    'finance jobs',
    'marketing jobs',
    'fresher jobs',
    'experienced jobs',
    'AI job search',
    'AI career assistant',
    'AI resume builder',
    'resume builder',
    'ATS resume checker',
    'ATS score checker',
    'ATS friendly resume',
    'resume optimization',
    'interview preparation',
    'career guidance',
    'job recommendations',
    'company jobs',
    'direct hiring jobs',
  ],

  authors: [
    {
      name: 'JobsDart',
      url: 'https://jobsdart.in',
    },
  ],

  creator: 'JobsDart',
  publisher: 'JobsDart',

  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://jobsdart.in',
    siteName: 'JobsDart',
    title: 'JobsDart — Find Jobs, Build Your Resume & Grow Your Career',
    description:
      'Discover global, remote, and international jobs with JobsDart. Find opportunities, build ATS-friendly resumes, check ATS scores, and get AI-powered career recommendations.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JobsDart — AI-Powered Global Job Portal',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'JobsDart — Find Jobs & Grow Your Career',
    description:
      'Discover global and remote jobs, build ATS-friendly resumes, check ATS scores, and get AI-powered career recommendations with JobsDart.',
    images: ['/og-image.png'],
  },

  category: 'Jobs and Careers',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-[hsl(220_65%_6%)]">
      <HomeClientDashboard fallback={<JobPortalHome />} />
    </main>
  );
}