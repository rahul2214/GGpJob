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
  anchors: ['relevance score', 'score calibration'],
  excerpt:
    'A relevance score is a promise to the user. If 80% does not mean something specific and consistent, the number is decoration.',
  keyTakeaways: [
    'Pick a definition the number keeps, or users will read it as a probability it never was.',
    'Eligibility gates; must-haves and preferences are weighted separately and reported separately.',
    'A score clustered between 70 and 90 informs no decision, however well it ranks.',
    'Never ship the number without the breakdown that answers "why".',
    'Keep a fixed regression set of pairs, because scores drift with nothing raising an alarm.',
  ],
  sections: [
    {
      heading: 'Decide what the number means first',
      paragraphs: [
        'Most match scores mean nothing in particular. They are a weighted blend of whatever signals were available, scaled so the output looks like a percentage. Users read them as a probability, which they are not.',
        'Pick a definition and hold to it. "The share of stated requirements this candidate demonstrably meets" is defensible and checkable. "The estimated probability of reaching an interview" is also defensible, and needs outcome data to back it. What you cannot do is leave it undefined and still expect trust.',
        'Consider whether a number is the right output at all. Bands — strong, worth considering, a stretch, not a fit — carry the same decision with none of the false precision, and they stop a candidate reading meaning into the gap between 74 and 77.',
      ],
    },
    {
      heading: 'Separate the inputs by kind',
      paragraphs: [
        'Requirements are not interchangeable. A hard eligibility constraint, a must-have skill and a nice-to-have preference behave completely differently, and blending them into one average destroys the distinction.',
        'Treat eligibility as a gate: fail it and there is no score, because no amount of skill match makes an ineligible application worth submitting. Then score must-haves and nice-to-haves with separate weights, and report them separately.',
        'Weight by how the posting stated the requirement rather than by where it sat. A skill in the job title, repeated through the responsibilities, is the real requirement; one item in a bulleted list of twelve rarely is, whatever heading was above it.',
      ],
      bullets: [
        'Eligibility — binary, gates the whole score',
        'Must-have requirements — heavily weighted, individually reported',
        'Preferred requirements — lightly weighted',
        'Contextual signals — seniority band, domain adjacency, recency of the skill',
      ],
      table: {
        caption: 'How each input behaves',
        columns: ['Input', 'Role', 'If it fails'],
        rows: [
          ['Right to work', 'Gate', 'No score at all'],
          ['Location feasibility', 'Gate', 'No score at all'],
          ['Salary floor', 'Gate, if set', 'Excluded'],
          ['Must-have skill', 'Heavy weight', 'Large reduction, reported'],
          ['Preferred skill', 'Light weight', 'Minor reduction'],
          ['Seniority distance', 'Asymmetric weight', 'A stretch is fine; three levels is not'],
        ],
      },
    },
    {
      heading: 'Calibration beats accuracy',
      paragraphs: [
        'A score can rank candidates correctly and still be useless if the numbers do not mean what they appear to. If everything lands between 70 and 90, the user cannot distinguish a strong fit from a weak one, and the score stops informing any decision.',
        'Check the distribution on real data. Scores should spread across the range, and if you claim a probability, roughly the stated fraction of the 70% cases should actually succeed. Most scoring systems have never been checked this way.',
        'The compression usually comes from averaging. Blending six partly correlated signals pulls everything towards the middle by construction, so a clustered distribution is a modelling result rather than a statement that all candidates are similar.',
      ],
    },
    {
      heading: 'Never ship the number alone',
      paragraphs: [
        'A bare percentage invites the one question you must be able to answer: why. Without a breakdown, a user who disagrees with the score has no way to tell whether the system missed something in their CV or whether they genuinely lack the requirement.',
        'Show which requirements were met, which were not, and what evidence was used. This also turns the score into something useful rather than merely informative — an unmet requirement the candidate can actually address.',
        'Phrase an unmet requirement as what the CV shows rather than what the person lacks. About half of flagged gaps in practice are things the candidate has and never wrote down, and "your CV does not evidence this" converts directly into a stronger application where "you lack this" sends them away.',
      ],
    },
    {
      heading: 'Watch for the failure you will not notice',
      paragraphs: [
        'Scores drift. Postings change in style, your extraction improves, a model version changes, and the same candidate scores differently for reasons unrelated to fit. Nobody notices because there is no alarm on a number that looks plausible.',
        'Keep a fixed regression set of CV and posting pairs with expected scores, and run it whenever anything in the pipeline changes. It is the cheapest safeguard available and almost nobody builds it.',
        'Store the model and prompt version with every score, and re-score a whole visible set at once when the scoring changes materially. A candidate comparing a role scored yesterday against one scored today is comparing two scales, and that is worse than either scale alone.',
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
      a: 'No. A bare percentage invites "why" and cannot answer it. Show met, unmet and the evidence — phrased as what the CV shows rather than what the person lacks.',
    },
    {
      q: 'Why do scores cluster in the middle?',
      a: 'Averaging. Blending several partly correlated signals pulls everything towards the centre by construction, which is a modelling artefact rather than a fact about candidates.',
    },
    {
      q: 'Would bands be better than a percentage?',
      a: 'Often. Strong, worth considering, a stretch, not a fit carries the same decision without inviting anyone to read meaning into the gap between 74 and 77.',
    },
  ],
  related: ['how-to-calculate-resume-to-job-match-score', 'how-to-build-an-ai-job-recommendation-engine', 'how-to-evaluate-an-ai-job-matching-model'],
};

export default post;
