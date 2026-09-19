import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogIndexView, buildBlogMetadata } from '@/components/blog/blog-index-view';
import { getTotalPages, isValidPage } from '@/lib/blog';

/**
 * Pages two onward of the blog index.
 *
 * Page one is /blog and is deliberately not generated here — /blog/page/1 would
 * be a second address for identical content, which splits ranking signals for
 * no benefit. It 404s instead.
 */

type Props = { params: { page: string } };

/** Only real pages exist; anything else is a genuine 404, not a render. */
export const dynamicParams = false;

export function generateStaticParams() {
  const total = getTotalPages();
  // Starts at 2: page one is served by /blog.
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

function parsePage(raw: string): number | null {
  // Reject "02", "2.0", "+2" and similar, so one page has exactly one URL.
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const page = Number(raw);
  return isValidPage(page) && page > 1 ? page : null;
}

export function generateMetadata({ params }: Props): Metadata {
  const page = parsePage(params.page);
  if (!page) return { title: 'Career Blog', robots: { index: false, follow: true } };
  return buildBlogMetadata(page);
}

export default function BlogPaginatedPage({ params }: Props) {
  const page = parsePage(params.page);
  if (!page) notFound();
  return <BlogIndexView page={page} />;
}
