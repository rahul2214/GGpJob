import Link from "next/link";
import { MessageSquare, Handshake, Megaphone, ShieldCheck } from "lucide-react";
import { siteUrl } from "@/lib/site";
import { listCommunities, jsonLdScript, communityPath } from "@/lib/communities-server";
import { CommunitiesBrowser } from "./communities-browser";

// The Supabase admin client fetches with no-store, and the data helpers catch
// errors, so a build-time prerender could silently bake in an empty page.
// Render per request instead, as the sitemap does.
export const dynamic = 'force-dynamic';

const FAQS = [
  {
    q: "Are JobsDart communities free to join?",
    a: "Yes. Every community is free for job seekers. Create a free account, then join as many communities as you like.",
  },
  {
    q: "What can I post in a community?",
    a: "Questions, discussions, interview experiences, resume review requests and useful resources. Posts should be relevant to the community's topic and follow the community guidelines.",
  },
  {
    q: "Can I ask for a job referral?",
    a: "Yes. Many members share and request referrals. Include the role, your experience and a link to the job so others can help quickly.",
  },
  {
    q: "Is my personal information visible to other members?",
    a: "Other members see your name and what you post. Your email address, phone number and resume are not shown in communities.",
  },
];

const FEATURES = [
  { icon: Handshake, title: "Referrals", body: "Ask for and share referrals with people working at the companies you want to join." },
  { icon: MessageSquare, title: "Interview experiences", body: "Read real interview rounds and questions, and share your own to help others." },
  { icon: Megaphone, title: "Hiring updates", body: "Follow openings and hiring news in your field, company or country." },
  { icon: ShieldCheck, title: "Moderated & safe", body: "Report spam or scams in one click. Moderators review every report." },
];

export default async function CommunitiesPage() {
  const communities = await listCommunities();
  const totalMembers = communities.reduce((sum, c) => sum + c.memberCount, 0);
  const categories = new Set(communities.map(c => c.category)).size;
  const pageUrl = siteUrl("/communities");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Career Communities on JobsDart",
      description: "Free professional communities for job seekers: referrals, interview experiences, resume reviews and hiring updates.",
      url: pageUrl,
      isPartOf: { "@type": "WebSite", name: "JobsDart", url: siteUrl("/") },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: communities.length,
        itemListElement: communities.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: siteUrl(communityPath(c)),
          name: `${c.name} Community`,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Communities", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }} />
      ))}

      <header className="border-b border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="container max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-slate-900 dark:text-white">Communities</li>
            </ol>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Career communities for job seekers
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
              Join free communities by technology, career stage, company and country. Ask for referrals, share interview
              experiences, get resume feedback and follow hiring updates from people in your field.
            </p>
          </div>
          {communities.length > 0 && (
            <dl className="mt-8 grid max-w-xl grid-cols-3 gap-4">
              {[
                { label: "Communities", value: communities.length },
                { label: "Members", value: totalMembers },
                { label: "Categories", value: categories },
              ].map(stat => (
                <div key={stat.label}>
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</dt>
                  <dd className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{stat.value.toLocaleString()}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      <div className="container max-w-6xl space-y-14 px-4 pt-10 sm:px-6">
        {communities.length > 0 ? (
          <CommunitiesBrowser
            initialCommunities={communities.map(c => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
              description: c.description,
              category: c.category,
              icon: c.icon,
              memberCount: c.memberCount,
            }))}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200/70 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-900 dark:text-white">Communities are temporarily unavailable</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Please refresh the page in a moment.</p>
          </div>
        )}

        <section aria-labelledby="why-heading">
          <h2 id="why-heading" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            What you can do in JobsDart communities
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-2xl border border-slate-200/70 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq-heading" className="max-w-3xl">
          <h2 id="faq-heading" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Frequently asked questions
          </h2>
          <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200/70 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {FAQS.map(f => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900 dark:text-white">
                  {f.q}
                  <span aria-hidden="true" className="text-slate-400 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
