import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteUrl } from '@/lib/site';
import { getCommunity, getCommunityPost, excerpt, communityPostPath, MIN_INDEXABLE_POST_CHARS } from '@/lib/communities-server';

type Props = { params: { id: string; postId: string } };

/**
 * Per-post metadata. Without it every discussion inherited the community's
 * title and canonical, so search engines saw dozens of pages claiming to be
 * the same URL and indexed none of the threads.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getCommunityPost(params.postId);
  // Missing posts get a real 404; the page itself redirects non-canonical URLs.
  if (!post) notFound();

  const community = await getCommunity(String(post.communityId));
  if (!community) notFound();
  const communityName = community.name;
  const canonical = siteUrl(communityPostPath(community, post.id));
  const title = { absolute: `${post.title.slice(0, 60)} — ${communityName} Community | JobsDart` };
  const description = excerpt(post.content, 155) || `A discussion in the ${communityName} community on JobsDart.`;
  // Very thin threads add little value to search results; keep them reachable
  // but out of the index until the conversation has some substance.
  const thin = post.content.trim().length < MIN_INDEXABLE_POST_CHARS;

  return {
    title,
    description,
    alternates: { canonical },
    robots: thin
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1 } },
    openGraph: {
      title: post.title,
      description,
      url: canonical,
      siteName: 'JobsDart',
      type: 'article',
      publishedTime: post.createdAt,
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      images: [{ url: siteUrl('/og-image.png'), width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [siteUrl('/og-image.png')],
    },
  };
}

export default function CommunityPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
