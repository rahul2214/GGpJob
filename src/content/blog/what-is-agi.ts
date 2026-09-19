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
  excerpt:
    'AGI is discussed constantly and defined rarely. Here is what the term means, why the timelines disagree so wildly, and what it would actually change.',
  sections: [
    {
      heading: 'The definition problem',
      paragraphs: [
        'Artificial General Intelligence usually means a system that can perform essentially any intellectual task a human can, rather than being trained for a narrow set. That sounds precise until you try to test it. Which human? At what level? Across which tasks?',
        'This is not pedantry. A great deal of disagreement about whether AGI is close comes down to people using different definitions. One person means "matches a competent professional at most desk work". Another means "can autonomously do original science". Those are decades apart, and both get called AGI.',
      ],
    },
    {
      heading: 'How today\'s AI differs',
      paragraphs: [
        'Current systems are extraordinarily broad compared to AI from a decade ago — the same model writes code, summarises documents and answers questions across domains. That breadth is genuinely new and is why the AGI conversation restarted.',
        'What they still lack is consistent reliability, durable memory across long horizons, and the ability to notice when they are wrong. A system that is brilliant nine times and confidently mistaken the tenth requires supervision, and that supervision requirement is exactly what separates a powerful tool from a general worker.',
      ],
      bullets: [
        'Broad capability across domains — largely achieved',
        'Reliability high enough to remove human review — not achieved',
        'Learning continuously from its own experience — limited',
        'Knowing the boundary of its own competence — largely absent',
      ],
    },
    {
      heading: 'Why the timelines disagree so wildly',
      paragraphs: [
        'Credible researchers currently give estimates ranging from a few years to never. That spread should tell you something: nobody has a reliable method for forecasting this. The honest position is deep uncertainty, not a confident number.',
        'Be sceptical of anyone giving you a specific year with confidence, in either direction. Forecasting records on transformative technology are poor, and the incentives around AGI predictions — funding, attention, product positioning — are not neutral.',
      ],
    },
    {
      heading: 'What it would actually change about work',
      paragraphs: [
        'Even under optimistic assumptions, deployment lags capability by years. Regulation, liability, integration with existing systems, trust and simple organisational inertia all slow adoption far more than most predictions allow for. Electricity took decades to reshape factories after it was technically available.',
        'The more useful question is not "when does AGI arrive" but "which parts of my work are becoming automatable now". That question has actionable answers today, and preparing for it is useful whether or not AGI ever arrives on anyone\'s timeline.',
      ],
    },
    {
      heading: 'What to do with the uncertainty',
      paragraphs: [
        'Treating AGI as imminent and abandoning your career plans is a bad bet. So is assuming nothing changes. The reasonable middle is to keep building things that are hard to unbundle: domain expertise, judgement, accountability for outcomes, and relationships.',
        'Notice that this is the same advice that holds if AGI never arrives. Strategies that only pay off under one specific future are fragile; the ones worth taking are those that make sense across several.',
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
  ],
  related: ['what-are-ai-agents', 'will-ai-take-my-job', 'ai-skills-in-demand'],
};

export default post;
