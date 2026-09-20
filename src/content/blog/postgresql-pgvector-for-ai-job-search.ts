import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'postgresql-pgvector-for-ai-job-search',
  tint: 'emerald',
  title: 'PostgreSQL + pgvector for AI Job Search',
  heading: 'Job search on Postgres and pgvector',
  description:
    'Running vector search inside Postgres: schema design, index choice, combining vector and SQL filters, and the scale at which it stops being enough.',
  keywords: [
    'pgvector job search',
    'postgresql vector search',
    'pgvector schema design',
    'hnsw vs ivfflat',
    'pgvector filtering',
    'postgres embeddings',
    'pgvector performance',
    'vector search sql',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['Postgres and pgvector', 'transactional consistency'],
  excerpt:
    'Keeping vectors next to the rows they describe removes a whole category of problems — chiefly that your two data stores can disagree.',
  keyTakeaways: [
    'One transaction for the job and its embedding removes the reconciliation problem entirely.',
    'One row per embedded chunk, with the model and chunking version recorded.',
    'Build time and incremental updates usually matter more than peak query speed here.',
    'Filters are ordinary SQL in the same query — check the plan rather than assuming.',
    'Leave on measurements, not on the corpus feeling large.',
  ],
  sections: [
    {
      heading: 'The argument for staying in Postgres',
      paragraphs: [
        'A job matching system needs vectors and also needs everything else: employers, applications, candidates, statuses, permissions. Those relationships are relational, and putting the vectors in a separate system means every query spans two stores.',
        'The decisive benefit is transactional consistency. Insert the job and its embedding in one transaction and they cannot disagree. With a separate vector store, a partial failure leaves an orphaned vector or a job with no vector, and reconciling that is ongoing work.',
        'The failure that removes is the one candidates notice. A posting closing in the primary database while its vector survives in a separate index produces search results pointing at roles that no longer exist, and two dead links are enough to lose a user’s trust in the whole feed.',
      ],
    },
    {
      heading: 'Schema: one row per embedded unit',
      paragraphs: [
        'Do not put a single vector column on the jobs table, because you will want to embed individual requirements rather than whole postings. Use a separate table with one row per embedded chunk, referencing its parent.',
        'Store the model name and chunking version on each row. Without that you cannot migrate models safely, and mixing vector generations produces results that look reasonable and are meaningless.',
        'Make the active version part of the query rather than a column somebody remembers to filter on. A query that cannot return the wrong generation cannot accidentally mix two, which is a stronger guarantee than a convention every future query must observe.',
      ],
      bullets: [
        'job_embeddings: job_id, chunk_index, chunk_text, embedding, model, version',
        'A foreign key with cascade so deleting a job removes its vectors',
        'An index on job_id for retrieving all chunks of one posting',
        'The vector index built on the embedding column',
      ],
      table: {
        caption: 'Decisions worth making deliberately',
        columns: ['Decision', 'Default that works', 'Why'],
        rows: [
          ['Where the vector lives', 'A separate chunk table', 'You will embed requirements, not postings'],
          ['Version tracking', 'Model and chunking on each row', 'Migration is otherwise impossible'],
          ['Deletion', 'Cascade from the job', 'Orphaned vectors serve dead roles'],
          ['Expiry', 'Active flag, filtered', 'Hard deletes from an ANN index are costly'],
          ['Index build', 'A maintenance window', 'It interferes with write traffic'],
          ['Recall', 'Measured against exact search', 'It degrades silently otherwise'],
        ],
      },
    },
    {
      heading: 'Index choice, briefly',
      paragraphs: [
        'The practical trade-off is between an index that builds quickly and queries adequately, and one that builds slowly, uses more memory and queries faster with better recall. For a job board with continuous inserts, build time and incremental updates matter more than peak query speed.',
        'Whichever you pick, the mistake to avoid is tuning for latency without measuring recall. Compare against an exact scan on a sample — an index returning results quickly while missing the best matches is invisible until someone notices the matching "got worse".',
        'Track that number over time rather than measuring once. Recall drifts as the data distribution changes, so a parameter that was right at fifty thousand vectors is not necessarily right at five hundred thousand, and nothing will alert you.',
      ],
    },
    {
      heading: 'Combining vector search with SQL filters',
      paragraphs: [
        'This is where Postgres genuinely shines: your filters are ordinary SQL against columns that already exist. Active jobs, in these countries, within this salary band, posted recently — all in the same query as the similarity ordering.',
        'Watch the planner though. With a highly selective filter, an approximate index can be the wrong choice and an exact scan over the filtered subset is faster and more accurate. Check the plan rather than assuming the vector index is always the right path.',
        'The case that catches people is the middle one. A filter selective enough to matter but not enough for the planner to abandon the index leaves the approximate search exploring rows the filter then removes, so the query returns fewer results than requested — which reads as a thin market rather than a plan problem.',
      ],
    },
    {
      heading: 'Keeping the index fresh',
      paragraphs: [
        'Job data turns over constantly, which makes freshness a correctness property rather than housekeeping. A posting that becomes searchable six hours after publication is one the early applicants already took, and a filled role still in the index costs trust.',
        'Embed on insert where you can and run a sweeper for whatever the insert path missed. A pending-embedding flag processed in batches with retries degrades gracefully during a provider outage, where a nightly full scan hides the backlog until postings go missing.',
        'Prefer soft deletion with an active flag over hard deletes from an approximate index. Removing rows is expensive and sometimes incomplete, and filtering on a boolean is both cheaper and easier to reason about — with space reclaimed on a schedule instead.',
      ],
    },
    {
      heading: 'When to leave',
      paragraphs: [
        'The honest limits are index build time as the corpus grows, memory pressure from a large index competing with your ordinary workload, and query concurrency at a level where vector search starts affecting the rest of the database.',
        'Those are measurable. Watch build duration, index size against available memory, and p95 latency under real concurrency — and move when the numbers say so rather than when the corpus merely feels large.',
        'Try a read replica first, because it is usually enough. A replica dedicated to matching removes the contention that triggers most of these thresholds without introducing a second data model, a second consistency story or another system to operate.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is pgvector good enough for a production job board?',
      a: 'For most, yes. Keeping vectors beside the relational data gives transactional consistency and lets you combine similarity with ordinary SQL filters in one query.',
    },
    {
      q: 'Should the embedding be a column on the jobs table?',
      a: 'No. Use a separate table with one row per embedded chunk, and store the model and chunking version on each row so a migration is possible.',
    },
    {
      q: 'Which pgvector index should I use?',
      a: 'Weigh build time and incremental updates against query speed — for a job board with continuous inserts the former usually matters more. Whatever you pick, measure recall against an exact scan.',
    },
    {
      q: 'When should I move off Postgres for vectors?',
      a: 'When measurements say so — and try a dedicated read replica first, which removes the contention behind most of those thresholds.',
    },
    {
      q: 'How should expired postings be removed from the index?',
      a: 'Soft-delete with an active flag and filter on it, reclaiming space periodically. Hard deletes from an approximate index are expensive and sometimes incomplete.',
    },
    {
      q: 'Why does a filtered query sometimes return too few rows?',
      a: 'The approximate search explores candidates the filter then removes. A filter selective enough to matter but not to change the plan produces a thin result set.',
    },
  ],
  related: ['how-to-use-vector-databases-for-ai-job-matching', 'how-to-build-a-job-matching-ai-with-postgresql', 'how-to-build-a-job-recommendation-engine-with-pgvector'],
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
