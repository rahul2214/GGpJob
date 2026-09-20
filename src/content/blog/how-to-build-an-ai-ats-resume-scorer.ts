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
  anchors: ['ATS resume scorer', 'parseability'],
  excerpt:
    'Most ATS scorers measure two unrelated things and add them together. Separating them is what makes the output useful.',
  keyTakeaways: [
    'Parseability and fit are unrelated questions and need separate scores.',
    'Parseability is deterministic — extract the text and show the candidate what came out.',
    'Fit is meaningless without a posting; a CV scored alone is measured against a template.',
    'A precise percentage claims knowledge nobody has; bands are honest and just as actionable.',
    'Say plainly when a rewrite cannot fix the problem.',
  ],
  sections: [
    {
      heading: 'Two different questions, two different scores',
      paragraphs: [
        'Can this document be read by machines, and is this candidate a good fit for this role? These have nothing to do with each other. A perfectly parseable CV can be a terrible match; a strong candidate can have a document that parses badly.',
        'Blending them into one number is why candidates get advice that does not help. Report them separately: a structural score that is the same for every application, and a fit score that changes with the posting.',
        'They also have different lifetimes, which is a practical reason to keep them apart. Parseability is fixed once and stays fixed; fit is recomputed per posting — so caching, cost and how often you show the result all differ between the two.',
      ],
    },
    {
      heading: 'Parseability is checkable, so check it',
      paragraphs: [
        'This half does not need a model. Extract text the way a parser would and inspect what came out: did sections come through in order, are dates readable, did the table in the header collapse into nonsense, is the contact information present.',
        'Run the extraction and show the candidate what it produced. Seeing their own CV as a parser sees it is more persuasive than any score, and it turns abstract advice into an obvious fix.',
        'Two-column layouts cause more of these failures than everything else combined. Text extracts in the document’s internal order rather than the visual one, so a job title from the sidebar lands under the wrong employer and the result is structurally valid and completely wrong.',
      ],
      bullets: [
        'Text extraction succeeds and preserves reading order',
        'Sections identifiable — experience, education, skills',
        'Dates in a consistently parseable form',
        'Contact details present and extractable',
        'No content trapped in images, text boxes or multi-column layouts',
      ],
      table: {
        caption: 'The two halves, side by side',
        columns: ['', 'Parseability', 'Fit'],
        rows: [
          ['Needs a posting', 'No', 'Yes'],
          ['Changes per application', 'No', 'Yes'],
          ['Needs a model', 'No', 'Yes'],
          ['Has a correct answer', 'Yes', 'No'],
          ['Fixable by the candidate', 'Almost always', 'Sometimes'],
          ['Right output', 'Pass, with specific faults', 'A band, with per-requirement detail'],
        ],
      },
    },
    {
      heading: 'Fit needs the posting, and needs to be honest',
      paragraphs: [
        'Scoring a CV without a job description produces generic advice, because fit is only meaningful relative to a specific role. A tool that scores a CV alone is measuring conformity to a template.',
        'With a posting, extract its requirements and check each against evidence in the CV. Report per requirement — met, partially met, absent — because that is what the candidate can act on, and it is what a single percentage destroys.',
        'Weight the requirements rather than counting them. Missing one thing named in the job title is a different situation from missing three items in a list of twelve nice-to-haves, and a system that treats those as the same number is giving the same advice to two candidates in entirely different positions.',
      ],
    },
    {
      heading: 'Do not manufacture precision',
      paragraphs: [
        'A score of 73% implies a measurement that does not exist. Nobody knows what the employer’s threshold is, how many others applied or how their system weighs anything, and presenting a precise number claims knowledge you do not have.',
        'Bands are more honest and just as useful: strong, worth applying, likely to be screened out, missing a hard requirement. Candidates make the same decision from a band, without over-trusting a number that was never measured.',
        'Precision also invites the wrong behaviour. A candidate shown 73% will try to reach 80, and the fastest route is padding the CV with the posting’s vocabulary — which improves the number, makes the document worse to a human reader, and is exactly what the tool should not be encouraging.',
      ],
    },
    {
      heading: 'The advice a scorer should refuse to give',
      paragraphs: [
        'Keyword stuffing is the obvious one. Telling a candidate to insert terms they cannot evidence produces a document that passes a filter and fails the interview, and the tool is optimising the stage it can see rather than the outcome the candidate wants.',
        'Design conformity is the quieter one. Advice to remove all formatting, adopt one template and match a standard structure produces documents that parse cleanly and are indistinguishable from each other, which helps nobody once every candidate has taken it.',
        'And avoid inventing thresholds. "ATS systems reject CVs under 60%" is a claim with no source, and stating it confidently makes a candidate act on something invented — which is worse than saying that the employer’s actual criteria are not knowable from here.',
      ],
      bullets: [
        'Never suggest a term the candidate cannot evidence',
        'Never claim a specific employer threshold',
        'Never recommend formatting that removes a document’s readability for humans',
        'Never present a fit judgement as a measurement',
      ],
    },
    {
      heading: 'Make every finding actionable',
      paragraphs: [
        'A finding the candidate cannot act on is noise. "Your CV scores 62" changes nothing. "This posting asks for Kubernetes and your CV never mentions it — if you have used it, say where" changes the next version.',
        'Sort findings by how much they would move the outcome, and be explicit when the answer is that the CV cannot fix it. Telling someone the requirement is genuinely absent is more respectful than implying a rewrite would help.',
        'Show three findings rather than fifteen. A long list is read as a verdict on the candidate rather than a set of edits, and the three that matter get lost among twelve that do not.',
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
      a: 'Bands are more honest. A precise score claims a measurement nobody has, and it pushes candidates to pad the document to move a number.',
    },
    {
      q: 'What makes resume feedback useful?',
      a: 'Actionability, and brevity. Three findings sorted by impact change the next version; fifteen read as a verdict on the candidate.',
    },
    {
      q: 'What causes most parsing failures?',
      a: 'Two-column layouts. Text extracts in the document internal order rather than the visual one, so content lands under the wrong heading and still looks structurally valid.',
    },
    {
      q: 'What advice should a scorer refuse to give?',
      a: 'Keyword stuffing, invented employer thresholds, and formatting changes that make a document worse for human readers to satisfy a parser.',
    },
  ],
  related: ['how-applicant-tracking-systems-work', 'how-to-build-an-ai-ats-scoring-system', 'how-to-build-an-ai-resume-keyword-optimizer'],
};

export default post;
