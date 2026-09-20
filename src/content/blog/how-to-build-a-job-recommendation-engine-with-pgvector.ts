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
  anchors: ['pgvector recommender', 'profile vectors'],
  excerpt:
    'The whole recommender fits in one database: a profile vector, a filtered similarity query, and a scheduled job that keeps both honest.',
  keyTakeaways: [
    'Several vectors per candidate, not one — an average serves nobody who is changing direction.',
    'Weight stated intent above history, and decay history by age.',
    'Filtering and ranking in one query is the reason to be in Postgres at all.',
    'Freshness is a scheduled job; a posting embedded six hours late is a posting already taken.',
    'Compare approximate results against exact scans, or silent recall loss looks like a worse product.',
  ],
  sections: [
    {
      heading: 'Represent the candidate as more than one vector',
      paragraphs: [
        'The obvious design gives each candidate a single profile vector and finds the nearest jobs. It works, and it blurs someone with a backend history and a recent move into data engineering into an average that is neither.',
        'Keep several vectors per candidate — one per substantial role, plus one for their stated target if they gave you one — and query with each. A person changing direction is then served by the target vector rather than dragged back by their history.',
        'Merging the result sets is straightforward and worth doing deliberately. Take the union, keep each posting’s best distance across the candidate’s vectors, and record which vector produced it — that last field is what lets the feed explain itself and what lets you debug a feed that has drifted.',
      ],
    },
    {
      heading: 'Weight the target above the history',
      paragraphs: [
        'History describes where someone has been; the stated target describes where they want to go. A recommender that weights these equally will keep showing a career-changer the field they are leaving, which is the single most common complaint about job feeds.',
        'Give explicit intent a higher weight, and decay older roles. Someone’s work from six years ago should influence the feed less than what they did last year, and far less than what they said they want.',
        'Behaviour needs the same treatment. Clicks from three months ago describe a search that may have changed direction since, and weighting recent interaction above old interaction is what lets the feed follow a candidate rather than anchoring them.',
      ],
      bullets: [
        'Explicit target role — highest weight',
        'Recent roles — moderate weight, decayed by age',
        'Older roles — low weight, retained for transferable signal',
        'Recent searches — session-level, applied at re-rank time',
      ],
      table: {
        caption: 'What each stored vector is for',
        columns: ['Vector', 'Derived from', 'Weight'],
        rows: [
          ['Target', 'What the candidate stated', 'Highest'],
          ['Current role', 'Most recent position', 'High'],
          ['Prior roles', 'Earlier positions', 'Decayed by age'],
          ['Skills cluster', 'Evidenced skills', 'Low, for recall'],
          ['Session', 'This week’s searches', 'Re-rank only'],
        ],
      },
    },
    {
      heading: 'The query does filtering and similarity together',
      paragraphs: [
        'This is the reason to be in Postgres at all. Active postings, in eligible countries, in the right employment type, ordered by distance to the profile vector — one statement, one plan, no reconciliation between systems.',
        'Check the plan rather than assuming. When the filter is highly selective, an exact scan over the filtered subset can beat the approximate index on both speed and accuracy, and the planner may or may not choose it for you.',
        'The case that catches people is a filter selective enough to leave few rows but not selective enough for the planner to abandon the vector index. The approximate search then explores candidates that the filter subsequently removes, and returns fewer results than requested — which looks like a thin feed rather than a query plan problem.',
      ],
    },
    {
      heading: 'Freshness is a scheduled job, not an afterthought',
      paragraphs: [
        'New postings need embeddings before they can be recommended, and a posting that becomes searchable six hours late is a posting the early applicants have already taken. Embed on insert where you can, and run a sweeper for whatever the insert path missed.',
        'The same sweeper should handle profile changes. A candidate who updates their target role and sees the same feed the next morning concludes, reasonably, that the product ignored them.',
        'Make the sweeper idempotent and give it a queue rather than a scan. A pending-embedding flag on the row, processed in batches with retries, handles a provider outage gracefully; a nightly full table scan hides the backlog until someone notices postings missing from search.',
      ],
    },
    {
      heading: 'Indexes, parameters and the recall you did not know you lost',
      paragraphs: [
        'An approximate index trades recall for speed, and the trade is set by parameters most teams configure once and never revisit. As the table grows and the data distribution shifts, the same settings return a steadily worse approximation of the true nearest neighbours.',
        'Nothing surfaces this on its own. Queries stay fast, results stay plausible, and the feed quietly gets worse — which gets attributed to the model, the weighting or the market before anyone suspects the index.',
        'The check is cheap: on a sample of candidates, run the query with the index and again with the index disabled, and compare the overlap in the top results. Track that number over time and treat a fall in it as a regression, because that is what it is.',
        'Build cost is the other consideration. Index construction on a large table is heavy enough to interfere with normal write traffic, so it belongs in a maintenance window rather than in whatever moment someone decided to tune a parameter.',
      ],
    },
    {
      heading: 'Precompute the feed, measure the recall',
      paragraphs: [
        'Recommendations for the home feed can be computed on a schedule and stored, which makes serving a primary-key lookup. Store the generation timestamp and the model version alongside them, so a strange feed can be diagnosed rather than guessed at.',
        'And periodically compare the approximate results with an exact scan on a sample. An index quietly losing recall looks exactly like a recommender that got worse, and only this comparison tells the two apart.',
        'Precomputation needs an invalidation rule or it becomes the stale thing it was meant to optimise. A profile change, a new target, or an application submitted should all mark the feed for regeneration rather than waiting for the next scheduled run.',
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
    {
      q: 'Why does a filtered vector query sometimes return too few rows?',
      a: 'The approximate search explores candidates the filter then removes. A filter selective enough to matter but not enough to change the plan produces a thin feed that looks like a data problem.',
    },
    {
      q: 'How should embedding freshness be handled?',
      a: 'A pending flag processed in batches with retries, not a nightly full scan. A queue degrades visibly during a provider outage; a scan hides the backlog until postings go missing.',
    },
  ],
  related: ['postgresql-pgvector-for-ai-job-search', 'how-to-build-a-recommendation-engine-for-jobs', 'how-to-build-a-job-matching-ai-with-postgresql'],
  references: [
    {
      title: 'pgvector',
      url: 'https://github.com/pgvector/pgvector',
      publisher: 'GitHub',
      note: 'Index types, distance operators and the parameters that set the recall trade.',
    },
    {
      title: 'Using EXPLAIN',
      url: 'https://www.postgresql.org/docs/current/using-explain.html',
      publisher: 'PostgreSQL',
      note: 'Confirming whether a filtered similarity query used the index you expected.',
    },
  ],
};

export default post;
