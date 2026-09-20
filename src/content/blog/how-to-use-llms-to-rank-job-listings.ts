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
  anchors: ['LLM re-ranking', 'rank job listings'],
  excerpt:
    'A model ranks job listings well and inconsistently. Both halves of that sentence determine how you should use it.',
  keyTakeaways: [
    'The model sits last, ordering what retrieval and filters already produced.',
    'Pointwise is cacheable and clusters; listwise orders better and is position-biased.',
    'State the criteria in priority order, or you get the model’s idea of what matters.',
    'Cost scales with traffic rather than catalogue size, which is the direction that hurts.',
    'Keep a fixed evaluation set, or "the ranking got worse" is unactionable.',
  ],
  sections: [
    {
      heading: 'It is a re-ranker, not a retriever',
      paragraphs: [
        'A model cannot look at fifty thousand postings. It can look at fifty, and it will order those fifty better than a similarity score will, because it understands that six years of one framework implies competence in a related one.',
        'So the model sits last. Cheap retrieval produces the candidate set, filters remove the ineligible, and the model orders what remains. Anyone trying to use a model as the primary search is solving the wrong problem expensively.',
        'That placement also caps the damage it can do. A re-ranker cannot recover a good role that retrieval never surfaced, and it cannot admit one that a filter excluded — which is worth knowing when a bad result appears and you are deciding which layer to investigate.',
      ],
    },
    {
      heading: 'Score each listing, or order them together?',
      paragraphs: [
        'Scoring each posting independently is parallelisable, cheap to cache and stable — the same pair always gets the same treatment. Its weakness is that independent scores cluster: without seeing alternatives, the model rates most things a 7.',
        'Judging a whole list at once produces better relative ordering, because comparison is easier than absolute judgement. It costs more per call, cannot be cached per posting, and introduces position bias — the model favours whatever appeared first. Shuffle the order across runs if you go this way.',
        'Listwise also has a context ceiling. Twenty full postings and a CV is a large prompt, so the practical form is short summaries in the list with a separate fetch for detail — which is the same discipline that keeps any agent context usable.',
      ],
      bullets: [
        'Pointwise: cacheable, parallel, stable — but poorly spread',
        'Listwise: better ordering — but position-biased and uncacheable',
        'A practical middle: pointwise to shortlist, listwise on the top ten',
      ],
      table: {
        caption: 'Choosing between the two',
        columns: ['Property', 'Pointwise', 'Listwise'],
        rows: [
          ['Cacheable per posting', 'Yes', 'No'],
          ['Parallelisable', 'Yes', 'One call'],
          ['Score spread', 'Poor, clusters', 'Good, relative'],
          ['Position bias', 'None', 'Real — shuffle'],
          ['Cost per result', 'Higher', 'Lower for a page'],
          ['Explainable per item', 'Yes', 'Harder'],
        ],
      },
    },
    {
      heading: 'Give it the criteria, not just the documents',
      paragraphs: [
        'Handing the model a CV and fifty postings and asking for a ranking gets you the model’s own idea of what matters, which will not be the candidate’s. It tends to over-weight title similarity and under-weight things the candidate cares about, like compensation or the seniority step.',
        'State the criteria explicitly and in priority order. Ranking quality improves markedly, and — more importantly — it becomes a thing you can tune rather than a black box you argue with.',
        'Keep the hard constraints out of it entirely. Eligibility, location and a salary floor are filters that ran before this step, and re-introducing them as criteria invites the model to trade one off against a strong skills match.',
        'Require a one-line reason per result. It costs very little, it is what makes a recommendation credible to the candidate, and a reason that reads as thin is a reliable signal that the match was thin.',
      ],
    },
    {
      heading: 'Control cost before it controls you',
      paragraphs: [
        'Re-ranking on every page load, for every user, is the fastest way to a bill nobody approved. The cost is per comparison, so it scales with traffic rather than with catalogue size, which is the direction that hurts.',
        'Cache aggressively against a key of the profile version and the posting version. Re-rank only the first page of results, since almost nobody reaches the third. And set a hard budget per request that degrades to the cheaper ordering rather than failing.',
        'Precompute the feed rather than re-ranking interactively where you can. A daily ordering computed in batch and served from a lookup costs a fraction of the same work done per page view, and the underlying profile changes slowly enough that it rarely matters.',
        'Track cost per user per day, not only the total. One user whose configuration triggers forty times the average is invisible in an aggregate, obvious per user, and always a configuration problem rather than a pricing one.',
      ],
    },
    {
      heading: 'Expect inconsistency, and test for it',
      paragraphs: [
        'The same pair can score differently across runs, and a prompt change can reorder everything. That is tolerable in a ranking and intolerable if you show the score as a stable number to the user.',
        'Keep a fixed evaluation set with known-good orderings and run it on every prompt or model change. Without that, "the ranking got worse" is a report you cannot act on.',
        'Store the model and prompt version with any score you persist, and re-rank a whole visible set at once when the ranking changes materially. A candidate comparing a role scored yesterday with one scored today is comparing two scales.',
        'Consider not showing the number at all. Order is what the candidate consumes, and a position in a list carries the useful information without inviting anyone to treat a difference of three points as meaningful.',
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
      a: 'Because you did not tell it what matters. State the criteria explicitly and in priority order — and keep hard constraints out, since they were filters, not criteria.',
    },
    {
      q: 'How do I keep LLM re-ranking affordable?',
      a: 'Cache against profile and posting versions, precompute the feed in batch, re-rank only the first page, and track cost per user per day.',
    },
    {
      q: 'Should the score be shown to the candidate?',
      a: 'Often not. Order carries the useful information, and a visible number invites treating a three-point difference as meaningful when it is run-to-run variation.',
    },
    {
      q: 'Why require a reason per result?',
      a: 'It makes the recommendation credible and it exposes bad matching — a reason that reads as thin is a reliable sign the match was thin.',
    },
  ],
  related: ['how-to-build-semantic-job-search', 'how-to-build-an-ai-job-relevance-score', 'how-to-evaluate-an-ai-job-matching-model'],
};

export default post;
