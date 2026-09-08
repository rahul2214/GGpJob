import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, ArrowRight, ArrowLeft, ListOrdered, HelpCircle, CalendarDays } from 'lucide-react';
import { SITE_URL, siteUrl } from '@/lib/site';
import {
  BLOG_POSTS,
  getPostBySlug,
  getRelatedPosts,
  wordCount,
  sectionId,
  categoryStyle,
  heroTint,
} from '@/lib/blog-posts';

type Props = { params: { slug: string } };

/**
 * Every post is known at build time, so prerender them all. Static pages were
 * the only ones that stayed reachable during the serverless outage, and an
 * article that cannot be crawled is worth nothing.
 *
 * Kept as a server component on purpose: the entrance animations below are CSS
 * (tailwindcss-animate), not framer-motion, so the full article text ships in
 * the initial HTML rather than appearing only after hydration.
 */
export function generateStaticParams() {
  return BLOG_POSTS.map(post => ({ slug: post.slug }));
}

/** A slug outside generateStaticParams is a real 404, not a dynamic render. */
export const dynamicParams = false;

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return { title: 'Article Not Found', robots: { index: false, follow: true } };
  }

  const canonical = siteUrl(`/blog/${post.slug}`);

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      title: `${post.title} | JobsDart`,
      description: post.description,
      url: canonical,
      siteName: 'JobsDart',
      type: 'article',
      locale: 'en_IN',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: [{ url: siteUrl('/og-image.png'), width: 1200, height: 630, alt: post.heading }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [siteUrl('/og-image.png')],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const canonical = siteUrl(`/blog/${post.slug}`);
  const related = getRelatedPosts(post);
  const style = categoryStyle(post.category);
  const published = new Date(post.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${canonical}#article`,
    headline: post.title,
    description: post.description,
    url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    wordCount: wordCount(post),
    articleSection: post.category,
    keywords: post.keywords.join(', '),
    inLanguage: 'en',
    image: siteUrl('/og-image.png'),
    author: { '@type': 'Organization', name: post.author, url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: siteUrl('/blog') },
      { '@type': 'ListItem', position: 3, name: post.heading, item: canonical },
    ],
  };

  // Only emit FAQ markup when the answers are actually rendered on the page.
  const faqJsonLd = post.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: post.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/*
        Hero: plain page background, no gradient wash or decorative orbs.
        The breadcrumb and the category pill both restated the same words that
        already sit in the title area, so they are gone; the BreadcrumbList
        structured data above still covers the SEO side.
      */}
      <header className={`border-b border-slate-200 dark:border-slate-800 ${heroTint(post.tint)}`}>
        <div className="container max-w-3xl px-4 sm:px-6 pt-14 pb-12">
          <h1
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-3 duration-500"
          >
            {post.heading}
          </h1>

          <p
            className="mt-5 text-lg text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-500"
            style={{ animationDelay: '80ms', animationFillMode: 'backwards' }}
          >
            {post.excerpt}
          </p>

          <div
            className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400 animate-in fade-in duration-500"
            style={{ animationDelay: '140ms', animationFillMode: 'backwards' }}
          >
            <span className="font-semibold text-slate-700 dark:text-slate-300">{post.author}</span>
            <time dateTime={post.publishedAt} className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              {published}
            </time>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readingMinutes} min read
            </span>
          </div>
        </div>
      </header>

      <article className="container max-w-3xl px-4 sm:px-6 pt-12 pb-24">
        {/* ── Table of contents: plain anchors, no JS required ── */}
        <nav
          aria-label="On this page"
          className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 shadow-lg shadow-slate-900/5 p-6 mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700"
          style={{ animationDelay: '260ms', animationFillMode: 'backwards' }}
        >
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            <ListOrdered className="w-4 h-4" />
            On this page
          </h2>
          <ol className="space-y-2 list-none p-0">
            {post.sections.map((section, idx) => (
              <li key={section.heading}>
                <a
                  href={`#${sectionId(section.heading)}`}
                  className="group flex items-baseline gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span className="text-xs font-black text-slate-300 dark:text-slate-600 tabular-nums shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-semibold leading-snug group-hover:underline underline-offset-4">
                    {section.heading}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Body ── */}
        <div className="space-y-12">
          {post.sections.map((section, idx) => (
            <section
              key={section.heading}
              id={sectionId(section.heading)}
              className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${300 + idx * 40}ms`, animationFillMode: 'backwards' }}
            >
              <h2 className="group text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4 flex items-start gap-3">
                <span className={`mt-1.5 h-5 w-1 rounded-full bg-gradient-to-b ${style.gradient} shrink-0`} />
                <span>{section.heading}</span>
              </h2>

              <div className="space-y-4 pl-4">
                {section.paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className="text-[15px] sm:text-base text-slate-600 dark:text-slate-400 leading-[1.75]"
                  >
                    {para}
                  </p>
                ))}

                {section.bullets && (
                  <ul className="space-y-2.5 list-none p-0 pt-1">
                    {section.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 bg-gradient-to-r ${style.gradient}`} />
                        <span className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* ── FAQ ── */}
        {post.faqs && post.faqs.length > 0 && (
          <section className="mt-16 border-t border-slate-200/60 dark:border-slate-800/60 pt-12">
            <h2 className="flex items-center gap-2.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-7">
              <HelpCircle className={`w-6 h-6 ${style.text}`} />
              Frequently asked questions
            </h2>
            <div className="grid gap-3">
              {post.faqs.map((faq, idx) => (
                <div
                  key={faq.q}
                  className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500"
                  style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'backwards' }}
                >
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {faq.q}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Conversion path — the reason the traffic is worth having ── */}
        <section className="mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-7 sm:p-8">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Check this against your own resume
          </h2>
          <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
            Scan your CV against a real job description, or build a parse-safe one from scratch.
            Your first scan costs nothing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/ats-score"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold transition-colors duration-200 hover:bg-indigo-700"
            >
              Free ATS checker
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/resume-builder"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors duration-200 hover:border-slate-300 dark:hover:border-slate-600"
            >
              AI resume builder
            </Link>
          </div>
        </section>

        {/* ── Related ── */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-slate-200/60 dark:border-slate-800/60 pt-12">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              Keep reading
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {related.map(rel => {
                const relStyle = categoryStyle(rel.category);
                return (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className={`group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${relStyle.ring}`}
                  >
                    <div className={`h-1 bg-gradient-to-r ${relStyle.gradient}`} />
                    <div className="p-5">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${relStyle.pill}`}>
                        {rel.category}
                      </span>
                      <span className="mt-3 block font-bold text-[15px] text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {rel.heading}
                      </span>
                      <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {rel.excerpt}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <Link
          href="/blog"
          className="mt-12 inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          All career guides
        </Link>
      </article>
    </>
  );
}
