import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/header';
import Footer from '@/components/footer';
import { UserProvider } from '@/contexts/user-context';
import { Suspense } from 'react';
import CareerAssistant from '@/components/chat/CareerAssistant';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'JobsDart — Get Referred by Insiders at Google, Microsoft & Top MNCs',
    template: '%s | JobsDart',
  },
  description: 'Skip the ATS black hole. JobsDart connects you with verified employees at 500+ MNCs for direct referrals and insider hiring. India\'s referral-first job platform.',
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
    title: 'JobsDart — Get Referred by Insiders at Top MNCs',
    description: 'Skip the ATS. Direct referrals from verified employees at Google, Microsoft & 500+ MNCs.',
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
      <head />
      <body className={cn('relative h-full font-sans antialiased', inter.variable)}>
        <UserProvider>
          <div className="flex flex-col min-h-screen">
            <Suspense fallback={<div className="h-16 border-b bg-card" />}>
              <Header />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <CareerAssistant />
        </UserProvider>
      </body>
    </html>
  );
}