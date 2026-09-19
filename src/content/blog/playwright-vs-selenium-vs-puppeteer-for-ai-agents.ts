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
  excerpt:
    'The usual comparison is written for test suites. Agents need different things, and the ranking changes once you weigh those.',
  sections: [
    {
      heading: 'Agents need different properties than tests',
      paragraphs: [
        'A test author knows the page and writes selectors against it. An agent arrives at a page it has never seen, must work out what is there, and must recover when the page differs from what it expected.',
        'So the things that matter are: how well the library exposes page semantics, how it handles waiting without being told, how cheaply it isolates sessions, and what it records for after-the-fact debugging. Cross-browser breadth, which dominates test-focused comparisons, matters much less.',
      ],
    },
    {
      heading: 'Playwright: the default for agent work',
      paragraphs: [
        'Its advantages line up with the list above. Auto-waiting removes an entire class of timing failure without the agent reasoning about it. Accessibility-tree access gives a structured page representation to feed the model. Browser contexts isolate sessions cheaply. Built-in tracing captures runs you cannot reproduce.',
        'The practical cost is that it drives its own browser builds, so the runtime is heavier than a thin wrapper. For most agent deployments that is an acceptable trade for what it removes.',
      ],
    },
    {
      heading: 'Puppeteer: lighter, narrower',
      paragraphs: [
        'Mature, well understood and focused on Chrome. If your agent only ever needs Chrome and you are comfortable building your own waiting and retry layer, it is a reasonable and smaller dependency.',
        'What you give up is the isolation and tracing ergonomics, and you will rebuild some of the waiting behaviour yourself — which, for an agent, is precisely the code that is easy to get subtly wrong.',
      ],
      bullets: [
        'Playwright — best fit for agents; auto-wait, contexts, tracing, a11y tree',
        'Puppeteer — lighter, Chrome-centric, more DIY around waiting',
        'Selenium — widest language and grid support, most explicit waiting',
      ],
    },
    {
      heading: 'Selenium: when the constraint is your organisation',
      paragraphs: [
        'It has the broadest language support and a mature distributed grid, and it is often already deployed and approved somewhere in a large company. Those are real reasons, and they are usually organisational rather than technical.',
        'For agent use its explicit waiting model means more code that the agent’s reliability depends on. Workable, and more work — choose it when the language or the existing infrastructure decides for you.',
      ],
    },
    {
      heading: 'What the choice does not fix',
      paragraphs: [
        'None of the three solves the hard parts of a job application agent: understanding an unfamiliar form, deciding what a question is asking, being certain before submitting, and recovering when a site changes overnight.',
        'Those live in your agent layer regardless. Pick the library that gets out of the way fastest, then spend the saved effort on the parts that actually determine whether the agent works.',
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
      a: 'When the constraint is organisational: a language Playwright does not serve, or an existing approved grid. Its explicit waiting model means more agent-critical code you maintain.',
    },
    {
      q: 'Does the library choice determine agent reliability?',
      a: 'No. Understanding unfamiliar forms, being certain before submitting and recovering from overnight site changes all live in your agent layer whichever library you pick.',
    },
  ],
  related: ['how-to-build-an-ai-browser-agent-with-playwright', 'how-to-build-reliable-browser-automation', 'browser-automation-vs-ai-browser-agents'],
};

export default post;
