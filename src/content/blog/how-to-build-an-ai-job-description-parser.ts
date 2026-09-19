import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-description-parser',
  tint: 'emerald',
  title: 'How to Build an AI Job Description Parser',
  heading: 'Parsing a job description',
  description:
    'Extracting structured data from job postings: what to pull out, separating requirements from wish list, grounding every field, and evaluating the parser.',
  keywords: [
    'job description parser',
    'jd parsing ai',
    'requirement extraction',
    'structured job data',
    'salary extraction',
    'seniority detection',
    'parser evaluation',
    'job posting nlp',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'Everything downstream — matching, scoring, tailoring — reads this parser’s output. Its errors do not stay local.',
  sections: [
    {
      heading: 'Decide what you need before extracting',
      paragraphs: [
        'Postings contain a great deal that no downstream feature uses: company history, benefits prose, equal opportunity statements, application instructions. Extracting everything produces a large object nobody reads and makes evaluation harder.',
        'Work backwards from what matching, filtering and tailoring need, and extract exactly that. A smaller schema is more accurate, cheaper and much easier to verify.',
      ],
      bullets: [
        'Role title, normalised and as written',
        'Requirements, split into hard and preferred',
        'Seniority, only when the text supports a judgement',
        'Location and remote policy, distinguishing remote from hybrid',
        'Salary with currency and period, or absent',
      ],
    },
    {
      heading: 'Hard versus preferred is the important split',
      paragraphs: [
        'Postings mix genuine requirements with aspirational ones, often in the same list. Treating them identically makes every candidate look underqualified and every match score pessimistic.',
        'The signals are mostly linguistic — "must", "required", "essential" against "nice to have", "bonus", "ideally" — and a model handles the ambiguous cases well. Where it cannot tell, default to preferred rather than hard, since over-filtering candidates is the more damaging error.',
      ],
    },
    {
      heading: 'Never infer what is not stated',
      paragraphs: [
        'The failure that matters most is a parser filling in plausible values. An inferred salary band, an inferred seniority, an inferred remote policy — each becomes a fact in your database that nobody can distinguish from a stated one.',
        'Require grounding: every extracted field must be supported by text in the posting, and absent fields stay absent. A candidate filtered out by an invented salary band has been failed by a system they cannot see.',
      ],
    },
    {
      heading: 'Normalise carefully, and keep the original',
      paragraphs: [
        'Titles, locations and technologies need normalisation to be useful for filtering, and normalisation loses information. "Staff Engineer, Platform" becomes "Software Engineer" and something real disappears.',
        'Keep both: the normalised value for filtering and the original for display and for the model that reads the posting later. Discarding the raw text is a decision you cannot reverse.',
      ],
    },
    {
      heading: 'Evaluate against real postings',
      paragraphs: [
        'Parsers degrade quietly when a model version changes or a prompt is edited, and nothing errors — the output is still the right shape, with slightly different content.',
        'Keep a labelled set of a hundred or so real postings with expected extractions and run it on every change. Pay particular attention to the unusual ones: postings in two languages, postings for several roles at once, postings that are mostly company description.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What should a job description parser extract?',
      a: 'Only what downstream features use — title, hard and preferred requirements, seniority, location and remote policy, salary. A smaller schema is more accurate and easier to verify.',
    },
    {
      q: 'Why separate hard from preferred requirements?',
      a: 'Because postings mix genuine and aspirational requirements in one list. Treating them identically makes every candidate look underqualified and every score pessimistic.',
    },
    {
      q: 'Should the parser infer a missing salary or seniority?',
      a: 'Never. An inferred value becomes indistinguishable from a stated one, and a candidate filtered out by an invented salary band cannot see why.',
    },
    {
      q: 'How do I stop a parser degrading silently?',
      a: 'Keep a labelled set of around a hundred real postings with expected extractions and run it on every prompt or model change — the output stays well-shaped while the content drifts.',
    },
  ],
  related: ['how-to-extract-skills-from-a-job-description', 'how-to-build-an-ai-resume-parser', 'how-to-build-an-ai-job-aggregator-with-llms'],
};

export default post;
