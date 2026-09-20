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
  anchors: ['job recommender', 'daily feed'],
  excerpt:
    'The interesting design questions are not about the algorithm. They are about what you log, how often you recompute, and what you show someone who signed up four minutes ago.',
  keyTakeaways: [
    'Impressions are the signal teams forget to log and cannot backfill.',
    'Batch the feed, re-rank the session — recomputation on every request is mostly waste.',
    'A daily email is a different product from an on-site feed and needs its own rules.',
    'Never fall back to popular jobs; content matching works from the first second.',
    'Rank on employer behaviour too, or you optimise applications rather than outcomes.',
  ],
  sections: [
    {
      heading: 'Start with what you log',
      paragraphs: [
        'You cannot recommend from data you never captured, and the signals worth having are rarely captured by default. Clicks are logged everywhere; impressions usually are not, and without them you cannot tell disinterest from never having been shown the thing.',
        'Log the negative and the neutral as well as the positive. A posting shown ten times and never clicked is information. A search that returned nothing is information. Most teams discover these gaps a year in, when backfilling is no longer possible.',
        'Position matters as much as the impression itself. A role at the top of a feed and the same role at the bottom get very different attention, and comparing their click rates without accounting for where they appeared measures the layout rather than the candidate’s preference.',
      ],
      bullets: [
        'Impressions, with position — not only clicks',
        'Searches that returned nothing or were immediately refined',
        'Saves and dismissals, which are stronger signals than views',
        'Application outcomes, however sparse and delayed',
        'Which model or ranking version produced each impression',
      ],
      table: {
        caption: 'Signal strength, and what each one costs to collect',
        columns: ['Signal', 'Strength', 'Availability'],
        rows: [
          ['Impression', 'Weak, essential as a baseline', 'Free, if instrumented early'],
          ['Click', 'Weak — curiosity, not intent', 'Free'],
          ['Save', 'Moderate', 'Free'],
          ['Dismissal with reason', 'Strong', 'Needs one tap from the user'],
          ['Application', 'Strong', 'Free'],
          ['Outcome', 'Strongest', 'Sparse, delayed, often never known'],
        ],
      },
    },
    {
      heading: 'Batch for the feed, real time for the session',
      paragraphs: [
        'Recomputing everyone’s recommendations on every request is expensive and mostly wasted, since the underlying profile changes slowly. Precompute a candidate set per user on a schedule and serve it instantly.',
        'Then layer real-time signals on top. What someone searched for two minutes ago should influence what they see now, and that is a cheap re-ranking of an already-computed set rather than a fresh retrieval.',
        'Batching needs an invalidation path or it becomes the stale thing it was meant to avoid. A changed target role, a new constraint or a submitted application should all mark the set for regeneration rather than waiting for tomorrow’s run.',
      ],
    },
    {
      heading: 'The daily feed is a different product',
      paragraphs: [
        'An on-site feed can repeat itself harmlessly; a daily email cannot. Sending the same five roles three mornings running is how a job alert becomes an unsubscribe.',
        'Track what each user has been sent and exclude it for a window. Cap the number of roles from one employer. And be willing to send fewer, or nothing — a thin honest digest survives longer than a padded one.',
        'Frequency should follow supply rather than a schedule. In a field where six suitable roles appear a week, a daily email is four empty mornings and two thin ones, and a weekly digest of six is a better product than seven attempts to find something to say.',
      ],
    },
    {
      heading: 'Day one, with no data at all',
      paragraphs: [
        'A new user has no behaviour, and this is the moment that decides whether they come back. Falling through to "most popular jobs" is the common answer and a poor one, because popular roles are popular with everyone and relevant to nobody in particular.',
        'Use what they gave you at signup: their CV, their stated target role, their location. Content-based matching works from the first second, which is exactly why embeddings are the sensible backbone for a job recommender rather than collaborative signals.',
        'The first session is also the cheapest time to collect preference data, because the user is engaged and expects to be asked. Three dismissals with a reason attached, gathered while they are looking at concrete roles, are worth more than a week of passive behaviour.',
      ],
    },
    {
      heading: 'Evaluating it without fooling yourself',
      paragraphs: [
        'Click-through rate is the easiest metric and the one most likely to mislead. A feed optimised for clicks converges on roles at well-known companies with attractive titles, which produces engagement and not employment.',
        'The metric that matters is applications that reached a human and produced a response, per user, per week. It is sparse and delayed, which is precisely why teams substitute clicks — and why a recommender tuned on clicks drifts away from the thing it exists for.',
        'Hold out a control. A small proportion of users served a simpler ranking is the only way to know whether the last six months of improvements did anything, and it costs almost nothing to run compared with the cost of being wrong about it for a year.',
      ],
      bullets: [
        'Clicks measure curiosity; applications measure intent; responses measure fit',
        'A permanent holdout group, however small',
        'Feed diversity tracked over time, not just relevance',
        'Coverage — what proportion of postings ever get recommended to anyone',
      ],
    },
    {
      heading: 'Recommend the employer’s reality too',
      paragraphs: [
        'A recommendation is only good if the application can go somewhere. Recommending roles from employers who never respond produces applications, satisfying your metrics, and no outcomes for anyone.',
        'Fold employer behaviour into ranking: response rate, time to first response, how long postings stay open. Candidates cannot see this and it materially affects whether their effort was worth spending.',
        'Postings that have been reposted repeatedly deserve particular scepticism. A role advertised every month for six months is frequently not a role, and a recommender that keeps surfacing it is spending its users’ effort on something the employer is not actually filling.',
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
    {
      q: 'Why is click-through rate a misleading metric here?',
      a: 'Because a click-optimised feed converges on well-known companies and attractive titles. That produces engagement rather than employment, which is not what the product is for.',
    },
    {
      q: 'Should email frequency be daily?',
      a: 'Only if supply justifies it. In a field with six suitable roles a week, a weekly digest of six beats seven attempts to find something to say.',
    },
  ],
  related: ['how-to-build-an-ai-job-recommendation-engine', 'how-embeddings-improve-job-recommendations', 'how-to-build-a-job-recommendation-engine-with-pgvector'],
};

export default post;
