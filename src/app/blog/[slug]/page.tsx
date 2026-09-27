import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  ListOrdered,
  HelpCircle,
  CalendarDays,
  Lightbulb,
  Link2,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Wrench,
  Sparkles,
  UserCheck,
  BadgeCheck,
  RefreshCw,
  FileText,
  Check,
} from 'lucide-react';
import { SITE_URL, siteUrl } from '@/lib/site';
import {
  BLOG_POSTS,
  getPostBySlug,
  getRelatedPosts,
  getInboundPosts,
  wordCount,
  estimatedReadingMinutes,
  sectionId,
  categoryStyle,
  heroTint,
  PostLinker,
  EXTERNAL_LINK_REL,
  type LinkedSegment,
  type BlogPost,
  type PracticalStep,
  type CommonMistake,
  type ToolReference,
  type AuthorProfile,
} from '@/lib/blog';

type Props = { params: { slug: string } };

/**
 * Renders one block of body text with its contextual internal links in place.
 */
function LinkedText({ segments }: { segments: LinkedSegment[] }) {
  return (
    <>
      {segments.map((segment, i) =>
        segment.href ? (
          <Link
            key={i}
            href={segment.href}
            title={segment.title}
            className="font-medium text-indigo-600 dark:text-indigo-400 underline decoration-indigo-300 dark:decoration-indigo-700 underline-offset-2 hover:decoration-indigo-600 dark:hover:decoration-indigo-400 transition-colors"
          >
            {segment.text}
          </Link>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </>
  );
}

/* ──────────────── Helper functions for standardized components ──────────────── */

function getPracticalSteps(post: BlogPost): PracticalStep[] {
  return post.practicalSteps || [];
}

function getCommonMistakes(post: BlogPost): CommonMistake[] {
  return post.commonMistakes || [];
}

function getLimitations(post: BlogPost): string[] {
  return post.limitations || [];
}

function getConclusion(post: BlogPost): { heading: string; paragraphs: string[] } | null {
  if (!post.conclusion) return null;
  if (Array.isArray(post.conclusion)) {
    return { heading: 'Conclusion & Key Takeaways', paragraphs: post.conclusion };
  }
  return {
    heading: post.conclusion.heading || 'Conclusion & Key Takeaways',
    paragraphs: post.conclusion.paragraphs,
  };
}

function getTools(post: BlogPost): ToolReference[] {
  if (post.tools && post.tools.length > 0) {
    return post.tools;
  }
  if (post.category === 'Resumes & ATS') {
    return [
      {
        name: 'JobsDart Free ATS Resume Checker',
        badge: 'Instant Free Scan',
        description:
          'Audit your resume against any live job description to uncover keyword gaps, format traps, and section-by-section compatibility scores.',
        href: '/ats-score',
        ctaText: 'Scan Your Resume Free',
      },
      {
        name: 'JobsDart AI Resume Builder',
        badge: 'ATS-Tested Formats',
        description:
          'Generate clean, single-column resume templates pre-engineered to parse reliably across Workday, Greenhouse, Lever, and Taleo.',
        href: '/resume-builder',
        ctaText: 'Build Your ATS Resume',
      },
    ];
  }
  return [
    {
      name: 'JobsDart Verified Job Discovery',
      badge: 'Direct Recruiter Review',
      description:
        'Explore verified global, remote, and corporate tech openings with direct hiring team review and real-time application tracking.',
      href: '/jobs',
      ctaText: 'Browse Active Roles',
    },
    {
      name: 'JobsDart Free ATS Resume Checker',
      badge: 'Instant Analysis',
      description:
        'Validate that your resume formatting and keyword taxonomy match enterprise hiring standards before submitting.',
      href: '/ats-score',
      ctaText: 'Check Resume Match',
    },
  ];
}

function getAuthorProfile(post: BlogPost): AuthorProfile {
  if (post.authorProfile) {
    return post.authorProfile;
  }
  return {
    name: post.author || 'JobsDart Career & Technical Research Team',
    role: 'Platform Research & Technical Editorial Board',
    bio: 'Researched and audited by the JobsDart Technical Career Advisory Team. All guides, ATS benchmarks, and career roadmaps are tested against empirical hiring data, enterprise ATS parsers, and verified recruiter workflows.',
  };
}

/* ──────────────── Metadata & Static Generation ──────────────── */

export function generateStaticParams() {
  return BLOG_POSTS.map(post => ({ slug: post.slug }));
}

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
    authors: [{ name: post.authorProfile?.name || post.author }],
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
      authors: [post.authorProfile?.name || post.author],
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

/* ──────────────── Main Blog Post Component ──────────────── */

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const canonical = siteUrl(`/blog/${post.slug}`);
  const related = getRelatedPosts(post);
  const inbound = getInboundPosts(post);
  const style = categoryStyle(post.category);
  const minutes = estimatedReadingMinutes(post);

  const practicalSteps = getPracticalSteps(post);
  const commonMistakes = getCommonMistakes(post);
  const limitations = getLimitations(post);
  const conclusion = getConclusion(post);
  const tools = getTools(post);
  const authorProfile = getAuthorProfile(post);

  const linker = new PostLinker(BLOG_POSTS, post.slug);
  const linkedSections = post.sections.map(section => ({
    section,
    paragraphs: section.paragraphs.map(p => linker.linkify(p)),
    bullets: (section.bullets || []).map(b => linker.linkify(b)),
  }));
  const linkedFaqs = (post.faqs || []).map(faq => ({ faq, answer: linker.linkify(faq.a) }));

  const published = new Date(post.publishedAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const updated = new Date(post.updatedAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Table of Contents dynamic items (only links to what actually exists on this page)
  const tocItems: { id: string; label: string }[] = [
    ...post.sections.map(s => ({ id: sectionId(s.heading), label: s.heading })),
    ...(practicalSteps.length > 0 ? [{ id: 'practical-steps', label: 'Practical Steps & Action Plan' }] : []),
    ...(commonMistakes.length > 0 ? [{ id: 'common-mistakes', label: 'Common Mistakes to Avoid' }] : []),
    ...(limitations.length > 0 ? [{ id: 'limitations', label: "Limitations & What Isn't Measured" }] : []),
    ...(conclusion ? [{ id: 'conclusion', label: 'Conclusion & Key Takeaways' }] : []),
    ...(post.faqs && post.faqs.length > 0 ? [{ id: 'faqs', label: 'Frequently Asked Questions' }] : []),
    ...(post.references && post.references.length > 0 ? [{ id: 'further-reading', label: 'Further Reading' }] : []),
    { id: 'jobsdart-tools', label: 'JobsDart Tools' },
  ];

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
    author: {
      '@type': 'Person',
      name: authorProfile.name,
      jobTitle: authorProfile.role,
      url: siteUrl('/about'),
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'JobsDart',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: siteUrl('/logo.png'),
      },
    },
    isPartOf: { '@id': `${SITE_URL}/#website` },
    ...(post.references?.length
      ? {
          citation: post.references.map(ref => ({
            '@type': 'CreativeWork',
            name: ref.title,
            url: ref.url,
            publisher: { '@type': 'Organization', name: ref.publisher },
          })),
        }
      : {}),
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

      {/* ── 1. TITLE & 2. METADATA HEADER ── */}
      <header className={`border-b border-slate-200 dark:border-slate-800 ${heroTint(post.tint)}`}>
        <div className="container max-w-3xl px-4 sm:px-6 pt-14 pb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.pill}`}>
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified &amp; Peer Reviewed
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-3 duration-500">
            {post.heading}
          </h1>

          <p
            className="mt-5 text-lg text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-500"
            style={{ animationDelay: '80ms', animationFillMode: 'backwards' }}
          >
            {post.excerpt}
          </p>

          {/* Standardized Metadata Bar: Author, Published Date, Updated Date, Reading Time */}
          <div
            className="mt-7 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 animate-in fade-in duration-500"
            style={{ animationDelay: '140ms', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                {authorProfile.name.charAt(0)}
              </div>
              <span>{authorProfile.name}</span>
            </div>

            <time dateTime={post.publishedAt} className="inline-flex items-center gap-1.5" title="Original Publication Date">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              <span>Published: {published}</span>
            </time>

            <time dateTime={post.updatedAt} className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300" title="Last Technical Audit & Update">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
              <span>Updated: {updated}</span>
            </time>

            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{minutes} min read</span>
            </span>
          </div>
        </div>
      </header>

      <article className="container max-w-3xl px-4 sm:px-6 pt-12 pb-24">

        {/* ── 3. INTRODUCTION (ONLY IF EXPLICITLY PROVIDED) ── */}
        {post.introduction && post.introduction.length > 0 && (
          <section aria-labelledby="introduction-heading" className="mb-10 p-6 sm:p-7 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400 mb-3">
              <FileText className="w-4 h-4" />
              <h2 id="introduction-heading" className="text-xs font-black uppercase tracking-widest">
                Introduction &amp; Operational Context
              </h2>
            </div>
            <div className="space-y-3">
              {post.introduction.map((para, i) => (
                <p key={i} className="text-[15px] sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {para}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* ── 4. KEY TAKEAWAYS ── */}
        {post.keyTakeaways && post.keyTakeaways.length > 0 && (
          <section
            aria-labelledby="key-takeaways"
            className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-900/50 p-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
          >
            <h2
              id="key-takeaways"
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Key Takeaways
            </h2>
            <ul className="space-y-2.5 list-none p-0">
              {post.keyTakeaways.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 bg-gradient-to-r ${style.gradient}`} />
                  <span className="text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── TABLE OF CONTENTS: Plain Anchors (Only items that exist on this page) ── */}
        <nav
          aria-label="On this page"
          className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 shadow-lg shadow-slate-900/5 p-6 mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700"
          style={{ animationDelay: '260ms', animationFillMode: 'backwards' }}
        >
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            <ListOrdered className="w-4 h-4" />
            On This Page
          </h2>
          <ol className="space-y-2 list-none p-0">
            {tocItems.map((item, idx) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group flex items-baseline gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span className="text-xs font-black text-slate-300 dark:text-slate-600 tabular-nums shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-semibold leading-snug group-hover:underline underline-offset-4">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── 5. MAIN SECTIONS (INCLUDING EXAMPLES & TABLES) ── */}
        <div className="space-y-12">
          {linkedSections.map(({ section, paragraphs, bullets }, idx) => (
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
                {paragraphs.map((segments, i) => (
                  <p
                    key={i}
                    className="text-[15px] sm:text-base text-slate-600 dark:text-slate-400 leading-[1.75]"
                  >
                    <LinkedText segments={segments} />
                  </p>
                ))}

                {bullets.length > 0 && (
                  <ul className="space-y-2.5 list-none p-0 pt-1">
                    {bullets.map((segments, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 bg-gradient-to-r ${style.gradient}`} />
                        <span className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          <LinkedText segments={segments} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Real <table> for accessibility and crawlability */}
                {section.table && (
                  <div className="pt-2 -mx-4 sm:mx-0 overflow-x-auto">
                    <table className="w-full min-w-[32rem] sm:min-w-0 mx-4 sm:mx-0 border-collapse text-left">
                      <caption className="sr-only">{section.table.caption}</caption>
                      <thead>
                        <tr>
                          {section.table.columns.map(col => (
                            <th
                              key={col}
                              scope="col"
                              className="border-b-2 border-slate-200 dark:border-slate-700 py-2.5 pr-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 align-bottom"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, r) => (
                          <tr key={r} className="align-top">
                            {row.map((cell, c) => (
                              <td
                                key={c}
                                className={`border-b border-slate-100 dark:border-slate-800/70 py-3 pr-4 text-[14px] leading-relaxed ${
                                  c === 0
                                    ? 'font-semibold text-slate-800 dark:text-slate-200'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Worked Example Callout */}
                {section.example && (
                  <aside className="mt-4 rounded-xl border-l-[3px] border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 pl-4 pr-4 py-4">
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {section.example.title}
                    </p>
                    <div className="space-y-3">
                      {section.example.paragraphs.map((para, i) => (
                        <p
                          key={i}
                          className="text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed font-mono sm:font-sans"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </aside>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* ── 6. PRACTICAL STEPS (ONLY IF EXPLICITLY PROVIDED) ── */}
        {practicalSteps.length > 0 && (
          <section id="practical-steps" className="mt-16 border-t border-slate-200/60 dark:border-slate-800/60 pt-12 scroll-mt-24">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Actionable Implementation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              Practical Steps &amp; Action Plan
            </h2>

            <div className="grid gap-4">
              {practicalSteps.map(step => (
                <div
                  key={step.step}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 7. COMMON MISTAKES (ONLY IF EXPLICITLY PROVIDED) ── */}
        {commonMistakes.length > 0 && (
          <section id="common-mistakes" className="mt-16 border-t border-slate-200/60 dark:border-slate-800/60 pt-12 scroll-mt-24">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Pitfalls to Avoid</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              Common Mistakes &amp; How to Fix Them
            </h2>

            <div className="grid gap-4">
              {commonMistakes.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 shrink-0 mt-0.5">
                      <XCircle className="w-3 h-3" />
                      Mistake
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.mistake}
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 pl-2 sm:pl-4 border-l-2 border-emerald-500">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                      Recommended Fix
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 8. LIMITATIONS / CAVEATS (ONLY IF EXPLICITLY PROVIDED) ── */}
        {limitations.length > 0 && (
          <section id="limitations" className="mt-16 border-t border-slate-200/60 dark:border-slate-800/60 pt-12 scroll-mt-24">
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 p-6 sm:p-7">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-3">
                <ShieldAlert className="w-4 h-4" />
                <span>Realistic Boundaries</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                Limitations, Edge Cases &amp; What Isn't Measured
              </h2>
              <ul className="space-y-3 list-none p-0">
                {limitations.map((limit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {limit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── 9. CONCLUSION (ONLY IF EXPLICITLY PROVIDED) ── */}
        {conclusion && (
          <section id="conclusion" className="mt-16 border-t border-slate-200/60 dark:border-slate-800/60 pt-12 scroll-mt-24">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
                <Sparkles className="w-4 h-4" />
                <span>Final Takeaway</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                {conclusion.heading}
              </h2>
              <div className="space-y-3">
                {conclusion.paragraphs.map((p, i) => (
                  <p key={i} className="text-[15px] sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        {post.faqs && post.faqs.length > 0 && (
          <section id="faqs" className="mt-16 border-t border-slate-200/60 dark:border-slate-800/60 pt-12 scroll-mt-24">
            <h2 className="flex items-center gap-2.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-7">
              <HelpCircle className={`w-6 h-6 ${style.text}`} />
              Frequently Asked Questions
            </h2>
            <div className="grid gap-3">
              {linkedFaqs.map(({ faq, answer }, idx) => (
                <div
                  key={faq.q}
                  className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                >
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {faq.q}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <LinkedText segments={answer} />
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Further Reading (Primary Sources) ── */}
        {post.references && post.references.length > 0 && (
          <section
            id="further-reading"
            aria-labelledby="further-reading-heading"
            className="mt-16 border-t border-slate-200/60 dark:border-slate-800/60 pt-12 scroll-mt-24"
          >
            <h2
              id="further-reading-heading"
              className="flex items-center gap-2.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-6"
            >
              <BookOpen className={`w-6 h-6 ${style.text}`} />
              Further Reading &amp; Primary Sources
            </h2>
            <ul className="space-y-3 list-none p-0">
              {post.references.map(ref => (
                <li key={ref.url}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel={EXTERNAL_LINK_REL}
                    className="group flex items-start gap-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900/50 p-4 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4 mt-1 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                    <span className="min-w-0">
                      <span className="block font-bold text-[15px] text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {ref.title}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </span>
                      <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {ref.publisher}
                      </span>
                      {ref.note && (
                        <span className="mt-1.5 block text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {ref.note}
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── 10. RELATED GUIDES ── */}
        {related.length > 0 && (
          <section id="related-guides" className="mt-16 border-t border-slate-200/60 dark:border-slate-800/60 pt-12 scroll-mt-24">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              Related Guides &amp; Deep Dives
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

        {/* Inbound links */}
        {inbound.length > 0 && (
          <section className="mt-10 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-900/40 p-6">
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              <Link2 className="w-4 h-4" />
              Referenced in These Guides
            </h2>
            <ul className="space-y-2 list-none p-0">
              {inbound.map(ref => (
                <li key={ref.slug}>
                  <Link
                    href={`/blog/${ref.slug}`}
                    className="group flex items-start gap-2.5 text-[15px] text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 mt-1 shrink-0 text-slate-300 dark:text-slate-600 transition-transform duration-200 group-hover:translate-x-0.5" />
                    <span className="font-semibold leading-snug group-hover:underline underline-offset-4">
                      {ref.heading}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── 11. JOBSDART TOOLS (FIRST-PARTY VALUE) ── */}
        <section id="jobsdart-tools" className="mt-16 rounded-3xl border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-slate-900/80 dark:via-indigo-950/20 dark:to-slate-900/60 p-7 sm:p-9 shadow-sm scroll-mt-24">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
            <Wrench className="w-4 h-4" />
            <span>JobsDart First-Party Tools</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Put This Into Practice with JobsDart Tools
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            Test and apply the principles from this guide directly using our dedicated career tools. Designed to eliminate guesswork and surface verified opportunities.
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {tools.map((tool, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {tool.name}
                    </h3>
                    {tool.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {tool.description}
                  </p>
                </div>
                <Link
                  href={tool.href}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold transition-colors duration-150 w-full text-center"
                >
                  {tool.ctaText || 'Launch Tool'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── 12. AUTHOR / EDITOR INFORMATION (E-E-A-T PROFILE) ── */}
        <section id="author-bio" className="mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 sm:p-7 scroll-mt-24">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
              {authorProfile.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {authorProfile.name}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {authorProfile.role}
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {authorProfile.bio}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Reviewed under JobsDart Technical Editorial Standards
                </span>
                <Link href="/about" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Learn more about our methodology &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Link
          href="/blog"
          className="mt-12 inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          All Career Guides
        </Link>
      </article>
    </>
  );
}
