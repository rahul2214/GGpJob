import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'what-is-agi',
  tint: 'violet',
  title: 'What Is AGI? A Plain-English Explanation',
  heading: 'What AGI actually means',
  description:
    'What AGI actually means, how it differs from the AI we use today, why nobody agrees on a timeline, and what it would realistically change about work.',
  keywords: [
    'what is agi',
    'artificial general intelligence',
    'agi vs ai',
    'agi meaning',
    'when will agi arrive',
    'agi explained',
    'difference between ai and agi',
    'agi impact on jobs',
  ],
  publishedAt: '2026-09-08',
  updatedAt: '2026-09-08',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AGI & Future',
  anchors: ['artificial general intelligence', 'AGI timeline'],
  excerpt:
    'AGI is discussed constantly and defined rarely. Here is what the term means, why the timelines disagree so wildly, and what it would actually change.',
  keyTakeaways: [
    'Most disagreement about AGI is definitional: people argue about timelines while meaning different capabilities.',
    'Breadth is largely solved. Reliability, durable memory and knowing its own limits are not.',
    'Credible estimates range from a few years to never, which is itself the most honest summary available.',
    'Deployment lags capability by years — regulation, liability and inertia slow adoption more than forecasts allow.',
    'The useful question is which parts of your work are automatable now, which has answers regardless of AGI.',
  ],
  sections: [
    {
      heading: 'The definition problem',
      paragraphs: [
        'Artificial General Intelligence usually means a system that can perform essentially any intellectual task a human can, rather than being trained for a narrow set. That sounds precise until you try to test it. Which human? At what level? Across which tasks?',
        'This is not pedantry. A great deal of disagreement about whether AGI is close comes down to people using different definitions. One person means "matches a competent professional at most desk work". Another means "can autonomously do original science". Those are decades apart, and both get called AGI.',
        'Before engaging with any claim about AGI, it is worth asking what the speaker would accept as evidence. Where there is no answer, the claim is not really about capability — it is about sentiment, and it cannot be argued with or checked.',
      ],
      table: {
        caption: 'Four common definitions of AGI and what each would actually require',
        columns: ['Definition in use', 'Would require', 'Roughly how far off'],
        rows: [
          ['Matches a professional at desk work', 'Reliability without supervision', 'Contested, arguably close'],
          ['Does any task a human can, remotely', 'Long-horizon memory and planning', 'Clearly not yet'],
          ['Learns a new job as fast as a person', 'Continual learning from experience', 'Not demonstrated'],
          ['Performs original science unaided', 'All of the above, plus taste', 'No credible path stated'],
        ],
      },
    },
    {
      heading: 'How today’s AI differs',
      paragraphs: [
        'Current systems are extraordinarily broad compared to AI from a decade ago — the same model writes code, summarises documents and answers questions across domains. That breadth is genuinely new and is why the AGI conversation restarted.',
        'What they still lack is consistent reliability, durable memory across long horizons, and the ability to notice when they are wrong. A system that is brilliant nine times and confidently mistaken the tenth requires supervision, and that supervision requirement is exactly what separates a powerful tool from a general worker.',
        'The gap is best seen in duration rather than difficulty. These systems handle genuinely hard problems that take a person an hour. They do not yet handle mundane work that takes a person three weeks, because holding a goal, a plan and an accumulating context across that span is a different capability from being clever in a single sitting.',
      ],
      bullets: [
        'Broad capability across domains — largely achieved',
        'Reliability high enough to remove human review — not achieved',
        'Learning continuously from its own experience — limited',
        'Knowing the boundary of its own competence — largely absent',
        'Holding a goal coherently across weeks — not demonstrated',
      ],
    },
    {
      heading: 'Why the timelines disagree so wildly',
      paragraphs: [
        'Credible researchers currently give estimates ranging from a few years to never. That spread should tell you something: nobody has a reliable method for forecasting this. The honest position is deep uncertainty, not a confident number.',
        'Be sceptical of anyone giving you a specific year with confidence, in either direction. Forecasting records on transformative technology are poor, and the incentives around AGI predictions — funding, attention, product positioning — are not neutral.',
        'There is also a structural reason the disagreement persists. Progress has come from scaling and from unexpected capability jumps rather than from a roadmap anyone wrote down, which means there is no schedule to be ahead of or behind. Extrapolating a curve that has already surprised people twice is not forecasting.',
      ],
    },
    {
      heading: 'What would have to change for the answer to be clear',
      paragraphs: [
        'It is more productive to watch for specific capabilities than to track opinion. The first is reliability at length: a system completing a multi-week task to a professional standard without a person catching its errors along the way.',
        'The second is calibrated self-knowledge — a system that reliably says it does not know, rather than producing a confident answer. This matters more than raw capability for practical purposes, because it is what would let a person stop checking every output.',
        'The third is learning on the job. Current systems do not accumulate skill from their own experience the way a new employee does across their first six months; each session starts largely fresh. A system that genuinely improved at a specific job by doing it would be a qualitative change, not an incremental one.',
      ],
      bullets: [
        'Sustained reliability across multi-week tasks',
        'Saying "I do not know" accurately rather than guessing',
        'Improving at a specific job by doing that job',
        'Noticing that the situation has changed and adapting the plan',
      ],
    },
    {
      heading: 'What it would actually change about work',
      paragraphs: [
        'Even under optimistic assumptions, deployment lags capability by years. Regulation, liability, integration with existing systems, trust and simple organisational inertia all slow adoption far more than most predictions allow for. Electricity took decades to reshape factories after it was technically available.',
        'The more useful question is not "when does AGI arrive" but "which parts of my work are becoming automatable now". That question has actionable answers today, and preparing for it is useful whether or not AGI ever arrives on anyone’s timeline.',
        'The historical pattern is also worth holding onto: general-purpose technologies change which work exists faster than they reduce how much work exists. That is not a guarantee about this one, but it is a better prior than either the catastrophe or the utopia.',
      ],
      example: {
        title: 'Why capability and deployment come apart',
        paragraphs: [
          'Consider a hospital. Suppose a system could reliably read scans at a specialist standard tomorrow. It still needs regulatory approval, integration with existing records software, a resolved answer to who is liable for a missed diagnosis, retraining for the staff who use it, and enough trust from clinicians to be acted upon.',
          'Each of those is measured in years, and none of them is a machine learning problem. The technical milestone is the start of the adoption timeline, not the end of it — which is why capability announcements and workplace change feel so disconnected.',
        ],
      },
    },
    {
      heading: 'What to do with the uncertainty',
      paragraphs: [
        'Treating AGI as imminent and abandoning your career plans is a bad bet. So is assuming nothing changes. The reasonable middle is to keep building things that are hard to unbundle: domain expertise, judgement, accountability for outcomes, and relationships.',
        'Notice that this is the same advice that holds if AGI never arrives. Strategies that only pay off under one specific future are fragile; the ones worth taking are those that make sense across several.',
        'It is also reasonable to simply not have a view. The question is genuinely undecided by people who spend their careers on it, and holding a confident position on it is not a prerequisite for making good decisions about your own work.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the difference between AI and AGI?',
      a: 'AI refers to systems built for particular tasks, however broad. AGI would mean a system able to perform essentially any intellectual task a person can, including ones it was never prepared for, at a comparable standard of reliability.',
    },
    {
      q: 'When will AGI arrive?',
      a: 'Nobody knows, and credible estimates range from a few years to never. The wide spread reflects genuine uncertainty and disagreement about the definition itself, so treat confident specific dates with scepticism.',
    },
    {
      q: 'Should I change my career because of AGI?',
      a: 'Not on the basis of AGI predictions alone. Deepening domain expertise, moving toward owning outcomes, and getting fluent with current tools are sensible whether or not AGI arrives — which is what makes them worth doing.',
    },
    {
      q: 'Are current AI systems close to AGI?',
      a: 'They have largely solved breadth, which is the visible part. Reliability without supervision, memory across long horizons and knowing their own limits are not solved, and those are what separate a tool from a general worker.',
    },
    {
      q: 'What specific signs would indicate AGI is near?',
      a: 'Sustained reliability across multi-week tasks, accurate admission of uncertainty rather than confident guessing, and genuine improvement at a job through doing it. Watch for those rather than for benchmark scores.',
    },
    {
      q: 'Why do capability announcements not change my workplace?',
      a: 'Because deployment lags capability by years. Regulation, liability, systems integration, retraining and trust are each measured in years and none of them is a machine learning problem.',
    },
  ],
  related: ['what-are-ai-agents', 'will-ai-take-my-job', 'what-is-agentic-ai'],
};

export default post;
