import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-improves-over-time',
  tint: 'indigo',
  title: 'How to Build an AI Agent That Improves Your Job Search Over Time',
  heading: 'Getting better, honestly',
  description:
    'Where an agent can genuinely improve with use, where it only appears to, and the difference between adapting to a person and overfitting to their recent past.',
  keywords: [
    'agent improvement over time',
    'adaptive job search',
    'learning from user feedback',
    'overfitting personalisation',
    'agent memory decay',
    'continuous improvement ai',
    'job search adaptation',
    'agent evaluation over time',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'Improvement over time is a claim worth checking. Most systems that make it are just getting narrower.',
  sections: [
    {
      heading: 'Distinguish improving from narrowing',
      paragraphs: [
        'A system that learns what a user engages with and shows more of it looks like it is improving: engagement rises, dismissals fall. What has actually happened is that the range collapsed.',
        'Real improvement means surfacing things the user would not have found and would value. That is the harder thing to measure and the only one worth claiming.',
      ],
    },
    {
      heading: 'Where improvement is genuine',
      paragraphs: [
        'Three areas improve reliably with use. Preferences that were explicitly corrected are simply better data. Form and site handling learned once can be replayed, which makes applications faster and cheaper. And knowledge of which employers respond accumulates usefully.',
        'Note what these have in common: each is a concrete fact learned and stored, not a statistical inference from thin behavioural data.',
      ],
      bullets: [
        'Corrected preferences — direct, unambiguous, high value',
        'Learned site and form structures — replayable, cheap',
        'Employer response behaviour — accumulates across users',
        'Documents that were confirmed and sent — a growing evidence base',
      ],
    },
    {
      heading: 'Where it mostly is not',
      paragraphs: [
        'Predicting success from one person’s outcomes is not achievable at the sample sizes a job search produces. Neither is inferring why an application failed, or learning what phrasing works from a handful of responses.',
        'Systems claiming these are typically reading noise. The responsible position is to say the data does not support the claim, rather than to produce an insight because the interface has a space for one.',
      ],
    },
    {
      heading: 'Let old signals fade',
      paragraphs: [
        'A job search changes over its course. What someone wanted in month one may not be what they want in month four, and an agent weighting all history equally is anchored to a person who no longer exists.',
        'Decay behavioural signals, keep explicit statements longer, and let a new explicit statement override everything before it. Adapting to the current person is the whole point of adapting at all.',
      ],
    },
    {
      heading: 'Show what changed, and allow a reset',
      paragraphs: [
        'A system silently adjusting its behaviour is one the user cannot correct or trust. When the agent learns something that alters what it does, say so in a line.',
        'And provide a reset. Sometimes the model of a person is simply wrong — a strange week, a search on someone else’s behalf — and the fastest fix is to start again rather than to argue with accumulated inference.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How can I tell improvement from narrowing?',
      a: 'Narrowing raises engagement while collapsing range. Real improvement surfaces things the user would not have found and does value — harder to measure and the only claim worth making.',
    },
    {
      q: 'What does an agent genuinely learn over time?',
      a: 'Corrected preferences, site and form structures it can replay, and which employers respond. All concrete stored facts rather than statistical inference from thin data.',
    },
    {
      q: 'Can an agent learn what resume phrasing works?',
      a: 'Not from one person search. The sample is far too small and confounded — systems claiming this are reading noise and presenting it as insight.',
    },
    {
      q: 'Should old signals be weighted equally?',
      a: 'No. Decay behaviour, keep explicit statements longer, and let a new statement override everything prior — otherwise the agent is anchored to a person who no longer exists.',
    },
  ],
  related: ['how-to-build-an-ai-agent-that-learns-from-rejections', 'how-to-build-an-ai-agent-that-learns-your-job-preferences', 'how-to-give-an-ai-agent-memory'],
};

export default post;
