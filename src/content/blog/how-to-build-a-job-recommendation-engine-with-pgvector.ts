import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-job-recommendation-engine-with-pgvector',
  tint: 'sky',
  title: 'How to Build a Job Recommendation Engine With pgvector',
  heading: 'A recommender built on pgvector',
  description:
    'A concrete pgvector recommender: profile vectors, filtered similarity queries, keeping embeddings fresh, precomputing feeds and measuring what you gave up.',
  keywords: [
    'pgvector recommendation engine',
    'pgvector job recommendations',
    'profile embedding',
    'filtered vector query',
    'embedding freshness',
    'precomputed feed',
    'pgvector recall',
    'postgres recommender',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'The whole recommender fits in one database: a profile vector, a filtered similarity query, and a scheduled job that keeps both honest.',
  sections: [
    {
      heading: 'Represent the candidate as more than one vector',
      paragraphs: [
        'The obvious design gives each candidate a single profile vector and finds the nearest jobs. It works, and it blurs someone with a backend history and a recent move into data engineering into an average that is neither.',
        'Keep several vectors per candidate — one per substantial role, plus one for their stated target if they gave you one — and query with each. A person changing direction is then served by the target vector rather than dragged back by their history.',
      ],
    },
    {
      heading: 'Weight the target above the history',
      paragraphs: [
        'History describes where someone has been; the stated target describes where they want to go. A recommender that weights these equally will keep showing a career-changer the field they are leaving, which is the single most common complaint about job feeds.',
        'Give explicit intent a higher weight, and decay older roles. Someone’s work from six years ago should influence the feed less than what they did last year, and far less than what they said they want.',
      ],
      bullets: [
        'Explicit target role — highest weight',
        'Recent roles — moderate weight, decayed by age',
        'Older roles — low weight, retained for transferable signal',
        'Recent searches — session-level, applied at re-rank time',
      ],
    },
    {
      heading: 'The query does filtering and similarity together',
      paragraphs: [
        'This is the reason to be in Postgres at all. Active postings, in eligible countries, in the right employment type, ordered by distance to the profile vector — one statement, one plan, no reconciliation between systems.',
        'Check the plan rather than assuming. When the filter is highly selective, an exact scan over the filtered subset can beat the approximate index on both speed and accuracy, and the planner may or may not choose it for you.',
      ],
    },
    {
      heading: 'Freshness is a scheduled job, not an afterthought',
      paragraphs: [
        'New postings need embeddings before they can be recommended, and a posting that becomes searchable six hours late is a posting the early applicants have already taken. Embed on insert where you can, and run a sweeper for whatever the insert path missed.',
        'The same sweeper should handle profile changes. A candidate who updates their target role and sees the same feed the next morning concludes, reasonably, that the product ignored them.',
      ],
    },
    {
      heading: 'Precompute the feed, measure the recall',
      paragraphs: [
        'Recommendations for the home feed can be computed on a schedule and stored, which makes serving a primary-key lookup. Store the generation timestamp and the model version alongside them, so a strange feed can be diagnosed rather than guessed at.',
        'And periodically compare the approximate results with an exact scan on a sample. An index quietly losing recall looks exactly like a recommender that got worse, and only this comparison tells the two apart.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should each candidate have one profile vector?',
      a: 'Preferably not. One vector blurs a backend history and a recent move into data engineering into an average that is neither. Keep one per substantial role, plus one for the stated target.',
    },
    {
      q: 'How do I stop recommending the field someone is leaving?',
      a: 'Weight explicit stated intent above history and decay older roles by age. Equal weighting is the single most common reason job feeds feel stuck in a candidate past.',
    },
    {
      q: 'Can pgvector filter and rank in one query?',
      a: 'Yes, and that is the main reason to use it — active, eligible, right employment type, ordered by distance, in one statement. Check the plan though; a selective filter can make an exact scan faster.',
    },
    {
      q: 'How do I know the index has not lost recall?',
      a: 'Compare approximate results against an exact scan on a sample periodically. A degraded index is indistinguishable from a worse recommender unless you run that comparison.',
    },
  ],
  related: ['postgresql-pgvector-for-ai-job-search', 'how-to-build-a-recommendation-engine-for-jobs', 'how-to-build-a-job-matching-ai-with-postgresql'],
};

export default post;
