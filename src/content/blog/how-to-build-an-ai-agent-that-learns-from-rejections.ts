import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-learns-from-rejections',
  tint: 'indigo',
  title: 'How to Build an AI Agent That Learns From Rejected Applications',
  heading: 'Learning from a signal that barely exists',
  description:
    'Why rejection data is much weaker evidence than it looks, what can honestly be learned from it, and how to avoid drawing confident conclusions from noise.',
  keywords: [
    'learn from rejections',
    'rejection feedback ai',
    'weak signal learning',
    'application outcome data',
    'confounded feedback',
    'job search improvement',
    'rejection analysis',
    'agent learning limits',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'A rejection tells you almost nothing about why. Systems that claim otherwise are inventing explanations from noise.',
  sections: [
    {
      heading: 'Rejections carry very little information',
      paragraphs: [
        'A rejection could mean the role was filled internally, the budget was pulled, someone was more qualified, the recruiter never opened the application, or the posting was never real. None of these is distinguishable from the outside.',
        'Any system that tells a candidate why they were rejected is guessing. Presenting that guess as an explanation is worse than saying nothing, because the candidate may act on it.',
      ],
    },
    {
      heading: 'The sample is tiny and heavily confounded',
      paragraphs: [
        'A job search yields tens of outcomes across different roles, companies, markets and moments. Attributing a pattern to any one factor requires holding the others constant, which is impossible here.',
        'Fifteen rejections is not evidence that a CV is the problem. It is consistent with a difficult market, an over-ambitious target, or ordinary variance — and the agent cannot tell which.',
      ],
      bullets: [
        'Different roles, companies and timings in every comparison',
        'No visibility into the other applicants',
        'Outcomes often never reported at all',
        'Silence is the most common result and means nothing specific',
      ],
    },
    {
      heading: 'What can honestly be learned',
      paragraphs: [
        'Aggregate patterns across many users are more reliable than one person’s history. If applications missing a particular hard requirement almost never receive responses, that is worth acting on, and it is visible only at scale.',
        'For an individual, the honest scope is narrow: whether they are applying to roles well above their evidenced level, whether they are missing a requirement that recurs across their targets, whether they are applying to employers who respond to nobody.',
      ],
    },
    {
      heading: 'Explicit feedback beats inference',
      paragraphs: [
        'Where a rejection includes a reason — rare, but it happens — that is worth more than a hundred silent ones. The same is true of an interviewer’s comment or a recruiter’s note.',
        'Capture those deliberately and weight them heavily. Ask the candidate for what they learned after an interview too; their account of a conversation is far better evidence than anything the agent can infer.',
      ],
    },
    {
      heading: 'Do not narrow the search in response',
      paragraphs: [
        'The obvious reaction to rejections is to lower the target, and an agent doing this automatically can talk someone out of the career they are trying to build, on the basis of noise.',
        'Keep the target where the candidate set it unless they change it. Report what has happened, offer what can be addressed, and let the person decide whether to adjust — that decision is not the agent’s to make.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can an agent tell me why I was rejected?',
      a: 'No. A rejection is consistent with an internal hire, a pulled budget, a stronger candidate or an unopened application — none distinguishable from outside. Any explanation is a guess.',
    },
    {
      q: 'How many rejections before a pattern means something?',
      a: 'For an individual, more than a job search produces. Tens of outcomes across different roles, companies and moments cannot be attributed to one factor.',
    },
    {
      q: 'What feedback is actually worth learning from?',
      a: 'Explicit reasons — a stated rejection rationale, an interviewer comment, the candidate own account of a conversation. One of those outweighs a hundred silent rejections.',
    },
    {
      q: 'Should the agent lower the target after rejections?',
      a: 'Not on its own. That can talk someone out of the career they are building on the basis of noise. Report what happened and let the person decide.',
    },
  ],
  related: ['how-to-build-an-ai-agent-that-improves-over-time', 'how-to-build-an-ai-agent-that-learns-your-job-preferences', 'how-to-build-an-ai-job-application-analytics-dashboard'],
};

export default post;
