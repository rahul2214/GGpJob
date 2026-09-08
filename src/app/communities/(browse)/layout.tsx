import type { Metadata } from 'next';
import Link from 'next/link';
import { siteUrl } from '@/lib/site';
import { supabaseAdmin } from '@/lib/supabase-admin';

// The page itself is a client component, so its metadata lives here. Scoped to
// this route group / leaf so sibling routes never inherit the canonical.
export const metadata: Metadata = {
  title: 'Career Communities — Connect With Recruiters & Job Seekers',
  description: 'Join free career communities on JobsDart. Share referrals, get resume feedback, follow direct hiring posts from recruiters, and discuss interviews with professionals in your field.',
  keywords: ['career communities', 'job referral community', 'tech community india', 'recruiter community', 'job seeker forum', 'referral jobs', 'interview discussion', 'resume feedback community', 'hiring updates', 'jobsdart communities', 'jobs dart'],
  alternates: { canonical: siteUrl('/communities') },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title: 'Career Communities on JobsDart — Connect With Recruiters & Job Seekers',
    description: 'Join free career communities on JobsDart. Share referrals, get resume feedback, follow direct hiring posts from recruiters, and discuss interviews with professionals in your field.',
    url: siteUrl('/communities'),
    siteName: 'JobsDart',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: siteUrl('/og-image.png'), width: 1200, height: 630, alt: 'JobsDart' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Career Communities on JobsDart — Connect With Recruiters & Job Seekers',
    description: 'Join free career communities on JobsDart. Share referrals, get resume feedback, follow direct hiring posts from recruiters, and discuss interviews with professionals in your field.',
    images: [siteUrl('/og-image.png')],
  },
};

/**
 * The community cards on this page are fetched client-side, so the server HTML
 * contains no anchors and crawlers had no way to reach any community page.
 * This renders the same destinations as plain server-side links — the same
 * approach used for the job landing pages.
 */
async function getCommunityLinks() {
  try {
    const { data, error } = await supabaseAdmin
      .from('communities')
      .select('id, name, category')
      .order('name', { ascending: true })
      .limit(200);

    if (error) {
      console.error('[COMMUNITIES_LINKS] Failed to load:', error.message);
      return [];
    }
    return (data || []) as Array<{ id: number; name: string; category: string | null }>;
  } catch (err) {
    console.error('[COMMUNITIES_LINKS] Unexpected error:', err);
    return [];
  }
}

export default async function CommunitiesBrowseLayout({ children }: { children: React.ReactNode }) {
  const communities = await getCommunityLinks();

  return (
    <>
      {children}

      {communities.length > 0 && (
        <nav
          aria-label="All communities"
          className="container max-w-6xl px-4 sm:px-6 pb-16 border-t border-slate-200/60 dark:border-slate-800/60 pt-10"
        >
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-5">
            Browse all communities
          </h2>
          <ul className="flex flex-wrap gap-2.5 list-none p-0">
            {communities.map(community => (
              <li key={community.id}>
                <Link
                  href={`/communities/${community.id}`}
                  className="inline-block px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  {community.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
