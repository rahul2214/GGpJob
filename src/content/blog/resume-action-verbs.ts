import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'resume-action-verbs',
  tint: 'amber',
  title: '150+ Resume Action Verbs to Replace "Responsible For" (By Skill)',
  heading: 'Resume action verbs that make your achievements stand out',
  description:
    'A categorised list of strong resume action verbs for leadership, technical, analytical, creative and customer-facing work, plus a formula for turning weak duty statements into achievement bullets.',
  keywords: [
    'resume action verbs',
    'power words for resume',
    'strong verbs for resume',
    'alternatives to responsible for',
    'resume bullet points examples',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 6,
  category: 'Resumes & ATS',
  anchors: ['resume action verbs', 'strong action verbs'],
  excerpt:
    '"Responsible for" tells a recruiter what you were supposed to do, not what you achieved. Starting each bullet with a precise action verb — and ending it with a result — is the fastest way to upgrade a resume.',
  keyTakeaways: [
    'Start every resume bullet with a past-tense action verb (present tense only for your current role).',
    'Pick the verb that describes your actual level of ownership: "led" and "supported" mean different things.',
    'Use the formula: action verb + what you did + measurable result.',
    'Avoid repeating the same verb more than twice on a page.',
  ],
  sections: [
    {
      heading: 'Why action verbs matter',
      paragraphs: [
        'Recruiters skim bullets in seconds, and the first word sets the impression. "Responsible for social media" sounds passive; "Grew Instagram following from 2,000 to 18,000 in eight months" shows ownership and impact.',
        'Precise verbs also help with keyword matching. Job descriptions use words like "managed", "developed", "analysed" and "negotiated", and mirroring that language makes the fit obvious.',
      ],
    },
    {
      heading: 'Action verbs by category',
      paragraphs: ['Choose verbs that match the real scope of your work. Overstating ownership is easy to expose in an interview.'],
      table: {
        caption: 'Resume action verbs grouped by type of work',
        columns: ['Category', 'Action verbs'],
        rows: [
          ['Leadership', 'Led, directed, managed, mentored, coached, delegated, supervised, spearheaded, mobilised, championed'],
          ['Achievement and growth', 'Increased, grew, boosted, expanded, accelerated, exceeded, doubled, maximised, delivered, won'],
          ['Efficiency', 'Reduced, streamlined, automated, consolidated, simplified, cut, eliminated, optimised, standardised'],
          ['Technical', 'Built, developed, engineered, designed, deployed, migrated, integrated, debugged, refactored, architected'],
          ['Analytical', 'Analysed, measured, forecast, modelled, evaluated, identified, audited, quantified, researched, tested'],
          ['Communication', 'Presented, negotiated, persuaded, wrote, authored, briefed, facilitated, trained, published, pitched'],
          ['Creative', 'Designed, created, conceptualised, illustrated, produced, launched, reimagined, prototyped, branded'],
          ['Customer-facing', 'Resolved, retained, onboarded, supported, advised, assisted, converted, renewed, upsold'],
          ['Organisation', 'Coordinated, scheduled, planned, organised, prioritised, tracked, maintained, implemented'],
        ],
      },
    },
    {
      heading: 'The achievement formula',
      paragraphs: [
        'An action verb on its own is not enough. The strongest bullets follow a simple pattern: action verb, what you did, and the result — ideally with a number.',
      ],
      example: {
        title: 'Before and after',
        paragraphs: [
          'Weak: "Responsible for handling customer complaints."',
          'Strong: "Resolved an average of 45 customer tickets a day and raised satisfaction scores from 82% to 94% by introducing response templates."',
          'Weak: "Worked on the company website."',
          'Strong: "Rebuilt the marketing site in Next.js, cutting page load time by 60% and increasing demo sign-ups by 22%."',
        ],
      },
    },
    {
      heading: 'Verbs and phrases to avoid',
      paragraphs: ['Some words add length without adding meaning. Replace them wherever you find them.'],
      bullets: [
        '"Responsible for", "duties included", "tasked with" — replace with what you actually did',
        '"Helped" and "assisted" when you did the work yourself — use "built", "ran" or "delivered"',
        '"Worked on" — say whether you designed, built, tested or managed it',
        '"Utilised" — "used" is clearer, or name the outcome instead',
      ],
    },
  ],
  practicalSteps: [
    { step: 1, title: 'Find weak openers', description: 'Search your resume for "responsible", "helped", "worked" and "duties".' },
    { step: 2, title: 'Choose an accurate verb', description: 'Pick one from the table that matches your real level of ownership.' },
    { step: 3, title: 'Add the result', description: 'Ask "so what?" and add the outcome: time saved, revenue, quality, users, cost.' },
    { step: 4, title: 'Vary the verbs', description: 'Make sure no verb appears more than twice on the page.' },
  ],
  faqs: [
    { q: 'Should resume verbs be past or present tense?', a: 'Use present tense for your current job and past tense for previous roles and completed projects.' },
    { q: 'What can I write instead of "responsible for"?', a: 'Use a specific verb such as managed, led, built, ran, owned or delivered, followed by the result you produced.' },
    { q: 'Do I need numbers in every bullet?', a: 'Aim for numbers in at least half of your bullets. Where you cannot measure, describe scale or scope, such as team size or number of clients.' },
  ],
  tools: [
    { name: 'AI Resume Builder', badge: 'Free', description: 'Rewrite weak bullet points into achievement statements with AI suggestions.', href: '/resume-builder', ctaText: 'Improve my bullets' },
  ],
  related: [
    'skills-to-put-on-a-resume',
    'how-to-write-a-professional-resume-summary',
    'why-is-your-resume-getting-rejected-12-mistakes',
  ],
  references: [
    { title: 'Occupational Outlook Handbook', url: 'https://www.bls.gov/ooh/', publisher: 'U.S. Bureau of Labor Statistics', note: 'Describes what workers in each occupation actually do — useful for choosing accurate verbs.' },
  ],
};

export default post;
