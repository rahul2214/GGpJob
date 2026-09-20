import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-use-vector-databases-for-ai-job-matching',
  tint: 'emerald',
  title: 'How to Use Vector Databases for AI Job Matching',
  heading: 'Vector databases for job matching',
  description:
    'Choosing and operating a vector store for job matching: when you need one, metadata filtering, index tuning, freshness, and why Postgres is often enough.',
  keywords: [
    'vector database job matching',
    'vector db for jobs',
    'pgvector vs dedicated vector db',
    'metadata filtering vectors',
    'ann index tuning',
    'vector search production',
    'vector store choice',
    'job search vector infrastructure',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['vector databases', 'metadata filtering'],
  excerpt:
    'Most job boards do not need a dedicated vector database. Knowing when you cross that line saves an unnecessary piece of infrastructure.',
  keyTakeaways: [
    'Two stores means two truths, and reconciling them after a partial failure is unplanned work.',
    'Migrate on a measurement — index build interference, latency, concurrency — not an expectation.',
    'Metadata filtering should drive the choice more than benchmark speed.',
    'Expired postings are a correctness problem here, not a housekeeping one.',
    'Measure recall against exact search, or a tuned index looks like a worse algorithm.',
  ],
  sections: [
    {
      heading: 'You probably do not need one yet',
      paragraphs: [
        'At tens of thousands of vectors, similarity search in your existing database is fast enough and vastly simpler to operate. A dedicated vector store adds a system to deploy, monitor, back up and keep in sync with your source of truth.',
        'That synchronisation is the hidden cost. Two stores means two truths, and reconciling them after a partial failure is work nobody plans for. Postgres with a vector extension keeps jobs and their vectors in one transaction, which removes the whole class of problem.',
        'The failure it removes is the one candidates notice. A posting closing in the primary database while its vector remains in a separate index produces search results pointing at roles that no longer exist, and that reconciliation gap is exactly where a two-store architecture leaks.',
      ],
    },
    {
      heading: 'When the line is crossed',
      paragraphs: [
        'Dedicated stores earn their place at genuinely large scale, with high query concurrency, or when you need index features your database does not offer. Millions of vectors with heavy concurrent search is a real reason.',
        'Latency pressure is another: if you are serving matches interactively and your database’s index cannot hold the tail latency, that is measurable and worth acting on. Migrate on a measurement, not on an expectation.',
        'There is an intermediate step worth taking first, and it is usually enough: a read replica dedicated to matching. It removes the contention that triggers most of these thresholds without introducing a second data model or another system to operate.',
      ],
      table: {
        caption: 'Signals to migrate, and what to do about each',
        columns: ['Signal', 'Real reason?', 'First response'],
        rows: [
          ['"The data is getting big"', 'No', 'Measure something specific'],
          ['Index builds block writes', 'Yes', 'Maintenance window, then a replica'],
          ['Matching starves transactions', 'Yes', 'A dedicated read replica'],
          ['p95 no longer responds to tuning', 'Yes', 'Consider a dedicated store'],
          ['Millions of vectors, heavy concurrency', 'Yes', 'A dedicated store'],
          ['A feature your index lacks', 'Sometimes', 'Check it is actually needed'],
        ],
      },
    },
    {
      heading: 'Metadata filtering is the thing to evaluate',
      paragraphs: [
        'Job matching is never pure similarity. It is "similar, and in this country, and active, and within this seniority band" — and how a store combines filters with vector search differs enormously.',
        'Filtering after retrieval is the trap: request the top hundred, filter by country, and be left with three because the other ninety-seven were elsewhere. You need pre-filtering or filtered search, and this single property should drive the choice more than raw benchmark speed.',
        'The awkward middle case catches people even in stores that support filtering. A filter selective enough to matter but not enough to change the plan leaves the approximate search exploring candidates the filter then removes, so it returns fewer results than requested — which looks like a thin market rather than a query problem.',
      ],
      bullets: [
        'Does it filter before or after the similarity search?',
        'Can it combine several filters without collapsing recall?',
        'Does it support updating metadata without re-inserting the vector?',
        'How does it behave when a filter matches very few rows?',
      ],
    },
    {
      heading: 'Freshness is a job-board-specific problem',
      paragraphs: [
        'Jobs expire constantly, and an index serving filled roles is worse than useless — candidates lose trust quickly after two dead links. Deletions must propagate promptly, which many vector setups treat as an afterthought.',
        'Prefer soft-deleting with an active flag and filtering on it, then reclaiming space periodically. Immediate hard deletes from an approximate index are often expensive and sometimes incomplete.',
        'Inserts need the same urgency in the other direction. A posting that becomes searchable six hours after publication is a posting the early applicants already took, so embed on insert and run a sweeper for whatever the insert path missed.',
      ],
    },
    {
      heading: 'Re-embedding is the migration nobody plans',
      paragraphs: [
        'You will change the embedding model or the chunking, and when you do, every existing vector becomes incomparable with new ones. Mixing the two generations silently produces plausible nonsense rather than an error.',
        'Store the model identifier and chunking version with every vector, and make the active version part of the query rather than a column somebody remembers to filter on. A query that cannot return the wrong generation cannot mix them.',
        'Support running two generations side by side during the migration. A store that forces a single index makes the choice between a costly big-bang re-embed and never improving, which is how a system freezes on the model it launched with.',
      ],
    },
    {
      heading: 'Tune the index, and know what you traded',
      paragraphs: [
        'Approximate nearest-neighbour indexes trade recall for speed, and the defaults are rarely right for your data. The important thing is knowing what you gave up: measure recall against an exact search on a sample before and after tuning.',
        'Teams that tune for latency without measuring recall end up with a fast system that quietly stops returning the best matches — which is indistinguishable from a matching algorithm that got worse, and far harder to diagnose.',
        'Track that number over time rather than measuring once. Recall drifts as the data distribution changes, and a parameter that was right at fifty thousand vectors is not necessarily right at five hundred thousand.',
        'Plan the build cost too. Index construction on a large table is heavy enough to interfere with normal write traffic, so it belongs in a maintenance window rather than in whatever moment someone decided to try a new setting.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Do I need a dedicated vector database for job matching?',
      a: 'Usually not. At tens of thousands of vectors, Postgres with a vector extension is fast enough and keeps jobs and vectors in one transaction — removing the synchronisation problem entirely.',
    },
    {
      q: 'What should I evaluate when choosing a vector store?',
      a: 'Metadata filtering above all. Job matching is always "similar and in this country and still active", and stores that filter after retrieval leave you with three results from a hundred.',
    },
    {
      q: 'How do I handle expired jobs in a vector index?',
      a: 'Soft-delete with an active flag and filter on it, reclaiming space periodically — and embed on insert, since a posting searchable six hours late is already taken.',
    },
    {
      q: 'What is the risk of tuning an ANN index for speed?',
      a: 'Losing recall silently. Measure against exact search on a sample and track it over time, since recall drifts as the data distribution changes.',
    },
    {
      q: 'Is there a step before migrating to a dedicated store?',
      a: 'A read replica dedicated to matching. It removes the contention behind most migration triggers without adding a second data model.',
    },
    {
      q: 'What should I plan for before changing embedding models?',
      a: 'Running two generations side by side, with the active version enforced in the query. Otherwise the choice is a big-bang re-embed or never improving.',
    },
  ],
  related: ['postgresql-pgvector-for-ai-job-search', 'how-to-build-a-job-matching-system-using-embeddings', 'how-to-build-semantic-job-search'],
  references: [
    {
      title: 'pgvector',
      url: 'https://github.com/pgvector/pgvector',
      publisher: 'GitHub',
      note: 'Index types, distance operators and the parameters that set the recall trade.',
    },
  ],
};

export default post;
