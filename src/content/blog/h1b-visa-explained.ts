import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'h1b-visa-explained',
  tint: 'indigo',
  title: 'H-1B Visa Explained: Eligibility, Lottery, Costs and Recent Changes',
  heading: 'The H-1B visa explained for international professionals',
  description:
    'How the US H-1B visa works: specialty occupation rules, the registration lottery and cap, timelines, employer costs and recent policy changes, plus alternatives such as L-1 and O-1 visas.',
  keywords: [
    'h1b visa',
    'h1b visa explained',
    'h1b lottery',
    'h1b sponsorship jobs',
    'h1b requirements',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Global Careers',
  anchors: ['H-1B visa', 'H-1B lottery'],
  excerpt:
    'The H-1B is the most common US work visa for professionals in specialty occupations. It requires an employer sponsor, usually goes through an annual lottery, and has seen significant policy changes recently — so check current rules before planning around it.',
  keyTakeaways: [
    'H-1B is for "specialty occupations" that normally require at least a bachelor\'s degree in a related field.',
    'Most first-time applicants must be selected in an annual registration lottery because of the yearly cap.',
    'The employer files the petition and pays most costs; recent policy changes have significantly increased costs for some new petitions.',
    'Cap-exempt employers (such as universities and some research organisations) can sponsor without the lottery.',
  ],
  sections: [
    {
      heading: 'Who qualifies',
      paragraphs: [
        'The job must be a specialty occupation, and you must hold a US bachelor\'s degree or a foreign equivalent in a related field (or equivalent experience). Common H-1B roles include software engineering, data science, engineering, finance and healthcare professions.',
      ],
    },
    {
      heading: 'How the process works',
      paragraphs: [],
      table: {
        caption: 'Typical H-1B cap process',
        columns: ['Stage', 'What happens'],
        rows: [
          ['Registration', 'The employer registers you electronically during the annual registration window, usually in March'],
          ['Selection', 'USCIS selects registrations up to the annual cap, including a separate allocation for US advanced degree holders'],
          ['Labour Condition Application', 'The employer files an LCA with the Department of Labor confirming wage and working conditions'],
          ['Petition', 'If selected, the employer files the full H-1B petition'],
          ['Start date', 'Approved cap-subject employees typically start on or after October 1'],
        ],
      },
    },
    {
      heading: 'Recent changes to watch',
      paragraphs: [
        'H-1B policy has changed significantly in recent years, including changes to how registrations are selected and a large additional fee introduced in 2025 for certain new petitions. Rules and their interpretation continue to evolve, and some changes face legal challenges.',
        'Before relying on the H-1B, check the latest guidance on the USCIS website and ask prospective employers how they currently handle sponsorship.',
      ],
    },
    {
      heading: 'Alternatives to the H-1B',
      paragraphs: [],
      bullets: [
        'L-1: intra-company transfer after working for the employer abroad, usually for at least one year',
        'O-1: for individuals with extraordinary ability, evidenced by awards, publications or recognition',
        'Cap-exempt H-1B: employment with universities and some non-profit research organisations',
        'Country-specific visas available to citizens of certain countries under trade agreements',
        'Student routes: graduate study with practical training options',
      ],
    },
  ],
  faqs: [
    { q: 'Can I apply for an H-1B myself?', a: 'No. A US employer must sponsor you and file the registration and petition.' },
    { q: 'How long can I stay on an H-1B?', a: 'Generally up to six years in total, in increments, with some extensions possible in specific situations such as pending green card processes.' },
    { q: 'Can I change jobs on an H-1B?', a: 'Yes, a new employer can file a petition for you, and in many cases you can start once it is filed, subject to the rules in force.' },
  ],
  related: [
    'visa-sponsorship-tech-jobs',
    'how-to-find-jobs-with-visa-sponsorship-in-2026',
    'how-to-get-a-job-in-canada',
  ],
  references: [
    { title: 'H-1B Specialty Occupations', url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations', publisher: 'USCIS', note: 'Official eligibility, registration and petition information.' },
    { title: 'Foreign Labor Certification', url: 'https://www.dol.gov/agencies/eta/foreign-labor', publisher: 'U.S. Department of Labor', note: 'Information on Labor Condition Applications and prevailing wages.' },
  ],
};

export default post;
