import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-get-a-job-in-germany',
  tint: 'amber',
  title: 'How to Get a Job in Germany as a Foreigner: Opportunity Card, EU Blue Card and Job Search',
  heading: 'How to get a job in Germany as an international professional',
  description:
    'How foreign professionals can find work in Germany: the Opportunity Card (Chancenkarte), EU Blue Card, skilled worker visas, recognising qualifications, German-style CVs and whether you need to speak German.',
  keywords: [
    'how to get a job in germany',
    'germany opportunity card',
    'chancenkarte',
    'eu blue card germany',
    'jobs in germany for foreigners',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Global Careers',
  anchors: ['work in Germany', 'EU Blue Card'],
  excerpt:
    'Germany faces skilled-worker shortages and has opened several routes for international professionals, including the points-based Opportunity Card for job seekers. Here is how the main routes work and how to apply effectively.',
  keyTakeaways: [
    'The Opportunity Card (Chancenkarte) lets qualified non-EU professionals come to Germany to look for work.',
    'The EU Blue Card is for university graduates with a qualifying job offer above a minimum salary.',
    'Having your qualifications recognised is often a key step, and is mandatory for regulated professions.',
    'Many tech jobs use English, but German skills widen your options and help day-to-day life considerably.',
  ],
  sections: [
    {
      heading: 'Main routes for non-EU professionals',
      paragraphs: [],
      table: {
        caption: 'Common routes to work in Germany',
        columns: ['Route', 'Who it suits', 'Key points'],
        rows: [
          ['Opportunity Card (Chancenkarte)', 'Skilled workers who want to search for a job in Germany', 'Points-based (qualifications, language, experience, age, ties to Germany); allows a job search period with limited part-time work'],
          ['EU Blue Card', 'University graduates with a job offer', 'Requires a minimum salary that is updated each year; lower thresholds apply to shortage occupations and recent graduates'],
          ['Skilled worker visa', 'People with recognised vocational or academic qualifications and a job offer', 'Covers many occupations beyond university-level roles'],
          ['IT specialists without a degree', 'Experienced IT professionals', 'Possible with sufficient professional experience and a qualifying job offer'],
        ],
      },
    },
    {
      heading: 'Recognition of qualifications',
      paragraphs: [
        'For regulated professions such as medicine, nursing, teaching and some engineering roles, recognition of your foreign qualification is mandatory. For many other jobs, a comparability statement for your degree is still helpful or required for certain visas. Start this early, because it can take weeks or months.',
      ],
    },
    {
      heading: 'German-style CV (Lebenslauf)',
      paragraphs: [],
      bullets: [
        'Typically one to two pages, in reverse-chronological order, often in a tabular layout',
        'Include exact months and years for each role and education entry',
        'A photo is optional and increasingly omitted, though still common',
        'Write a tailored cover letter (Anschreiben) when requested',
        'Include certificates and references (Arbeitszeugnisse) if you have them',
        'Apply in English for English-language postings, in German for German ones',
      ],
    },
    {
      heading: 'Do you need to speak German?',
      paragraphs: [
        'International tech companies and start-ups in cities like Berlin and Munich often work in English. Outside tech, and in healthcare, public-facing and many traditional companies, German is usually required. Even basic German (A2–B1) improves your chances and daily life, and it can add points for the Opportunity Card.',
      ],
    },
  ],
  faqs: [
    { q: 'Can I go to Germany to look for a job?', a: 'Yes. The Opportunity Card is designed for qualified non-EU professionals to search for work in Germany, subject to eligibility and points.' },
    { q: 'What salary do I need for an EU Blue Card?', a: 'There is a minimum gross salary that is updated annually, with a lower threshold for shortage occupations and recent graduates. Check the current figure on the official Make it in Germany portal.' },
  ],
  related: [
    'how-to-find-jobs-with-visa-sponsorship-in-2026',
    'resume-vs-cv-difference',
    'best-countries-for-indian-it-professionals-to-work-abroad',
  ],
  references: [
    { title: 'Make it in Germany', url: 'https://www.make-it-in-germany.com/en/', publisher: 'Make it in Germany', note: 'The German government\'s official portal for skilled workers from abroad.' },
    { title: 'Opportunity Card', url: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card', publisher: 'Make it in Germany', note: 'Official eligibility and points criteria for the Chancenkarte.' },
  ],
};

export default post;
