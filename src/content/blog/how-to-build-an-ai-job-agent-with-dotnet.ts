import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-agent-with-dotnet',
  tint: 'sky',
  title: 'How to Build an AI Job Agent With .NET',
  heading: 'A job agent on .NET',
  description:
    'Where .NET is a strong choice for agent work: typed contracts, hosted services for long runs, structured concurrency, resilience policies and observability.',
  keywords: [
    'dotnet ai agent',
    'csharp ai agent',
    'background hosted service',
    'typed tool contracts',
    'polly resilience',
    'dotnet observability',
    'enterprise ai agent',
    'dotnet agent architecture',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['job agent on .NET', 'typed tool contracts'],
  excerpt:
    '.NET is unfashionable for agent work and genuinely well suited to the parts that are hard: long-running processes, resilience and operability.',
  keyTakeaways: [
    'The hard parts of agent work are background processing, flaky calls and durable state.',
    'Generate tool schemas from types so the description and implementation cannot drift.',
    'Hosted services give supervised lifetime and graceful shutdown for free — honour the token.',
    'Express resilience as declared policy, and distinguish retryable failures from permanent ones.',
    'Traces are frequently the only evidence of an agent failure, so instrument from day one.',
  ],
  sections: [
    {
      heading: 'The parts .NET is already good at',
      paragraphs: [
        'Agent work is mostly long-running background processing, unreliable external calls and state that must not be lost. Those are exactly the problems the platform has mature answers for, rather than patterns you assemble yourself.',
        'The gap is the ecosystem: provider SDKs and agent frameworks arrive here later than in Python. In practice that matters less than it sounds, because the provider APIs are HTTP and a thin typed client is a small amount of code you will understand completely.',
        'It also matters where the agent has to live. A job platform whose existing services, authentication and data access are already here has a strong argument for keeping the agent in the same process boundary rather than standing up a second runtime to call back into the first.',
      ],
    },
    {
      heading: 'Model tools as typed contracts',
      paragraphs: [
        'A strongly typed language lets tool inputs and outputs be real types rather than dictionaries. Generate the schema the model sees from those types so the description and the implementation cannot drift apart.',
        'Deserialise model output into those types and treat a failed deserialisation as a retryable error. That converts a whole class of malformed-response bugs into a single, handled path.',
        'Validate beyond the shape, though. A well-formed object with a salary of zero or a location not in the allowed set has satisfied the type system and not the domain, and the check that catches that belongs in the tool rather than in whatever consumes its output later.',
      ],
      bullets: [
        'One record type per tool input and output',
        'Schema generated from the type, not written alongside it',
        'Deserialisation failure as an explicit retry signal',
        'Domain validation separate from shape validation',
        'Provider clients behind an interface for swapping or testing',
      ],
      table: {
        caption: 'Agent concerns and the platform answer',
        columns: ['Concern', 'Answer', 'Trap'],
        rows: [
          ['Long-running work', 'Hosted background service', 'Ignoring the cancellation token'],
          ['Flaky external calls', 'Declared resilience policies', 'Retrying permanent failures'],
          ['Tool contracts', 'Types with generated schemas', 'Validating shape but not domain'],
          ['Concurrency', 'Bounded parallelism', 'Unbounded fan-out over postings'],
          ['Diagnosis', 'Structured logs and traces', 'Logging outcomes without decisions'],
        ],
      },
    },
    {
      heading: 'Hosted services for the long runs',
      paragraphs: [
        'A background service with the host’s lifetime management gives you a supervised process with graceful shutdown built in — which is precisely what an agent processing a queue of applications needs.',
        'Honour the cancellation token throughout. An agent that ignores it during shutdown gets killed mid-application, and mid-application is the one place you cannot afford an ambiguous outcome.',
        'Pair that with an idempotency record written before each consequential action. Graceful shutdown handles the deployments you expect; the record handles the crash you do not, and only the combination makes a restart safe.',
      ],
    },
    {
      heading: 'Resilience as policy, not scattered try-catch',
      paragraphs: [
        'Model providers rate-limit, career sites time out, networks fail. Expressing retries, backoff, timeouts and circuit breakers as declared policies keeps that logic in one place instead of duplicated at every call site.',
        'Distinguish what is worth retrying from what is not. A rate limit warrants backoff; a rejected malformed request does not, and retrying it wastes quota while producing the same failure.',
        'A circuit breaker matters most on the submission path. When a career site changes its form, every attempt fails the same way, and the difference between stopping at three and at three hundred is entirely whether something was counting.',
      ],
    },
    {
      heading: 'Concurrency with a ceiling',
      paragraphs: [
        'Scoring two hundred postings is naturally parallel and naturally dangerous. Unbounded fan-out exhausts provider rate limits, spends a budget nobody approved, and turns one bad prompt into two hundred simultaneous bad calls.',
        'Bound it explicitly with a fixed degree of parallelism, and make the bound configurable rather than a constant somebody has to find. Four concurrent model calls is usually plenty and leaves headroom for the rest of the application.',
        'Keep browser work separate from model work, with its own lower ceiling. A browser context costs hundreds of megabytes where a model call costs a socket, so a single concurrency limit covering both is either too high for one or too low for the other.',
      ],
      bullets: [
        'A configured degree of parallelism, never unbounded',
        'Separate ceilings for model calls and browser sessions',
        'A spend budget per run, enforced before the call',
        'Cancellation propagated through every parallel branch',
      ],
    },
    {
      heading: 'Observability is the operational advantage',
      paragraphs: [
        'Agents fail in ways that are hard to reproduce, so the trace is often the only evidence you get. Structured logging and distributed tracing are well-established here, and instrumenting every tool call, model call and state transition costs little.',
        'Record the inputs, the outputs, the decision and the duration for each step, correlated by run. That turns "the agent did something strange yesterday" into a record you can read.',
        'Log the reason as well as the outcome. Knowing a posting was skipped is much less useful than knowing the eligibility gate rejected it, and the second is what lets someone notice that a candidate’s location settings are wrong.',
        'Treat these logs as personal data, because they are. They contain CVs, application content and decisions about people, which means the same retention limits and access controls as the primary records rather than an indefinite archive.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is .NET a reasonable choice for AI agents?',
      a: 'Yes, particularly for the hard parts — long-running supervised processes, resilience against flaky external calls, and state that must not be lost.',
    },
    {
      q: 'What about the smaller AI ecosystem?',
      a: 'Less limiting than it sounds. Provider APIs are HTTP, so a thin typed client is a small amount of code you fully understand.',
    },
    {
      q: 'How should long agent runs be hosted?',
      a: 'As a background hosted service with lifetime management and graceful shutdown — and honour the cancellation token, since mid-application is where an ambiguous outcome hurts most.',
    },
    {
      q: 'How should retries be handled?',
      a: 'As declared policies in one place rather than scattered try-catch, and distinguish retryable failures from malformed requests that will fail identically every time.',
    },
    {
      q: 'Why bound concurrency explicitly?',
      a: 'Because unbounded fan-out over two hundred postings exhausts rate limits, spends an unapproved budget, and turns one bad prompt into two hundred simultaneous bad calls.',
    },
    {
      q: 'Is type validation enough for tool output?',
      a: 'No. A well-formed object with a zero salary or a disallowed location satisfies the type system and not the domain, and that check belongs in the tool.',
    },
  ],
  related: ['how-to-build-an-ai-job-agent-with-python', 'how-to-build-a-long-running-ai-agent', 'dotnet-10-csharp-14'],
  references: [
    {
      title: 'C# documentation',
      url: 'https://learn.microsoft.com/en-us/dotnet/csharp/',
      publisher: 'Microsoft Learn',
      note: 'Language reference for the typed contracts and cancellation patterns described here.',
    },
  ],
};

export default post;
