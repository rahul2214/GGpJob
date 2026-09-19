import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-agent-with-nextjs',
  tint: 'sky',
  title: 'How to Build an AI Job Agent With Next.js',
  heading: 'A job agent inside Next.js',
  description:
    'What belongs in a Next.js app and what does not: route handlers, streaming to the client, keeping keys server-side, execution limits and the worker boundary.',
  keywords: [
    'nextjs ai agent',
    'next.js route handler ai',
    'streaming ai nextjs',
    'server component ai',
    'api key security nextjs',
    'serverless execution limit',
    'background worker nextjs',
    'nextjs agent architecture',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Next.js is an excellent front door for an agent and a poor place to run one. Knowing where the line falls saves a rewrite.',
  sections: [
    {
      heading: 'What belongs in the app',
      paragraphs: [
        'Next.js handles the parts users touch: the interface, authentication, the endpoints that start and monitor agent work, and the streaming of visible output. All of that fits naturally and benefits from server components and route handlers.',
        'What does not belong is the agent run itself. A process that browses sites, waits for approval and continues tomorrow is not a request, and trying to hold it in one is where the design goes wrong.',
      ],
    },
    {
      heading: 'Keys and calls stay on the server',
      paragraphs: [
        'Provider credentials must never reach the browser, which means no direct client-to-provider calls, no keys in public environment variables, and no assumption that a variable is private because it is not referenced in client code.',
        'Route handlers are the boundary. They authenticate the user, apply quota, call the provider and stream results back. That also gives you the only place where rate limiting and abuse controls can actually be enforced.',
      ],
      bullets: [
        'Provider keys in server-only environment variables',
        'Every model call made from a route handler, never the client',
        'Identity resolved from the session, not from the request body',
        'Quota and rate limits applied at that same boundary',
      ],
    },
    {
      heading: 'Streaming works well, within limits',
      paragraphs: [
        'Streaming a response from a route handler to a client component is well supported and makes an assistant feel responsive. For a chat-style career assistant this is the right shape.',
        'It is still a request, though, and it is bounded by the platform’s execution limit. Streaming makes a slow response tolerable; it does not make a long-running process possible.',
      ],
    },
    {
      heading: 'The execution limit is the boundary',
      paragraphs: [
        'Serverless functions are cut off at a fixed duration. A single scoring call fits comfortably. An agent applying to eight jobs across four sites with a human approval step in the middle does not, and will be terminated mid-run.',
        'So the route handler enqueues work and returns an identifier. A separate worker — a container, a queue consumer, a scheduled process — performs the run, and the client polls or subscribes for progress.',
      ],
    },
    {
      heading: 'Keep the agent out of the app’s own code',
      paragraphs: [
        'Even when both live in one repository, keep the agent as a module with no Next.js imports. It should run from a worker process, a test or a script without a framework present.',
        'That separation is what lets you move execution later without rewriting the logic, and it makes the agent testable without spinning up an application. Agent code tangled with request objects and framework helpers is the version nobody can move.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can I run an AI agent inside Next.js route handlers?',
      a: 'Short tasks yes, full agent runs no. Serverless execution limits terminate a run that browses several sites and waits for approval mid-way.',
    },
    {
      q: 'Where do provider API keys go?',
      a: 'Server-only environment variables, with every model call made from a route handler. That boundary is also the only place quota and rate limits can be enforced.',
    },
    {
      q: 'Is streaming enough for a long agent run?',
      a: 'No. Streaming makes a slow response tolerable but it is still a request bounded by the execution limit. Long runs need a queue and a worker.',
    },
    {
      q: 'Should agent code import from Next.js?',
      a: 'No. Keep it as a module runnable from a worker, a test or a script. That is what lets you move execution later without rewriting the logic.',
    },
  ],
  related: ['how-to-build-an-ai-job-agent-with-nodejs', 'how-to-build-a-long-running-ai-agent', 'how-to-build-a-secure-ai-job-application-platform'],
};

export default post;
