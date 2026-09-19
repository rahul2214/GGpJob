import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-semantic-job-search',
  tint: 'emerald',
  title: 'How to Build Semantic Job Search Using Vector Databases',
  heading: 'Building semantic job search',
  description:
    'A working design for semantic job search: what to index, hybrid retrieval, filtering without wrecking recall, re-ranking, and how to tell whether it improved.',
  keywords: [
    'semantic job search',
    'vector search jobs',
    'hybrid retrieval jobs',
    'build semantic search',
    'job search relevance',
    'reranking search results',
    'search evaluation',
    'vector database search',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Semantic search feels magical in a demo and disappoints in production for reasons that are entirely predictable — and mostly avoidable.',
  sections: [
    {
      heading: 'Index the posting in pieces',
      paragraphs: [
        'Embedding an entire job posting as one vector puts the benefits, the boilerplate about equal opportunity and the actual requirements into a single average. Searches then match on the parts nobody cares about.',
        'Split the posting into meaningful units — the role summary, each requirement, the responsibilities — and embed those separately. Keep a pointer back to the posting so retrieval can deduplicate to one result per job.',
      ],
    },
    {
      heading: 'Run lexical search alongside it',
      paragraphs: [
        'Pure vector search fails on the exact tokens users care most about: a named framework, a clearance level, a specific certification. It returns things broadly about the area and misses the precise term typed into the box.',
        'Run both retrievers and fuse the rankings. Reciprocal rank fusion is the reliable default because it combines orderings rather than scores, and lexical and vector scores are not on a comparable scale — averaging them silently favours whichever produces larger numbers.',
      ],
      bullets: [
        'Lexical retrieval for rare and exact terms',
        'Vector retrieval for intent and paraphrase',
        'Rank fusion to merge the two lists',
        'Deduplicate to one row per posting after fusion',
      ],
    },
    {
      heading: 'Filter before you retrieve, not after',
      paragraphs: [
        'Job search always carries constraints: country, right to work, employment type, whether the posting is still open. Retrieving the top hundred by similarity and then filtering leaves you with a handful, because most of the hundred were somewhere else.',
        'The filter has to be part of the retrieval. Check that your store supports this properly — filtered search or pre-filtering — because this one property matters more for job search than benchmark latency ever will.',
      ],
    },
    {
      heading: 'Re-rank the shortlist',
      paragraphs: [
        'Retrieval optimises for recall: get the plausible set. Ranking optimises for precision: order it well. Trying to do both in one step is why results feel almost right but never quite.',
        'Take the fused top fifty and re-rank them with a cross-encoder or a model that sees the query and posting together. It is expensive per pair, which is why it runs on fifty rows and not fifty thousand.',
      ],
    },
    {
      heading: 'Decide how you will know it worked',
      paragraphs: [
        'Build the evaluation set before the launch, not after the complaints. A few hundred real queries with judged results is enough to tell whether a change helped, and without it every tuning decision is a guess dressed up as engineering.',
        'Watch the behavioural signals too — searches returning nothing, searches immediately refined, results clicked below position ten. Those tell you where the system is failing in ways an offline metric will not.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should I embed the whole job posting?',
      a: 'No. That averages requirements together with benefits and equal-opportunity boilerplate. Embed the summary, responsibilities and each requirement separately, with a pointer back to the posting.',
    },
    {
      q: 'Is vector search enough on its own?',
      a: 'No. It misses exact tokens users care about — a named framework, a clearance level, a certification. Run lexical retrieval alongside it and fuse the rankings.',
    },
    {
      q: 'Why does filtering after retrieval fail?',
      a: 'Because most of the top hundred by similarity will be outside your country or already closed, leaving a handful of results. The filter must be part of retrieval, not applied afterwards.',
    },
    {
      q: 'Do I need a re-ranking step?',
      a: 'If you want results that feel right rather than nearly right, yes. Retrieval optimises recall and ranking optimises precision; re-rank the fused top fifty with a cross-encoder.',
    },
  ],
  related: ['keyword-matching-vs-semantic-matching', 'how-to-use-vector-databases-for-ai-job-matching', 'how-to-use-llms-to-rank-job-listings'],
};

export default post;
