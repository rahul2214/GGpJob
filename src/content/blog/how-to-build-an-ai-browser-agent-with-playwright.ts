import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-browser-agent-with-playwright',
  tint: 'rose',
  title: 'How to Build an AI Browser Agent With Playwright',
  heading: 'Playwright as an agent runtime',
  description:
    'Using Playwright to drive an agent: exposing the right primitives, locators over selectors, auto-waiting, context isolation, tracing and resource control.',
  keywords: [
    'playwright ai agent',
    'playwright automation agent',
    'playwright locators',
    'browser context isolation',
    'playwright tracing',
    'agent browser runtime',
    'auto waiting playwright',
    'playwright accessibility tree',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Playwright was built for tests, where the author knows the page. An agent does not, which changes which of its features matter.',
  sections: [
    {
      heading: 'Expose a small action vocabulary',
      paragraphs: [
        'Handing a model the whole Playwright API produces creative, unreliable calls. Define a narrow set of actions the agent can request — navigate, click, type, select, upload, read, wait — and implement each carefully behind that boundary.',
        'Everything hard then lives in your implementation rather than in the model’s head: retries, scrolling into view, handling the overlay that intercepted the click, distinguishing a genuine failure from a slow render.',
      ],
      bullets: [
        'One function per action, with validated arguments',
        'Element addressed by a reference the perception step produced',
        'Every action returns what actually happened, not just success',
        'No raw evaluate() exposed to the model',
      ],
    },
    {
      heading: 'Locators, not CSS selectors',
      paragraphs: [
        'Role- and label-based locators match how the page presents itself to a user, which is also how a model reasons about it. A CSS selector encodes implementation detail and breaks on a class name change that altered nothing visible.',
        'It also closes the loop with perception: if the agent saw a control described as a button labelled "Submit application", addressing it the same way means the thing it acts on is the thing it saw.',
      ],
    },
    {
      heading: 'Let auto-waiting do its job',
      paragraphs: [
        'Playwright waits for elements to be actionable before interacting. Agents that add their own fixed sleeps on top are both slower and less reliable — the sleep is either too short for a slow page or wasted on a fast one.',
        'Where you do need extra waiting, wait for a condition that means something: a specific element appearing, a network call settling, a URL changing. "Wait two seconds" is a guess that will be wrong in production.',
      ],
    },
    {
      heading: 'One browser context per run',
      paragraphs: [
        'Contexts isolate cookies, storage and permissions. Running every candidate’s session in its own context is what stops one user’s login leaking into another’s run, and it is cheap compared with launching separate browsers.',
        'Store any persisted session state encrypted and keyed to the user. Career site sessions are credential-adjacent, and a shared or unencrypted state file is the kind of mistake that ends a product.',
      ],
    },
    {
      heading: 'Trace everything, from the first day',
      paragraphs: [
        'Agent failures on real sites are close to impossible to reproduce later: the posting closed, the page changed, the A/B variant rotated. Playwright’s tracing captures the DOM snapshots, actions and network activity of the run.',
        'Enable it for every run, keep traces for failures, and discard the successes on a schedule. This single practice converts "the agent sometimes fails on this site" from a shrug into a bug report.',
      ],
    },
    {
      heading: 'Control resources or they control you',
      paragraphs: [
        'Each browser instance is hundreds of megabytes, and an agent that opens pages and never closes them will exhaust a machine quietly. Long-running agents leak contexts particularly easily.',
        'Cap concurrent contexts, set a hard timeout per run, and close contexts in a finally block rather than on the happy path. Blocking images and fonts is also a large, free speedup — an agent does not need to render the hero banner.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should I give the model the whole Playwright API?',
      a: 'No. Expose a narrow vocabulary — navigate, click, type, select, upload, read, wait — and put the retries, scrolling and overlay handling in your implementation behind it.',
    },
    {
      q: 'Why prefer locators over CSS selectors for agents?',
      a: 'Role and label locators match how the page presents itself, which is how the model reasoned about it, and they survive class name changes that altered nothing visible.',
    },
    {
      q: 'Do I need explicit waits with Playwright?',
      a: 'Rarely. Auto-waiting handles actionability, and added fixed sleeps are either too short or wasted. When you do wait, wait for a meaningful condition rather than a duration.',
    },
    {
      q: 'How do I debug agent failures on real career sites?',
      a: 'Enable tracing on every run and keep traces for failures. Real-site failures cannot be reproduced later because the posting closed or the page changed.',
    },
  ],
  related: ['playwright-vs-selenium-vs-puppeteer-for-ai-agents', 'how-to-build-an-ai-browser-agent-for-job-applications', 'how-to-build-reliable-browser-automation'],
};

export default post;
