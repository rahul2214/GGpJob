import type { Metadata } from 'next';
import { SITE_URL, siteUrl } from '@/lib/site';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';

// The stylesheet is handled by Next.js
import './globals.css';

import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '@/contexts/user-context';
import CareerAssistant from '@/components/chat/CareerAssistant';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { NetworkStatusIndicator } from '@/components/NetworkStatusIndicator';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

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
    'company jobs',
    'IT jobs',
    'software jobs',
    'developer jobs',
    'engineering jobs',
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
    'direct hiring jobs',
  ],

  authors: [
    {
      name: 'JobsDart Team',
      url: SITE_URL,
    },
  ],

  creator: 'JobsDart',
  publisher: 'JobsDart',

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'JobsDart',

    title: 'JobsDart — Find Jobs, Build Your Resume & Grow Your Career',

    description:
      'Discover global, remote, and international jobs with JobsDart. Find opportunities, build ATS-friendly resumes, check ATS scores, and get AI-powered career recommendations.',

    images: [
      {
        url: siteUrl('/og-image.png'),
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

    images: [siteUrl('/og-image.png')],
  },

  // Only favicon.ico ships today. The 16x16/32x32 PNGs and apple-touch-icon
  // were declared but absent from public/, so every page load fired three 404s.
  // Re-add the entries alongside the files if those sizes are ever produced.
  icons: {
    icon: [{ url: '/favicon.ico' }],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const fbPixelId =
    process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  return (
    <html lang="en-IN" className="h-full">
      <head>
        {/* Performance */}

        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          rel="dns-prefetch"
          href="https://upload.wikimedia.org"
        />

        <link
          rel="dns-prefetch"
          href="https://ui-avatars.com"
        />

        {/* WebSite JSON-LD */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': `${SITE_URL}/#website`,

              name: 'JobsDart',

              // Brand queries arrive as one word and two; both must resolve here.
              alternateName: ['Jobs Dart', 'JobsDart.in', 'Jobs Dart Careers'],

              url: SITE_URL,

              description:
                'AI-powered global job portal for discovering jobs, building resumes, checking ATS scores, and getting personalized career recommendations.',

              publisher: {
                '@id': `${SITE_URL}/#organization`,
              },

              potentialAction: {
                '@type': 'SearchAction',

                target: {
                  '@type': 'EntryPoint',
                  urlTemplate:
                    `${SITE_URL}/jobs?search={search_term_string}`,
                },

                'query-input':
                  'required name=search_term_string',
              },
            }),
          }}
        />

        {/* Organization JSON-LD */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': `${SITE_URL}/#organization`,

              name: 'JobsDart',

              alternateName: ['Jobs Dart', 'JobsDart.in', 'Jobs Dart Careers'],

              url: SITE_URL,

              logo: {
                '@type': 'ImageObject',
                url: siteUrl('/og-image.png'),
              },

              description:
                'JobsDart is an AI-powered global job portal helping job seekers discover jobs, build ATS-friendly resumes, check ATS scores, and receive personalized career recommendations.',

              sameAs: [
                'https://www.instagram.com/jobsdartofficial',
                'https://www.linkedin.com/company/veltria',
              ],

              contactPoint: {
                '@type': 'ContactPoint',
                email: 'support@jobsdart.in',
                contactType: 'customer support',
                availableLanguage: ['English'],
              },
            }),
          }}
        />

        {/* WebApplication JSON-LD */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              '@id': `${SITE_URL}/#application`,

              name: 'JobsDart',

              url: SITE_URL,

              applicationCategory: 'BusinessApplication',

              applicationSubCategory: 'Job Search',

              operatingSystem: 'Web',

              description:
                'AI-powered job search and career platform for discovering global jobs, finding remote opportunities, building ATS-friendly resumes, checking ATS scores, and improving career opportunities.',

              publisher: {
                '@id': `${SITE_URL}/#organization`,
              },
            }),
          }}
        />

        {/* Theme Initializer */}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  localStorage.removeItem('theme');
                  document.documentElement.classList.remove('dark');
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* Google Analytics */}

        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />

            <Script
              id="google-analytics"
              strategy="afterInteractive"
            >
              {`
                window.dataLayer = window.dataLayer || [];

                function gtag() {
                  window.dataLayer.push(arguments);
                }

                gtag('js', new Date());

                gtag('config', '${gaMeasurementId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* Facebook Pixel */}

        {fbPixelId && (
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
          >
            {`
              !function(f,b,e,v,n,t,s)
              {
                if(f.fbq)return;
                n=f.fbq=function(){
                  n.callMethod ?
                  n.callMethod.apply(n,arguments) :
                  n.queue.push(arguments)
                };

                if(!f._fbq)f._fbq=n;

                n.push=n;
                n.loaded=!0;
                n.version='2.0';
                n.queue=[];

                t=b.createElement(e);
                t.async=!0;
                t.src=v;

                s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)
              }(
                window,
                document,
                'script',
                'https://connect.facebook.net/en_US/fbevents.js'
              );

              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </head>

      <body
        className={cn(
          'relative h-full font-sans antialiased bg-background text-foreground',
          inter.variable
        )}
      >
        <NetworkStatusIndicator />
        <UserProvider>
          <Suspense
            fallback={
              <div className="h-16 border-b bg-white/80 animate-pulse" />
            }
          >
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