import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-resign-professionally',
  tint: 'slate',
  title: 'How to Resign From a Job Professionally (With Resignation Letter Template)',
  heading: 'How to resign from a job without burning bridges',
  description:
    'How to quit a job the right way: when to resign, how to tell your manager, a resignation letter template, notice periods, handling counter-offers and leaving on good terms.',
  keywords: [
    'how to resign from a job',
    'resignation letter template',
    'how to quit a job professionally',
    'notice period',
    'counter offer after resignation',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 6,
  category: 'Career Growth',
  anchors: ['resignation letter', 'resign professionally'],
  excerpt:
    'How you leave is remembered as much as how you worked. Resign only after you have a signed offer, tell your manager in person first, follow up in writing, and hand over properly.',
  keyTakeaways: [
    'Do not resign until you have a signed offer and any background checks are complete.',
    'Tell your manager in a private conversation before anyone else, then send a short written resignation.',
    'Check your contract for the notice period and any rules on leave, bonuses or restrictions.',
    'Think carefully before accepting a counter-offer; the reasons you wanted to leave often remain.',
  ],
  sections: [
    {
      heading: 'Before you resign',
      paragraphs: [],
      bullets: [
        'Have a signed written offer, with start date and conditions met',
        'Read your contract: notice period, unused leave, bonus clawbacks, non-compete or non-solicitation clauses',
        'Save personal files and contacts — never company data — from work devices',
        'Prepare a simple handover list of your current work',
      ],
    },
    {
      heading: 'How to tell your manager',
      paragraphs: [
        'Ask for a short private meeting (or video call if remote). Keep it brief, positive and firm. You do not owe a detailed explanation.',
      ],
      example: {
        title: 'What to say',
        paragraphs: [
          '"Thank you for meeting. I wanted to tell you first that I\'ve decided to resign. I\'ve accepted a role that\'s a good next step for me. I\'ve really valued working with you and the team, and I want to make the transition as smooth as possible. My last day would be [date], in line with my notice period."',
        ],
      },
    },
    {
      heading: 'Resignation letter template',
      paragraphs: [],
      example: {
        title: 'Template',
        paragraphs: [
          'Subject: Resignation — [Your name]',
          'Dear [Manager],',
          'Please accept this letter as formal notice of my resignation from my position as [Job Title] at [Company]. My last working day will be [date], in line with my [X]-week notice period.',
          'Thank you for the opportunities and support during my time here. I will do everything I can to hand over my responsibilities smoothly.',
          'Kind regards, [Your name]',
        ],
      },
    },
    {
      heading: 'Notice periods',
      paragraphs: [
        'Notice requirements vary widely. In the US, most employment is "at will" and two weeks is customary rather than legally required. In the UK, the statutory minimum depends on your contract and length of service. In India and many other countries, contracts often specify 30 to 90 days. Always follow your contract and local law.',
      ],
    },
    {
      heading: 'Counter-offers and your last weeks',
      paragraphs: [
        'If your employer counters with more money, ask yourself whether pay was the real reason you wanted to leave. Workload, growth, management or culture rarely change because of a raise.',
        'During your notice period, document your work, train whoever takes over, and say goodbye personally. Ask colleagues you worked closely with to connect on LinkedIn; your network is one of the most valuable things you take with you.',
      ],
    },
  ],
  faqs: [
    { q: 'Should I explain why I am leaving?', a: 'A short, positive reason is enough. Save detailed constructive feedback for an exit interview, and keep it professional.' },
    { q: 'Can I resign by email?', a: 'Tell your manager in conversation first when possible, then send the written resignation by email for the record.' },
    { q: 'Can I negotiate a shorter notice period?', a: 'Yes. Many employers agree to release you early if your handover is complete, sometimes in exchange for unused leave.' },
  ],
  related: [
    'how-to-evaluate-a-job-offer',
    'how-to-negotiate-salary',
    'how-to-change-careers',
  ],
  references: [
    { title: 'Handing in your notice', url: 'https://www.gov.uk/handing-in-your-notice', publisher: 'GOV.UK', note: 'Official UK guidance on notice periods and resigning.' },
  ],
};

export default post;
