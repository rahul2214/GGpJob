import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-finder-using-job-apis',
  tint: 'violet',
  title: 'How to Build an AI Job Finder Using Job APIs',
  heading: 'Building a job finder on APIs',
  description:
    'How to build job discovery on APIs rather than scraping: choosing sources, normalising incompatible schemas, handling rate limits, and detecting silent failure.',
  keywords: [
    'job api integration',
    'build job finder api',
    'job board api',
    'job search api tutorial',
    'aggregate job apis',
    'job data normalisation',
    'job api rate limits',
    'job feed ingestion',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'APIs are the boring, legal, reliable way to get postings — and the schema differences between them are where the real work turns out to be.',
  sections: [
    {
      heading: 'Prefer an API to scraping, always',
      paragraphs: [
        'Where a source offers an API or a feed, use it. It is faster, it is stable, it usually comes with terms you can actually comply with, and it fails loudly rather than returning a page of markup that no longer contains what you expected.',
        'Scraping is what you do when nothing else exists, and it should be a deliberate decision with the terms of service read rather than a default. Many job boards explicitly prohibit automated collection, and that matters more once your project has users.',
      ],
    },
    {
      heading: 'The schemas will not agree',
      paragraphs: [
        'Every source models a job differently. Salary might be a range, a single number, a string, or absent. Location might be a city, a region, a code, or the word "remote" in a field meant for a city. Seniority might be structured, implied by the title, or nowhere.',
        'So the first real component is a normaliser: one internal representation, and an adapter per source that maps into it. Keep the raw payload alongside the normalised record, because your normaliser is wrong in ways you have not discovered yet and reprocessing history is the only way to fix it.',
      ],
      bullets: [
        'One canonical job shape, adapters per source',
        'Raw payload stored beside the normalised record',
        'Explicit "unknown" rather than defaulting a missing field',
        'Source and fetch timestamp on every record',
      ],
    },
    {
      heading: 'Where a model helps, and where it does not',
      paragraphs: [
        'Do not use a model for what the API already gives you structured. Parsing a JSON field with an LLM is slow, costly and less reliable than reading the field.',
        'Use it for the parts that arrive as prose: pulling required skills out of a description, inferring seniority when only a title exists, deciding whether "hybrid — 2 days" means the same as another source’s "flexible". That is genuine language work and it is where the token spend is justified.',
      ],
    },
    {
      heading: 'Rate limits and incremental fetching',
      paragraphs: [
        'Refetching everything on every run burns quota and gets you throttled. Most APIs support fetching since a timestamp or a cursor — use it, and store the cursor so a restart resumes rather than starting over.',
        'Back off properly when throttled. A retry loop with no delay against a rate-limited endpoint will get your key suspended, and the suspension will last longer than the outage would have.',
      ],
    },
    {
      heading: 'Detecting the silent failure',
      paragraphs: [
        'The failure that costs weeks is not an error. It is a source that starts returning an empty list, or a field that quietly becomes null, while your pipeline reports success.',
        'Alert on shape, not just on errors. If a source that normally returns two hundred postings returns four, that is an incident even though nothing threw. The same applies per field: a sudden rise in missing salaries usually means the API changed, not that employers stopped paying.',
      ],
      bullets: [
        'Alert when a source’s volume deviates from its own baseline',
        'Track the fill rate of each important field over time',
        'Fail the run when the normaliser rejects an unusual share of records',
        'Keep a dashboard showing last successful fetch per source',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should I use job APIs or scrape job boards?',
      a: 'Use APIs or feeds wherever they exist — faster, stable, and with terms you can comply with. Scraping should be a deliberate decision after reading the terms, not a default.',
    },
    {
      q: 'Why keep the raw payload if I normalise it?',
      a: 'Because your normaliser is wrong in ways you have not found yet, and postings get taken down. The raw record is the only thing that lets you reprocess history after fixing a mapping.',
    },
    {
      q: 'Where should I use an LLM in an API-based pipeline?',
      a: 'Only on prose: extracting skills from a description, inferring seniority from a title, reconciling inconsistent work-model wording. Parsing structured fields with a model is slower, costlier and less reliable than reading them.',
    },
    {
      q: 'How do I catch a source that silently stops returning jobs?',
      a: 'Alert on volume deviating from that source’s own baseline, and track the fill rate of key fields. A source returning four postings instead of two hundred is an incident even though nothing errored.',
    },
  ],
  related: ['how-to-build-an-ai-agent-that-finds-jobs-from-multiple-websites', 'how-to-detect-duplicate-job-listings', 'how-to-build-an-ai-job-aggregator-with-llms'],
};

export default post;
