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
  excerpt:
    'Most job boards do not need a dedicated vector database. Knowing when you cross that line saves an unnecessary piece of infrastructure.',
  sections: [
    {
      heading: 'You probably do not need one yet',
      paragraphs: [
        'At tens of thousands of vectors, similarity search in your existing database is fast enough and vastly simpler to operate. A dedicated vector store adds a system to deploy, monitor, back up and keep in sync with your source of truth.',
        'That synchronisation is the hidden cost. Two stores means two truths, and reconciling them after a partial failure is work nobody plans for. Postgres with a vector extension keeps jobs and their vectors in one transaction, which removes the whole class of problem.',
      ],
    },
    {
      heading: 'When the line is crossed',
      paragraphs: [
        'Dedicated stores earn their place at genuinely large scale, with high query concurrency, or when you need index features your database does not offer. Millions of vectors with heavy concurrent search is a real reason.',
        'Latency pressure is another: if you are serving matches interactively and your database’s index cannot hold the tail latency, that is measurable and worth acting on. Migrate on a measurement, not on an expectation.',
      ],
    },
    {
      heading: 'Metadata filtering is the thing to evaluate',
      paragraphs: [
        'Job matching is never pure similarity. It is "similar, and in this country, and active, and within this seniority band" — and how a store combines filters with vector search differs enormously.',
        'Filtering after retrieval is the trap: request the top hundred, filter by country, and be left with three because the other ninety-seven were elsewhere. You need pre-filtering or filtered search, and this single property should drive the choice more than raw benchmark speed.',
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
      ],
    },
    {
      heading: 'Tune the index, and know what you traded',
      paragraphs: [
        'Approximate nearest-neighbour indexes trade recall for speed, and the defaults are rarely right for your data. The important thing is knowing what you gave up: measure recall against an exact search on a sample before and after tuning.',
        'Teams that tune for latency without measuring recall end up with a fast system that quietly stops returning the best matches — which is indistinguishable from a matching algorithm that got worse, and far harder to diagnose.',
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
      a: 'Soft-delete with an active flag and filter on it, reclaiming space periodically. Immediate hard deletes from an approximate index are often costly and sometimes incomplete.',
    },
    {
      q: 'What is the risk of tuning an ANN index for speed?',
      a: 'Losing recall silently. Measure recall against exact search on a sample before and after — otherwise a fast index that stops returning the best matches looks exactly like a worse algorithm.',
    },
  ],
  related: ['postgresql-pgvector-for-ai-job-search', 'how-to-build-a-job-matching-system-using-embeddings', 'how-to-build-semantic-job-search'],
};

export default post;
