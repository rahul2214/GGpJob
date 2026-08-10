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
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'JobsDart — Direct Hiring Jobs & Verified Employee Referrals India',
    template: '%s | JobsDart',
  },
  description: 'JobsDart connects job seekers directly with verified recruiters and MNC employee insiders. Discover global full stack engineering jobs, check ATS scores, and get hired fast.',
  keywords: [
    'hiring',
    'direct hiring',
    'recruiters',
    'global jobs',
    'verified recruiters',
    'full stack jobs',
    'employee referral jobs India',
    'bypass ATS India',
    'insider referral platform',
    'MNC jobs Bengaluru',
    'job referral Google Microsoft',
    'referral jobs 2026',
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
    title: 'JobsDart — Direct Hiring Jobs & Verified Employee Referrals',
    description: 'Connect directly with verified recruiters and employee insiders at Microsoft, Google, Amazon & 500+ MNCs for direct job hiring.',
    url: 'https://jobsdart.in',
    siteName: 'JobsDart',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JobsDart — Direct Hiring Jobs & Verified Employee Referrals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobsDart — Direct Hiring Jobs & Verified Employee Referrals',
    description: 'Discover global jobs, get referred by verified MNC employee insiders, and optimize your ATS resume.',
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
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-JOBPORTAL01';
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1234567890';

  return (
    <html lang="en-IN" className="h-full">
      <head>
        {/* Performance Preconnects for PageSpeed Insights */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://upload.wikimedia.org" />
        <link rel="dns-prefetch" href="https://ui-avatars.com" />

        {/* 1. WebSite JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'JobsDart',
              url: 'https://jobsdart.in',
              description: "Direct hiring platform connecting job seekers with verified recruiters and employee insiders at Google, Microsoft, Amazon & 500+ MNCs.",
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://jobsdart.in/jobs?search={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* 2. Identity / Organization JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'JobsDart',
              url: 'https://jobsdart.in',
              logo: 'https://jobsdart.in/og-image.png',
              description: 'AI-powered job portal & employee referral platform connecting candidates directly with verified recruiters and MNC employee insiders.',
              sameAs: [
                'https://www.facebook.com/jobsdart.in',
                'https://www.instagram.com/jobsdart.in',
                'https://www.youtube.com/@jobsdart',
                'https://www.linkedin.com/company/jobsdart',
                'https://x.com/jobsdart'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'support@jobsdart.in',
                contactType: 'customer support',
                availableLanguage: ['English', 'Hindi']
              }
            }),
          }}
        />

        {/* 3. GEO / LocalBusiness JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'JobsDart Headquarters',
              image: 'https://jobsdart.in/og-image.png',
              '@id': 'https://jobsdart.in/#localbusiness',
              url: 'https://jobsdart.in',
              telephone: '+91-80-49201000',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'MG Road, Tech Hub',
                addressLocality: 'Bengaluru',
                addressRegion: 'Karnataka',
                postalCode: '560001',
                addressCountry: 'IN'
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 12.9716,
                longitude: 77.5946
              },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '09:00',
                closes: '18:00'
              },
              priceRange: '₹0 - ₹999'
            }),
          }}
        />

        {/* Theme Initializer */}
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

        {/* Google Analytics 4 (GA4) Tracking Script */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        {/* Facebook Meta Pixel Tracking Script */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
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
