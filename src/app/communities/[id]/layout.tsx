import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteUrl } from '@/lib/site';
import { getCommunity, communityPath } from '@/lib/communities-server';

type Props = { params: { id: string } };

/**
 * Metadata for a community page.
 *
 * A community is addressed by a slug of its name (/communities/ai-machine-learning).
 * Numeric ids, uuids and typed names still resolve so older and shared links
 * keep working; the pages redirect them to the slug, which is the only form
 * declared canonical here. The redirect lives in the pages rather than this
 * shared layout so a nested post URL keeps its /posts/<id> part.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const community = await getCommunity(params.id);
  if (!community) notFound();

  const canonical = siteUrl(communityPath(community));
  const name = community.name;
  const raw = community.description || '';
  const description = raw
    ? raw.replace(/\s+/g, ' ').trim().slice(0, 155)
    : `Join the ${name} community on JobsDart to share referrals, ask questions and follow hiring updates from recruiters and other professionals.`;

  return {
    title: `${name} Community — Jobs, Referrals & Discussions`,
    description,
    keywords: [
      `${name} community`,
      `${name} jobs`,
      `${community.category} community`,
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
