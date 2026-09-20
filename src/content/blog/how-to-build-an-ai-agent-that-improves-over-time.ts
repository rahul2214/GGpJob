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
  anchors: ['improves over time', 'improving or narrowing'],
  excerpt:
    'Improvement over time is a claim worth checking. Most systems that make it are just getting narrower.',
  keyTakeaways: [
    'Rising engagement and falling dismissals are consistent with a collapsed range.',
    'Genuine improvement comes from stored facts, not statistical inference on thin data.',
    'Outcome data in a job search is sparse, delayed and frequently never observed.',
    'Decay behaviour, keep explicit statements, and let a new statement override everything.',
    'Say what changed, and provide a reset for when the model of a person is simply wrong.',
  ],
  sections: [
    {
      heading: 'Distinguish improving from narrowing',
      paragraphs: [
        'A system that learns what a user engages with and shows more of it looks like it is improving: engagement rises, dismissals fall. What has actually happened is that the range collapsed.',
        'Real improvement means surfacing things the user would not have found and would value. That is the harder thing to measure and the only one worth claiming.',
        'Tracking the two separately is what keeps you honest. Relevance and diversity can both be measured week on week, and a system where relevance climbs while diversity falls is narrowing — which is a diagnosis you can only make if you were recording both.',
      ],
    },
    {
      heading: 'Where improvement is genuine',
      paragraphs: [
        'Three areas improve reliably with use. Preferences that were explicitly corrected are simply better data. Form and site handling learned once can be replayed, which makes applications faster and cheaper. And knowledge of which employers respond accumulates usefully.',
        'Note what these have in common: each is a concrete fact learned and stored, not a statistical inference from thin behavioural data.',
        'They also improve at different rates and for different reasons. Form handling improves per site and plateaus; corrected preferences improve fastest in the first fortnight; employer response data improves across all users at once, which is the only one of the three that benefits a new user on their first day.',
      ],
      bullets: [
        'Corrected preferences — direct, unambiguous, high value',
        'Learned site and form structures — replayable, cheap',
        'Employer response behaviour — accumulates across users',
        'Documents that were confirmed and sent — a growing evidence base',
      ],
      table: {
        caption: 'What improves, and what does not',
        columns: ['Claim', 'Honest?', 'Why'],
        rows: [
          ['Learns which forms you face', 'Yes', 'A stored structure, replayed'],
          ['Learns your stated preferences', 'Yes', 'Direct correction, no inference'],
          ['Learns which employers reply', 'Yes', 'Aggregated across many users'],
          ['Learns why you were rejected', 'No', 'Rejections carry almost no information'],
          ['Learns what CV phrasing works', 'No', 'Sample far too small, heavily confounded'],
          ['Predicts your success rate', 'No', 'Tens of confounded outcomes'],
        ],
      },
    },
    {
      heading: 'Where it mostly is not',
      paragraphs: [
        'Predicting success from one person’s outcomes is not achievable at the sample sizes a job search produces. Neither is inferring why an application failed, or learning what phrasing works from a handful of responses.',
        'Systems claiming these are typically reading noise. The responsible position is to say the data does not support the claim, rather than to produce an insight because the interface has a space for one.',
        'The design pressure here is real and worth naming. A dashboard with an empty insights panel looks broken, so somebody fills it, and the filling is where an honest product quietly becomes a dishonest one. "Not enough data yet" is a legitimate thing for a panel to say.',
      ],
    },
    {
      heading: 'Let old signals fade',
      paragraphs: [
        'A job search changes over its course. What someone wanted in month one may not be what they want in month four, and an agent weighting all history equally is anchored to a person who no longer exists.',
        'Decay behavioural signals, keep explicit statements longer, and let a new explicit statement override everything before it. Adapting to the current person is the whole point of adapting at all.',
        'Watch for the moments that should reset rather than decay. A changed target, a new constraint or a long gap in activity all suggest the accumulated model is describing a previous search, and continuing to average across the discontinuity produces a feed that serves neither version of the person.',
      ],
    },
    {
      heading: 'Measuring it without fooling yourself',
      paragraphs: [
        'Nearly every available metric moves in the wrong direction under narrowing, which is why this is hard to check casually. Click-through rate, dismissal rate and session length all improve as a feed converges on a comfortable band.',
        'The measurement that survives is a holdout. A small proportion of users served the unpersonalised ranking, compared over months on applications and responses rather than clicks, is the only way to know whether personalisation did anything — and it is cheap compared with being wrong about it for a year.',
        'Ask users directly as well, occasionally and specifically. "Did this feed show you anything you would not have found yourself?" is a better question about improvement than any behavioural proxy, and it is the one the product is actually claiming to answer.',
      ],
      bullets: [
        'A permanent unpersonalised holdout, however small',
        'Diversity tracked alongside relevance, always both',
        'Applications and responses as the outcome, not clicks',
        'One direct question, asked rarely',
      ],
    },
    {
      heading: 'Show what changed, and allow a reset',
      paragraphs: [
        'A system silently adjusting its behaviour is one the user cannot correct or trust. When the agent learns something that alters what it does, say so in a line.',
        'And provide a reset. Sometimes the model of a person is simply wrong — a strange week, a search on someone else’s behalf — and the fastest fix is to start again rather than to argue with accumulated inference.',
        'Make the reset granular where you can. Clearing learned preferences while keeping application history and form knowledge is usually what someone wants, and an all-or-nothing reset means they either keep a broken model or lose the record of their own search.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How can I tell improvement from narrowing?',
      a: 'Narrowing raises engagement while collapsing range. Track relevance and diversity separately — rising relevance with falling diversity is a diagnosis, not a success.',
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
    {
      q: 'How do I actually measure whether personalisation helps?',
      a: 'With a permanent unpersonalised holdout, compared on applications and responses over months. Every casual metric improves under narrowing, which is why they cannot answer this.',
    },
    {
      q: 'What should an insights panel say with no data?',
      a: '"Not enough data yet." The pressure to fill an empty panel is exactly where an honest product starts presenting noise as a finding.',
    },
  ],
  related: ['how-to-build-an-ai-agent-that-learns-from-rejections', 'how-to-build-an-ai-agent-that-learns-your-job-preferences', 'how-to-give-an-ai-agent-memory'],
};

export default post;
