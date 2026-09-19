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
  excerpt:
    'Most teams cannot tell whether a change improved their matching. That is not a metrics problem — it is that nobody built the evaluation set first.',
  sections: [
    {
      heading: 'Build the labelled set before you need it',
      paragraphs: [
        'Every matching system reaches a moment when someone asks whether the new approach is better, and the honest answer is that nobody knows. Building the evaluation afterwards is possible and always biased by what you have already shipped.',
        'A few hundred CV-and-posting pairs, judged by people who understand hiring, is enough to be decisive. Get judgements on a scale rather than a binary: "strong fit", "worth applying", "wrong seniority", "not eligible" distinguish failures that a yes/no label collapses.',
      ],
    },
    {
      heading: 'Pick metrics that match how results are used',
      paragraphs: [
        'Accuracy is the wrong frame. Nobody consumes a matching system as a classifier — they look at a ranked list and read the top of it. So measure the top: whether the good matches are in the first handful, and how deep you must go to find them.',
        'Recall at a realistic cut-off tells you whether the right jobs are reachable at all. A rank-weighted quality metric tells you whether they are near the top. Both are needed: high recall with bad ordering feels broken to a user who never scrolls.',
      ],
      bullets: [
        'Recall at the depth users actually read, not at 100',
        'A rank-weighted quality score for ordering',
        'Eligibility violations counted separately — these are bugs, not misses',
        'Coverage: the share of postings that are ever recommended to anyone',
      ],
    },
    {
      heading: 'Offline results will not survive contact with users',
      paragraphs: [
        'Offline evaluation measures agreement with labels. It cannot measure whether people apply, whether employers respond, or whether the feed feels stale after a week. Those only appear online.',
        'So use offline evaluation as a gate — it catches regressions cheaply and fast — and online experiments as the decision. Anything that passes offline and then fails online has taught you something about your labels, which is worth recording.',
      ],
    },
    {
      heading: 'Evaluate fairness explicitly, because it will not show up otherwise',
      paragraphs: [
        'Matching systems learn from historical patterns, and hiring history contains patterns nobody wants to reproduce. An aggregate metric that improves can hide a subgroup for which results got worse.',
        'Slice the evaluation: by years of experience, by career-break presence, by non-standard background, by region. Look at whether the score distribution differs for equivalent candidates. This is a legal exposure as well as an ethical one, and aggregate numbers are specifically unable to reveal it.',
      ],
    },
    {
      heading: 'Guard against the silent regression',
      paragraphs: [
        'The dangerous failures are not the ones that throw errors. A model version changes, an extraction step improves, a chunking parameter is tuned, and the scores shift for reasons unrelated to fit. Everything still returns results, so nothing alerts.',
        'Keep a fixed regression set with expected outcomes and run it in CI on every pipeline change. It is unglamorous and it is the single highest-value piece of evaluation infrastructure most teams are missing.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How large does a job matching evaluation set need to be?',
      a: 'A few hundred judged CV-and-posting pairs is usually enough to be decisive. Label on a scale — strong fit, worth applying, wrong seniority, not eligible — since a binary collapses distinct failures.',
    },
    {
      q: 'Which metrics should I use for job matching?',
      a: 'Recall at the depth users actually read, plus a rank-weighted quality score. Count eligibility violations separately — those are bugs, not ranking misses.',
    },
    {
      q: 'Is offline evaluation enough?',
      a: 'No. It measures agreement with labels, not whether people apply or employers respond. Use it as a cheap regression gate and let online experiments make the decision.',
    },
    {
      q: 'How do I check a matching model for bias?',
      a: 'Slice the evaluation by experience, career breaks, non-standard backgrounds and region, and compare score distributions for equivalent candidates. Aggregate metrics are specifically unable to reveal subgroup harm.',
    },
  ],
  related: ['how-to-build-an-ai-job-relevance-score', 'how-to-build-an-ai-job-recommendation-engine', 'how-companies-use-ai-in-hiring'],
};

export default post;
