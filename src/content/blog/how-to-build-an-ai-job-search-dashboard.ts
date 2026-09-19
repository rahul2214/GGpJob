import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-search-dashboard',
  tint: 'violet',
  title: 'How to Build an AI Job Search Dashboard',
  heading: 'A dashboard that answers one question',
  description:
    'Designing a job search dashboard around what to do next rather than what has happened, with AI summarising instead of adding another feed to read.',
  keywords: [
    'job search dashboard',
    'dashboard design ai',
    'next action ui',
    'ai summarisation dashboard',
    'job search ux',
    'notification design',
    'application overview',
    'candidate dashboard',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'A job seeker opens a dashboard to find out what to do today. Almost every dashboard answers a different question.',
  sections: [
    {
      heading: 'Lead with the action, not the inventory',
      paragraphs: [
        'The default design shows counts: applications sent, in review, rejected. A user reads those once and never again, because they do not tell them what to do.',
        'Open with two or three specific actions: this application needs a follow-up today, this interview is on Thursday, this posting closes tomorrow. Everything else is available when asked for.',
      ],
    },
    {
      heading: 'Use AI to compress, not to add',
      paragraphs: [
        'The wrong use is generating more content — insights, tips, encouragement — which adds to the reading load the user is trying to reduce.',
        'The right use is compression: summarising twenty inbound emails into three things that changed, condensing an application history into one line before an interview, turning a long posting into the four requirements that matter for this candidate.',
      ],
      bullets: [
        'Summarise inbound mail into what changed',
        'Condense a company history before a conversation',
        'Reduce a posting to the requirements relevant to this person',
        'Never generate commentary nobody asked for',
      ],
    },
    {
      heading: 'Be careful with the numbers you show',
      paragraphs: [
        'Rejection counts, response rates and time-since-last-interview are all accurate and all demoralising during a difficult search. Displaying them prominently makes the product something people avoid opening.',
        'Show what is actionable and keep the rest available rather than prominent. There is a real difference between a tool that helps and a tool that reminds someone daily how the search is going.',
      ],
    },
    {
      heading: 'Make status honest, including uncertainty',
      paragraphs: [
        'Statuses inferred from email classification are sometimes wrong, and a dashboard that presents an inference as fact will eventually tell someone they were rejected when they were not.',
        'Distinguish confirmed from inferred in the interface, and let the user correct it in one action. Their correction is better data than the classifier produced, and asking for it costs nothing.',
      ],
    },
    {
      heading: 'Notify rarely, and only for time-sensitive things',
      paragraphs: [
        'Every classified email is not a notification. Recreating the inbox the user was trying to escape is the most common way these products become an additional burden.',
        'Interrupt for deadlines and interviews. Batch everything else into a single daily summary, and let the user tune it down further without losing the interruptions that matter.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What should a job search dashboard show first?',
      a: 'Two or three specific actions for today — a follow-up due, an interview Thursday, a posting closing tomorrow. Counts are read once and never again.',
    },
    {
      q: 'How should AI be used in the dashboard?',
      a: 'To compress, not to add. Summarise inbound mail, condense history before an interview, reduce a posting to its relevant requirements — never generate unrequested commentary.',
    },
    {
      q: 'Should rejection statistics be displayed?',
      a: 'Available, not prominent. They are accurate and demoralising during a hard search, and a tool that reminds someone daily how it is going is one they stop opening.',
    },
    {
      q: 'How should inferred application statuses be shown?',
      a: 'Distinguished from confirmed ones, with one-action correction. Presenting a classifier inference as fact will eventually tell someone they were rejected when they were not.',
    },
  ],
  related: ['how-to-build-a-job-search-crm-with-ai', 'how-to-build-an-ai-job-application-analytics-dashboard', 'how-to-build-an-ai-application-tracking-system'],
};

export default post;
