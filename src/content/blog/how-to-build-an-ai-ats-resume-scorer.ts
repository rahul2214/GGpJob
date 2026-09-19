import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-ats-resume-scorer',
  tint: 'emerald',
  title: 'How to Build an AI ATS Resume Scorer',
  heading: 'Building an ATS resume scorer',
  description:
    'What an ATS scorer should actually measure, separating parseability from fit, avoiding fake precision, and giving feedback a candidate can act on.',
  keywords: [
    'ats resume scorer',
    'build resume scoring tool',
    'resume parseability',
    'ats compatibility check',
    'resume feedback tool',
    'scoring rubric resume',
    'ats score accuracy',
    'resume checker design',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Resumes & ATS',
  excerpt:
    'Most ATS scorers measure two unrelated things and add them together. Separating them is what makes the output useful.',
  sections: [
    {
      heading: 'Two different questions, two different scores',
      paragraphs: [
        'Can this document be read by machines, and is this candidate a good fit for this role? These have nothing to do with each other. A perfectly parseable CV can be a terrible match; a strong candidate can have a document that parses badly.',
        'Blending them into one number is why candidates get advice that does not help. Report them separately: a structural score that is the same for every application, and a fit score that changes with the posting.',
      ],
    },
    {
      heading: 'Parseability is checkable, so check it',
      paragraphs: [
        'This half does not need a model. Extract text the way a parser would and inspect what came out: did sections come through in order, are dates readable, did the table in the header collapse into nonsense, is the contact information present.',
        'Run the extraction and show the candidate what it produced. Seeing their own CV as a parser sees it is more persuasive than any score, and it turns abstract advice into an obvious fix.',
      ],
      bullets: [
        'Text extraction succeeds and preserves reading order',
        'Sections identifiable — experience, education, skills',
        'Dates in a consistently parseable form',
        'Contact details present and extractable',
        'No content trapped in images, text boxes or multi-column layouts',
      ],
    },
    {
      heading: 'Fit needs the posting, and needs to be honest',
      paragraphs: [
        'Scoring a CV without a job description produces generic advice, because fit is only meaningful relative to a specific role. A tool that scores a CV alone is measuring conformity to a template.',
        'With a posting, extract its requirements and check each against evidence in the CV. Report per requirement — met, partially met, absent — because that is what the candidate can act on, and it is what a single percentage destroys.',
      ],
    },
    {
      heading: 'Do not manufacture precision',
      paragraphs: [
        'A score of 73% implies a measurement that does not exist. Nobody knows what the employer’s threshold is, how many others applied or how their system weighs anything, and presenting a precise number claims knowledge you do not have.',
        'Bands are more honest and just as useful: strong, worth applying, likely to be screened out, missing a hard requirement. Candidates make the same decision from a band, without over-trusting a number that was never measured.',
      ],
    },
    {
      heading: 'Make every finding actionable',
      paragraphs: [
        'A finding the candidate cannot act on is noise. "Your CV scores 62" changes nothing. "This posting asks for Kubernetes and your CV never mentions it — if you have used it, say where" changes the next version.',
        'Sort findings by how much they would move the outcome, and be explicit when the answer is that the CV cannot fix it. Telling someone the requirement is genuinely absent is more respectful than implying a rewrite would help.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What should an ATS resume scorer measure?',
      a: 'Two separate things: whether the document parses cleanly, which is the same for every application, and whether the candidate fits a specific posting, which changes with each one.',
    },
    {
      q: 'Can you score a resume without a job description?',
      a: 'Only for parseability. Fit is meaningful only relative to a specific role — a CV scored alone is being measured against a template, not a job.',
    },
    {
      q: 'Should the tool output a percentage?',
      a: 'Bands are more honest. A score of 73% implies a measurement nobody has, since the employer threshold, applicant pool and weighting are all unknown.',
    },
    {
      q: 'What makes resume feedback useful?',
      a: 'Actionability. Naming the specific missing requirement and what to do about it changes the next version; a number does not. And say plainly when a rewrite cannot fix it.',
    },
  ],
  related: ['how-applicant-tracking-systems-work', 'how-to-build-an-ai-ats-scoring-system', 'how-to-build-an-ai-resume-keyword-optimizer'],
};

export default post;
