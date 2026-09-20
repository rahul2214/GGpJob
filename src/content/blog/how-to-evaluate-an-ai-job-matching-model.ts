import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-evaluate-an-ai-job-matching-model',
  tint: 'violet',
  title: 'How to Evaluate an AI Job Matching Model',
  heading: 'Evaluating a matching model',
  description:
    'Building an evaluation for job matching: labelled sets, offline metrics that mean something, online tests, fairness checks and catching silent regressions.',
  keywords: [
    'evaluate job matching model',
    'matching model evaluation',
    'offline evaluation ranking',
    'ndcg recall at k',
    'ab testing recommendations',
    'fairness evaluation hiring',
    'regression testing ai',
    'model evaluation metrics',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['evaluating matching', 'labelled set'],
  excerpt:
    'Most teams cannot tell whether a change improved their matching. That is not a metrics problem — it is that nobody built the evaluation set first.',
  keyTakeaways: [
    'An evaluation built after shipping is biased by what you already shipped.',
    'Measure the top of a ranked list, because that is how the output is consumed.',
    'Offline evaluation is a cheap gate; online experiments make the decision.',
    'Aggregate metrics are specifically unable to reveal subgroup harm.',
    'A fixed regression set in CI is the highest-value evaluation infrastructure most teams lack.',
  ],
  sections: [
    {
      heading: 'Build the labelled set before you need it',
      paragraphs: [
        'Every matching system reaches a moment when someone asks whether the new approach is better, and the honest answer is that nobody knows. Building the evaluation afterwards is possible and always biased by what you have already shipped.',
        'A few hundred CV-and-posting pairs, judged by people who understand hiring, is enough to be decisive. Get judgements on a scale rather than a binary: "strong fit", "worth applying", "wrong seniority", "not eligible" distinguish failures that a yes/no label collapses.',
        'Sample the awkward cases deliberately rather than taking a uniform draw. Career changers, non-standard backgrounds, senior candidates and roles with unusual titles are where matching actually fails, and a random sample of typical pairs mostly confirms that easy cases are easy.',
      ],
    },
    {
      heading: 'Pick metrics that match how results are used',
      paragraphs: [
        'Accuracy is the wrong frame. Nobody consumes a matching system as a classifier — they look at a ranked list and read the top of it. So measure the top: whether the good matches are in the first handful, and how deep you must go to find them.',
        'Recall at a realistic cut-off tells you whether the right jobs are reachable at all. A rank-weighted quality metric tells you whether they are near the top. Both are needed: high recall with bad ordering feels broken to a user who never scrolls.',
        'Measure retrieval and ranking separately. A good role that never reached the shortlist cannot be recovered by a better ranker, and the two failures are indistinguishable in a single end-to-end number while needing entirely different fixes.',
      ],
      bullets: [
        'Recall at the depth users actually read, not at 100',
        'A rank-weighted quality score for ordering',
        'Eligibility violations counted separately — these are bugs, not misses',
        'Coverage: the share of postings that are ever recommended to anyone',
      ],
      table: {
        caption: 'What each layer of evaluation can answer',
        columns: ['Layer', 'Answers', 'Cannot answer'],
        rows: [
          ['Labelled set', 'Did this change agree with judgement?', 'Will anyone apply?'],
          ['Regression set in CI', 'Did something break?', 'Is it better?'],
          ['Online experiment', 'Do applications and responses rise?', 'Why'],
          ['Holdout group', 'Is personalisation working at all?', 'Which component'],
          ['Fairness slices', 'Who is being harmed?', 'Nothing else will show it'],
        ],
      },
    },
    {
      heading: 'Offline results will not survive contact with users',
      paragraphs: [
        'Offline evaluation measures agreement with labels. It cannot measure whether people apply, whether employers respond, or whether the feed feels stale after a week. Those only appear online.',
        'So use offline evaluation as a gate — it catches regressions cheaply and fast — and online experiments as the decision. Anything that passes offline and then fails online has taught you something about your labels, which is worth recording.',
        'Choose the online metric carefully, because clicks reward the wrong thing. A feed optimised for click-through converges on well-known companies and attractive titles, which produces engagement rather than employment — so the metric that decides should be applications that received a response.',
      ],
    },
    {
      heading: 'Evaluate fairness explicitly, because it will not show up otherwise',
      paragraphs: [
        'Matching systems learn from historical patterns, and hiring history contains patterns nobody wants to reproduce. An aggregate metric that improves can hide a subgroup for which results got worse.',
        'Slice the evaluation: by years of experience, by career-break presence, by non-standard background, by region. Look at whether the score distribution differs for equivalent candidates. This is a legal exposure as well as an ethical one, and aggregate numbers are specifically unable to reveal it.',
        'Test with matched profiles differing in one signal as well as slicing real traffic. Slices find harm that already happened; matched pairs find the mechanism, and running both is what separates a discovered problem from an explained one.',
        'Agree in advance what a failed fairness check triggers. A threshold with no defined consequence becomes a number somebody explains away under delivery pressure, and the time to decide that a material disparity blocks a release is before one appears.',
      ],
    },
    {
      heading: 'Guard against the silent regression',
      paragraphs: [
        'The dangerous failures are not the ones that throw errors. A model version changes, an extraction step improves, a chunking parameter is tuned, and the scores shift for reasons unrelated to fit. Everything still returns results, so nothing alerts.',
        'Keep a fixed regression set with expected outcomes and run it in CI on every pipeline change. It is unglamorous and it is the single highest-value piece of evaluation infrastructure most teams are missing.',
        'Include the components upstream of the model. An extraction regression, a chunking change or an approximate index quietly losing recall all present as worse matching, and a suite that only exercises the final score cannot tell you which of them moved.',
      ],
    },
    {
      heading: 'Keeping the evaluation set honest over time',
      paragraphs: [
        'A labelled set degrades. Postings close, the market shifts, the roles you are matching against stop resembling the ones you labelled eighteen months ago, and a suite that only ever goes up is usually measuring its own age.',
        'Refresh part of it on a schedule and keep the rest fixed. The fixed portion catches regressions; the refreshed portion keeps the evaluation representative, and mixing both avoids the two failure modes of a stale benchmark and a moving target.',
        'Guard against tuning to the set. A system that improves on your labels for six months while users report no difference has been fitted to the evaluation rather than to the problem, which is exactly what a holdout group exists to detect.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How large does a job matching evaluation set need to be?',
      a: 'A few hundred judged pairs is usually enough to be decisive — sampled towards the awkward cases rather than uniformly, since easy pairs mostly confirm that easy is easy.',
    },
    {
      q: 'Which metrics should I use for job matching?',
      a: 'Recall at the depth users actually read, plus a rank-weighted quality score, measured separately for retrieval and ranking. Count eligibility violations as bugs, not misses.',
    },
    {
      q: 'Is offline evaluation enough?',
      a: 'No. It measures agreement with labels, not whether people apply or employers respond. Use it as a cheap regression gate and let online experiments make the decision.',
    },
    {
      q: 'How do I check a matching model for bias?',
      a: 'Slice real traffic by experience, career breaks, background and region, and test matched profiles differing in one signal. Slices find the harm; matched pairs find the mechanism.',
    },
    {
      q: 'Why measure retrieval and ranking separately?',
      a: 'Because a role that never reached the shortlist cannot be fixed by a better ranker. The failures look identical end to end and need different work.',
    },
    {
      q: 'Can an evaluation set go stale?',
      a: 'Yes. Refresh part of it on a schedule and keep the rest fixed — otherwise a suite that only goes up is measuring its own age.',
    },
  ],
  related: ['how-to-build-an-ai-job-relevance-score', 'how-to-build-an-ai-job-recommendation-engine', 'how-companies-use-ai-in-hiring'],
};

export default post;
