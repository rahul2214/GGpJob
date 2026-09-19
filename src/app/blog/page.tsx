import type { Metadata } from 'next';
import { BlogIndexView, buildBlogMetadata } from '@/components/blog/blog-index-view';

/**
 * Page one of the blog index.
 *
 * Pages two onward live at /blog/page/[page]; page one deliberately has no
 * numbered URL so there is only ever one address for this content.
 */

export const metadata: Metadata = buildBlogMetadata(1);

export default function BlogIndexPage() {
  return <BlogIndexView page={1} />;
}
