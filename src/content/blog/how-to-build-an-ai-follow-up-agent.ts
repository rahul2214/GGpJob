import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-follow-up-agent',
  tint: 'amber',
  title: 'How to Build an AI Follow-Up Agent for Job Applications',
  heading: 'Following up without becoming a nuisance',
  description:
    'Deciding when a follow-up is warranted, how many is too many, what it should say, and the state tracking that keeps the agent from embarrassing its user.',
  keywords: [
    'follow up agent',
    'job application follow up',
    'follow up timing',
    'application status tracking',
    'automated reminders',
    'follow up message content',
    'candidate communication',
    'outreach cadence',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'One well-timed follow-up helps. The second rarely does, and the third actively costs the candidate something.',
  sections: [
    {
      heading: 'Establish whether a follow-up is warranted at all',
      paragraphs: [
        'Not every application deserves one. An automated acknowledgement with a stated timeline means the timeline is the answer. An explicit rejection means the conversation is over. A posting that said no follow-ups meant it.',
        'The agent’s first job is to decide whether to act, and that decision needs the application’s actual state — which means the tracking has to be right before the messaging is built.',
      ],
      bullets: [
        'Applied with no response and past the stated timeline — follow up',
        'Interviewed with no response — follow up, sooner',
        'Explicitly rejected — never',
        'Told a decision date that has not arrived — wait',
      ],
    },
    {
      heading: 'Timing matters more than wording',
      paragraphs: [
        'Too early reads as impatient and arrives while the process is still running. Too late and the role is filled. The right moment is after any stated timeline has passed, or after a reasonable interval when none was given.',
        'Post-interview is the exception worth treating differently: a prompt, brief note after a conversation is normal professional behaviour and is received well, where the same message three weeks later is not.',
      ],
    },
    {
      heading: 'One, and then stop',
      paragraphs: [
        'A second follow-up rarely produces a response that the first did not. A third is noticed, and remembered, in a way the candidate would not choose.',
        'Cap it at one in code. An agent optimising for responses will always find a reason to send another, and the constraint has to sit outside its reasoning.',
      ],
    },
    {
      heading: 'Say something, do not just check in',
      paragraphs: [
        'A message whose entire content is "following up on my application" gives the recipient nothing to respond to and adds no information. It is a request for attention with no offer attached.',
        'A good follow-up adds something small and real: a relevant thing shipped since applying, a brief answer to a question that came up, a specific point of continued interest. Then the recipient has a reason to reply rather than a reason to feel guilty.',
      ],
    },
    {
      heading: 'Track state carefully, because the failure is public',
      paragraphs: [
        'The agent must never follow up on an application that was rejected, already answered, or already followed up. Each of those makes the candidate look inattentive to the person deciding about them.',
        'That means reconciling state from replies, not just from what the agent sent. An unread rejection sitting in an inbox is exactly the situation that produces the worst-timed follow-up possible, and only inbound processing prevents it.',
      ],
    },
  ],
  faqs: [
    {
      q: 'When should an agent follow up on an application?',
      a: 'After a stated timeline passes, or a reasonable interval if none was given — and promptly after an interview. Never after an explicit rejection.',
    },
    {
      q: 'How many follow-ups are appropriate?',
      a: 'One, capped in code. A second rarely produces what the first did not, and a third is remembered in a way the candidate would not choose.',
    },
    {
      q: 'What should a follow-up message contain?',
      a: 'Something small and real — a relevant thing shipped since applying, a brief answer to an open question. "Just following up" is a request for attention with no offer attached.',
    },
    {
      q: 'What is the biggest risk with a follow-up agent?',
      a: 'Following up on something already rejected or answered. That requires reconciling state from inbound replies, not only from what the agent sent.',
    },
  ],
  related: ['how-to-automate-job-application-follow-ups', 'how-to-build-an-ai-agent-that-tracks-recruiter-responses', 'how-to-build-an-ai-agent-that-tracks-applications'],
};

export default post;
