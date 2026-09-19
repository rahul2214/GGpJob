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
  excerpt:
    'The risk is not failing to learn. It is learning too fast from too little and locking someone into a version of themselves from three weeks ago.',
  sections: [
    {
      heading: 'Most signals are weaker than they look',
      paragraphs: [
        'A click means someone was curious, not that they want the role. Time on a page might mean interest or a confusing posting. Not clicking might mean rejection, or that they never scrolled that far.',
        'Rank the signals by how much they actually commit the user. Applying is strong. Saving is moderate. Dismissing with a reason is strong and specific. A click is weak, and building a preference model mostly on clicks produces a model of curiosity rather than intent.',
      ],
      bullets: [
        'Applied — strong positive',
        'Dismissed with a reason — strong negative, and interpretable',
        'Saved — moderate positive',
        'Clicked — weak; useful in aggregate, misleading individually',
      ],
    },
    {
      heading: 'The narrowing problem',
      paragraphs: [
        'Learn from what someone engaged with, show more like it, learn again — and within weeks the feed is a narrow band. It scores well on every engagement metric and quietly excludes most of what the person might want.',
        'Career changers suffer worst, which matters because they are exactly the people who need a job search product most. Someone moving from support into engineering is fighting their own history, and a naive preference model puts that history in charge.',
      ],
    },
    {
      heading: 'Ask, at the right moment',
      paragraphs: [
        'Inference is unnecessary when asking is cheap. The difficulty is that asking at signup gets vague answers, because people do not know what they want until they see options.',
        'Ask in context instead: after a dismissal, offer two or three reasons in one tap. After an application, ask what made this one worth it. Small, specific, well-timed questions produce better preference data than any amount of behavioural inference, and they cost the user almost nothing.',
      ],
    },
    {
      heading: 'Weight explicit statements above behaviour',
      paragraphs: [
        'When someone says they want to move into a new area and their history says otherwise, the statement should win. Behavioural models are built on the past by construction, and the past is the thing a career changer is trying to leave.',
        'Give explicit input a high weight and a long half-life. Let behaviour refine within what was stated — which of these stated-target roles appeal — rather than overriding the direction itself.',
      ],
    },
    {
      heading: 'Show what was learned',
      paragraphs: [
        'A preference model working invisibly gives the user no way to notice it has gone wrong, and it will go wrong: one unusual week of browsing, one application sent on someone else’s behalf.',
        'Display the inferred preferences plainly and let them be corrected. The correction is more valuable than the inference — it is unambiguous, it is current, and a user who can fix the model stops blaming it.',
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
  ],
  related: ['how-to-give-an-ai-agent-memory', 'how-to-build-an-ai-agent-that-improves-over-time', 'how-embeddings-improve-job-recommendations'],
};

export default post;
