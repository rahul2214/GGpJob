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
  anchors: ['job search dashboard', 'what to do next'],
  excerpt:
    'A job seeker opens a dashboard to find out what to do today. Almost every dashboard answers a different question.',
  keyTakeaways: [
    'Counts are read once; actions are read every day.',
    'Use AI to compress the reading load rather than to add to it.',
    'Accurate and demoralising numbers belong available, not prominent.',
    'Distinguish confirmed status from inferred, and let one action correct it.',
    'Interrupt for deadlines and interviews; batch everything else.',
  ],
  sections: [
    {
      heading: 'Lead with the action, not the inventory',
      paragraphs: [
        'The default design shows counts: applications sent, in review, rejected. A user reads those once and never again, because they do not tell them what to do.',
        'Open with two or three specific actions: this application needs a follow-up today, this interview is on Thursday, this posting closes tomorrow. Everything else is available when asked for.',
        'Cap the list deliberately. Twelve things needing attention produces a scroll and a decision to deal with it later; three produces three decisions, and if the queue is routinely longer than that the problem is upstream volume rather than the layout.',
      ],
    },
    {
      heading: 'Use AI to compress, not to add',
      paragraphs: [
        'The wrong use is generating more content — insights, tips, encouragement — which adds to the reading load the user is trying to reduce.',
        'The right use is compression: summarising twenty inbound emails into three things that changed, condensing an application history into one line before an interview, turning a long posting into the four requirements that matter for this candidate.',
        'Compression only earns trust if the original is one click away. A summary the user cannot check is a summary they will eventually stop believing, and the link back costs nothing.',
      ],
      bullets: [
        'Summarise inbound mail into what changed',
        'Condense a company history before a conversation',
        'Reduce a posting to the requirements relevant to this person',
        'Never generate commentary nobody asked for',
      ],
      table: {
        caption: 'What belongs where',
        columns: ['Content', 'Placement', 'Why'],
        rows: [
          ['Actions due today', 'First, always', 'The reason they opened it'],
          ['Upcoming interviews', 'First', 'Time-sensitive and consequential'],
          ['What changed since yesterday', 'Second', 'Compressed, not a feed'],
          ['Active applications', 'One click away', 'Reference, not a daily read'],
          ['Response rates', 'Available, not prominent', 'Accurate and demoralising'],
          ['Generated encouragement', 'Nowhere', 'Adds reading, adds nothing'],
        ],
      },
    },
    {
      heading: 'The one screen worth building carefully',
      paragraphs: [
        'The interview view is where a dashboard justifies itself. Everything relevant to one conversation — the posting, the exact CV that was sent, the free-text answers written at the time, who was spoken to before and what was said — assembled on one page.',
        'None of that is reconstructable from memory eleven weeks later, and a candidate assembling it by hand the morning of an interview is spending their preparation time on archaeology.',
        'It also has to show the version that was sent rather than the current one. A regenerated document is a different document, and the whole point is reading what the interviewer is holding.',
      ],
    },
    {
      heading: 'Be careful with the numbers you show',
      paragraphs: [
        'Rejection counts, response rates and time-since-last-interview are all accurate and all demoralising during a difficult search. Displaying them prominently makes the product something people avoid opening.',
        'Show what is actionable and keep the rest available rather than prominent. There is a real difference between a tool that helps and a tool that reminds someone daily how the search is going.',
        'Never rank a user against other users. A percentile puts someone having a hard search at the bottom of a list, which is accurate, useless, and the fastest way to make them close the product for good.',
      ],
    },
    {
      heading: 'Make status honest, including uncertainty',
      paragraphs: [
        'Statuses inferred from email classification are sometimes wrong, and a dashboard that presents an inference as fact will eventually tell someone they were rejected when they were not.',
        'Distinguish confirmed from inferred in the interface, and let the user correct it in one action. Their correction is better data than the classifier produced, and asking for it costs nothing.',
        'Include the honest terminal states rather than an idealised funnel. Most applications end in silence, so a dashboard showing forty active when thirty-five are dead is presenting fiction — and "no response after the usual window" is a state the user can act on where "in review" is not.',
      ],
    },
    {
      heading: 'Notify rarely, and only for time-sensitive things',
      paragraphs: [
        'Every classified email is not a notification. Recreating the inbox the user was trying to escape is the most common way these products become an additional burden.',
        'Interrupt for deadlines and interviews. Batch everything else into a single daily summary, and let the user tune it down further without losing the interruptions that matter.',
        'Rejections in particular belong in the digest. A push notification delivering news that requires no action is a needlessly unpleasant way to receive it, and it is the single easiest thing to get wrong in a product used by people already having a difficult few months.',
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
      a: 'To compress, not to add. Summarise inbound mail, condense history before an interview, reduce a posting to its relevant requirements — with the original always one click away.',
    },
    {
      q: 'Should rejection statistics be displayed?',
      a: 'Available, not prominent, and never as a ranking against other users. A tool that reminds someone daily how it is going is one they stop opening.',
    },
    {
      q: 'How should inferred application statuses be shown?',
      a: 'Distinguished from confirmed ones, with one-action correction. Presenting a classifier inference as fact will eventually tell someone they were rejected when they were not.',
    },
    {
      q: 'Which single screen matters most?',
      a: 'The interview view: the posting, the exact CV sent, the answers written at the time and who was spoken to before, all on one page.',
    },
    {
      q: 'Should the funnel show only the optimistic states?',
      a: 'No. Most applications end in silence, and a dashboard showing forty active when thirty-five are dead is presenting fiction the user cannot act on.',
    },
  ],
  related: ['how-to-build-a-job-search-crm-with-ai', 'how-to-build-an-ai-job-application-analytics-dashboard', 'how-to-build-an-ai-application-tracking-system'],
};

export default post;
