import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-finds-jobs-from-multiple-websites',
  tint: 'indigo',
  title: 'How to Build an AI Agent That Finds Jobs From Multiple Websites',
  heading: 'Searching many sources at once',
  description:
    'Aggregating across sources: what you are permitted to fetch, normalising inconsistent data, deduplicating, freshness, and failing partially without failing entirely.',
  keywords: [
    'multi source job search',
    'job aggregation agent',
    'scraping legality',
    'data normalisation jobs',
    'deduplicate job listings',
    'partial failure handling',
    'job feed freshness',
    'job discovery',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Fetching from five sources is easy. Making five inconsistent, overlapping, partly stale feeds into one trustworthy list is the work.',
  sections: [
    {
      heading: 'Establish what you may fetch',
      paragraphs: [
        'Not every source is available to you. Official APIs and published feeds come with terms; many sites prohibit automated collection outright, and some jurisdictions treat breach of those terms as more than a contractual matter.',
        'Decide this per source before building. Retrofitting a legal review onto a running aggregator usually means removing sources, and by then users depend on the coverage they provided.',
      ],
      bullets: [
        'Official APIs and partner feeds — preferred, with stated limits',
        'Published syndication feeds — usually explicit about reuse',
        'Employer career pages — check terms, respect crawl directives',
        'Anything prohibited by terms — not a technical question',
      ],
    },
    {
      heading: 'Normalise into one schema',
      paragraphs: [
        'Every source describes a job differently: salary as a range, a single figure, hourly or annual, in different currencies, sometimes as text. Location may be a city, a region, a code or "remote (US)". Employment type has no shared vocabulary.',
        'Define your own schema and map into it at the boundary, keeping the raw payload alongside. Source-shaped data leaking into the rest of the system means every consumer handles five formats, and a new source touches everything.',
      ],
    },
    {
      heading: 'Deduplicate on identity, not URL',
      paragraphs: [
        'The same posting appears across aggregators with different links, slightly different titles and different descriptions. URL-based deduplication does nothing, and a candidate seeing one role five times loses confidence in the whole feed.',
        'Match on employer, normalised title, location and a similarity threshold on the description. Then choose a canonical record — the employer’s own page where available, since it is the most likely to be current and the one that accepts applications.',
      ],
    },
    {
      heading: 'Treat freshness as a first-class field',
      paragraphs: [
        'Aggregated feeds carry closed roles, sometimes for weeks. A candidate who is sent to two dead links stops trusting the source, and that judgement extends to everything else it shows them.',
        'Track when each posting was last confirmed present at its source, re-check the ones you surface most, and show the date. Where you cannot verify, say so rather than presenting stale data as current.',
      ],
    },
    {
      heading: 'Fail partially, on purpose',
      paragraphs: [
        'Sources go down, rate-limit and change their formats, and they will not do it in a coordinated way. An aggregator that fails entirely when one source misbehaves is offline far more often than any of its inputs.',
        'Run sources independently with their own timeouts and error handling, return what succeeded, and say which source was unavailable. Partial results with an honest note are far better than an error page.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can I collect job listings from any site?',
      a: 'No. Many prohibit automated collection in their terms, and some jurisdictions treat that as more than contractual. Decide per source before building, not afterwards.',
    },
    {
      q: 'How should data from different sources be handled?',
      a: 'Normalise into your own schema at the boundary, keeping the raw payload. Otherwise every consumer handles five formats and adding a source touches everything.',
    },
    {
      q: 'How do I deduplicate listings across aggregators?',
      a: 'Match on employer, normalised title, location and description similarity — not URL. Then prefer the employer own page as the canonical record.',
    },
    {
      q: 'What happens when one source is down?',
      a: 'Return what succeeded and say which source was unavailable. An aggregator that fails entirely on one bad input is offline more often than any of its sources.',
    },
  ],
  related: ['how-to-build-an-ai-job-aggregator-with-llms', 'how-to-build-an-ai-job-finder-using-job-apis', 'how-to-detect-duplicate-job-listings'],
};

export default post;
