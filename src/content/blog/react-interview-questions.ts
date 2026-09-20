import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'react-interview-questions',
  tint: 'indigo',
  title: 'React Interview Questions 2026 and How to Answer Them',
  heading: 'React interview questions',
  description:
    'What React interviews test in 2026 — rendering, effects, the server/client boundary and performance — with the follow-ups that expose memorised answers.',
  keywords: [
    'react interview questions',
    'react interview questions 2026',
    'react hooks interview questions',
    'server components interview',
    'useeffect interview question',
    'react performance interview',
    'react coding round',
    'frontend interview preparation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Interviews',
  anchors: ['React interview', 'server components'],
  excerpt:
    'The questions moved. Lifecycle trivia is gone; the server/client boundary and why a component re-rendered have replaced it.',
  keyTakeaways: [
    '"Why did this re-render" is the defining modern question, and it cannot be memorised.',
    'The strongest effect answer is knowing when not to use one.',
    'The server/client boundary is the round candidates most often answer vaguely.',
    'Memoise after measuring; structural fixes usually come first.',
    'In the coding round, handling loading, empty and error states is noticed and rarely done.',
  ],
  sections: [
    {
      heading: 'What changed in these interviews',
      paragraphs: [
        'React interviews used to be lifecycle methods and state management library trivia. They are now about the rendering model and where code runs — which is harder to memorise and much more revealing.',
        'The single most common modern question is some form of "why did this component re-render". A candidate who can reason through it has a mental model; one who has only used React by pattern-matching cannot, and the gap shows within two follow-ups.',
        'The shift reflects what actually causes trouble in production. Nobody debugs a lifecycle method any more; they debug a component that renders forty times, an effect that fires in a loop, or code that touched a browser API on the server.',
      ],
    },
    {
      heading: 'Rendering and state',
      paragraphs: [
        'Expect questions about what triggers a render, why state updates appear asynchronous, and why reading state immediately after setting it gives the old value. The explanation — that the value in scope belongs to that render — is the one worth being able to say cleanly.',
        'Reconciliation and keys come up constantly, usually as a bug to diagnose: a list where inputs keep the wrong values after reordering. Being able to say that index keys tie state to position rather than identity, and what breaks as a result, is a strong answer.',
        'Be precise about what a parent re-render does. A child re-renders when its parent does, regardless of whether its props changed, and the common misconception that unchanged props prevent it is exactly what the follow-up question is hunting for.',
      ],
      bullets: [
        'What causes a re-render, and what does not',
        'Why a state value looks stale inside a closure',
        'What keys do during reconciliation, and why index keys break reordering',
        'Batching, and when updates are grouped',
      ],
    },
    {
      heading: 'Effects, and the question behind them',
      paragraphs: [
        'Interviewers ask about effects because misuse is so widespread. The strongest signal you can give is knowing when *not* to use one — deriving a value during render instead of syncing it in an effect, or handling something in an event handler rather than reacting to state afterwards.',
        'Be ready for the dependency array and cleanup. A question about a subscription or timer that leaks is common, and the answer should cover both what cleanup does and when it runs relative to the next effect.',
        'The classic anti-pattern worth naming unprompted is an effect that sets state derived from props. It causes a second render, it can loop, and the value should simply have been computed during render — recognising that on sight is a reliable seniority signal.',
      ],
      example: {
        title: 'The effect question, answered two ways',
        paragraphs: [
          'Shown: a component that takes a `users` prop and a `query` prop, holds `filtered` in state, and has an effect with `[users, query]` that sets `filtered` to the matching users.',
          'Weak: "The dependency array looks correct, so this is fine." It is correct, and that is not the question.',
          'Strong: "This should not be state at all. Filtering is derivable from props, so compute it during render. As written it renders twice for every change — once with stale filtered data, once corrected — and if the filter function returned a new array identity used elsewhere in a dependency array, it could loop. The rule I use is that an effect should synchronise with something outside React; deriving data is not that."',
        ],
      },
    },
    {
      heading: 'The server/client boundary',
      paragraphs: [
        'This is now a standard round and the one candidates most often answer vaguely. Saying Server Components are "faster because they render on the server" does not survive a follow-up.',
        'Be able to state what cannot cross the boundary, what a server component cannot do — no state, no effects, no browser APIs — and how you would debug a component that fails because it touched `window` on the server. That last one is the most common real-world error and knowing it signals genuine use.',
        'Know what serialises across the boundary too. Functions and class instances do not, which is why passing a callback from a server component to a client one fails, and being able to say that before being asked is the kind of detail that ends this round early.',
      ],
    },
    {
      heading: 'Performance questions',
      paragraphs: [
        'Expect to be asked when to memoise. The answer interviewers want is "after measuring", with an understanding that memoisation has its own cost and that wrapping everything is a common and counterproductive habit.',
        'Stronger candidates talk about structural fixes before memoisation: moving state down so fewer components subscribe to it, splitting a context that changes too often, or shrinking the client boundary so less ships at all.',
        'Mentioning what you would measure with makes the answer concrete. Being able to say you would profile, find which component is re-rendering and why, and only then decide, separates you from candidates reciting a list of optimisation hooks.',
      ],
      table: {
        caption: 'Performance symptoms and where to look first',
        columns: ['Symptom', 'Usual cause', 'First fix to consider'],
        rows: [
          ['Whole tree re-renders on keystroke', 'State held too high', 'Move state down'],
          ['Context consumers all update', 'One context doing too much', 'Split the context'],
          ['Large initial bundle', 'Too much marked client-side', 'Shrink the client boundary'],
          ['List inputs keep wrong values', 'Index keys', 'Key by stable identity'],
          ['Effect fires repeatedly', 'New object or array in deps', 'Derive during render instead'],
        ],
      },
    },
    {
      heading: 'The coding round',
      paragraphs: [
        'Usually a small interactive component — a debounced search, a list with filtering, a form with validation — built while you talk. Accessibility and the non-happy-path states are where most candidates lose marks silently.',
        'Handle loading, empty and error states without being asked, and use a real `button` rather than a clickable div. Neither takes extra time, and both are noticed.',
        'Narrate the decisions rather than only the code. Saying why you are lifting a piece of state, or why you are debouncing the value rather than the request, gives the interviewer the reasoning they are actually scoring.',
      ],
      bullets: [
        'Distinguish empty-because-new from empty-because-filtered',
        'Show a real error state with a retry, not a blank screen',
        'Use semantic elements so keyboard and screen reader use works',
        'Clean up timers and subscriptions you create',
        'Say what you would add with more time, and why you skipped it',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the most common React interview question now?',
      a: 'Some form of "why did this re-render". It cannot be memorised, and the answer reveals whether you have a mental model of the rendering cycle or have been pattern-matching.',
    },
    {
      q: 'How should I answer questions about useEffect?',
      a: 'Show that you know when not to use one — derive during render, or handle it in the event handler. Effect overuse is the most widespread React mistake, and recognising it is the strongest signal available.',
    },
    {
      q: 'What do interviewers ask about Server Components?',
      a: 'Where the boundary sits and why, what cannot cross it, and how you would debug a component that used a browser API on the server. Generic answers about server rendering being faster do not survive follow-ups.',
    },
    {
      q: 'When should I memoise in React?',
      a: 'After measuring. Memoisation has its own cost, and wrapping everything is counterproductive. Structural fixes — moving state down, splitting a context, shrinking the client boundary — usually come first.',
    },
    {
      q: 'Does a child re-render if its props did not change?',
      a: 'Yes, when its parent re-renders, unless it is memoised. The belief that unchanged props prevent it is exactly what the follow-up question is looking for.',
    },
    {
      q: 'What loses marks silently in the coding round?',
      a: 'Skipping loading, empty and error states, and using a clickable div instead of a button. Neither costs extra time and both are noticed.',
    },
  ],
  related: ['react-19-for-developers', 'frontend-developer-roadmap', 'nextjs-16-for-developers'],
  references: [
    {
      title: 'React documentation',
      url: 'https://react.dev/learn',
      publisher: 'React',
      note: 'The official guide, rewritten around hooks and the current rendering model.',
    },
    {
      title: 'Server Components',
      url: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components',
      publisher: 'Next.js',
      note: 'Where the boundary sits in practice, which is the round most candidates answer vaguely.',
    },
  ],
};

export default post;
