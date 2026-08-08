import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/contexts/user-context';
import { Suspense } from 'react';
import CareerAssistant from '@/components/chat/CareerAssistant';
import ReferralTracker from '@/components/referral-tracker';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'JobsDart — Get Referred by Insiders at Top MNCs India',
    template: '%s | JobsDart',
  },
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
  authors: [{ name: 'JobsDart Team' }],
  creator: 'JobsDart',
  publisher: 'Veltria',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://jobsdart.in'),
  openGraph: {
    title: 'JobsDart — Get Referred by Insiders at Top MNCs',
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
    title: 'JobsDart — Get Referred by Insiders at Top MNCs',
    description: 'Find jobs faster with JobsDart, an AI-powered job portal for job seekers. Discover global jobs, build your resume, check ATS scores, and get hired.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://jobsdart.in',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'JobsDart',
              url: 'https://jobsdart.in',
              description: "Skip the ATS. Connect with verified employees at Google, Microsoft, Amazon & 500+ MNCs for direct referrals.",
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://jobsdart.in/jobs?search={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  localStorage.removeItem('theme');
                  document.documentElement.classList.remove('dark');
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className={cn('relative h-full font-sans antialiased bg-background text-foreground', inter.variable)}>
        <UserProvider>
          <ReferralTracker />
          <Suspense fallback={<div className="h-16 border-b bg-white/80 animate-pulse" />}>
            <DashboardShell>
              {children}
            </DashboardShell>
          </Suspense>
          <Toaster />
          <CareerAssistant />
        </UserProvider>
      </body>
    </html>
  );
}
