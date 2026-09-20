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
  anchors: ['which jobs to apply to', 'application budget'],
  excerpt:
    'Scoring a job is easy. Deciding whether it is worth the ninety minutes a good application costs is a different question entirely.',
  keyTakeaways: [
    'A score measures fit; a decision weighs fit against what applying costs.',
    'Application effort is observable and should be modelled, not assumed uniform.',
    'Budgets adapt to a thin or rich week where a fixed threshold fails in both.',
    'Life decisions are surfaced as questions once, then applied as constraints.',
    'Negative decisions need reasons most of all, because silence cannot be appealed.',
  ],
  sections: [
    {
      heading: 'A score is not a decision',
      paragraphs: [
        'Match quality tells you how well someone fits. It does not tell you whether to apply, because that depends on what the application costs, what else is available and how badly the person needs a role now.',
        'A 70% match to a role someone would love, that takes ten minutes to apply for, is an obvious yes. The same 70% on a role requiring a custom portfolio submission and a written exercise may well be a no. The score is identical; the decision is not.',
        'Urgency changes the whole calculation and is rarely modelled. Someone with three months of runway should be applying to things a comfortably employed candidate would decline, and a system with one fixed policy is wrong for at least one of them.',
      ],
    },
    {
      heading: 'Model the cost of applying',
      paragraphs: [
        'Applications differ enormously in effort, and this is measurable rather than guessable. A one-click submission and a four-stage form with essay questions are not the same act, and treating them as equivalent is why automated shortlists feel unhelpful.',
        'Estimate the cost from the application route, the number of custom questions and whether tailored documents are needed. Then the decision becomes a comparison — expected value against expected effort — instead of a threshold on a single number.',
        'Most of these inputs are observable before applying. The platform is known from the URL, the number of steps and custom questions can be read from the form, and your own history tells you what similar applications took — so this is measurement rather than estimation for the majority of cases.',
      ],
      bullets: [
        'Application route and number of steps',
        'Custom questions requiring real answers',
        'Whether a tailored CV or letter is needed',
        'Employer response rate, where you can observe it',
        'What similar applications have cost this candidate before',
      ],
      table: {
        caption: 'Same score, different decisions',
        columns: ['Situation', 'Cost', 'Decision'],
        rows: [
          ['70% fit, one-click, responsive employer', 'Minutes', 'Apply'],
          ['70% fit, essay questions, no response record', 'Two hours', 'Skip'],
          ['55% fit, dream employer, quick form', 'Minutes', 'Apply'],
          ['85% fit, employer never responds', 'Any', 'Deprioritise'],
          ['85% fit, requires relocation they refused', 'Any', 'Excluded by constraint'],
        ],
      },
    },
    {
      heading: 'Budgets beat thresholds',
      paragraphs: [
        'A fixed threshold — apply above 75% — behaves badly in both directions. In a thin week it produces nothing; in a rich one it produces forty applications the person cannot maintain.',
        'A budget adapts: the best N this week, subject to a minimum quality floor. It matches how people actually job hunt, keeps volume sustainable, and makes the agent’s behaviour predictable to the person relying on it.',
        'Keep the floor, though, or the budget will fill itself with whatever was least bad. A week with two genuinely good roles should produce two applications and a note that the market was thin, not five applications padded out to meet a number.',
      ],
    },
    {
      heading: 'Timing is part of the decision',
      paragraphs: [
        'A role posted this morning and the same role three weeks into its shortlist are different opportunities, and an agent that ignores when something appeared is discarding one of the few advantages automation genuinely provides.',
        'Freshness should influence the decision rather than merely the ranking. A borderline role seen on the day it was posted can be worth applying to where the same role a fortnight later is not, because the odds have changed even though the fit has not.',
        'Deadlines deserve their own handling. A role closing tomorrow that clears the quality floor should pre-empt the budget rather than wait for the weekly cycle, and building that exception in is what stops the system being tidy and useless.',
      ],
    },
    {
      heading: 'Some decisions are not the agent’s',
      paragraphs: [
        'There are judgements an agent should not make on someone’s behalf, and it is worth naming them explicitly rather than hoping the model declines. Whether to leave a current employer. Whether a pay cut is acceptable for a better role. Whether to apply somewhere a friend works. Whether to relocate.',
        'These depend on things the agent does not know and should not infer. Surface them as questions and let the person answer once; the answer then becomes a constraint the agent applies rather than a call it makes.',
        'Ask them at the right moment. A relocation question raised when the first role requiring relocation appears gets a considered answer; the same question in an onboarding form gets whatever produces the fewest keystrokes.',
      ],
    },
    {
      heading: 'Require a reason that survives scrutiny',
      paragraphs: [
        'Every decision should carry a short, specific justification: what matched, what did not, why it cleared the bar. If the reason reads as generic, the decision was probably made on generic grounds.',
        'This matters most for the negatives. A candidate who finds out later that the agent silently skipped a role they wanted needs to see why — and "excluded because you said no relocation" is a reasonable answer where silence is not.',
        'Reasons are also the cheapest improvement loop available. A candidate disagreeing with a stated reason is giving you a labelled correction, where a candidate disagreeing with an unexplained decision can only express dissatisfaction — and only the first of those makes the system better.',
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
    {
      q: 'How does urgency change the decision?',
      a: 'Substantially. Someone with three months of runway should apply to roles a comfortably employed candidate would decline, so one fixed policy is wrong for at least one of them.',
    },
    {
      q: 'Should a deadline override the weekly budget?',
      a: 'Yes. A role closing tomorrow that clears the quality floor should pre-empt the cycle, or the system is tidy and useless at the moment it matters.',
    },
  ],
  related: ['how-to-build-an-ai-agent-that-detects-jobs-worth-applying-to', 'how-many-jobs-should-you-apply-to-with-ai', 'how-to-build-an-ai-agent-with-human-approval'],
};

export default post;
