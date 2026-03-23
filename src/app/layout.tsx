
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/header';
import Footer from '@/components/footer';
import { UserProvider } from '@/contexts/user-context';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Jobs Dart - Connect with Opportunity',
    template: '%s | Jobs Dart',
  },
  description: 'The premier platform for connecting talent with opportunity. Discover top jobs across software engineering, marketing, business, and more.',
  keywords: ['jobs', 'careers', 'hiring', 'recruitment', 'job search', 'job portal'],
  authors: [{ name: 'Jobs Dart Team' }],
  creator: 'Jobs Dart',
  publisher: 'Jobs Dart',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Jobs Dart - Connect with Opportunity',
    description: 'The premier platform for connecting talent with opportunity. Discover and apply for top jobs easily.',
    url: 'https://jobsdart.in', // Replace with your actual domain when launching
    siteName: 'Jobs Dart',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobs Dart - Connect with Opportunity',
    description: 'The premier platform for connecting talent with opportunity.',
  },
  icons: null,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
      </head>
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
        </UserProvider>
      </body>
    </html>
  );
}
