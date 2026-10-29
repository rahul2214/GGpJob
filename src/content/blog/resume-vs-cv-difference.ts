import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'resume-vs-cv-difference',
  tint: 'sky',
  title: 'Resume vs CV: What\'s the Difference and Which One Should You Use?',
  heading: 'Resume vs CV: the difference, by country and by job',
  description:
    'Resume or CV? Learn the real difference in length, content and purpose, which one employers expect in the US, UK, Europe, India, Canada and Australia, and how to convert one into the other.',
  keywords: [
    'resume vs cv',
    'difference between cv and resume',
    'cv or resume',
    'what is a cv',
    'cv format by country',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 6,
  category: 'Resumes & ATS',
  anchors: ['resume vs CV', 'difference between a CV and a resume'],
  excerpt:
    'A resume is a short, tailored summary for a specific job; a CV is a complete academic or professional record. But the words also mean different things in different countries — here is how to know which one an employer actually wants.',
  keyTakeaways: [
    'In the US and Canada, a resume is a one-to-two page tailored document; a CV is a long academic record.',
    'In the UK, Ireland, Europe, India and Australia, "CV" usually just means what Americans call a resume.',
    'Academic, research and medical roles everywhere expect a full CV with publications and grants.',
    'When a posting says "CV" for a corporate job outside the US, send a tailored two-page resume-style document.',
  ],
  sections: [
    {
      heading: 'The short answer',
      paragraphs: [
        'A resume is a marketing document: concise, tailored to one role, and focused on relevant achievements. A curriculum vitae (CV) is a comprehensive record of your career, usually used for academic, research, scientific and medical positions, and it grows with every publication, grant or teaching role.',
        'The confusion comes from geography. Outside North America, most employers say "CV" when they mean the short, tailored document. So the right choice depends on both the country and the type of job.',
      ],
    },
    {
      heading: 'Resume vs CV side by side',
      paragraphs: ['These are the practical differences for the North American definitions of each term.'],
      table: {
        caption: 'Comparison of a resume and an academic CV',
        columns: ['', 'Resume', 'Academic CV'],
        rows: [
          ['Length', '1 page (early career) to 2 pages', '2 pages to 10+ pages'],
          ['Tailoring', 'Rewritten for each job', 'Mostly static; updated as you add work'],
          ['Focus', 'Relevant achievements and skills', 'Complete history: research, publications, teaching'],
          ['Sections', 'Summary, experience, skills, education', 'Education, research, publications, grants, conferences, references'],
          ['Used for', 'Most private-sector and government jobs', 'Academia, research, medicine, some grants and fellowships'],
        ],
      },
    },
    {
      heading: 'Which one to send in each country',
      paragraphs: [
        'Always follow the posting\'s wording first. When it is ambiguous, these conventions are a reliable default.',
      ],
      bullets: [
        'United States and Canada: resume for industry roles; CV only for academic, research or medical roles',
        'United Kingdom and Ireland: "CV" means a two-page tailored document, very similar to a US resume',
        'Germany and much of Europe: a "Lebenslauf" or CV, often in a tabular format; the Europass template is widely recognised',
        'India: "resume" and "CV" are used interchangeably; recruiters expect one to two pages for most roles',
        'Australia and New Zealand: "resume" and "CV" are interchangeable; two to three pages is common',
        'Middle East: a CV is standard and often includes nationality and visa status',
      ],
    },
    {
      heading: 'How to convert a CV into a resume',
      paragraphs: [
        'If you are moving from academia into industry, or applying to a US company with a long CV, you need to cut aggressively and reframe your work in terms of outcomes.',
      ],
      bullets: [
        'Lead with a three-line summary aimed at the target role',
        'Turn research into results: "built a model that improved accuracy by 12%" instead of a paper title',
        'Keep only the two or three most relevant publications, or link to a full list',
        'Move teaching and conferences into a single short section, or drop them',
        'Add a skills section with the tools named in the job description',
      ],
    },
    {
      heading: 'What both documents have in common',
      paragraphs: [
        'Whichever you send, recruiters and applicant tracking systems read it the same way. Clear section headings, a simple single-column layout, consistent dates and real keywords from the posting matter more than the label at the top of the page.',
      ],
    },
  ],
  faqs: [
    { q: 'Is a CV the same as a resume in the UK?', a: 'In practice, yes. UK employers say "CV" for a two-page document tailored to the role, which is what Americans call a resume.' },
    { q: 'How long should a CV be?', a: 'For industry jobs outside the US, two pages is the norm. Academic CVs have no fixed limit and grow with your publication and teaching record.' },
    { q: 'Should I include a photo on my CV?', a: 'Not in the US, UK, Canada or Australia, where photos can introduce bias. Some European and Middle Eastern employers still expect one, so follow local norms.' },
  ],
  tools: [
    { name: 'AI Resume Builder', badge: 'Free', description: 'Create a clean, ATS-friendly resume or CV in minutes and export it as a PDF.', href: '/resume-builder', ctaText: 'Build my resume' },
  ],
  related: [
    'how-to-create-an-ats-friendly-resume-2026',
    'how-long-should-a-resume-be',
    'best-countries-for-indian-it-professionals-to-work-abroad',
  ],
  references: [
    { title: 'Europass CV', url: 'https://europass.europa.eu/en', publisher: 'European Union', note: 'The official EU CV format, recognised by employers across Europe.' },
  ],
};

export default post;
