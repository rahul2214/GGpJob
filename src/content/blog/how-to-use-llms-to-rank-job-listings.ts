import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-use-llms-to-rank-job-listings',
  tint: 'violet',
  title: 'How to Use LLMs to Rank Job Listings',
  heading: 'LLM re-ranking for job listings',
  description:
    'Using a language model as a re-ranker: where it belongs in the pipeline, pointwise vs listwise scoring, position bias, cost control and consistency.',
  keywords: [
    'llm reranking',
    'rank job listings ai',
    'llm as reranker',
    'pointwise vs listwise ranking',
    'position bias llm',
    'reranking cost',
    'search ranking model',
    'job ranking pipeline',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'A model ranks job listings well and inconsistently. Both halves of that sentence determine how you should use it.',
  sections: [
    {
      heading: 'It is a re-ranker, not a retriever',
      paragraphs: [
        'A model cannot look at fifty thousand postings. It can look at fifty, and it will order those fifty better than a similarity score will, because it understands that six years of one framework implies competence in a related one.',
        'So the model sits last. Cheap retrieval produces the candidate set, filters remove the ineligible, and the model orders what remains. Anyone trying to use a model as the primary search is solving the wrong problem expensively.',
      ],
    },
    {
      heading: 'Score each listing, or order them together?',
      paragraphs: [
        'Scoring each posting independently is parallelisable, cheap to cache and stable — the same pair always gets the same treatment. Its weakness is that independent scores cluster: without seeing alternatives, the model rates most things a 7.',
        'Judging a whole list at once produces better relative ordering, because comparison is easier than absolute judgement. It costs more per call, cannot be cached per posting, and introduces position bias — the model favours whatever appeared first. Shuffle the order across runs if you go this way.',
      ],
      bullets: [
        'Pointwise: cacheable, parallel, stable — but poorly spread',
        'Listwise: better ordering — but position-biased and uncacheable',
        'A practical middle: pointwise to shortlist, listwise on the top ten',
      ],
    },
    {
      heading: 'Give it the criteria, not just the documents',
      paragraphs: [
        'Handing the model a CV and fifty postings and asking for a ranking gets you the model’s own idea of what matters, which will not be the candidate’s. It tends to over-weight title similarity and under-weight things the candidate cares about, like compensation or the seniority step.',
        'State the criteria explicitly and in priority order. Ranking quality improves markedly, and — more importantly — it becomes a thing you can tune rather than a black box you argue with.',
      ],
    },
    {
      heading: 'Control cost before it controls you',
      paragraphs: [
        'Re-ranking on every page load, for every user, is the fastest way to a bill nobody approved. The cost is per comparison, so it scales with traffic rather than with catalogue size, which is the direction that hurts.',
        'Cache aggressively against a key of the profile version and the posting version. Re-rank only the first page of results, since almost nobody reaches the third. And set a hard budget per request that degrades to the cheaper ordering rather than failing.',
      ],
    },
    {
      heading: 'Expect inconsistency, and test for it',
      paragraphs: [
        'The same pair can score differently across runs, and a prompt change can reorder everything. That is tolerable in a ranking and intolerable if you show the score as a stable number to the user.',
        'Keep a fixed evaluation set with known-good orderings and run it on every prompt or model change. Without that, "the ranking got worse" is a report you cannot act on.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can an LLM replace search ranking entirely?',
      a: 'No. It cannot see fifty thousand postings. It belongs last in the pipeline, ordering the fifty that cheap retrieval and filters have already produced.',
    },
    {
      q: 'Is pointwise or listwise ranking better?',
      a: 'Listwise orders better because comparison beats absolute judgement, but it is position-biased and uncacheable. A practical compromise is pointwise to shortlist, then listwise on the top ten.',
    },
    {
      q: 'Why does the model rank by title similarity?',
      a: 'Because you did not tell it what matters. State the criteria explicitly and in priority order — that improves quality and makes the ranking tunable instead of a black box.',
    },
    {
      q: 'How do I keep LLM re-ranking affordable?',
      a: 'Cache against profile and posting versions, re-rank only the first page, and set a per-request budget that degrades to the cheaper ordering rather than failing.',
    },
  ],
  related: ['how-to-build-semantic-job-search', 'how-to-build-an-ai-job-relevance-score', 'how-to-evaluate-an-ai-job-matching-model'],
};

export default post;
