import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-recommendation-engine',
  tint: 'emerald',
  title: 'How to Build an AI Job Recommendation Engine',
  heading: 'Building a job recommendation engine',
  description:
    'Architecture for a job recommender: candidate generation, filtering, ranking, exploration, and the feedback loops that make it better or worse over time.',
  keywords: [
    'job recommendation engine',
    'build job recommender',
    'candidate generation ranking',
    'recommendation architecture',
    'job feed personalisation',
    'recommender feedback loop',
    'exploration exploitation jobs',
    'ai job recommendations',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'AI Engineering',
  excerpt:
    'The hard part of a job recommender is not the model. It is that the inventory expires, the user has no history, and the feedback you collect is biased by what you showed.',
  sections: [
    {
      heading: 'Why job recommendation is unusually hard',
      paragraphs: [
        'Recommending films is forgiving: the catalogue is stable, popular items stay popular, and a bad recommendation costs a user thirty seconds. None of that holds for jobs.',
        'The inventory expires in weeks. The "item" a candidate wants is one they will get, which depends on the employer as much as on them. And success is not a click — it is an offer, months later, which you may never observe.',
      ],
    },
    {
      heading: 'Two stages, not one',
      paragraphs: [
        'Separate candidate generation from ranking. Generation cuts millions of postings to a few hundred cheaply; ranking orders those few hundred carefully. Trying to score everything with your best model is the mistake that makes people conclude recommendation is too expensive.',
        'Generation can be several retrievers running together — embedding similarity to the profile, recent searches, roles similar to past applications, postings from employers who responded before. Union them and let ranking sort it out.',
      ],
      bullets: [
        'Generate: cheap retrievers, high recall, a few hundred results',
        'Filter: hard constraints, applied as a gate rather than a score',
        'Rank: the expensive model, on the shortlist only',
        'Diversify: enforce spread before the list is shown',
      ],
    },
    {
      heading: 'Hard constraints are gates, not features',
      paragraphs: [
        'Right to work, location feasibility and a closed posting are not signals to weigh. Feeding them into a scoring function means a sufficiently strong match can overwhelm them, and the candidate is shown a role they cannot take.',
        'Keep them as a filter that runs before ranking. It is simpler, it is faster, and it cannot be traded away by a confident model.',
      ],
    },
    {
      heading: 'The feedback loop will mislead you',
      paragraphs: [
        'You only observe outcomes for what you showed. If the system rarely surfaces a category, you get no positive signal from it, so the model learns it is bad, so it surfaces it less. The loop closes quietly and the metrics look fine throughout.',
        'The mitigations are known: reserve a fraction of slots for exploration, log what was shown as well as what was clicked, and evaluate on held-out data where you can reason about what was not shown. None is optional at scale.',
      ],
    },
    {
      heading: 'Choose a metric that is not clicks',
      paragraphs: [
        'Optimising click-through gets you eye-catching titles and inflated salary bands. Optimising applications gets you low-effort postings. Both improve the number while making the product worse.',
        'The honest target is a successful application — a response, an interview, an offer. That signal is sparse and slow, so use it to validate rather than to train, and treat the fast proxies as suspects that need checking against it.',
      ],
    },
    {
      heading: 'Explain the recommendation',
      paragraphs: [
        'A job recommendation with no stated reason reads as spam, and candidates are already suspicious of automated feeds. "Because you worked with these tools at your last role" changes how the same result is received.',
        'Explanation also disciplines the system. If you cannot articulate why something was recommended, that is usually a sign the pipeline matched on something you would not defend.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why not score every job with one good model?',
      a: 'Cost and latency. Split into candidate generation — cheap retrievers cutting millions to hundreds — and ranking, which runs your expensive model on the shortlist only.',
    },
    {
      q: 'Should eligibility be part of the ranking score?',
      a: 'No. Right to work, location feasibility and closed postings are gates applied before ranking. As features they can be outweighed by a confident match, which shows candidates roles they cannot take.',
    },
    {
      q: 'What goes wrong with the feedback loop?',
      a: 'You only observe outcomes for what you showed, so under-surfaced categories generate no positive signal and get surfaced less. Reserve slots for exploration and log impressions, not just clicks.',
    },
    {
      q: 'What should a job recommender optimise for?',
      a: 'Successful applications, not clicks. Click-through rewards eye-catching titles and inflated salaries. The real signal is slow and sparse, so use it to validate the fast proxies rather than to train on directly.',
    },
  ],
  related: ['how-embeddings-improve-job-recommendations', 'how-to-build-a-recommendation-engine-for-jobs', 'how-to-build-an-ai-job-relevance-score'],
};

export default post;
