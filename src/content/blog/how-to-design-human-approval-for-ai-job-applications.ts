import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-design-human-approval-for-ai-job-applications',
  tint: 'rose',
  title: 'How to Design Human Approval for AI Job Applications',
  heading: 'Designing the approval experience',
  description:
    'The product design of an approval step: choosing what needs approving, escalating by risk, earning autonomy over time, and measuring whether review is real.',
  keywords: [
    'human approval design ai',
    'approval ux ai agent',
    'progressive autonomy ai',
    'risk based approval',
    'ai oversight product design',
    'approval queue design',
    'human review automation',
    'trust calibration ai',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Security',
  excerpt:
    'Approval is a product design problem before it is a safety one. Ask for too much and it is ignored; too little and the gate protects nothing.',
  sections: [
    {
      heading: 'Approval budgets are finite',
      paragraphs: [
        'Every request for approval spends a limited resource: the user’s attention. Spend it on trivia and there is none left for the item that mattered, which is the mechanism by which oversight quietly stops existing.',
        'So the design question is not "what should we ask about" but "what is worth the budget". A system asking about everything is not more careful; it is less, because it has trained the user not to look.',
      ],
    },
    {
      heading: 'Escalate by risk, not uniformly',
      paragraphs: [
        'Classify each pending action by consequence and confidence, and treat the tiers differently. An application to a role the candidate has explicitly approved the shape of, with a tailored CV containing no novel claims, is genuinely low risk.',
        'An application with a generated free-text answer, a low match score, or a claim the system cannot trace to the source profile is not. Those deserve prominence and detail; the rest deserve a fast path.',
      ],
      bullets: [
        'Auto-approve: high score, no novel claims, employer type already approved',
        'Quick review: routine, shown as a diff, approvable in one action',
        'Full review: novel free-text, low score, untraceable claim, unusual employer',
        'Never automatic: declarations, salary commitments, anything irreversible',
      ],
    },
    {
      heading: 'Let autonomy be earned',
      paragraphs: [
        'Trust should accumulate from evidence. A candidate who has approved thirty applications without editing any of them has demonstrated something, and the system can reasonably propose widening the auto-approve band for that shape of application.',
        'Make it explicit and reversible: tell the user what the system noticed, ask whether to stop reviewing that category, and make it one action to resume reviewing. Silently expanding autonomy because the user kept clicking approve is how trust gets abused.',
      ],
    },
    {
      heading: 'Design for the rejection, not the approval',
      paragraphs: [
        'Most interfaces optimise the approve button because that is the common case. The valuable interaction is the rejection, because it carries information nothing else provides.',
        'Make rejecting one action, with an optional reason from a short list — wrong location, wrong seniority, not interested in this employer, claim is inaccurate. Feed those straight back into scoring. A queue that produces the same rejection every week is not learning, and the user will eventually stop bothering to correct it.',
      ],
    },
    {
      heading: 'Measure whether review is actually happening',
      paragraphs: [
        'You can tell the difference between review and rubber-stamping from behaviour. Time spent before approving, whether the detail view was opened, the edit rate and the rejection rate all indicate whether anyone is reading.',
        'If approvals are instant and rejections have stopped, the gate has become decorative. That is a signal to reduce what you ask about rather than to add warnings — warnings are what people learn to click past.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What should require human approval in a job agent?',
      a: 'Anything irreversible or constituting a statement about the candidate — final submission, free-text answers, declarations, salary commitments. Routine tailored applications can take a fast path.',
    },
    {
      q: 'How do I stop the approval step being rubber-stamped?',
      a: 'Ask about less. Approval attention is finite, and requesting it for trivia leaves none for the item that mattered. Escalate by risk and give routine items a one-action path.',
    },
    {
      q: 'Should autonomy increase over time?',
      a: 'Yes, but explicitly. Offer to widen auto-approval once a pattern of unedited approvals exists, make the offer visible, and make resuming review a single action. Never expand it silently.',
    },
    {
      q: 'How do I know whether the gate is working?',
      a: 'Watch time-to-approve, detail-view opens, edit rate and rejection rate. Instant approvals with no rejections mean the gate is decorative — the fix is asking about less, not adding warnings.',
    },
  ],
  related: ['how-to-build-an-ai-agent-with-human-approval', 'what-is-autonomous-job-application', 'how-to-prevent-an-agent-applying-to-the-wrong-job'],
};

export default post;
