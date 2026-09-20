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
  anchors: ['matching on Postgres', 'scoring in SQL'],
  excerpt:
    'You can get a long way with one database and no new infrastructure — and knowing exactly how far is what keeps the architecture honest.',
  keyTakeaways: [
    'One database means one consistency model, which removes a whole category of stale-result bugs.',
    'Full-text search handles exact terms correctly and instantly; generate the vector as a stored column.',
    'Arithmetic scoring belongs in SQL over the filtered set; judgement belongs in a model over the shortlist.',
    'Materialise what is expensive and slow-changing, and keep a timestamp so staleness is visible.',
    'Name the exit thresholds in advance — "the data is getting big" is not one.',
  ],
  sections: [
    {
      heading: 'One database is a feature',
      paragraphs: [
        'A matching system spread across a search cluster, a vector store and the primary database has three consistency problems and three things to operate. Every one of those is a source of the failure where results reference a job that no longer exists.',
        'Postgres does full-text search, vector similarity, JSON, and the relational joins you need for employers, applications and permissions. For a job board below serious scale, that combination is not a compromise — it is less to get wrong.',
        'Transactions are the underrated part. A posting closing and disappearing from search in the same commit is a property you get for free here and have to engineer carefully in any split architecture, and it is precisely the failure candidates notice.',
      ],
    },
    {
      heading: 'Full-text search covers more than expected',
      paragraphs: [
        'Built-in text search with proper configuration handles stemming, ranking and phrase queries perfectly well. For exact terms — a certification, a framework, a clearance level — it is not merely adequate but correct, and it is instantaneous on an indexed column.',
        'Generate the search vector as a stored column so it stays in sync automatically. Hand-maintained denormalised search text drifts, and drift in a search index is invisible until someone reports that a job cannot be found.',
        'Weighting the document sections is a cheap and large improvement. Giving the title the highest weight, requirements the next and the company boilerplate the least means a posting whose title is the search term outranks one that mentions it in passing, which is what a user expects and a flat index does not deliver.',
      ],
    },
    {
      heading: 'Score in SQL while the scoring is simple',
      paragraphs: [
        'Skill overlap, seniority distance, location feasibility and recency can all be expressed as SQL and computed in one pass. That is fast, transactional and trivially testable, and it avoids fetching thousands of rows into application code to score them there.',
        'The limit arrives when scoring needs judgement rather than arithmetic — whether transferable experience counts, whether a domain is adjacent. That belongs in a model, applied to a shortlist the query produced.',
        'Keep the weights in a table rather than in the query text. Tuning then becomes a row update you can change per experiment and roll back, instead of a deployment — and it makes it possible to answer why a given job ranked where it did three weeks ago.',
      ],
      bullets: [
        'Hard filters in the WHERE clause, so ineligible rows never score',
        'Arithmetic scoring in SQL, over the filtered set',
        'Model judgement in the application, on the top rows only',
        'One query per request, not one query per candidate job',
        'Weights in a table, so tuning is data rather than a deploy',
      ],
      table: {
        caption: 'What belongs where',
        columns: ['Concern', 'Where', 'Why'],
        rows: [
          ['Eligibility', 'WHERE clause', 'Binary — must never be traded off'],
          ['Keyword and phrase match', 'Full-text index', 'Exact, fast, correct'],
          ['Semantic closeness', 'Vector distance', 'Handles unstandardised titles'],
          ['Recency, seniority distance', 'SQL arithmetic', 'Cheap over the filtered set'],
          ['Transferable experience', 'Model, on the shortlist', 'Requires judgement'],
          ['Employer response stats', 'Materialised view', 'Expensive, slow to change'],
        ],
      },
    },
    {
      heading: 'Materialise what is expensive and stable',
      paragraphs: [
        'Some things are costly to compute and change slowly: a candidate’s aggregated skill profile, an employer’s response statistics, a job’s normalised requirement list. Recomputing them per request is waste.',
        'Materialised views refreshed on a schedule handle this well. Refresh concurrently so reads are not blocked, and keep a timestamp so you can tell whether a surprising result came from stale data.',
        'A concurrent refresh needs a unique index on the view, which is easy to forget until the first refresh blocks every read for a minute in production. It is worth adding at the same moment the view is created rather than after the incident.',
      ],
    },
    {
      heading: 'The indexes that decide whether this works',
      paragraphs: [
        'Most disappointing performance here comes down to a query that could not use an index. A generated tsvector column with a GIN index over it, an index supporting the common eligibility filters, and an appropriate vector index are the three that matter.',
        'Read the plan rather than assuming. When a filter is highly selective — one country, one employment type, active only — an exact scan over the surviving rows frequently beats an approximate vector index on both latency and accuracy, and the planner’s choice depends on statistics that change as the table grows.',
        'Approximate vector indexes are the one place where a wrong result looks like a correct one. Recall degrades silently as parameters and data distribution drift, so comparing against an exact scan on a sample periodically is the only way to notice.',
      ],
    },
    {
      heading: 'Know the exit conditions',
      paragraphs: [
        'Staying on Postgres is right until specific things happen, and the point of naming them in advance is to avoid both premature migration and a panicked one.',
        'Watch for vector index build time interfering with writes, matching queries consuming capacity your transactional workload needs, and p95 latency that tuning no longer moves. Those are measurable thresholds. "The data is getting big" is not.',
        'There is an intermediate step before leaving, too, and it is usually enough: a read replica dedicated to matching. It removes the contention that triggers most of these thresholds without introducing a second data model or a second thing to operate.',
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
    {
      q: 'Why keep scoring weights in a table?',
      a: 'So tuning is a row update rather than a deployment, experiments can be rolled back, and you can still answer why a job ranked where it did three weeks ago.',
    },
    {
      q: 'Is there a step before migrating away?',
      a: 'A read replica dedicated to matching. It removes the contention behind most exit thresholds without adding a second data model or another system to operate.',
    },
  ],
  related: ['postgresql-pgvector-for-ai-job-search', 'how-to-build-a-job-recommendation-engine-with-pgvector', 'how-to-build-a-job-matching-system-using-embeddings'],
  references: [
    {
      title: 'Controlling Text Search',
      url: 'https://www.postgresql.org/docs/current/textsearch-controls.html',
      publisher: 'PostgreSQL',
      note: 'Ranking, weighting document sections and building tsvector values.',
    },
    {
      title: 'Generated Columns',
      url: 'https://www.postgresql.org/docs/current/ddl-generated-columns.html',
      publisher: 'PostgreSQL',
      note: 'How to keep a derived search column in sync without application code.',
    },
    {
      title: 'Materialized Views',
      url: 'https://www.postgresql.org/docs/current/rules-materializedviews.html',
      publisher: 'PostgreSQL',
      note: 'Including the unique index a concurrent refresh requires.',
    },
    {
      title: 'Using EXPLAIN',
      url: 'https://www.postgresql.org/docs/current/using-explain.html',
      publisher: 'PostgreSQL',
      note: 'Reading the plan, rather than assuming an index was used.',
    },
  ],
};

export default post;
