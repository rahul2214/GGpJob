import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-decides-which-jobs-to-apply-to',
  tint: 'indigo',
  title: 'How to Build an AI Agent That Decides Which Jobs You Should Apply To',
  heading: 'Deciding what is worth applying to',
  description:
    'Turning a match score into a decision: modelling effort and odds, thresholds versus budgets, what the agent must not decide, and defensible reasoning.',
  keywords: [
    'ai agent job selection',
    'which jobs to apply to',
    'application decision model',
    'apply threshold',
    'effort vs reward applications',
    'agent decision making',
    'job triage ai',
    'application budget',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Scoring a job is easy. Deciding whether it is worth the ninety minutes a good application costs is a different question entirely.',
  sections: [
    {
      heading: 'A score is not a decision',
      paragraphs: [
        'Match quality tells you how well someone fits. It does not tell you whether to apply, because that depends on what the application costs, what else is available and how badly the person needs a role now.',
        'A 70% match to a role someone would love, that takes ten minutes to apply for, is an obvious yes. The same 70% on a role requiring a custom portfolio submission and a written exercise may well be a no. The score is identical; the decision is not.',
      ],
    },
    {
      heading: 'Model the cost of applying',
      paragraphs: [
        'Applications differ enormously in effort, and this is measurable rather than guessable. A one-click submission and a four-stage form with essay questions are not the same act, and treating them as equivalent is why automated shortlists feel unhelpful.',
        'Estimate the cost from the application route, the number of custom questions and whether tailored documents are needed. Then the decision becomes a comparison — expected value against expected effort — instead of a threshold on a single number.',
      ],
      bullets: [
        'Application route and number of steps',
        'Custom questions requiring real answers',
        'Whether a tailored CV or letter is needed',
        'Employer response rate, where you can observe it',
      ],
    },
    {
      heading: 'Budgets beat thresholds',
      paragraphs: [
        'A fixed threshold — apply above 75% — behaves badly in both directions. In a thin week it produces nothing; in a rich one it produces forty applications the person cannot maintain.',
        'A budget adapts: the best N this week, subject to a minimum quality floor. It matches how people actually job hunt, keeps volume sustainable, and makes the agent’s behaviour predictable to the person relying on it.',
      ],
    },
    {
      heading: 'Some decisions are not the agent’s',
      paragraphs: [
        'There are judgements an agent should not make on someone’s behalf, and it is worth naming them explicitly rather than hoping the model declines. Whether to leave a current employer. Whether a pay cut is acceptable for a better role. Whether to apply somewhere a friend works. Whether to relocate.',
        'These depend on things the agent does not know and should not infer. Surface them as questions and let the person answer once; the answer then becomes a constraint the agent applies rather than a call it makes.',
      ],
    },
    {
      heading: 'Require a reason that survives scrutiny',
      paragraphs: [
        'Every decision should carry a short, specific justification: what matched, what did not, why it cleared the bar. If the reason reads as generic, the decision was probably made on generic grounds.',
        'This matters most for the negatives. A candidate who finds out later that the agent silently skipped a role they wanted needs to see why — and "excluded because you said no relocation" is a reasonable answer where silence is not.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why is a match score not enough to decide?',
      a: 'Because it ignores cost. A 70% match taking ten minutes is an obvious yes; the same 70% requiring a portfolio and a written exercise may be a no. Same score, different decision.',
    },
    {
      q: 'Should the agent use a fixed apply threshold?',
      a: 'A budget works better — the best N this week above a quality floor. A fixed threshold produces nothing in a thin week and forty unmanageable applications in a rich one.',
    },
    {
      q: 'What should an agent never decide alone?',
      a: 'Whether to leave a current employer, accept a pay cut, apply where a friend works, or relocate. Surface these as questions once, and treat the answers as constraints rather than inferences.',
    },
    {
      q: 'Does the agent need to justify skipping a job?',
      a: 'Especially then. A candidate who later finds a wanted role was silently skipped needs a specific reason — "excluded because you said no relocation" — not silence.',
    },
  ],
  related: ['how-to-build-an-ai-agent-that-detects-jobs-worth-applying-to', 'how-many-jobs-should-you-apply-to-with-ai', 'how-to-build-an-ai-agent-with-human-approval'],
};

export default post;
