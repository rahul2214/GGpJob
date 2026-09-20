import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-agent-with-python',
  tint: 'sky',
  title: 'How to Build an AI Job Agent With Python',
  heading: 'A job agent in Python',
  description:
    'What Python gives you for agent work, structuring the project, async and concurrency choices, background execution, and the deployment shape that follows.',
  keywords: [
    'python ai agent',
    'build job agent python',
    'python agent architecture',
    'asyncio agent',
    'background task queue',
    'pydantic validation agent',
    'python deployment agent',
    'agent project structure',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['job agent in Python', 'project structure'],
  excerpt:
    'Python is the default for agent work for good reasons, and the interesting decisions are about structure and concurrency rather than libraries.',
  keyTakeaways: [
    'Interpreter speed barely registers when the wall-clock time is spent waiting on model calls.',
    'Structure around boundaries — tools, providers, state, orchestration — because frameworks change.',
    'Model output is untrusted input; parse into schemas and treat a failure as a deliberate retry.',
    'Async fits the IO; keep parsing and embedding maths off the event loop.',
    'Long runs belong in durable workers, with external state and idempotent actions.',
  ],
  sections: [
    {
      heading: 'Why Python, honestly',
      paragraphs: [
        'The ecosystem arrives first here: provider SDKs, agent frameworks, browser drivers and data tooling all exist in Python, usually before anywhere else. For a job agent that also needs parsing and embedding work, that breadth matters.',
        'The trade-off is runtime performance and packaging, neither of which is the bottleneck in an agent. Almost all the wall-clock time is spent waiting on model calls and network requests, so the language’s own speed barely registers.',
        'The honest counterweight is duplication. If the product is already a TypeScript application, a Python agent means two domain models, two sets of validators and a synchronisation problem forever — and for a small team that cost frequently outweighs the ecosystem advantage.',
      ],
    },
    {
      heading: 'Structure around boundaries, not frameworks',
      paragraphs: [
        'The layout that survives has clear seams: tools, model interaction, state, and orchestration as separate modules with typed interfaces between them. Frameworks change; these boundaries do not.',
        'Keep tool implementations free of model-specific detail, so switching provider touches one adapter rather than everything. Agent code that has provider types threaded through it is painful to change and people avoid changing it.',
        'Be sceptical of frameworks that own the orchestration loop. They are excellent for getting something running in an afternoon and awkward once you need a specific budget, a particular stopping condition or a resume path they did not anticipate — and by then the logic is expressed in their vocabulary rather than yours.',
      ],
      bullets: [
        'tools/ — plain functions with validated inputs and typed returns',
        'providers/ — one adapter per model provider, nothing else imports them',
        'state/ — persistence, resumption, idempotency keys',
        'agent/ — orchestration, budgets, stopping conditions',
      ],
      table: {
        caption: 'Where the work goes',
        columns: ['Concern', 'Mechanism', 'Trap'],
        rows: [
          ['Model and network calls', 'Async', 'Blocking the loop'],
          ['Document parsing', 'Process pool', 'Doing it inline'],
          ['Model output', 'Schema parsing', 'Hand-written validation'],
          ['Long runs', 'Durable queue workers', 'Web request timeouts'],
          ['Provider choice', 'One adapter', 'Provider types everywhere'],
          ['Stopping and budgets', 'Your orchestration', 'A framework’s defaults'],
        ],
      },
    },
    {
      heading: 'Validate with a schema library, not by hand',
      paragraphs: [
        'Model output is untrusted input. It will sometimes be malformed, sometimes contain the right shape with the wrong types, and occasionally contain something that should never reach a database.',
        'Define the expected shapes as schemas and parse into them. The parse either succeeds and gives you typed data or fails in a way you can retry deliberately — which is far better than a stray key surfacing three layers later.',
        'Put the domain rules in the same place. A salary that must be positive, a date that cannot be in the future, a seniority that must be one of five values — all of these are cheap to express as validators and expensive to discover in a ranking three weeks later.',
      ],
    },
    {
      heading: 'Choose async where the waiting is',
      paragraphs: [
        'Agents are IO-bound: model calls, page loads, database round-trips. Async concurrency fits this exactly, and scoring fifty postings concurrently rather than serially is the difference between one second and a minute.',
        'Keep the CPU-bound work — document parsing, embedding maths — out of the event loop, in a process pool or a separate worker. Blocking the loop with a slow parse stalls every concurrent operation, and it is a bug that shows up only under load.',
        'Bound the concurrency explicitly with a semaphore rather than gathering over a list. Unbounded fan-out over two hundred postings exhausts rate limits, spends a budget nobody approved and turns one bad prompt into two hundred simultaneous bad calls.',
        'Watch for sync libraries hiding in async code. A database driver or HTTP client that is not async blocks the loop while appearing to participate in it, and the symptom is unexplained latency across unrelated work rather than an error anyone can trace.',
      ],
    },
    {
      heading: 'Long runs belong in workers',
      paragraphs: [
        'A job agent runs for minutes or days, which does not fit in a web request. Put the work in a queue with durable workers, and let the API accept the request and return.',
        'Workers restart, so the state must be external and every action idempotent. Design for a worker dying mid-application from the start: the alternative is discovering the requirement through duplicate applications in production.',
        'Handle the termination signal deliberately. A worker that finishes or safely abandons its current step and refuses new work on shutdown turns a routine deploy into a non-event, where one that is killed mid-submission produces exactly the ambiguous state that is hardest to resolve.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is Python fast enough for an AI agent?',
      a: 'Yes. Almost all wall-clock time is spent waiting on model calls and network requests, so the interpreter speed barely registers against that.',
    },
    {
      q: 'How should a Python agent project be structured?',
      a: 'Around boundaries rather than a framework: tools, provider adapters, state and orchestration as separate modules with typed interfaces. Frameworks change; the seams do not.',
    },
    {
      q: 'Should agent code be async?',
      a: 'Yes for the IO, with a semaphore bounding concurrency. Keep CPU-bound parsing and embedding work off the event loop in a process pool.',
    },
    {
      q: 'Where should long agent runs execute?',
      a: 'In durable queue workers, not web requests. Assume a worker dies mid-application: state external, every action idempotent, shutdown handled explicitly.',
    },
    {
      q: 'When is Python the wrong choice?',
      a: 'When the product is already TypeScript. Two domain models and two sets of validators kept in sync forever often outweighs the ecosystem advantage for a small team.',
    },
    {
      q: 'Should I use an agent framework?',
      a: 'For a prototype, gladly. Once you need specific budgets, stopping conditions and resume paths, owning the orchestration loop yourself is usually less work than fighting one.',
    },
  ],
  related: ['how-to-build-an-ai-job-agent-with-nodejs', 'how-to-build-a-long-running-ai-agent', 'how-to-build-reliable-ai-agents'],
  references: [
    {
      title: 'asyncio',
      url: 'https://docs.python.org/3/library/asyncio.html',
      publisher: 'Python',
      note: 'Concurrency primitives, including semaphores and running blocking work in an executor.',
    },
  ],
};

export default post;
