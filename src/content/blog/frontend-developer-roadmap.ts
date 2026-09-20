import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'frontend-developer-roadmap',
  tint: 'emerald',
  title: 'Frontend Developer Roadmap 2026',
  heading: 'Frontend developer roadmap',
  description:
    'A focused frontend path for 2026: the browser fundamentals that outlast frameworks, one framework learned deeply, accessibility, performance and what to build.',
  keywords: [
    'frontend developer roadmap',
    'frontend roadmap 2026',
    'how to become a frontend developer',
    'frontend developer skills',
    'learn javascript for jobs',
    'css skills for developers',
    'web accessibility basics',
    'frontend portfolio projects',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Career Roadmaps',
  anchors: ['frontend developer', 'accessibility'],
  excerpt:
    'Frontend has the largest gap between what roadmaps list and what interviews test. The tested part is mostly the browser, not the framework.',
  keyTakeaways: [
    'CSS is the real filter, and utility frameworks hide the gap until a layout misbehaves.',
    'The event loop explains most confusing behaviour you will hit, and interviews probe it.',
    'One framework understood at the model level transfers; three known superficially transfer to nothing.',
    'Accessibility is now a procurement and legal question, and semantic HTML does most of the work free.',
    'Portfolios fail by rendering only the happy path — the difficulty lives in loading, empty and error states.',
  ],
  sections: [
    {
      heading: 'CSS is the filter, not the framework',
      paragraphs: [
        'Most self-taught frontend developers are weakest in CSS and do not know it, because a utility framework hides the gap until something does not lay out the way they expected and there is no class for it.',
        'Learn the layout model itself: flow, the box model, stacking contexts, flexbox and grid, and why a position or overflow property on an ancestor changed something three levels down. This is what separates someone who styles from someone who can be handed a design and reproduce it.',
        'Utility frameworks are not the problem and are worth using. The problem is treating them as a replacement for the model rather than a shorthand for it, which works until the first time the answer is not a class name.',
      ],
      bullets: [
        'Flexbox and grid until you reach for the right one without thinking',
        'Stacking contexts and why z-index "does not work"',
        'Containing blocks, and how position interacts with them',
        'Responsive layout driven by content, not by breakpoints alone',
        'Modern selectors and custom properties',
      ],
    },
    {
      heading: 'JavaScript beyond framework syntax',
      paragraphs: [
        'Frameworks change; the language does not. Closures, prototypes, the event loop, promises and modules explain nearly every confusing behaviour you will hit, and they are what a technical interview probes when it wants to know whether you understand or memorise.',
        'The event loop in particular pays for itself repeatedly. Knowing why something logged in the wrong order, why a state update did not appear immediately, or why a long task froze the page all come from the same understanding.',
        'Closures are the other high-return concept, because they underlie stale values in callbacks, event handlers capturing old state, and most of the confusing behaviour people attribute to their framework being unpredictable.',
      ],
    },
    {
      heading: 'One framework, properly',
      paragraphs: [
        'Choose one and go deep enough to explain its model, not just its API. How rendering and state updates actually work, when effects run, what causes a re-render, where the server/client boundary sits in a modern app.',
        'Depth transfers. A developer who genuinely understands one framework picks up another in weeks; someone who knows three superficially starts over each time and interviews poorly in all of them.',
        'The server and client boundary deserves specific study now that it is central to modern frameworks. Knowing which code runs where, what can cross the boundary and what that costs is one of the most commonly probed areas and one of the least well understood.',
      ],
    },
    {
      heading: 'Accessibility is now a requirement',
      paragraphs: [
        'Accessibility has moved from a nice-to-have to a procurement and legal question, and it appears in interviews far more than it used to. The basics are not hard and their absence is immediately visible to anyone who checks.',
        'Semantic HTML does most of the work for free. A real button is focusable, keyboard-operable and announced correctly; a div with a click handler is none of those and has to have all of it rebuilt by hand.',
        'The fastest way to build the instinct is to put your mouse aside and operate your own interface with the keyboard for ten minutes. Every place you get stuck, every control you cannot reach, and every point where focus vanishes is a real defect you would otherwise never have noticed.',
      ],
      bullets: [
        'Semantic elements before ARIA — ARIA is a patch, not a foundation',
        'Keyboard navigation through every interactive path',
        'Visible focus states, and never removing the outline without a replacement',
        'Labels tied to inputs, and errors announced rather than only coloured',
        'Colour contrast that meets the standard',
      ],
    },
    {
      heading: 'Performance is a frontend responsibility',
      paragraphs: [
        'Users experience your bundle size on a mid-range phone on a poor connection, not on your laptop. Understanding what ships, what blocks rendering and what causes layout shift is a differentiator, because most candidates have never measured it.',
        'Learn to read a performance trace and connect a number to a cause. Being able to say "the largest contentful paint is the hero image because it is not preloaded and it is a 900KB PNG" is worth more in an interview than naming ten optimisation techniques.',
        'Throttle your own connection and processor in the browser devtools and use your site that way once. It is uncomfortable and it converts performance from an abstract score into something you have actually experienced.',
      ],
      table: {
        caption: 'Common performance symptoms and their usual causes',
        columns: ['Symptom', 'Usual cause', 'First thing to check'],
        rows: [
          ['Slow first paint', 'Render-blocking resources', 'Scripts and fonts in the head'],
          ['Large contentful paint is late', 'Unoptimised hero image', 'Format, size, preload'],
          ['Content jumps as it loads', 'No reserved space', 'Image and ad dimensions'],
          ['Interface freezes briefly', 'Long task on the main thread', 'Performance trace, long tasks'],
          ['Huge bundle', 'Everything imported eagerly', 'What is in the initial chunk'],
        ],
      },
    },
    {
      heading: 'What to build',
      paragraphs: [
        'Something with real state and real data — filtering, pagination, optimistic updates, error and empty states. Interfaces that only render happy-path data are the most common portfolio weakness, because every hard frontend problem lives in the other states.',
        'Deploy it, run a performance audit, and fix what it finds. Being able to point at a real measurement you improved says more than another clone project.',
        'Handle the unglamorous cases deliberately and mention them in the README. What the screen shows while loading, what it shows when there is nothing, what happens when the request fails and the user retries — those three decisions demonstrate more frontend judgement than any amount of styling.',
      ],
      example: {
        title: 'The states most portfolios skip',
        paragraphs: [
          'A list view has at least six states and most portfolios implement one. Loading for the first time. Loading more. Empty because the user has no data yet, which should be encouraging rather than blank. Empty because a filter matched nothing, which should offer a way back. Failed, with a retry. And populated.',
          'Each of those is a small design and engineering decision, and an interviewer who sees them handled knows immediately that the candidate has built something real. A skeleton loader and a distinct empty-versus-no-results state cost an afternoon and separate you from most applicants.',
        ],
      },
    },
  ],
  faqs: [
    {
      q: 'Do I need to learn CSS deeply if I use a utility framework?',
      a: 'Yes. Utility classes are a shorthand for the same underlying model, and the moment a layout misbehaves you need to understand stacking contexts, containing blocks and the box model to fix it.',
    },
    {
      q: 'Which frontend framework should I learn in 2026?',
      a: 'The one with the strongest hiring market where you want to work, learned properly. Depth in one transfers quickly to another; shallow familiarity with three transfers to nothing.',
    },
    {
      q: 'Is accessibility really tested in interviews?',
      a: 'Increasingly, yes — it has become a legal and procurement requirement. Semantic HTML, keyboard operability and focus management are the basics you are expected to know without prompting.',
    },
    {
      q: 'What makes a frontend portfolio stand out?',
      a: 'Handling the unglamorous states: loading, empty, error, optimistic updates and failure recovery. Most portfolios only render the happy path, which is where none of the real difficulty is.',
    },
    {
      q: 'What is the fastest way to find accessibility problems?',
      a: 'Put the mouse aside and operate your own interface with the keyboard for ten minutes. Every control you cannot reach and every point where focus disappears is a real defect.',
    },
    {
      q: 'Which JavaScript concepts pay off most?',
      a: 'The event loop and closures. Between them they explain out-of-order logging, stale values in callbacks, state that did not update immediately, and a frozen page.',
    },
  ],
  related: ['backend-developer-roadmap', 'full-stack-developer-roadmap', 'react-interview-questions'],
  references: [
    {
      title: 'CSS grid layout',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout',
      publisher: 'MDN Web Docs',
      note: 'The layout model itself, rather than a framework wrapping it.',
    },
    {
      title: 'The event loop',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop',
      publisher: 'MDN Web Docs',
      note: 'Explains most confusing ordering behaviour in JavaScript.',
    },
    {
      title: 'How to Meet WCAG (Quick Reference)',
      url: 'https://www.w3.org/WAI/WCAG22/quickref/',
      publisher: 'W3C',
      note: 'The criteria in checkable form.',
    },
    {
      title: 'Web Vitals',
      url: 'https://web.dev/articles/vitals',
      publisher: 'web.dev',
      note: 'The metrics users actually experience, and what moves them.',
    },
  ],
};

export default post;
