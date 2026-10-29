import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'questions-to-ask-at-the-end-of-an-interview',
  tint: 'emerald',
  title: '30 Smart Questions to Ask at the End of an Interview',
  heading: 'Questions to ask at the end of an interview',
  description:
    'Smart questions to ask an interviewer about the role, team, success, culture and next steps — plus which questions to avoid and how many to prepare.',
  keywords: [
    'questions to ask at the end of an interview',
    'questions to ask the interviewer',
    'good questions to ask in an interview',
    'do you have any questions for us',
    'reverse interview questions',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 6,
  category: 'Interviews',
  anchors: ['questions to ask the interviewer', 'do you have any questions for us'],
  excerpt:
    '"Do you have any questions for us?" is not a formality. Good questions show genuine interest, help you decide if you want the job, and leave a strong final impression.',
  keyTakeaways: [
    'Always ask at least two questions; "No, I think you covered everything" signals low interest.',
    'Prepare five to eight and choose the ones that were not already answered.',
    'Match the question to the interviewer: managers on goals, peers on daily work, HR on process.',
    'Save salary and benefits questions for HR or a later stage unless the interviewer raises them.',
  ],
  sections: [
    {
      heading: 'Questions about the role',
      paragraphs: [],
      bullets: [
        'What does a typical week look like in this role?',
        'What would success look like in the first 90 days?',
        'What are the biggest challenges someone in this role will face?',
        'Why is this position open?',
        'How is performance measured?',
      ],
    },
    {
      heading: 'Questions about the team and manager',
      paragraphs: [],
      bullets: [
        'How is the team structured, and who would I work with most closely?',
        'How do you prefer to give feedback?',
        'How does the team decide priorities when there is too much to do?',
        'What do you enjoy most about working with this team?',
        'How do new team members usually ramp up?',
      ],
    },
    {
      heading: 'Questions about the company and growth',
      paragraphs: [],
      bullets: [
        'What are the company\'s main goals for the next year, and how does this team contribute?',
        'What does career progression look like for this role?',
        'What training or learning budget is available?',
        'How has the company changed in the last couple of years?',
        'What is something people outside the company often misunderstand about it?',
      ],
    },
    {
      heading: 'Questions to close strongly',
      paragraphs: ['Ending with a next-step question keeps the conversation moving and gives you a timeline.'],
      bullets: [
        'Is there anything in my background you would like me to clarify?',
        'What are the next steps in the process, and when can I expect to hear back?',
        'Is there anything else I can share that would help your decision?',
      ],
    },
    {
      heading: 'Questions to avoid',
      paragraphs: ['These can undermine an otherwise good interview.'],
      table: {
        caption: 'Questions to avoid and better alternatives',
        columns: ['Avoid', 'Ask instead'],
        rows: [
          ['"What does your company do?"', '"How do you see the product evolving over the next year?"'],
          ['"How much leave do I get?" (first round)', '"How does the team support work-life balance?" — or ask HR later'],
          ['"How soon can I be promoted?"', '"What does career progression look like for this role?"'],
          ['"Did I get the job?"', '"What are the next steps and timeline?"'],
        ],
      },
    },
  ],
  faqs: [
    { q: 'How many questions should I ask?', a: 'Two or three is ideal for a 30–45 minute interview. Prepare more in case some are answered during the conversation.' },
    { q: 'Can I ask about salary?', a: 'If the recruiter or HR has not raised it, ask them rather than the hiring manager, ideally after the first round.' },
    { q: 'Should I write my questions down?', a: 'Yes. Bringing a short written list shows preparation, and taking a note of the answers is perfectly acceptable.' },
  ],
  related: [
    'thank-you-email-after-an-interview',
    'why-do-you-want-to-work-here-answer',
    'video-interview-tips',
  ],
};

export default post;
