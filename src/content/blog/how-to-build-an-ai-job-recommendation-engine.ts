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
  anchors: ['job recommendation engine', 'candidate generation'],
  excerpt:
    'The hard part of a job recommender is not the model. It is that the inventory expires, the user has no history, and the feedback you collect is biased by what you showed.',
  keyTakeaways: [
    'Expiring inventory, absent history and employer-side selection make this unlike other recommenders.',
    'Two stages: cheap generation for recall, expensive ranking on the shortlist.',
    'Hard constraints are gates — as features they can be outvoted.',
    'The feedback loop closes quietly, and exploration is the only thing that keeps it open.',
    'Optimise applications that got responses, not clicks.',
  ],
  sections: [
    {
      heading: 'Why job recommendation is unusually hard',
      paragraphs: [
        'Recommending films is forgiving: the catalogue is stable, popular items stay popular, and a bad recommendation costs a user thirty seconds. None of that holds for jobs.',
        'The inventory expires in weeks. The "item" a candidate wants is one they will get, which depends on the employer as much as on them. And success is not a click — it is an offer, months later, which you may never observe.',
        'There is also a second party who has to agree. Recommending a role the candidate loves and will not be shortlisted for is a failure of a kind that has no equivalent in a media recommender, and it is invisible to any metric measured on the candidate side alone.',
      ],
    },
    {
      heading: 'Two stages, not one',
      paragraphs: [
        'Separate candidate generation from ranking. Generation cuts millions of postings to a few hundred cheaply; ranking orders those few hundred carefully. Trying to score everything with your best model is the mistake that makes people conclude recommendation is too expensive.',
        'Generation can be several retrievers running together — embedding similarity to the profile, recent searches, roles similar to past applications, postings from employers who responded before. Union them and let ranking sort it out.',
        'Tune generation for recall and ranking for precision, and measure them separately. A role that never reached the shortlist cannot be recovered by a better ranker, so a recall failure and a ranking failure need different fixes and look identical in a final metric.',
      ],
      bullets: [
        'Generate: cheap retrievers, high recall, a few hundred results',
        'Filter: hard constraints, applied as a gate rather than a score',
        'Rank: the expensive model, on the shortlist only',
        'Diversify: enforce spread before the list is shown',
      ],
      table: {
        caption: 'What each stage is for',
        columns: ['Stage', 'Optimise for', 'Cost', 'Failure looks like'],
        rows: [
          ['Generation', 'Recall', 'Very low', 'A good role never appears'],
          ['Filtering', 'Correctness', 'Negligible', 'An ineligible role shown'],
          ['Ranking', 'Precision', 'High per item', 'The right roles ordered badly'],
          ['Diversification', 'Spread', 'Negligible', 'Five near-identical roles'],
        ],
      },
    },
    {
      heading: 'Hard constraints are gates, not features',
      paragraphs: [
        'Right to work, location feasibility and a closed posting are not signals to weigh. Feeding them into a scoring function means a sufficiently strong match can overwhelm them, and the candidate is shown a role they cannot take.',
        'Keep them as a filter that runs before ranking. It is simpler, it is faster, and it cannot be traded away by a confident model.',
        'Freshness deserves the same treatment for closed postings specifically. A candidate sent to two dead links stops trusting the feed entirely, so re-checking the handful you are about to show is cheap insurance where re-checking the whole index is not.',
      ],
    },
    {
      heading: 'Cold start is the normal case here',
      paragraphs: [
        'In most recommenders cold start is an edge case. In a job marketplace it is the default: every posting is new, most expire before accumulating any interaction, and every candidate arrives with no history at the moment they most need good results.',
        'That is the argument for content-based retrieval as the backbone rather than behavioural signals. A posting published an hour ago can be recommended on what it says, which is the only mechanism that works for the majority of the inventory.',
        'The first session is also where preference data is cheapest to collect. Three dismissals with a one-tap reason, gathered while someone is looking at concrete roles, are worth more than a week of passive behaviour afterwards.',
      ],
    },
    {
      heading: 'The feedback loop will mislead you',
      paragraphs: [
        'You only observe outcomes for what you showed. If the system rarely surfaces a category, you get no positive signal from it, so the model learns it is bad, so it surfaces it less. The loop closes quietly and the metrics look fine throughout.',
        'The mitigations are known: reserve a fraction of slots for exploration, log what was shown as well as what was clicked, and evaluate on held-out data where you can reason about what was not shown. None is optional at scale.',
        'Log position alongside the impression. A role at the top of a feed and the same role at the bottom get very different attention, so a click rate that ignores where something appeared is measuring the layout as much as the preference.',
        'Keep a small unpersonalised holdout permanently. It is the only way to know whether six months of personalisation work improved anything, and it costs a fraction of the effort spent arguing about the alternative.',
      ],
    },
    {
      heading: 'Choose a metric that is not clicks',
      paragraphs: [
        'Optimising click-through gets you eye-catching titles and inflated salary bands. Optimising applications gets you low-effort postings. Both improve the number while making the product worse.',
        'The honest target is a successful application — a response, an interview, an offer. That signal is sparse and slow, so use it to validate rather than to train, and treat the fast proxies as suspects that need checking against it.',
        'Employer behaviour belongs in the ranking for the same reason. A role at a company that never responds produces applications and no outcomes, which flatters every fast metric while wasting the candidate’s effort entirely.',
      ],
    },
    {
      heading: 'Explain the recommendation',
      paragraphs: [
        'A job recommendation with no stated reason reads as spam, and candidates are already suspicious of automated feeds. "Because you worked with these tools at your last role" changes how the same result is received.',
        'Explanation also disciplines the system. If you cannot articulate why something was recommended, that is usually a sign the pipeline matched on something you would not defend.',
        'It only works if the intermediate result was kept. Matching claim to requirement leaves something to point at; comparing two document-level vectors leaves a number and nothing to say about it, which is a design decision made much earlier than the explanation feature.',
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
      a: 'You only observe outcomes for what you showed, so under-surfaced categories generate no positive signal and get surfaced less. Reserve slots for exploration, log impressions with position, and keep a holdout.',
    },
    {
      q: 'What should a job recommender optimise for?',
      a: 'Successful applications, not clicks. Click-through rewards eye-catching titles and inflated salaries. The real signal is slow and sparse, so use it to validate the fast proxies rather than to train on directly.',
    },
    {
      q: 'Why is cold start the default case here?',
      a: 'Because every posting is new, most expire before accumulating interaction, and every candidate arrives with no history at the moment they most need good results.',
    },
    {
      q: 'Why measure generation and ranking separately?',
      a: 'Because a role that never reached the shortlist cannot be recovered by a better ranker. The two failures look identical in a final metric and need different fixes.',
    },
  ],
  related: ['how-embeddings-improve-job-recommendations', 'how-to-build-a-recommendation-engine-for-jobs', 'how-to-build-an-ai-job-relevance-score'],
};

export default post;
