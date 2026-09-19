import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-job-matching-ai-with-postgresql',
  tint: 'sky',
  title: 'How to Build a Job Matching AI With PostgreSQL',
  heading: 'Job matching on plain Postgres',
  description:
    'Building matching with the database you already have: full-text search, vectors, scoring in SQL, materialised results and the point where a query is the wrong tool.',
  keywords: [
    'postgresql job matching',
    'job matching sql',
    'postgres full text search',
    'sql scoring query',
    'materialized view recommendations',
    'postgres ai matching',
    'database matching engine',
    'postgres over microservices',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'You can get a long way with one database and no new infrastructure — and knowing exactly how far is what keeps the architecture honest.',
  sections: [
    {
      heading: 'One database is a feature',
      paragraphs: [
        'A matching system spread across a search cluster, a vector store and the primary database has three consistency problems and three things to operate. Every one of those is a source of the failure where results reference a job that no longer exists.',
        'Postgres does full-text search, vector similarity, JSON, and the relational joins you need for employers, applications and permissions. For a job board below serious scale, that combination is not a compromise — it is less to get wrong.',
      ],
    },
    {
      heading: 'Full-text search covers more than expected',
      paragraphs: [
        'Built-in text search with proper configuration handles stemming, ranking and phrase queries perfectly well. For exact terms — a certification, a framework, a clearance level — it is not merely adequate but correct, and it is instantaneous on an indexed column.',
        'Generate the search vector as a stored column so it stays in sync automatically. Hand-maintained denormalised search text drifts, and drift in a search index is invisible until someone reports that a job cannot be found.',
      ],
    },
    {
      heading: 'Score in SQL while the scoring is simple',
      paragraphs: [
        'Skill overlap, seniority distance, location feasibility and recency can all be expressed as SQL and computed in one pass. That is fast, transactional and trivially testable, and it avoids fetching thousands of rows into application code to score them there.',
        'The limit arrives when scoring needs judgement rather than arithmetic — whether transferable experience counts, whether a domain is adjacent. That belongs in a model, applied to a shortlist the query produced.',
      ],
      bullets: [
        'Hard filters in the WHERE clause, so ineligible rows never score',
        'Arithmetic scoring in SQL, over the filtered set',
        'Model judgement in the application, on the top rows only',
        'One query per request, not one query per candidate job',
      ],
    },
    {
      heading: 'Materialise what is expensive and stable',
      paragraphs: [
        'Some things are costly to compute and change slowly: a candidate’s aggregated skill profile, an employer’s response statistics, a job’s normalised requirement list. Recomputing them per request is waste.',
        'Materialised views refreshed on a schedule handle this well. Refresh concurrently so reads are not blocked, and keep a timestamp so you can tell whether a surprising result came from stale data.',
      ],
    },
    {
      heading: 'Know the exit conditions',
      paragraphs: [
        'Staying on Postgres is right until specific things happen, and the point of naming them in advance is to avoid both premature migration and a panicked one.',
        'Watch for vector index build time interfering with writes, matching queries consuming capacity your transactional workload needs, and p95 latency that tuning no longer moves. Those are measurable thresholds. "The data is getting big" is not.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can Postgres alone handle job matching?',
      a: 'For most job boards, yes. It does full-text search, vector similarity, JSON and the relational joins matching needs — with one consistency model instead of three.',
    },
    {
      q: 'Should scoring happen in SQL or in application code?',
      a: 'Arithmetic scoring — skill overlap, seniority distance, recency — belongs in SQL over the filtered set. Judgement about transferable experience belongs in a model, applied to the shortlist the query produced.',
    },
    {
      q: 'How do I keep search text in sync?',
      a: 'Generate the search vector as a stored column rather than maintaining denormalised text by hand. Hand-maintained search text drifts, and drift is invisible until someone reports a missing job.',
    },
    {
      q: 'When should I move off Postgres?',
      a: 'When index builds interfere with writes, matching queries starve the transactional workload, or p95 latency stops responding to tuning. Those are thresholds; "the data is getting big" is not one.',
    },
  ],
  related: ['postgresql-pgvector-for-ai-job-search', 'how-to-build-a-job-recommendation-engine-with-pgvector', 'how-to-build-a-job-matching-system-using-embeddings'],
};

export default post;
