import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'keyword-matching-vs-semantic-matching',
  tint: 'emerald',
  title: 'Keyword Matching vs Semantic Matching for Job Search',
  heading: 'Keyword or semantic search?',
  description:
    'Where keyword search still wins, where semantic search wins, why hybrid retrieval beats both, and what this means for candidates writing a CV.',
  keywords: [
    'keyword vs semantic matching',
    'semantic job search',
    'hybrid search jobs',
    'bm25 vs embeddings',
    'lexical vs vector search',
    'job search relevance',
    'search ranking jobs',
    'ats keyword matching',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'Semantic search is not a replacement for keyword search. They fail on opposite inputs, which is precisely why the good systems run both.',
  sections: [
    {
      heading: 'They fail on opposite things',
      paragraphs: [
        'Keyword search fails when the same idea is expressed differently — "ETL" and "data pipelines", "SDR" and "sales development". It returns nothing and the user concludes there are no such jobs.',
        'Semantic search fails on exact tokens: a specific certification name, a version number, an uncommon product, an acronym it has not learned. It returns things that are broadly about the right area and miss the precise thing the user typed.',
      ],
    },
    {
      heading: 'Keyword search is better than its reputation',
      paragraphs: [
        'For rare, precise terms, lexical matching is not merely adequate — it is correct. Someone searching for an exact framework, a clearance level or a named qualification wants documents containing that token, not documents that are conceptually adjacent.',
        'It is also instant, cheap, and completely explainable: you can point at why a result matched. Those properties matter more in production than they do in benchmarks.',
      ],
    },
    {
      heading: 'Semantic search earns its place on intent',
      paragraphs: [
        'Where it wins is when the user does not know the vocabulary the postings use. "Jobs where I help customers succeed technically" has no literal match and a clear meaning, and only an embedding-based approach connects it to solutions engineering roles.',
        'This is also the case for CV-to-job matching, where the candidate never chose their words with a search engine in mind.',
      ],
    },
    {
      heading: 'Hybrid, with fusion',
      paragraphs: [
        'Run both and combine the rankings. The standard approach is reciprocal rank fusion, which merges result lists without needing the two scores to be on a comparable scale — a detail that matters, because lexical and vector scores are not comparable and naive weighted averaging quietly favours whichever produces larger numbers.',
        'Then re-rank the merged top results with a cross-encoder or a model if quality justifies the cost. This is the architecture behind most search that feels good.',
      ],
      bullets: [
        'Lexical retrieval for exact and rare terms',
        'Vector retrieval for intent and paraphrase',
        'Rank fusion rather than score averaging',
        'Optional re-ranking of the merged shortlist',
      ],
    },
    {
      heading: 'What this means if you are writing a CV',
      paragraphs: [
        'Since screening systems increasingly run both, write for both. Use the natural language that describes your work properly — semantic matching rewards it — and also include the literal terms a posting would use, because lexical matching only finds what is there.',
        'That is not keyword stuffing. It is writing "built and operated ETL pipelines" rather than choosing between the plain description and the jargon.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is semantic search better than keyword search?',
      a: 'Not universally — they fail on opposite inputs. Keyword search is correct for rare exact terms; semantic search handles intent and paraphrase. Good systems run both.',
    },
    {
      q: 'Why not just average the two scores?',
      a: 'Lexical and vector scores are not on a comparable scale, so averaging quietly favours whichever produces larger numbers. Rank fusion combines the orderings instead of the raw scores.',
    },
    {
      q: 'When does keyword search clearly win?',
      a: 'Rare, precise tokens: a certification name, a version, an uncommon product, an acronym. The user wants documents containing that term, not conceptually adjacent ones.',
    },
    {
      q: 'How should I write a CV given both are used?',
      a: 'Include the natural description and the literal term — "built and operated ETL pipelines" rather than choosing one. That serves both retrieval methods without stuffing keywords.',
    },
  ],
  related: ['how-to-match-a-resume-with-a-job-description', 'how-to-build-semantic-job-search', 'how-applicant-tracking-systems-work'],
};

export default post;
