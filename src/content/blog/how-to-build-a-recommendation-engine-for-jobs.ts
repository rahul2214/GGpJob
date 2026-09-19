import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-recommendation-engine-for-jobs',
  tint: 'emerald',
  title: 'How to Build a Recommendation Engine for Jobs',
  heading: 'A job recommender, end to end',
  description:
    'The practical build: data model, signals worth collecting, batch versus real-time serving, the daily feed problem, and what to do on day one with no data.',
  keywords: [
    'build job recommendation engine',
    'recommender system jobs',
    'batch vs realtime recommendations',
    'job feed architecture',
    'implicit signals jobs',
    'cold start recommendations',
    'recommendation serving',
    'job alerts design',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'The interesting design questions are not about the algorithm. They are about what you log, how often you recompute, and what you show someone who signed up four minutes ago.',
  sections: [
    {
      heading: 'Start with what you log',
      paragraphs: [
        'You cannot recommend from data you never captured, and the signals worth having are rarely captured by default. Clicks are logged everywhere; impressions usually are not, and without them you cannot tell disinterest from never having been shown the thing.',
        'Log the negative and the neutral as well as the positive. A posting shown ten times and never clicked is information. A search that returned nothing is information. Most teams discover these gaps a year in, when backfilling is no longer possible.',
      ],
      bullets: [
        'Impressions, with position — not only clicks',
        'Searches that returned nothing or were immediately refined',
        'Saves and dismissals, which are stronger signals than views',
        'Application outcomes, however sparse and delayed',
      ],
    },
    {
      heading: 'Batch for the feed, real time for the session',
      paragraphs: [
        'Recomputing everyone’s recommendations on every request is expensive and mostly wasted, since the underlying profile changes slowly. Precompute a candidate set per user on a schedule and serve it instantly.',
        'Then layer real-time signals on top. What someone searched for two minutes ago should influence what they see now, and that is a cheap re-ranking of an already-computed set rather than a fresh retrieval.',
      ],
    },
    {
      heading: 'The daily feed is a different product',
      paragraphs: [
        'An on-site feed can repeat itself harmlessly; a daily email cannot. Sending the same five roles three mornings running is how a job alert becomes an unsubscribe.',
        'Track what each user has been sent and exclude it for a window. Cap the number of roles from one employer. And be willing to send fewer, or nothing — a thin honest digest survives longer than a padded one.',
      ],
    },
    {
      heading: 'Day one, with no data at all',
      paragraphs: [
        'A new user has no behaviour, and this is the moment that decides whether they come back. Falling through to "most popular jobs" is the common answer and a poor one, because popular roles are popular with everyone and relevant to nobody in particular.',
        'Use what they gave you at signup: their CV, their stated target role, their location. Content-based matching works from the first second, which is exactly why embeddings are the sensible backbone for a job recommender rather than collaborative signals.',
      ],
    },
    {
      heading: 'Recommend the employer’s reality too',
      paragraphs: [
        'A recommendation is only good if the application can go somewhere. Recommending roles from employers who never respond produces applications, satisfying your metrics, and no outcomes for anyone.',
        'Fold employer behaviour into ranking: response rate, time to first response, how long postings stay open. Candidates cannot see this and it materially affects whether their effort was worth spending.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What should I log for a job recommender?',
      a: 'Impressions with position, not just clicks — otherwise you cannot distinguish disinterest from never having shown the job. Also log empty searches, saves, dismissals and application outcomes.',
    },
    {
      q: 'Should recommendations be computed in batch or in real time?',
      a: 'Both. Precompute a candidate set per user on a schedule for instant serving, then re-rank it with real-time session signals like the search someone ran two minutes ago.',
    },
    {
      q: 'How do I keep a daily job alert from becoming spam?',
      a: 'Track what each user was sent and exclude it for a window, cap roles per employer, and be willing to send fewer or none. A thin honest digest outlives a padded one.',
    },
    {
      q: 'What do I recommend to a brand-new user?',
      a: 'Not popular jobs — those are relevant to nobody in particular. Use their CV, stated target role and location, which is why content-based embeddings are the right backbone here.',
    },
  ],
  related: ['how-to-build-an-ai-job-recommendation-engine', 'how-embeddings-improve-job-recommendations', 'how-to-build-a-job-recommendation-engine-with-pgvector'],
};

export default post;
