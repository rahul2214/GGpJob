import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-agent-with-nodejs',
  tint: 'sky',
  title: 'How to Build an AI Job Agent With Node.js',
  heading: 'A job agent in Node.js',
  description:
    'Building an agent on Node: where it is genuinely strong, typed tool contracts, streaming, keeping the event loop clear, and worker patterns for long runs.',
  keywords: [
    'nodejs ai agent',
    'build job agent node',
    'typescript agent tools',
    'streaming llm responses',
    'event loop blocking',
    'node worker threads',
    'node agent deployment',
    'typed tool schema',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['job agent in Node.js', 'event loop'],
  excerpt:
    'If your product is already a TypeScript web app, building the agent in Node removes a whole category of duplication.',
  keyTakeaways: [
    'One language means one domain model, one set of validators, and one place to change them.',
    'Derive the runtime validator and the static type from a single schema per tool.',
    'Stream what the user sees; act only on complete validated results.',
    'CPU work blocks everything, and it presents as unrelated slowness.',
    'Long runs need a durable queue, per-step persistence and idempotent outward actions.',
  ],
  sections: [
    {
      heading: 'The case for staying in one language',
      paragraphs: [
        'A job platform is usually a TypeScript application already. Building the agent in Python means duplicating types, validation and domain logic across two codebases, and keeping them synchronised forever.',
        'Node avoids that. The same types describe an application record in the API and in the agent, the same validators run in both, and a change to the domain model is made once. For a small team that is often decisive.',
        'The honest counterweight is where the ecosystem is stronger elsewhere. Anything involving local models, numerical work or data science tooling is better served in Python, and the reasonable answer is usually a small service for those rather than moving the whole agent.',
      ],
    },
    {
      heading: 'Types make tool contracts enforceable',
      paragraphs: [
        'Agent tools have a schema the model sees and an implementation you write, and the two drift. In TypeScript you can define the schema once, derive both the runtime validator and the static type from it, and let the compiler catch the mismatch.',
        'That closes the gap where a tool’s described parameters and its actual behaviour diverge — a class of bug that manifests as the model calling a tool "wrong" when the description was simply out of date.',
        'Validate model output at the same boundary and treat a validation failure as a retry rather than an exception. Models return almost-correct structures often enough that a single handled path for this is worth more than scattered defensive checks in every consumer.',
      ],
      bullets: [
        'One schema per tool, validated at runtime and typed at compile time',
        'Tool return types shared with the application layer',
        'Provider adapters behind a single interface',
        'Validation failure as a retry signal, not an exception',
        'No untyped JSON crossing a module boundary',
      ],
      table: {
        caption: 'Where Node is strong, and where it is not',
        columns: ['Concern', 'Node', 'Note'],
        rows: [
          ['Sharing types with the app', 'Strong', 'Often the deciding factor'],
          ['Streaming to a browser', 'Strong', 'First-class'],
          ['Browser automation', 'Strong', 'Playwright is native here'],
          ['IO-heavy concurrency', 'Strong', 'What the runtime is for'],
          ['CPU-bound parsing', 'Weak', 'Worker threads or a service'],
          ['Local models, numerics', 'Weak', 'A small Python service'],
        ],
      },
    },
    {
      heading: 'Streaming is a first-class strength',
      paragraphs: [
        'Node’s stream handling makes incremental output straightforward, which matters for anything a user is watching. A career assistant that starts responding in a few hundred milliseconds feels categorically better than one that pauses for six seconds.',
        'Stream the visible reasoning, but do not act on partial output. Tool calls and state changes should happen on complete, validated results — an action taken on a half-parsed response is difficult to reason about and worse to debug.',
        'Propagate cancellation through the whole path. A user who closes the tab should abort the provider call rather than leaving it to finish and bill, and that only works if the abort signal reaches the client rather than stopping at the handler.',
      ],
    },
    {
      heading: 'Guard the event loop',
      paragraphs: [
        'Single-threaded execution is fine for IO and unforgiving for CPU work. Parsing a large document, computing embeddings locally, or processing a big JSON payload blocks everything, including unrelated requests on the same instance.',
        'Move that work to worker threads or a separate service. This is the most common way a Node agent degrades under load, and it presents as general slowness rather than pointing at its cause.',
        'PDF parsing is the specific one that catches job platforms. A large CV can block for hundreds of milliseconds, which is invisible in development with one user and very visible when twenty uploads arrive at once — so it belongs off the main thread before it is a problem rather than after.',
      ],
    },
    {
      heading: 'Bound the concurrency you gain so easily',
      paragraphs: [
        'Node makes it trivial to fire two hundred scoring calls at once, and equally trivial to exhaust a provider rate limit, spend an unapproved budget and turn one bad prompt into two hundred simultaneous bad calls.',
        'Use a bounded pool with a configured limit rather than mapping over an array of promises. A handful of concurrent model calls is usually plenty, and the limit should be a setting somebody can lower during an incident rather than a constant to be found and edited.',
        'Give browser work a separate, smaller ceiling. A browser context costs hundreds of megabytes where a model call costs a socket, so one shared limit is either too generous for the browser or too mean for the model.',
        'Add a per-run spend budget checked before each call. Rate limits protect the provider; a budget protects the user, and only one of those is watching out for the person whose card is attached.',
      ],
      bullets: [
        'A bounded pool, never an unbounded promise fan-out',
        'Separate limits for model calls and browser contexts',
        'A spend budget enforced before the call, not after',
        'Limits configurable at runtime, for incidents',
      ],
    },
    {
      heading: 'Long runs still need a queue',
      paragraphs: [
        'Serverless platforms cut execution at a limit, and a job agent exceeds it comfortably. Even on a long-lived server, holding a multi-day process in memory is not a design.',
        'Use a durable queue with workers, persist state after each step, and make every outward action idempotent. Deployments happen mid-run, and the agent should resume from the last checkpoint rather than restarting or duplicating.',
        'Handle shutdown explicitly rather than trusting the process to be stopped politely. Listening for the termination signal, finishing or safely abandoning the current step, and refusing new work is what turns a routine deploy from a source of half-submitted applications into a non-event.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why build an agent in Node rather than Python?',
      a: 'If the product is already TypeScript, Node avoids duplicating types, validation and domain logic across two codebases that must then be kept in sync forever.',
    },
    {
      q: 'How do I keep tool schemas and implementations in sync?',
      a: 'Define the schema once and derive both the runtime validator and the static type from it, so the compiler catches drift between what the model is told and what the tool does.',
    },
    {
      q: 'Should I act on streamed partial output?',
      a: 'No. Stream what the user sees, but take tool calls and state changes only on complete validated results — acting on half-parsed output is hard to reason about.',
    },
    {
      q: 'What is the most common Node agent performance problem?',
      a: 'Blocking the event loop with CPU work like document parsing or local embedding. It presents as general slowness across unrelated requests rather than pointing at its cause.',
    },
    {
      q: 'How should concurrency be bounded?',
      a: 'A pool with a configured limit, separate ceilings for model calls and browser contexts, and a per-run spend budget checked before each call.',
    },
    {
      q: 'When is Python still the better choice?',
      a: 'Local models, numerical work and data science tooling. A small service for those beats moving the whole agent out of the language the product is written in.',
    },
  ],
  related: ['how-to-build-an-ai-job-agent-with-nextjs', 'how-to-build-an-ai-job-agent-with-python', 'how-to-build-a-long-running-ai-agent'],
};

export default post;
