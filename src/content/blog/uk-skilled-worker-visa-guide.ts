import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'uk-skilled-worker-visa-guide',
  tint: 'sky',
  title: 'UK Skilled Worker Visa Guide: Eligibility, Salary Rules and Finding a Sponsor',
  heading: 'UK Skilled Worker visa: how it works and how to find a sponsor',
  description:
    'An overview of the UK Skilled Worker visa: sponsor licences, certificates of sponsorship, eligible occupations, salary requirements, English language rules, costs, and how to find UK employers that sponsor visas.',
  keywords: [
    'uk skilled worker visa',
    'uk visa sponsorship jobs',
    'certificate of sponsorship',
    'uk work visa requirements',
    'licensed sponsors list',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Global Careers',
  anchors: ['Skilled Worker visa', 'UK visa sponsorship'],
  excerpt:
    'The Skilled Worker visa is the main route for overseas professionals to work in the UK. You need a job offer from a licensed sponsor, an eligible occupation and a salary that meets the rules — which have tightened in recent years.',
  keyTakeaways: [
    'You need a job offer from a UK employer with a sponsor licence and a certificate of sponsorship.',
    'The job must be in an eligible occupation and meet minimum salary thresholds, which were raised in 2024 and 2025.',
    'English language requirements apply, and there are application fees and the Immigration Health Surcharge.',
    'Use the government\'s register of licensed sponsors to target employers that can sponsor.',
  ],
  sections: [
    {
      heading: 'Eligibility at a glance',
      paragraphs: ['Requirements change regularly, so treat this as an overview and confirm details on GOV.UK.'],
      table: {
        caption: 'Main Skilled Worker visa requirements',
        columns: ['Requirement', 'What it means'],
        rows: [
          ['Licensed sponsor', 'Your employer must be approved by the Home Office to sponsor workers'],
          ['Certificate of sponsorship', 'A reference number your employer assigns to your specific job'],
          ['Eligible occupation', 'The role must be on the list of eligible occupation codes at the required skill level'],
          ['Salary', 'Must meet the general threshold or the going rate for the occupation, whichever is higher, unless a reduction applies'],
          ['English language', 'Usually proven by an approved test, a degree taught in English, or nationality'],
          ['Costs', 'Application fee, Immigration Health Surcharge and, for the employer, the Immigration Skills Charge'],
        ],
      },
    },
    {
      heading: 'How to find a sponsoring employer',
      paragraphs: [],
      bullets: [
        'Search the public register of licensed sponsors for companies in your field',
        'Filter job boards for "visa sponsorship available"',
        'Target sectors with shortages, such as health and care, engineering and some technology roles',
        'Contact recruiters who specialise in international hiring',
        'Mention clearly in your application that you will require sponsorship',
      ],
    },
    {
      heading: 'Strengthening your application',
      paragraphs: [
        'Employers pay significant costs to sponsor, so make the business case easy: show directly relevant experience, skills that are hard to find locally, and evidence of English proficiency. A UK-style CV of two pages, tailored to the posting, is expected.',
      ],
    },
    {
      heading: 'After you arrive',
      paragraphs: [
        'Skilled Worker visas can be extended and can lead to settlement after a qualifying period, subject to current rules. Changing employers usually requires a new certificate of sponsorship and a new application, so check the process before switching jobs.',
      ],
    },
  ],
  faqs: [
    { q: 'Can I apply for a Skilled Worker visa without a job offer?', a: 'No. You must have a confirmed job offer and a certificate of sponsorship from a licensed UK employer.' },
    { q: 'What is the minimum salary?', a: 'There is a general salary threshold and an occupation-specific going rate; you must meet the higher of the two unless a reduced rate applies. The figures were increased recently, so check GOV.UK for current amounts.' },
    { q: 'Can my family join me?', a: 'Partners and children can usually apply as dependants, though rules differ for some occupations. Check current guidance before applying.' },
  ],
  related: [
    'visa-sponsorship-tech-jobs',
    'how-to-find-jobs-with-visa-sponsorship-in-2026',
    'resume-vs-cv-difference',
  ],
  references: [
    { title: 'Skilled Worker visa', url: 'https://www.gov.uk/skilled-worker-visa', publisher: 'GOV.UK', note: 'Official eligibility, costs and application guidance.' },
    { title: 'Register of licensed sponsors: workers', url: 'https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers', publisher: 'GOV.UK', note: 'The official list of UK organisations licensed to sponsor workers.' },
  ],
};

export default post;
