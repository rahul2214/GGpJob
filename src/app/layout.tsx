import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';

// The stylesheet is handled by Next.js; suppress TypeScript's missing CSS module declaration.
// @ts-expect-error -- CSS side-effect imports are resolved by the Next.js bundler.
import './globals.css';

import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '@/contexts/user-context';
import CareerAssistant from '@/components/chat/CareerAssistant';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

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
      url: 'https://jobsdart.in',
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
    canonical: 'https://jobsdart.in',
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
        url: 'https://jobsdart.in/og-image.png',
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

    images: ['https://jobsdart.in/og-image.png'],
  },

  icons: {
    icon: [
      { url: '/favicon.ico' },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
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
              '@id': 'https://jobsdart.in/#website',

              name: 'JobsDart',

              url: 'https://jobsdart.in',

              description:
                'AI-powered global job portal for discovering jobs, building resumes, checking ATS scores, and getting personalized career recommendations.',

              publisher: {
                '@id': 'https://jobsdart.in/#organization',
              },

              potentialAction: {
                '@type': 'SearchAction',

                target: {
                  '@type': 'EntryPoint',
                  urlTemplate:
                    'https://jobsdart.in/jobs?search={search_term_string}',
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
              '@id': 'https://jobsdart.in/#organization',

              name: 'JobsDart',

              url: 'https://jobsdart.in',

              logo: {
                '@type': 'ImageObject',
                url: 'https://jobsdart.in/og-image.png',
              },

              description:
                'JobsDart is an AI-powered global job portal helping job seekers discover jobs, build ATS-friendly resumes, check ATS scores, and receive personalized career recommendations.',

              sameAs: [
                'https://www.facebook.com/jobsdart.in',
                'https://www.instagram.com/jobsdart.in',
                'https://www.youtube.com/@jobsdart',
                'https://www.linkedin.com/company/jobsdart',
                'https://x.com/jobsdart',
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
              '@id': 'https://jobsdart.in/#application',

              name: 'JobsDart',

              url: 'https://jobsdart.in',

              applicationCategory: 'BusinessApplication',

              applicationSubCategory: 'Job Search',

              operatingSystem: 'Web',

              description:
                'AI-powered job search and career platform for discovering global jobs, finding remote opportunities, building ATS-friendly resumes, checking ATS scores, and improving career opportunities.',

              publisher: {
                '@id': 'https://jobsdart.in/#organization',
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