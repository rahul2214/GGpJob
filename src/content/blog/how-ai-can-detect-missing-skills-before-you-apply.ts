import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-ai-can-detect-missing-skills-before-you-apply',
  tint: 'emerald',
  title: 'How AI Can Detect Missing Skills Before You Apply',
  heading: 'Knowing before you apply',
  description:
    'Using AI to check requirement coverage before submitting: which gaps are disqualifying, which are negotiable, and what to do with the answer.',
  keywords: [
    'missing skills detection',
    'before you apply check',
    'requirement coverage ai',
    'disqualifying requirements',
    'should i apply',
    'skill gap check',
    'application triage',
    'job fit analysis',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Resumes & ATS',
  excerpt:
    'The useful question is not whether you meet every requirement. It is which of the ones you miss would actually stop you.',
  sections: [
    {
      heading: 'Postings ask for more than employers require',
      paragraphs: [
        'Job descriptions are written as wish lists, often by committee, and frequently include requirements nobody screens on. Treating every line as a hard gate means talking yourself out of roles you would have got.',
        'A useful tool separates the lines that genuinely gate from the ones that do not, rather than reporting a coverage percentage that treats a legal requirement and a preferred certification as equivalent.',
      ],
    },
    {
      heading: 'Three tiers, in order of consequence',
      paragraphs: [
        'Some requirements are binary and non-negotiable: the right to work, a licence to practise, a security clearance. Missing one of these makes an application a waste of everyone’s time, and a tool should say so plainly.',
        'Some are genuinely central — the core technology of the role, the level of responsibility. Missing one means a weak application that is still sometimes worth sending. And some are aspirational, where missing several changes nothing.',
      ],
      bullets: [
        'Hard eligibility — missing means do not apply',
        'Core competence — missing means a weak but sometimes worthwhile application',
        'Preferred — missing several rarely matters',
      ],
    },
    {
      heading: 'Check what is stated, not what is implied',
      paragraphs: [
        'The check runs against the CV, and the CV is not the candidate. Something they can do but did not write down will read as missing, and a tool that stops there sends people away from roles they are qualified for.',
        'So report the finding as "your CV does not show this" rather than "you lack this", and ask. Half the flagged gaps in practice turn out to be things the candidate has and never mentioned — which is a fix, not a barrier.',
      ],
    },
    {
      heading: 'Say what to do next',
      paragraphs: [
        'A detected gap without an action is just discouragement. Each tier has a different response, and naming it is most of the value.',
        'Unmentioned: add it, with evidence. Adjacent: state the transfer explicitly in the application. Genuinely missing and core: decide whether to apply anyway, and if so address it directly rather than hoping it goes unnoticed. Genuinely missing and disqualifying: do not apply.',
      ],
    },
    {
      heading: 'Do not over-filter the candidate',
      paragraphs: [
        'A tool tuned to be cautious will advise against most applications, and people who apply only where they meet everything apply to very little. That is a known pattern and it disproportionately affects candidates who already under-apply.',
        'Calibrate towards apply. Reserve firm discouragement for genuine eligibility failures, and frame everything else as a gap to address rather than a reason to stop.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Do I need to meet every requirement in a posting?',
      a: 'No. Postings are wish lists written by committee and often include requirements nobody screens on. What matters is which of the ones you miss would genuinely gate.',
    },
    {
      q: 'Which missing requirements should stop an application?',
      a: 'Hard eligibility only — the right to work, a licence to practise, a clearance. Missing core competence makes an application weak but sometimes still worth sending.',
    },
    {
      q: 'Why does the tool flag skills I actually have?',
      a: 'Because it checks the CV, not you. Report findings as "your CV does not show this" and ask — in practice about half of flagged gaps are things the candidate never wrote down.',
    },
    {
      q: 'Can this kind of tool discourage people too much?',
      a: 'Yes, and it disproportionately affects those who already under-apply. Calibrate towards applying and reserve firm discouragement for genuine eligibility failures.',
    },
  ],
  related: ['how-to-build-an-ai-resume-gap-analyzer', 'how-to-calculate-resume-to-job-match-score', 'how-to-build-an-ai-agent-that-decides-which-jobs-to-apply-to'],
};

export default post;
