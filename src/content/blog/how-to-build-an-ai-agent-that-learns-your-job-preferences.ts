import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-learns-your-job-preferences',
  tint: 'indigo',
  title: 'How to Build an AI Agent That Learns Your Job Preferences',
  heading: 'Learning what someone actually wants',
  description:
    'Turning behaviour into preferences without overfitting: which signals mean what, avoiding the narrowing feed, asking well, and showing what was learned.',
  keywords: [
    'learn job preferences ai',
    'preference learning agent',
    'implicit feedback signals',
    'personalisation without overfitting',
    'preference elicitation',
    'feed narrowing',
    'user modelling jobs',
    'adaptive job search',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['job preferences', 'preference learning'],
  excerpt:
    'The risk is not failing to learn. It is learning too fast from too little and locking someone into a version of themselves from three weeks ago.',
  keyTakeaways: [
    'Rank signals by how much they commit the user; a click is curiosity, not intent.',
    'The narrowing loop scores well on every engagement metric while excluding what matters.',
    'Ask in context rather than at signup — people do not know what they want until they see options.',
    'A stated target outranks behaviour, because behaviour is the past by construction.',
    'Show the inferred model; the correction is more valuable than the inference.',
  ],
  sections: [
    {
      heading: 'Most signals are weaker than they look',
      paragraphs: [
        'A click means someone was curious, not that they want the role. Time on a page might mean interest or a confusing posting. Not clicking might mean rejection, or that they never scrolled that far.',
        'Rank the signals by how much they actually commit the user. Applying is strong. Saving is moderate. Dismissing with a reason is strong and specific. A click is weak, and building a preference model mostly on clicks produces a model of curiosity rather than intent.',
        'Position confounds all of them. A role at the top of a feed is clicked more than the same role at the bottom, so any signal not adjusted for where it appeared is partly measuring your own layout rather than the candidate’s preferences.',
      ],
      bullets: [
        'Applied — strong positive',
        'Dismissed with a reason — strong negative, and interpretable',
        'Saved — moderate positive',
        'Clicked — weak; useful in aggregate, misleading individually',
      ],
      table: {
        caption: 'Signals and what they actually support',
        columns: ['Signal', 'Strength', 'Supports'],
        rows: [
          ['Application submitted', 'Strong', 'This is a role they want'],
          ['Dismissal with a reason', 'Strong', 'A specific exclusion, reusable'],
          ['Save for later', 'Moderate', 'Interest, not commitment'],
          ['Click', 'Weak', 'Curiosity, confounded by position'],
          ['Dwell time', 'Very weak', 'Interest or a confusing posting'],
          ['No click', 'Almost nothing', 'They may never have seen it'],
        ],
      },
    },
    {
      heading: 'The narrowing problem',
      paragraphs: [
        'Learn from what someone engaged with, show more like it, learn again — and within weeks the feed is a narrow band. It scores well on every engagement metric and quietly excludes most of what the person might want.',
        'Career changers suffer worst, which matters because they are exactly the people who need a job search product most. Someone moving from support into engineering is fighting their own history, and a naive preference model puts that history in charge.',
        'The loop is self-confirming, which is why it does not correct itself. The system only ever observes preferences about what it chose to show, so the evidence always supports the band it already picked — and a deliberate exploration slice is the only thing that generates evidence to the contrary.',
      ],
    },
    {
      heading: 'Ask, at the right moment',
      paragraphs: [
        'Inference is unnecessary when asking is cheap. The difficulty is that asking at signup gets vague answers, because people do not know what they want until they see options.',
        'Ask in context instead: after a dismissal, offer two or three reasons in one tap. After an application, ask what made this one worth it. Small, specific, well-timed questions produce better preference data than any amount of behavioural inference, and they cost the user almost nothing.',
        'Offer the reasons rather than asking for them. A free-text box after a dismissal is answered by almost nobody; three tappable options covering the common cases — wrong level, wrong location, wrong kind of company — are answered by most people and produce structured data you can act on directly.',
      ],
    },
    {
      heading: 'Weight explicit statements above behaviour',
      paragraphs: [
        'When someone says they want to move into a new area and their history says otherwise, the statement should win. Behavioural models are built on the past by construction, and the past is the thing a career changer is trying to leave.',
        'Give explicit input a high weight and a long half-life. Let behaviour refine within what was stated — which of these stated-target roles appeal — rather than overriding the direction itself.',
        'Keep the two kinds of preference in separate stores rather than merging them into one score. Stated constraints are rules; learned tendencies are weights, and collapsing the distinction is how a hard exclusion ends up outvoted by a run of clicks.',
      ],
    },
    {
      heading: 'What the model should and should not contain',
      paragraphs: [
        'Some preferences are hard boundaries and belong in a constraint list that nothing can override: locations, right to work, a salary floor, employers to exclude. These are checked, not weighed.',
        'Others are genuine preferences that can be traded off: company size, domain, technology, how much process someone tolerates. These are the ones learning should refine, and they are the reason a preference model is worth having at all.',
        'And some things do not belong in the model regardless of how predictive they look. Anything that acts as a proxy for a protected characteristic — inferences from names, institutions, career gaps or photographs — should be absent by construction, because a personalisation system is also a filtering system and the same reasoning applies to both.',
      ],
      bullets: [
        'Constraints — checked, never weighted or traded',
        'Preferences — weighted, refined by behaviour',
        'Exclusions the candidate stated — permanent until they change them',
        'Protected-characteristic proxies — absent by construction',
      ],
    },
    {
      heading: 'Show what was learned',
      paragraphs: [
        'A preference model working invisibly gives the user no way to notice it has gone wrong, and it will go wrong: one unusual week of browsing, one application sent on someone else’s behalf.',
        'Display the inferred preferences plainly and let them be corrected. The correction is more valuable than the inference — it is unambiguous, it is current, and a user who can fix the model stops blaming it.',
        'Write it in the user’s language rather than the system’s. "You seem to prefer smaller companies and are not interested in management roles" is correctable; a list of weighted feature vectors is technically the same information and useless as an interface.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Which signals should a preference model trust?',
      a: 'Applications and reasoned dismissals most, saves moderately, clicks least. A model built mainly on clicks captures curiosity rather than intent.',
    },
    {
      q: 'Why do personalised job feeds get narrower?',
      a: 'Because learning from engagement and showing more of the same closes a loop. It scores well on engagement metrics while excluding most of what the person might want — worst for career changers.',
    },
    {
      q: 'Is it better to ask or to infer preferences?',
      a: 'Ask, but in context rather than at signup. Two or three tap-sized reasons after a dismissal produce better data than any amount of behavioural inference.',
    },
    {
      q: 'What if stated preferences contradict behaviour?',
      a: 'The statement should win. Behavioural models are built on the past by construction, and the past is exactly what a career changer is trying to move away from.',
    },
    {
      q: 'Should constraints and preferences live in one model?',
      a: 'No. Constraints are checked; preferences are weighted. Merging them is how a hard exclusion ends up outvoted by a run of clicks.',
    },
    {
      q: 'How should the learned model be presented?',
      a: 'In plain language the user can correct — "you seem to prefer smaller companies" — not as weights. The correction is worth more than the inference it replaces.',
    },
  ],
  related: ['how-to-give-an-ai-agent-memory', 'how-to-build-an-ai-agent-that-improves-over-time', 'how-embeddings-improve-job-recommendations'],
};

export default post;
