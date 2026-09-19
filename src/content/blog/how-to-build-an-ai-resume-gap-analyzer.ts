import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-resume-gap-analyzer',
  tint: 'emerald',
  title: 'How to Build an AI Resume Gap Analyzer',
  heading: 'Finding what is missing',
  description:
    'Building a tool that identifies real gaps between a CV and a target role, distinguishes missing skills from unmentioned ones, and ranks them by what matters.',
  keywords: [
    'resume gap analyzer',
    'skill gap analysis ai',
    'missing skills resume',
    'cv gap detection',
    'requirement coverage',
    'gap prioritisation',
    'career development tool',
    'resume analysis',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Resumes & ATS',
  excerpt:
    'Half of what a gap analyser finds is not a gap at all — it is something the candidate has and never wrote down.',
  sections: [
    {
      heading: 'Gap against what?',
      paragraphs: [
        'A gap only exists relative to a target. Analysing a CV in isolation produces a list of things it does not mention, which is infinite and useless.',
        'Define the target first: a specific posting, a role type, or a set of roles the candidate is aiming at. Comparing against a set is often more useful than a single posting, because one posting’s idiosyncratic requirement is not a gap in a career.',
      ],
    },
    {
      heading: 'Distinguish absent from unmentioned',
      paragraphs: [
        'This is the distinction that determines whether the tool is helpful. Someone may have three years of a skill and never named it, because it was implicit in what they built. That is a documentation gap, and it is fixable today.',
        'A genuine absence is different: the skill is not there, and no rewrite will produce it. Telling a candidate to "add Kubernetes to your CV" when they have never used it is advice that fails in the first technical conversation.',
      ],
      bullets: [
        'Present and stated — nothing to do',
        'Present but unmentioned — a wording fix, with evidence',
        'Adjacent experience — mention the transfer explicitly',
        'Genuinely absent — a learning goal, not a CV edit',
      ],
    },
    {
      heading: 'Rank by consequence',
      paragraphs: [
        'A list of twenty gaps is demoralising and unusable. Most of them do not matter: postings list far more than employers require, and "nice to have" sections are aspirational.',
        'Rank by whether the gap is genuinely blocking, how often it appears across the target roles, and how long it would take to close. Three ranked gaps change behaviour; twenty unranked ones make someone close the tab.',
      ],
    },
    {
      heading: 'Say how long closing it takes',
      paragraphs: [
        'Gaps are not equivalent. Some are a weekend of documentation; some are a year of experience nobody can shortcut. Presenting them as one list implies they are the same kind of problem.',
        'Be honest about the difference, including when the answer is that this gap cannot be closed in the time available and a different target is the better move. That is more useful advice than an achievable-sounding plan that is not achievable.',
      ],
    },
    {
      heading: 'Avoid the confident wrong gap',
      paragraphs: [
        'The failure that costs trust is reporting something absent when it is plainly in the CV under a different name. A candidate who has "built CI pipelines" told they lack "continuous integration" stops believing the rest of the output.',
        'Match semantically, not lexically, and require the analysis to point at the evidence it did or did not find. A gap without a stated basis is a guess, and one wrong guess discredits the correct findings alongside it.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can a gap analyser work without a target role?',
      a: 'No. A gap exists only relative to a target — analysing a CV alone produces an infinite list of things it does not mention. Comparing against a set of target roles is often better than one posting.',
    },
    {
      q: 'What is the most important distinction in gap analysis?',
      a: 'Absent versus unmentioned. A skill someone has but never named is a documentation fix; a skill they lack is a learning goal, and confusing them produces advice that fails in interview.',
    },
    {
      q: 'How many gaps should be reported?',
      a: 'Three ranked ones change behaviour; twenty unranked ones make people close the tab. Rank by whether the gap blocks, how often it recurs across targets, and how long it takes to close.',
    },
    {
      q: 'What discredits a gap analysis tool fastest?',
      a: 'Reporting something absent that is in the CV under another name — "built CI pipelines" flagged as lacking continuous integration. Match semantically and cite the evidence.',
    },
  ],
  related: ['how-ai-can-detect-missing-skills-before-you-apply', 'how-to-build-an-ai-career-gap-analyzer', 'how-to-calculate-resume-to-job-match-score'],
};

export default post;
