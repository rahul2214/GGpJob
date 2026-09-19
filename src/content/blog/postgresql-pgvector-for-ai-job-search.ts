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
  excerpt:
    'Keeping vectors next to the rows they describe removes a whole category of problems — chiefly that your two data stores can disagree.',
  sections: [
    {
      heading: 'The argument for staying in Postgres',
      paragraphs: [
        'A job matching system needs vectors and also needs everything else: employers, applications, candidates, statuses, permissions. Those relationships are relational, and putting the vectors in a separate system means every query spans two stores.',
        'The decisive benefit is transactional consistency. Insert the job and its embedding in one transaction and they cannot disagree. With a separate vector store, a partial failure leaves an orphaned vector or a job with no vector, and reconciling that is ongoing work.',
      ],
    },
    {
      heading: 'Schema: one row per embedded unit',
      paragraphs: [
        'Do not put a single vector column on the jobs table, because you will want to embed individual requirements rather than whole postings. Use a separate table with one row per embedded chunk, referencing its parent.',
        'Store the model name and chunking version on each row. Without that you cannot migrate models safely, and mixing vector generations produces results that look reasonable and are meaningless.',
      ],
      bullets: [
        'job_embeddings: job_id, chunk_index, chunk_text, embedding, model, version',
        'A foreign key with cascade so deleting a job removes its vectors',
        'An index on job_id for retrieving all chunks of one posting',
        'The vector index built on the embedding column',
      ],
    },
    {
      heading: 'Index choice, briefly',
      paragraphs: [
        'The practical trade-off is between an index that builds quickly and queries adequately, and one that builds slowly, uses more memory and queries faster with better recall. For a job board with continuous inserts, build time and incremental updates matter more than peak query speed.',
        'Whichever you pick, the mistake to avoid is tuning for latency without measuring recall. Compare against an exact scan on a sample — an index returning results quickly while missing the best matches is invisible until someone notices the matching "got worse".',
      ],
    },
    {
      heading: 'Combining vector search with SQL filters',
      paragraphs: [
        'This is where Postgres genuinely shines: your filters are ordinary SQL against columns that already exist. Active jobs, in these countries, within this salary band, posted recently — all in the same query as the similarity ordering.',
        'Watch the planner though. With a highly selective filter, an approximate index can be the wrong choice and an exact scan over the filtered subset is faster and more accurate. Check the plan rather than assuming the vector index is always the right path.',
      ],
    },
    {
      heading: 'When to leave',
      paragraphs: [
        'The honest limits are index build time as the corpus grows, memory pressure from a large index competing with your ordinary workload, and query concurrency at a level where vector search starts affecting the rest of the database.',
        'Those are measurable. Watch build duration, index size against available memory, and p95 latency under real concurrency — and move when the numbers say so rather than when the corpus merely feels large.',
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
      a: 'No. Use a separate table with one row per embedded chunk, since you will want to embed individual requirements rather than whole postings — and store the model and chunking version on each row.',
    },
    {
      q: 'Which pgvector index should I use?',
      a: 'Weigh build time and incremental updates against query speed — for a job board with continuous inserts the former usually matters more. Whatever you pick, measure recall against an exact scan.',
    },
    {
      q: 'When should I move off Postgres for vectors?',
      a: 'When measurements say so: index build time, index size against available memory, and p95 latency under real concurrency. Not when the corpus merely feels large.',
    },
  ],
  related: ['how-to-use-vector-databases-for-ai-job-matching', 'how-to-build-a-job-matching-ai-with-postgresql', 'how-to-build-a-job-recommendation-engine-with-pgvector'],
};

export default post;
