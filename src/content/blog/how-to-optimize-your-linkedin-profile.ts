import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-optimize-your-linkedin-profile',
  tint: 'sky',
  title: 'How to Optimize Your LinkedIn Profile to Get Found by Recruiters (2026)',
  heading: 'How to optimize your LinkedIn profile for recruiters',
  description:
    'A section-by-section LinkedIn profile checklist: headline formulas, About section examples, skills, featured work and settings that help recruiters find you in search.',
  keywords: [
    'linkedin profile tips',
    'how to optimize linkedin profile',
    'linkedin headline examples',
    'linkedin about section examples',
    'get noticed by recruiters on linkedin',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 7,
  category: 'Resumes & ATS',
  anchors: ['LinkedIn profile', 'LinkedIn headline'],
  excerpt:
    'Recruiters search LinkedIn with keywords, job titles and locations. A profile written with those searches in mind — clear headline, specific About section, the right skills — shows up more often and converts better.',
  keyTakeaways: [
    'Your headline is the most important search field: include your target job title and two or three core skills.',
    'Write the About section in the first person, lead with what you do and who for, and end with a call to action.',
    'Add the skills recruiters search for, and pin the three most relevant to your target role.',
    'Turn on "Open to work" for recruiters only if you do not want your current employer to see a public banner.',
  ],
  sections: [
    {
      heading: 'How recruiters search LinkedIn',
      paragraphs: [
        'Recruiters typically filter by job title, skills, location and years of experience, then scan the results by photo, headline and current role. If your headline says "Seeking opportunities", you will not match a search for "Data Analyst SQL Power BI".',
      ],
    },
    {
      heading: 'Profile checklist, section by section',
      paragraphs: ['Work through these in order; the first four have the biggest effect on search visibility.'],
      table: {
        caption: 'LinkedIn profile sections and how to optimise each',
        columns: ['Section', 'What to do'],
        rows: [
          ['Headline', 'Target title + core skills + proof: "Backend Engineer | Java, Spring Boot, AWS | Built payments APIs for 2M users"'],
          ['Photo and banner', 'Clear, well-lit headshot; a simple banner that reflects your field'],
          ['About', '3–5 short paragraphs: what you do, key results, skills, what you are looking for, how to contact you'],
          ['Experience', 'Mirror your resume: 3–5 achievement bullets per role with numbers'],
          ['Skills', 'Add up to the platform maximum; pin your top three for your target job'],
          ['Featured', 'Pin a portfolio, case study, GitHub repository or article'],
          ['Custom URL', 'Change it to linkedin.com/in/firstname-lastname'],
          ['Location', 'Set the city where you want to work, which drives location filters'],
        ],
      },
    },
    {
      heading: 'Headline formulas that work',
      paragraphs: ['Pick the pattern that suits your stage, and keep the most important words at the start.'],
      bullets: [
        'Role + skills: "Product Designer | UX Research, Figma, Design Systems"',
        'Role + result: "Account Executive | 140% of quota in 2025 | B2B SaaS"',
        'Student or fresher: "Computer Science Graduate | React, Node.js | Open to Software Engineering Roles"',
        'Career switcher: "Data Analyst (SQL, Python) | Former Operations Manager | Retail Analytics"',
      ],
    },
    {
      heading: 'An About section example',
      paragraphs: ['Write like a person, not a brochure. Short paragraphs read well on mobile.'],
      example: {
        title: 'Example About section for a marketing specialist',
        paragraphs: [
          'I help B2B software companies turn organic search into pipeline. Over the last four years I have grown organic sign-ups from 300 to 2,100 a month for two SaaS products.',
          'My toolkit: technical SEO, content strategy, Google Analytics 4, HubSpot and a lot of spreadsheets.',
          'I am currently looking for a senior SEO or content marketing role with a remote-first team. The best way to reach me is a LinkedIn message or the email in my contact info.',
        ],
      },
    },
    {
      heading: 'Activity that helps you get found',
      paragraphs: [
        'You do not need to post daily. Commenting thoughtfully on posts in your field a few times a week, sharing a short write-up of a project, and asking for two or three recommendations from former managers all make your profile look active and credible.',
      ],
    },
  ],
  commonMistakes: [
    { mistake: 'A vague headline like "Looking for new opportunities"', fix: 'Use the job title you want plus your core skills.' },
    { mistake: 'Copying the resume word for word into About', fix: 'Write a short first-person story with results and what you want next.' },
    { mistake: 'Leaving location blank or out of date', fix: 'Set the city where you want to work so location filters include you.' },
  ],
  faqs: [
    { q: 'Should I use the Open to Work banner?', a: 'It can help for entry-level roles and active searches. If you are employed, use the "recruiters only" setting so the banner is not public.' },
    { q: 'How many skills should I add on LinkedIn?', a: 'Add all genuinely relevant skills up to the platform limit, then pin the three that best match your target role.' },
    { q: 'Does LinkedIn premium help you get hired?', a: 'It can show who viewed your profile and offer extra insights, but a strong headline and About section matter far more than a paid plan.' },
  ],
  tools: [
    { name: 'Job Search', description: 'Browse verified jobs and apply with the same profile details.', href: '/jobs', ctaText: 'Find jobs' },
  ],
  related: [
    'how-to-network-for-a-job',
    'how-to-build-a-github-portfolio-that-recruiters-notice',
    'skills-to-put-on-a-resume',
  ],
};

export default post;
