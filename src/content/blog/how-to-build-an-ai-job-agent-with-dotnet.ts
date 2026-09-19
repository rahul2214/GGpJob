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
  excerpt:
    '.NET is unfashionable for agent work and genuinely well suited to the parts that are hard: long-running processes, resilience and operability.',
  sections: [
    {
      heading: 'The parts .NET is already good at',
      paragraphs: [
        'Agent work is mostly long-running background processing, unreliable external calls and state that must not be lost. Those are exactly the problems the platform has mature answers for, rather than patterns you assemble yourself.',
        'The gap is the ecosystem: provider SDKs and agent frameworks arrive here later than in Python. In practice that matters less than it sounds, because the provider APIs are HTTP and a thin typed client is a small amount of code you will understand completely.',
      ],
    },
    {
      heading: 'Model tools as typed contracts',
      paragraphs: [
        'A strongly typed language lets tool inputs and outputs be real types rather than dictionaries. Generate the schema the model sees from those types so the description and the implementation cannot drift apart.',
        'Deserialise model output into those types and treat a failed deserialisation as a retryable error. That converts a whole class of malformed-response bugs into a single, handled path.',
      ],
      bullets: [
        'One record type per tool input and output',
        'Schema generated from the type, not written alongside it',
        'Deserialisation failure as an explicit retry signal',
        'Provider clients behind an interface for swapping or testing',
      ],
    },
    {
      heading: 'Hosted services for the long runs',
      paragraphs: [
        'A background service with the host’s lifetime management gives you a supervised process with graceful shutdown built in — which is precisely what an agent processing a queue of applications needs.',
        'Honour the cancellation token throughout. An agent that ignores it during shutdown gets killed mid-application, and mid-application is the one place you cannot afford an ambiguous outcome.',
      ],
    },
    {
      heading: 'Resilience as policy, not scattered try-catch',
      paragraphs: [
        'Model providers rate-limit, career sites time out, networks fail. Expressing retries, backoff, timeouts and circuit breakers as declared policies keeps that logic in one place instead of duplicated at every call site.',
        'Distinguish what is worth retrying from what is not. A rate limit warrants backoff; a rejected malformed request does not, and retrying it wastes quota while producing the same failure.',
      ],
    },
    {
      heading: 'Observability is the operational advantage',
      paragraphs: [
        'Agents fail in ways that are hard to reproduce, so the trace is often the only evidence you get. Structured logging and distributed tracing are well-established here, and instrumenting every tool call, model call and state transition costs little.',
        'Record the inputs, the outputs, the decision and the duration for each step, correlated by run. That turns "the agent did something strange yesterday" into a record you can read.',
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
  ],
  related: ['how-to-build-an-ai-job-agent-with-python', 'how-to-build-a-long-running-ai-agent', 'dotnet-10-csharp-14'],
};

export default post;
