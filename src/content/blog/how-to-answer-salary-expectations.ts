import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-answer-salary-expectations',
  tint: 'amber',
  title: 'How to Answer "What Are Your Salary Expectations?" (Scripts + Examples)',
  heading: 'How to answer "What are your salary expectations?"',
  description:
    'Research-backed ways to answer the salary expectations question on application forms, in recruiter screens and in final interviews — with scripts for giving a range, deflecting early, and handling pushback.',
  keywords: [
    'what are your salary expectations',
    'salary expectations interview answer',
    'expected salary question',
    'how to answer desired salary',
    'salary range in interview',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 7,
  category: 'Interviews',
  anchors: ['salary expectations'],
  excerpt:
    'Say a number too low and you leave money on the table; too high and you risk being screened out. Research the market, give a well-reasoned range, and know when to ask for their budget first.',
  keyTakeaways: [
    'Research market pay for the role, level and location before the first call.',
    'Give a range whose bottom is a number you would genuinely accept.',
    'Early in the process, it is reasonable to ask for the budgeted range first.',
    'Talk about total compensation — base, bonus, equity and benefits — not just base salary.',
  ],
  sections: [
    {
      heading: 'Do your research first',
      paragraphs: [
        'Your answer is only as strong as your data. Check several sources for the same title, seniority and city: salary surveys, government wage data, job postings that publish ranges (many US states and some countries require pay transparency), and conversations with people in the field.',
        'Then decide three numbers privately: your walk-away minimum, your realistic target, and an ambitious but defensible top.',
      ],
    },
    {
      heading: 'Scripts for each stage',
      paragraphs: [],
      table: {
        caption: 'How to answer salary expectations at different stages',
        columns: ['Situation', 'What to say'],
        rows: [
          ['Recruiter screen, early', '"I\'d like to learn more about the responsibilities first. Could you share the budgeted range for this role?"'],
          ['They insist on a number', '"Based on my research for similar roles in [city] and my experience with [skill], I\'m targeting [range]. I\'m flexible depending on the overall package."'],
          ['Application form requires a number', 'Enter your researched target or the midpoint of your range; avoid 0 or 1 if the form validates numbers.'],
          ['Final stage', '"Given the scope we\'ve discussed, including [responsibility], I\'d be looking for [range] in base salary."'],
          ['Their range is lower than yours', '"Thanks for sharing. My research suggests [range] for this scope. Is there flexibility in base, or in bonus or equity?"'],
        ],
      },
    },
    {
      heading: 'How to build your range',
      paragraphs: [
        'Anchor the bottom of your range at or slightly above your target, not at your minimum. Negotiations tend to settle toward the lower end of a stated range, so a range of "70,000 to 80,000" usually leads to offers near 70,000.',
        'Keep the range reasonably narrow — around 10 to 20% wide. A very wide range looks uncertain.',
      ],
    },
    {
      heading: 'Look at total compensation',
      paragraphs: ['Base salary is only part of the offer. Compare the whole package.'],
      bullets: [
        'Annual bonus target and how often it is actually paid',
        'Equity or stock grants and the vesting schedule',
        'Retirement contributions, health insurance and other benefits',
        'Paid leave, remote-work allowance and learning budget',
        'Joining bonus or relocation support',
      ],
    },
  ],
  commonMistakes: [
    { mistake: 'Naming your current salary as your expectation', fix: 'Base expectations on the market value of the new role.' },
    { mistake: 'Giving a range whose bottom you would not accept', fix: 'Set the floor at a number you would be happy with.' },
    { mistake: 'Apologising or hedging', fix: 'State your range calmly and explain it with research.' },
  ],
  faqs: [
    { q: 'Do I have to share my current salary?', a: 'In several US states and cities, employers are not allowed to ask about salary history. Elsewhere you can politely redirect to your expectations for the new role.' },
    { q: 'What if I underbid by mistake?', a: 'Before you accept an offer, you can still say that after learning more about the scope, you would like to revisit compensation, and give your reasoning.' },
    { q: 'Should I give a number or a range?', a: 'A range is usually better early on. Near the end, a single confident number tied to the agreed scope can be effective.' },
  ],
  related: [
    'how-to-negotiate-salary',
    'how-to-evaluate-a-job-offer',
    'how-to-negotiate-your-first-salary-as-a-fresher',
  ],
  references: [
    { title: 'Occupational Outlook Handbook', url: 'https://www.bls.gov/ooh/', publisher: 'U.S. Bureau of Labor Statistics', note: 'Median pay data for hundreds of occupations in the United States.' },
    { title: 'O*NET OnLine', url: 'https://www.onetonline.org/', publisher: 'O*NET OnLine', note: 'Wage and employment information by occupation and state.' },
  ],
};

export default post;
