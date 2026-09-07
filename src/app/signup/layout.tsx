import type { Metadata } from 'next';
import { Suspense } from 'react';
import { siteUrl } from '@/lib/site';

// The signup page is a client component, so its metadata lives here.
export const metadata: Metadata = {
    title: 'Create a Free Job Seeker Account',
    description:
        'Sign up free on JobsDart to apply for jobs directly, build an ATS-friendly resume, check your ATS score and get AI-powered job recommendations matched to your profile.',
    keywords: [
        'jobsdart signup',
        'jobs dart register',
        'create job seeker account',
        'free job portal registration',
        'register for jobs',
        'job search account',
    ],
    alternates: { canonical: siteUrl('/signup') },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
        title: 'Create a Free Job Seeker Account on JobsDart',
        description:
            'Sign up free to apply for jobs directly, build an ATS-friendly resume and get AI-powered job recommendations.',
        url: siteUrl('/signup'),
        siteName: 'JobsDart',
        type: 'website',
        locale: 'en_IN',
        images: [{ url: siteUrl('/og-image.png'), width: 1200, height: 630, alt: 'JobsDart' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Create a Free Job Seeker Account on JobsDart',
        description:
            'Sign up free to apply for jobs directly, build an ATS-friendly resume and get AI-powered job recommendations.',
        images: [siteUrl('/og-image.png')],
    },
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <Suspense fallback={null}>{children}</Suspense>;
}
