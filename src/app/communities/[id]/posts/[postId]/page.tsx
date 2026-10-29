import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { siteUrl } from "@/lib/site";
import { getCommunity, getCommunityPost, listPostComments, listCommunityPosts, jsonLdScript, excerpt, communityPath, communityPostPath } from "@/lib/communities-server";
import { PostTypeBadge } from "@/components/communities/community-ui";
import { PostView } from "./post-view";

// The Supabase admin client fetches with no-store, and the data helpers catch
// errors, so a build-time prerender could silently bake in an empty page.
// Render per request instead, as the sitemap does.
export const dynamic = 'force-dynamic';

type Props = { params: { id: string; postId: string } };

/** Only plain web links are rendered; anything else (javascript:, data:) is dropped. */
function safeLink(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default async function CommunityPostPage({ params }: Props) {
  const post = await getCommunityPost(params.postId);
  if (!post) notFound();

  const [community, comments, siblings] = await Promise.all([
    getCommunity(String(post.communityId)),
    listPostComments(post.id),
    listCommunityPosts(post.communityId, 6),
  ]);
  if (!community) notFound();

  // One URL per post: old numeric community ids, uuids and posts reached
  // through the wrong community all land on /communities/<slug>/posts/<id>.
  if (params.id !== community.slug || params.postId !== String(post.id)) {
    permanentRedirect(communityPostPath(community, post.id));
  }

  const url = siteUrl(communityPostPath(community, post.id));
  const more = siblings.filter(p => p.id !== post.id).slice(0, 5);

  // Google's recommended markup for forum threads.
  const discussionJsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "@id": url,
    url,
    mainEntityOfPage: url,
    headline: post.title.slice(0, 110),
    text: post.content,
    datePublished: post.createdAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    author: { "@type": "Person", name: post.author.name },
    isPartOf: { "@type": "WebPage", name: `${community.name} Community`, url: siteUrl(communityPath(community)) },
    interactionStatistic: [
      { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: post.likesCount },
      { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: comments.length },
    ],
    comment: comments.slice(0, 50).map(c => ({
      "@type": "Comment",
      text: c.content,
      datePublished: c.createdAt,
      author: { "@type": "Person", name: c.author.name },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Communities", item: siteUrl("/communities") },
      { "@type": "ListItem", position: 2, name: community.name, item: siteUrl(communityPath(community)) },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(discussionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }} />

      <div className="container max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/communities" className="hover:text-slate-900 dark:hover:text-white">Communities</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={communityPath(community)} className="hover:text-slate-900 dark:hover:text-white">{community.name}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="max-w-[16rem] truncate font-medium text-slate-900 sm:max-w-md dark:text-white">{post.title}</li>
          </ol>
        </nav>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-6 lg:col-span-8">
            <PostView
              communityName={community.name}
              communitySlug={community.slug}
              initialPost={{
                id: post.id,
                communityId: post.communityId,
                authorUuid: post.authorUuid,
                author: { name: post.author.name, role: post.author.role },
                title: post.title,
                content: post.content,
                postType: post.postType,
                externalLink: safeLink((post.metadata as any)?.external_link),
                isPinned: post.isPinned,
                isLocked: post.isLocked,
                likesCount: post.likesCount,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
              }}
              initialComments={comments.map(c => ({
                id: c.id,
                parentId: c.parentId,
                authorUuid: c.authorUuid,
                author: { name: c.author.name, role: c.author.role },
                content: c.content,
                isAccepted: c.isAccepted,
                createdAt: c.createdAt,
              }))}
            />
          </div>

          <aside className="min-w-0 space-y-6 lg:col-span-4" aria-label="More from this community">
            <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">About {community.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {excerpt(community.description || `Discuss jobs, referrals and interviews with the ${community.name} community.`, 220)}
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {community.memberCount.toLocaleString()} {community.memberCount === 1 ? "member" : "members"} · {community.category}
              </p>
              <Link href={communityPath(community)} className="mt-3 inline-block text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">
                View community
              </Link>
            </section>

            {more.length > 0 && (
              <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">More discussions</h2>
                <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {more.map(p => (
                    <li key={p.id} className="py-2.5 first:pt-0 last:pb-0">
                      <Link href={communityPostPath(community, p.id)} className="group block">
                        <span className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">{p.title}</span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <PostTypeBadge type={p.postType} className="px-1.5 py-0 text-[10px]" />
                          {p.commentCount} {p.commentCount === 1 ? "reply" : "replies"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
