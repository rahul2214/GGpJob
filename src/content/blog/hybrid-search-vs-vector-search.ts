import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'hybrid-search-vs-vector-search',
  tint: 'emerald',
  title: 'Hybrid Search vs Vector Search: Why Pure Vector RAG Fails',
  heading: 'Hybrid search vs vector search: why pure vector RAG quietly fails',
  description:
    'Vector search vs keyword search (BM25): why pure semantic embeddings miss exact keywords, part numbers, and how hybrid reciprocal rank fusion solves it.',
  keywords: [
    'hybrid search vs vector search',
    'vector search vs keyword search',
    'bm25 vs vector search',
    'what is hybrid search',
    'do you really need a vector database for rag',
    'can postgresql replace a vector database',
    'why pure vector search fails',
    'reciprocal rank fusion rrf',
    'hybrid search in rag',
    'semantic search vs keyword search',
  ],
  publishedAt: '2026-09-26',
  updatedAt: '2026-09-26',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'AI Engineering',
  anchors: ['hybrid search vs vector search', 'BM25 and vector search'],
  excerpt:
    'Pure vector search is great for conceptual synonyms, but notoriously bad at finding product SKUs, error codes, and exact names. Hybrid search combines BM25 and vector embeddings to give you the best of both worlds.',
  keyTakeaways: [
    'Pure vector search maps concepts to high-dimensional space, excelling at synonyms but failing catastrophically on exact string matches.',
    'Keyword search (BM25) matches exact tokens, serial numbers, and technical terms, but fails when users use different phrasing for the same idea.',
    'Hybrid search executes both sparse lexical search (BM25) and dense semantic search (embeddings) in parallel.',
    'Reciprocal Rank Fusion (RRF) normalizes and merges rank lists from both systems without requiring delicate score tuning.',
    'You do not need separate databases: PostgreSQL with pg_trgm/tsvector and pgvector provides world-class hybrid search natively.',
  ],
  sections: [
    {
      heading: 'The dirty secret of pure vector search',
      paragraphs: [
        'When teams first experiment with vector search, the results feel magical. You search for "automobile maintenance" and the system effortlessly retrieves documents talking about "car repair" and "oil changes", even though the exact words differ. This semantic capability led many to believe traditional keyword search was dead.',
        'In production, however, pure vector search exhibits an infuriating flaw: it is terrible at exact matches. If a user searches for an error code like `ERR_AUTH_TIMEOUT_504`, a medical catalog number like `XR-892-A`, or a specific executive name, embedding models often dilute those distinct character tokens across broad semantic dimensions. The vector search returns general articles about authentication or timeouts, completely missing the exact technical doc detailing that specific error code.',
        'This phenomenon occurs because embedding models are trained on general linguistic semantics rather than verbatim lexical equality. When exact precision matters, vector search alone fails.',
      ],
    },
    {
      heading: 'Understanding BM25 keyword search: the reliable foundation',
      paragraphs: [
        'BM25 (Best Matching 25) is the industry-standard probabilistic ranking function that powered search engines like Lucene, Elasticsearch, and Google for decades. It scores documents based on term frequency (how often a word appears in a document) inverted by document frequency (penalizing common words like "the" or "is").',
        'BM25 is unbeatable for exact terms, acronyms, code identifiers, phone numbers, and unique product names. It requires no GPU compute, indexes gigabytes of text in seconds, and executes in single-digit milliseconds.',
        'The limitation of BM25 is vocabulary mismatch: if a user searches for "affordable lodging" and a listing only uses the phrase "budget hotels", BM25 will return zero results.',
      ],
      table: {
        caption: 'Comparison: Keyword Search (BM25) vs Vector Search vs Hybrid Search',
        columns: ['Feature', 'Keyword Search (BM25)', 'Dense Vector Search', 'Hybrid Search (BM25 + Vector)'],
        rows: [
          ['Exact Token Matching', 'Exceptional (SKUs, IDs, Names)', 'Poor (diffuses exact characters)', 'Exceptional'],
          ['Synonym & Concept Matching', 'Fails without manual thesaurus', 'Exceptional (semantic embeddings)', 'Exceptional'],
          ['Out-of-Vocabulary Terms', 'Native (matches exact string)', 'Poor (compresses into average vector)', 'Native'],
          ['Compute / Indexing Cost', 'Extremely cheap (CPU-only)', 'Expensive (GPU embedding models)', 'Moderate'],
          ['Failure Modes', 'Vocabulary mismatch', 'False-positive semantic hallucinations', 'Extremely Low'],
        ],
      },
    },
    {
      heading: 'How Hybrid Search merges both worlds: Reciprocal Rank Fusion',
      paragraphs: [
        'Hybrid search does not attempt to create a single magic algorithm; it runs both BM25 and vector search in parallel and combines their results.',
        'The challenge in hybrid search is score normalization: BM25 returns arbitrary positive unbounded float scores (e.g. 18.4), while vector search returns cosine similarity floats between 0.0 and 1.0. Directly adding these numbers together leads to one search method dominating the other.',
        'The standard production solution is Reciprocal Rank Fusion (RRF). Instead of looking at raw scores, RRF evaluates the rank position of each document in both result sets using the formula `Score = 1 / (60 + Rank)`. A document that finishes in the top 3 of either search — or consistently places in the top 10 of both — gets boosted to the top of the final output.',
      ],
      example: {
        title: 'Hybrid search in an IT troubleshooting portal',
        paragraphs: [
          'User query: "How do I fix Postgres error code 28P01 invalid password?"',
          'BM25 search: Pulls documents explicitly matching the exact error code token `28P01`.',
          'Vector search: Pulls conceptual guides about database authentication failure and user password rotation.',
          'RRF fusion: The exact troubleshooting guide for `28P01` ranks #1 because it satisfies both the exact code requirement and the conceptual context.',
        ],
      },
    },
    {
      heading: 'Do you really need a dedicated vector database for hybrid search?',
      paragraphs: [
        'A common architectural anti-pattern is deploying an Elasticsearch cluster for keyword search alongside a Pinecone or Qdrant cluster for vector search. Managing two separate search clusters requires two indexing pipelines, two backup regimes, and complex synchronization logic to prevent index drift.',
        'For 95% of applications, you can achieve elite hybrid search within PostgreSQL alone. PostgreSQL natively supports full-text search with `tsvector` and `tsquery` (using BM25-like BM25/TF-IDF ranking), alongside vector similarity search via the `pgvector` extension.',
        'You can write a single SQL query that executes a full-text search and a vector similarity query simultaneously, applies Reciprocal Rank Fusion in a Common Table Expression (CTE), and returns the fused results in less than 50 milliseconds.',
      ],
      bullets: [
        'Never rely on vector search alone for code, medical, legal, or product catalog search',
        'Implement Reciprocal Rank Fusion (RRF) to combine sparse lexical and dense semantic results',
        'Consolidate search infrastructure inside PostgreSQL (using pg_trgm/tsvector and pgvector) before adding separate cluster overhead',
        'Add a lightweight reranking step (like Cross-Encoders or Cohere Rerank) to the top 20 hybrid results for maximum precision',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is hybrid search?',
      a: 'Hybrid search combines traditional keyword-based lexical search (like BM25) with semantic vector search (dense embeddings) to find documents that match both exact keywords and conceptual meanings.',
    },
    {
      q: 'Why does pure vector search fail?',
      a: 'Vector search projects words into broad semantic clusters. It frequently fails when looking for exact alphanumeric tokens like serial numbers, software error codes, API function names, and product model numbers.',
    },
    {
      q: 'What is Reciprocal Rank Fusion (RRF)?',
      a: 'RRF is an algorithm used to merge ranked lists from different search engines without needing to calibrate their raw scores. It assigns document weights based on their reciprocal position rank in each search list.',
    },
    {
      q: 'Can PostgreSQL do hybrid search?',
      a: 'Yes. PostgreSQL combines built-in full-text search (`tsvector`) with the `pgvector` extension, allowing you to perform hybrid keyword and semantic vector queries in a single database transaction.',
    },
    {
      q: 'Is hybrid search better than pure vector RAG?',
      a: 'Yes. Empirical benchmarks consistently show that hybrid search delivers higher retrieval accuracy, lower hallucination rates, and superior handling of edge-case user queries compared to pure vector RAG.',
    },
  ],
  related: [
    'postgresql-pgvector-for-ai-job-search',
    'keyword-matching-vs-semantic-matching',
    'rag-alternatives-in-2026',
    'how-to-use-vector-databases-for-ai-job-matching',
  ],
  references: [
    {
      title: 'Reciprocal Rank Fusion Outperforms Hypervolume Scoring',
      url: 'https://arxiv.org/abs/2304.03442',
      publisher: 'arXiv',
      note: 'Foundational academic study on rank fusion techniques across disparate information retrieval systems.',
    },
    {
      title: 'PostgreSQL Full Text Search and Indexing Documentation',
      url: 'https://postgresql.org/',
      publisher: 'PostgreSQL',
      note: 'Technical specifications for tsvector, tsquery, and full-text search in PostgreSQL.',
    },
  ],
};

export default post;
