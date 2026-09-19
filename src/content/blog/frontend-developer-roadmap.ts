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
  excerpt:
    'Frontend has the largest gap between what roadmaps list and what interviews test. The tested part is mostly the browser, not the framework.',
  sections: [
    {
      heading: 'CSS is the filter, not the framework',
      paragraphs: [
        'Most self-taught frontend developers are weakest in CSS and do not know it, because a utility framework hides the gap until something does not lay out the way they expected and there is no class for it.',
        'Learn the layout model itself: flow, the box model, stacking contexts, flexbox and grid, and why a position or overflow property on an ancestor changed something three levels down. This is what separates someone who styles from someone who can be handed a design and reproduce it.',
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
      ],
    },
    {
      heading: 'One framework, properly',
      paragraphs: [
        'Choose one and go deep enough to explain its model, not just its API. How rendering and state updates actually work, when effects run, what causes a re-render, where the server/client boundary sits in a modern app.',
        'Depth transfers. A developer who genuinely understands one framework picks up another in weeks; someone who knows three superficially starts over each time and interviews poorly in all of them.',
      ],
    },
    {
      heading: 'Accessibility is now a requirement',
      paragraphs: [
        'Accessibility has moved from a nice-to-have to a procurement and legal question, and it appears in interviews far more than it used to. The basics are not hard and their absence is immediately visible to anyone who checks.',
        'Semantic HTML does most of the work for free. A real button is focusable, keyboard-operable and announced correctly; a div with a click handler is none of those and has to have all of it rebuilt by hand.',
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
      ],
    },
    {
      heading: 'What to build',
      paragraphs: [
        'Something with real state and real data — filtering, pagination, optimistic updates, error and empty states. Interfaces that only render happy-path data are the most common portfolio weakness, because every hard frontend problem lives in the other states.',
        'Deploy it, run a performance audit, and fix what it finds. Being able to point at a real measurement you improved says more than another clone project.',
      ],
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
  ],
  related: ['backend-developer-roadmap', 'full-stack-developer-roadmap', 'react-interview-questions'],
};

export default post;
