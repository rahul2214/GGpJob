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
  anchors: ['approval experience', 'approval budget'],
  excerpt:
    'Approval is a product design problem before it is a safety one. Ask for too much and it is ignored; too little and the gate protects nothing.',
  keyTakeaways: [
    'Approval spends a finite resource — attention — and asking about trivia leaves none for what matters.',
    'Escalate by consequence and confidence rather than treating every item alike.',
    'Autonomy should be earned explicitly and be reversible in one action.',
    'Design for the rejection: it is the interaction that carries information.',
    'Instant approvals with no rejections mean the gate is decorative — ask about less.',
  ],
  sections: [
    {
      heading: 'Approval budgets are finite',
      paragraphs: [
        'Every request for approval spends a limited resource: the user’s attention. Spend it on trivia and there is none left for the item that mattered, which is the mechanism by which oversight quietly stops existing.',
        'So the design question is not "what should we ask about" but "what is worth the budget". A system asking about everything is not more careful; it is less, because it has trained the user not to look.',
        'Batching spends the budget better than interrupting. A daily queue arrives when someone is in a reviewing frame of mind, where a notification per application arrives mid-task and trains them to dismiss notifications — which is a habit that then applies to the one that mattered.',
      ],
    },
    {
      heading: 'Escalate by risk, not uniformly',
      paragraphs: [
        'Classify each pending action by consequence and confidence, and treat the tiers differently. An application to a role the candidate has explicitly approved the shape of, with a tailored CV containing no novel claims, is genuinely low risk.',
        'An application with a generated free-text answer, a low match score, or a claim the system cannot trace to the source profile is not. Those deserve prominence and detail; the rest deserve a fast path.',
        'Order the queue by risk rather than by arrival. The item with an untraceable claim should meet the freshest attention, and the routine ones belong at the bottom where a faster pass is genuinely appropriate.',
      ],
      bullets: [
        'Auto-approve: high score, no novel claims, employer type already approved',
        'Quick review: routine, shown as a diff, approvable in one action',
        'Full review: novel free-text, low score, untraceable claim, unusual employer',
        'Never automatic: declarations, salary commitments, anything irreversible',
      ],
      table: {
        caption: 'What each tier should show',
        columns: ['Tier', 'Shown', 'Attention it needs'],
        rows: [
          ['Auto-approved', 'A line in the digest', 'None'],
          ['Quick review', 'A diff against the base CV', 'Seconds'],
          ['Full review', 'Diff, flagged claims, free text in full', 'A minute'],
          ['Never automatic', 'The complete assembled application', 'As long as it takes'],
        ],
      },
    },
    {
      heading: 'Let autonomy be earned',
      paragraphs: [
        'Trust should accumulate from evidence. A candidate who has approved thirty applications without editing any of them has demonstrated something, and the system can reasonably propose widening the auto-approve band for that shape of application.',
        'Make it explicit and reversible: tell the user what the system noticed, ask whether to stop reviewing that category, and make it one action to resume reviewing. Silently expanding autonomy because the user kept clicking approve is how trust gets abused.',
        'Let it contract as well as expand. A run of rejections, a corrected claim or a long absence are all reasons to narrow the band again and say so, and a system that only ever grants itself more latitude is not calibrating trust but accumulating it.',
      ],
    },
    {
      heading: 'Design for the rejection, not the approval',
      paragraphs: [
        'Most interfaces optimise the approve button because that is the common case. The valuable interaction is the rejection, because it carries information nothing else provides.',
        'Make rejecting one action, with an optional reason from a short list — wrong location, wrong seniority, not interested in this employer, claim is inaccurate. Feed those straight back into scoring. A queue that produces the same rejection every week is not learning, and the user will eventually stop bothering to correct it.',
        'Make editing as cheap as rejecting. Most items are not wrong so much as slightly off, and a reviewer who can fix one sentence and approve produces a better application than one whose only options are accept as written or discard.',
      ],
    },
    {
      heading: 'What happens to what nobody reviewed',
      paragraphs: [
        'Items will sit unanswered, because people are busy and job hunting is not their full-time occupation. Deciding what happens to those is part of the design, and submitting them after a delay is the wrong answer however reasonable the automation argument sounds.',
        'Let them expire, and say why. A posting that closed while awaiting approval is real information about the candidate’s own pace, and far better than an application sent without the review the product promised.',
        'A deadline should promote an item rather than bypass the gate. A role closing tomorrow belongs at the top of the queue with the date stated, which gives the candidate the chance to act instead of having the decision made for them.',
      ],
    },
    {
      heading: 'Measure whether review is actually happening',
      paragraphs: [
        'You can tell the difference between review and rubber-stamping from behaviour. Time spent before approving, whether the detail view was opened, the edit rate and the rejection rate all indicate whether anyone is reading.',
        'If approvals are instant and rejections have stopped, the gate has become decorative. That is a signal to reduce what you ask about rather than to add warnings — warnings are what people learn to click past.',
        'Cap the queue length for the same reason. Thirty pending items produce a scroll and a bulk action; six produce six decisions, and a queue that is routinely longer is telling you the upstream filtering is too permissive rather than that the review needs redesigning.',
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
      a: 'Ask about less, batch it daily, order by risk and cap the queue. Approval attention is finite, and requesting it for trivia leaves none for the item that mattered.',
    },
    {
      q: 'Should autonomy increase over time?',
      a: 'Yes, but explicitly — and it should contract too. A run of rejections or a corrected claim is a reason to narrow the band again and say so.',
    },
    {
      q: 'How do I know whether the gate is working?',
      a: 'Watch time-to-approve, detail-view opens, edit rate and rejection rate. Instant approvals with no rejections mean the gate is decorative — the fix is asking about less, not adding warnings.',
    },
    {
      q: 'What happens to applications nobody reviewed?',
      a: 'They expire, with the reason shown. Submitting after a timeout sends something nobody approved, which is exactly what the gate existed to prevent.',
    },
    {
      q: 'Should editing be as easy as approving?',
      a: 'Yes. Most items are slightly off rather than wrong, and a reviewer who can fix one sentence produces a better application than one choosing between accept and discard.',
    },
  ],
  related: ['how-to-build-an-ai-agent-with-human-approval', 'what-is-autonomous-job-application', 'how-to-prevent-an-agent-applying-to-the-wrong-job'],
};

export default post;
