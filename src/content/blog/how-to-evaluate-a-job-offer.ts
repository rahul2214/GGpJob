import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-evaluate-a-job-offer',
  tint: 'sky',
  title: 'How to Evaluate a Job Offer: 12 Things to Check Before You Accept',
  heading: 'How to evaluate a job offer before you accept',
  description:
    'A checklist for comparing job offers beyond salary: total compensation, equity, benefits, growth, manager, workload, stability, remote policy and contract terms — with a simple scoring method.',
  keywords: [
    'how to evaluate a job offer',
    'job offer checklist',
    'comparing two job offers',
    'questions to ask before accepting a job offer',
    'total compensation',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 7,
  category: 'Career Growth',
  anchors: ['evaluate a job offer', 'compare job offers'],
  excerpt:
    'The highest salary is not always the best offer. Compare total compensation, growth, the manager you will work for, and the fine print — then score each offer against what matters most to you.',
  keyTakeaways: [
    'Compare total compensation, not just base salary.',
    'Your direct manager and the team have a huge effect on growth and day-to-day satisfaction.',
    'Read the contract for notice periods, non-compete clauses, probation terms and bonus conditions.',
    'Use a weighted scorecard to compare offers objectively.',
  ],
  sections: [
    {
      heading: 'The 12-point checklist',
      paragraphs: [],
      table: {
        caption: 'Job offer evaluation checklist',
        columns: ['Area', 'What to check'],
        rows: [
          ['Base salary', 'How it compares to market data for the role and location'],
          ['Bonus', 'Target percentage, how it is calculated, and how often it has actually paid out'],
          ['Equity', 'Number of shares or units, current value, vesting schedule, and what happens if you leave'],
          ['Benefits', 'Health insurance, retirement contributions, parental leave, wellness and learning budgets'],
          ['Time off', 'Paid leave, holidays, sick leave and flexibility'],
          ['Work arrangement', 'Remote, hybrid or office, commute, and how firm the policy is'],
          ['Role scope', 'What you will own, and whether the title matches the level'],
          ['Manager', 'Their style, track record of promoting people, and how long they have been there'],
          ['Growth', 'Promotion process, training, mentorship and internal mobility'],
          ['Company stability', 'Funding or profitability, recent layoffs, market position'],
          ['Workload and culture', 'Typical hours, on-call duties, how people describe the team'],
          ['Contract terms', 'Probation, notice period, non-compete, IP and relocation repayment clauses'],
        ],
      },
    },
    {
      heading: 'Questions to ask before you accept',
      paragraphs: [],
      bullets: [
        'What does success look like in the first six months?',
        'How are performance reviews and raises handled, and how often?',
        'Why is this role open?',
        'Can I speak to someone currently on the team?',
        'When does equity vest, and what is the company\'s most recent valuation?',
      ],
    },
    {
      heading: 'Use a weighted scorecard',
      paragraphs: [
        'List the factors that matter most to you, give each a weight out of 10, and score each offer from 1 to 5. Multiply and add. The result will not decide for you, but it makes trade-offs visible and reduces the pull of a single big number.',
      ],
      example: {
        title: 'Example',
        paragraphs: [
          'Offer A pays 10% more but is fully in-office with a long commute and limited training. Offer B pays less but is hybrid, with a manager known for promoting people and a clear path to senior level within two years. If growth and flexibility carry high weights for you, Offer B may score higher overall.',
        ],
      },
    },
  ],
  faqs: [
    { q: 'How long can I take to decide on a job offer?', a: 'Two to five working days is normal. Ask for the deadline politely and use the time to review the written offer.' },
    { q: 'Should I accept a verbal offer?', a: 'Express enthusiasm, but wait for the written offer before resigning from your current job.' },
    { q: 'How do I decline an offer politely?', a: 'Thank them, decline clearly, and keep the door open: "I have decided to accept another role, but I enjoyed meeting the team and hope our paths cross again."' },
  ],
  related: [
    'how-to-negotiate-salary',
    'how-to-resign-professionally',
    'how-to-identify-fake-job-offers-and-recruitment-scams',
  ],
  references: [
    { title: 'Occupational Outlook Handbook', url: 'https://www.bls.gov/ooh/', publisher: 'U.S. Bureau of Labor Statistics', note: 'Use median pay data to benchmark a base salary.' },
  ],
};

export default post;
