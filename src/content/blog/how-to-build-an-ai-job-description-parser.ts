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
  anchors: ['job description parser', 'hard versus preferred'],
  excerpt:
    'Everything downstream — matching, scoring, tailoring — reads this parser’s output. Its errors do not stay local.',
  keyTakeaways: [
    'Work backwards from what downstream features need; a smaller schema is more accurate.',
    'Hard versus preferred is the split that decides whether match scores are usable.',
    'Never infer a value — an inferred salary is indistinguishable from a stated one.',
    'Normalise for filtering and keep the original, because normalisation is lossy.',
    'Parsers degrade silently, so run a labelled set on every prompt or model change.',
  ],
  sections: [
    {
      heading: 'Decide what you need before extracting',
      paragraphs: [
        'Postings contain a great deal that no downstream feature uses: company history, benefits prose, equal opportunity statements, application instructions. Extracting everything produces a large object nobody reads and makes evaluation harder.',
        'Work backwards from what matching, filtering and tailoring need, and extract exactly that. A smaller schema is more accurate, cheaper and much easier to verify.',
        'Stripping the boilerplate before extraction helps as much as narrowing the schema. Every posting’s benefits paragraph resembles every other one, and removing it leaves the model reading the part that actually distinguishes this role.',
      ],
      bullets: [
        'Role title, normalised and as written',
        'Requirements, split into hard and preferred',
        'Seniority, only when the text supports a judgement',
        'Location and remote policy, distinguishing remote from hybrid',
        'Salary with currency and period, or absent',
      ],
      table: {
        caption: 'Fields, and how reliably they extract',
        columns: ['Field', 'Reliability', 'Main failure'],
        rows: [
          ['Title', 'High', 'Internal titles nobody recognises'],
          ['Hard requirements', 'Moderate', 'Wish list read as mandatory'],
          ['Seniority', 'Moderate', 'Inferred when unstated'],
          ['Location', 'Moderate', 'Contradicts the remote policy'],
          ['Remote policy', 'Low', 'Hybrid described as remote'],
          ['Salary', 'High when stated', 'Estimated when absent'],
        ],
      },
    },
    {
      heading: 'Hard versus preferred is the important split',
      paragraphs: [
        'Postings mix genuine requirements with aspirational ones, often in the same list. Treating them identically makes every candidate look underqualified and every match score pessimistic.',
        'The signals are mostly linguistic — "must", "required", "essential" against "nice to have", "bonus", "ideally" — and a model handles the ambiguous cases well. Where it cannot tell, default to preferred rather than hard, since over-filtering candidates is the more damaging error.',
        'Position carries information too. A skill named in the job title, or repeated through the responsibilities, is a real requirement regardless of which list it appears in — and an item buried in a bullet list of twelve rarely is, whatever heading sits above it.',
      ],
    },
    {
      heading: 'Never infer what is not stated',
      paragraphs: [
        'The failure that matters most is a parser filling in plausible values. An inferred salary band, an inferred seniority, an inferred remote policy — each becomes a fact in your database that nobody can distinguish from a stated one.',
        'Require grounding: every extracted field must be supported by text in the posting, and absent fields stay absent. A candidate filtered out by an invented salary band has been failed by a system they cannot see.',
        'Distinguish absent from unparseable in the schema itself. A posting with no salary and a posting whose salary the extractor could not read are different facts, and collapsing them means you cannot tell a coverage gap from a parser regression.',
      ],
    },
    {
      heading: 'Normalise carefully, and keep the original',
      paragraphs: [
        'Titles, locations and technologies need normalisation to be useful for filtering, and normalisation loses information. "Staff Engineer, Platform" becomes "Software Engineer" and something real disappears.',
        'Keep both: the normalised value for filtering and the original for display and for the model that reads the posting later. Discarding the raw text is a decision you cannot reverse.',
        'Keep the whole raw posting too, not only the fields you mapped. Extraction schemas change, and re-deriving structure from a stored original is a batch job where re-fetching postings that have since closed is not possible at all.',
      ],
    },
    {
      heading: 'The postings that break parsers',
      paragraphs: [
        'A parser that works on a clean sample fails on the tail, and the tail is a substantial share of real traffic. It is worth collecting the awkward cases deliberately rather than meeting them in production.',
        'The recurring ones are postings written in two languages, a single listing advertising three roles at different levels, a description that is ninety per cent company history, and an employer name that is an agency rather than the actual company.',
        'Each needs a decided behaviour rather than a best effort. A multi-role posting should produce several records or none; an agency listing should mark the employer as unknown rather than recording the agency as the hiring company.',
        'Salary formats deserve their own attention because they are so varied and so consequential. Hourly, daily, monthly and annual figures, ranges written as text, currencies implied by location — a wrong period turns a reasonable salary into one that fails every filter the candidate set.',
      ],
      bullets: [
        'Multi-language postings — extract from one, record which',
        'Several roles in one listing — several records or none, never a blend',
        'Agency listings — employer unknown, not the agency',
        'Salary period and currency — never assumed from context',
      ],
    },
    {
      heading: 'Evaluate against real postings',
      paragraphs: [
        'Parsers degrade quietly when a model version changes or a prompt is edited, and nothing errors — the output is still the right shape, with slightly different content.',
        'Keep a labelled set of a hundred or so real postings with expected extractions and run it on every change. Pay particular attention to the unusual ones: postings in two languages, postings for several roles at once, postings that are mostly company description.',
        'Measure per field rather than per posting. An overall accuracy figure hides that salary extraction is excellent and remote policy is unreliable, which are entirely different problems with entirely different fixes.',
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
      a: 'Keep a labelled set of around a hundred real postings with expected extractions, run it on every prompt or model change, and measure per field rather than overall.',
    },
    {
      q: 'What should happen with a listing advertising several roles?',
      a: 'Several records or none — never a blend. A single record averaging three roles at different levels is wrong for all three.',
    },
    {
      q: 'Why keep the whole raw posting?',
      a: 'Because extraction schemas change and postings close. Re-deriving structure from a stored original is a batch job; re-fetching a closed listing is impossible.',
    },
  ],
  related: ['how-to-extract-skills-from-a-job-description', 'how-to-build-an-ai-resume-parser', 'how-to-build-an-ai-job-aggregator-with-llms'],
};

export default post;
