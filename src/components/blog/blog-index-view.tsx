import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, ScanSearch, FileText, Briefcase } from 'lucide-react';
import { SITE_URL, siteUrl } from '@/lib/site';
import {
  getAllPosts,
  getPostSummaries,
  getPageSummaries,
  getPagePosts,
  getTotalPages,
} from '@/lib/blog';
import { BlogExplorer } from '@/components/blog/blog-explorer';

/**
 * The blog index, shared by /blog (page 1) and /blog/page/[page].
 *
 * A server component: metadata, JSON-LD and static prerendering all depend on
 * the page staying off the client. Only the explorer below is interactive.
 */

const OG_IMAGE = siteUrl('/og-image.png');

/** /blog for page one, /blog/page/N after that — page one has no suffix. */
export function blogPageUrl(page: number): string {
  return page <= 1 ? siteUrl('/blog') : siteUrl(`/blog/page/${page}`);
}

/**
 * Metadata for one index page.
 *
 * Each page canonicalises to itself rather than to page 1. Pointing them all at
 * /blog would tell Google the deeper pages are duplicates and it would stop
 * following them, which is exactly how paginated posts fall out of an index.
 */
export function buildBlogMetadata(page: number): Metadata {
  const totalPages = getTotalPages();
  const url = blogPageUrl(page);
  const suffix = page > 1 ? ` — Page ${page} of ${totalPages}` : '';

  const title = `Career Blog — AI, Resumes, Interviews & Hiring${suffix}`;
  const description =
    page > 1
      ? `More practical guides on AI and careers, resumes, applicant tracking systems and interview preparation. Page ${page} of ${totalPages}.`
      : 'Practical guides on AI and careers: using AI in your job search, beating applicant tracking systems, writing resumes that stay specific, and preparing for interviews.';

  return {
    // The root layout appends " | JobsDart" via its title template.
    title,
    description,
    keywords: [
      'career blog',
      'job search blog',
      'ai and jobs',
      'ai career advice',
      'resume tips',
      'ats tips',
      'interview preparation',
      'job search advice',
      'career guidance india',
      'jobsdart blog',
      'jobs dart',
    ],
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      title: `${title} | JobsDart`,
      description,
      url,
      siteName: 'JobsDart',
      type: 'website',
      locale: 'en_IN',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'JobsDart career blog' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'Practical guides on AI and careers, resumes, ATS screening and interviews.',
      images: [OG_IMAGE],
    },
  };
}

const TOOLS = [
  {
    href: '/ats-score',
    label: 'ATS resume checker',
    sub: 'Score your resume against a real job description',
    icon: ScanSearch,
  },
  {
    href: '/resume-builder',
    label: 'AI resume builder',
    sub: 'Parse-safe templates, free PDF export',
    icon: FileText,
  },
  {
    href: '/jobs',
    label: 'Browse jobs',
    sub: 'Apply directly to the hiring team',
    icon: Briefcase,
  },
];

export function BlogIndexView({ page }: { page: number }) {
  const allPosts = getAllPosts();
  const totalPages = getTotalPages();

  // Every page carries all summaries so search spans the whole blog; only this
  // page's slice is rendered when nobody is searching.
  const allSummaries = getPostSummaries();
  const pageSummaries = getPageSummaries(page);

  const lastUpdated = allPosts.reduce(
    (latest, p) => (p.updatedAt > latest ? p.updatedAt : latest),
    allPosts[0]?.updatedAt ?? ''
  );

  // Only the posts on this page, so the markup describes what is actually here.
  const postsOnThisPage = getPagePosts(page);

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${blogPageUrl(page)}#blog`,
    name: 'JobsDart Career Blog',
    url: blogPageUrl(page),
    description:
      'Practical guides on AI and careers, resume writing, applicant tracking systems and interview preparation.',
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    blogPost: postsOnThisPage.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url: siteUrl(`/blog/${post.slug}`),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: { '@type': 'Organization', name: post.author },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: siteUrl('/blog') },
      ...(page > 1
        ? [{ '@type': 'ListItem', position: 3, name: `Page ${page}`, item: blogPageUrl(page) }]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950">
        {/* Decorative orbs. Hidden from assistive tech and from the print view. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 w-[26rem] h-[26rem] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-3xl animate-orb-drift motion-reduce:animate-none"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 right-0 w-[22rem] h-[22rem] rounded-full bg-violet-400/20 dark:bg-violet-600/10 blur-3xl animate-orb-drift motion-reduce:animate-none"
          style={{ animationDelay: '3s' }}
        />

        <div className="relative container max-w-6xl px-4 sm:px-6 pt-16 pb-14 sm:pt-20 sm:pb-16">
          <h1
            className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-3 duration-500"
            style={{ animationDelay: '60ms', animationFillMode: 'backwards' }}
          >
            Career guides that
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
              respect your time
            </span>
          </h1>

          <p
            className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400 animate-in fade-in slide-in-from-bottom-3 duration-500"
            style={{ animationDelay: '120ms', animationFillMode: 'backwards' }}
          >
            Practical, honest writing on using AI in a job search, getting past applicant tracking
            systems, and building a career you can explain in an interview.
          </p>

          <div
            className="mt-9 flex flex-wrap items-center gap-3 animate-in fade-in duration-500"
            style={{ animationDelay: '180ms', animationFillMode: 'backwards' }}
          >
            {lastUpdated && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-800 shadow-sm">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping motion-reduce:animate-none" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Updated{' '}
                  <time dateTime={lastUpdated}>
                    {new Date(lastUpdated).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Explorer ───────────────────────────────────────────────────── */}
      <div className="container max-w-6xl px-4 sm:px-6 pb-24">
        <BlogExplorer
          allPosts={allSummaries}
          pagePosts={pageSummaries}
          page={page}
          totalPages={totalPages}
        />

        {/* ── Tool CTA ─────────────────────────────────────────────────── */}
        <section className="relative mt-20 overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-11 shadow-2xl shadow-indigo-500/10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"
          />

          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Put the advice to work
            </h2>
            <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
              Reading about ATS screening helps. Running your actual resume through one helps more.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {TOOLS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10"
                >
                  {/* Diagonal sheen on hover. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                  <span className="relative grid w-9 h-9 place-items-center rounded-xl bg-indigo-500/15 border border-indigo-400/20">
                    <item.icon className="w-4 h-4 text-indigo-300" />
                  </span>
                  <span className="relative mt-3.5 block text-sm font-bold text-white">
                    {item.label}
                  </span>
                  <span className="relative mt-1 block text-xs leading-relaxed text-slate-400">
                    {item.sub}
                  </span>
                  <ArrowRight className="relative mt-3 w-4 h-4 text-indigo-300 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <p className="mt-10 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
          <BookOpen className="w-4 h-4" />
          New guides added regularly
        </p>
      </div>
    </>
  );
}
