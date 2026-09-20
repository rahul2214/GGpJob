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
  anchors: ['job agent inside Next.js', 'worker boundary'],
  excerpt:
    'Next.js is an excellent front door for an agent and a poor place to run one. Knowing where the line falls saves a rewrite.',
  keyTakeaways: [
    'The interface, auth and endpoints belong here; the agent run does not.',
    'Every provider call goes through a route handler, which is also the only enforceable limit point.',
    'Streaming makes a slow response tolerable and does not make a long process possible.',
    'The execution limit is the boundary: enqueue and return an identifier.',
    'Keep agent code free of framework imports so it can move without a rewrite.',
  ],
  sections: [
    {
      heading: 'What belongs in the app',
      paragraphs: [
        'Next.js handles the parts users touch: the interface, authentication, the endpoints that start and monitor agent work, and the streaming of visible output. All of that fits naturally and benefits from server components and route handlers.',
        'What does not belong is the agent run itself. A process that browses sites, waits for approval and continues tomorrow is not a request, and trying to hold it in one is where the design goes wrong.',
        'Server components are a genuine advantage for the read side. Rendering an application list or a match explanation on the server keeps the data access and the credentials there, and ships the user markup rather than a client that has to be trusted with a query.',
      ],
    },
    {
      heading: 'Keys and calls stay on the server',
      paragraphs: [
        'Provider credentials must never reach the browser, which means no direct client-to-provider calls, no keys in public environment variables, and no assumption that a variable is private because it is not referenced in client code.',
        'Route handlers are the boundary. They authenticate the user, apply quota, call the provider and stream results back. That also gives you the only place where rate limiting and abuse controls can actually be enforced.',
        'Resolve identity from the session rather than from anything the request carries. A candidate id in a request body is a claim the client controls, and scoping a query by it is the mistake that turns a normal endpoint into a way to read someone else’s applications.',
      ],
      bullets: [
        'Provider keys in server-only environment variables',
        'Every model call made from a route handler, never the client',
        'Identity resolved from the session, not from the request body',
        'Quota and rate limits applied at that same boundary',
      ],
      table: {
        caption: 'Where each piece runs',
        columns: ['Piece', 'Where', 'Why'],
        rows: [
          ['Interface and auth', 'Next.js', 'What it is for'],
          ['Start or monitor a run', 'Route handler', 'Short, authenticated'],
          ['A single scoring call', 'Route handler', 'Fits the execution limit'],
          ['Assistant chat streaming', 'Route handler', 'Streaming is well supported'],
          ['A multi-site agent run', 'Worker', 'Exceeds the limit by far'],
          ['Anything awaiting approval', 'Worker plus queue', 'Not a request at all'],
        ],
      },
    },
    {
      heading: 'Streaming works well, within limits',
      paragraphs: [
        'Streaming a response from a route handler to a client component is well supported and makes an assistant feel responsive. For a chat-style career assistant this is the right shape.',
        'It is still a request, though, and it is bounded by the platform’s execution limit. Streaming makes a slow response tolerable; it does not make a long-running process possible.',
        'Handle disconnection deliberately. A user closing the tab mid-stream should abort the provider call rather than leaving it running to completion, because an abandoned stream that still bills is a cost with no corresponding value.',
      ],
    },
    {
      heading: 'The execution limit is the boundary',
      paragraphs: [
        'Serverless functions are cut off at a fixed duration. A single scoring call fits comfortably. An agent applying to eight jobs across four sites with a human approval step in the middle does not, and will be terminated mid-run.',
        'So the route handler enqueues work and returns an identifier. A separate worker — a container, a queue consumer, a scheduled process — performs the run, and the client polls or subscribes for progress.',
        'Browser automation is the clearest case for leaving entirely. A headless browser needs memory and startup time that serverless functions are poorly suited to, so that work belongs in a long-lived container from the first version rather than after the first timeout.',
      ],
    },
    {
      heading: 'Caching and revalidation, carefully',
      paragraphs: [
        'The framework’s caching is a real advantage for job listings and static content, and a hazard for anything candidate-specific. A personalised feed cached at the wrong layer is one user seeing another user’s recommendations, which is a data leak dressed as a performance win.',
        'Mark candidate-scoped routes as dynamic explicitly rather than relying on inference. Inference changes between versions and depends on which functions a component happens to call, which is not a foundation for a decision about who sees what.',
        'Revalidate on the events that matter rather than on a timer. A new application, a changed target or a fresh batch of postings should invalidate the affected pages directly, which is both more accurate and cheaper than a short interval that mostly regenerates unchanged content.',
      ],
      bullets: [
        'Public listings cached; candidate-scoped routes explicitly dynamic',
        'Never cache a response whose content depends on the session',
        'Revalidate on events, not on a short timer',
        'Test cache behaviour with two accounts, not one',
      ],
    },
    {
      heading: 'Keep the agent out of the app’s own code',
      paragraphs: [
        'Even when both live in one repository, keep the agent as a module with no Next.js imports. It should run from a worker process, a test or a script without a framework present.',
        'That separation is what lets you move execution later without rewriting the logic, and it makes the agent testable without spinning up an application. Agent code tangled with request objects and framework helpers is the version nobody can move.',
        'Share the types across the boundary rather than the runtime. A monorepo where the agent and the application use the same domain types keeps them consistent without the agent depending on the framework, and it is the arrangement that stays workable as both grow.',
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
      a: 'No. Keep it as a module runnable from a worker, a test or a script, sharing domain types rather than the framework runtime.',
    },
    {
      q: 'What is the caching hazard here?',
      a: 'Caching a candidate-scoped route, which shows one user another user recommendations. Mark those dynamic explicitly rather than relying on inference.',
    },
    {
      q: 'Where should browser automation run?',
      a: 'In a long-lived container from the first version. A headless browser needs memory and startup time that serverless functions handle badly.',
    },
  ],
  related: ['how-to-build-an-ai-job-agent-with-nodejs', 'how-to-build-a-long-running-ai-agent', 'how-to-build-a-secure-ai-job-application-platform'],
  references: [
    {
      title: 'Server Components',
      url: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components',
      publisher: 'Next.js',
      note: 'Where rendering and data access happen, and what reaches the client.',
    },
  ],
};

export default post;
