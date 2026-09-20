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
  anchors: ['missing skills', 'requirement coverage'],
  excerpt:
    'The useful question is not whether you meet every requirement. It is which of the ones you miss would actually stop you.',
  keyTakeaways: [
    'Postings are wish lists; treating every line as a gate talks people out of roles they would have got.',
    'Three tiers — hard eligibility, core competence, preferred — and only the first should stop an application.',
    'The check runs against the CV, not the person, so phrase findings as "your CV does not show this".',
    'A gap without a next action is just discouragement.',
    'Calibrate towards applying: over-filtering hurts most the people who already under-apply.',
  ],
  sections: [
    {
      heading: 'Postings ask for more than employers require',
      paragraphs: [
        'Job descriptions are written as wish lists, often by committee, and frequently include requirements nobody screens on. Treating every line as a hard gate means talking yourself out of roles you would have got.',
        'A useful tool separates the lines that genuinely gate from the ones that do not, rather than reporting a coverage percentage that treats a legal requirement and a preferred certification as equivalent.',
        'A single percentage is actively misleading for this reason. Seventy per cent coverage with the missing thirty being preferred extras is a strong application; seventy per cent coverage with the missing thirty being a required licence is not an application at all, and one number cannot distinguish them.',
      ],
    },
    {
      heading: 'Three tiers, in order of consequence',
      paragraphs: [
        'Some requirements are binary and non-negotiable: the right to work, a licence to practise, a security clearance. Missing one of these makes an application a waste of everyone’s time, and a tool should say so plainly.',
        'Some are genuinely central — the core technology of the role, the level of responsibility. Missing one means a weak application that is still sometimes worth sending. And some are aspirational, where missing several changes nothing.',
        'Classifying a requirement into a tier is mostly reading how it is written. "Must hold", "required by law" and "eligible to work in" signal tier one; a technology named in the role title or repeated through the responsibilities is tier two; a list of extras under "nice to have" is tier three, whatever else the posting says.',
      ],
      bullets: [
        'Hard eligibility — missing means do not apply',
        'Core competence — missing means a weak but sometimes worthwhile application',
        'Preferred — missing several rarely matters',
      ],
      table: {
        caption: 'Tiers, signals and what to do',
        columns: ['Tier', 'How it reads in the posting', 'If you miss it'],
        rows: [
          ['Hard eligibility', '"Must hold", "eligible to work", a licence', 'Do not apply'],
          ['Core competence', 'In the title, repeated in responsibilities', 'Weak but sometimes worth it'],
          ['Preferred', 'Under "nice to have" or "bonus"', 'Ignore'],
          ['Years of experience', 'A round number, rarely screened literally', 'Usually ignore'],
          ['Degree requirement', 'Often boilerplate, sometimes real', 'Check whether equivalents are named'],
        ],
      },
    },
    {
      heading: 'Check what is stated, not what is implied',
      paragraphs: [
        'The check runs against the CV, and the CV is not the candidate. Something they can do but did not write down will read as missing, and a tool that stops there sends people away from roles they are qualified for.',
        'So report the finding as "your CV does not show this" rather than "you lack this", and ask. Half the flagged gaps in practice turn out to be things the candidate has and never mentioned — which is a fix, not a barrier.',
        'This is why the check is worth running before applying rather than after being rejected. Its most common useful output is not "do not apply" but "you have this and did not say so", which converts directly into a stronger application for the same role.',
      ],
    },
    {
      heading: 'Say what to do next',
      paragraphs: [
        'A detected gap without an action is just discouragement. Each tier has a different response, and naming it is most of the value.',
        'Unmentioned: add it, with evidence. Adjacent: state the transfer explicitly in the application. Genuinely missing and core: decide whether to apply anyway, and if so address it directly rather than hoping it goes unnoticed. Genuinely missing and disqualifying: do not apply.',
        'Addressing a real gap directly works better than most candidates expect. A line acknowledging that you have not used a specific technology and naming the closest thing you have done reads as confidence, and it is far better than leaving the reader to notice the absence themselves.',
      ],
    },
    {
      heading: 'Gaps across a whole search, not one posting',
      paragraphs: [
        'The per-application check is useful; the aggregate is more useful. A skill that appears in a quarter of the postings you have looked at over six weeks is telling you something about the market that no single posting can.',
        'That view separates a skill worth learning from one that merely came up once. It also distinguishes a genuine gap from a vocabulary problem — if a term appears constantly in postings and never in your CV while you have clearly done the work, the fix is wording rather than study.',
        'It is also the honest input to a decision about whether the target is right. Consistently missing the core requirement of the roles you are applying for is worth knowing in week two rather than week twelve, even though it is not what anyone wants to hear.',
      ],
      bullets: [
        'Which requirements recur across the roles you actually want',
        'Which recurring terms you have the experience for but never wrote down',
        'Which single gap would unlock the largest share of your shortlist',
        'Whether the pattern suggests the target itself needs adjusting',
      ],
    },
    {
      heading: 'Do not over-filter the candidate',
      paragraphs: [
        'A tool tuned to be cautious will advise against most applications, and people who apply only where they meet everything apply to very little. That is a known pattern and it disproportionately affects candidates who already under-apply.',
        'Calibrate towards apply. Reserve firm discouragement for genuine eligibility failures, and frame everything else as a gap to address rather than a reason to stop.',
        'Check the tone of the output as carefully as the logic. A technically correct analysis delivered as a list of everything someone lacks is demoralising in a context where people are already being rejected regularly, and a demoralised candidate closing the tool has not been helped by its accuracy.',
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
    {
      q: 'Why is a single coverage percentage misleading?',
      a: 'Because it treats a missing preferred certification and a missing required licence as equivalent. One is a strong application and the other is not an application at all.',
    },
    {
      q: 'What does the aggregate view add?',
      a: 'It separates a skill worth learning from one that came up once, distinguishes a real gap from a vocabulary problem, and tells you in week two whether the target itself is wrong.',
    },
  ],
  related: ['how-to-build-an-ai-resume-gap-analyzer', 'how-to-calculate-resume-to-job-match-score', 'how-to-build-an-ai-agent-that-decides-which-jobs-to-apply-to'],
};

export default post;
