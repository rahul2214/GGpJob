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
  anchors: ['job APIs', 'normalising schemas'],
  excerpt:
    'APIs are the boring, legal, reliable way to get postings — and the schema differences between them are where the real work turns out to be.',
  keyTakeaways: [
    'Prefer an API wherever one exists; scraping is a deliberate decision, not a default.',
    'One canonical shape with an adapter per source, and the raw payload kept alongside.',
    'Use a model only on prose — parsing a structured field with one is slower and worse.',
    'Fetch incrementally with a stored cursor, and back off properly when throttled.',
    'The expensive failure is silent, so alert on volume and field fill rates rather than errors.',
  ],
  sections: [
    {
      heading: 'Prefer an API to scraping, always',
      paragraphs: [
        'Where a source offers an API or a feed, use it. It is faster, it is stable, it usually comes with terms you can actually comply with, and it fails loudly rather than returning a page of markup that no longer contains what you expected.',
        'Scraping is what you do when nothing else exists, and it should be a deliberate decision with the terms of service read rather than a default. Many job boards explicitly prohibit automated collection, and that matters more once your project has users.',
        'Register properly and behave well on the sources you do use. A documented key, a stated user agent and respect for the published limits are what turn an integration into a relationship, and the alternative is a block that arrives without warning on the morning it matters.',
      ],
    },
    {
      heading: 'The schemas will not agree',
      paragraphs: [
        'Every source models a job differently. Salary might be a range, a single number, a string, or absent. Location might be a city, a region, a code, or the word "remote" in a field meant for a city. Seniority might be structured, implied by the title, or nowhere.',
        'So the first real component is a normaliser: one internal representation, and an adapter per source that maps into it. Keep the raw payload alongside the normalised record, because your normaliser is wrong in ways you have not discovered yet and reprocessing history is the only way to fix it.',
        'Resist defaulting a missing field to something convenient. A salary recorded as zero, or a location defaulted to remote, silently distorts every filter downstream — and unknown is a value the rest of the system can handle correctly if you let it exist.',
      ],
      bullets: [
        'One canonical job shape, adapters per source',
        'Raw payload stored beside the normalised record',
        'Explicit "unknown" rather than defaulting a missing field',
        'Source and fetch timestamp on every record',
      ],
      table: {
        caption: 'What varies between sources',
        columns: ['Field', 'Variation', 'What it breaks'],
        rows: [
          ['Salary', 'Range, point, text, absent, per hour', 'Filtering and sorting'],
          ['Location', 'City, region, code, "remote"', 'Eligibility gating'],
          ['Posted date', 'Posted, updated, re-syndicated', 'Freshness ranking'],
          ['Employer', 'Legal name, brand, agency', 'Deduplication'],
          ['Description', 'HTML, markdown, truncated', 'Requirement extraction'],
          ['Job id', 'Unstable across fetches', 'Change detection'],
        ],
      },
    },
    {
      heading: 'Where a model helps, and where it does not',
      paragraphs: [
        'Do not use a model for what the API already gives you structured. Parsing a JSON field with an LLM is slow, costly and less reliable than reading the field.',
        'Use it for the parts that arrive as prose: pulling required skills out of a description, inferring seniority when only a title exists, deciding whether "hybrid — 2 days" means the same as another source’s "flexible". That is genuine language work and it is where the token spend is justified.',
        'Run that work once per posting rather than once per arrival. The same role comes through four sources, and keying the expensive extraction to a content hash means the second, third and fourth encounters cost a lookup.',
      ],
    },
    {
      heading: 'Rate limits and incremental fetching',
      paragraphs: [
        'Refetching everything on every run burns quota and gets you throttled. Most APIs support fetching since a timestamp or a cursor — use it, and store the cursor so a restart resumes rather than starting over.',
        'Back off properly when throttled. A retry loop with no delay against a rate-limited endpoint will get your key suspended, and the suspension will last longer than the outage would have.',
        'Poll each source at the rate it actually changes. A large aggregator and a small company’s careers feed differ by an order of magnitude in how often anything new appears, and one interval for both is either wasteful or too slow.',
        'Isolate sources from each other so one cannot starve the rest. A per-source budget and a circuit breaker mean a feed that suddenly returns ten times its usual volume consumes its own allocation rather than everyone else’s.',
      ],
    },
    {
      heading: 'Detecting the silent failure',
      paragraphs: [
        'The failure that costs weeks is not an error. It is a source that starts returning an empty list, or a field that quietly becomes null, while your pipeline reports success.',
        'Alert on shape, not just on errors. If a source that normally returns two hundred postings returns four, that is an incident even though nothing threw. The same applies per field: a sudden rise in missing salaries usually means the API changed, not that employers stopped paying.',
        'Watch the normaliser’s own rejection rate as a leading indicator. A mapping that suddenly cannot interpret a fifth of the records is telling you the schema moved, and it says so before the missing jobs reach anyone’s feed.',
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
      a: 'Only on prose: extracting skills, inferring seniority from a title, reconciling work-model wording — and once per posting, keyed by content hash rather than per arrival.',
    },
    {
      q: 'How do I catch a source that silently stops returning jobs?',
      a: 'Alert on volume deviating from that source’s own baseline, track field fill rates, and watch the normaliser rejection rate as a leading indicator.',
    },
    {
      q: 'Should every source be polled at the same interval?',
      a: 'No. Poll at the rate each source actually changes; one interval for a large aggregator and a small careers feed is either wasteful or too slow.',
    },
    {
      q: 'Why give each source its own budget?',
      a: 'So a feed returning ten times its usual volume consumes its own allocation rather than starving every other source in the same run.',
    },
  ],
  related: ['how-to-build-an-ai-agent-that-finds-jobs-from-multiple-websites', 'how-to-detect-duplicate-job-listings', 'how-to-build-an-ai-job-aggregator-with-llms'],
};

export default post;
