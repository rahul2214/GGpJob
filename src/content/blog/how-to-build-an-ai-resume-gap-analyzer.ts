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
  anchors: ['resume gap analyzer', 'absent or unmentioned'],
  excerpt:
    'Half of what a gap analyser finds is not a gap at all — it is something the candidate has and never wrote down.',
  keyTakeaways: [
    'A gap only exists relative to a target, and a set of roles beats a single posting.',
    'Absent versus unmentioned is the distinction that decides whether the tool helps.',
    'Three ranked gaps change behaviour; twenty unranked ones close the tab.',
    'Say how long each gap takes to close, including when the honest answer is too long.',
    'One confidently wrong gap discredits every correct finding beside it.',
  ],
  sections: [
    {
      heading: 'Gap against what?',
      paragraphs: [
        'A gap only exists relative to a target. Analysing a CV in isolation produces a list of things it does not mention, which is infinite and useless.',
        'Define the target first: a specific posting, a role type, or a set of roles the candidate is aiming at. Comparing against a set is often more useful than a single posting, because one posting’s idiosyncratic requirement is not a gap in a career.',
        'The aggregate view is the one that changes decisions. A requirement appearing in a quarter of the roles someone is pursuing is telling them something about the market that no individual posting can, and it is also how you tell a genuine gap from a single employer’s wish list.',
      ],
    },
    {
      heading: 'Distinguish absent from unmentioned',
      paragraphs: [
        'This is the distinction that determines whether the tool is helpful. Someone may have three years of a skill and never named it, because it was implicit in what they built. That is a documentation gap, and it is fixable today.',
        'A genuine absence is different: the skill is not there, and no rewrite will produce it. Telling a candidate to "add Kubernetes to your CV" when they have never used it is advice that fails in the first technical conversation.',
        'Since the tool cannot tell these apart from the document alone, it should ask rather than assert. Phrasing a finding as "your CV does not evidence this — do you have it?" converts roughly half of all flagged gaps into a stronger application rather than a discouragement.',
      ],
      bullets: [
        'Present and stated — nothing to do',
        'Present but unmentioned — a wording fix, with evidence',
        'Adjacent experience — mention the transfer explicitly',
        'Genuinely absent — a learning goal, not a CV edit',
      ],
      table: {
        caption: 'Four findings, four responses',
        columns: ['Finding', 'Response', 'Time to fix'],
        rows: [
          ['Stated clearly', 'Nothing', '—'],
          ['Has it, never wrote it', 'Add with specific evidence', 'Minutes'],
          ['Adjacent experience', 'State the transfer explicitly', 'Minutes'],
          ['Absent, preferred requirement', 'Ignore it', '—'],
          ['Absent, core requirement', 'A learning goal, or a different target', 'Months'],
          ['Absent, hard eligibility', 'Do not apply', 'Not closeable'],
        ],
      },
    },
    {
      heading: 'Rank by consequence',
      paragraphs: [
        'A list of twenty gaps is demoralising and unusable. Most of them do not matter: postings list far more than employers require, and "nice to have" sections are aspirational.',
        'Rank by whether the gap is genuinely blocking, how often it appears across the target roles, and how long it would take to close. Three ranked gaps change behaviour; twenty unranked ones make someone close the tab.',
        'Weight by how the requirement was written rather than where it appeared. A skill in the job title and repeated through the responsibilities is a real requirement; one item in a list of twelve under a heading nobody wrote carefully usually is not.',
      ],
    },
    {
      heading: 'Say how long closing it takes',
      paragraphs: [
        'Gaps are not equivalent. Some are a weekend of documentation; some are a year of experience nobody can shortcut. Presenting them as one list implies they are the same kind of problem.',
        'Be honest about the difference, including when the answer is that this gap cannot be closed in the time available and a different target is the better move. That is more useful advice than an achievable-sounding plan that is not achievable.',
        'Separate what makes a CV stronger from what makes a candidate stronger. A course completed this month is a real thing to list and is not equivalent to two years of production experience, and a tool implying otherwise is preparing someone for a conversation that will go badly.',
      ],
    },
    {
      heading: 'Do not talk people out of applying',
      paragraphs: [
        'A tool tuned to be thorough will find gaps in every application, and a candidate shown a list of deficiencies before every submission applies to considerably less. That pattern disproportionately affects the people who already under-apply.',
        'Calibrate towards applying. Reserve firm discouragement for genuine eligibility failures — the right to work, a required licence — and frame everything else as something to address within the application rather than a reason to stop.',
        'Tone is a design requirement here rather than a nicety. This output is read by someone being rejected regularly, and a technically accurate summary of everything they lack will close the product without improving the search.',
      ],
    },
    {
      heading: 'Avoid the confident wrong gap',
      paragraphs: [
        'The failure that costs trust is reporting something absent when it is plainly in the CV under a different name. A candidate who has "built CI pipelines" told they lack "continuous integration" stops believing the rest of the output.',
        'Match semantically, not lexically, and require the analysis to point at the evidence it did or did not find. A gap without a stated basis is a guess, and one wrong guess discredits the correct findings alongside it.',
        'Keep a labelled set and run it on every change. Twenty CV and posting pairs with known correct findings catch the regression where a prompt edit starts producing lexical matches again, which is otherwise invisible until a user complains.',
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
    {
      q: 'How should a finding be phrased?',
      a: 'As "your CV does not evidence this — do you have it?" About half of flagged gaps turn out to be things the candidate has and never wrote down.',
    },
    {
      q: 'Can this tool discourage people too much?',
      a: 'Yes, and it hits hardest the people who already under-apply. Reserve firm discouragement for genuine eligibility failures and frame everything else as addressable.',
    },
  ],
  related: ['how-ai-can-detect-missing-skills-before-you-apply', 'how-to-build-an-ai-career-gap-analyzer', 'how-to-calculate-resume-to-job-match-score'],
};

export default post;
