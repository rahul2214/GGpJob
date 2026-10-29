import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-ask-for-a-raise',
  tint: 'emerald',
  title: 'How to Ask for a Raise: Timing, Scripts and What to Do If They Say No',
  heading: 'How to ask for a raise (and actually get one)',
  description:
    'A step-by-step guide to asking for a pay rise: building your evidence, choosing the right timing, what to say in the meeting, an email to request it, and how to respond to a no.',
  keywords: [
    'how to ask for a raise',
    'asking for a pay rise',
    'salary increase request',
    'how to ask for a raise email',
    'when to ask for a raise',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 7,
  category: 'Career Growth',
  anchors: ['ask for a raise', 'pay rise'],
  excerpt:
    'Raises go to people who make a clear case at the right time. Document your impact, check the market rate, and ask for a specific number in a planned conversation — not in passing.',
  keyTakeaways: [
    'Ask one to three months before budgets are set, not after they are finalised.',
    'Bring evidence: results, expanded responsibilities and market pay data.',
    'Request a specific number or percentage and explain why it is fair.',
    'If the answer is no, agree on concrete goals and a date to revisit.',
  ],
  sections: [
    {
      heading: 'Choose the right timing',
      paragraphs: [
        'Most companies decide pay increases during an annual budget or review cycle. Asking a couple of months before that window gives your manager time to secure the budget. Good moments include after a major win, after taking on new responsibilities, or when you receive strong feedback. Avoid periods of layoffs or poor company results.',
      ],
    },
    {
      heading: 'Build your evidence',
      paragraphs: ['Make it easy for your manager to argue for you with their own boss.'],
      bullets: [
        'Three to five measurable achievements from the last 6–12 months',
        'New responsibilities beyond your original job description',
        'Positive feedback from customers, peers or leadership',
        'Market data showing pay for your role and level',
        'Skills or certifications you have added',
      ],
    },
    {
      heading: 'What to say in the meeting',
      paragraphs: [],
      example: {
        title: 'Script',
        paragraphs: [
          '"Thanks for making time. I\'d like to talk about my compensation. Over the past year I\'ve [achievement 1], [achievement 2], and taken on [new responsibility]. Based on that and market data for similar roles, which is around [range], I\'d like to ask for an increase to [number]. What would it take to make that happen in this cycle?"',
        ],
      },
    },
    {
      heading: 'Email to request the conversation',
      paragraphs: [],
      example: {
        title: 'Email template',
        paragraphs: [
          'Subject: Time to discuss my compensation',
          'Hi [Manager], could we set up 30 minutes in the next couple of weeks to discuss my role and compensation? I\'d like to share what I\'ve delivered this year and talk about next steps. Thanks, [Name]',
        ],
      },
    },
    {
      heading: 'If the answer is no',
      paragraphs: [
        'Stay calm and turn the no into a plan. Ask what specific results would justify the increase, agree on a date to revisit (for example, in three or six months), and confirm it in writing. If there is truly no budget, consider negotiating non-salary items: a title change, training budget, flexible hours or extra leave.',
        'If you repeatedly meet goals and pay still does not move, it may be time to test the market. An external offer is often the clearest measure of your value.',
      ],
    },
  ],
  faqs: [
    { q: 'How much of a raise should I ask for?', a: 'Base it on market data and your contribution. For a strong performer in the same role, asking for 5–10% above a standard increase is common; promotions often justify more.' },
    { q: 'Should I mention another job offer?', a: 'Only if you would genuinely accept it. Using an offer as a bluff can damage trust if your employer calls it.' },
    { q: 'Can I ask for a raise in my first year?', a: 'Yes, if your role has grown significantly or you were hired below market. Otherwise, the first annual review is the natural point.' },
  ],
  related: [
    'how-to-negotiate-salary',
    'how-to-answer-salary-expectations',
    'top-high-paying-technology-skills-2026',
  ],
  references: [
    { title: 'Occupational Outlook Handbook', url: 'https://www.bls.gov/ooh/', publisher: 'U.S. Bureau of Labor Statistics', note: 'Pay data by occupation to support your request.' },
  ],
};

export default post;
