import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'thank-you-email-after-an-interview',
  tint: 'emerald',
  title: 'Thank You Email After an Interview: Templates and Follow-Up Timing',
  heading: 'How to write a thank-you email after an interview',
  description:
    'Copy-ready thank-you email templates for after an interview, plus when to send it, how to follow up if you hear nothing, and how to reply to a rejection professionally.',
  keywords: [
    'thank you email after interview',
    'follow up email after interview',
    'interview thank you note template',
    'how long to wait to follow up after interview',
    'post interview email',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 5,
  category: 'Interviews',
  anchors: ['thank-you email', 'follow up after an interview'],
  excerpt:
    'A short, specific thank-you email within 24 hours reinforces your interest and keeps you top of mind. Here are templates for thank-you notes, follow-ups and graceful replies to rejections.',
  keyTakeaways: [
    'Send a thank-you email within 24 hours to each person who interviewed you.',
    'Keep it to four or five sentences and mention one specific thing you discussed.',
    'If you have not heard back by the date they gave, follow up once after two to three working days.',
    'Reply to rejections politely; it keeps the door open for future roles.',
  ],
  sections: [
    {
      heading: 'Thank-you email template',
      paragraphs: ['Personalise the middle sentence for each interviewer.'],
      example: {
        title: 'Template',
        paragraphs: [
          'Subject: Thank you — [Job Title] interview',
          'Hi [Name],',
          'Thank you for taking the time to speak with me today about the [Job Title] role. I especially enjoyed hearing about [specific topic you discussed], and it made me even more excited about the opportunity to [contribution].',
          'Please let me know if I can share anything else. I look forward to hearing about next steps.',
          'Best regards, [Your name] · [Phone] · [LinkedIn]',
        ],
      },
    },
    {
      heading: 'Follow-up email if you have not heard back',
      paragraphs: [
        'Wait until the date the interviewer gave you has passed, plus two or three working days. If no timeline was given, wait about a week.',
      ],
      example: {
        title: 'Follow-up template',
        paragraphs: [
          'Subject: Following up — [Job Title] interview',
          'Hi [Name], I hope you are well. I wanted to follow up on my interview on [date] for the [Job Title] role. I remain very interested and would be glad to provide anything else you need. Is there an update on the timeline? Thank you, [Your name]',
        ],
      },
    },
    {
      heading: 'Replying to a rejection',
      paragraphs: [
        'A gracious reply costs nothing and is remembered. Recruiters often return to strong runners-up when a new role opens or the chosen candidate declines.',
      ],
      example: {
        title: 'Rejection reply template',
        paragraphs: [
          'Hi [Name], thank you for letting me know, and for the time you and the team spent with me. I enjoyed learning about [team/company] and would welcome being considered for future roles. If you are able to share any feedback, I would really appreciate it. Best wishes, [Your name]',
        ],
      },
    },
    {
      heading: 'Timing at a glance',
      paragraphs: [],
      table: {
        caption: 'When to send each post-interview email',
        columns: ['Email', 'When to send'],
        rows: [
          ['Thank you', 'Within 24 hours of the interview'],
          ['First follow-up', '2–3 working days after the promised decision date, or ~1 week if none'],
          ['Second follow-up', 'About a week after the first, then stop'],
          ['Rejection reply', 'Within a day or two of the rejection'],
        ],
      },
    },
  ],
  faqs: [
    { q: 'Should I send a thank-you email after a phone screen?', a: 'Yes, a brief note to the recruiter is a good habit, though it can be even shorter than after a full interview.' },
    { q: 'Email or handwritten note?', a: 'Email is standard and arrives in time to influence the decision. A handwritten note can be a nice extra in some industries but should not replace the email.' },
    { q: 'Can a thank-you email hurt my chances?', a: 'Only if it contains errors, is overly long, or is sent repeatedly. A short, accurate, polite note never hurts.' },
  ],
  related: [
    'questions-to-ask-at-the-end-of-an-interview',
    'how-to-evaluate-a-job-offer',
    'how-to-write-a-cover-letter',
  ],
};

export default post;
