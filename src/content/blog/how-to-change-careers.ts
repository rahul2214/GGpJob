import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-change-careers',
  tint: 'violet',
  title: 'How to Change Careers at Any Age: A Step-by-Step Plan',
  heading: 'How to change careers: a practical step-by-step plan',
  description:
    'A realistic plan for switching careers at 25, 30, 40 or later: choosing a new field, mapping transferable skills, closing skill gaps affordably, getting experience, and rewriting your resume for the switch.',
  keywords: [
    'how to change careers',
    'career change at 30',
    'career change at 40',
    'switching careers',
    'transferable skills',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Career Growth',
  anchors: ['change careers', 'career change'],
  excerpt:
    'Career changes work best as a planned bridge, not a leap. Test the new field cheaply, build proof of skill, and use your existing experience as an advantage rather than something to hide.',
  keyTakeaways: [
    'Research and test a new career with conversations and small projects before quitting anything.',
    'Map your transferable skills; most career changers bring more relevant experience than they think.',
    'Close skill gaps with focused, affordable learning and portfolio projects rather than a new degree by default.',
    'Target "bridge roles" that combine your old domain with your new skills.',
  ],
  sections: [
    {
      heading: 'Step 1: Choose a direction',
      paragraphs: [
        'List what you want more and less of: type of work, pay, flexibility, stability, creativity. Then shortlist two or three fields and check their outlook, typical pay and entry requirements in official sources such as labour statistics and occupation databases.',
        'Talk to three to five people in each field. Ask what a normal week looks like and what they wish they had known before starting. These informational interviews are the cheapest way to avoid an expensive mistake.',
      ],
    },
    {
      heading: 'Step 2: Map transferable skills',
      paragraphs: [],
      table: {
        caption: 'Examples of transferable skills in common career changes',
        columns: ['From', 'To', 'Transferable strengths'],
        rows: [
          ['Teaching', 'Instructional design / L&D', 'Curriculum planning, explaining complex ideas, assessment'],
          ['Sales', 'Customer success / product marketing', 'Customer insight, communication, negotiation'],
          ['Operations / logistics', 'Data analytics', 'Process knowledge, Excel, KPIs, problem-solving'],
          ['Nursing / healthcare', 'Health tech / clinical informatics', 'Clinical workflows, compliance, patient focus'],
          ['Accounting', 'Financial analysis / FP&A', 'Modelling, attention to detail, reporting'],
          ['Customer support', 'QA testing / technical support engineering', 'Troubleshooting, documentation, product knowledge'],
        ],
      },
    },
    {
      heading: 'Step 3: Close the skill gap',
      paragraphs: [
        'Compare five to ten job postings for your target role and list the skills that appear repeatedly. Learn those first, through short courses, certifications that employers actually ask for, and above all projects you can show. A portfolio of two or three realistic projects often beats a certificate on its own.',
      ],
    },
    {
      heading: 'Step 4: Get real experience',
      paragraphs: [],
      bullets: [
        'Volunteer the new skill in your current job (for example, build the team\'s reporting dashboard)',
        'Take small freelance or pro-bono projects',
        'Contribute to open-source or community projects',
        'Apply for internal transfers, which are often easier than external switches',
        'Look for apprenticeships and "returnship" programmes',
      ],
    },
    {
      heading: 'Step 5: Rewrite your story',
      paragraphs: [
        'Your resume should lead with a summary that names the new target role, followed by a skills section and projects, then your previous experience reframed around transferable results. In interviews, explain the change as a logical next step: "I kept using data to solve operations problems, so I trained formally in analytics."',
      ],
    },
  ],
  faqs: [
    { q: 'Is 30 or 40 too late to change careers?', a: 'No. Many people switch in their 30s, 40s and 50s. Maturity, domain knowledge and professional habits are real advantages; the key is planning the finances and learning time.' },
    { q: 'Do I need a new degree?', a: 'Usually not. Some regulated professions require one, but many fields hire on skills, certifications and portfolios.' },
    { q: 'Will I have to take a pay cut?', a: 'Sometimes, at first. Bridge roles that use your existing experience can reduce or avoid the drop.' },
  ],
  related: [
    'how-to-switch-careers-into-ai-without-starting-from-zero',
    'how-to-explain-an-employment-gap',
    'fastest-growing-jobs-worldwide',
  ],
  references: [
    { title: 'Occupational Outlook Handbook', url: 'https://www.bls.gov/ooh/', publisher: 'U.S. Bureau of Labor Statistics', note: 'Duties, education, pay and outlook for hundreds of occupations.' },
    { title: 'O*NET OnLine', url: 'https://www.onetonline.org/', publisher: 'O*NET OnLine', note: 'Search occupations by skills you already have.' },
  ],
};

export default post;
