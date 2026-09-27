import Link from 'next/link';
import { BookOpen, ArrowRight, Clock, Calendar, Sparkles } from 'lucide-react';

const FEATURED_ARTICLES = [
  {
    slug: 'tech-layoffs-2026-ai-jobs',
    title: 'Tech Layoffs 2026 and AI Jobs: Which Roles Are Shrinking vs Expanding',
    excerpt:
      'An in-depth analysis of 2026 tech workforce shifts, comparing commoditized repetitive coding roles with surging demand for AI orchestration and systems reliability.',
    category: 'Career Growth',
    readingMinutes: 11,
    publishedAt: 'March 2026',
    tint: 'rose',
  },
  {
    slug: 'rag-explained',
    title: 'RAG Explained: What Is Retrieval-Augmented Generation?',
    excerpt:
      'The foundational developer guide to retrieval-augmented generation: how vector indexes supply LLMs with private, real-time context without fine-tuning.',
    category: 'AI Engineering',
    readingMinutes: 9,
    publishedAt: 'March 2026',
    tint: 'sky',
  },
  {
    slug: 'how-applicant-tracking-systems-work',
    title: 'How Applicant Tracking Systems Work in 2026 (and How to Beat Them)',
    excerpt:
      'What happens when your resume hits modern corporate screening software: parser mechanics, keyword scoring algorithms, and layout formatting rules.',
    category: 'Job Search Strategy',
    readingMinutes: 12,
    publishedAt: 'March 2026',
    tint: 'emerald',
  },
];

export function LatestArticlesSection() {
  return (
    <section className="py-20 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Latest AI &amp; Career Insights
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-base max-w-2xl">
              Original, research-backed guides on AI engineering, ATS optimization, technical interviews, and the future of work.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors group shrink-0"
          >
            <span>Browse All 250+ Articles</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_ARTICLES.map((article) => (
            <article
              key={article.slug}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    {article.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readingMinutes} min read
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2 mb-3">
                  <Link href={`/blog/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-6">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.publishedAt}
                </span>
                <Link
                  href={`/blog/${article.slug}`}
                  className="text-xs font-bold text-violet-600 dark:text-violet-400 inline-flex items-center gap-1 group-hover:underline"
                >
                  Read Article
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
