import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-network-for-a-job',
  tint: 'indigo',
  title: 'How to Network for a Job (Even If You Hate Networking): Scripts That Work',
  heading: 'How to network for a job, step by step',
  description:
    'Practical job networking for introverts and beginners: who to contact, LinkedIn and email outreach templates, how to ask for referrals and informational interviews, and how to follow up without being pushy.',
  keywords: [
    'how to network for a job',
    'networking tips',
    'how to ask for a referral',
    'informational interview',
    'linkedin outreach message',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 7,
  category: 'Career Growth',
  anchors: ['ask for a referral', 'informational interview'],
  excerpt:
    'Referred candidates are far more likely to get interviews than cold applicants. Networking is simply a series of short, specific, respectful conversations — here is how to start them.',
  keyTakeaways: [
    'Start with warm contacts: former colleagues, classmates, alumni and friends of friends.',
    'Ask for advice and information first; referrals follow naturally from good conversations.',
    'Keep outreach messages under 100 words with one clear, easy request.',
    'Follow up once after a week, and always thank people and share the outcome.',
  ],
  sections: [
    {
      heading: 'Why networking works',
      paragraphs: [
        'Recruiters trust referrals because someone inside the company vouches for the candidate. Many companies also pay employees a referral bonus, so a well-matched introduction helps both of you. Even without a referral, a conversation with someone on the team gives you information that makes your application and interview far stronger.',
      ],
    },
    {
      heading: 'Who to contact',
      paragraphs: [],
      bullets: [
        'Former managers and colleagues',
        'University alumni working at your target companies',
        'People who post or comment about topics in your field',
        'Members of professional communities, meetups and online groups',
        'Friends and family — ask who they know, not whether they have a job',
      ],
    },
    {
      heading: 'Outreach message templates',
      paragraphs: [],
      table: {
        caption: 'Short networking message templates',
        columns: ['Purpose', 'Message'],
        rows: [
          ['Informational chat', '"Hi [Name], I\'m a [role] exploring opportunities in [field]. I saw your work on [project/post] at [Company] and would value 15 minutes of your advice on how you got into the field. Would you be open to a quick call next week?"'],
          ['Alumni connection', '"Hi [Name], fellow [University] grad here. I\'m applying for [role] at [Company] and would love to hear how you find working there. Any chance of a 15-minute chat?"'],
          ['Referral request', '"Thanks again for the chat last week. I\'ve applied for [Job Title, link]. If you feel comfortable, would you be willing to refer me? I\'ve attached my resume and a two-line summary of why I fit."'],
          ['Follow-up', '"Hi [Name], just bumping this in case it got buried. Totally understand if you\'re busy!"'],
        ],
      },
    },
    {
      heading: 'Running a good informational interview',
      paragraphs: [
        'Arrive with four or five questions, keep to the time you asked for, and let them talk. Good questions include what a typical week involves, what skills matter most, what the team is working on, and what they wish they had known earlier. End by asking, "Is there anyone else you think I should speak to?"',
      ],
    },
    {
      heading: 'Networking for introverts',
      paragraphs: [
        'You do not need large events. One-to-one calls, written messages and small online communities suit many introverts better. Set a small weekly goal — for example, three new messages and one call — and track it like any other part of your job search.',
      ],
    },
  ],
  faqs: [
    { q: 'Is it rude to ask a stranger for a referral?', a: 'Asking immediately can feel transactional. Start with a short conversation or question, then ask for a referral once they know your background.' },
    { q: 'How many people should I contact?', a: 'A steady pace of 5–10 thoughtful messages a week is more effective than mass messaging.' },
    { q: 'What if nobody replies?', a: 'Response rates are often low. Personalise more, shorten your message, follow up once, and keep reaching out to new people.' },
  ],
  related: [
    'how-to-optimize-your-linkedin-profile',
    'how-to-find-a-job-fast',
    'how-to-find-remote-jobs-at-international-companies',
  ],
};

export default post;
