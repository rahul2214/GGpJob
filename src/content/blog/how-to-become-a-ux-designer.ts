import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-become-a-ux-designer',
  tint: 'rose',
  title: 'How to Become a UX Designer: Skills, Portfolio and First Job Roadmap',
  heading: 'How to become a UX designer',
  description:
    'A roadmap to becoming a UX designer: user research, information architecture, wireframing, prototyping in Figma, accessibility and building a case-study portfolio that gets interviews.',
  keywords: [
    'how to become a ux designer',
    'ux designer roadmap',
    'ux design portfolio',
    'ux designer skills',
    'ui ux design career',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Career Roadmaps',
  anchors: ['become a UX designer', 'UX design portfolio'],
  excerpt:
    'UX design is about solving real problems for real people. Employers hire designers who can show their process — research, decisions, iterations and results — in clear portfolio case studies.',
  keyTakeaways: [
    'Learn the full process: research, define, ideate, prototype, test and iterate.',
    'Master Figma for wireframes, prototypes and design systems.',
    'Learn accessibility basics; inclusive design is a hiring differentiator.',
    'Build two or three in-depth case studies that explain your reasoning, not just final screens.',
  ],
  sections: [
    {
      heading: 'UX vs UI',
      paragraphs: [
        'UX (user experience) design focuses on how a product works for users: their goals, the flow, the structure and whether it solves the problem. UI (user interface) design focuses on the visual layer: typography, colour, layout and components. Many job titles combine both, especially at smaller companies.',
      ],
    },
    {
      heading: 'Core skills',
      paragraphs: [],
      table: {
        caption: 'Core UX skills and how to practise them',
        columns: ['Skill', 'How to practise'],
        rows: [
          ['User research', 'Interview five people about a problem; synthesise findings into insights'],
          ['Information architecture', 'Card sorting and site maps for an existing website'],
          ['Wireframing', 'Sketch and then build low-fidelity flows in Figma'],
          ['Prototyping', 'Create clickable prototypes and run usability tests'],
          ['Visual and UI basics', 'Typography, spacing, colour and grid systems'],
          ['Accessibility', 'Check contrast, keyboard use and screen-reader labels against WCAG'],
          ['Communication', 'Present your decisions and handle feedback from stakeholders'],
        ],
      },
    },
    {
      heading: 'Building a portfolio that gets interviews',
      paragraphs: [
        'Hiring managers spend only a few minutes on a portfolio, so structure each case study for skimming: the problem, your role, the process, key decisions with evidence, the final design and the outcome.',
      ],
      bullets: [
        'Redesign a real product flow with a clear, research-backed problem',
        'Design a new feature for an app you use and test it with real users',
        'Volunteer for a non-profit or small business and document real results',
        'Show messy work — sketches and discarded options — to prove your process',
      ],
    },
    {
      heading: 'Getting your first UX role',
      paragraphs: [
        'Look for junior UX designer, product designer, UI/UX designer, UX researcher and design intern roles. Career switchers from graphic design, marketing, psychology, customer support and development often bring valuable perspective; frame that background as an advantage.',
      ],
    },
  ],
  faqs: [
    { q: 'Do UX designers need to code?', a: 'It is not required, but understanding HTML, CSS and how developers build interfaces makes collaboration much easier.' },
    { q: 'Is a UX certificate enough to get hired?', a: 'Certificates help with structure, but the portfolio decides. Focus on real case studies with evidence.' },
  ],
  related: [
    'how-to-change-careers',
    'frontend-developer-roadmap',
    'how-to-optimize-your-linkedin-profile',
  ],
  references: [
    { title: 'Web Content Accessibility Guidelines (WCAG) Overview', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/', publisher: 'W3C', note: 'The international standard for accessible digital design.' },
    { title: 'Web Developers and Digital Designers', url: 'https://www.bls.gov/ooh/computer-and-information-technology/web-developers.htm', publisher: 'U.S. Bureau of Labor Statistics', note: 'Pay and outlook for digital designers.' },
  ],
};

export default post;
