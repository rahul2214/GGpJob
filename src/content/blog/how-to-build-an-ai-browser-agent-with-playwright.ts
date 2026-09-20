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
  anchors: ['Playwright agent', 'agent runtime'],
  excerpt:
    'Playwright was built for tests, where the author knows the page. An agent does not, which changes which of its features matter.',
  keyTakeaways: [
    'Expose a small action vocabulary and keep the difficulty in your implementation.',
    'Role and label locators match how the model reasoned about the page; CSS selectors do not.',
    'Auto-waiting already handles actionability — added sleeps make things slower and less reliable.',
    'One context per run; a shared profile is a data leak with no technical difficulty behind it.',
    'Trace every run from the first day, because real-site failures cannot be reproduced later.',
  ],
  sections: [
    {
      heading: 'Expose a small action vocabulary',
      paragraphs: [
        'Handing a model the whole Playwright API produces creative, unreliable calls. Define a narrow set of actions the agent can request — navigate, click, type, select, upload, read, wait — and implement each carefully behind that boundary.',
        'Everything hard then lives in your implementation rather than in the model’s head: retries, scrolling into view, handling the overlay that intercepted the click, distinguishing a genuine failure from a slow render.',
        'Each action should report what happened rather than whether it threw. A click that landed on a different element, a field that rejected the value, a navigation that redirected somewhere unexpected — these are outcomes the agent needs to reason about, and a bare success flag discards all of them.',
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
        'Strictness is a feature here rather than an inconvenience. A locator matching two elements should fail loudly rather than silently choosing the first, because on an application form the first and second match are frequently different fields with the same label in different sections.',
      ],
    },
    {
      heading: 'Let auto-waiting do its job',
      paragraphs: [
        'Playwright waits for elements to be actionable before interacting. Agents that add their own fixed sleeps on top are both slower and less reliable — the sleep is either too short for a slow page or wasted on a fast one.',
        'Where you do need extra waiting, wait for a condition that means something: a specific element appearing, a network call settling, a URL changing. "Wait two seconds" is a guess that will be wrong in production.',
        'Set timeouts per action type rather than globally. A navigation on a slow career site legitimately needs longer than a click, and one generous global timeout turns every genuine failure into a thirty-second pause before the agent finds out.',
      ],
      table: {
        caption: 'Test assumptions that do not hold for an agent',
        columns: ['In a test', 'For an agent'],
        rows: [
          ['The author knows the page', 'The page is unseen'],
          ['Selectors written by hand', 'Elements discovered at runtime'],
          ['Failure means a bug', 'Failure means adapt or stop'],
          ['One known flow', 'Thousands of unknown ones'],
          ['Runs in CI, disposable', 'Runs against a real account'],
          ['Traces read occasionally', 'Traces are the only record'],
        ],
      },
    },
    {
      heading: 'One browser context per run',
      paragraphs: [
        'Contexts isolate cookies, storage and permissions. Running every candidate’s session in its own context is what stops one user’s login leaking into another’s run, and it is cheap compared with launching separate browsers.',
        'Store any persisted session state encrypted and keyed to the user. Career site sessions are credential-adjacent, and a shared or unencrypted state file is the kind of mistake that ends a product.',
        'Close contexts in a finally block rather than at the end of the happy path. A run that throws halfway leaves an authenticated context alive, and the leak that matters is not the memory but the session nobody closed.',
      ],
    },
    {
      heading: 'Trace everything, from the first day',
      paragraphs: [
        'Agent failures on real sites are close to impossible to reproduce later: the posting closed, the page changed, the A/B variant rotated. Playwright’s tracing captures the DOM snapshots, actions and network activity of the run.',
        'Enable it for every run, keep traces for failures, and discard the successes on a schedule. This single practice converts "the agent sometimes fails on this site" from a shrug into a bug report.',
        'Traces contain the candidate’s data, including whatever was typed into the form. They need the same retention limits and access controls as the application records, rather than sitting in a bucket nobody has scoped.',
      ],
    },
    {
      heading: 'Control resources or they control you',
      paragraphs: [
        'Each browser instance is hundreds of megabytes, and an agent that opens pages and never closes them will exhaust a machine quietly. Long-running agents leak contexts particularly easily.',
        'Cap concurrent contexts, set a hard timeout per run, and close contexts in a finally block rather than on the happy path. Blocking images and fonts is also a large, free speedup — an agent does not need to render the hero banner.',
        'Reuse the browser process while never reusing the profile. Launching a browser is the expensive part and creating a context within one is cheap, so a pool of processes with a fresh context per run gets the performance without the isolation problem.',
        'Watch for the failure mode where a page never settles. Analytics, polling and long-lived connections mean waiting for full network idle can hang indefinitely on sites that are working perfectly, so wait for the element you need rather than for the network to go quiet.',
      ],
      bullets: [
        'A pool of browser processes, a fresh context per run',
        'Images and fonts blocked by default',
        'Hard timeout per run, closed in a finally block',
        'Wait for elements, not for the network to fall silent',
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
    {
      q: 'Can I reuse a browser to save startup time?',
      a: 'Reuse the process, never the profile. A pool of browser processes with a fresh context per run gets the performance without leaking one user session into another.',
    },
    {
      q: 'Why does a strict locator matter on application forms?',
      a: 'Because the same label often appears in two sections. A locator that silently picks the first match will fill the wrong field and report success.',
    },
  ],
  related: ['playwright-vs-selenium-vs-puppeteer-for-ai-agents', 'how-to-build-an-ai-browser-agent-for-job-applications', 'how-to-build-reliable-browser-automation'],
  references: [
    {
      title: 'Locators',
      url: 'https://playwright.dev/docs/locators',
      publisher: 'Playwright',
      note: 'Role and label based addressing, and locator strictness.',
    },
    {
      title: 'Trace Viewer',
      url: 'https://playwright.dev/docs/trace-viewer',
      publisher: 'Playwright',
      note: 'Capturing DOM snapshots, actions and network activity for a run.',
    },
    {
      title: 'Browser Contexts',
      url: 'https://playwright.dev/docs/browser-contexts',
      publisher: 'Playwright',
      note: 'Isolating cookies, storage and permissions between runs.',
    },
  ],
};

export default post;
