import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-long-should-a-resume-be',
  tint: 'slate',
  title: 'How Long Should a Resume Be in 2026? One Page vs Two Pages Explained',
  heading: 'How long should a resume be?',
  description:
    'The right resume length by experience level: when one page is best, when two pages is expected, how far back to go, and what to cut when your resume runs long.',
  keywords: [
    'how long should a resume be',
    'one page resume vs two page resume',
    'resume length',
    'how many pages should a resume be',
    'how far back should a resume go',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 5,
  category: 'Resumes & ATS',
  anchors: ['how long should a resume be', 'one-page resume'],
  excerpt:
    'One page for students and early-career candidates, two pages for most experienced professionals, and longer only for academic CVs and some senior or government roles. Here is how to decide and what to cut.',
  keyTakeaways: [
    'Under about 5 years of experience: keep your resume to one page.',
    'With 5–15 years of relevant experience: two pages is normal and accepted.',
    'Cover roughly the last 10–15 years in detail; summarise or drop older roles.',
    'Length should come from relevant achievements, never from padding or small fonts.',
  ],
  sections: [
    {
      heading: 'Recommended length by career stage',
      paragraphs: [
        'There is no universal rule, but recruiter expectations are consistent enough to give clear defaults.',
      ],
      table: {
        caption: 'Recommended resume length by experience level',
        columns: ['Career stage', 'Recommended length', 'Notes'],
        rows: [
          ['Student or fresher', '1 page', 'Lead with education, projects, internships and skills'],
          ['1–5 years', '1 page', 'Two pages only with unusually relevant breadth'],
          ['5–15 years', '2 pages', 'Most detail on the last two or three roles'],
          ['15+ years or executive', '2 pages, occasionally 3', 'Summarise early career in a short list'],
          ['Academic, research, medical', 'Full CV, no fixed limit', 'Publications and grants are expected'],
          ['US federal government jobs', 'Check the posting', 'Federal resumes are often longer and more detailed'],
        ],
      },
    },
    {
      heading: 'Why shorter usually wins',
      paragraphs: [
        'Recruiters screen many resumes for each role and decide quickly whether to read further. A tight one-page resume puts your strongest evidence where it will be seen. A second page is only worth it if it is as strong as the first.',
        'Length does not hurt you with applicant tracking systems, which read the whole document. The limit is human attention, not software.',
      ],
    },
    {
      heading: 'How far back should your resume go?',
      paragraphs: [
        'For most people, the last 10 to 15 years is enough. Older roles can go into a brief "Earlier experience" line with job title and company only, or be removed if unrelated to your target.',
        'Graduation dates are optional once you have several years of experience; leaving them out is a common way to reduce age bias.',
      ],
    },
    {
      heading: 'What to cut when your resume is too long',
      paragraphs: ['Work through this list in order before shrinking fonts or margins.'],
      bullets: [
        'Remove the objective statement and the "References available on request" line',
        'Cut bullets that describe duties rather than results',
        'Keep three to five bullets for recent roles and one or two for older ones',
        'Delete skills everyone has (email, Microsoft Word) unless the posting asks for them',
        'Merge short or similar roles at the same company',
        'Shorten the summary to three lines',
      ],
    },
    {
      heading: 'Formatting a two-page resume',
      paragraphs: [
        'If you go to two pages, fill at least half of the second page, repeat your name and page number in the header, and make sure the most important information is on page one. Keep a 10.5–12 pt body font and margins of at least 0.5 inches.',
      ],
    },
  ],
  faqs: [
    { q: 'Is a two-page resume bad?', a: 'No. For candidates with five or more years of relevant experience, two pages is standard. It only hurts when the second page is filler.' },
    { q: 'Can a fresher have a two-page resume?', a: 'It is rarely a good idea. Recruiters expect one page from freshers; focus on your best projects and internships.' },
    { q: 'Does resume length affect ATS?', a: 'No. ATS software reads every page. Length matters to the human reviewer who reads it next.' },
  ],
  tools: [
    { name: 'AI Resume Builder', badge: 'Free', description: 'Templates that keep your resume to the right length automatically.', href: '/resume-builder', ctaText: 'Start building' },
  ],
  related: [
    'resume-vs-cv-difference',
    'best-resume-format-for-freshers-with-no-experience',
    'how-to-create-an-ats-friendly-resume-2026',
  ],
};

export default post;
