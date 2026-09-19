"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Search, X, FileQuestion, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryStyle, type BlogPostSummary } from "@/lib/blog";

/**
 * The searchable half of the blog index.
 *
 * Split from the page so the page itself stays a server component — metadata,
 * JSON-LD and static prerendering all depend on that. Only summaries cross the
 * boundary, never article bodies.
 *
 * Search deliberately runs over `allPosts` rather than the current page. A
 * reader searching from page 3 expects to find a guide that happens to sit on
 * page 1; scoping search to the visible slice would look broken. Carrying every
 * summary on every page costs about 12KB, which is cheap for that.
 */

interface BlogExplorerProps {
  /** Every post, so search covers the whole blog from any page. */
  allPosts: BlogPostSummary[];
  /** The slice this page renders when nobody is searching. */
  pagePosts: BlogPostSummary[];
  page: number;
  totalPages: number;
}

export function BlogExplorer({ allPosts, pagePosts, page, totalPages }: BlogExplorerProps) {
  const [query, setQuery] = useState("");
  const isSearching = query.trim() !== "";

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allPosts.filter(
      post =>
        post.heading.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q)
    );
  }, [allPosts, query]);

  // The featured treatment belongs to page one of an unfiltered list. While
  // searching, promoting one result above the rest is just confusing.
  const showFeatured = !isSearching && page === 1;
  const visible = isSearching ? results : pagePosts;
  const [featured, ...afterFeatured] = visible;
  const gridPosts = showFeatured ? afterFeatured : visible;

  return (
    <>
      {/*
        ── Search ─────────────────────────────────────────────────────
        The offset depends on the surrounding layout, so it comes from a
        variable the shell sets rather than a height guessed here:

        · Dashboard — main is the scroll container and its own pt-[65px]
          already clears the fixed top bar, so the offset is 0.
        · Public — the document scrolls under a sticky h-16 navbar, so the
          fallback below keeps the bar clear of it.
      */}
      <div className="sticky top-[var(--app-sticky-offset,4rem)] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search all guides — try “interview”, “roadmap”, “remote”…"
            aria-label="Search career guides"
            className="w-full h-12 pl-11 pr-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-indigo-400 dark:focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Context line ─────────────────────────────────────────────── */}
      {isSearching ? (
        <p className="mt-6 text-sm font-semibold text-slate-500 dark:text-slate-400" aria-live="polite">
          {results.length} {results.length === 1 ? "guide" : "guides"} matching “
          <span className="text-slate-900 dark:text-white">{query.trim()}</span>”
          <span className="text-slate-400"> · searched all {allPosts.length} guides</span>
        </p>
      ) : (
        totalPages > 1 && (
          <p className="mt-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Page <span className="text-slate-900 dark:text-white">{page}</span> of {totalPages}
            <span className="text-slate-400"> · {allPosts.length} guides in total</span>
          </p>
        )
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {isSearching && results.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 px-6 py-16 text-center">
          <div className="mx-auto w-12 h-12 grid place-items-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <FileQuestion className="w-5 h-5 text-slate-400" />
          </div>
          <p className="mt-4 text-base font-bold text-slate-900 dark:text-white">No guides match that</p>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Try a broader term, or clear the search to browse all {allPosts.length} guides.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── Featured ─────────────────────────────────────────────────── */}
      {showFeatured && featured && <FeaturedCard post={featured} />}

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      {gridPosts.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gridPosts.map((post, idx) => (
            <PostCard key={post.slug} post={post} index={idx} />
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────── */}
      {/* Hidden while searching: results already span every page, so paging
          through them would be meaningless. */}
      {!isSearching && totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
    </>
  );
}

/** /blog for page one, /blog/page/N after that — page one has no suffix. */
function pageHref(page: number): string {
  return page <= 1 ? "/blog" : `/blog/page/${page}`;
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const isFirst = page === 1;
  const isLast = page === totalPages;

  return (
    <nav
      aria-label="Blog pages"
      className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 dark:border-slate-800 pt-8"
    >
      {isFirst ? (
        <span
          aria-disabled="true"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-bold text-slate-300 dark:text-slate-700 cursor-not-allowed select-none"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </span>
      ) : (
        <Link
          href={pageHref(page - 1)}
          rel="prev"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Link>
      )}

      <div className="flex items-center gap-1.5">
        {pages.map(n =>
          n === page ? (
            <span
              key={n}
              aria-current="page"
              className="grid place-items-center w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold tabular-nums"
            >
              {n}
            </span>
          ) : (
            <Link
              key={n}
              href={pageHref(n)}
              aria-label={`Page ${n}`}
              className="grid place-items-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold tabular-nums text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {n}
            </Link>
          )
        )}
      </div>

      {isLast ? (
        <span
          aria-disabled="true"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-bold text-slate-300 dark:text-slate-700 cursor-not-allowed select-none"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </span>
      ) : (
        <Link
          href={pageHref(page + 1)}
          rel="next"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </nav>
  );
}

function FeaturedCard({ post }: { post: BlogPostSummary }) {
  const style = categoryStyle(post.category);

  return (
    <article className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          "group relative block overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800/70",
          "bg-white dark:bg-slate-900/70 shadow-xl shadow-slate-900/5",
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10",
          style.ring
        )}
      >
        <div className={cn("h-1.5 bg-gradient-to-r", style.gradient)} />

        {/* Soft category-tinted glow, purely decorative. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl opacity-[0.07] bg-gradient-to-br",
            style.gradient
          )}
        />

        <div className="relative p-7 sm:p-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest">
              Latest
            </span>
            <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", style.pill)}>
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {post.readingMinutes} min read
            </span>
          </div>

          <h2 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            {post.heading}
          </h2>

          <p className="mt-4 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-500 dark:text-slate-400">
            {post.excerpt}
          </p>

          <span className={cn("mt-7 inline-flex items-center gap-2 text-sm font-bold", style.text)}>
            Read the guide
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </article>
  );
}

function PostCard({ post, index }: { post: BlogPostSummary; index: number }) {
  const style = categoryStyle(post.category);

  return (
    <article
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      // Stagger only the first screenful; beyond that the delay would be felt
      // as the page simply not rendering.
      style={{
        animationDelay: `${Math.min(index, 8) * 55}ms`,
        animationFillMode: "backwards",
      }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl",
          "border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900/50",
          "shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5",
          style.ring
        )}
      >
        <div className={cn("h-1 bg-gradient-to-r", style.gradient)} />

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest", style.pill)}>
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <Clock className="w-3 h-3" />
              {post.readingMinutes} min
            </span>
          </div>

          <h3 className="mt-3 text-base sm:text-lg font-extrabold leading-snug tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            {post.heading}
          </h3>

          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">
            {post.excerpt}
          </p>

          <span className={cn("mt-4 inline-flex items-center gap-1.5 text-sm font-bold", style.text)}>
            Read more
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </article>
  );
}
