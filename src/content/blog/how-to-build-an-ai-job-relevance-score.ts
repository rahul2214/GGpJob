import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-relevance-score',
  tint: 'emerald',
  title: 'How to Build an AI Job Relevance Score',
  heading: 'Designing a relevance score',
  description:
    'How to build a job relevance score people can trust: what goes in, how to weight it, why calibration matters more than accuracy, and how to show it.',
  keywords: [
    'job relevance score',
    'ai match score',
    'score calibration',
    'relevance scoring model',
    'job fit score',
    'explainable scoring',
    'weighting match signals',
    'match percentage design',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'A relevance score is a promise to the user. If 80% does not mean something specific and consistent, the number is decoration.',
  sections: [
    {
      heading: 'Decide what the number means first',
      paragraphs: [
        'Most match scores mean nothing in particular. They are a weighted blend of whatever signals were available, scaled so the output looks like a percentage. Users read them as a probability, which they are not.',
        'Pick a definition and hold to it. "The share of stated requirements this candidate demonstrably meets" is defensible and checkable. "The estimated probability of reaching an interview" is also defensible, and needs outcome data to back it. What you cannot do is leave it undefined and still expect trust.',
      ],
    },
    {
      heading: 'Separate the inputs by kind',
      paragraphs: [
        'Requirements are not interchangeable. A hard eligibility constraint, a must-have skill and a nice-to-have preference behave completely differently, and blending them into one average destroys the distinction.',
        'Treat eligibility as a gate: fail it and there is no score, because no amount of skill match makes an ineligible application worth submitting. Then score must-haves and nice-to-haves with separate weights, and report them separately.',
      ],
      bullets: [
        'Eligibility — binary, gates the whole score',
        'Must-have requirements — heavily weighted, individually reported',
        'Preferred requirements — lightly weighted',
        'Contextual signals — seniority band, domain adjacency, recency of the skill',
      ],
    },
    {
      heading: 'Calibration beats accuracy',
      paragraphs: [
        'A score can rank candidates correctly and still be useless if the numbers do not mean what they appear to. If everything lands between 70 and 90, the user cannot distinguish a strong fit from a weak one, and the score stops informing any decision.',
        'Check the distribution on real data. Scores should spread across the range, and if you claim a probability, roughly the stated fraction of the 70% cases should actually succeed. Most scoring systems have never been checked this way.',
      ],
    },
    {
      heading: 'Never ship the number alone',
      paragraphs: [
        'A bare percentage invites the one question you must be able to answer: why. Without a breakdown, a user who disagrees with the score has no way to tell whether the system missed something in their CV or whether they genuinely lack the requirement.',
        'Show which requirements were met, which were not, and what evidence was used. This also turns the score into something useful rather than merely informative — an unmet requirement the candidate can actually address.',
      ],
    },
    {
      heading: 'Watch for the failure you will not notice',
      paragraphs: [
        'Scores drift. Postings change in style, your extraction improves, a model version changes, and the same candidate scores differently for reasons unrelated to fit. Nobody notices because there is no alarm on a number that looks plausible.',
        'Keep a fixed regression set of CV and posting pairs with expected scores, and run it whenever anything in the pipeline changes. It is the cheapest safeguard available and almost nobody builds it.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What should a job match score actually mean?',
      a: 'Pick a definition and keep it: the share of stated requirements demonstrably met, or the estimated probability of reaching an interview. An undefined blend read as a percentage will not earn trust.',
    },
    {
      q: 'How should eligibility factor into the score?',
      a: 'As a gate, not a weight. If someone cannot legally take the role, no amount of skill match makes the application worth submitting, so there should be no score at all.',
    },
    {
      q: 'Why does calibration matter more than accuracy?',
      a: 'Because a score that ranks correctly but clusters everything between 70 and 90 cannot inform any decision. Check the distribution spreads, and that stated probabilities match observed outcomes.',
    },
    {
      q: 'Should I show the score without a breakdown?',
      a: 'No. A bare percentage invites "why" and cannot answer it, so users cannot tell whether the system missed something or they genuinely lack the requirement. Show met, unmet and the evidence.',
    },
  ],
  related: ['how-to-calculate-resume-to-job-match-score', 'how-to-build-an-ai-job-recommendation-engine', 'how-to-evaluate-an-ai-job-matching-model'],
};

export default post;
