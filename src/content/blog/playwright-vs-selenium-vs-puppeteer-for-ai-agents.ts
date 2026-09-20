import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'playwright-vs-selenium-vs-puppeteer-for-ai-agents',
  tint: 'rose',
  title: 'Playwright vs Selenium vs Puppeteer for AI Agents',
  heading: 'Choosing a browser automation library',
  description:
    'Comparing the three for agent use specifically: waiting behaviour, accessibility access, isolation, tracing, language support and when each is right.',
  keywords: [
    'playwright vs selenium',
    'puppeteer vs playwright',
    'browser automation comparison',
    'ai agent browser library',
    'selenium grid',
    'automation auto waiting',
    'cross browser automation',
    'agent tooling choice',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['browser automation library', 'agent tooling'],
  excerpt:
    'The usual comparison is written for test suites. Agents need different things, and the ranking changes once you weigh those.',
  keyTakeaways: [
    'Agents arrive at pages they have never seen, which changes which properties matter.',
    'Auto-waiting, accessibility access, cheap isolation and tracing are the four that count.',
    'Playwright lines up with all four; the cost is a heavier runtime.',
    'Selenium is usually chosen for organisational reasons, and those are real reasons.',
    'None of them solves the hard parts, which live in your agent layer regardless.',
  ],
  sections: [
    {
      heading: 'Agents need different properties than tests',
      paragraphs: [
        'A test author knows the page and writes selectors against it. An agent arrives at a page it has never seen, must work out what is there, and must recover when the page differs from what it expected.',
        'So the things that matter are: how well the library exposes page semantics, how it handles waiting without being told, how cheaply it isolates sessions, and what it records for after-the-fact debugging. Cross-browser breadth, which dominates test-focused comparisons, matters much less.',
        'There is a fifth that only applies to agents: how easily the library produces a compact page representation to send to a model. A structured view of the interactive elements costs a fraction of a screenshot in tokens, and that difference decides the economics of the whole system.',
      ],
    },
    {
      heading: 'Playwright: the default for agent work',
      paragraphs: [
        'Its advantages line up with the list above. Auto-waiting removes an entire class of timing failure without the agent reasoning about it. Accessibility-tree access gives a structured page representation to feed the model. Browser contexts isolate sessions cheaply. Built-in tracing captures runs you cannot reproduce.',
        'The practical cost is that it drives its own browser builds, so the runtime is heavier than a thin wrapper. For most agent deployments that is an acceptable trade for what it removes.',
        'Locator strictness deserves a mention because it matters more for agents than for tests. A selector matching two elements failing loudly rather than silently taking the first is exactly the behaviour you want on an application form where the same label appears in two sections.',
      ],
    },
    {
      heading: 'Puppeteer: lighter, narrower',
      paragraphs: [
        'Mature, well understood and focused on Chrome. If your agent only ever needs Chrome and you are comfortable building your own waiting and retry layer, it is a reasonable and smaller dependency.',
        'What you give up is the isolation and tracing ergonomics, and you will rebuild some of the waiting behaviour yourself — which, for an agent, is precisely the code that is easy to get subtly wrong.',
        'Rebuilding waiting is the part to think about honestly. It is not much code and it is the code where a subtle mistake presents as intermittent failure months later, which is a poor trade for a lighter dependency in a system whose reliability is the product.',
      ],
      bullets: [
        'Playwright — best fit for agents; auto-wait, contexts, tracing, a11y tree',
        'Puppeteer — lighter, Chrome-centric, more DIY around waiting',
        'Selenium — widest language and grid support, most explicit waiting',
      ],
      table: {
        caption: 'The properties that matter for an agent',
        columns: ['Property', 'Playwright', 'Puppeteer', 'Selenium'],
        rows: [
          ['Auto-waiting', 'Built in', 'Partial', 'Explicit'],
          ['Accessibility tree', 'Yes', 'Via protocol', 'Limited'],
          ['Cheap session isolation', 'Contexts', 'Profiles', 'Sessions'],
          ['Tracing for debugging', 'Built in', 'Roll your own', 'Roll your own'],
          ['Language breadth', 'Several', 'JavaScript', 'Widest'],
          ['Distributed grid', 'Possible', 'Possible', 'Mature'],
        ],
      },
    },
    {
      heading: 'Selenium: when the constraint is your organisation',
      paragraphs: [
        'It has the broadest language support and a mature distributed grid, and it is often already deployed and approved somewhere in a large company. Those are real reasons, and they are usually organisational rather than technical.',
        'For agent use its explicit waiting model means more code that the agent’s reliability depends on. Workable, and more work — choose it when the language or the existing infrastructure decides for you.',
        'The grid is a genuine advantage at scale, and it is worth weighing properly rather than dismissing. Running many concurrent sessions across machines is exactly what a job application agent does at volume, and having that operational problem already solved is not nothing.',
      ],
    },
    {
      heading: 'What running them actually costs',
      paragraphs: [
        'All three are memory-hungry in the same way, because the cost is the browser rather than the library. A few hundred megabytes per instance means concurrency is bounded by memory long before it is bounded by anything else.',
        'Reuse the process and never the profile. Launching a browser is the expensive part and creating a fresh context inside one is cheap, so a pool of processes with a new context per run gets the performance without carrying one candidate’s session into another’s.',
        'Block images and fonts by default. An agent does not need the hero banner rendered, and the saving in bandwidth and load time is large enough to change how many concurrent sessions a machine supports.',
        'Close contexts in a finally block rather than on the happy path. A run that throws halfway leaves an authenticated context alive, and the leak that matters is not the memory but the session nobody closed.',
      ],
    },
    {
      heading: 'What the choice does not fix',
      paragraphs: [
        'None of the three solves the hard parts of a job application agent: understanding an unfamiliar form, deciding what a question is asking, being certain before submitting, and recovering when a site changes overnight.',
        'Those live in your agent layer regardless. Pick the library that gets out of the way fastest, then spend the saved effort on the parts that actually determine whether the agent works.',
        'Keep the library behind a small interface for the same reason. Your agent should request navigate, click, type, read and wait, with the implementation behind that boundary — which makes the choice reversible and, more usefully, keeps the retries and overlay handling in one place.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Which browser library is best for AI agents?',
      a: 'Playwright, for most cases. Auto-waiting, accessibility-tree access, cheap context isolation and built-in tracing line up exactly with what an agent on an unfamiliar page needs.',
    },
    {
      q: 'Is Puppeteer a reasonable choice?',
      a: 'Yes if you only need Chrome and accept building your own waiting and retry layer — which is the code most likely to be subtly wrong in an agent.',
    },
    {
      q: 'When does Selenium make sense?',
      a: 'When the constraint is organisational: a language Playwright does not serve, or an existing approved grid. That grid is a genuine advantage at real concurrency.',
    },
    {
      q: 'Does the library choice determine agent reliability?',
      a: 'No. Understanding unfamiliar forms, being certain before submitting and recovering from overnight site changes all live in your agent layer whichever library you pick.',
    },
    {
      q: 'What bounds concurrency in practice?',
      a: 'Memory. The browser costs a few hundred megabytes per instance regardless of library, so blocking images and reusing processes changes how many sessions a machine supports.',
    },
    {
      q: 'Should the library be wrapped?',
      a: 'Yes, behind a small vocabulary — navigate, click, type, read, wait. It makes the choice reversible and keeps retries and overlay handling in one place.',
    },
  ],
  related: ['how-to-build-an-ai-browser-agent-with-playwright', 'how-to-build-reliable-browser-automation', 'browser-automation-vs-ai-browser-agents'],
  references: [
    {
      title: 'Locators',
      url: 'https://playwright.dev/docs/locators',
      publisher: 'Playwright',
      note: 'Role and label based addressing, and why strictness helps on repeated labels.',
    },
    {
      title: 'Browser Contexts',
      url: 'https://playwright.dev/docs/browser-contexts',
      publisher: 'Playwright',
      note: 'Isolating cookies and storage cheaply within one browser process.',
    },
  ],
};

export default post;
