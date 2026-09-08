import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { siteUrl } from '@/lib/site';

type Props = { params: { id: string } };

/**
 * The community page itself is a client component, so its metadata lives here.
 *
 * Two problems this fixes:
 *  - Every community resolves at both /communities/<numeric id> and
 *    /communities/<uuid>, so without a canonical the same content was
 *    indexable at two URLs. The numeric id is what the app itself navigates
 *    to, so that form is declared canonical for both.
 *  - The page previously inherited the generic site-wide title, which made
 *    every community look identical in search results.
 */
async function getCommunity(id: string) {
  const isNumeric = /^\d+$/.test(id);

  const { data, error } = await supabaseAdmin
    .from('communities')
    .select('id, uuid, name, description, category')
    .eq(isNumeric ? 'id' : 'uuid', isNumeric ? Number(id) : id)
    .maybeSingle();

  if (error) {
    console.error('[COMMUNITY_META] Failed to load community:', error.message);
    return null;
  }
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const community = await getCommunity(params.id);

  if (!community) {
    return {
      title: 'Community Not Found',
      robots: { index: false, follow: true },
    };
  }

  // Always the numeric-id form, whichever identifier was requested.
  const canonical = siteUrl(`/communities/${community.id}`);
  const name = community.name as string;
  const raw = (community.description as string | null) || '';
  const description = raw
    ? `${raw.replace(/\s+/g, ' ').trim().slice(0, 150)}`
    : `Join the ${name} community on JobsDart to share referrals, ask questions and follow hiring updates from recruiters and other professionals.`;

  return {
    title: `${name} Community`,
    description,
    keywords: [
      `${name} community`,
      `${name} jobs`,
      ...(community.category ? [`${community.category} community`] : []),
      'career community',
      'job referrals',
      'jobsdart communities',
    ],
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      title: `${name} Community | JobsDart`,
      description,
      url: canonical,
      siteName: 'JobsDart',
      type: 'website',
      locale: 'en_IN',
      images: [{ url: siteUrl('/og-image.png'), width: 1200, height: 630, alt: `${name} community` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} Community | JobsDart`,
      description,
      images: [siteUrl('/og-image.png')],
    },
  };
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
