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
  anchors: ['follow-up agent', 'follow-up timing'],
  excerpt:
    'One well-timed follow-up helps. The second rarely does, and the third actively costs the candidate something.',
  keyTakeaways: [
    'The first decision is whether to act at all, and that requires the tracking to be right.',
    'Timing decides more than wording; post-interview is the one case for acting quickly.',
    'Cap at one in code, because an agent optimising for replies will always argue for another.',
    '"Just following up" asks for attention and offers nothing.',
    'The worst failure is chasing something already rejected, and only inbound processing prevents it.',
  ],
  sections: [
    {
      heading: 'Establish whether a follow-up is warranted at all',
      paragraphs: [
        'Not every application deserves one. An automated acknowledgement with a stated timeline means the timeline is the answer. An explicit rejection means the conversation is over. A posting that said no follow-ups meant it.',
        'The agent’s first job is to decide whether to act, and that decision needs the application’s actual state — which means the tracking has to be right before the messaging is built.',
        'Treat an unknown state as a reason not to act. An application the system cannot confidently place should produce a question for the candidate rather than a message to an employer, because the cost of asking is a few seconds and the cost of guessing lands in someone else’s inbox.',
      ],
      bullets: [
        'Applied with no response and past the stated timeline — follow up',
        'Interviewed with no response — follow up, sooner',
        'Explicitly rejected — never',
        'Told a decision date that has not arrived — wait',
        'State uncertain — ask the candidate, do not send',
      ],
      table: {
        caption: 'When to act, and how quickly',
        columns: ['Situation', 'Wait', 'Then'],
        rows: [
          ['Applied, no acknowledgement', '~2 weeks', 'One short enquiry'],
          ['Acknowledged with a timeline', 'Until it passes', 'Reference the timeline'],
          ['Interviewed', 'A day', 'A brief note, candidate-written'],
          ['Interviewed, then silence', '~10 days', 'One enquiry, then stop'],
          ['Asked not to follow up', 'Indefinitely', 'Nothing'],
          ['Rejected', '—', 'Nothing, permanently'],
        ],
      },
    },
    {
      heading: 'Timing matters more than wording',
      paragraphs: [
        'Too early reads as impatient and arrives while the process is still running. Too late and the role is filled. The right moment is after any stated timeline has passed, or after a reasonable interval when none was given.',
        'Post-interview is the exception worth treating differently: a prompt, brief note after a conversation is normal professional behaviour and is received well, where the same message three weeks later is not.',
        'Send within working hours in the recipient’s timezone, with a little jitter. A message arriving at 02:00 or at exactly nine every time announces that it was automated, which is the one thing a follow-up should not do.',
      ],
    },
    {
      heading: 'One, and then stop',
      paragraphs: [
        'A second follow-up rarely produces a response that the first did not. A third is noticed, and remembered, in a way the candidate would not choose.',
        'Cap it at one in code. An agent optimising for responses will always find a reason to send another, and the constraint has to sit outside its reasoning.',
        'Make stopping an explicit terminal state rather than an absence of scheduling. An application marked as having exhausted its follow-ups cannot be picked up again by a later scheduling pass, which is how the second message usually escapes in practice.',
      ],
    },
    {
      heading: 'Say something, do not just check in',
      paragraphs: [
        'A message whose entire content is "following up on my application" gives the recipient nothing to respond to and adds no information. It is a request for attention with no offer attached.',
        'A good follow-up adds something small and real: a relevant thing shipped since applying, a brief answer to a question that came up, a specific point of continued interest. Then the recipient has a reason to reply rather than a reason to feel guilty.',
        'Keep it shorter than the original application and make declining easy. A sentence acknowledging that the role may already be filled gives the recipient a low-cost reply, and a low-cost reply is far likelier than a considered one.',
        'Never re-argue the case. A follow-up restating why the candidate is suitable reads as pressure and adds nothing the application did not already contain; the purpose is to surface something that fell through a gap.',
      ],
    },
    {
      heading: 'Track state carefully, because the failure is public',
      paragraphs: [
        'The agent must never follow up on an application that was rejected, already answered, or already followed up. Each of those makes the candidate look inattentive to the person deciding about them.',
        'That means reconciling state from replies, not just from what the agent sent. An unread rejection sitting in an inbox is exactly the situation that produces the worst-timed follow-up possible, and only inbound processing prevents it.',
        'Check the state again immediately before sending rather than only when scheduling. A rejection that arrived between the two is the common case, and a queued message that does not re-verify is the mechanism by which it goes out anyway.',
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
      a: 'One, capped in code as a terminal state. A second rarely produces what the first did not, and a third is remembered in a way the candidate would not choose.',
    },
    {
      q: 'What should a follow-up message contain?',
      a: 'Something small and real, shorter than the original, with an easy way to decline. "Just following up" is a request for attention with no offer attached.',
    },
    {
      q: 'What is the biggest risk with a follow-up agent?',
      a: 'Following up on something already rejected or answered. That requires reconciling state from inbound replies, not only from what the agent sent.',
    },
    {
      q: 'Why re-check state just before sending?',
      a: 'Because a rejection often arrives between scheduling and sending. A queued message that does not re-verify is exactly how the worst-timed follow-up escapes.',
    },
    {
      q: 'Should a follow-up restate why you are a good fit?',
      a: 'No. It reads as pressure and adds nothing the application did not contain. The purpose is surfacing something that fell through a gap.',
    },
  ],
  related: ['how-to-automate-job-application-follow-ups', 'how-to-build-an-ai-agent-that-tracks-recruiter-responses', 'how-to-build-an-ai-agent-that-tracks-applications'],
};

export default post;
