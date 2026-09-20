import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-calculate-resume-to-job-match-score',
  tint: 'emerald',
  title: 'How to Calculate Resume-to-Job Match Score Using AI',
  heading: 'Calculating a match score',
  description:
    'Turning a CV and a posting into a score that means something: per-dimension scoring, weighting, handling missing data, and calibrating against real decisions.',
  keywords: [
    'resume job match score',
    'calculate match score ai',
    'cv job fit score',
    'candidate scoring algorithm',
    'weighted matching score',
    'job match percentage',
    'matching calibration',
    'ai fit scoring',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['match score', 'per-dimension scoring'],
  excerpt:
    'A single percentage is the least useful thing you can produce. The same 72% can mean a near-perfect fit in the wrong country or a mediocre fit next door.',
  keyTakeaways: [
    'Score each dimension and keep them; the combined number is only a sorting convenience.',
    'Weight by requirement strength, asymmetrically — a missing essential costs more than a bonus gains.',
    'Report coverage rather than filling gaps with assumptions.',
    'Let the model judge language and compute the arithmetic yourself.',
    'A score that does not separate responses from silence is decorative, whatever the formula.',
  ],
  sections: [
    {
      heading: 'Score dimensions, then combine',
      paragraphs: [
        'Collapsing everything into one number destroys the information that makes a score actionable. A role can match perfectly on skills and be impossible on location, and a blended figure hides exactly the fact the candidate needs.',
        'Score each dimension separately and keep them. The combined number is a convenience for sorting; the per-dimension breakdown is the product.',
        'Keep eligibility out of the arithmetic entirely. The right to work, a required licence and a stated salary floor are gates that run before scoring, because the moment they become weights a confident skills match will eventually outvote one of them.',
      ],
      bullets: [
        'Skills — overlap weighted by how essential each requirement is',
        'Seniority — is the candidate under, at, or over the level',
        'Domain — relevant industry or problem-space experience',
        'Location and work model — often binary in practice',
        'Compensation — where both sides state something',
      ],
      table: {
        caption: 'Same 72%, three different situations',
        columns: ['Skills', 'Seniority', 'Location', 'What to do'],
        rows: [
          ['Excellent', 'At level', 'Impossible', 'Excluded — not a 72%'],
          ['Excellent', 'Two levels up', 'Fine', 'Skip, or apply knowingly'],
          ['Adequate', 'At level', 'Fine', 'A reasonable application'],
          ['Thin', 'At level', 'Fine', 'Only if they want it badly'],
        ],
      },
    },
    {
      heading: 'Weight by requirement strength',
      paragraphs: [
        'Matching an essential requirement is worth far more than matching an incidental one, and missing an essential is worth far more than missing a nice-to-have. A naive count treats them identically and produces scores that do not track reality.',
        'Use the requirement tiers from extraction directly as weights. This is also where the asymmetry belongs: missing one essential requirement should cost more than matching an extra optional one gains.',
        'Seniority needs its own asymmetry. One level above the candidate’s evidence is a reasonable stretch and often where good outcomes are; three levels above is a waste of an afternoon, and a symmetric distance penalty treats over-qualification and under-qualification as the same problem when they are not.',
      ],
    },
    {
      heading: 'Handle missing data honestly',
      paragraphs: [
        'Most postings omit salary. Many CVs omit dates on older roles. The temptation is to fill the gap with an assumption, which quietly turns absence into evidence.',
        'Score only what you can observe and report coverage alongside the result. "68%, based on skills and seniority; location and salary unknown" is a useful statement. "68%" computed by assuming the unknowns were fine is not.',
        'Distinguish absent from unextracted while you are at it. A posting that states no salary and a posting whose salary your parser could not read are different facts, and treating them identically means you cannot tell a coverage gap from a parsing regression.',
      ],
    },
    {
      heading: 'Do not let the model produce the number',
      paragraphs: [
        'Asking a model for a percentage gives you an unstable figure that shifts between runs and cannot be explained. It looks quantitative and is not.',
        'Use the model where it is strong — judging whether a candidate’s described experience satisfies a stated requirement, which is a language question — and compute the arithmetic yourself. Then the score is reproducible, auditable and tunable, and each judgement behind it can be inspected.',
        'Keep the weights in configuration rather than in code, so tuning is a change you can make per experiment and roll back. It also means you can still answer why a role scored what it did three weeks ago, which a hard-coded formula that has since been edited cannot.',
      ],
    },
    {
      heading: 'Check the distribution before trusting the number',
      paragraphs: [
        'A score can rank correctly and still be useless. If everything lands between 65 and 85, the candidate cannot tell a strong fit from a weak one, and the number has stopped informing any decision it was built to support.',
        'That compression is usually a modelling artefact rather than a fact about candidates. Averaging several partly correlated dimensions pulls everything towards the middle by construction, so a clustered distribution is a signal to change the combination rather than a result to report.',
        'Consider whether bands are the honest output. Strong, worth considering, a stretch, not a fit carries the same decision with none of the false precision, and it stops anyone reading meaning into the difference between 71 and 74.',
      ],
    },
    {
      heading: 'Calibrate against decisions, not intuition',
      paragraphs: [
        'A score is only meaningful if it predicts something. Collect real outcomes — which applications got a response, which reached interview — and check whether your score separates them.',
        'If high-scoring applications do not get more responses than low-scoring ones, the score is decorative regardless of how reasonable the formula looks. That check is uncomfortable and it is the only one that matters.',
        'Use the candidate’s own decisions as a faster proxy. Thirty postings labelled apply or skip, compared against what the score said, gives you a usable signal in an afternoon where response data takes months — and the disagreements are where you learn something either way.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should a match score be a single percentage?',
      a: 'Only as a sorting convenience. Score each dimension separately and keep them — the same 72% can mean a perfect skills fit in the wrong country or a mediocre fit nearby.',
    },
    {
      q: 'Should the model generate the score directly?',
      a: 'No. Use it to judge whether described experience satisfies a stated requirement, then compute the arithmetic yourself with weights kept in configuration.',
    },
    {
      q: 'How do I handle missing information?',
      a: 'Score what you can observe and report coverage alongside the number. Filling gaps with assumptions turns absence into evidence and quietly makes the score wrong.',
    },
    {
      q: 'How do I know my match score works?',
      a: 'Check whether it separates applications that got responses from those that did not — and, faster, whether it agrees with thirty of the candidate own apply-or-skip decisions.',
    },
    {
      q: 'Why do my scores all cluster in the middle?',
      a: 'Averaging partly correlated dimensions pulls everything towards the centre by construction. It is a modelling artefact, not a statement that candidates are all similar.',
    },
    {
      q: 'Should seniority distance be symmetric?',
      a: 'No. One level up is a reasonable stretch; three is a waste of an afternoon, and over-qualification is a different problem from under-qualification.',
    },
  ],
  related: ['how-to-match-a-resume-with-a-job-description', 'how-to-build-an-ai-job-relevance-score', 'how-to-evaluate-an-ai-job-matching-model'],
};

export default post;
