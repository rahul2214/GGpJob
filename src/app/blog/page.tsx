import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock, BookOpen, ScanSearch, FileText, Briefcase } from 'lucide-react';
import { SITE_URL, siteUrl } from '@/lib/site';
import { getAllPosts, categoryStyle } from '@/lib/blog-posts';

const PAGE_URL = siteUrl('/blog');
const OG_IMAGE = siteUrl('/og-image.png');

export const metadata: Metadata = {
  // The root layout appends " | JobsDart" via its title template.
  title: 'Career Blog — AI, Resumes, Interviews & Hiring',
  description:
    'Practical guides on AI and careers: using AI in your job search, beating applicant tracking systems, writing resumes that stay specific, and preparing for interviews.',
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
  alternates: { canonical: PAGE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title: 'Career Blog — AI, Resumes, Interviews & Hiring | JobsDart',
    description:
      'Practical guides on AI and careers: AI in your job search, beating applicant tracking systems, resume writing and interview preparation.',
    url: PAGE_URL,
    siteName: 'JobsDart',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'JobsDart career blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Career Blog — AI, Resumes, Interviews & Hiring',
    description: 'Practical guides on AI and careers, resumes, ATS screening and interviews.',
    images: [OG_IMAGE],
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;
  const categories = Array.from(new Set(posts.map(p => p.category)));

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${PAGE_URL}#blog`,
    name: 'JobsDart Career Blog',
    url: PAGE_URL,
    description:
      'Practical guides on AI and careers, resume writing, applicant tracking systems and interview preparation.',
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    blogPost: posts.map(post => ({
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
      { '@type': 'ListItem', position: 2, name: 'Blog', item: PAGE_URL },
    ],
  };

  const featuredStyle = categoryStyle(featured.category);

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

      {/* Hero: plain page background, no gradient wash or decorative orbs. */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
        <div className="container max-w-5xl px-4 sm:px-6 pt-14 pb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-3 duration-500">
            Career guides
          </h1>

          <p
            className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-500"
            style={{ animationDelay: '80ms', animationFillMode: 'backwards' }}
          >
            Practical, honest writing on using AI in a job search, getting past applicant tracking
            systems, and building a resume that still sounds like you.
          </p>

          <p
            className="mt-6 text-sm font-semibold text-slate-500 dark:text-slate-400 animate-in fade-in duration-500"
            style={{ animationDelay: '140ms', animationFillMode: 'backwards' }}
          >
            {posts.length} guides · {categories.join(' · ')}
          </p>
        </div>
      </header>

      <div className="container max-w-5xl px-4 sm:px-6 pt-12 pb-24">
        {/* ── Featured post ── */}
        <article
          className="animate-in fade-in slide-in-from-bottom-6 duration-700"
          style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}
        >
          <Link
            href={`/blog/${featured.slug}`}
            className={`group block rounded-3xl overflow-hidden bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 shadow-xl shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${featuredStyle.ring}`}
          >
            <div className={`h-1.5 bg-gradient-to-r ${featuredStyle.gradient}`} />
            <div className="p-7 sm:p-9">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest">
                  Latest
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${featuredStyle.pill}`}>
                  {featured.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  {featured.readingMinutes} min read
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {featured.heading}
              </h2>

              <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                {featured.excerpt}
              </p>

              <span className={`mt-6 inline-flex items-center gap-2 text-sm font-bold ${featuredStyle.text}`}>
                Read the guide
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </article>

        {/* ── Remaining posts ── */}
        <div className="mt-8 grid sm:grid-cols-2 gap-6">
          {rest.map((post, idx) => {
            const style = categoryStyle(post.category);
            return (
              <article
                key={post.slug}
                className="animate-in fade-in slide-in-from-bottom-6 duration-700"
                style={{ animationDelay: `${380 + idx * 80}ms`, animationFillMode: 'backwards' }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className={`group flex h-full flex-col rounded-3xl overflow-hidden bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${style.ring}`}
                >
                  <div className={`h-1 bg-gradient-to-r ${style.gradient}`} />
                  <div className="flex flex-col flex-1 p-6">
                    <div className="flex flex-wrap items-center gap-2.5 mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${style.pill}`}>
                        {post.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readingMinutes} min
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {post.heading}
                    </h2>

                    <p className="mt-2.5 flex-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-bold ${style.text}`}>
                      Read more
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        {/* ── Tool CTA ── */}
        <section className="mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-7 sm:p-9">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Put the advice to work
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            Reading about ATS screening helps. Running your actual resume through one helps more.
          </p>

          <div className="mt-7 grid sm:grid-cols-3 gap-3">
            {[
              { href: '/ats-score', label: 'ATS resume checker', sub: 'Score against a real job description', icon: ScanSearch },
              { href: '/resume-builder', label: 'AI resume builder', sub: 'Parse-safe templates, free PDF', icon: FileText },
              { href: '/jobs', label: 'Browse jobs', sub: 'Apply directly to the hiring team', icon: Briefcase },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors duration-200"
              >
                <item.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2.5" />
                <span className="block text-sm font-bold text-slate-900 dark:text-white">{item.label}</span>
                <span className="block mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.sub}</span>
                <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-2.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400 font-semibold">
          <BookOpen className="w-4 h-4" />
          New guides added regularly
        </p>
      </div>
    </>
  );
}
