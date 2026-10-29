import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ScanSearch, Briefcase, FileText } from "lucide-react";
import { siteUrl } from "@/lib/site";
import { getCommunity, listCommunities, listCommunityPosts, jsonLdScript, excerpt, communityPath, communityPostPath } from "@/lib/communities-server";
import { CommunityIcon } from "@/components/communities/community-ui";
import { CommunityView } from "./community-view";

// The Supabase admin client fetches with no-store, and the data helpers catch
// errors, so a build-time prerender could silently bake in an empty page.
// Render per request instead, as the sitemap does.
export const dynamic = 'force-dynamic';

const GUIDELINES = [
  "Stay on topic and be respectful.",
  "No spam, self-promotion or paid referral schemes.",
  "Never share passwords, OTPs or payment details.",
  "Report fake job offers so moderators can remove them.",
];

export default async function CommunityPage({ params }: { params: { id: string } }) {
  const community = await getCommunity(params.id);
  if (!community) notFound();
  // Old numeric-id, uuid and typed-name links all land on the slug URL.
  if (params.id !== community.slug) permanentRedirect(communityPath(community));

  const [posts, all] = await Promise.all([listCommunityPosts(community.id, 50), listCommunities()]);
  const related = all
    .filter(c => c.id !== community.id && c.category === community.category)
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 5);

  const url = siteUrl(communityPath(community));
  const description = community.description || `Discuss jobs, referrals and interviews with the ${community.name} community on JobsDart.`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${community.name} Community`,
      description,
      url,
      isPartOf: { "@type": "WebSite", name: "JobsDart", url: siteUrl("/") },
      about: { "@type": "Thing", name: community.name },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: posts.length,
        itemListElement: posts.slice(0, 20).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: siteUrl(communityPostPath(community, p.id)),
          name: p.title,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Communities", item: siteUrl("/communities") },
        { "@type": "ListItem", position: 3, name: community.name, item: url },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }} />
      ))}

      <div className="container max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/communities" className="hover:text-slate-900 dark:hover:text-white">Communities</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="truncate font-medium text-slate-900 dark:text-white">{community.name}</li>
          </ol>
        </nav>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-6 lg:col-span-8">
            <CommunityView
              initialCommunity={{
                id: community.id,
                slug: community.slug,
                name: community.name,
                description: community.description,
                category: community.category,
                icon: community.icon,
                memberCount: community.memberCount,
                createdAt: community.createdAt,
              }}
              initialPosts={posts.map(p => ({
                id: p.id,
                communityId: p.communityId,
                authorUuid: p.authorUuid,
                author: p.author,
                title: p.title,
                content: excerpt(p.content, 400),
                postType: p.postType,
                isPinned: p.isPinned,
                isSolved: p.isSolved,
                commentCount: p.commentCount,
                likesCount: p.likesCount,
                createdAt: p.createdAt,
              }))}
            />
          </div>

          <aside className="min-w-0 space-y-6 lg:col-span-4" aria-label="About this community">
            <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Community guidelines</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {GUIDELINES.map((g, i) => (
                  <li key={g} className="flex gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{i + 1}</span>
                    {g}
                  </li>
                ))}
              </ul>
            </section>

            {related.length > 0 && (
              <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Related communities</h2>
                <ul className="mt-3 space-y-1">
                  {related.map(c => (
                    <li key={c.id}>
                      <Link href={communityPath(c)} className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                          <CommunityIcon name={c.icon} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{c.name}</span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">{c.memberCount.toLocaleString()} {c.memberCount === 1 ? "member" : "members"}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/communities" className="mt-3 inline-block text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">
                  Browse all communities
                </Link>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Job search tools</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {[
                  { href: "/jobs", icon: Briefcase, label: "Find jobs" },
                  { href: "/ats-score", icon: ScanSearch, label: "Free ATS resume checker" },
                  { href: "/resume-builder", icon: FileText, label: "AI resume builder" },
                ].map(({ href, icon: Icon, label }) => (
                  <li key={href}>
                    <Link href={href} className="flex items-center gap-2.5 rounded-lg p-2 text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60">
                      <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" /> {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
