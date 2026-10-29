import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-negotiate-salary',
  tint: 'emerald',
  title: 'How to Negotiate Salary After a Job Offer (Scripts and Email Template)',
  heading: 'How to negotiate your salary after a job offer',
  description:
    'A practical salary negotiation guide: when to negotiate, how to research your market value, word-for-word scripts, an email template for counter-offers, and how to negotiate benefits when base pay is fixed.',
  keywords: [
    'how to negotiate salary',
    'salary negotiation tips',
    'how to counter offer salary',
    'salary negotiation email',
    'negotiate job offer',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Career Growth',
  anchors: ['negotiate your salary', 'salary negotiation'],
  excerpt:
    'Most employers expect some negotiation, and offers are rarely withdrawn for a polite, well-researched counter. Here is how to prepare, what to say, and how to put it in writing.',
  keyTakeaways: [
    'Negotiate after you have a written offer, when you have the most leverage.',
    'Base your counter on market data and the scope of the role, not on personal expenses.',
    'Ask for a specific number slightly above your target, and explain why in one or two sentences.',
    'If base salary is fixed, negotiate joining bonus, equity, title, leave, remote work or a review date.',
  ],
  sections: [
    {
      heading: 'When to negotiate',
      paragraphs: [
        'The best moment is after you receive an offer and before you accept it. At that point the company has chosen you and invested time in the process. Thank them, express enthusiasm, and ask for a day or two to review the full package in writing.',
      ],
    },
    {
      heading: 'Prepare your case',
      paragraphs: [],
      bullets: [
        'Collect market data for the same title, level and location from several sources',
        'List what you bring that justifies the upper end: rare skills, directly relevant results, competing offers',
        'Decide your target number and your walk-away point before the conversation',
        'Calculate total compensation of the offer: base, bonus, equity, benefits, leave',
      ],
    },
    {
      heading: 'What to say: negotiation scripts',
      paragraphs: [],
      table: {
        caption: 'Salary negotiation scripts for common situations',
        columns: ['Situation', 'Script'],
        rows: [
          ['Opening the counter', '"Thank you — I\'m excited about this role and the team. Based on my research for similar roles and the scope we discussed, I was expecting something closer to [number]. Is there flexibility on the base?"'],
          ['You have another offer', '"I have another offer at [number], but this role is my first choice. If you could move closer to that, I\'d be ready to accept."'],
          ['They say the base is fixed', '"I understand. Could we look at a joining bonus of [amount], or a compensation review after six months?"'],
          ['They ask for your minimum', '"I\'d rather focus on what\'s fair for the role. Based on the market, [target] reflects the value I\'ll bring."'],
        ],
      },
    },
    {
      heading: 'Counter-offer email template',
      paragraphs: [],
      example: {
        title: 'Email template',
        paragraphs: [
          'Subject: [Job Title] offer — next steps',
          'Hi [Name], thank you again for the offer for the [Job Title] role. I am very excited about joining [Company] and about [specific project or goal].',
          'Having reviewed the package, and based on market data for this role in [city] together with my experience in [relevant strength], I would like to ask whether you could increase the base salary to [number].',
          'If we can reach that, I am ready to accept and confirm my start date. Happy to discuss on a call. Best regards, [Name]',
        ],
      },
    },
    {
      heading: 'What to negotiate besides salary',
      paragraphs: [],
      bullets: [
        'Joining or sign-on bonus',
        'Equity amount or vesting schedule',
        'Job title or level',
        'Extra paid leave',
        'Remote or hybrid working arrangements',
        'Learning budget or certification costs',
        'A guaranteed compensation review date',
        'Relocation support',
      ],
    },
  ],
  commonMistakes: [
    { mistake: 'Accepting on the spot', fix: 'Thank them and ask for time to review the written offer.' },
    { mistake: 'Citing personal expenses', fix: 'Justify your number with market data and your impact.' },
    { mistake: 'Bluffing about other offers', fix: 'Only mention competing offers you actually have.' },
    { mistake: 'Negotiating after accepting', fix: 'Raise everything you want before you say yes.' },
  ],
  faqs: [
    { q: 'Can a job offer be withdrawn if I negotiate?', a: 'It is rare when the request is polite and reasonable. Offers are usually withdrawn only after aggressive demands or ultimatums.' },
    { q: 'How much more should I ask for?', a: 'Many people ask for 5–15% above the initial offer, backed by market data. Stay within a range you can justify.' },
    { q: 'Should I negotiate by phone or email?', a: 'A short call is good for tone and quick back-and-forth; follow up in email so the agreed terms are written down.' },
  ],
  related: [
    'how-to-answer-salary-expectations',
    'how-to-evaluate-a-job-offer',
    'how-to-ask-for-a-raise',
  ],
  references: [
    { title: 'Occupational Outlook Handbook', url: 'https://www.bls.gov/ooh/', publisher: 'U.S. Bureau of Labor Statistics', note: 'Official median pay by occupation for salary research.' },
    { title: 'Wages', url: 'https://www.dol.gov/general/topic/wages', publisher: 'U.S. Department of Labor', note: 'Overview of U.S. wage laws, minimum wage and overtime rules.' },
  ],
};

export default post;
